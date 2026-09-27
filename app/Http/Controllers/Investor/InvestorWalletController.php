<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\BankDeposit;
use App\Models\TaskInvestment;
use App\Models\WalletTransaction;
use App\Services\EncryptedSettingService;
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
            'investorProfile' => $user->investorProfile,
        ]);
    }

    /**
     * Request Commission Profit Withdrawal (طلب سحب أرباح)
     */
    public function requestCommissionWithdrawal(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $commissionWallet = $user->commission_wallet;

        $validated = $request->validate([
            'amount' => [
                'required',
                'numeric',
                'min:50',
                'max:' . ($commissionWallet->available_balance ?? 0),
            ],
            'bank_name' => 'required|string|max:100',
            'iban' => 'required|string|max:50',
            'account_holder' => 'required|string|max:150',
        ], [
            'amount.min' => 'الحد الأدنى لطلب سحب الأرباح هو 50 ر.س.',
            'amount.max' => 'المبلغ المطلوب يتجاوز الرصيد المتاح في محفظة الأرباح.',
            'iban.required' => 'يرجى إدخال رقم الآيبان البنكي للسحب.',
        ]);

        $amount = (float) $validated['amount'];

        DB::transaction(function () use ($user, $commissionWallet, $amount, $validated) {
            $balanceBefore = (float) $commissionWallet->balance;
            $commissionWallet->balance -= $amount;
            $commissionWallet->save();

            WalletTransaction::create([
                'wallet_id' => $commissionWallet->id,
                'user_id' => $user->id,
                'transaction_type' => 'debit',
                'amount' => -$amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $commissionWallet->balance,
                'reference_type' => 'commission_withdrawal',
                'reference_id' => null,
                'description' => "طلب سحب أرباح إلى حساب بنك {$validated['bank_name']} (آيبان: {$validated['iban']})",
                'status' => 'pending',
                'metadata' => [
                    'bank_name' => $validated['bank_name'],
                    'iban' => $validated['iban'],
                    'account_holder' => $validated['account_holder'],
                    'requested_at' => now()->toIso8601String(),
                ],
            ]);
        });

        return back()->with('success', 'تم تقديم طلب سحب الأرباح بنجاح، سيتم مراجعته والتحويل لحسابك البنكي المعتمد.');
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
        $path = $request->file('receipt_file')->store('receipts', 'public');

        BankDeposit::create([
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

        return back()->with('success', 'تم رفع إيصال التحويل البنكي بنجاح. سيتم مراجعته وإيداع المبلغ في محفظتك فور اعتماده من الإدارة.');
    }

    public function prepareHyperPay(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:50',
            'payment_brand' => 'required|in:MADA,VISA,MASTER,APPLEPAY',
        ]);

        $user = Auth::user();

        try {
            $checkoutData = $this->hyperPayService->prepareCheckout(
                $user,
                (float) $validated['amount'],
                $validated['payment_brand']
            );

            return response()->json($checkoutData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    public function hyperPayCallback(Request $request)
    {
        $checkoutId = $request->input('id') ?? $request->input('checkout_id');
        $resourcePath = $request->input('resourcePath');

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

        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        // Generate fallback receipt PDF
        $fileName = 'deposits/' . ($deposit->deposit_number ?: 'DEP-' . $deposit->id) . '_receipt.pdf';

        if (!Storage::disk('public')->exists($fileName)) {
            $html = view('pdf.deposit_receipt', [
                'deposit' => $deposit,
                'user' => $deposit->user,
            ])->render();

            $shapedHtml = ArabicPdfHelper::reshapeHtml($html);

            $pdf = Pdf::loadHTML($shapedHtml)
                ->setPaper('a5', 'portrait')
                ->setOption(['defaultFont' => 'DejaVu Sans']);

            Storage::disk('public')->put($fileName, $pdf->output());
            $deposit->receipt_file_path = $fileName;
            $deposit->saveQuietly();
        }

        return Storage::disk('public')->response($fileName);
    }
}
