<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HyperpayPayout;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use App\Services\AuditLogService;
use App\Services\EncryptedSettingService;
use App\Services\NotificationDispatcherService;
use App\Services\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HyperPayPayoutWebhookController extends Controller
{
    public function __construct(
        protected WalletService $walletService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Handle incoming HyperPay Payout Webhook (S2S)
     */
    public function handle(Request $request): JsonResponse
    {
        Log::info('HyperPay Payout Webhook Received:', [
            'ip'      => $request->ip(),
            'payload' => $request->all(),
        ]);

        // 1. Verify Webhook Token
        $configuredToken = EncryptedSettingService::get('hyperpay_payout_webhook_token');
        if (!empty($configuredToken)) {
            $incomingToken = $request->query('token')
                ?? $request->header('X-Webhook-Token')
                ?? $request->bearerToken()
                ?? $request->input('token');

            if (!$incomingToken || !hash_equals((string) $configuredToken, (string) $incomingToken)) {
                Log::warning('HyperPay Payout Webhook Rejected: Invalid or Missing Token', [
                    'ip' => $request->ip(),
                ]);
                return response()->json(['message' => 'Unauthorized: Invalid webhook token'], 401);
            }
        }

        $payload = $request->all();
        $reference = $payload['payoutReference'] ?? ($payload['reference'] ?? null);
        $responseCode = $payload['responseCode'] ?? null;
        $payoutId = $payload['payoutId'] ?? 'N/A';
        $amount = (float) ($payload['amount'] ?? 0);
        $responseMessage = $payload['responseMessage'] ?? 'Unknown Status';

        if (!$reference) {
            return response()->json(['message' => 'Missing payoutReference in payload'], 400);
        }

        $payout = HyperpayPayout::where('reference_id', $reference)->first();
        if (!$payout) {
            Log::error("HyperpayPayout record not found for reference: {$reference}");
            return response()->json(['message' => 'Payout record not found'], 404);
        }

        // Prevent duplicate processing
        if (in_array($payout->status, ['completed', 'failed', 'rejected'])) {
            Log::info("HyperPay Payout {$reference} is already in state: {$payout->status}. Skipping duplicate webhook.");
            return response()->json(['message' => 'Already processed'], 200);
        }

        $isSuccess = ($responseCode === '00000');

        DB::transaction(function () use ($payout, $isSuccess, $payoutId, $responseCode, $responseMessage, $payload, $amount) {
            if ($isSuccess) {
                $payout->update([
                    'status'          => 'completed',
                    'payout_id'       => $payoutId !== 'N/A' ? $payoutId : $payout->payout_id,
                    'webhook_payload' => $payload,
                ]);

                // Handle by Payout Type
                if ($payout->payout_type === 'investor_commission') {
                    // Update linked WalletTransaction to completed
                    if ($payout->wallet_transaction_id) {
                        $tx = WalletTransaction::find($payout->wallet_transaction_id);
                        if ($tx) {
                            $tx->update([
                                'status'      => 'completed',
                                'description' => $tx->description . " | تأكيد Payout: #{$payoutId}",
                            ]);
                        }
                    }

                    // Send notification to investor
                    if ($payout->user) {
                        NotificationDispatcherService::dispatch(
                            'investor.commission_payout_completed',
                            '✅ تم إيداع أرباحك في حسابك البنكي',
                            "تم تحويل مبلغ " . number_format($payout->amount, 2) . " ر.س بنجاح إلى حسابك البنكي عبر نظام سريع الفوري (رقم العملية: {$payoutId}).",
                            route('investor.wallets.commission', [], false),
                            ['payout_id' => $payout->id, 'amount' => $payout->amount]
                        );
                    }
                } elseif ($payout->payout_type === 'company_funding') {
                    // Company funding withdrawal
                    if ($payout->source_withdrawal_id) {
                        $withdrawal = WithdrawalRequest::find($payout->source_withdrawal_id);
                        if ($withdrawal) {
                            $withdrawal->update([
                                'admin_notes' => ($withdrawal->admin_notes ? $withdrawal->admin_notes . ' | ' : '') . "تم صرف التحويل بنجاح عبر HyperPay (رقم العملية: {$payoutId})",
                            ]);
                        }
                    }

                    if ($payout->user) {
                        NotificationDispatcherService::dispatch(
                            'company.funding_payout_completed',
                            '✅ تم صرف مبالغ تمويل المهام بنجاح',
                            "تم تحويل مبلغ التمويل المعتمد " . number_format($payout->amount, 2) . " ر.س لحساب شركتكم البنكي عبر نظام سريع (رقم العملية: {$payoutId}).",
                            route('company.wallet.funding', [], false),
                            ['payout_id' => $payout->id, 'amount' => $payout->amount]
                        );
                    }
                }

                // Log audit
                $this->auditLogService->log(
                    'payout_completed',
                    $payout,
                    [],
                    ['reference_id' => $payout->reference_id, 'payout_id' => $payoutId, 'amount' => $payout->amount],
                    "اكتمال التحويل البنكي الفوري بنجاح عبر HyperPay برقم #{$payoutId} للمرجع #{$payout->reference_id}"
                );

            } else {
                // Bank transfer failed
                $payout->update([
                    'status'          => 'failed',
                    'failure_reason'  => $responseMessage . " [كود: {$responseCode}]",
                    'webhook_payload' => $payload,
                ]);

                // Refund / Revert the locked or debited balance
                if ($payout->payout_type === 'investor_commission') {
                    if ($payout->wallet) {
                        // Refund the balance back to investor's commission wallet
                        $payout->wallet->balance += (float) $payout->amount;
                        $payout->wallet->save();

                        // Create refund credit ledger
                        WalletTransaction::create([
                            'wallet_id'        => $payout->wallet_id,
                            'user_id'          => $payout->user_id,
                            'transaction_type' => 'credit',
                            'amount'           => (float) $payout->amount,
                            'balance_before'   => $payout->wallet->balance - (float) $payout->amount,
                            'balance_after'    => $payout->wallet->balance,
                            'reference_type'   => 'payout_refund',
                            'reference_id'     => $payout->id,
                            'description'      => "استرداد رصيد أرباح - تعثر التحويل البنكي عبر HyperPay (السبب: {$responseMessage})",
                            'status'           => 'completed',
                        ]);
                    }

                    if ($payout->wallet_transaction_id) {
                        $tx = WalletTransaction::find($payout->wallet_transaction_id);
                        if ($tx) {
                            $tx->update([
                                'status' => 'failed',
                            ]);
                        }
                    }

                    // Notify investor
                    if ($payout->user) {
                        NotificationDispatcherService::dispatch(
                            'investor.commission_payout_failed',
                            '⚠️ تعذر إتمام التحويل البنكي',
                            "تعذر إتمام التحويل البنكي لمبلغ " . number_format($payout->amount, 2) . " ر.س وتمت إعادة المبلغ بالكامل لمحفظة أرباحك. سبب البنك: {$responseMessage}",
                            route('investor.wallets.commission', [], false),
                            ['payout_id' => $payout->id, 'reason' => $responseMessage],
                            null,
                            'urgent'
                        );
                    }
                } elseif ($payout->payout_type === 'company_funding') {
                    // Unlock balance or notify company
                    if ($payout->user) {
                        NotificationDispatcherService::dispatch(
                            'company.funding_payout_failed',
                            '⚠️ تعذر إتمام صرف تمويل المهام بنكياً',
                            "تعذر إتمام التحويل البنكي الفوري لمبلغ " . number_format($payout->amount, 2) . " ر.س. السبب: {$responseMessage}. يرجى مراجعة إدارة المنصة.",
                            route('company.wallet.funding', [], false),
                            ['payout_id' => $payout->id, 'reason' => $responseMessage],
                            null,
                            'urgent'
                        );
                    }
                }

                // Log audit
                $this->auditLogService->log(
                    'payout_failed',
                    $payout,
                    [],
                    ['reference_id' => $payout->reference_id, 'reason' => $responseMessage],
                    "فشل التحويل البنكي عبر HyperPay للمرجع #{$payout->reference_id} - السبب: {$responseMessage}"
                );
            }
        });

        return response()->json(['message' => 'Payout webhook processed successfully'], 200);
    }
}

