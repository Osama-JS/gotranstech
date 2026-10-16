<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BankDeposit;
use App\Services\AuditLogService;
use App\Services\WalletService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Services\ArabicPdfHelper;
use Inertia\Inertia;
use Inertia\Response;

class AdminDepositController extends Controller
{
    public function __construct(
        protected WalletService $walletService,
        protected AuditLogService $auditLogService
    ) {}

    public function index(Request $request): Response
    {
        $query = BankDeposit::with(['user', 'reviewer']);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('deposit_number', 'like', "%{$search}%")
                  ->orWhere('bank_reference_number', 'like', "%{$search}%")
                  ->orWhere('bank_name', 'like', "%{$search}%")
                  ->orWhere('depositor_name', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Bank Name Filter
        if ($bankName = $request->input('bank_name')) {
            $query->where('bank_name', $bankName);
        }

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $deposits = $query->latest()->paginate(15)->withQueryString();

        $deposits->getCollection()->transform(function ($dep) {
            $dep->receipt_url = route('admin.deposits.receipt', $dep->id);
            $dep->is_pdf = str_ends_with(strtolower($dep->receipt_file_path ?? ''), '.pdf') || empty($dep->receipt_file_path);
            return $dep;
        });

        // Statistics
        $stats = [
            'total' => BankDeposit::count(),
            'pending' => BankDeposit::where('status', 'pending')->count(),
            'approved' => BankDeposit::where('status', 'approved')->count(),
            'rejected' => BankDeposit::where('status', 'rejected')->count(),
            'total_approved_amount' => BankDeposit::where('status', 'approved')->sum('amount'),
            'total_pending_amount' => BankDeposit::where('status', 'pending')->sum('amount'),
        ];

        $banks = BankDeposit::whereNotNull('bank_name')->distinct()->pluck('bank_name')->values();

        return Inertia::render('Admin/Deposits/Index', [
            'deposits' => $deposits,
            'stats' => $stats,
            'banks' => $banks,
            'filters' => $request->only(['search', 'status', 'bank_name', 'date_from', 'date_to']),
        ]);
    }

    public function viewReceipt(int $id)
    {
        $deposit = BankDeposit::with(['user'])->findOrFail($id);

        $path = $deposit->receipt_file_path;

        if ($path && Storage::disk('local')->exists($path)) {
            return Storage::disk('local')->response($path);
        }
        if ($path && Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->response($path);
        }

        return $this->serveGeneratedReceipt($deposit);
    }

    protected function serveGeneratedReceipt(BankDeposit $deposit)
    {
        $fileName = 'deposits/' . ($deposit->deposit_number ?: 'DEP-' . $deposit->id) . '_receipt.pdf';

        if (!Storage::disk('local')->exists($fileName) && !Storage::disk('public')->exists($fileName)) {
            $html = view('pdf.deposit_receipt', [
                'deposit' => $deposit,
                'user' => $deposit->user,
            ])->render();

            $shapedHtml = ArabicPdfHelper::reshapeHtml($html);

            $pdf = Pdf::loadHTML($shapedHtml)
                ->setPaper('a5', 'portrait')
                ->setOption(['defaultFont' => 'DejaVu Sans']);

            Storage::disk('local')->put($fileName, $pdf->output());

            $deposit->receipt_file_path = $fileName;
            $deposit->saveQuietly();
        }

        $disk = Storage::disk('local')->exists($fileName) ? 'local' : 'public';
        return Storage::disk($disk)->response($fileName);
    }

    public function approve(Request $request, int $id)
    {
        $deposit = BankDeposit::findOrFail($id);

        if ($deposit->status !== 'pending') {
            return back()->with('error', 'هذا الطلب تم البت فيه مسبقاً.');
        }

        $admin = Auth::user();
        $deposit->status = 'approved';
        $deposit->reviewed_by_user_id = $admin->id;
        $deposit->reviewed_at = now();
        $deposit->review_notes = $request->input('review_notes');
        $deposit->save();

        // Credit Investor Investment Wallet
        $this->walletService->creditWallet(
            $deposit->wallet,
            (float) $deposit->amount,
            'deposit',
            "إيداع بنكي معتمد برقم #{$deposit->deposit_number}",
            $deposit
        );

        $this->auditLogService->log(
            'approved',
            $deposit,
            ['status' => 'pending'],
            ['status' => 'approved', 'amount' => $deposit->amount],
            "الموافقة على الإيداع البنكي #{$deposit->deposit_number} بمبلغ {$deposit->amount} ر.س للمستثمر {$deposit->user->name}"
        );

        // Notify Investor of deposit approval
        \App\Services\NotificationDispatcherService::dispatch(
            'investor.deposit_credited',
            "تم شحن محفظتك الاستثمارية: #{$deposit->deposit_number}",
            "تمت الموافقة على إيداعك البنكي وإضافة مبلغ " . number_format($deposit->amount, 2) . " ر.س في محفظة الاستثمار وهو جاهز للاستثمار الفوري.",
            route('investor.wallet.investment', [], false),
            ['deposit_id' => $deposit->id, 'amount' => $deposit->amount],
            $deposit->user,
            'success'
        );

        return back()->with('success', 'تم اعتماد الإيداع وشحن محفظة المستثمر بنجاح.');
    }

    public function reject(Request $request, int $id)
    {
        $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        $deposit = BankDeposit::findOrFail($id);

        if ($deposit->status !== 'pending') {
            return back()->with('error', 'هذا الطلب تم البت فيه مسبقاً.');
        }

        $deposit->status = 'rejected';
        $deposit->reviewed_by_user_id = Auth::id();
        $deposit->reviewed_at = now();
        $deposit->review_notes = $request->input('rejection_reason');
        $deposit->save();

        $this->auditLogService->log(
            'rejected',
            $deposit,
            ['status' => 'pending'],
            ['status' => 'rejected', 'reason' => $deposit->review_notes],
            "رفض الإيداع البنكي #{$deposit->deposit_number} للمستثمر {$deposit->user->name}"
        );

        // Notify Investor of deposit rejection
        \App\Services\NotificationDispatcherService::dispatch(
            'investor.withdrawal_rejected',
            "رفض طلب الإيداع البنكي: #{$deposit->deposit_number}",
            "تم رفض طلب الإيداع البنكي رقم #{$deposit->deposit_number}. السبب: {$deposit->review_notes}",
            route('investor.wallet.investment', [], false),
            ['deposit_id' => $deposit->id, 'reason' => $deposit->review_notes],
            $deposit->user,
            'warning'
        );

        return back()->with('success', 'تم رفض طلب الإيداع.');
    }
}
