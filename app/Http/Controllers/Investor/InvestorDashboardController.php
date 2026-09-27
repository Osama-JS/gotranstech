<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use App\Models\Task;
use App\Models\TaskInvestment;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestorDashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $investmentWallet = $user->investment_wallet;
        $commissionWallet = $user->commission_wallet;

        $stats = [
            'investment_balance' => (float) ($investmentWallet?->balance ?? 0),
            'investment_available' => (float) ($investmentWallet?->available_balance ?? 0),
            'commission_balance' => (float) ($commissionWallet?->balance ?? 0),
            'total_investments_count' => TaskInvestment::where('investor_id', $user->id)->count(),
            'total_invested_amount' => (float) TaskInvestment::where('investor_id', $user->id)->sum('investment_amount'),
            'total_earnings_earned' => (float) TaskInvestment::where('investor_id', $user->id)->sum('investor_commission_amount'),
            'active_available_tasks' => Task::where('status', 'available')->where('expires_at', '>', now())->count(),
        ];

        $recentInvestments = TaskInvestment::with('task.company')
            ->where('investor_id', $user->id)
            ->latest()
            ->take(6)
            ->get();

        $recentTransactions = WalletTransaction::where('user_id', $user->id)
            ->latest()
            ->take(8)
            ->get();

        $liveTasks = Task::with('company')
            ->where('status', 'available')
            ->where('expires_at', '>', now())
            ->latest()
            ->take(4)
            ->get();

        $formTemplate = FormTemplate::with('fields')
            ->where('applies_to', 'investor')
            ->where('is_active', true)
            ->latest()
            ->first();

        $contract = \App\Models\Contract::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->orWhere(function ($q) use ($user) {
                    $partyId = $user->investorProfile?->id ?? $user->id;
                    $q->where('party_type', 'investor')->where('party_id', $partyId);
                });
        })->latest()->first();

        return Inertia::render('Investor/Dashboard', [
            'stats' => $stats,
            'recentInvestments' => $recentInvestments,
            'recentTransactions' => $recentTransactions,
            'liveTasks' => $liveTasks,
            'formTemplate' => $formTemplate,
            'contract' => $contract,
        ]);
    }
}
