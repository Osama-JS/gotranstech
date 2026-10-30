<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Models\HyperpayPayout;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use App\Services\AuditLogService;
use App\Services\HyperPayPayoutService;
use App\Services\NotificationDispatcherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class AdminPayoutController extends Controller
{
    public function __construct(
        protected HyperPayPayoutService $payoutService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Display listing of HyperPay Payout requests (Investors & Companies)
     */
    public function index(Request $request): Response
    {
        $query = HyperpayPayout::with(['user', 'wallet', 'bank', 'creator', 'approver', 'rejector', 'withdrawalRequest']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_id', 'like', "%{$search}%")
                  ->orWhere('payout_id', 'like', "%{$search}%")
                  ->orWhere('amount', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Type Filter
        if ($type = $request->input('payout_type')) {
            $query->where('payout_type', $type);
        }

        // Bank Filter
        if ($bankId = $request->input('bank_id')) {
            $query->where('bank_id', $bankId);
        }

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $payouts = $query->latest()->paginate(15)->withQueryString();

        // Metrics
        $metrics = [
            'pending_count'     => HyperpayPayout::where('status', 'pending_approval')->count(),
            'pending_amount'    => (float) HyperpayPayout::where('status', 'pending_approval')->sum('amount'),
            'processing_count'  => HyperpayPayout::where('status', 'processing')->count(),
            'processing_amount' => (float) HyperpayPayout::where('status', 'processing')->sum('amount'),
            'completed_count'   => HyperpayPayout::where('status', 'completed')->count(),
            'completed_amount'  => (float) HyperpayPayout::where('status', 'completed')->sum('amount'),
            'failed_count'      => HyperpayPayout::whereIn('status', ['failed', 'rejected'])->count(),
        ];

        $banks = Bank::active()->select('id', 'name', 'code')->orderBy('name')->get();

        return Inertia::render('Admin/Payouts/Index', [
            'payouts' => $payouts,
            'metrics' => $metrics,
            'banks'   => $banks,
            'filters' => $request->only(['search', 'status', 'payout_type', 'bank_id', 'date_from', 'date_to']),
        ]);
    }

    /**
     * Approve and execute Payout to HyperPay API
     */
    public function approve(Request $request, int $id)
    {
        $request->validate([
            'password' => 'required|string',
        ], [
            'password.required' => 'يرجى إدخال كلمة مرور المشرف للتأكيد الأمني.',
        ]);

        // 1. Verify Manager Password
        if (!Hash::check($request->password, Auth::user()->password)) {
            return back()->with('error', 'كلمة المرور المدخلة غير صحيحة، تم إلغاء الاعتماد.');
        }

        $payout = HyperpayPayout::with(['user', 'bank', 'wallet', 'withdrawalRequest'])->findOrFail($id);

        if ($payout->status !== 'pending_approval') {
            return back()->with('error', 'هذا الطلب ليس في حالة بانتظار الاعتماد المالي.');
        }

        $beneficiaryDetails = $payout->beneficiary_details ?? [];
        $iban = $beneficiaryDetails['iban'] ?? null;
        $beneficiaryName = $beneficiaryDetails['beneficiary_name'] ?? $payout->user?->name;
        $bankId = $payout->bank_id ?? ($beneficiaryDetails['bank_id'] ?? null);
        $bicCode = $payout->bank?->code ?? ($beneficiaryDetails['bic'] ?? null);

        if (!$iban) {
            return back()->with('error', 'رقم الآيبان البنكي غير متوفر لهذا الطلب.');
        }

        // 2. Dispatch via HyperPay Payout Service
        $city = $details['city'] ?? 'Riyadh';
        $country = $details['country'] ?? 'SA';

        $response = $this->payoutService->sendPayout([
            'externalId'       => $payout->reference_id,
            'amount'           => $payout->amount,
            'currency'         => 'SAR',
            'bank_id'          => $bankId,
            'bic'              => $bicCode,
            'iban'             => $iban,
            'beneficiary_name' => $beneficiaryName,
            'city'             => $city,
            'country'          => $country,
            'description'      => "GoTech " . ($payout->payout_type === 'company_funding' ? 'Co #' : 'Inv #') . $payout->user_id,
        ]);

        if (!$response['status']) {
            $payout->update([
                'failure_reason' => $response['message'],
            ]);

            return back()->with('error', $response['message']);
        }

        $payoutId = $response['data']['payoutId'] ?? 'N/A';
        $bulkId = $response['data']['bulkId'] ?? 'N/A';

        // 3. Mark as processing
        $payout->update([
            'status'      => 'processing',
            'payout_id'   => $payoutId !== 'N/A' ? $payoutId : $payout->payout_id,
            'bulk_id'     => $bulkId !== 'N/A' ? $bulkId : $payout->bulk_id,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        $this->auditLogService->log(
            'payout_approved',
            $payout,
            [],
            ['reference_id' => $payout->reference_id, 'payout_id' => $payoutId, 'amount' => $payout->amount],
            "اعتماد وصرف الحوالة البنكية الفورية عبر HyperPay للمرجع #{$payout->reference_id} بمبلغ {$payout->amount} ر.س"
        );

        return back()->with('success', "تم اعتماد الطلب وإرسال التحويل البنكي الفوري عبر HyperPay بنجاح (رقم العملية: {$payoutId}). العملية قيد المعالجة البنكية.");
    }

    /**
     * Reject payout request
     */
    public function reject(Request $request, int $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ], [
            'rejection_reason.required' => 'يرجى كتابة سبب رفض طلب التحويل.',
        ]);

        $payout = HyperpayPayout::with(['wallet', 'user'])->findOrFail($id);

        if ($payout->status !== 'pending_approval') {
            return back()->with('error', 'هذا الطلب ليس في حالة بانتظار الاعتماد.');
        }

        DB::transaction(function () use ($payout, $request) {
            $payout->update([
                'status'           => 'rejected',
                'rejected_by'      => Auth::id(),
                'rejected_at'      => now(),
                'rejection_reason' => $request->rejection_reason,
            ]);

            // Restore/Refund investor commission wallet if it was deducted
            if ($payout->payout_type === 'investor_commission') {
                if ($payout->wallet) {
                    $payout->wallet->balance += (float) $payout->amount;
                    $payout->wallet->save();

                    WalletTransaction::create([
                        'wallet_id'        => $payout->wallet_id,
                        'user_id'          => $payout->user_id,
                        'transaction_type' => 'credit',
                        'amount'           => (float) $payout->amount,
                        'balance_before'   => $payout->wallet->balance - (float) $payout->amount,
                        'balance_after'    => $payout->wallet->balance,
                        'reference_type'   => 'payout_rejection_refund',
                        'reference_id'     => $payout->id,
                        'description'      => "استرداد رصيد الأرباح - رفض طلب السحب (السبب: {$request->rejection_reason})",
                        'status'           => 'completed',
                    ]);
                }

                if ($payout->wallet_transaction_id) {
                    $tx = WalletTransaction::find($payout->wallet_transaction_id);
                    if ($tx) {
                        $tx->update(['status' => 'rejected']);
                    }
                }
            }

            // Audit
            $this->auditLogService->log(
                'payout_rejected',
                $payout,
                [],
                ['reason' => $request->rejection_reason],
                "رفض طلب التحويل البنكي للمرجع #{$payout->reference_id} - السبب: {$request->rejection_reason}"
            );
        });

        return back()->with('success', 'تم رفض طلب التحويل البنكي وإعادة الرصيد للمحفظة بنجاح.');
    }

    /**
     * Check live status directly from HyperPay
     */
    public function checkStatus(int $id)
    {
        $payout = HyperpayPayout::findOrFail($id);

        if (!$payout->reference_id) {
            return back()->with('error', 'لا يوجد رقم مرجع صحيح لهذا الطلب.');
        }

        $res = $this->payoutService->checkPayoutStatus($payout->reference_id, $payout->payout_id);

        if (!$res['status'] && !in_array($res['code'] ?? '', ['63000', '90000', '77000'])) {
            return back()->with('error', $res['message'] ?? 'تعذر الاستعلام عن حالة الحوالة لدى البوابة.');
        }

        $statusCode = $res['code'] ?? '';
        $message = $res['message'] ?? 'Unknown';

        if ($statusCode === '00000' && $payout->status !== 'completed') {
            $payout->update([
                'status' => 'completed',
            ]);

            if ($payout->wallet_transaction_id) {
                $tx = WalletTransaction::find($payout->wallet_transaction_id);
                if ($tx) $tx->update(['status' => 'completed']);
            }
        }

        return back()->with('success', "حالة الحوالة المحدثة من HyperPay: {$message} (كود: {$statusCode})");
    }
}

