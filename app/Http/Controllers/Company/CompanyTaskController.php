<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\TestTask;
use App\Services\AuditLogService;
use App\Services\WebhookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompanyTaskController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected WebhookService $webhookService
    ) {}

    public function index(Request $request): Response
    {
        $company = Auth::user()->companyProfile;
        
        // Mode: 'test' (sandbox) or 'live'
        $mode = $request->input('mode');
        if (!$mode) {
            $mode = $company->isTestMode() ? 'test' : 'live';
        }
        $isTest = ($mode === 'test');

        if ($isTest) {
            $query = TestTask::where('company_id', $company->id);

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
                'total_tasks' => TestTask::where('company_id', $company->id)->count(),
                'available_tasks' => TestTask::where('company_id', $company->id)->where('status', 'available')->count(),
                'funded_tasks' => TestTask::where('company_id', $company->id)->where('status', 'funded')->count(),
                'completed_tasks' => TestTask::where('company_id', $company->id)->where('status', 'completed')->count(),
                'cancelled_tasks' => TestTask::where('company_id', $company->id)->whereIn('status', ['cancelled_by_company', 'cancelled'])->count(),
                'total_funding_amount' => (float) TestTask::where('company_id', $company->id)->whereIn('status', ['funded', 'completed'])->sum('funding_amount'),
                'claimable_count' => 0,
                'claimable_amount' => 0,
                'current_mode' => 'test',
                'test_tasks_count' => TestTask::where('company_id', $company->id)->count(),
                'live_tasks_count' => Task::where('company_id', $company->id)->count(),
            ];
        } else {
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
                'current_mode' => 'live',
                'test_tasks_count' => TestTask::where('company_id', $company->id)->count(),
                'live_tasks_count' => Task::where('company_id', $company->id)->count(),
            ];
        }

        return Inertia::render('Company/Tasks/Index', [
            'tasks' => $tasks,
            'stats' => $stats,
            'filters' => array_merge($request->only(['search', 'status']), ['mode' => $mode]),
        ]);
    }

    public function cancel(Request $request, int $id)
    {
        $company = Auth::user()->companyProfile;
        
        $task = Task::where('company_id', $company->id)->find($id);
        $isTest = false;

        if (!$task) {
            $task = TestTask::where('company_id', $company->id)->findOrFail($id);
            $isTest = true;
        }

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
            "إلغاء المهمة #{$task->task_number} من قبل الشركة" . ($isTest ? ' (بيئة الاختبار)' : '')
        );

        if (!$isTest) {
            // Notify Admin of task cancellation
            \App\Services\NotificationDispatcherService::dispatch(
                'admin.task_cancelled',
                "إلغاء مهمة شحن: #{$task->task_number}",
                "قامت الشركة اللوجستية ({$company->company_name}) بإلغاء المهمة رقم #{$task->task_number} وسحبها من سوق التمويل.",
                route('admin.tasks.show', $task->id, false),
                ['task_id' => $task->id, 'company_id' => $company->id]
            );
        }

        // إرسال إشعار الويب هوك إلى نظام SafeDests لتحديث حالة المهمة فورياً
        try {
            $this->webhookService->dispatchTaskCancelled($task, 'cancelled_by_company');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error("CompanyTaskController Webhook dispatch error: " . $e->getMessage());
        }

        return back()->with('success', 'تم إلغاء المهمة بنجاح وإيقاف عرضها من منصة التمويل.');
    }
}
