<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BankDeposit;
use App\Models\CompanyDebt;
use App\Models\CompanyProfile;
use App\Models\Task;
use App\Models\TaskInvestment;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $metrics = [
            'total_investors' => User::where('user_type', 'investor')->count(),
            'total_companies' => CompanyProfile::count(),
            'total_tasks_funded' => Task::where('status', 'funded')->count(),
            'total_invested_volume' => (float) TaskInvestment::sum('investment_amount'),
            'total_platform_revenue' => (float) TaskInvestment::sum('platform_gross_commission'),
            'total_investor_payouts' => (float) TaskInvestment::sum('investor_commission_amount'),
            'pending_bank_deposits' => BankDeposit::where('status', 'pending')->count(),
            'pending_withdrawals' => WithdrawalRequest::where('status', 'pending')->count(),
            'outstanding_debts' => (float) CompanyDebt::where('status', '!=', 'paid')->sum('remaining_amount'),
        ];

        $recentTasks = Task::with(['company', 'fundedByInvestor'])
            ->latest()
            ->take(8)
            ->get();

        $recentTransactions = WalletTransaction::with('user')
            ->latest()
            ->take(8)
            ->get();

        $recentAudits = AuditLog::with('user')
            ->latest('created_at')
            ->take(6)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => $metrics,
            'recentTasks' => $recentTasks,
            'recentTransactions' => $recentTransactions,
            'recentAudits' => $recentAudits,
        ]);
    }
}
