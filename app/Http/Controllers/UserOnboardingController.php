<?php

namespace App\Http\Controllers;

use App\Models\Contract;
use App\Models\FormTemplate;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserOnboardingController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function signAgreement(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'agree_terms' => 'required|accepted',
        ], [
            'agree_terms.accepted' => 'يجب الموافقة على بنود الاتفاقية والشروط القانونية للمتابعة.',
        ]);

        $user->agreement_signed_at = now();
        $user->save();

        // Create initial Contract record
        Contract::firstOrCreate(
            [
                'party_type' => $user->user_type,
                'party_id' => $user->user_type === 'company' ? ($user->companyProfile?->id ?? $user->id) : ($user->investorProfile?->id ?? $user->id),
            ],
            [
                'contract_number' => Contract::generateContractNumber(),
                'title' => $user->user_type === 'company' ? 'اتفاقية تقديم خدمات وربط لوجستي' : 'اتفاقية تمويل واستثمار لوجستي',
                'contract_type' => $user->user_type === 'company' ? 'company_service' : 'investor_framework',
                'start_date' => now(),
                'end_date' => now()->addYear(),
                'commission_rate' => $user->user_type === 'company' ? ($user->companyProfile?->platform_commission_rate ?? 10.00) : ($user->investorProfile?->platform_commission_share_rate ?? 70.00),
                'status' => 'active',
                'signed_at' => now(),
                'terms_and_conditions' => 'اتفاقية معتمدة إلكترونياً وموثقة رقمياً بين منصة Go-Tech والطرف الثاني وفق الأنظمة المالية المعمول بها.',
            ]
        );

        $this->auditLogService->log('contract_sign', $user, [], ['agreement_signed_at' => now()], "قام المستخدم {$user->name} بتوقيع الاتفاقية القانونية إلكترونياً");

        return back()->with('success', 'تم توقيع الاتفاقية القانونية بنجاح.');
    }

    public function submitAdditionalData(Request $request): RedirectResponse
    {
        $user = Auth::user();

        $request->validate([
            'form_template_id' => 'required|exists:form_templates,id',
            'additional_data' => 'required|array',
        ]);

        $user->form_template_id = $request->input('form_template_id');
        $user->additional_data = $request->input('additional_data');
        $user->save();

        $this->auditLogService->log('profile_update', $user, [], ['additional_data' => $user->additional_data], "قام المستخدم {$user->name} بتعبئة نموذج البيانات الإضافية");

        return back()->with('success', 'تم حفظ وتأكيد البيانات الإضافية بنجاح، ملفك الآن بانتظار الاعتماد النهائي من الإدارة.');
    }
}
