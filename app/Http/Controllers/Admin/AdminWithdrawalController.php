<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use App\Models\WithdrawalRequest;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class AdminWithdrawalController extends Controller
{
    public function __construct(
        protected WithdrawalService $withdrawalService
    ) {}

    public function index(Request $request): Response
    {
        $query = WithdrawalRequest::with(['company.user', 'reviewer']);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                  ->orWhereHas('company', function ($c) use ($search) {
                      $c->where('company_name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('cr_number', 'like', "%{$search}%");
                  });
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

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $withdrawals = $query->latest()->paginate(15)->withQueryString();

        // Statistics
        $stats = [
            'total' => WithdrawalRequest::count(),
            'pending' => WithdrawalRequest::where('status', 'pending')->count(),
            'approved' => WithdrawalRequest::where('status', 'approved')->count(),
            'rejected' => WithdrawalRequest::where('status', 'rejected')->count(),
            'total_approved_amount' => WithdrawalRequest::where('status', 'approved')->sum('requested_amount'),
            'total_pending_amount' => WithdrawalRequest::where('status', 'pending')->sum('requested_amount'),
        ];

        $companies = CompanyProfile::select('id', 'company_name')->orderBy('company_name')->get();

        return Inertia::render('Admin/Withdrawals/Index', [
            'withdrawals' => $withdrawals,
            'stats' => $stats,
            'companies' => $companies,
            'filters' => $request->only(['search', 'status', 'company_id', 'date_from', 'date_to']),
        ]);
    }

    public function show(int $id): Response
    {
        $withdrawal = WithdrawalRequest::with([
            'company.user',
            'items.task',
            'debt',
            'reviewer'
        ])->findOrFail($id);

        return Inertia::render('Admin/Withdrawals/Show', [
            'withdrawal' => $withdrawal,
        ]);
    }

    public function approve(Request $request, int $id)
    {
        $withdrawal = WithdrawalRequest::findOrFail($id);

        $request->validate([
            'due_date' => 'required|date|after:today',
            'admin_signature' => 'nullable|string',
            'admin_notes' => 'nullable|string|max:500',
        ]);

        $this->withdrawalService->approveWithdrawalRequest(
            $withdrawal,
            Auth::user(),
            $request->input('due_date'),
            $request->input('admin_signature'),
            $request->input('admin_notes')
        );

        return back()->with('success', 'تم اعتماد طلب السحب بنجاح وقيد المديونية المستحقة وتوليد العقد الموقع.');
    }

    public function reject(Request $request, int $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $withdrawal = WithdrawalRequest::findOrFail($id);

        $this->withdrawalService->rejectWithdrawalRequest(
            $withdrawal,
            Auth::user(),
            $request->input('rejection_reason')
        );

        return back()->with('success', 'تم رفض طلب السحب وإلغاء قفل الرصيد.');
    }

    public function downloadPdf(int $id)
    {
        $withdrawal = WithdrawalRequest::findOrFail($id);

        if (!$withdrawal->pdf_file_path || !Storage::disk('public')->exists($withdrawal->pdf_file_path)) {
            // regenerate if missing
            app(\App\Services\PdfGenerationService::class)->generateWithdrawalPdf($withdrawal);
        }

        return Storage::disk('public')->download($withdrawal->pdf_file_path, "withdrawal_{$withdrawal->request_number}.pdf");
    }
}
