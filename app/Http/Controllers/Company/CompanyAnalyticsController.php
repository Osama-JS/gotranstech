<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyDebt;
use App\Models\Task;
use App\Models\WithdrawalRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CompanyAnalyticsController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $company = $user->companyProfile;

        if (!$company) {
            return redirect()->route('company.dashboard')->with('error', 'الملف التعريفي للشركة غير مكتمل.');
        }

        $period = $request->query('period', '30days');

        $startDate = match ($period) {
            '7days' => Carbon::now()->subDays(7)->startOfDay(),
            '30days' => Carbon::now()->subDays(30)->startOfDay(),
            '6months' => Carbon::now()->subMonths(6)->startOfDay(),
            '1year' => Carbon::now()->subYear()->startOfDay(),
            default => Carbon::now()->subDays(30)->startOfDay(),
        };

        // Date grouping for charts
        $isPostgres = DB::getDriverName() === 'pgsql';
        $dateFormat = match ($period) {
            '7days', '30days' => $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM-DD')" : "DATE_FORMAT(created_at, '%Y-%m-%d')",
            default => $isPostgres ? "TO_CHAR(created_at, 'YYYY-MM')" : "DATE_FORMAT(created_at, '%Y-%m')",
        };

        // KPI Calculations
        $tasksQuery = Task::where('company_id', $company->id)->where('created_at', '>=', $startDate);
        $totalTasksCount = (clone $tasksQuery)->count();
        $totalFundingRequested = (float) (clone $tasksQuery)->sum('funding_amount');
        $completedTasksCount = (clone $tasksQuery)->whereIn('status', ['funded', 'completed'])->count();
        $taskFulfillmentRate = $totalTasksCount > 0 ? round(($completedTasksCount / $totalTasksCount) * 100, 1) : 0;

        $totalWithdrawalsApproved = (float) WithdrawalRequest::where('company_id', $company->id)
            ->where('status', 'approved')
            ->where('created_at', '>=', $startDate)
            ->sum('requested_amount');

        $totalDebtsPaid = (float) CompanyDebt::where('company_id', $company->id)
            ->where('created_at', '>=', $startDate)
            ->sum('paid_amount');

        $totalOutstandingDebt = (float) CompanyDebt::where('company_id', $company->id)
            ->where('status', '!=', 'paid')
            ->sum('remaining_amount');

        $creditLimit = (float) ($company->credit_limit ?? 100000);
        $creditUtilizationRate = $creditLimit > 0 ? round(($totalOutstandingDebt / $creditLimit) * 100, 1) : 0;

        // 1. Task Operations Trend (Funding Volume over time)
        $tasksTrend = Task::selectRaw("{$dateFormat} as date, COUNT(*) as count, SUM(funding_amount) as total_amount")
            ->where('company_id', $company->id)
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 2. Tasks Status Breakdown
        $statusDistribution = Task::selectRaw('status, COUNT(*) as count, COALESCE(SUM(funding_amount), 0) as total_amount')
            ->where('company_id', $company->id)
            ->where('created_at', '>=', $startDate)
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // 3. Top Logistics Delivery Routes (Pickup -> Dropoff)
        $routeDistribution = Task::selectRaw('pickup_city, dropoff_city, COUNT(*) as count, SUM(funding_amount) as total_amount')
            ->where('company_id', $company->id)
            ->where('created_at', '>=', $startDate)
            ->whereNotNull('pickup_city')
            ->groupBy('pickup_city', 'dropoff_city')
            ->orderByDesc('count')
            ->take(6)
            ->get();

        // 4. Cash Flow: Withdrawals vs Repayments Trend
        $withdrawalsTrend = WithdrawalRequest::selectRaw("{$dateFormat} as date, SUM(requested_amount) as total_withdrawn")
            ->where('company_id', $company->id)
            ->where('status', 'approved')
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $repaymentsTrend = CompanyDebt::selectRaw("{$dateFormat} as date, SUM(paid_amount) as total_repaid")
            ->where('company_id', $company->id)
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        $allDates = collect($withdrawalsTrend->keys())->merge($repaymentsTrend->keys())->unique()->sort()->values();
        $cashflowTrend = $allDates->map(function ($date) use ($withdrawalsTrend, $repaymentsTrend) {
            return [
                'date' => $date,
                'withdrawn' => (float) ($withdrawalsTrend[$date]->total_withdrawn ?? 0),
                'repaid' => (float) ($repaymentsTrend[$date]->total_repaid ?? 0),
            ];
        });

        return Inertia::render('Company/Analytics/Index', [
            'period' => $period,
            'kpis' => [
                'total_tasks_count' => $totalTasksCount,
                'total_funding_requested' => $totalFundingRequested,
                'completed_tasks_count' => $completedTasksCount,
                'task_fulfillment_rate' => $taskFulfillmentRate,
                'total_withdrawals_approved' => $totalWithdrawalsApproved,
                'total_debts_paid' => $totalDebtsPaid,
                'total_outstanding_debt' => $totalOutstandingDebt,
                'credit_limit' => $creditLimit,
                'credit_utilization_rate' => $creditUtilizationRate,
                'platform_commission_rate' => (float) ($company->platform_commission_rate ?? 10),
            ],
            'tasksTrend' => $tasksTrend,
            'statusDistribution' => $statusDistribution,
            'routeDistribution' => $routeDistribution,
            'cashflowTrend' => $cashflowTrend,
        ]);
    }
}
