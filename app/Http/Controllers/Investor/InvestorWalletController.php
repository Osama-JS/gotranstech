<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\Bank;
use App\Models\BankAccountChangeRequest;
use App\Models\BankDeposit;
use App\Models\HyperpayPayout;
use App\Models\HyperpayTransaction;
use App\Models\TaskInvestment;
use App\Models\WalletTransaction;
use App\Services\EncryptedSettingService;
use App\Services\HyperPayPayoutService;
use App\Services\HyperPayService;
use App\Services\ArabicPdfHelper;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvestorWalletController extends Controller
{
    public function __construct(
        protected HyperPayService $hyperPayService
    ) {}

    public function index(): RedirectResponse
    {
        return redirect()->route('investor.wallet.investment');
    }

    /**
     * Investment & Capital Wallet (محفظة الاستثمار ورأس المال)
     */
    public function investmentWallet(Request $request): Response
    {
        $user = Auth::user();
        $investmentWallet = $user->investment_wallet;

        // Transactions specifically for the investment wallet
        $transactions = WalletTransaction::where('wallet_id', $investmentWallet->id)
            ->with(['reference'])
            ->latest()
            ->paginate(15);

        // Bank deposits submitted by this investor
        $bankDeposits = BankDeposit::where('user_id', $user->id)
            ->latest()
            ->paginate(10);

        $bankDeposits->getCollection()->transform(function ($dep) {
            $dep->receipt_url = route('investor.wallet.deposits.receipt', $dep->id);
            $dep->is_pdf = str_ends_with(strtolower($dep->receipt_file_path ?? ''), '.pdf') || empty($dep->receipt_file_path);
            return $dep;
        });

        // Calculate detailed statistics for investment wallet
        $totalInflow = (float) WalletTransaction::where('wallet_id', $investmentWallet->id)
            ->where('amount', '>', 0)
            ->sum('amount');

        $totalDeployed = (float) WalletTransaction::where('wallet_id', $investmentWallet->id)
            ->where('amount', '<', 0)
            ->sum(DB::raw('ABS(amount)'));

        $approvedDepositsCount = BankDeposit::where('user_id', $user->id)->where('status', 'approved')->count();
        $pendingDepositsCount = BankDeposit::where('user_id', $user->id)->where('status', 'pending')->count();
        $pendingDepositsAmount = (float) BankDeposit::where('user_id', $user->id)->where('status', 'pending')->sum('amount');

        $platformBankInfo = [
            'bank_name' => EncryptedSettingService::get('bank_name', 'مصرف الراجحي'),
            'bank_iban' => EncryptedSettingService::get('bank_iban', 'SA0380000555555555555555'),
            'account_holder' => EncryptedSettingService::get('bank_account_holder', 'شركة جو تك لتقنية المعلومات والحلول المالية'),
        ];

        $hpConfig = EncryptedSettingService::getHyperPayConfig();
        $enabledPaymentMethods = [
            'MADA' => $hpConfig['enable_mada'],
            'VISA' => $hpConfig['enable_visa_master'],
            'APPLEPAY' => $hpConfig['enable_apple_pay'],
        ];

        return Inertia::render('Investor/Wallet/InvestmentWallet', [
            'wallet' => $investmentWallet,
            'commissionWallet' => $user->commission_wallet,
            'stats' => [
                'current_balance' => (float) $investmentWallet->balance,
                'available_balance' => (float) $investmentWallet->available_balance,
                'locked_balance' => (float) $investmentWallet->locked_balance,
                'total_inflow' => $totalInflow,
                'total_deployed' => $totalDeployed,
                'approved_deposits_count' => $approvedDepositsCount,
                'pending_deposits_count' => $pendingDepositsCount,
                'pending_deposits_amount' => $pendingDepositsAmount,
            ],
            'transactions' => $transactions,
            'bankDeposits' => $bankDeposits,
            'platformBankInfo' => $platformBankInfo,
            'enabledPaymentMethods' => $enabledPaymentMethods,
        ]);
    }

    /**
     * Commissions & Profits Wallet (محفظة الأرباح والعمولات)
     */
    public function commissionWallet(Request $request): Response
    {
        $user = Auth::user();
        $commissionWallet = $user->commission_wallet;

        // Transactions specifically for the commission wallet
        $transactions = WalletTransaction::where('wallet_id', $commissionWallet->id)
            ->with(['reference'])
            ->latest()
            ->paginate(15);

        // Stats for commission wallet
        $totalEarned = (float) WalletTransaction::where('wallet_id', $commissionWallet->id)
            ->where('amount', '>', 0)
            ->sum('amount');

        $totalWithdrawn = (float) WalletTransaction::where('wallet_id', $commissionWallet->id)
            ->where('amount', '<', 0)
            ->sum(DB::raw('ABS(amount)'));

        $tasksRewardedCount = TaskInvestment::where('investor_id', $user->id)
            ->where('investor_commission_amount', '>', 0)
            ->count();

        $avgProfitPerTask = $tasksRewardedCount > 0 ? round($totalEarned / $tasksRewardedCount, 2) : 0;

        $activeBanks = Bank::active()->select('id', 'name', 'name_en', 'code')->orderBy('name')->get();
        $payouts = HyperpayPayout::where('user_id', $user->id)
            ->with('bank')
            ->latest()
            ->take(15)
            ->get();

        $pendingBankChangeRequest = BankAccountChangeRequest::with(['currentBank', 'newBank'])
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        $investorProfile = $user->investorProfile?->load('bank');

        return Inertia::render('Investor/Wallet/CommissionWallet', [
            'wallet' => $commissionWallet,
            'investmentWallet' => $user->investment_wallet,
            'stats' => [
                'current_balance' => (float) $commissionWallet->balance,
                'available_balance' => (float) $commissionWallet->available_balance,
                'total_earned' => $totalEarned,
                'total_withdrawn' => $totalWithdrawn,
                'tasks_rewarded_count' => $tasksRewardedCount,
                'avg_profit_per_task' => $avgProfitPerTask,
                'commission_share_rate' => $user->investorProfile?->platform_commission_share_rate ?? 70,
            ],
            'transactions' => $transactions,
            'investorProfile' => $investorProfile,
            'pendingBankChangeRequest' => $pendingBankChangeRequest,
            'banks' => $activeBanks,
            'payouts' => $payouts,
        ]);
    }

    /**
     * Request Commission Profit Withdrawal (طلب سحب أرباح فوري عبر HyperPay Payout)
     * strictly uses the approved locked bank account on file.
     */
    public function requestCommissionWithdrawal(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $commissionWallet = $user->commission_wallet;
        $profile = $user->investorProfile?->load('bank');

        if (!$profile || empty($profile->bank_id) || empty($profile->bank_iban)) {
            return back()->withErrors([
                'general' => 'لم تقم بتسجيل حسابك البنكي المعتمد بعد. يرجى تسجيل وتأكيد حسابك البنكي أولاً لتتمكن من تقديم طلب سحب الأرباح.'
            ]);
        }

        $bank = $profile->bank ?? Bank::find($profile->bank_id);
        if (!$bank || !$bank->is_active) {
            return back()->withErrors([
                'general' => "حسابك البنكي المعتمد مرتبط ببنك (" . ($bank->name ?? 'غير معروف') . ") غير متاح للتحويلات حالياً من قبل الإدارة. يرجى تقديم طلب تغيير حساب بنكي."
            ]);
        }

        $validated = $request->validate([
            'amount' => [
                'required',
                'numeric',
                'min:50',
                'max:' . ($commissionWallet->available_balance ?? 0),
            ],
        ], [
            'amount.required' => 'يرجى إدخال المبلغ المطلوب سحبه.',
            'amount.min' => 'الحد الأدنى لطلب سحب الأرباح هو 50 ر.س.',
            'amount.max' => 'المبلغ المطلوب يتجاوز الرصيد المتاح في محفظة الأرباح.',
        ]);

        $cleanIban = strtoupper(str_replace([' ', '-', '.'], '', trim($profile->bank_iban)));
        $accountHolder = $profile->account_holder_name ?: $user->name;
        $city = $profile->bank_city ?: 'Riyadh';
        $country = $profile->bank_country ?: 'SA';
        $amount = (float) $validated['amount'];

        DB::transaction(function () use ($user, $commissionWallet, $amount, $bank, $cleanIban, $accountHolder, $city, $country) {
            $balanceBefore = (float) $commissionWallet->balance;
            $commissionWallet->balance -= $amount;
            $commissionWallet->save();

            // Unique reference for payout: IPW-{user_id}-{timestamp}
            $referenceId = 'IPW-' . $user->id . '-' . time();

            $payout = HyperpayPayout::create([
                'reference_id' => $referenceId,
                'payout_type'  => 'investor_commission',
                'user_id'      => $user->id,
                'wallet_id'    => $commissionWallet->id,
                'bank_id'      => $bank->id,
                'amount'       => $amount,
                'currency'     => 'SAR',
                'beneficiary_details' => [
                    'beneficiary_name' => $accountHolder,
                    'bank_name'        => $bank->name,
                    'bank_id'          => $bank->id,
                    'bic'              => $bank->code,
                    'iban'             => $cleanIban,
                    'city'             => $city,
                    'country'          => $country,
                ],
                'status'     => 'pending_approval',
                'created_by' => $user->id,
            ]);

            $tx = WalletTransaction::create([
                'wallet_id'        => $commissionWallet->id,
                'user_id'          => $user->id,
                'transaction_type' => 'debit',
                'amount'           => -$amount,
                'balance_before'   => $balanceBefore,
                'balance_after'    => $commissionWallet->balance,
                'reference_type'   => 'commission_withdrawal',
                'reference_id'     => $payout->id,
                'description'      => "طلب سحب أرباح إلى حسابك البنكي المعتمد لدى {$bank->name} (آيبان: {$cleanIban}) - مرجع: {$referenceId}",
                'status'           => 'pending',
                'metadata'         => [
                    'bank_id'        => $bank->id,
                    'bank_name'      => $bank->name,
                    'bank_code'      => $bank->code,
                    'iban'           => $cleanIban,
                    'account_holder' => $accountHolder,
                    'payout_id'      => $payout->id,
                    'reference_id'   => $referenceId,
                    'requested_at'   => now()->toIso8601String(),
                ],
            ]);

            $payout->update(['wallet_transaction_id' => $tx->id]);
        });

        // Notify Admin of Investor Withdrawal Request
        $isLargeAmount = $amount >= 50000;
        \App\Services\NotificationDispatcherService::dispatch(
            $isLargeAmount ? 'admin.large_amount_withdrawal_requested' : 'admin.investor_withdrawal_requested',
            "طلب سحب أرباح مستثمر: {$user->name}",
            "تقدم المستثمر ({$user->name}) بطلب سحب أرباح بمبلغ " . number_format($amount, 2) . " ر.س إلى حسابه البنكي المعتمد لدى {$bank->name} بانتظار الاعتماد المالي والصرف عبر سريع.",
            route('admin.payouts.index', [], false),
            ['investor_id' => $user->id, 'amount' => $amount],
            null,
            $isLargeAmount ? 'urgent' : 'warning'
        );

        return back()->with('success', 'تم تقديم طلب سحب الأرباح بنجاح وتم فحص الآيبان، سيتم اعتماد صرف الحوالة البنكية الفورية لحسابك.');
    }

    public function submitBankDeposit(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:100',
            'bank_name' => 'required|string|max:100',
            'sender_name' => 'required|string|max:150',
            'sender_account' => 'nullable|string|max:50',
            'reference_number' => 'nullable|string|max:50',
            'transfer_date' => 'required|date',
            'receipt_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ], [
            'amount.required' => 'يرجى إدخال مبلغ التحويل',
            'amount.min' => 'الحد الأدنى للإيداع هو 100 ر.س',
            'receipt_file.required' => 'يرجى إرفاق صورة أو ملف إيصال التحويل',
        ]);

        $user = Auth::user();
        $path = $request->file('receipt_file')->store('receipts', 'local');

        $deposit = BankDeposit::create([
            'user_id' => $user->id,
            'wallet_id' => $user->investment_wallet->id,
            'deposit_number' => BankDeposit::generateDepositNumber(),
            'amount' => $validated['amount'],
            'bank_name' => $validated['bank_name'],
            'sender_name' => $validated['sender_name'],
            'sender_account' => $validated['sender_account'] ?? null,
            'reference_number' => $validated['reference_number'] ?? null,
            'transfer_date' => $validated['transfer_date'],
            'receipt_file_path' => $path,
            'status' => 'pending',
        ]);

        // Notify Admin of Bank Deposit
        \App\Services\NotificationDispatcherService::dispatch(
            'admin.deposit_completed',
            "إشعار إيداع بنكي: #{$deposit->deposit_number}",
            "قام المستثمر ({$user->name}) برفع إيصال إيداع بنكي بمبلغ " . number_format($validated['amount'], 2) . " ر.س عبر {$validated['bank_name']} بانتظار التحقق والاعتماد.",
            route('admin.deposits.index', [], false),
            ['deposit_id' => $deposit->id, 'amount' => $validated['amount'], 'user_id' => $user->id],
            null,
            'info'
        );

        return back()->with('success', 'تم رفع إيصال التحويل البنكي بنجاح. سيتم مراجعته وإيداع المبلغ في محفظتك فور اعتماده من الإدارة.');
    }

    public function prepareHyperPay(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50',
            'payment_brand' => 'required|in:MADA,VISA,MASTER,APPLEPAY',
        ]);

        $brand = strtoupper($validated['payment_brand']);
        $hpConfig = EncryptedSettingService::getHyperPayConfig();
        $isEnabled = match($brand) {
            'MADA' => $hpConfig['enable_mada'],
            'APPLEPAY' => $hpConfig['enable_apple_pay'],
            default => $hpConfig['enable_visa_master'],
        };

        if (!$isEnabled) {
            return response()->json([
                'error' => 'وسيلة الدفع المحددة معطلة حالياً من قبل إدارة المنصة.'
            ], 422);
        }

        $user = Auth::user();

        try {
            $checkoutData = $this->hyperPayService->prepareCheckout(
                $user,
                (float) $validated['amount'],
                $brand
            );

            return response()->json($checkoutData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Show dedicated HyperPay secure checkout page.
     */
    public function showCheckout(Request $request, string $checkoutId)
    {
        $user = Auth::user();

        $transaction = HyperpayTransaction::where('checkout_id', $checkoutId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if ($transaction->status === 'paid') {
            return redirect()->route('investor.wallet.investment')->with('info', 'تم دفع وشحن هذه المعاملة مسبقاً.');
        }

        $isMock = str_starts_with($checkoutId, 'MOCK_');
        $config = EncryptedSettingService::getHyperPayConfig();
        $cleanBase = rtrim($config['base_url'], '/');
        $scriptUrl = $cleanBase . "/v1/paymentWidgets.js?checkoutId={$checkoutId}";
        $brands = $this->hyperPayService->getBrandsForWidget($transaction->payment_brand);

        return view('payments.hyperpay_checkout', [
            'transaction' => $transaction,
            'isMock' => $isMock,
            'scriptUrl' => $scriptUrl,
            'brands' => $brands,
        ]);
    }

    public function hyperPayCallback(Request $request)
    {
        $checkoutId = $request->input('id') ?? $request->input('checkout_id');
        $resourcePath = $request->input('resourcePath');

        // Extract checkout ID from resourcePath if not directly provided
        if (!$checkoutId && $resourcePath) {
            if (preg_match('/checkouts\/([^\/]+)\/payment/', $resourcePath, $matches)) {
                $checkoutId = $matches[1];
            }
        }

        if (!$checkoutId) {
            return redirect()->route('investor.wallet.investment')->with('error', 'معرّف عملية الدفع غير متوفر.');
        }

        try {
            $result = $this->hyperPayService->verifyPayment($checkoutId, $resourcePath);
            if ($result['status'] === 'success') {
                return redirect()->route('investor.wallet.investment')->with('success', $result['message']);
            } else {
                return redirect()->route('investor.wallet.investment')->with('error', $result['message']);
            }
        } catch (\Exception $e) {
            return redirect()->route('investor.wallet.investment')->with('error', 'حدث خطأ أثناء التحقق من الدفع: ' . $e->getMessage());
        }
    }

    /**
     * View or download deposit receipt PDF/image
     */
    public function viewReceipt(int $id)
    {
        $deposit = BankDeposit::where('user_id', Auth::id())->with(['user'])->findOrFail($id);
        $path = $deposit->receipt_file_path;

        if ($path && Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        // Generate fallback receipt PDF
        $fileName = 'deposits/' . ($deposit->deposit_number ?: 'DEP-' . $deposit->id) . '_receipt.pdf';

        if (!Storage::disk('local')->exists($fileName) && !Storage::disk('public')->exists($fileName)) {
            $html = view('pdf.deposit_receipt', [
                'deposit' => $deposit,
                'user' => $deposit->user,
            ])->render();

            $shapedHtml = ArabicPdfHelper::reshapeHtml($html);

            $pdf = Pdf::loadHTML($shapedHtml)
                ->setPaper('a5', 'portrait')
                ->setOption(['defaultFont' => 'DejaVu Sans']);

            Storage::disk('local')->put($fileName, $pdf->output());
            $deposit->receipt_file_path = $fileName;
            $deposit->saveQuietly();
        }

        $disk = Storage::disk('local')->exists($fileName) ? 'local' : 'public';
        return Storage::disk($disk)->response($fileName);
    }
}
