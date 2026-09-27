<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyDebt;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CompanyWalletController extends Controller
{
    /**
     * Funding & Withdrawals Wallet (محفظة التمويل والمسحوبات)
     */
    public function fundingWallet(Request $request): Response
    {
        $user = Auth::user();
        $company = $user->companyProfile;
        $fundingWallet = $user->company_funding_wallet;

        // Transactions specifically for company funding wallet
        $transactions = WalletTransaction::where('wallet_id', $fundingWallet->id)
            ->with(['reference'])
            ->latest()
            ->paginate(15);

        // Withdrawal requests with pdf document links
        $withdrawals = WithdrawalRequest::where('company_id', $company->id)
            ->with(['items.task'])
            ->latest()
            ->paginate(10);

        // Calculate detailed statistics for funding wallet
        $totalFundingReceived = (float) WalletTransaction::where('wallet_id', $fundingWallet->id)
            ->where('amount', '>', 0)
            ->sum('amount');

        $totalWithdrawn = (float) WithdrawalRequest::where('company_id', $company->id)
            ->where('status', 'approved')
            ->sum('requested_amount');

        $pendingWithdrawals = WithdrawalRequest::where('company_id', $company->id)
            ->where('status', 'pending');

        $pendingCount = (clone $pendingWithdrawals)->count();
        $pendingAmount = (float) (clone $pendingWithdrawals)->sum('requested_amount');
        $approvedCount = WithdrawalRequest::where('company_id', $company->id)->where('status', 'approved')->count();

        return Inertia::render('Company/Wallet/FundingWallet', [
            'wallet' => $fundingWallet,
            'debtWallet' => $user->company_debt_wallet,
            'stats' => [
                'current_balance' => (float) $fundingWallet->balance,
                'available_balance' => (float) $fundingWallet->available_balance,
                'total_funding_received' => $totalFundingReceived,
                'total_withdrawn' => $totalWithdrawn,
                'pending_count' => $pendingCount,
                'pending_amount' => $pendingAmount,
                'approved_count' => $approvedCount,
            ],
            'transactions' => $transactions,
            'withdrawals' => $withdrawals,
            'company' => $company,
        ]);
    }

    /**
     * Debt & Repayments Wallet (محفظة الديون والالتزامات)
     */
    public function debtWallet(Request $request): Response
    {
        $user = Auth::user();
        $company = $user->companyProfile;
        $debtWallet = $user->company_debt_wallet;

        // Debts records with linked withdrawal requests and PDF documents
        $debts = CompanyDebt::where('company_id', $company->id)
            ->with(['withdrawalRequest'])
            ->orderByRaw("CASE WHEN status = 'overdue' THEN 1 WHEN status = 'pending' THEN 2 ELSE 3 END")
            ->orderBy('due_date', 'asc')
            ->paginate(10);

        // Transactions specifically for debt wallet
        $transactions = WalletTransaction::where('wallet_id', $debtWallet->id)
            ->with(['reference'])
            ->latest()
            ->paginate(15);

        // Calculate detailed statistics
        $totalOutstanding = (float) CompanyDebt::where('company_id', $company->id)
            ->where('status', '!=', 'paid')
            ->sum('remaining_amount');

        $totalPaid = (float) CompanyDebt::where('company_id', $company->id)
            ->sum('paid_amount');

        $creditLimit = (float) ($company->credit_limit ?? 100000);
        $remainingCredit = max(0, $creditLimit - $totalOutstanding);
        $creditUtilizationRate = $creditLimit > 0 ? round(($totalOutstanding / $creditLimit) * 100, 1) : 0;

        $overdueCount = CompanyDebt::where('company_id', $company->id)
            ->where('status', '!=', 'paid')
            ->where('due_date', '<', now())
            ->count();

        return Inertia::render('Company/Wallet/DebtWallet', [
            'wallet' => $debtWallet,
            'fundingWallet' => $user->company_funding_wallet,
            'stats' => [
                'total_outstanding' => $totalOutstanding,
                'total_paid' => $totalPaid,
                'credit_limit' => $creditLimit,
                'remaining_credit' => $remainingCredit,
                'credit_utilization_rate' => $creditUtilizationRate,
                'overdue_count' => $overdueCount,
                'active_debts_count' => CompanyDebt::where('company_id', $company->id)->where('status', '!=', 'paid')->count(),
            ],
            'debts' => $debts,
            'transactions' => $transactions,
            'company' => $company,
        ]);
    }

    /**
     * Submit Repayment Proof for a Debt (سداد التزام مع رفع الإيصال)
     */
    public function submitRepayment(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'debt_id' => 'required|exists:company_debts,id',
            'amount' => 'required|numeric|min:1',
            'bank_name' => 'required|string|max:100',
            'reference_number' => 'nullable|string|max:50',
            'receipt_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ], [
            'amount.required' => 'يرجى إدخال مبلغ السداد',
            'receipt_file.required' => 'يرجى إرفاق صورة أو مستند إيصال السداد',
        ]);

        $user = Auth::user();
        $company = $user->companyProfile;
        $debt = CompanyDebt::where('id', $validated['debt_id'])->where('company_id', $company->id)->firstOrFail();

        $path = $request->file('receipt_file')->store('repayments', 'public');
        $repaidAmount = (float) $validated['amount'];

        DB::transaction(function () use ($debt, $repaidAmount, $validated, $path, $user) {
            $debt->paid_amount += $repaidAmount;
            $debt->remaining_amount = max(0, $debt->remaining_amount - $repaidAmount);
            if ($debt->remaining_amount <= 0) {
                $debt->status = 'paid';
                $debt->settled_at = now();
            }
            $debt->save();

            // Record transaction in debt wallet
            $debtWallet = $user->company_debt_wallet;
            $balanceBefore = (float) $debtWallet->balance;
            $debtWallet->balance -= $repaidAmount;
            $debtWallet->save();

            WalletTransaction::create([
                'wallet_id' => $debtWallet->id,
                'user_id' => $user->id,
                'transaction_type' => 'credit',
                'amount' => -$repaidAmount,
                'balance_before' => $balanceBefore,
                'balance_after' => $debtWallet->balance,
                'reference_type' => 'company_repayment',
                'reference_id' => $debt->id,
                'description' => "سداد دفعة من التزام التمويل سند #{$debt->withdrawal_request_id} عبر {$validated['bank_name']}",
                'status' => 'completed',
                'metadata' => [
                    'bank_name' => $validated['bank_name'],
                    'reference_number' => $validated['reference_number'] ?? null,
                    'receipt_path' => $path,
                    'debt_id' => $debt->id,
                ],
            ]);
        });

        return back()->with('success', 'تم تسجيل إيصال السداد وتحديث رصيد الالتزام بنجاح.');
    }
}
