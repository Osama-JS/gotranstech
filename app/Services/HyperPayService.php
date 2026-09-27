<?php

namespace App\Services;

use App\Models\HyperpayTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class HyperPayService
{
    public function __construct(
        protected WalletService $walletService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Prepare a HyperPay checkout.
     */
    public function prepareCheckout(User $user, float $amount, string $paymentBrand = 'VISA'): array
    {
        $config = EncryptedSettingService::getHyperPayConfig();
        
        $entityId = match(strtoupper($paymentBrand)) {
            'MADA' => $config['entity_id_mada'],
            'APPLEPAY' => $config['entity_id_apple_pay'],
            default => $config['entity_id_visa_master'],
        };

        if (empty($config['access_token']) || empty($entityId)) {
            // Development fallback mock mode if not configured yet
            $mockCheckoutId = 'MOCK_' . md5(uniqid(mt_rand(), true));
            
            HyperpayTransaction::create([
                'user_id' => $user->id,
                'wallet_id' => $user->investment_wallet->id,
                'checkout_id' => $mockCheckoutId,
                'payment_brand' => $paymentBrand,
                'amount' => $amount,
                'currency' => 'SAR',
                'status' => 'pending',
            ]);

            return [
                'checkout_id' => $mockCheckoutId,
                'is_mock' => true,
                'script_url' => '',
                'brand' => $paymentBrand,
            ];
        }

        $url = rtrim($config['base_url'], '/') . '/v1/checkouts';
        $data = [
            'entityId' => $entityId,
            'amount' => number_format($amount, 2, '.', ''),
            'currency' => $config['currency'] ?? 'SAR',
            'paymentType' => 'DB',
            'customer.email' => $user->email,
            'customer.givenName' => $user->name,
            'billing.country' => 'SA',
        ];

        $response = Http::withToken($config['access_token'])
            ->asForm()
            ->post($url, $data);

        if (!$response->successful()) {
            Log::error("HyperPay checkout creation failed: " . $response->body());
            throw new RuntimeException("فشل إنشاء جلسة الدفع في HyperPay: " . $response->json('result.description', 'خطأ غير معروف'));
        }

        $responseData = $response->json();
        $checkoutId = $responseData['id'];

        HyperpayTransaction::create([
            'user_id' => $user->id,
            'wallet_id' => $user->investment_wallet->id,
            'checkout_id' => $checkoutId,
            'payment_brand' => $paymentBrand,
            'amount' => $amount,
            'currency' => $config['currency'] ?? 'SAR',
            'status' => 'pending',
            'raw_response' => $responseData,
        ]);

        return [
            'checkout_id' => $checkoutId,
            'is_mock' => false,
            'script_url' => rtrim($config['base_url'], '/') . "/v1/paymentWidgets.js?checkoutId={$checkoutId}",
            'brand' => $paymentBrand,
        ];
    }

    /**
     * Verify payment status with HyperPay.
     */
    public function verifyPayment(string $checkoutId, ?string $resourcePath = null): array
    {
        $transaction = HyperpayTransaction::where('checkout_id', $checkoutId)->firstOrFail();
        
        if ($transaction->status === 'paid') {
            return ['status' => 'success', 'message' => 'تم الدفع والشحن مسبقاً', 'transaction' => $transaction];
        }

        // Mock verification if in mock mode
        if (str_starts_with($checkoutId, 'MOCK_')) {
            $transaction->status = 'paid';
            $transaction->hyperpay_id = 'HP_' . rand(100000, 999999);
            $transaction->result_code = '000.100.110';
            $transaction->result_description = 'Transaction succeeded (Mock Mode)';
            $transaction->save();

            // Credit Investor Investment Wallet
            $this->walletService->creditWallet(
                $transaction->wallet,
                (float) $transaction->amount,
                'deposit',
                "شحن إلكتروني لمحفظة الاستثمار عبر HyperPay (#{$transaction->checkout_id})",
                $transaction
            );

            return ['status' => 'success', 'message' => 'تم شحن المحفظة بنجاح', 'transaction' => $transaction];
        }

        $config = EncryptedSettingService::getHyperPayConfig();
        $entityId = match(strtoupper($transaction->payment_brand)) {
            'MADA' => $config['entity_id_mada'],
            'APPLEPAY' => $config['entity_id_apple_pay'],
            default => $config['entity_id_visa_master'],
        };

        $url = $resourcePath 
            ? rtrim($config['base_url'], '/') . $resourcePath . "?entityId={$entityId}"
            : rtrim($config['base_url'], '/') . "/v1/checkouts/{$checkoutId}/payment?entityId={$entityId}";

        $response = Http::withToken($config['access_token'])->get($url);
        $resData = $response->json();

        $resultCode = $resData['result']['code'] ?? '';
        $isSuccess = preg_match('/^(000\.000\.|000\.100\.1|000\.[36])/', $resultCode);

        $transaction->result_code = $resultCode;
        $transaction->result_description = $resData['result']['description'] ?? '';
        $transaction->hyperpay_id = $resData['id'] ?? null;
        $transaction->raw_response = $resData;

        if ($isSuccess) {
            $transaction->status = 'paid';
            $transaction->save();

            // Credit Investor Investment Wallet
            $this->walletService->creditWallet(
                $transaction->wallet,
                (float) $transaction->amount,
                'deposit',
                "شحن إلكتروني لمحفظة الاستثمار عبر HyperPay (#{$transaction->checkout_id})",
                $transaction
            );

            $this->auditLogService->log(
                'approved',
                $transaction,
                ['status' => 'pending'],
                ['status' => 'paid', 'amount' => $transaction->amount],
                "شحن ناجح لمحفظة الاستثمار بمبلغ {$transaction->amount} ر.س عبر HyperPay"
            );

            return ['status' => 'success', 'message' => 'تمت عملية الدفع وإيداع الرصيد بنجاح', 'transaction' => $transaction];
        } else {
            $transaction->status = 'failed';
            $transaction->save();

            return ['status' => 'failed', 'message' => 'فشلت عملية الدفع: ' . ($resData['result']['description'] ?? 'غير مصرح'), 'transaction' => $transaction];
        }
    }
}
