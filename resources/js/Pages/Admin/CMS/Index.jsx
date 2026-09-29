import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import BrandLogo from '../../../Components/BrandLogo';
import { 
    LayoutTemplate, 
    Sparkles, 
    BarChart3, 
    Layers, 
    HelpCircle, 
    PhoneCall, 
    Save, 
    Plus, 
    Trash2, 
    Check, 
    Globe,
    CheckCircle2,
    ArrowUpRight,
    Palette,
    Image,
    UploadCloud,
    RefreshCw,
    ExternalLink,
    Maximize2,
    Sliders,
    Minus,
    RotateCcw
} from 'lucide-react';

export default function AdminLandingCms({ sections = [], branding = {}, landingUrl = null }) {
    const { props } = usePage();
    const [activeTab, setActiveTab] = useState('branding');

    // Compute complete real landing page URL for preview
    const getLandingPageUrl = () => {
        if (landingUrl) return landingUrl;
        if (props?.landingUrl) return props.landingUrl;
        if (typeof window !== 'undefined') {
            const path = window.location.pathname;
            const match = path.match(/^(.*?)(\/admin|\/investor|\/company|\/portal|\/login|\/register)/i);
            const basePath = match ? match[1] : '';
            return window.location.origin + basePath + '/';
        }
        return '/';
    };

    const previewUrl = getLandingPageUrl();

    const [logoPreview, setLogoPreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    // Branding & Logo Form
    const brandingForm = useForm({
        logo: null,
        logo_dark: null,
        favicon: null,
        site_name_ar: branding?.site_name_ar || 'GoTransTech',
        site_name_en: branding?.site_name_en || 'GoTransTech Platform',
        site_slogan_ar: branding?.site_slogan_ar || 'نمول حركة الغد',
        site_slogan_en: branding?.site_slogan_en || 'FINANCING WHAT MOVES TOMORROW',
        navbar_brand_display: branding?.navbar_brand_display || 'both',
        navbar_brand_size: parseInt(branding?.navbar_brand_size, 10) || 36,
    });

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            brandingForm.setData('logo', file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            brandingForm.setData('favicon', file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const submitBranding = (e) => {
        e.preventDefault();
        brandingForm.post(route('admin.cms.branding.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setLogoPreview(null);
                setFaviconPreview(null);
            },
        });
    };

    const handleDeleteBrandingItem = (type) => {
        const label = type === 'logo' ? 'شعار المنصة' : (type === 'favicon' ? 'أيقونة المتصفح' : 'الشعار الليلي');
        if (confirm(`هل أنت متأكد من رغبتك في حذف ${label} والعودة للوضع الافتراضي؟`)) {
            router.delete(route('admin.cms.branding.delete', type), {
                preserveScroll: true,
            });
        }
    };

    const heroSec = sections.find(s => s.section_key === 'hero') || {};
    const statsSec = sections.find(s => s.section_key === 'stats') || {};
    const howSec = sections.find(s => s.section_key === 'how_it_works') || {};
    const featuresSec = sections.find(s => s.section_key === 'features') || {};
    const faqSec = sections.find(s => s.section_key === 'faq') || {};
    const contactSec = sections.find(s => s.section_key === 'contact_footer') || {};

    // 1. Hero Form
    const heroForm = useForm({
        title_ar: heroSec.title_ar || '',
        title_en: heroSec.title_en || '',
        subtitle_ar: heroSec.subtitle_ar || '',
        subtitle_en: heroSec.subtitle_en || '',
        content: {
            badge_text: heroSec.content?.badge_text || '',
            primary_button_text: heroSec.content?.primary_button_text || '',
            secondary_button_text: heroSec.content?.secondary_button_text || '',
        },
        is_active: heroSec.is_active ?? true,
    });

    // 2. Stats Form
    const statsForm = useForm({
        title_ar: statsSec.title_ar || '',
        title_en: statsSec.title_en || '',
        subtitle_ar: statsSec.subtitle_ar || '',
        subtitle_en: statsSec.subtitle_en || '',
        content: {
            funded_tasks_label: statsSec.content?.funded_tasks_label || 'مهمة لوجستية ممولة',
            invested_amount_label: statsSec.content?.invested_amount_label || 'ريال حجم التمويل المنفذ',
            active_investors_label: statsSec.content?.active_investors_label || 'مستثمر نشط بالمنصة',
            companies_label: statsSec.content?.companies_label || 'شركة لوجستية مربوطة',
        },
        is_active: statsSec.is_active ?? true,
    });

    // 3. How It Works Form
    const howForm = useForm({
        title_ar: howSec.title_ar || '',
        title_en: howSec.title_en || '',
        subtitle_ar: howSec.subtitle_ar || '',
        subtitle_en: howSec.subtitle_en || '',
        content: {
            steps: howSec.content?.steps || [
                { step: 1, title: '', description: '' },
                { step: 2, title: '', description: '' },
                { step: 3, title: '', description: '' },
                { step: 4, title: '', description: '' },
            ],
        },
        is_active: howSec.is_active ?? true,
    });

    // 4. Features Form
    const featuresForm = useForm({
        title_ar: featuresSec.title_ar || '',
        title_en: featuresSec.title_en || '',
        subtitle_ar: featuresSec.subtitle_ar || '',
        subtitle_en: featuresSec.subtitle_en || '',
        content: {
            investor_features: featuresSec.content?.investor_features || [],
            company_features: featuresSec.content?.company_features || [],
        },
        is_active: featuresSec.is_active ?? true,
    });

    // 5. FAQ Form
    const faqForm = useForm({
        title_ar: faqSec.title_ar || '',
        title_en: faqSec.title_en || '',
        subtitle_ar: faqSec.subtitle_ar || '',
        subtitle_en: faqSec.subtitle_en || '',
        content: {
            faqs: faqSec.content?.faqs || [],
        },
        is_active: faqSec.is_active ?? true,
    });

    // 6. Contact & Footer Form
    const contactForm = useForm({
        title_ar: contactSec.title_ar || 'معلومات التواصل والفوتر',
        title_en: contactSec.title_en || 'Contact & Footer Info',
        subtitle_ar: contactSec.subtitle_ar || 'قنوات الدعم الفني وخدمة العملاء والروابط الرسمية',
        subtitle_en: contactSec.subtitle_en || 'Technical support channels, customer service, and official links',
        content: {
            description_ar: contactSec.content?.description_ar || 'المنصة السعودية الذكية الأولى المتخصصة في تمويل المهام والخدمات اللوجستية، نربط بين المستثمرين وشركات النقل لتمكين النمو وتدفق السيولة السريعة بعوائد فورية وموثقة.',
            email: contactSec.content?.email || 'support@gotranstech.sa',
            phone: contactSec.content?.phone || '+966 11 234 5678',
            whatsapp_number: contactSec.content?.whatsapp_number || '+966501234567',
            address: contactSec.content?.address || 'الرياض - طريق الملك فهد - مركز الملك عبد الله المالي (KAFD)',
            working_hours: contactSec.content?.working_hours || 'الأحد - الخميس: 9:00 ص - 6:00 م',
            twitter_url: contactSec.content?.twitter_url || 'https://x.com',
            linkedin_url: contactSec.content?.linkedin_url || 'https://linkedin.com',
            instagram_url: contactSec.content?.instagram_url || 'https://instagram.com',
            facebook_url: contactSec.content?.facebook_url || '',
            youtube_url: contactSec.content?.youtube_url || '',
            telegram_url: contactSec.content?.telegram_url || '',
            cr_number: contactSec.content?.cr_number || '1010889900',
            tax_number: contactSec.content?.tax_number || '300099887700003',
            copyright_text: contactSec.content?.copyright_text || 'جميع الحقوق محفوظة © منصة GoTransTech للتقنية المالية والخدمات اللوجستية المحدودة',
        },
        is_active: contactSec.is_active ?? true,
    });

    const submitForm = (form, sectionId, e) => {
        e.preventDefault();
        form.put(route('admin.cms.update', sectionId), {
            preserveScroll: true,
        });
    };

    const tabs = [
        { id: 'branding', label: 'الشعار وأيقونة المتصفح (Branding)', icon: Palette, sec: null },
        { id: 'hero', label: 'القسم الرئيسي (Hero)', icon: Sparkles, sec: heroSec },
        { id: 'stats', label: 'شريط الإحصائيات (Stats)', icon: BarChart3, sec: statsSec },
        { id: 'how', label: 'خطوات العمل (How it works)', icon: Layers, sec: howSec },
        { id: 'features', label: 'المميزات والحلول (Features)', icon: CheckCircle2, sec: featuresSec },
        { id: 'faq', label: 'الأسئلة الشائعة (FAQ)', icon: HelpCircle, sec: faqSec },
        { id: 'contact', label: 'الفوتر والتواصل (Footer)', icon: PhoneCall, sec: contactSec },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="إدارة هوية المنصة وصفحة الهبوط - إدارة المنصة" />

            <div className="space-y-6 pb-12 max-w-6xl mx-auto">
                {/* Header */}
                <AdminPageHeader
                    title="إدارة هوية المنصة ومحتوى صفحة الهبوط (CMS & Branding)"
                    subtitle="التحكم الكامل بالشعار الرسمي للمنصة، أيقونة المتصفح (Favicon)، النصوص والإحصائيات، وبيانات التواصل"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'إدارة الهوية وصفحة الهبوط' }
                    ]}
                    icon={LayoutTemplate}
                    iconColor="text-violet-400"
                    badge={{ text: 'تحكم مركزي مباشر', color: 'brand' }}
                    actions={
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm hover:border-[#6320EE]"
                            title="معاينة صفحة الهبوط في نافذة جديدة"
                        >
                            <span>معاينة صفحة الهبوط الحية</span>
                            <ArrowUpRight className="w-4 h-4 text-[#FF6B00]" />
                        </a>
                    }
                />

                {/* Tabs Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar scrollbar-none">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                                        : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab 0: Platform Branding & Logo Management */}
                {activeTab === 'branding' && (
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-violet-900/30 shadow-xl space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Palette className="w-5 h-5 text-violet-400" />
                                    <span>إدارة الشعار الرسمي وأيقونة المتصفح (Branding & Identity)</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    ارفع شعار المنصة المعتمد وأيقونة المتصفح (Favicon) ليتم تطبيقها فورياً على جميع صفحات الهبوط ولوحات التحكم
                                </p>
                            </div>
                            {branding?.logo && (
                                <span className="text-[11px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full self-start sm:self-center">
                                    تم رفع شعار مخصص نشط
                                </span>
                            )}
                        </div>

                        <form onSubmit={submitBranding} className="space-y-6">
                            {/* Grid for Logo & Favicon */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* 1. Main Logo Card */}
                                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-white flex items-center gap-2">
                                            <Image className="w-4 h-4 text-violet-400" />
                                            <span>شعار المنصة الرسمي (Platform Logo)</span>
                                        </label>
                                        {branding?.logo && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteBrandingItem('logo')}
                                                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>حذف واستعادة الافتراضي</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Preview Box */}
                                    <div className="p-4 rounded-xl bg-slate-900/90 border border-dashed border-slate-700 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden">
                                        {logoPreview || branding?.logo ? (
                                            <div className="space-y-2 w-full flex flex-col items-center">
                                                <img
                                                    src={logoPreview || branding?.logo}
                                                    alt="معاينة الشعار"
                                                    className="max-h-16 w-auto object-contain mx-auto drop-shadow-md"
                                                />
                                                <span className="text-[10px] text-slate-400 block font-mono">
                                                    {logoPreview ? 'معاينة الملف المختار قبل الحفظ' : 'الشعار المعتمد الحالي على المنصة'}
                                                </span>
                                                {branding?.logo && !logoPreview && (
                                                    <div className="w-full text-[10px] text-violet-300 font-mono bg-violet-950/60 p-2 rounded-lg border border-violet-800/40 break-all select-all flex items-center justify-between gap-2">
                                                        <span className="truncate text-right ltr:text-left direction-ltr">{branding.logo}</span>
                                                        <a
                                                            href={branding.logo}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-violet-400 hover:text-white shrink-0 p-1 hover:bg-violet-800/30 rounded"
                                                            title="فتح الصورة في تبويب جديد"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <BrandLogo size="md" forceVector={true} />
                                                <span className="text-[10px] text-slate-500 block">
                                                    الشعار الافتراضي المتجهي (لم يتم رفع ملف مخصص حتى الآن)
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Input */}
                                    <div>
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/png,image/svg+xml,image/jpeg,image/webp"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="w-full py-2.5 px-4 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            <span>{branding?.logo ? 'اختيار وتغيير الشعار...' : 'رفع ملف الشعار...'}</span>
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                            يدعم PNG أو SVG أو WebP بخلفية شفافة بدقة موصى بها (ارتفاع 60-100px، بحد أقصى 4MB).
                                        </p>
                                        {brandingForm.errors.logo && (
                                            <p className="text-[11px] text-rose-400 mt-1 font-semibold">{brandingForm.errors.logo}</p>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Browser Favicon Card */}
                                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-white flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-orange-400" />
                                            <span>أيقونة المتصفح (Browser Favicon)</span>
                                        </label>
                                        {branding?.favicon && (
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteBrandingItem('favicon')}
                                                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                <span>استعادة الافتراضية</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Mock Browser Tab Preview */}
                                    <div className="p-4 rounded-xl bg-slate-900/90 border border-dashed border-slate-700 flex flex-col items-center justify-center min-h-[140px] text-center">
                                        <span className="text-[10px] text-slate-500 mb-2 font-mono">محاكاة تبويب المتصفح (Browser Tab Preview)</span>
                                        <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-slate-800 rounded-t-xl border border-b-0 border-slate-700 shadow-md">
                                            <img
                                                src={faviconPreview || branding?.favicon || '/favicon.ico'}
                                                alt="Favicon"
                                                className="w-4 h-4 object-contain shrink-0 rounded-sm"
                                            />
                                            <span className="text-xs font-semibold text-slate-200 truncate max-w-[150px]">
                                                {brandingForm.data.site_name_ar || 'GoTransTech'}
                                            </span>
                                            <span className="text-[10px] text-slate-500 ml-1">×</span>
                                        </div>
                                        {branding?.favicon && !faviconPreview && (
                                            <div className="w-full mt-3 text-[10px] text-orange-300 font-mono bg-orange-950/60 p-2 rounded-lg border border-orange-800/40 break-all select-all flex items-center justify-between gap-2">
                                                <span className="truncate text-right ltr:text-left direction-ltr">{branding.favicon}</span>
                                                <a
                                                    href={branding.favicon}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-orange-400 hover:text-white shrink-0 p-1 hover:bg-orange-800/30 rounded"
                                                    title="فتح الأيقونة في تبويب جديد"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Favicon Input */}
                                    <div>
                                        <input
                                            type="file"
                                            id="favicon-upload"
                                            accept="image/x-icon,image/png,image/svg+xml,image/webp"
                                            onChange={handleFaviconChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="favicon-upload"
                                            className="w-full py-2.5 px-4 rounded-xl bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            <span>{branding?.favicon ? 'تغيير أيقونة المتصفح...' : 'رفع أيقونة Favicon...'}</span>
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                            الملفات المدعومة: ICO, PNG, SVG بمقاس مربع موصى به 32×32 أو 64×64 بكسل.
                                        </p>
                                        {brandingForm.errors.favicon && (
                                            <p className="text-[11px] text-rose-400 mt-1 font-semibold">{brandingForm.errors.favicon}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Platform Brand Texts */}
                            <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                    <span>مسميات المنصة والشعار اللفظي (Brand Names & Slogans)</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">اسم المنصة بالعربية</label>
                                        <input
                                            type="text"
                                            value={brandingForm.data.site_name_ar}
                                            onChange={(e) => brandingForm.setData('site_name_ar', e.target.value)}
                                            placeholder="مثال: GoTransTech"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">اسم المنصة بالإنجليزية</label>
                                        <input
                                            type="text"
                                            value={brandingForm.data.site_name_en}
                                            onChange={(e) => brandingForm.setData('site_name_en', e.target.value)}
                                            placeholder="e.g. GoTransTech Platform"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">الشعار اللفظي بالعربية (Slogan)</label>
                                        <input
                                            type="text"
                                            value={brandingForm.data.site_slogan_ar}
                                            onChange={(e) => brandingForm.setData('site_slogan_ar', e.target.value)}
                                            placeholder="مثال: نمول حركة الغد"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">الشعار اللفظي بالإنجليزية</label>
                                        <input
                                            type="text"
                                            value={brandingForm.data.site_slogan_en}
                                            onChange={(e) => brandingForm.setData('site_slogan_en', e.target.value)}
                                            placeholder="e.g. FINANCING WHAT MOVES TOMORROW"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Navbar Brand Display Mode Options */}
                            <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                            <LayoutTemplate className="w-4 h-4 text-violet-400" />
                                            <span>طريقة عرض الهوية في الشريط العلوي (Navbar Display Mode)</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                            اختر ما إذا كنت ترغب في عرض الشعار الرسمي فقط، أو اسم المنصة النصي فقط، أو كليهما معاً في الـ Navbar بصفحة الهبوط الرئيسية
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 self-start sm:self-center shrink-0">
                                        الحالي: {brandingForm.data.navbar_brand_display === 'logo' ? 'الشعار فقط' : brandingForm.data.navbar_brand_display === 'name' ? 'اسم المنصة فقط' : 'الشعار والاسم معاً'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {/* Option 1: Both Logo & Name */}
                                    <div
                                        onClick={() => brandingForm.setData('navbar_brand_display', 'both')}
                                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                                            brandingForm.data.navbar_brand_display === 'both'
                                                ? 'bg-[#6320EE]/15 border-[#6320EE] text-white shadow-md shadow-violet-600/15'
                                                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-200">الشعار واسم المنصة معاً (الافتراضي)</span>
                                            <input
                                                type="radio"
                                                name="navbar_brand_display"
                                                value="both"
                                                checked={brandingForm.data.navbar_brand_display === 'both'}
                                                onChange={() => brandingForm.setData('navbar_brand_display', 'both')}
                                                className="text-[#6320EE] focus:ring-[#6320EE]"
                                            />
                                        </div>
                                        <div className="p-3 rounded-lg bg-[#06081B] border border-slate-800 flex items-center justify-center min-h-[50px]">
                                            <BrandLogo size="sm" displayMode="both" forceVector={!branding?.logo} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            يعرض الأيقونة أو الشعار المرفوع وبجانبه اسم المنصة النصي بالكامل.
                                        </p>
                                    </div>

                                    {/* Option 2: Logo Only */}
                                    <div
                                        onClick={() => brandingForm.setData('navbar_brand_display', 'logo')}
                                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                                            brandingForm.data.navbar_brand_display === 'logo'
                                                ? 'bg-[#6320EE]/15 border-[#6320EE] text-white shadow-md shadow-violet-600/15'
                                                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-200">الشعار الرسمي فقط</span>
                                            <input
                                                type="radio"
                                                name="navbar_brand_display"
                                                value="logo"
                                                checked={brandingForm.data.navbar_brand_display === 'logo'}
                                                onChange={() => brandingForm.setData('navbar_brand_display', 'logo')}
                                                className="text-[#6320EE] focus:ring-[#6320EE]"
                                            />
                                        </div>
                                        <div className="p-3 rounded-lg bg-[#06081B] border border-slate-800 flex items-center justify-center min-h-[50px]">
                                            <BrandLogo size="sm" displayMode="logo" forceVector={!branding?.logo} />
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            يعرض أيقونة الشعار فقط دون النص (مظهر عصري وموجز).
                                        </p>
                                    </div>

                                    {/* Option 3: Site Name Only */}
                                    <div
                                        onClick={() => brandingForm.setData('navbar_brand_display', 'name')}
                                        className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                                            brandingForm.data.navbar_brand_display === 'name'
                                                ? 'bg-[#6320EE]/15 border-[#6320EE] text-white shadow-md shadow-violet-600/15'
                                                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-200">اسم المنصة النصي فقط</span>
                                            <input
                                                type="radio"
                                                name="navbar_brand_display"
                                                value="name"
                                                checked={brandingForm.data.navbar_brand_display === 'name'}
                                                onChange={() => brandingForm.setData('navbar_brand_display', 'name')}
                                                className="text-[#6320EE] focus:ring-[#6320EE]"
                                            />
                                        </div>
                                        <div className="p-3 rounded-lg bg-[#06081B] border border-slate-800 flex items-center justify-center min-h-[50px]">
                                            <BrandLogo size="sm" displayMode="name" />
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed">
                                            يعرض الاسم المعتمد للمنصة GoTransTech بنص بارز بدون أيقونة الشعار.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Navbar Brand Size Slider Control */}
                            <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-6">
                                {/* Header of section */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div>
                                        <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                            <Sliders className="w-4 h-4 text-[#FF6B00]" />
                                            <span>شريط التحكم في مقاس وارتفاع الشعار (Logo Size Slider)</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                            اسحب الخط لزيادة أو إنقاص حجم وارتفاع الشعار، وستلاحظ تغيّر المقاس بالكامل لحظياً وتفاعلياً
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-violet-900/60 flex items-center gap-1.5 shadow-sm">
                                            <span className="text-[11px] text-slate-400">الارتفاع المختار:</span>
                                            <span className="text-sm font-black text-[#FF6B00] font-mono">{brandingForm.data.navbar_brand_size}</span>
                                            <span className="text-[11px] text-slate-400 font-mono">px</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => brandingForm.setData('navbar_brand_size', 36)}
                                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                            title="إعادة ضبط للحجم القياسي الموصى به (36px)"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                                            <span>الافتراضي (36px)</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Slider Bar & Stepper Controls */}
                                <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
                                    <div className="flex items-center gap-3 sm:gap-4">
                                        {/* Decrease Stepper Button */}
                                        <button
                                            type="button"
                                            onClick={() => brandingForm.setData('navbar_brand_size', Math.max(20, (parseInt(brandingForm.data.navbar_brand_size, 10) || 36) - 2))}
                                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-[#6320EE] text-slate-300 hover:text-white border border-slate-700 hover:border-[#6320EE] flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
                                            title="إنقاص الحجم بمقدار 2 بكسل"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>

                                        {/* Slider Line Track */}
                                        <div className="flex-1 relative py-2">
                                            <input
                                                type="range"
                                                min="20"
                                                max="96"
                                                step="1"
                                                value={brandingForm.data.navbar_brand_size}
                                                onChange={(e) => brandingForm.setData('navbar_brand_size', parseInt(e.target.value, 10))}
                                                className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#6320EE] focus:outline-none border border-slate-800"
                                            />
                                            {/* Tick Marks along the line */}
                                            <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2.5 px-1 select-none flex-wrap gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 24)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 24 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    24px (صغير)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 36)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 36 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    36px (متوسط)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 48)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 48 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    48px (كبير)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 64)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 64 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    64px (عريض)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 80)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 80 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    80px (فائق)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 96)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 96 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    96px (أقصى مقاس)
                                                </button>
                                            </div>
                                        </div>

                                        {/* Increase Stepper Button */}
                                        <button
                                            type="button"
                                            onClick={() => brandingForm.setData('navbar_brand_size', Math.min(96, (parseInt(brandingForm.data.navbar_brand_size, 10) || 36) + 2))}
                                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-[#6320EE] text-slate-300 hover:text-white border border-slate-700 hover:border-[#6320EE] flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
                                            title="زيادة الحجم بمقدار 2 بكسل"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Quick Preset Buttons */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800/90 flex-wrap">
                                        <span className="text-[11px] text-slate-400 font-medium">أحجام سريعة:</span>
                                        {[
                                            { px: 28, label: 'مدمج (28px)' },
                                            { px: 36, label: 'قياسي (36px)' },
                                            { px: 44, label: 'بارز (44px)' },
                                            { px: 54, label: 'كبير (54px)' },
                                            { px: 68, label: 'عريض (68px)' },
                                        ].map((preset) => (
                                            <button
                                                key={preset.px}
                                                type="button"
                                                onClick={() => brandingForm.setData('navbar_brand_size', preset.px)}
                                                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                                    parseInt(brandingForm.data.navbar_brand_size, 10) === preset.px
                                                        ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                                }`}
                                            >
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Live Interactive Preview Showcase */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
                                            <span>معاينة حية ومباشرة للشعار أثناء تحريك الخط:</span>
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-400">
                                            الارتفاع الحالي: <strong className="text-white">{brandingForm.data.navbar_brand_size}px</strong>
                                        </span>
                                    </div>

                                    {/* Mock Landing Navbar Showcase */}
                                    <div className="rounded-2xl border border-violet-900/50 bg-[#06081B] p-6 sm:p-8 flex flex-col items-center justify-center min-h-[140px] shadow-2xl relative overflow-hidden">
                                        <div className="relative z-10 flex items-center justify-center w-full transition-all duration-150 py-2">
                                            <BrandLogo
                                                size={brandingForm.data.navbar_brand_size}
                                                displayMode={brandingForm.data.navbar_brand_display}
                                                forceVector={!branding?.logo}
                                            />
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-[11px] text-slate-400 font-mono">
                                            <span>نمط العرض المعتمد: {brandingForm.data.navbar_brand_display === 'logo' ? 'الشعار فقط' : brandingForm.data.navbar_brand_display === 'name' ? 'الاسم فقط' : 'الشعار والاسم معاً'}</span>
                                            <span>ارتفاع الشعار: {brandingForm.data.navbar_brand_size}px</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                                <button
                                    type="submit"
                                    disabled={brandingForm.processing}
                                    className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{brandingForm.processing ? 'جارِ الحفظ والرفع...' : 'حفظ تعديلات الهوية والشعار'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 1: Hero Section */}
                {activeTab === 'hero' && (
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">تعديل القسم الرئيسي (Hero Section)</h3>
                                <p className="text-xs text-slate-500">أول ما يراه الزائر عند دخول المنصة: الشارة الترحيبية، العنوان العريض، والوصف</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(heroForm, heroSec.id, e)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    نص الشارة العلوية (Badge Text)
                                </label>
                                <input
                                    type="text"
                                    value={heroForm.data.content.badge_text}
                                    onChange={(e) => heroForm.setData('content', { ...heroForm.data.content, badge_text: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    placeholder="منصة التمويل والاستثمار اللوجستي..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        العنوان الرئيسي (عربي) *
                                    </label>
                                    <textarea
                                        value={heroForm.data.title_ar}
                                        onChange={(e) => heroForm.setData('title_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white h-24 leading-relaxed focus:outline-none focus:border-violet-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        العنوان الرئيسي (English)
                                    </label>
                                    <textarea
                                        value={heroForm.data.title_en}
                                        onChange={(e) => heroForm.setData('title_en', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white h-24 leading-relaxed focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        الوصف والشرح الترويجي (عربي)
                                    </label>
                                    <textarea
                                        value={heroForm.data.subtitle_ar}
                                        onChange={(e) => heroForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white h-24 leading-relaxed focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        الوصف والشرح الترويجي (English)
                                    </label>
                                    <textarea
                                        value={heroForm.data.subtitle_en}
                                        onChange={(e) => heroForm.setData('subtitle_en', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white h-24 leading-relaxed focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        نص زر الدعوة الرئيسي (Primary CTA)
                                    </label>
                                    <input
                                        type="text"
                                        value={heroForm.data.content.primary_button_text}
                                        onChange={(e) => heroForm.setData('content', { ...heroForm.data.content, primary_button_text: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        نص زر الدعوة الثانوي (Secondary CTA)
                                    </label>
                                    <input
                                        type="text"
                                        value={heroForm.data.content.secondary_button_text}
                                        onChange={(e) => heroForm.setData('content', { ...heroForm.data.content, secondary_button_text: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={heroForm.processing}
                                    className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{heroForm.processing ? 'جاري الحفظ...' : 'حفظ تغييرات القسم الرئيسي'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 2: Stats Section */}
                {activeTab === 'stats' && (
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">تعديل مسميات وعناوين بطاقات الإحصاءات</h3>
                                <p className="text-xs text-slate-500">الأرقام تأتي تلقائياً من النظام، ويمكنك هنا تخصيص تسميات البطاقات المعروضة</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(statsForm, statsSec.id, e)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        عنوان بطاقة المهام الممولة
                                    </label>
                                    <input
                                        type="text"
                                        value={statsForm.data.content.funded_tasks_label}
                                        onChange={(e) => statsForm.setData('content', { ...statsForm.data.content, funded_tasks_label: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        عنوان بطاقة حجم الاستثمارات
                                    </label>
                                    <input
                                        type="text"
                                        value={statsForm.data.content.invested_amount_label}
                                        onChange={(e) => statsForm.setData('content', { ...statsForm.data.content, invested_amount_label: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        عنوان بطاقة المستثمرين
                                    </label>
                                    <input
                                        type="text"
                                        value={statsForm.data.content.active_investors_label}
                                        onChange={(e) => statsForm.setData('content', { ...statsForm.data.content, active_investors_label: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        عنوان بطاقة الشركات اللوجستية
                                    </label>
                                    <input
                                        type="text"
                                        value={statsForm.data.content.companies_label}
                                        onChange={(e) => statsForm.setData('content', { ...statsForm.data.content, companies_label: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={statsForm.processing}
                                    className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{statsForm.processing ? 'جاري الحفظ...' : 'حفظ تسميات الإحصاءات'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 3: How It Works */}
                {activeTab === 'how' && (
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">خطوات العمل وآلية التمويل اللوجستي</h3>
                                <p className="text-xs text-slate-500">تعديل نصوص وتفاصيل الخطوات التي تشرح آلية عمل المنصة للمستخدم</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const currentSteps = howForm.data.content.steps || [];
                                    const nextNum = currentSteps.length + 1;
                                    const updated = [
                                        ...currentSteps,
                                        { step: nextNum, title: `خطوة جديدة ${nextNum}`, description: 'شرح وتفاصيل هذه الخطوة...' }
                                    ];
                                    howForm.setData('content', { ...howForm.data.content, steps: updated });
                                }}
                                className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                <span>إضافة خطوة جديدة</span>
                            </button>
                        </div>

                        <form onSubmit={(e) => submitForm(howForm, howSec.id, e)} className="space-y-4">
                            {/* Section Title & Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        عنوان قسم خطوات العمل
                                    </label>
                                    <input
                                        type="text"
                                        value={howForm.data.title_ar}
                                        onChange={(e) => howForm.setData('title_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                        placeholder="كيف تعمل المنصة؟"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        الوصف التوضيحي للقسم
                                    </label>
                                    <input
                                        type="text"
                                        value={howForm.data.subtitle_ar}
                                        onChange={(e) => howForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        placeholder="دورة تمويل واستثمار مؤتمتة بالكامل..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {howForm.data.content.steps?.map((step, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-[#6320EE] text-white font-bold text-xs flex items-center justify-center">
                                                    {idx + 1}
                                                </span>
                                                <span className="font-bold text-xs text-slate-900 dark:text-white">الخطوة {idx + 1}</span>
                                            </div>
                                            {howForm.data.content.steps.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = howForm.data.content.steps.filter((_, i) => i !== idx);
                                                        howForm.setData('content', { ...howForm.data.content, steps: updated });
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                    title="حذف هذه الخطوة"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                    عنوان الخطوة
                                                </label>
                                                <input
                                                    type="text"
                                                    value={step.title}
                                                    onChange={(e) => {
                                                        const updated = [...howForm.data.content.steps];
                                                        updated[idx].title = e.target.value;
                                                        howForm.setData('content', { ...howForm.data.content, steps: updated });
                                                    }}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                    شرح وتفاصيل الخطوة
                                                </label>
                                                <input
                                                    type="text"
                                                    value={step.description}
                                                    onChange={(e) => {
                                                        const updated = [...howForm.data.content.steps];
                                                        updated[idx].description = e.target.value;
                                                        howForm.setData('content', { ...howForm.data.content, steps: updated });
                                                    }}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={howForm.processing}
                                    className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{howForm.processing ? 'جاري الحفظ...' : 'حفظ خطوات العمل'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 4: Features Section */}
                {activeTab === 'features' && (
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">مميزات وحلول المستثمرين والشركات اللوجستية</h3>
                                <p className="text-xs text-slate-500">إضافة وتعديل وحذف المزايا المعروضة لكل من المستثمرين وشركات الشحن</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(featuresForm, featuresSec.id, e)} className="space-y-6">
                            {/* Section Title & Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        عنوان قسم المميزات والحلول
                                    </label>
                                    <input
                                        type="text"
                                        value={featuresForm.data.title_ar}
                                        onChange={(e) => featuresForm.setData('title_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                        placeholder="حلول ومميزات مصممة خصيصاً للطرفين"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        الوصف التوضيحي للقسم
                                    </label>
                                    <input
                                        type="text"
                                        value={featuresForm.data.subtitle_ar}
                                        onChange={(e) => featuresForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        placeholder="مزايا استثنائية تمكّن المستثمرين وشركات النقل..."
                                    />
                                </div>
                            </div>

                            {/* Investor Features */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-[#6320EE]">مميزات المستثمرين:</h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...(featuresForm.data.content.investor_features || []), 'ميزة جديدة للمستثمر'];
                                            featuresForm.setData('content', { ...featuresForm.data.content, investor_features: updated });
                                        }}
                                        className="px-3 py-1 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-[#5217D4]/20 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>إضافة ميزة</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {featuresForm.data.content.investor_features?.map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={f}
                                                onChange={(e) => {
                                                    const updated = [...featuresForm.data.content.investor_features];
                                                    updated[idx] = e.target.value;
                                                    featuresForm.setData('content', { ...featuresForm.data.content, investor_features: updated });
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = featuresForm.data.content.investor_features.filter((_, i) => i !== idx);
                                                    featuresForm.setData('content', { ...featuresForm.data.content, investor_features: updated });
                                                }}
                                                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                title="حذف الميزة"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Company Features */}
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-[#FF6B00]">مميزات الشركات اللوجستية:</h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...(featuresForm.data.content.company_features || []), 'ميزة جديدة للشركات اللوجستية'];
                                            featuresForm.setData('content', { ...featuresForm.data.content, company_features: updated });
                                        }}
                                        className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-[#FF6B00] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>إضافة ميزة</span>
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {featuresForm.data.content.company_features?.map((f, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={f}
                                                onChange={(e) => {
                                                    const updated = [...featuresForm.data.content.company_features];
                                                    updated[idx] = e.target.value;
                                                    featuresForm.setData('content', { ...featuresForm.data.content, company_features: updated });
                                                }}
                                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = featuresForm.data.content.company_features.filter((_, i) => i !== idx);
                                                    featuresForm.setData('content', { ...featuresForm.data.content, company_features: updated });
                                                }}
                                                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                title="حذف الميزة"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={featuresForm.processing}
                                    className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{featuresForm.processing ? 'جاري الحفظ...' : 'حفظ المميزات والحلول'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 5: FAQ Section */}
                {activeTab === 'faq' && (
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">إدارة الأسئلة الشائعة (FAQ)</h3>
                                <p className="text-xs text-slate-500">إضافة وتعديل الأسئلة الشائعة والإجابات عنها لإرشاد زوار المنصة</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = [
                                        ...(faqForm.data.content.faqs || []),
                                        { q: 'سؤال شائع جديد؟', a: 'الإجابة التفصيلية عن هذا السؤال...' }
                                    ];
                                    faqForm.setData('content', { ...faqForm.data.content, faqs: updated });
                                }}
                                className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                <span>إضافة سؤال جديد</span>
                            </button>
                        </div>

                        <form onSubmit={(e) => submitForm(faqForm, faqSec.id, e)} className="space-y-4">
                            {/* Section Title & Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        عنوان قسم الأسئلة الشائعة
                                    </label>
                                    <input
                                        type="text"
                                        value={faqForm.data.title_ar}
                                        onChange={(e) => faqForm.setData('title_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                        placeholder="الأسئلة الشائعة"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        الوصف التوضيحي للقسم
                                    </label>
                                    <input
                                        type="text"
                                        value={faqForm.data.subtitle_ar}
                                        onChange={(e) => faqForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        placeholder="كل ما تحتاج لمعرفته حول الاستثمار والربط..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {faqForm.data.content.faqs?.map((faq, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-violet-600 dark:text-violet-400">سؤال #{idx + 1}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = faqForm.data.content.faqs.filter((_, i) => i !== idx);
                                                    faqForm.setData('content', { ...faqForm.data.content, faqs: updated });
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                                title="حذف هذا السؤال"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                نص السؤال
                                            </label>
                                            <input
                                                type="text"
                                                value={faq.q}
                                                onChange={(e) => {
                                                    const updated = [...faqForm.data.content.faqs];
                                                    updated[idx].q = e.target.value;
                                                    faqForm.setData('content', { ...faqForm.data.content, faqs: updated });
                                                }}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                الإجابة التفصيلية
                                            </label>
                                            <textarea
                                                value={faq.a}
                                                onChange={(e) => {
                                                    const updated = [...faqForm.data.content.faqs];
                                                    updated[idx].a = e.target.value;
                                                    faqForm.setData('content', { ...faqForm.data.content, faqs: updated });
                                                }}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white h-20 leading-relaxed focus:outline-none focus:border-violet-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={faqForm.processing}
                                    className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{faqForm.processing ? 'جاري الحفظ...' : 'حفظ الأسئلة الشائعة'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tab 6: Footer & Contact */}
                {activeTab === 'contact' && (
                    <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <PhoneCall className="w-5 h-5 text-violet-400" />
                                    <span>إدارة وتخصيص فوتر صفحة الهبوط وبيانات التواصل (Footer & Contact)</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    التحكم الكامل بمحتوى أسفل الصفحة الرئيسية (Footer): النبذة، قنوات التواصل، أرقام الهاتف، الواتساب، والبيانات النظامية
                                </p>
                            </div>
                            <div className="flex items-center gap-2 self-start sm:self-center">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer bg-slate-100 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={contactForm.data.is_active}
                                        onChange={(e) => contactForm.setData('is_active', e.target.checked)}
                                        className="rounded text-[#6320EE] focus:ring-[#6320EE]"
                                    />
                                    <span>عرض الفوتر في صفحة الهبوط</span>
                                </label>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(contactForm, contactSec.id, e)} className="space-y-6">
                            {/* Section 1: Footer Bio & Description */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                    <span>النبذة التعريفية للمنصة في الفوتر</span>
                                </h4>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        النص التعريفي (يظهر تحت شعار المنصة في العمود الأول من الفوتر)
                                    </label>
                                    <textarea
                                        value={contactForm.data.content.description_ar}
                                        onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, description_ar: e.target.value })}
                                        placeholder="نبذة مختصرة عن المنصة ورسالتها اللوجستية والمالية..."
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white h-20 leading-relaxed focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Direct Contact Channels */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <PhoneCall className="w-4 h-4 text-orange-400" />
                                    <span>أرقام وقنوات التواصل وخدمة العملاء</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رقم هاتف الاتصال / الموحد
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.phone}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, phone: e.target.value })}
                                            placeholder="+966 11 234 5678"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رقم الواتساب (WhatsApp المباشر)
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.whatsapp_number}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, whatsapp_number: e.target.value })}
                                            placeholder="+966501234567"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            البريد الإلكتروني للدعم
                                        </label>
                                        <input
                                            type="email"
                                            value={contactForm.data.content.email}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, email: e.target.value })}
                                            placeholder="support@gotranstech.sa"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            أوقات العمل الرسمية
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.working_hours}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, working_hours: e.target.value })}
                                            placeholder="الأحد - الخميس: 9:00 ص - 6:00 م"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Social Media Channels */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-violet-400" />
                                    <span>روابط قنوات التواصل الاجتماعي (Social Media)</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رابط منصة X (تويتر سابقاً)
                                        </label>
                                        <input
                                            type="url"
                                            value={contactForm.data.content.twitter_url}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, twitter_url: e.target.value })}
                                            placeholder="https://x.com/gotranstech"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رابط شبكة LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            value={contactForm.data.content.linkedin_url}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, linkedin_url: e.target.value })}
                                            placeholder="https://linkedin.com/company/gotranstech"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رابط حساب Instagram
                                        </label>
                                        <input
                                            type="url"
                                            value={contactForm.data.content.instagram_url}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, instagram_url: e.target.value })}
                                            placeholder="https://instagram.com/gotranstech"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رابط صفحة Facebook
                                        </label>
                                        <input
                                            type="url"
                                            value={contactForm.data.content.facebook_url}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, facebook_url: e.target.value })}
                                            placeholder="https://facebook.com/gotranstech"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رابط قناة YouTube
                                        </label>
                                        <input
                                            type="url"
                                            value={contactForm.data.content.youtube_url}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, youtube_url: e.target.value })}
                                            placeholder="https://youtube.com/@gotranstech"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رابط قناة / حساب Telegram
                                        </label>
                                        <input
                                            type="url"
                                            value={contactForm.data.content.telegram_url}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, telegram_url: e.target.value })}
                                            placeholder="https://t.me/gotranstech"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Address, Commercial & Legal Info */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>المقر والبيانات التجارية وحقوق النشر</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            العنوان والمقر الرئيسي للمنصة
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.address}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, address: e.target.value })}
                                            placeholder="الرياض - طريق الملك فهد - مركز الملك عبد الله المالي (KAFD)"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            رقم السجل التجاري (CR Number)
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.cr_number}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, cr_number: e.target.value })}
                                            placeholder="1010889900"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            الرقم الضريبي الموحد (VAT / Tax Number)
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.tax_number}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, tax_number: e.target.value })}
                                            placeholder="300099887700003"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            نص حقوق الملكية (Copyright Text)
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.copyright_text}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, copyright_text: e.target.value })}
                                            placeholder="جميع الحقوق محفوظة © منصة GoTransTech للتقنية المالية"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={contactForm.processing}
                                    className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{contactForm.processing ? 'جاري الحفظ...' : 'حفظ إعدادات الفوتر وبيانات التواصل'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
