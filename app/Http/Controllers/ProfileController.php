<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Contract;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function show(): Response
    {
        $user = Auth::user();
        $user->load(['investorProfile', 'companyProfile', 'wallets', 'formTemplate.fields']);

        $activeContract = Contract::where(function ($query) use ($user) {
            $query->where('user_id', $user->id)
                ->orWhere(function ($q) use ($user) {
                    $partyId = $user->user_type === 'company' ? $user->companyProfile?->id : $user->investorProfile?->id;
                    if ($partyId) {
                        $q->where('party_type', $user->user_type)->where('party_id', $partyId);
                    }
                });
        })->latest()->first();

        // Get user's recent audit activities
        $recentActivities = AuditLog::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Profile/Show', [
            'user' => $user,
            'activeContract' => $activeContract,
            'recentActivities' => $recentActivities,
            'roles' => $user->roles->pluck('name'),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'phone_country_code' => 'nullable|string|max:10',
            // Investor specific fields
            'national_id' => 'nullable|string|max:30',
            'bank_name' => 'nullable|string|max:100',
            'iban' => 'nullable|string|max:50',
            // Company specific fields
            'company_name' => 'nullable|string|max:255',
            'commercial_registration' => 'nullable|string|max:50',
            'tax_number' => 'nullable|string|max:50',
        ]);

        $oldData = $user->toArray();

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if (isset($validated['phone'])) {
            $user->phone = $validated['phone'];
        }
        if (isset($validated['phone_country_code'])) {
            $user->country_code = $validated['phone_country_code'];
        }
        $user->save();

        // Update profile relations if applicable
        if ($user->isInvestor() && $user->investorProfile) {
            $user->investorProfile->update([
                'national_id' => $validated['national_id'] ?? $user->investorProfile->national_id,
                'bank_name' => $validated['bank_name'] ?? $user->investorProfile->bank_name,
                'iban' => $validated['iban'] ?? $user->investorProfile->iban,
            ]);
        } elseif ($user->isCompany() && $user->companyProfile) {
            $user->companyProfile->update([
                'company_name' => $validated['company_name'] ?? $user->companyProfile->company_name,
                'commercial_registration' => $validated['commercial_registration'] ?? $user->companyProfile->commercial_registration,
                'tax_number' => $validated['tax_number'] ?? $user->companyProfile->tax_number,
                'bank_name' => $validated['bank_name'] ?? $user->companyProfile->bank_name,
                'iban' => $validated['iban'] ?? $user->companyProfile->iban,
            ]);
        }

        $this->auditLogService->log(
            'profile_update',
            $user,
            $oldData,
            $user->fresh()->toArray(),
            "قام المستخدم {$user->name} بتحديث بيانات ملفه الشخصي"
        );

        return back()->with('success', 'تم حفظ وتحديث بيانات الملف الشخصي بنجاح.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.current_password' => 'كلمة المرور الحالية غير صحيحة.',
            'password.confirmed' => 'تأكيد كلمة المرور الجديدة غير متطابق.',
        ]);

        $user->password = Hash::make($validated['password']);
        $user->save();

        $this->auditLogService->log(
            'password_change',
            $user,
            [],
            [],
            "قام المستخدم {$user->name} بتغيير كلمة المرور الخاصة بحسابه بنجاح"
        );

        return back()->with('success', 'تم تغيير كلمة المرور بنجاح.');
    }
}
