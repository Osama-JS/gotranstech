<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Models\CompanyProfile;
use App\Models\HyperpayPayout;
use App\Models\WithdrawalRequest;
use App\Services\HyperPayPayoutService;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminWithdrawalController extends Controller
{
    public function __construct(
        protected WithdrawalService $withdrawalService,
        protected HyperPayPayoutService $payoutService
    ) {}

    public function index(Request $request): Response
    {
        $query = WithdrawalRequest::with(['company.user', 'reviewer']);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                  ->orWhereHas('company', function ($c) use ($search) {
                      $c->where('company_name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('cr_number', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Company Filter
        if ($companyId = $request->input('company_id')) {
            $query->where('company_id', $companyId);
        }

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $withdrawals = $query->latest()->paginate(15)->withQueryString();

        // Statistics
        $stats = [
            'total' => WithdrawalRequest::count(),
            'pending' => WithdrawalRequest::where('status', 'pending')->count(),
            'approved' => WithdrawalRequest::where('status', 'approved')->count(),
            'rejected' => WithdrawalRequest::where('status', 'rejected')->count(),
            'total_approved_amount' => WithdrawalRequest::where('status', 'approved')->sum('requested_amount'),
            'total_pending_amount' => WithdrawalRequest::where('status', 'pending')->sum('requested_amount'),
        ];

        $companies = CompanyProfile::select('id', 'company_name')->orderBy('company_name')->get();
        $banks = Bank::active()->select('id', 'name', 'code')->orderBy('name')->get();

        return Inertia::render('Admin/Withdrawals/Index', [
            'withdrawals' => $withdrawals,
            'stats' => $stats,
            'companies' => $companies,
            'banks' => $banks,
            'filters' => $request->only(['search', 'status', 'company_id', 'date_from', 'date_to']),
        ]);
    }

    public function show(int $id): Response
    {
        $withdrawal = WithdrawalRequest::with([
            'company.user',
            'items.task',
            'debt',
            'reviewer'
        ])->findOrFail($id);

        $banks = Bank::active()->select('id', 'name', 'code')->orderBy('name')->get();
        $payout = HyperpayPayout::where('source_withdrawal_id', $withdrawal->id)
            ->with(['bank', 'approver'])
            ->latest()
            ->first();

        return Inertia::render('Admin/Withdrawals/Show', [
            'withdrawal' => $withdrawal,
            'banks'      => $banks,
            'payout'     => $payout,
        ]);
    }

    /**
     * Dispatch instant Payout for company withdrawal request via HyperPay
     */
    public function dispatchPayout(Request $request, int $id)
    {
        $withdrawal = WithdrawalRequest::with('company.user')->findOrFail($id);

        if ($withdrawal->status !== 'approved') {
            return back()->with('error', 'يجب أن يكون طلب السحب معتمداً ومقيداً كمديونية قبل صرف التحويل البنكي.');
        }

        $validated = $request->validate([
            'password'       => 'required|string',
            'bank_id'        => 'required|exists:banks,id',
            'iban'           => 'required|string|max:50',
            'account_holder' => 'required|string|max:150',
        ], [
            'password.required'       => 'يرجى إدخال كلمة مرور المشرف للتأكيد الأمني.',
            'bank_id.required'        => 'يرجى اختيار البنك المستلم.',
            'iban.required'           => 'يرجى إدخال رقم الآيبان البنكي للشركة.',
            'account_holder.required' => 'يرجى إدخال اسم المستفيد/الشركة.',
        ]);

        if (!Hash::check($validated['password'], Auth::user()->password)) {
            return back()->with('error', 'كلمة المرور المدخلة غير صحيحة، تم إلغاء عملية الصرف.');
        }

        $company = $withdrawal->company;

        // If company has locked bank account on file, enforce it
        $targetBankId = $company->bank_id ?: $validated['bank_id'];
        $bank = Bank::findOrFail($targetBankId);
        if (!$bank->is_active) {
            return back()->with('error', "البنك المعتمد للشركة ({$bank->name}) غير مفعل للتحويلات البنكية حالياً.");
        }

        $rawIban = $company->bank_iban ?: $validated['iban'];
        $cleanIban = strtoupper(str_replace([' ', '-', '.'], '', trim($rawIban)));
        $ibanCheck = HyperPayPayoutService::validateIbanChecksum($cleanIban, 'الشركة');
        if (!$ibanCheck['valid']) {
            return back()->with('error', $ibanCheck['message']);
        }

        $accountHolder = $company->account_holder_name ?: ($validated['account_holder'] ?? $company->company_name);
        $city = $company->bank_city ?: ($company->city ?: 'Riyadh');
        $country = $company->bank_country ?: 'SA';
        $amount = (float) $withdrawal->requested_amount;
        $referenceId = 'CWD-' . $withdrawal->id . '-' . time();

        $payout = HyperpayPayout::create([
            'reference_id'         => $referenceId,
            'payout_type'          => 'company_funding',
            'user_id'              => $withdrawal->company->user_id,
            'wallet_id'            => $withdrawal->company->user->company_funding_wallet->id ?? null,
            'bank_id'              => $bank->id,
            'source_withdrawal_id' => $withdrawal->id,
            'amount'               => $amount,
            'currency'             => 'SAR',
            'beneficiary_details'  => [
                'beneficiary_name' => $accountHolder,
                'bank_name'        => $bank->name,
                'bank_id'          => $bank->id,
                'bic'              => $bank->code,
                'iban'             => $cleanIban,
                'city'             => $city,
                'country'          => $country,
            ],
            'status'     => 'pending_approval',
            'created_by' => Auth::id(),
        ]);

        $res = $this->payoutService->sendPayout([
            'externalId'       => $referenceId,
            'amount'           => $amount,
            'currency'         => 'SAR',
            'bank_id'          => $bank->id,
            'bic'              => $bank->code,
            'iban'             => $cleanIban,
            'beneficiary_name' => $accountHolder,
            'city'             => $city,
            'country'          => $country,
            'description'      => "Payout Co #{$withdrawal->company_id} Req #{$withdrawal->request_number}",
        ]);

        if (!$res['status']) {
            $payout->update(['failure_reason' => $res['message'], 'status' => 'failed']);
            return back()->with('error', $res['message']);
        }

        $payoutId = $res['data']['payoutId'] ?? 'N/A';
        $payout->update([
            'status'      => 'processing',
            'payout_id'   => $payoutId !== 'N/A' ? $payoutId : null,
            'approved_by' => Auth::id(),
            'approved_at' => now(),
        ]);

        // Save bank details to company profile only if it had none (first-time registration)
        if (empty($company->bank_id)) {
            $company->update([
                'bank_id'             => $bank->id,
                'bank_name'           => $bank->name,
                'bank_iban'           => $cleanIban,
                'account_holder_name' => $accountHolder,
            ]);
        }

        return back()->with('success', "تم إرسال التحويل البنكي الفوري بنجاح عبر HyperPay (رقم العملية: {$payoutId}). التحويل قيد المعالجة البنكية.");
    }

    public function approve(Request $request, int $id)
    {
        $withdrawal = WithdrawalRequest::findOrFail($id);

        $request->validate([
            'due_date' => 'required|date|after:today',
            'admin_signature' => 'nullable|string',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $this->withdrawalService->approveWithdrawalRequest(
            $withdrawal,
            Auth::user(),
            $request->input('due_date'),
            $request->input('admin_signature'),
            $request->input('admin_notes')
        );

        return back()->with('success', 'تم اعتماد طلب السحب بنجاح وقيد المديونية المستحقة وتوليد العقد الموقع.');
    }

    public function reject(Request $request, int $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $withdrawal = WithdrawalRequest::findOrFail($id);

        $this->withdrawalService->rejectWithdrawalRequest(
            $withdrawal,
            Auth::user(),
            $request->input('rejection_reason')
        );

        return back()->with('success', 'تم رفض طلب السحب وإلغاء قفل الرصيد.');
    }

    public function downloadPdf(int $id)
    {
        $withdrawal = WithdrawalRequest::findOrFail($id);

        $disk = 'local';
        if ($withdrawal->pdf_file_path && Storage::disk('local')->exists($withdrawal->pdf_file_path)) {
            $disk = 'local';
        } elseif ($withdrawal->pdf_file_path && Storage::disk('public')->exists($withdrawal->pdf_file_path)) {
            $disk = 'public';
        } else {
            // regenerate if missing
            app(\App\Services\PdfGenerationService::class)->generateWithdrawalPdf($withdrawal);
            $disk = 'local';
        }

        return Storage::disk($disk)->download($withdrawal->pdf_file_path, "withdrawal_{$withdrawal->request_number}.pdf");
    }
}
