<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminTaskController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Task::with(['company', 'fundedByInvestor', 'investment']);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('task_number', 'like', "%{$search}%")
                  ->orWhere('external_task_id', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhere('pickup_city', 'like', "%{$search}%")
                  ->orWhere('dropoff_city', 'like', "%{$search}%")
                  ->orWhereHas('company', fn($c) => $c->where('company_name', 'like', "%{$search}%"))
                  ->orWhereHas('fundedByInvestor', fn($i) => $i->where('name', 'like', "%{$search}%"));
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

        // Investor Filter
        if ($investorId = $request->input('investor_id')) {
            $query->where('funded_by_investor_id', $investorId);
        }

        // Amount Range
        if ($minAmount = $request->input('min_amount')) {
            $query->where('funding_amount', '>=', $minAmount);
        }
        if ($maxAmount = $request->input('max_amount')) {
            $query->where('funding_amount', '<=', $maxAmount);
        }

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $tasks = $query->latest()->paginate(15)->withQueryString();

        // Stats
        $stats = [
            'total' => Task::count(),
            'open' => Task::whereIn('status', ['open', 'available'])->count(),
            'funded' => Task::where('status', 'funded')->count(),
            'completed' => Task::where('status', 'completed')->count(),
            'cancelled' => Task::where('status', 'cancelled')->count(),
            'expired' => Task::where('status', 'expired')->count(),
            'total_volume' => Task::sum('funding_amount'),
            'total_funded_volume' => Task::where('status', 'funded')->sum('funding_amount'),
            'total_platform_commission' => Task::where('status', 'funded')->sum('platform_commission_amount'),
        ];

        $companies = CompanyProfile::select('id', 'company_name')->orderBy('company_name')->get();
        $investors = User::where('user_type', 'investor')->select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Admin/Tasks/Index', [
            'tasks' => $tasks,
            'stats' => $stats,
            'companies' => $companies,
            'investors' => $investors,
            'filters' => $request->only(['search', 'status', 'company_id', 'investor_id', 'min_amount', 'max_amount', 'date_from', 'date_to']),
        ]);
    }

    public function show(int $id): Response
    {
        $task = Task::with(['company.user', 'fundedByInvestor', 'investment', 'withdrawalRequest'])
            ->findOrFail($id);

        return Inertia::render('Admin/Tasks/Show', [
            'task' => $task,
        ]);
    }
}
