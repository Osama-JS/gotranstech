<?php

namespace App\Http\Controllers;

use App\Models\Bank;
use App\Models\BankAccountChangeRequest;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\HyperPayPayoutService;
use App\Services\NotificationDispatcherService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BankAccountChangeRequestController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Store initial bank account for Investor or Company (Allowed only ONCE if no bank is set yet)
     */
    public function storeInitial(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $isInvestor = $user->isInvestor();
        $profile = $isInvestor ? $user->investorProfile : $user->companyProfile;

        if (!$profile) {
            return back()->withErrors(['general' => 'لم يتم العثور على الملف الشخصي للمستخدم.']);
        }

        // If bank is already configured, direct edit is strictly locked!
        if (!empty($profile->bank_id) && !empty($profile->bank_iban)) {
            return back()->withErrors([
                'general' => 'حسابك البنكي مسجل ومعتمد بالفعل. لتعديل الحساب البنكي، يرجى تقديم طلب تغيير حساب بنكي للإدارة.'
            ]);
        }

        $validated = $request->validate([
            'bank_id' => 'required|exists:banks,id',
            'iban' => 'required|string|max:50',
            'account_holder' => 'required|string|max:150',
            'city' => 'nullable|string|max:100',
            'country' => 'nullable|string|size:2',
        ], [
            'bank_id.required' => 'يرجى اختيار البنك من قائمة البنوك المعتمدة.',
            'bank_id.exists' => 'البنك المحدد غير صالح أو غير معتمد.',
            'iban.required' => 'يرجى إدخال رقم الآيبان البنكي.',
            'account_holder.required' => 'يرجى إدخال اسم صاحب الحساب كما هو مسجل في البنك.',
        ]);

        $bank = Bank::findOrFail($validated['bank_id']);
        if (!$bank->is_active) {
            return back()->withErrors(['bank_id' => "البنك المحدد ({$bank->name}) غير مفعل للتحويلات حالياً."]);
        }

        $cleanIban = strtoupper(str_replace([' ', '-', '.'], '', trim($validated['iban'])));
        $entityType = $isInvestor ? 'المستثمر' : 'الشركة';
        $ibanCheck = HyperPayPayoutService::validateIbanChecksum($cleanIban, $entityType);
        if (!$ibanCheck['valid']) {
            return back()->withErrors(['iban' => $ibanCheck['message']]);
        }

        $oldProfile = $profile->toArray();

        DB::transaction(function () use ($profile, $bank, $cleanIban, $validated, $isInvestor) {
            $dataToUpdate = [
                'bank_id' => $bank->id,
                'bank_name' => $bank->name,
                'bank_iban' => $cleanIban,
                'account_holder_name' => $validated['account_holder'],
                'bank_city' => !empty($validated['city']) ? trim($validated['city']) : 'Riyadh',
                'bank_country' => !empty($validated['country']) ? strtoupper(trim($validated['country'])) : 'SA',
            ];

            if ($isInvestor) {
                $dataToUpdate['bank_account_number'] = substr($cleanIban, -12);
            }

            $profile->update($dataToUpdate);
        });

        $this->auditLogService->log(
            'initial_bank_account_registered',
            $profile,
            $oldProfile,
            $profile->fresh()->toArray(),
            "قام {$user->name} بتسجيل حسابه البنكي المعتمد لأول مرة ({$bank->name} - {$cleanIban})"
        );

        return back()->with('success', 'تم حفظ وتأكيد حسابك البنكي المعتمد بنجاح. هذا الحساب سيكون هو الحساب المعتمد لجميع عمليات التحويل والسحب.');
    }

    /**
     * Submit Bank Account Change Request for Admin Review
     */
    public function requestChange(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $isInvestor = $user->isInvestor();
        $profile = $isInvestor ? $user->investorProfile : $user->companyProfile;

        if (!$profile) {
            return back()->withErrors(['general' => 'لم يتم العثور على الملف الشخصي.']);
        }

        // Check for existing pending request
        $hasPending = BankAccountChangeRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($hasPending) {
            return back()->withErrors([
                'general' => 'لديك طلب تغيير حساب بنكي قيد المراجعة حالياً من قبل الإدارة. يرجى الانتظار حتى البت فيه.'
            ]);
        }

        $validated = $request->validate([
            'new_bank_id' => 'required|exists:banks,id',
            'new_iban' => 'required|string|max:50',
            'new_account_holder' => 'required|string|max:150',
            'new_bank_city' => 'nullable|string|max:100',
            'new_bank_country' => 'nullable|string|size:2',
            'reason' => 'required|string|max:500',
            'certificate_file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ], [
            'new_bank_id.required' => 'يرجى اختيار البنك الجديد.',
            'new_bank_id.exists' => 'البنك المحدد غير صالح أو غير معتمد.',
            'new_iban.required' => 'يرجى إدخال رقم الآيبان البنكي الجديد.',
            'new_account_holder.required' => 'يرجى إدخال اسم صاحب الحساب الجديد.',
            'reason.required' => 'يرجى توضيح سبب طلب تغيير الحساب البنكي.',
            'reason.max' => 'سبب التغيير يجب ألا يتجاوز 500 حرف.',
            'certificate_file.mimes' => 'يجب أن يكون الملف المرفق بصيغة PDF أو صورة (JPG, PNG).',
            'certificate_file.max' => 'حجم الملف المرفق يجب ألا يتجاوز 5 ميجابايت.',
        ]);

        $newBank = Bank::findOrFail($validated['new_bank_id']);
        if (!$newBank->is_active) {
            return back()->withErrors(['new_bank_id' => "البنك المحدد ({$newBank->name}) غير مفعل للتحويلات حالياً."]);
        }

        $cleanNewIban = strtoupper(str_replace([' ', '-', '.'], '', trim($validated['new_iban'])));
        $entityType = $isInvestor ? 'المستثمر' : 'الشركة';
        $ibanCheck = HyperPayPayoutService::validateIbanChecksum($cleanNewIban, $entityType);
        if (!$ibanCheck['valid']) {
            return back()->withErrors(['new_iban' => $ibanCheck['message']]);
        }

        $currentIban = strtoupper(str_replace([' ', '-', '.'], '', trim($profile->bank_iban ?? '')));
        if ($currentIban === $cleanNewIban) {
            return back()->withErrors(['new_iban' => 'رقم الآيبان الجديد مطابق لرقم الآيبان الحالي المسجل.']);
        }

        $certificatePath = null;
        if ($request->hasFile('certificate_file')) {
            $certificatePath = $request->file('certificate_file')->store('bank_certificates', 'public');
        }

        $changeRequest = BankAccountChangeRequest::create([
            'user_id' => $user->id,
            'user_type' => $isInvestor ? 'investor' : 'company',
            'current_bank_id' => $profile->bank_id,
            'current_bank_name' => $profile->bank?->name ?? $profile->bank_name,
            'current_iban' => $profile->bank_iban,
            'current_account_holder' => $profile->account_holder_name,
            'current_bank_city' => $profile->bank_city ?? 'Riyadh',
            'current_bank_country' => $profile->bank_country ?? 'SA',
            'new_bank_id' => $newBank->id,
            'new_bank_name' => $newBank->name,
            'new_iban' => $cleanNewIban,
            'new_account_holder' => $validated['new_account_holder'],
            'new_bank_city' => !empty($validated['new_bank_city']) ? trim($validated['new_bank_city']) : 'Riyadh',
            'new_bank_country' => !empty($validated['new_bank_country']) ? strtoupper(trim($validated['new_bank_country'])) : 'SA',
            'reason' => $validated['reason'],
            'certificate_file' => $certificatePath,
            'status' => 'pending',
        ]);

        $this->auditLogService->log(
            'bank_account_change_requested',
            $changeRequest,
            [],
            $changeRequest->toArray(),
            "قام العميل {$user->name} برفع طلب تغيير الحساب البنكي المعتمد إلى بنك {$newBank->name}"
        );

        // Notify Admins
        NotificationDispatcherService::dispatch(
            'admin.bank_change_requested',
            "طلب تغيير حساب بنكي: {$user->name}",
            "تقدم العميل ({$user->name}) بطلب لتغيير حسابه البنكي المعتمد إلى بنك {$newBank->name} ({$cleanNewIban}) بانتظار التحقق والموافقة.",
            route('admin.bank-change-requests.index', [], false),
            ['request_id' => $changeRequest->id, 'user_id' => $user->id],
            null,
            'warning'
        );

        return back()->with('success', 'تم تقديم طلب تغيير الحساب البنكي بنجاح للإدارة، وسيتم تدقيقه وتحديث حسابك فور اعتماده.');
    }

    /**
     * Admin: List Bank Account Change Requests
     */
    public function adminIndex(Request $request): Response
    {
        $status = $request->input('status', 'all');
        $userType = $request->input('user_type', 'all');
        $search = $request->input('search');

        $query = BankAccountChangeRequest::with(['user', 'currentBank', 'newBank', 'reviewer']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($userType !== 'all') {
            $query->where('user_type', $userType);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('new_iban', 'like', "%{$search}%")
                  ->orWhere('current_iban', 'like', "%{$search}%")
                  ->orWhere('new_account_holder', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%")
                         ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        $requests = $query->latest()->paginate(15)->withQueryString();

        $stats = [
            'total' => BankAccountChangeRequest::count(),
            'pending' => BankAccountChangeRequest::where('status', 'pending')->count(),
            'approved' => BankAccountChangeRequest::where('status', 'approved')->count(),
            'rejected' => BankAccountChangeRequest::where('status', 'rejected')->count(),
        ];

        $banks = Bank::where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']);

        return Inertia::render('Admin/BankChangeRequests/Index', [
            'requests' => $requests,
            'stats' => $stats,
            'filters' => [
                'status' => $status,
                'user_type' => $userType,
                'search' => $search,
            ],
            'banks' => $banks,
        ]);
    }

    /**
     * Admin: Approve Bank Account Change Request
     */
    public function adminApprove(Request $request, int $id): RedirectResponse
    {
        $changeRequest = BankAccountChangeRequest::with(['user.investorProfile', 'user.companyProfile', 'newBank'])->findOrFail($id);

        if ($changeRequest->status !== 'pending') {
            return back()->with('error', 'هذا الطلب تمت معالجته مسبقاً ولا يمكن تعديله.');
        }

        $user = $changeRequest->user;
        $profile = $changeRequest->user_type === 'investor' ? $user->investorProfile : $user->companyProfile;

        if (!$profile) {
            return back()->with('error', 'تعذر العثور على الملف الشخصي المرتبط بهذا الطلب.');
        }

        DB::transaction(function () use ($changeRequest, $profile, $user) {
            $oldProfileData = $profile->toArray();

            $updateData = [
                'bank_id' => $changeRequest->new_bank_id,
                'bank_name' => $changeRequest->newBank?->name ?? $changeRequest->new_bank_name,
                'bank_iban' => $changeRequest->new_iban,
                'account_holder_name' => $changeRequest->new_account_holder,
                'bank_city' => $changeRequest->new_bank_city ?: 'Riyadh',
                'bank_country' => $changeRequest->new_bank_country ?: 'SA',
            ];

            if ($changeRequest->user_type === 'investor') {
                $updateData['bank_account_number'] = substr($changeRequest->new_iban, -12);
            }

            $profile->update($updateData);

            $changeRequest->update([
                'status' => 'approved',
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            $this->auditLogService->log(
                'bank_account_change_approved',
                $changeRequest,
                $oldProfileData,
                $profile->fresh()->toArray(),
                "قام المشرف " . Auth::user()->name . " بالموافقة على طلب تغيير الحساب البنكي للعميل {$user->name}"
            );
        });

        // Notify User
        $redirectRoute = $changeRequest->user_type === 'investor' 
            ? route('investor.wallet.commission', [], false)
            : route('profile.show', [], false);

        NotificationDispatcherService::dispatch(
            'user.bank_change_approved',
            'تمت الموافقة على تغيير حسابك البنكي',
            "تم اعتماد حسابك البنكي الجديد ({$changeRequest->new_bank_name} - {$changeRequest->new_iban}) بنجاح. أصبحت جميع عمليات الصرف والتحويل معتمدة على هذا الحساب.",
            $redirectRoute,
            ['request_id' => $changeRequest->id],
            $user->id,
            'success'
        );

        return back()->with('success', "تمت الموافقة على تغيير الحساب البنكي للعميل ({$user->name}) وتحديث بياناته بنجاح.");
    }

    /**
     * Admin: Reject Bank Account Change Request
     */
    public function adminReject(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ], [
            'rejection_reason.required' => 'يرجى إدخال سبب رفض طلب تغيير الحساب البنكي.',
            'rejection_reason.max' => 'سبب الرفض يجب ألا يتجاوز 500 حرف.',
        ]);

        $changeRequest = BankAccountChangeRequest::with('user')->findOrFail($id);

        if ($changeRequest->status !== 'pending') {
            return back()->with('error', 'هذا الطلب تمت معالجته مسبقاً ولا يمكن تعديله.');
        }

        $changeRequest->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        $user = $changeRequest->user;

        $this->auditLogService->log(
            'bank_account_change_rejected',
            $changeRequest,
            [],
            $changeRequest->toArray(),
            "قام المشرف " . Auth::user()->name . " برفض طلب تغيير الحساب البنكي للعميل {$user->name}. السبب: {$validated['rejection_reason']}"
        );

        // Notify User
        $redirectRoute = $changeRequest->user_type === 'investor' 
            ? route('investor.wallet.commission', [], false)
            : route('profile.show', [], false);

        NotificationDispatcherService::dispatch(
            'user.bank_change_rejected',
            'تم رفض طلب تغيير حسابك البنكي',
            "نأسف، تم رفض طلب تغيير حسابك البنكي للسبب التالي: {$validated['rejection_reason']}",
            $redirectRoute,
            ['request_id' => $changeRequest->id, 'reason' => $validated['rejection_reason']],
            $user->id,
            'danger'
        );

        return back()->with('success', "تم رفض طلب تغيير الحساب البنكي للعميل ({$user->name}) وإشعاره بالسبب.");
    }

    /**
     * Download or view bank certificate file
     */
    public function viewCertificate(int $id)
    {
        $changeRequest = BankAccountChangeRequest::findOrFail($id);

        // Security check: Only Admin or the requesting user can access
        $user = Auth::user();
        if (!$user->isAdmin() && $changeRequest->user_id !== $user->id) {
            abort(403, 'غير مصرح لك باستعراض هذا الملف.');
        }

        $path = $changeRequest->certificate_file;
        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'الملف المرفق غير موجود أو تم حذفه.');
        }

        return Storage::disk('public')->response($path);
    }
}

