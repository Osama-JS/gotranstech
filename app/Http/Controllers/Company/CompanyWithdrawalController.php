<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\WithdrawalRequest;
use App\Services\PdfGenerationService;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CompanyWithdrawalController extends Controller
{
    public function __construct(
        protected WithdrawalService $withdrawalService,
        protected PdfGenerationService $pdfService
    ) {}

    public function index(): Response
    {
        $company = Auth::user()->companyProfile;
        $fundingWallet = Auth::user()->company_funding_wallet;

        $withdrawals = WithdrawalRequest::where('company_id', $company->id)
            ->with('debt')
            ->latest()
            ->paginate(10);

        // Claimable funded tasks that have not yet been requested in any withdrawal
        $claimableTasks = Task::where('company_id', $company->id)
            ->where('status', 'funded')
            ->whereNull('withdrawal_request_id')
            ->latest()
            ->get();

        $stats = [
            'available_to_withdraw' => (float) $fundingWallet->available_balance,
            'current_balance' => (float) $fundingWallet->balance,
            'locked_balance' => (float) $fundingWallet->locked_balance,
            'total_withdrawn' => (float) WithdrawalRequest::where('company_id', $company->id)->where('status', 'approved')->sum('requested_amount'),
            'pending_withdrawals_amount' => (float) WithdrawalRequest::where('company_id', $company->id)->where('status', 'pending')->sum('requested_amount'),
            'pending_withdrawals_count' => WithdrawalRequest::where('company_id', $company->id)->where('status', 'pending')->count(),
            'approved_withdrawals_count' => WithdrawalRequest::where('company_id', $company->id)->where('status', 'approved')->count(),
            'claimable_tasks_count' => $claimableTasks->count(),
            'claimable_tasks_total' => (float) $claimableTasks->sum('funding_amount'),
        ];

        return Inertia::render('Company/Withdrawals/Index', [
            'withdrawals' => $withdrawals,
            'claimableTasks' => $claimableTasks,
            'fundingWallet' => $fundingWallet,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'task_ids' => 'required|array|min:1',
            'task_ids.*' => 'required|integer|exists:tasks,id',
            'company_signature' => 'nullable|string',
        ], [
            'task_ids.required' => 'يرجى تحديد مهمة واحدة على الأقل لسحب رصيد تمويلها.',
            'task_ids.min' => 'يرجى تحديد مهمة واحدة على الأقل.',
        ]);

        $company = Auth::user()->companyProfile;

        try {
            $withdrawal = $this->withdrawalService->createWithdrawalRequest(
                $company,
                $request->input('task_ids'),
                $request->input('company_signature')
            );

            return back()->with('success', "تم إرسال طلب سحب الرصيد رقم #{$withdrawal->request_number} بنجاح وتوليد السند المالي بصيغة PDF بانتظار اعتماد الإدارة.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    public function show(int $id): Response
    {
        $company = Auth::user()->companyProfile;
        $withdrawal = WithdrawalRequest::where('company_id', $company->id)
            ->with(['items.task', 'debt'])
            ->findOrFail($id);

        return Inertia::render('Company/Withdrawals/Show', [
            'withdrawal' => $withdrawal,
        ]);
    }

    public function downloadPdf(int $id)
    {
        $company = Auth::user()->companyProfile;
        $withdrawal = WithdrawalRequest::where('company_id', $company->id)->findOrFail($id);

        if (!$withdrawal->pdf_file_path || !Storage::disk('public')->exists($withdrawal->pdf_file_path)) {
            $this->pdfService->generateWithdrawalPdf($withdrawal);
        }

        return Storage::disk('public')->download($withdrawal->pdf_file_path, "withdrawal_{$withdrawal->request_number}.pdf");
    }

    public function viewPdf(int $id)
    {
        $company = Auth::user()->companyProfile;
        $withdrawal = WithdrawalRequest::where('company_id', $company->id)->findOrFail($id);

        if (!$withdrawal->pdf_file_path || !Storage::disk('public')->exists($withdrawal->pdf_file_path)) {
            $this->pdfService->generateWithdrawalPdf($withdrawal);
        }

        return Storage::disk('public')->response($withdrawal->pdf_file_path);
    }
}
