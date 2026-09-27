<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSection;
use App\Models\SystemSetting;
use App\Services\AuditLogService;
use App\Services\EncryptedSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class AdminLandingCmsController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(): Response
    {
        $this->ensureDefaultSectionsExist();

        $sections = LandingPageSection::orderBy('order')->get();

        $branding = [
            'logo' => $this->getAbsoluteUrl(EncryptedSettingService::get('platform_logo')),
            'logo_dark' => $this->getAbsoluteUrl(EncryptedSettingService::get('platform_logo_dark')),
            'favicon' => $this->getAbsoluteUrl(EncryptedSettingService::get('platform_favicon')),
            'site_name_ar' => EncryptedSettingService::get('site_name_ar', 'GoTransTech'),
            'site_name_en' => EncryptedSettingService::get('site_name_en', 'GoTransTech Platform'),
            'site_slogan_ar' => EncryptedSettingService::get('site_slogan_ar', 'نمول حركة الغد'),
            'site_slogan_en' => EncryptedSettingService::get('site_slogan_en', 'FINANCING WHAT MOVES TOMORROW'),
            'navbar_brand_display' => EncryptedSettingService::get('navbar_brand_display', 'both'),
        ];

        return Inertia::render('Admin/CMS/Index', [
            'sections' => $sections,
            'branding' => $branding,
            'landingUrl' => url('/'),
        ]);
    }

    protected function getAbsoluteUrl(?string $path): ?string
    {
        if (empty($path)) {
            return null;
        }
        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }
        return asset(ltrim($path, '/'));
    }

    public function updateBranding(Request $request)
    {
        $validated = $request->validate([
            'logo' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'logo_dark' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg,webp|max:4096',
            'favicon' => 'nullable|file|mimes:ico,png,svg,webp,jpg|max:2048',
            'site_name_ar' => 'nullable|string|max:255',
            'site_name_en' => 'nullable|string|max:255',
            'site_slogan_ar' => 'nullable|string|max:255',
            'site_slogan_en' => 'nullable|string|max:255',
            'navbar_brand_display' => 'nullable|string|in:logo,name,both',
        ]);

        $publicBrandingDir = public_path('storage/branding');
        $storageBrandingDir = storage_path('app/public/branding');

        if (!File::exists($publicBrandingDir)) {
            File::makeDirectory($publicBrandingDir, 0755, true);
        }
        if (!File::exists($storageBrandingDir)) {
            File::makeDirectory($storageBrandingDir, 0755, true);
        }

        $userId = auth()->id();

        // 1. Logo
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = 'logo_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($publicBrandingDir, $filename);
            @copy($publicBrandingDir . '/' . $filename, $storageBrandingDir . '/' . $filename);

            $fullLogoUrl = asset('storage/branding/' . $filename);

            EncryptedSettingService::set(
                'platform_logo',
                $fullLogoUrl,
                'branding',
                false,
                'شعار المنصة الرسمي',
                'الشعار الرسمي للمنصة المعتمد في الهيدر والفوتر والصفحات',
                $userId
            );
        }

        // 2. Dark Mode Logo
        if ($request->hasFile('logo_dark')) {
            $file = $request->file('logo_dark');
            $filename = 'logo_dark_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($publicBrandingDir, $filename);
            @copy($publicBrandingDir . '/' . $filename, $storageBrandingDir . '/' . $filename);

            $fullLogoDarkUrl = asset('storage/branding/' . $filename);

            EncryptedSettingService::set(
                'platform_logo_dark',
                $fullLogoDarkUrl,
                'branding',
                false,
                'شعار المنصة للوضع الليلي',
                'الشعار المخصص للوضع الليلي الداكن',
                $userId
            );
        }

        // 3. Favicon
        if ($request->hasFile('favicon')) {
            $file = $request->file('favicon');
            $filename = 'favicon_' . time() . '.' . $file->getClientOriginalExtension();
            $file->move($publicBrandingDir, $filename);
            @copy($publicBrandingDir . '/' . $filename, $storageBrandingDir . '/' . $filename);

            $fullFaviconUrl = asset('storage/branding/' . $filename);

            EncryptedSettingService::set(
                'platform_favicon',
                $fullFaviconUrl,
                'branding',
                false,
                'أيقونة المتصفح Favicon',
                'الأيقونة المعروضة في تبويب المتصفح ومفضلة الموقع',
                $userId
            );
        }

        // Text settings
        if ($request->filled('site_name_ar')) {
            EncryptedSettingService::set('site_name_ar', $request->input('site_name_ar'), 'branding', false, 'اسم المنصة بالعربية', null, $userId);
        }
        if ($request->filled('site_name_en')) {
            EncryptedSettingService::set('site_name_en', $request->input('site_name_en'), 'branding', false, 'اسم المنصة بالإنجليزية', null, $userId);
        }
        if ($request->filled('site_slogan_ar')) {
            EncryptedSettingService::set('site_slogan_ar', $request->input('site_slogan_ar'), 'branding', false, 'الشعار اللفظي بالعربية', null, $userId);
        }
        if ($request->filled('site_slogan_en')) {
            EncryptedSettingService::set('site_slogan_en', $request->input('site_slogan_en'), 'branding', false, 'الشعار اللفظي بالإنجليزية', null, $userId);
        }
        if ($request->filled('navbar_brand_display')) {
            EncryptedSettingService::set('navbar_brand_display', $request->input('navbar_brand_display'), 'branding', false, 'طريقة عرض الهوية في الـ Navbar', null, $userId);
        }

        $this->auditLogService->log(
            'updated',
            null,
            [],
            $request->except(['logo', 'logo_dark', 'favicon']),
            'تحديث إعدادات هوية المنصة، الشعار الرسمي، وخيارات عرض الـ Navbar'
        );

        return back()->with('success', 'تم حفظ وتحديث هوية الشعار، خيارات العرض، وأيقونة المتصفح بنجاح.');
    }

    public function deleteBranding(string $type)
    {
        $allowed = [
            'logo' => 'platform_logo',
            'logo_dark' => 'platform_logo_dark',
            'favicon' => 'platform_favicon',
        ];

        if (!array_key_exists($type, $allowed)) {
            return back()->with('error', 'نوع العنصر غير صالح.');
        }

        $key = $allowed[$type];
        $currentPath = EncryptedSettingService::get($key);

        if ($currentPath) {
            $parsedPath = parse_url($currentPath, PHP_URL_PATH);
            $relPath = ltrim($parsedPath ?: $currentPath, '/');
            @unlink(public_path($relPath));
            @unlink(storage_path('app/public/' . str_replace('storage/', '', $relPath)));
        }

        SystemSetting::where('key', $key)->delete();
        \Illuminate\Support\Facades\Cache::forget(EncryptedSettingService::CACHE_KEY_PREFIX . $key);

        $this->auditLogService->log(
            'deleted',
            null,
            ['type' => $type],
            [],
            "حذف ملف الهوية ({$type}) والرجوع للوضع الافتراضي"
        );

        return back()->with('success', 'تم حذف الملف واستعادة العنصر الافتراضي بنجاح.');
    }

    public function update(Request $request, int $id)
    {
        $section = LandingPageSection::findOrFail($id);

        $validated = $request->validate([
            'title_ar' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'subtitle_ar' => 'nullable|string',
            'subtitle_en' => 'nullable|string',
            'content' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $old = $section->toArray();
        $section->update($validated);

        $this->auditLogService->log(
            'updated',
            $section,
            $old,
            $validated,
            "تحديث محتوى قسم صفحة الهبوط: {$section->section_key}"
        );

        return back()->with('success', 'تم حفظ وتحديث محتوى القسم بنجاح.');
    }

    protected function ensureDefaultSectionsExist(): void
    {
        $defaults = [
            [
                'section_key' => 'hero',
                'order' => 1,
                'title_ar' => 'منصة التمويل اللوجستي الذكية لربط المستثمرين بشركات النقل',
                'title_en' => 'Smart Logistics Financing Platform Connecting Investors with Shippers',
                'subtitle_ar' => 'حوّل تدفقاتك النقدية إلى أرباح حقيقية من خلال تمويل مهام الشحن والتوصيل اللوجستية بعوائد فورية ومضمونة.',
                'subtitle_en' => 'Transform your cash flow into real profits through financing logistics shipping tasks with instant guaranteed returns.',
                'content' => [
                    'badge_text' => 'منصة التمويل والاستثمار اللوجستي المعتمدة بالمملكة 🇸🇦',
                    'primary_button_text' => 'ابدأ الاستثمار الآن',
                    'secondary_button_text' => 'ربط الشركات اللوجستية (API)',
                ],
                'is_active' => true,
            ],
            [
                'section_key' => 'stats',
                'order' => 2,
                'title_ar' => 'أرقام وإحصائيات موثقة',
                'title_en' => 'Verified Stats & Numbers',
                'subtitle_ar' => 'مؤشرات أداء تعكس ثقة المستثمرين والشركات اللوجستية في منصتنا',
                'subtitle_en' => 'Performance indicators reflecting investor and logistics trust',
                'content' => [
                    'funded_tasks_label' => 'مهمة لوجستية ممولة',
                    'invested_amount_label' => 'ريال حجم التمويل المنفذ',
                    'active_investors_label' => 'مستثمر نشط بالمنصة',
                    'companies_label' => 'شركة لوجستية مربوطة',
                ],
                'is_active' => true,
            ],
            [
                'section_key' => 'how_it_works',
                'order' => 3,
                'title_ar' => 'كيف تعمل المنصة؟',
                'title_en' => 'How It Works?',
                'subtitle_ar' => 'خطوات بسيطة تضمن سرعة تدفق السيولة وأمان العمليات المالية بين المستثمر والشركة',
                'subtitle_en' => 'Simple steps ensuring fast liquidity flow and secure transactions',
                'content' => [
                    'steps' => [
                        [
                            'step' => 1,
                            'title' => 'شحن المحفظة الاستثمارية',
                            'description' => 'قم بإيداع رأس المال بأمان عبر التحويل البنكي المعتمد أو الدفع الإلكتروني الفوري HyperPay.',
                        ],
                        [
                            'step' => 2,
                            'title' => 'استعراض المهام اللوجستية',
                            'description' => 'تصفح قائمة المهام اليومية الواردة لحظياً من شركات الشحن عبر الـ API مع تفاصيل المسار والعمولة.',
                        ],
                        [
                            'step' => 3,
                            'title' => 'تمويل المهمة بضغطة زر',
                            'description' => 'اختر المهمة المناسبة وسيتم اقتطاع قيمتها من محفظتك وتوجيه التمويل مباشرة للشركة المنفذة.',
                        ],
                        [
                            'step' => 4,
                            'title' => 'جني الأرباح الفورية',
                            'description' => 'استلم حصتك من عمولة المنصة فور تمويل المهمة وأعد استثمارها أو اطلب سحبها لحسابك البنكي.',
                        ],
                    ]
                ],
                'is_active' => true,
            ],
            [
                'section_key' => 'features',
                'order' => 4,
                'title_ar' => 'حلول مصممة خصيصاً للطرفين',
                'title_en' => 'Tailored Solutions for Both Parties',
                'subtitle_ar' => 'مزايا استثنائية تمكّن المستثمرين من تحقيق عوائد مستمرة وتمنح شركات النقل سيولة تشغيلية فورية',
                'subtitle_en' => 'Exceptional advantages empowering investors and providing instant operating liquidity for shippers',
                'content' => [
                    'investor_features' => [
                        'عوائد استثمارية فورية على كل مهمة يتم تمويلها',
                        'عقود قانونية إلكترونية موثقة تضمن حقوق الأطراف',
                        'سحب وإيداع مرن مع دعم المدفوعات السعودية المعتمدة',
                        'لوحة تحكم تفاعلية وتقارير أداء ومحافظ مالية معزولة',
                    ],
                    'company_features' => [
                        'سيولة فورية لتمويل وقود وصيانة ومصاريف رحلات النقل',
                        'ربط تقني فوري عبر RESTful APIs مع توثيق كامل للـ Webhooks',
                        'توليد سندات قبض ودين معتمدة بصيغة PDF فور سحب الرصيد',
                        'تتبع لحظي لحالة المهام وحركة السداد والمطابقات المالية',
                    ]
                ],
                'is_active' => true,
            ],
            [
                'section_key' => 'faq',
                'order' => 5,
                'title_ar' => 'الأسئلة الشائعة',
                'title_en' => 'Frequently Asked Questions',
                'subtitle_ar' => 'إجابات على أهم الاستفسارات حول آلية العمل، الضمانات، وطرق التمويل والسحب',
                'subtitle_en' => 'Answers to the most frequent questions regarding mechanisms and payouts',
                'content' => [
                    'faqs' => [
                        [
                            'q' => 'كيف يعمل نموذج الاستثمار والتمويل في منصة Go-Tech؟',
                            'a' => 'تقوم شركات الخدمات اللوجستية المعتمدة بربط أنظمتها عبر API لإرسال المهام والشحنات القابلة للتمويل. يقوم المستثمرون بشحن محافظهم واختيار المهام لتمويلها لحظياً، ويحصل المستثمر على نسبة متفق عليها من صافي عمولة المنصة فور تمويل المهمة.',
                        ],
                        [
                            'q' => 'ما هي طرق شحن محفظة الاستثمار المتاحة؟',
                            'a' => 'توفر المنصة خيارين معتمدين: الدفع الإلكتروني الفوري عبر بوابة HyperPay (مدى، فيزا، ماستركارد، Apple Pay)، أو عبر التحويل البنكي المباشر لحساب المنصة مع رفع صورة الإيصال للاعتماد.',
                        ],
                        [
                            'q' => 'كيف تضمن المنصة حقوق الأطراف والشفافية المالية؟',
                            'a' => 'تعتمد المنصة على نظام قيود محاسبية مزدوجة غير قابل للتلاعب (Double-Entry Ledger) مع عقود قانونية موثقة إلكترونياً، وتوليد مستندات PDF موقعة رقمياً لكل عملية سحب رصيد، مع عزل تام وتشفير لكافة العمليات.',
                        ],
                        [
                            'q' => 'كيف يمكن لشركات التوصيل والنقل اللوجستي الربط مع المنصة؟',
                            'a' => 'توفر المنصة بوابة برمجية مشفرة (API Gateway) تمكّن الشركات من توليد مفاتيح API وإرسال المهام اللوجستية واستقبال تحديثات Webhooks لحظية عند نجاح تمويل كل مهمة.',
                        ],
                    ]
                ],
                'is_active' => true,
            ],
            [
                'section_key' => 'contact_footer',
                'order' => 6,
                'title_ar' => 'معلومات التواصل والفوتر',
                'title_en' => 'Contact & Footer Info',
                'subtitle_ar' => 'قنوات الدعم الفني وخدمة العملاء والروابط الرسمية',
                'subtitle_en' => 'Technical support channels, customer service, and official links',
                'content' => [
                    'description_ar' => 'المنصة السعودية الذكية الأولى المتخصصة في تمويل المهام والخدمات اللوجستية، نربط بين المستثمرين وشركات النقل لتمكين النمو وتدفق السيولة السريعة بعوائد فورية وموثقة.',
                    'email' => 'support@gotranstech.sa',
                    'phone' => '+966 11 234 5678',
                    'whatsapp_number' => '+966501234567',
                    'address' => 'الرياض - طريق الملك فهد - مركز الملك عبد الله المالي (KAFD)',
                    'working_hours' => 'الأحد - الخميس: 9:00 ص - 6:00 م',
                    'twitter_url' => 'https://x.com',
                    'linkedin_url' => 'https://linkedin.com',
                    'instagram_url' => 'https://instagram.com',
                    'facebook_url' => '',
                    'youtube_url' => '',
                    'telegram_url' => '',
                    'cr_number' => '1010889900',
                    'tax_number' => '300099887700003',
                    'copyright_text' => 'جميع الحقوق محفوظة © منصة GoTransTech للتقنية المالية والخدمات اللوجستية المحدودة',
                ],
                'is_active' => true,
            ]
        ];

        foreach ($defaults as $secData) {
            LandingPageSection::firstOrCreate(
                ['section_key' => $secData['section_key']],
                $secData
            );
        }
    }
}
