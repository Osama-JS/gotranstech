<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankDeposit;
use App\Models\CompanyProfile;
use App\Models\Task;
use App\Models\TaskInvestment;
use App\Models\User;
use App\Models\WithdrawalRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $period = $request->query('period', '30days');

        $startDate = match ($period) {
            '7days' => Carbon::now()->subDays(7)->startOfDay(),
            '30days' => Carbon::now()->subDays(30)->startOfDay(),
            '6months' => Carbon::now()->subMonths(6)->startOfDay(),
            '1year' => Carbon::now()->subYear()->startOfDay(),
            default => Carbon::now()->subDays(30)->startOfDay(),
        };

        // Summary KPI Metrics
        $totalFundingVolume = (float) TaskInvestment::where('created_at', '>=', $startDate)->sum('investment_amount');
        $totalPlatformCommission = (float) TaskInvestment::where('created_at', '>=', $startDate)->sum('platform_net_commission');
        $totalInvestorProfits = (float) TaskInvestment::where('created_at', '>=', $startDate)->sum('investor_commission_amount');
        $totalCompletedTasks = Task::where('created_at', '>=', $startDate)->where('status', 'funded')->count();

        $totalApprovedDeposits = (float) BankDeposit::where('created_at', '>=', $startDate)->where('status', 'approved')->sum('amount');
        $totalApprovedWithdrawals = (float) WithdrawalRequest::where('created_at', '>=', $startDate)->where('status', 'approved')->sum('requested_amount');

        $avgTaskValue = $totalCompletedTasks > 0 ? ($totalFundingVolume / $totalCompletedTasks) : 0;
        $netPlatformLiquidity = $totalApprovedDeposits - $totalApprovedWithdrawals;

        // PostgreSQL friendly date format
        $isPostgres = DB::getDriverName() === 'pgsql';
        $dateFormat = match ($period) {
            '7days', '30days' => $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM-DD')" : "DATE_FORMAT(created_at, '%Y-%m-%d')",
            default => $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM')" : "DATE_FORMAT(created_at, '%Y-%m')",
        };

        // 1. Funding & Earnings Trend
        $fundingTrend = TaskInvestment::selectRaw("{$dateFormat} as date, SUM(investment_amount) as total_funded, SUM(platform_net_commission) as commission_earned, SUM(investor_commission_amount) as investor_profits, COUNT(*) as count")
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 2. City Logistics Distribution
        $cityDistribution = Task::selectRaw('pickup_city as city, COUNT(*) as tasks_count, COALESCE(SUM(funding_amount), 0) as total_amount')
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('pickup_city')
            ->groupBy('pickup_city')
            ->orderByDesc('tasks_count')
            ->take(8)
            ->get();

        // 3. Inflow vs Outflow Cashflow Trend
        $inflowTrend = BankDeposit::selectRaw("{$dateFormat} as date, SUM(amount) as total_inflow")
            ->where('created_at', '>=', $startDate)
            ->where('status', 'approved')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $outflowTrend = WithdrawalRequest::selectRaw("{$dateFormat} as date, SUM(requested_amount) as total_outflow")
            ->where('created_at', '>=', $startDate)
            ->where('status', 'approved')
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        // Merge dates for unified cashflow chart
        $allCashflowDates = collect($inflowTrend->keys())->merge($outflowTrend->keys())->unique()->sort()->values();
        $cashflowTrend = $allCashflowDates->map(function ($date) use ($inflowTrend, $outflowTrend) {
            return [
                'date' => $date,
                'inflow' => (float) ($inflowTrend[$date]->total_inflow ?? 0),
                'outflow' => (float) ($outflowTrend[$date]->total_outflow ?? 0),
            ];
        });

        // 4. User Registrations Trend
        $userGrowthTrend = User::selectRaw("{$dateFormat} as date, user_type, COUNT(*) as count")
            ->where('created_at', '>=', $startDate)
            ->whereIn('user_type', ['investor', 'company'])
            ->groupBy('date', 'user_type')
            ->orderBy('date', 'ASC')
            ->get();

        // 5. Tasks Status Breakdown
        $taskStatusCounts = Task::selectRaw('status, COUNT(*) as count, COALESCE(SUM(funding_amount), 0) as total_amount')
            ->where('created_at', '>=', $startDate)
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // 6. Top 5 Most Active Investors
        $topInvestors = User::where('user_type', 'investor')
            ->withCount(['investments as total_investments_count' => function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            }])
            ->withSum(['investments as total_invested_amount' => function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            }], 'investment_amount')
            ->orderByDesc('total_invested_amount')
            ->take(5)
            ->get(['id', 'name', 'email', 'phone', 'phone_country_code', 'is_active']);

        // 7. Top 5 Most Active Logistics Companies
        $topCompanies = CompanyProfile::with('user')
            ->withCount(['tasks as total_tasks_count' => function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            }])
            ->withSum(['tasks as total_tasks_amount' => function ($q) use ($startDate) {
                $q->where('created_at', '>=', $startDate);
            }], 'funding_amount')
            ->orderByDesc('total_tasks_amount')
            ->take(5)
            ->get();

        return Inertia::render('Admin/Analytics/Index', [
            'period' => $period,
            'kpis' => [
                'total_funding_volume' => $totalFundingVolume,
                'total_platform_commission' => $totalPlatformCommission,
                'total_investor_profits' => $totalInvestorProfits,
                'total_completed_tasks' => $totalCompletedTasks,
                'total_approved_deposits' => $totalApprovedDeposits,
                'total_approved_withdrawals' => $totalApprovedWithdrawals,
                'avg_task_value' => $avgTaskValue,
                'net_platform_liquidity' => $netPlatformLiquidity,
            ],
            'fundingTrend' => $fundingTrend,
            'cityDistribution' => $cityDistribution,
            'cashflowTrend' => $cashflowTrend,
            'userGrowthTrend' => $userGrowthTrend,
            'taskStatusCounts' => $taskStatusCounts,
            'topInvestors' => $topInvestors,
            'topCompanies' => $topCompanies,
        ]);
    }
}
