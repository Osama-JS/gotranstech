<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\AuditLogService;
use App\Services\EncryptedSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class AdminSettingsController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(Request $request): Response
    {
        $group = $request->input('group', 'hyperpay');

        // Ensure default settings exist for all groups
        $this->ensureDefaultSettingsExist();

        $settings = SystemSetting::where('group', $group)->get()->map(function ($s) {
            return [
                'id' => $s->id,
                'key' => $s->key,
                'value' => $s->is_encrypted ? $s->decrypted_value : $s->value,
                'is_encrypted' => $s->is_encrypted,
                'group' => $s->group,
                'label' => $s->label,
                'description' => $s->description,
            ];
        });

        $groups = [
            [
                'key' => 'hyperpay',
                'label_ar' => 'بوابة الدفع HyperPay',
                'label_en' => 'HyperPay Gateway',
                'desc' => 'إعدادات بطاقات مدى، فيزا/ماستركارد، Apple Pay، والبيئة التجريبية والإنتاجية',
            ],
            [
                'key' => 'mail',
                'label_ar' => 'خادم البريد SMTP',
                'label_en' => 'SMTP Mail Server',
                'desc' => 'إعدادات خادم البريد الإلكتروني وتجربة إرسال رسائل الفحص',
            ],
            [
                'key' => 'financial',
                'label_ar' => 'القواعد والعمولات المالية',
                'label_en' => 'Financial Platform Rules',
                'desc' => 'نسب العمولات الافتراضية، الحد الأدنى للإيداع، وضريبة القيمة المضافة ومهلة المهام',
            ],
            [
                'key' => 'sms',
                'label_ar' => 'رسائل SMS والواتساب',
                'label_en' => 'SMS & WhatsApp',
                'desc' => 'ربط بوابات الرسائل القصيرة وإشعارات كود التحقق',
            ],
            [
                'key' => 'security',
                'label_ar' => 'الأمان والتحقق KYC',
                'label_en' => 'Security & KYC',
                'desc' => 'إعدادات التحقق الثنائي (2FA)، مدة الجلسات، ومتطلبات الهوية',
            ],
            [
                'key' => 'pdf_branding',
                'label_ar' => 'إعدادات قوالب وطباعة الـ PDF',
                'label_en' => 'PDF Templates & Printing',
                'desc' => 'تخصيص ترويسة وتذييل صفحات العقود وسندات السحب، شعار الطباعة، والختم الرسمي والشروط القانونية',
            ],
        ];

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $settings,
            'currentGroup' => $group,
            'groups' => $groups,
        ]);
    }

    public function update(Request $request)
    {
        $settingsData = $request->input('settings', []);
        $group = $request->input('group', 'hyperpay');

        foreach ($settingsData as $key => $value) {
            $existing = SystemSetting::where('key', $key)->first();
            $isEncrypted = $existing ? $existing->is_encrypted : false;
            $label = $existing ? $existing->label : $key;

            EncryptedSettingService::set(
                $key,
                $value,
                $group,
                $isEncrypted,
                $label,
                null,
                Auth::id()
            );
        }

        $this->auditLogService->log(
            'setting_changed',
            null,
            [],
            ['group' => $group],
            "تحديث إعدادات النظام للمجموعة ({$group}) بواسطة الإدارة"
        );

        return back()->with('success', 'تم حفظ وتشفير الإعدادات بنجاح في قاعدة البيانات.');
    }

    public function testEmail(Request $request)
    {
        $request->validate([
            'test_email' => 'required|email',
        ]);

        $recipient = $request->input('test_email');

        try {
            // Test sending mail
            Mail::raw("هذه رسالة اختبارية لتأكيد نجاح ضبط خادم البريد SMTP لمنصة GoTech في " . now()->format('Y-m-d H:i:s'), function ($message) use ($recipient) {
                $message->to($recipient)
                    ->subject("اختبار إعدادات البريد الإلكتروني - منصة GoTech");
            });

            return back()->with('success', "تم إرسال البريد التجريبي بنجاح إلى {$recipient}. يرجى فحص صندوق الوارد.");
        } catch (\Throwable $e) {
            return back()->with('error', "تعذر إرسال البريد التجريبي: " . $e->getMessage());
        }
    }

    protected function ensureDefaultSettingsExist(): void
    {
        $defaults = [
            // HyperPay
            ['key' => 'hyperpay_base_url', 'value' => 'https://test.oppwa.com', 'group' => 'hyperpay', 'label' => 'رابط بوابة HyperPay (Base URL)', 'is_encrypted' => false],
            ['key' => 'hyperpay_access_token', 'value' => 'OGE4Mjk0MTc0ZDA1OTViZTAxNGQwNWQ4MjllNzAwMTJ8c3k2S0pzVDg=', 'group' => 'hyperpay', 'label' => 'رمز التفويض المشفر (Access Token)', 'is_encrypted' => true],
            ['key' => 'hyperpay_entity_id_mada', 'value' => '8a8294174d0595be014d05d82eef0016', 'group' => 'hyperpay', 'label' => 'معرف كيان مدى (Mada Entity ID)', 'is_encrypted' => true],
            ['key' => 'hyperpay_entity_id_visa_master', 'value' => '8a8294174d0595be014d05d82eef0017', 'group' => 'hyperpay', 'label' => 'معرف كيان Visa / MasterCard', 'is_encrypted' => true],
            ['key' => 'hyperpay_entity_id_applepay', 'value' => '8a8294174d0595be014d05d82eef0018', 'group' => 'hyperpay', 'label' => 'معرف كيان Apple Pay', 'is_encrypted' => true],
            ['key' => 'hyperpay_mode', 'value' => 'test', 'group' => 'hyperpay', 'label' => 'بيئة العمل (test / live)', 'is_encrypted' => false],

            // SMTP Mail
            ['key' => 'mail_mailer', 'value' => 'smtp', 'group' => 'mail', 'label' => 'بروتوكول الإرسال (Mailer)', 'is_encrypted' => false],
            ['key' => 'mail_host', 'value' => 'smtp.mailtrap.io', 'group' => 'mail', 'label' => 'خادم البريد (SMTP Host)', 'is_encrypted' => false],
            ['key' => 'mail_port', 'value' => '587', 'group' => 'mail', 'label' => 'منفذ الخادم (Port)', 'is_encrypted' => false],
            ['key' => 'mail_username', 'value' => 'gotech_mailer', 'group' => 'mail', 'label' => 'اسم مستخدم SMTP', 'is_encrypted' => true],
            ['key' => 'mail_password', 'value' => 'smtp_secret_password', 'group' => 'mail', 'label' => 'كلمة مرور SMTP', 'is_encrypted' => true],
            ['key' => 'mail_encryption', 'value' => 'tls', 'group' => 'mail', 'label' => 'نوع التشفير (tls / ssl)', 'is_encrypted' => false],
            ['key' => 'mail_from_address', 'value' => 'noreply@gotech.com', 'group' => 'mail', 'label' => 'عنوان المرسل (From Address)', 'is_encrypted' => false],
            ['key' => 'mail_from_name', 'value' => 'GoTech Platform', 'group' => 'mail', 'label' => 'اسم المرسل (From Name)', 'is_encrypted' => false],

            // Financial
            ['key' => 'default_platform_commission_rate', 'value' => '10.00', 'group' => 'financial', 'label' => 'نسبة عمولة المنصة الافتراضية من الشركات (%)', 'is_encrypted' => false],
            ['key' => 'default_investor_profit_share_rate', 'value' => '70.00', 'group' => 'financial', 'label' => 'نسبة حصة المستثمر الافتراضية من أرباح المهمة (%)', 'is_encrypted' => false],
            ['key' => 'min_bank_deposit_amount', 'value' => '1000', 'group' => 'financial', 'label' => 'الحد الأدنى للإيداع البنكي (ر.س)', 'is_encrypted' => false],
            ['key' => 'task_expiry_minutes', 'value' => '120', 'group' => 'financial', 'label' => 'مهلة انتهاء صلاحية المهمة قبل التمويل (بالدقائق)', 'is_encrypted' => false],
            ['key' => 'vat_rate', 'value' => '15.00', 'group' => 'financial', 'label' => 'نسبة ضريبة القيمة المضافة VAT (%)', 'is_encrypted' => false],

            // SMS
            ['key' => 'sms_provider', 'value' => 'unifonic', 'group' => 'sms', 'label' => 'مزود خدمة الرسائل (Unifonic / Twilio / Taqnyat)', 'is_encrypted' => false],
            ['key' => 'sms_api_key', 'value' => 'sms_secret_api_key', 'group' => 'sms', 'label' => 'مفتاح الـ API للرسائل', 'is_encrypted' => true],
            ['key' => 'sms_sender_id', 'value' => 'GoTech', 'group' => 'sms', 'label' => 'اسم المرسل المعتمد (Sender ID)', 'is_encrypted' => false],

            // Security
            ['key' => 'require_kyc_verification', 'value' => 'yes', 'group' => 'security', 'label' => 'إلزامية التحقق من الهوية والسجل التجاري', 'is_encrypted' => false],
            ['key' => 'enable_two_factor_auth', 'value' => 'optional', 'group' => 'security', 'label' => 'التحقق الثنائي 2FA (optional / forced)', 'is_encrypted' => false],
            ['key' => 'session_lifetime_minutes', 'value' => '120', 'group' => 'security', 'label' => 'مدة الجلسة التلقائية (بالدقائق)', 'is_encrypted' => false],

            // PDF & Printing Branding Settings
            ['key' => 'pdf_header_org_name', 'value' => 'منصة GoTransTech للتمويل اللوجستي', 'group' => 'pdf_branding', 'label' => 'اسم المنشأة في ترويسة ملفات PDF', 'is_encrypted' => false],
            ['key' => 'pdf_header_subtitle', 'value' => 'المملكة العربية السعودية - سجل تجاري رقم 1010889922 - مرخصة من الهيئة العامة للنقل', 'group' => 'pdf_branding', 'label' => 'الوصف والترخيص الرسمي في ترويسة PDF', 'is_encrypted' => false],
            ['key' => 'pdf_header_tax_number', 'value' => 'الرقم الضريبي: 310298374600003', 'group' => 'pdf_branding', 'label' => 'الرقم الضريبي VAT المعتمد', 'is_encrypted' => false],
            ['key' => 'pdf_footer_legal_text', 'value' => 'وثيقة إلكترونية رسمية صادرة من منصة GoTransTech بموجب نظام التعاملات الإلكترونية السعودي ولائحته التنفيذية وتعتبر حجة ملزمة لكافة أطرافها.', 'group' => 'pdf_branding', 'label' => 'النص القانوني والتنظيمي في تذييل الصفحات (Footer)', 'is_encrypted' => false],
            ['key' => 'pdf_stamp_title', 'value' => 'الختم والتوقيع الرقمي المعتمد - منصة GoTransTech', 'group' => 'pdf_branding', 'label' => 'عنوان الختم والتوقيع الإلكتروني للوثائق', 'is_encrypted' => false],
            ['key' => 'pdf_watermark_text', 'value' => 'GoTransTech - معتمد رسمياً', 'group' => 'pdf_branding', 'label' => 'نص العلامة المائية للوثائق المطبوعة', 'is_encrypted' => false],
            ['key' => 'pdf_print_logo', 'value' => '', 'group' => 'pdf_branding', 'label' => 'رابط أو مسار الشعار المخصص للطباعة (فارغ لاستخدام الشعار الرسمي للمنصة)', 'is_encrypted' => false],
        ];

        foreach ($defaults as $item) {
            SystemSetting::firstOrCreate(
                ['key' => $item['key']],
                [
                    'value' => $item['value'],
                    'group' => $item['group'],
                    'label' => $item['label'],
                    'is_encrypted' => $item['is_encrypted'],
                ]
            );
        }
    }
}
