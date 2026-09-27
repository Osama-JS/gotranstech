<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminContractController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(Request $request): Response
    {
        $query = Contract::with(['user', 'signer']);

        // Search
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('contract_number', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        if ($type = $request->input('party_type')) {
            $query->where('party_type', $type);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('start_date', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('start_date', '<=', $dateTo);
        }

        $contracts = $query->latest()->paginate(15)->withQueryString();

        // Statistics
        $stats = [
            'total' => Contract::count(),
            'active' => Contract::where('status', 'active')->count(),
            'pending_signature' => Contract::where('status', 'pending_signature')->count(),
            'terminated' => Contract::where('status', 'terminated')->count(),
            'investor_contracts' => Contract::where('party_type', 'investor')->count(),
            'company_contracts' => Contract::where('party_type', 'company')->count(),
        ];

        return Inertia::render('Admin/Contracts/Index', [
            'contracts' => $contracts,
            'stats' => $stats,
            'filters' => $request->only(['search', 'party_type', 'status', 'date_from', 'date_to']),
        ]);
    }

    public function create(): Response
    {
        $users = User::whereIn('user_type', ['investor', 'company'])
            ->select('id', 'name', 'email', 'user_type', 'country_code', 'phone')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Contracts/Create', [
            'users' => $users,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'contract_type' => 'required|string',
            'title' => 'required|string|max:255',
            'terms_text' => 'required|string',
            'commission_rate' => 'required|numeric|min:0|max:100',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $user = User::findOrFail($validated['user_id']);
        $partyType = $user->user_type;
        $partyId = $partyType === 'company' 
            ? ($user->companyProfile->id ?? $user->id)
            : ($user->investorProfile->id ?? $user->id);

        $contract = Contract::create([
            'contract_number' => Contract::generateContractNumber($partyType),
            'party_type' => $partyType,
            'party_id' => $partyId,
            'user_id' => $user->id,
            'contract_type' => $validated['contract_type'],
            'title' => $validated['title'],
            'terms_text' => $validated['terms_text'],
            'commission_rate' => $validated['commission_rate'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'status' => 'active',
            'signed_by_user_id' => Auth::id(),
            'signed_at' => now(),
        ]);

        $this->auditLogService->log(
            'created',
            $contract,
            [],
            ['contract_number' => $contract->contract_number],
            "إنشاء وتوقيع عقد جديد #{$contract->contract_number} مع {$user->name}"
        );

        return redirect()->route('admin.contracts.index')->with('success', 'تم إنشاء العقد وتوثيقه بنجاح.');
    }

    public function show(int $id): Response
    {
        $contract = Contract::with(['user', 'signer'])->findOrFail($id);

        return Inertia::render('Admin/Contracts/Show', [
            'contract' => $contract,
        ]);
    }

    public function downloadPdf(int $id, \App\Services\PdfGenerationService $pdfService)
    {
        $contract = Contract::findOrFail($id);

        if (!$contract->file_path || !\Illuminate\Support\Facades\Storage::disk('public')->exists($contract->file_path)) {
            $pdfService->generateContractPdf($contract);
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download($contract->file_path, "contract_{$contract->contract_number}.pdf");
    }

    public function viewPdf(int $id, \App\Services\PdfGenerationService $pdfService)
    {
        $contract = Contract::findOrFail($id);

        if (!$contract->file_path || !\Illuminate\Support\Facades\Storage::disk('public')->exists($contract->file_path)) {
            $pdfService->generateContractPdf($contract);
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->response($contract->file_path);
    }
}
