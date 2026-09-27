<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\TaskInvestment;
use App\Models\WalletTransaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvestorAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $period = $request->query('period', '30days');

        $startDate = match ($period) {
            '7days' => Carbon::now()->subDays(7)->startOfDay(),
            '30days' => Carbon::now()->subDays(30)->startOfDay(),
            '6months' => Carbon::now()->subMonths(6)->startOfDay(),
            '1year' => Carbon::now()->subYear()->startOfDay(),
            default => Carbon::now()->subDays(30)->startOfDay(),
        };

        // Wallets
        $investmentWallet = $user->investment_wallet;
        $commissionWallet = $user->commission_wallet;

        // Base query for user's investments
        $investmentsQuery = TaskInvestment::where('investor_id', $user->id)
            ->where('created_at', '>=', $startDate);

        $totalInvested = (float) (clone $investmentsQuery)->sum('investment_amount');
        $totalProfits = (float) (clone $investmentsQuery)->sum('investor_commission_amount');
        $totalInvestmentsCount = (clone $investmentsQuery)->count();
        $avgInvestmentPerTask = $totalInvestmentsCount > 0 ? ($totalInvested / $totalInvestmentsCount) : 0;
        $roiPercentage = $totalInvested > 0 ? (($totalProfits / $totalInvested) * 100) : 0;

        // Date grouping for charts
        $isPostgres = DB::getDriverName() === 'pgsql';
        $dateFormat = match ($period) {
            '7days', '30days' => $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM-DD')" : "DATE_FORMAT(created_at, '%Y-%m-%d')",
            default => $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM')" : "DATE_FORMAT(created_at, '%Y-%m')",
        };

        // 1. Performance over time (Funding vs Return)
        $performanceTrend = TaskInvestment::selectRaw("{$dateFormat} as date, SUM(investment_amount) as total_funded, SUM(investor_commission_amount) as total_profit, COUNT(*) as tasks_count")
            ->where('investor_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 2. City / Geographic Allocation
        $cityAllocation = TaskInvestment::join('tasks', 'task_investments.task_id', '=', 'tasks.id')
            ->where('task_investments.investor_id', $user->id)
            ->where('task_investments.created_at', '>=', $startDate)
            ->whereNotNull('tasks.pickup_city')
            ->selectRaw('tasks.pickup_city as city, COUNT(*) as count, SUM(task_investments.investment_amount) as total_invested, SUM(task_investments.investor_commission_amount) as total_profit')
            ->groupBy('tasks.pickup_city')
            ->orderByDesc('total_invested')
            ->take(6)
            ->get();

        // 3. Top Logistics Companies Funded
        $companyPerformance = TaskInvestment::join('tasks', 'task_investments.task_id', '=', 'tasks.id')
            ->join('company_profiles', 'tasks.company_id', '=', 'company_profiles.id')
            ->where('task_investments.investor_id', $user->id)
            ->where('task_investments.created_at', '>=', $startDate)
            ->selectRaw('company_profiles.company_name, COUNT(*) as tasks_count, SUM(task_investments.investment_amount) as total_invested, SUM(task_investments.investor_commission_amount) as total_profit')
            ->groupBy('company_profiles.id', 'company_profiles.company_name')
            ->orderByDesc('total_profit')
            ->take(5)
            ->get();

        // 4. Wallet Cashflow Trend
        $cashflowTrend = WalletTransaction::selectRaw("{$dateFormat} as date, 
            SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as credits,
            SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as debits")
            ->where('user_id', $user->id)
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        return Inertia::render('Investor/Analytics/Index', [
            'period' => $period,
            'kpis' => [
                'total_invested' => $totalInvested,
                'total_profits' => $totalProfits,
                'roi_percentage' => round($roiPercentage, 2),
                'total_investments_count' => $totalInvestmentsCount,
                'avg_investment_per_task' => round($avgInvestmentPerTask, 2),
                'available_balance' => (float) ($investmentWallet?->available_balance ?? 0),
                'commission_balance' => (float) ($commissionWallet?->balance ?? 0),
                'all_time_invested' => (float) TaskInvestment::where('investor_id', $user->id)->sum('investment_amount'),
                'all_time_profits' => (float) TaskInvestment::where('investor_id', $user->id)->sum('investor_commission_amount'),
            ],
            'performanceTrend' => $performanceTrend,
            'cityAllocation' => $cityAllocation,
            'companyPerformance' => $companyPerformance,
            'cashflowTrend' => $cashflowTrend,
        ]);
    }
}
