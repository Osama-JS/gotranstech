<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompanyTaskController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(Request $request): Response
    {
        $company = Auth::user()->companyProfile;
        $query = Task::where('company_id', $company->id)
            ->with(['fundedByInvestor', 'withdrawalRequest']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('task_number', 'like', "%{$search}%")
                  ->orWhere('external_task_id', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $tasks = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total_tasks' => Task::where('company_id', $company->id)->count(),
            'available_tasks' => Task::where('company_id', $company->id)->where('status', 'available')->count(),
            'funded_tasks' => Task::where('company_id', $company->id)->where('status', 'funded')->count(),
            'completed_tasks' => Task::where('company_id', $company->id)->where('status', 'completed')->count(),
            'cancelled_tasks' => Task::where('company_id', $company->id)->where('status', 'cancelled_by_company')->count(),
            'total_funding_amount' => (float) Task::where('company_id', $company->id)->whereIn('status', ['funded', 'completed'])->sum('funding_amount'),
            'claimable_count' => Task::where('company_id', $company->id)->where('status', 'funded')->whereNull('withdrawal_request_id')->count(),
            'claimable_amount' => (float) Task::where('company_id', $company->id)->where('status', 'funded')->whereNull('withdrawal_request_id')->sum('funding_amount'),
        ];

        return Inertia::render('Company/Tasks/Index', [
            'tasks' => $tasks,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function cancel(int $id)
    {
        $company = Auth::user()->companyProfile;
        $task = Task::where('company_id', $company->id)->findOrFail($id);

        if ($task->status !== 'available') {
            return back()->with('error', 'لا يمكن إلغاء هذه المهمة لأنها ليست في حالة الانتظار.');
        }

        $task->status = 'cancelled_by_company';
        $task->save();

        $this->auditLogService->log(
            'status_changed',
            $task,
            ['status' => 'available'],
            ['status' => 'cancelled_by_company'],
            "إلغاء المهمة #{$task->task_number} من قبل الشركة"
        );

        return back()->with('success', 'تم إلغاء المهمة بنجاح وإيقاف عرضها من منصة التمويل.');
    }
}
