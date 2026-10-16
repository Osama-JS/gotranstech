import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
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
    RotateCcw,
    Sun,
    Moon
} from 'lucide-react';

export default function AdminLandingCms({ sections = [], branding = {}, landingUrl = null }) {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
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
    const [logoDarkPreview, setLogoDarkPreview] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    // Branding & Logo Form
    const brandingForm = useForm({
        logo: null,
        logo_dark: null,
        favicon: null,
        site_name_ar: branding?.site_name_ar || 'GoTransTech',
        site_name_en: branding?.site_name_en || 'GoTransTech Platform',
        site_slogan_ar: branding?.site_slogan_ar || t('admin.cms.default_site_slogan_ar'),
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

    const handleLogoDarkChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            brandingForm.setData('logo_dark', file);
            setLogoDarkPreview(URL.createObjectURL(file));
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
                setLogoDarkPreview(null);
                setFaviconPreview(null);
            },
        });
    };

    const handleDeleteBrandingItem = (type) => {
        const label = type === 'logo'
            ? (t('admin.cms.platform_logo_light_title') || 'شعار الوضع النهاري')
            : (type === 'logo_dark'
                ? (t('admin.cms.platform_logo_dark_title') || 'شعار الوضع الليلي')
                : (t('admin.cms.browser_favicon_title') || 'أيقونة المتصفح Favicon'));
        if (confirm(t('admin.cms.confirm_delete_branding', { label }))) {
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
            funded_tasks_label: statsSec.content?.funded_tasks_label || t('admin.cms.default_tasks_label'),
            invested_amount_label: statsSec.content?.invested_amount_label || t('admin.cms.default_invested_label'),
            active_investors_label: statsSec.content?.active_investors_label || t('admin.cms.default_investors_label'),
            companies_label: statsSec.content?.companies_label || t('admin.cms.default_companies_label'),
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
            investor_card_title: featuresSec.content?.investor_card_title || t('admin.cms.default_inv_title'),
            investor_card_desc: featuresSec.content?.investor_card_desc || t('admin.cms.default_inv_desc'),
            company_card_title: featuresSec.content?.company_card_title || t('admin.cms.default_comp_title'),
            company_card_desc: featuresSec.content?.company_card_desc || t('admin.cms.default_comp_desc'),
            pillar1_title: featuresSec.content?.pillar1_title || t('admin.cms.default_p1_title'),
            pillar1_desc: featuresSec.content?.pillar1_desc || t('admin.cms.default_p1_desc'),
            pillar2_title: featuresSec.content?.pillar2_title || t('admin.cms.default_p2_title'),
            pillar2_desc: featuresSec.content?.pillar2_desc || t('admin.cms.default_p2_desc'),
            pillar3_title: featuresSec.content?.pillar3_title || t('admin.cms.default_p3_title'),
            pillar3_desc: featuresSec.content?.pillar3_desc || t('admin.cms.default_p3_desc'),
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
        title_ar: contactSec.title_ar || t('admin.cms.default_contact_title'),
        title_en: contactSec.title_en || 'Contact & Footer Info',
        subtitle_ar: contactSec.subtitle_ar || t('admin.cms.default_contact_sub'),
        subtitle_en: contactSec.subtitle_en || 'Technical support channels, customer service, and official links',
        content: {
            description_ar: contactSec.content?.description_ar || t('admin.cms.default_contact_desc'),
            email: contactSec.content?.email || 'support@gotranstech.sa',
            phone: contactSec.content?.phone || '+966 11 234 5678',
            whatsapp_number: contactSec.content?.whatsapp_number || '+966501234567',
            address: contactSec.content?.address || t('admin.cms.default_contact_addr'),
            working_hours: contactSec.content?.working_hours || t('admin.cms.default_contact_hours'),
            twitter_url: contactSec.content?.twitter_url || 'https://x.com',
            linkedin_url: contactSec.content?.linkedin_url || 'https://linkedin.com',
            instagram_url: contactSec.content?.instagram_url || 'https://instagram.com',
            facebook_url: contactSec.content?.facebook_url || '',
            youtube_url: contactSec.content?.youtube_url || '',
            telegram_url: contactSec.content?.telegram_url || '',
            cr_number: contactSec.content?.cr_number || '1010889900',
            tax_number: contactSec.content?.tax_number || '300099887700003',
            copyright_text: contactSec.content?.copyright_text || t('admin.cms.default_contact_copy'),
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
        { id: 'branding', label: t('admin.cms.tab_branding'), icon: Palette, sec: null },
        { id: 'hero', label: t('admin.cms.tab_hero_short'), icon: Sparkles, sec: heroSec },
        { id: 'stats', label: t('admin.cms.tab_stats_short'), icon: BarChart3, sec: statsSec },
        { id: 'how', label: t('admin.cms.tab_how_short'), icon: Layers, sec: howSec },
        { id: 'features', label: t('admin.cms.tab_features_short'), icon: CheckCircle2, sec: featuresSec },
        { id: 'faq', label: t('admin.cms.tab_faq_short'), icon: HelpCircle, sec: faqSec },
        { id: 'contact', label: t('admin.cms.tab_footer_short'), icon: PhoneCall, sec: contactSec },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('admin.cms.page_title')} />

            <div className="space-y-6 pb-12 max-w-6xl mx-auto">
                {/* Header */}
                <AdminPageHeader
                    title={t('admin.cms.header_title')}
                    subtitle={t('admin.cms.header_subtitle')}
                    breadcrumbs={[
                        { label: t('common.home'), url: route('admin.dashboard') },
                        { label: t('admin.cms.header_title') }
                    ]}
                    icon={LayoutTemplate}
                    iconColor="text-violet-400"
                    badge={{ text: t('admin.cms.badge_central_control'), color: 'brand' }}
                    actions={
                        <a
                            href={previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-sm hover:border-[#6320EE]"
                            title={t('admin.cms.preview_landing_title')}
                        >
                            <span>{t('admin.cms.preview_landing_btn')}</span>
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
                                    <span>{t('admin.cms.branding_title')}</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {t('admin.cms.branding_desc')}
                                </p>
                            </div>
                            {branding?.logo && (
                                <span className="text-[11px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 px-3 py-1 rounded-full self-start sm:self-center">
                                    {t('admin.cms.active_custom_logo')}
                                </span>
                            )}
                        </div>

                        <form onSubmit={submitBranding} className="space-y-6">
                            {/* Grid for Light Logo, Dark Logo & Favicon */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* 1. Light Mode Logo Card */}
                                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-white flex items-center gap-2">
                                                <Sun className="w-4 h-4 text-amber-400" />
                                                <span>{t('admin.cms.platform_logo_light_title') || 'شعار الوضع النهاري'}</span>
                                            </label>
                                            {branding?.logo && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteBrandingItem('logo')}
                                                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>{t('admin.cms.btn_restore_default') || 'استعادة الافتراضي'}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Light Mode Preview Box (Simulates Light Background) */}
                                        <div className="p-4 rounded-xl bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden shadow-inner">
                                            <span className="absolute top-2 start-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/20 flex items-center gap-1">
                                                <Sun className="w-2.5 h-2.5 text-amber-600" />
                                                <span>خلفية نهارية فاتحة</span>
                                            </span>
                                            {logoPreview || branding?.logo ? (
                                                <div className="space-y-2 w-full flex flex-col items-center pt-3">
                                                    <img
                                                        src={logoPreview || branding?.logo}
                                                        alt="شعار الوضع النهاري"
                                                        className="max-h-16 w-auto object-contain mx-auto drop-shadow-sm"
                                                    />
                                                    <span className="text-[10px] text-slate-500 block font-mono">
                                                        {logoPreview ? (t('admin.cms.preview_selected_file') || 'معاينة الملف المختار') : (t('admin.cms.current_active_logo') || 'الشعار النهاري النشط')}
                                                    </span>
                                                    {branding?.logo && !logoPreview && (
                                                        <div className="w-full text-[10px] text-slate-700 font-mono bg-white/90 p-2 rounded-lg border border-slate-200 break-all select-all flex items-center justify-between gap-2 shadow-xs">
                                                            <span className="truncate text-right ltr:text-left direction-ltr">{branding.logo}</span>
                                                            <a
                                                                href={branding.logo}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-violet-600 hover:text-violet-800 shrink-0 p-1 hover:bg-slate-100 rounded"
                                                                title={t('admin.cms.open_image_tab') || 'فتح الصورة'}
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2 pt-3">
                                                    <BrandLogo size="md" isLight={true} forceVector={true} />
                                                    <span className="text-[10px] text-slate-500 block">
                                                        {t('admin.cms.default_vector_logo') || 'الشعار المتجهي الافتراضي'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Light Logo Input */}
                                    <div>
                                        <input
                                            type="file"
                                            id="logo-upload"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="logo-upload"
                                            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <UploadCloud className="w-4 h-4 text-amber-400" />
                                            <span>{branding?.logo ? 'تغيير شعار الوضع النهاري' : 'رفع شعار الوضع النهاري'}</span>
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                            مخصص للعرض على القوائم والخلفيات الفاتحة في الوضع النهاري (PNG شفاف أو WebP).
                                        </p>
                                        {brandingForm.errors.logo && (
                                            <p className="text-[11px] text-rose-400 mt-1 font-semibold">{brandingForm.errors.logo}</p>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Dark Mode Logo Card */}
                                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-white flex items-center gap-2">
                                                <Moon className="w-4 h-4 text-violet-400" />
                                                <span>{t('admin.cms.platform_logo_dark_title') || 'شعار الوضع الليلي'}</span>
                                            </label>
                                            {branding?.logo_dark && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteBrandingItem('logo_dark')}
                                                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>{t('admin.cms.btn_restore_default') || 'استعادة الافتراضي'}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Dark Mode Preview Box (Simulates Dark Deep Background) */}
                                        <div className="p-4 rounded-xl bg-[#070A1E] border border-dashed border-violet-900/60 flex flex-col items-center justify-center min-h-[140px] text-center relative overflow-hidden shadow-inner">
                                            <span className="absolute top-2 start-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20 flex items-center gap-1">
                                                <Moon className="w-2.5 h-2.5 text-violet-400" />
                                                <span>خلفية ليلية داكنة</span>
                                            </span>
                                            {logoDarkPreview || branding?.logo_dark ? (
                                                <div className="space-y-2 w-full flex flex-col items-center pt-3">
                                                    <img
                                                        src={logoDarkPreview || branding?.logo_dark}
                                                        alt="شعار الوضع الليلي"
                                                        className="max-h-16 w-auto object-contain mx-auto drop-shadow-md"
                                                    />
                                                    <span className="text-[10px] text-slate-400 block font-mono">
                                                        {logoDarkPreview ? (t('admin.cms.preview_selected_file') || 'معاينة الملف المختار') : (t('admin.cms.current_active_logo') || 'الشعار الليلي النشط')}
                                                    </span>
                                                    {branding?.logo_dark && !logoDarkPreview && (
                                                        <div className="w-full text-[10px] text-violet-300 font-mono bg-violet-950/60 p-2 rounded-lg border border-violet-800/40 break-all select-all flex items-center justify-between gap-2">
                                                            <span className="truncate text-right ltr:text-left direction-ltr">{branding.logo_dark}</span>
                                                            <a
                                                                href={branding.logo_dark}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-violet-400 hover:text-white shrink-0 p-1 hover:bg-violet-800/30 rounded"
                                                                title={t('admin.cms.open_image_tab') || 'فتح الصورة'}
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="space-y-2 pt-3">
                                                    <BrandLogo size="md" isLight={false} forceVector={true} />
                                                    <span className="text-[10px] text-slate-500 block">
                                                        {t('admin.cms.default_vector_logo') || 'الشعار المتجهي الافتراضي'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Dark Logo Input */}
                                    <div>
                                        <input
                                            type="file"
                                            id="logo-dark-upload"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={handleLogoDarkChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="logo-dark-upload"
                                            className="w-full py-2.5 px-4 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 text-violet-400 border border-violet-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <UploadCloud className="w-4 h-4 text-violet-400" />
                                            <span>{branding?.logo_dark ? 'تغيير شعار الوضع الليلي' : 'رفع شعار الوضع الليلي'}</span>
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                            مخصص للعرض على القوائم الداكنة في الوضع الليلي وصفحات الهبوط الداكنة.
                                        </p>
                                        {brandingForm.errors.logo_dark && (
                                            <p className="text-[11px] text-rose-400 mt-1 font-semibold">{brandingForm.errors.logo_dark}</p>
                                        )}
                                    </div>
                                </div>

                                {/* 3. Browser Favicon Card */}
                                <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-bold text-white flex items-center gap-2">
                                                <Globe className="w-4 h-4 text-orange-400" />
                                                <span>{t('admin.cms.browser_favicon_title') || 'أيقونة المتصفح Favicon'}</span>
                                            </label>
                                            {branding?.favicon && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteBrandingItem('favicon')}
                                                    className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>{t('admin.cms.btn_restore_favicon') || 'استعادة الافتراضي'}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Mock Browser Tab Preview */}
                                        <div className="p-4 rounded-xl bg-slate-900/90 border border-dashed border-slate-700 flex flex-col items-center justify-center min-h-[140px] text-center">
                                            <span className="text-[10px] text-slate-500 mb-2 font-mono">{t('admin.cms.browser_tab_preview') || 'محاكاة لسان المتصفح'}</span>
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
                                                        title={t('admin.cms.open_favicon_tab') || 'فتح الأيقونة'}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upload Favicon Input */}
                                    <div>
                                        <input
                                            type="file"
                                            id="favicon-upload"
                                            accept="image/x-icon,image/png,image/webp"
                                            onChange={handleFaviconChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="favicon-upload"
                                            className="w-full py-2.5 px-4 rounded-xl bg-orange-600/10 hover:bg-orange-600/20 text-orange-400 border border-orange-500/30 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                                        >
                                            <UploadCloud className="w-4 h-4" />
                                            <span>{branding?.favicon ? (t('admin.cms.btn_change_favicon') || 'تغيير أيقونة المتصفح') : (t('admin.cms.btn_upload_favicon') || 'رفع أيقونة المتصفح')}</span>
                                        </label>
                                        <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                                            {t('admin.cms.favicon_specs_hint') || 'يفضل ملف مربع بأبعاد 32x32 أو 64x64 بصيغة ICO أو PNG.'}
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
                                    <span>{t('admin.cms.brand_names_title')}</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">{t('admin.cms.field_platform_name_ar')}</label>
                                        <input
                                            type="text"
                                            value={brandingForm.data.site_name_ar}
                                            onChange={(e) => brandingForm.setData('site_name_ar', e.target.value)}
                                            placeholder={t('admin.cms.ph_platform_name_ar')}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">{t('admin.cms.field_platform_name_en')}</label>
                                        <input
                                            type="text"
                                            value={brandingForm.data.site_name_en}
                                            onChange={(e) => brandingForm.setData('site_name_en', e.target.value)}
                                            placeholder="e.g. GoTransTech Platform"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">{t('admin.cms.field_slogan_ar')}</label>
                                        <input
                                            type="text"
                                            value={brandingForm.data.site_slogan_ar}
                                            onChange={(e) => brandingForm.setData('site_slogan_ar', e.target.value)}
                                            placeholder={t('admin.cms.ph_slogan_ar')}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 mb-1">{t('admin.cms.field_slogan_en')}</label>
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
                                            <span>{t('admin.cms.navbar_display_mode_title')}</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                            {t('admin.cms.navbar_display_mode_desc')}
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 self-start sm:self-center shrink-0">
                                        {t('admin.cms.current_mode')} {brandingForm.data.navbar_brand_display === 'logo' ? t('admin.cms.mode_logo_only') : brandingForm.data.navbar_brand_display === 'name' ? t('admin.cms.mode_name_only') : t('admin.cms.mode_both')}
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
                                            <span className="font-bold text-slate-200">{t('admin.cms.mode_both_title')}</span>
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
                                            {t('admin.cms.mode_both_desc')}
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
                                            <span className="font-bold text-slate-200">{t('admin.cms.mode_logo_title')}</span>
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
                                            {t('admin.cms.mode_logo_desc')}
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
                                            <span className="font-bold text-slate-200">{t('admin.cms.mode_name_title')}</span>
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
                                            {t('admin.cms.mode_name_desc')}
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
                                            <span>{t('admin.cms.logo_slider_title')}</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                            {t('admin.cms.logo_slider_desc')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-start sm:self-center">
                                        <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-violet-900/60 flex items-center gap-1.5 shadow-sm">
                                            <span className="text-[11px] text-slate-400">{t('admin.cms.selected_height')}</span>
                                            <span className="text-sm font-black text-[#FF6B00] font-mono">{brandingForm.data.navbar_brand_size}</span>
                                            <span className="text-[11px] text-slate-400 font-mono">px</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => brandingForm.setData('navbar_brand_size', 36)}
                                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer"
                                            title={t('admin.cms.reset_size_hint')}
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
                                            <span>{t('admin.cms.default_36')}</span>
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
                                            title={t('admin.cms.dec_size_hint')}
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
                                                    {t('admin.cms.sz_small')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 36)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 36 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    {t('admin.cms.sz_medium')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 48)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 48 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    {t('admin.cms.sz_large')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 64)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 64 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    {t('admin.cms.sz_wide')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 80)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 80 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    {t('admin.cms.sz_ultra')}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => brandingForm.setData('navbar_brand_size', 96)}
                                                    className={`hover:text-white transition-colors cursor-pointer ${brandingForm.data.navbar_brand_size === 96 ? 'text-[#FF6B00] font-black' : ''}`}
                                                >
                                                    {t('admin.cms.sz_max')}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Increase Stepper Button */}
                                        <button
                                            type="button"
                                            onClick={() => brandingForm.setData('navbar_brand_size', Math.min(96, (parseInt(brandingForm.data.navbar_brand_size, 10) || 36) + 2))}
                                            className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-[#6320EE] text-slate-300 hover:text-white border border-slate-700 hover:border-[#6320EE] flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-sm active:scale-95"
                                            title={t('admin.cms.inc_size_hint')}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Quick Preset Buttons */}
                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800/90 flex-wrap">
                                        <span className="text-[11px] text-slate-400 font-medium">{t('admin.cms.quick_sizes')}</span>
                                        {[
                                            { px: 28, label: t('admin.cms.preset_compact') },
                                            { px: 36, label: t('admin.cms.preset_standard') },
                                            { px: 44, label: t('admin.cms.preset_prominent') },
                                            { px: 54, label: t('admin.cms.preset_large') },
                                            { px: 68, label: t('admin.cms.preset_wide') },
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
                                            <span>{t('admin.cms.live_preview_title')}</span>
                                        </span>
                                        <span className="text-[11px] font-mono text-slate-400">
                                            {t('admin.cms.current_height')} <strong className="text-white">{brandingForm.data.navbar_brand_size}px</strong>
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
                                            <span>{t('admin.cms.approved_display_mode')} {brandingForm.data.navbar_brand_display === 'logo' ? t('admin.cms.mode_logo_only') : brandingForm.data.navbar_brand_display === 'name' ? t('admin.cms.mode_name_only') : t('admin.cms.mode_both')}</span>
                                            <span>{t('admin.cms.logo_height')} {brandingForm.data.navbar_brand_size}px</span>
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
                                    <span>{brandingForm.processing ? t('admin.cms.saving_branding') : t('admin.cms.btn_save_branding')}</span>
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
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.cms.hero_section_title')}</h3>
                                <p className="text-xs text-slate-500">{t('admin.cms.hero_section_desc')}</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(heroForm, heroSec.id, e)} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.badge_text')}
                                    </label>
                                <input
                                    type="text"
                                    value={heroForm.data.content.badge_text}
                                    onChange={(e) => heroForm.setData('content', { ...heroForm.data.content, badge_text: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    placeholder={t('admin.cms.ph_badge_text')}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.hero_title_ar')}
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
                                        {t('admin.cms.hero_title_en')}
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
                                        {t('admin.cms.hero_desc_ar')}
                                    </label>
                                    <textarea
                                        value={heroForm.data.subtitle_ar}
                                        onChange={(e) => heroForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-xs text-slate-900 dark:text-white h-24 leading-relaxed focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.hero_desc_en')}
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
                                        {t('admin.cms.hero_primary_cta')}
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
                                        {t('admin.cms.hero_secondary_cta')}
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
                                    <span>{heroForm.processing ? t('common.loading') : t('admin.cms.btn_save_hero')}</span>
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
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.cms.stats_section_title')}</h3>
                                <p className="text-xs text-slate-500">{t('admin.cms.stats_section_desc')}</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(statsForm, statsSec.id, e)} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.stat_funded_tasks_title')}
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
                                        {t('admin.cms.stat_investments_vol_title')}
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
                                        {t('admin.cms.stat_investors_count_title')}
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
                                        {t('admin.cms.stat_companies_count_title')}
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
                                    <span>{statsForm.processing ? t('common.loading') : t('admin.cms.btn_save_stats')}</span>
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
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.cms.how_section_title')}</h3>
                                <p className="text-xs text-slate-500">{t('admin.cms.how_section_desc')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const currentSteps = howForm.data.content.steps || [];
                                    const nextNum = currentSteps.length + 1;
                                    const updated = [
                                        ...currentSteps,
                                        { step: nextNum, title: t('admin.cms.new_step_title', { num: nextNum }), description: t('admin.cms.new_step_desc') }
                                    ];
                                    howForm.setData('content', { ...howForm.data.content, steps: updated });
                                }}
                                className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{t('admin.cms.btn_add_step')}</span>
                            </button>
                        </div>

                        <form onSubmit={(e) => submitForm(howForm, howSec.id, e)} className="space-y-4">
                            {/* Section Title & Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.how_sec_title')}
                                    </label>
                                    <input
                                        type="text"
                                        value={howForm.data.title_ar}
                                        onChange={(e) => howForm.setData('title_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                        placeholder={t('admin.cms.ph_how_sec_title')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.how_sec_desc')}
                                    </label>
                                    <input
                                        type="text"
                                        value={howForm.data.subtitle_ar}
                                        onChange={(e) => howForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        placeholder={t('admin.cms.ph_how_sec_desc')}
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
                                                <span className="font-bold text-xs text-slate-900 dark:text-white">{t('admin.cms.step_label', { num: idx + 1 })}</span>
                                            </div>
                                            {howForm.data.content.steps.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated = howForm.data.content.steps.filter((_, i) => i !== idx);
                                                        howForm.setData('content', { ...howForm.data.content, steps: updated });
                                                    }}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                    title={t('admin.cms.btn_delete_step')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                        {t('admin.cms.field_step_title')}
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
                                                        {t('admin.cms.field_step_desc')}
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
                                    <span>{howForm.processing ? t('common.loading') : t('admin.cms.btn_save_how')}</span>
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
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.cms.features_section_title')}</h3>
                                <p className="text-xs text-slate-500">{t('admin.cms.features_section_desc')}</p>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(featuresForm, featuresSec.id, e)} className="space-y-6">
                            {/* Section Title & Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.features_sec_title')}
                                    </label>
                                    <input
                                        type="text"
                                        value={featuresForm.data.title_ar}
                                        onChange={(e) => featuresForm.setData('title_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                        placeholder={t('admin.cms.ph_features_sec_title')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.how_sec_desc')}
                                    </label>
                                    <input
                                        type="text"
                                        value={featuresForm.data.subtitle_ar}
                                        onChange={(e) => featuresForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        placeholder={t('admin.cms.ph_features_sec_desc')}
                                    />
                                </div>
                            </div>

                            {/* 3 Core Highlight Pillars Customization */}
                            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300">{t('admin.cms.pillars_title')}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <label className="block text-[11px] font-bold text-violet-600 dark:text-violet-400">{t('admin.cms.pillar1_label')}</label>
                                        <input
                                            type="text"
                                            value={featuresForm.data.content.pillar1_title}
                                            onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, pillar1_title: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                                            placeholder={t('admin.cms.ph_pillar_title')}
                                        />
                                        <textarea
                                            value={featuresForm.data.content.pillar1_desc}
                                            onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, pillar1_desc: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white resize-none"
                                            rows="2"
                                            placeholder={t('admin.cms.ph_pillar_desc')}
                                        />
                                    </div>

                                    <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <label className="block text-[11px] font-bold text-orange-500">{t('admin.cms.pillar2_label')}</label>
                                        <input
                                            type="text"
                                            value={featuresForm.data.content.pillar2_title}
                                            onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, pillar2_title: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                                            placeholder={t('admin.cms.ph_pillar_title')}
                                        />
                                        <textarea
                                            value={featuresForm.data.content.pillar2_desc}
                                            onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, pillar2_desc: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white resize-none"
                                            rows="2"
                                            placeholder={t('admin.cms.ph_pillar_desc')}
                                        />
                                    </div>

                                    <div className="space-y-1.5 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                        <label className="block text-[11px] font-bold text-violet-400">{t('admin.cms.pillar3_label')}</label>
                                        <input
                                            type="text"
                                            value={featuresForm.data.content.pillar3_title}
                                            onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, pillar3_title: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                                            placeholder={t('admin.cms.ph_pillar_title')}
                                        />
                                        <textarea
                                            value={featuresForm.data.content.pillar3_desc}
                                            onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, pillar3_desc: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white resize-none"
                                            rows="2"
                                            placeholder={t('admin.cms.ph_pillar_desc')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Investor Features */}
                            <div className="space-y-3 pt-2">
                                <div className="p-3.5 rounded-2xl bg-violet-50/50 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-800/40 space-y-2.5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-1">
                                            {t('admin.cms.investor_card_title_label')}
                                        </label>
                                            <input
                                                type="text"
                                                value={featuresForm.data.content.investor_card_title}
                                                onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, investor_card_title: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-violet-700 dark:text-violet-300 mb-1">
                                            {t('admin.cms.investor_card_desc_label')}
                                        </label>
                                            <input
                                                type="text"
                                                value={featuresForm.data.content.investor_card_desc}
                                                onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, investor_card_desc: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-[#6320EE]">{t('admin.cms.investor_features_list_title')}</h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...(featuresForm.data.content.investor_features || []), t('admin.cms.new_inv_feature')];
                                            featuresForm.setData('content', { ...featuresForm.data.content, investor_features: updated });
                                        }}
                                        className="px-3 py-1 bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-[#5217D4]/20 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>{t('admin.cms.btn_add_feature')}</span>
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
                                                title={t('admin.cms.btn_delete_feature')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Company Features */}
                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="p-3.5 rounded-2xl bg-orange-50/50 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/40 space-y-2.5">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-orange-700 dark:text-orange-300 mb-1">
                                            {t('admin.cms.company_card_title_label')}
                                        </label>
                                            <input
                                                type="text"
                                                value={featuresForm.data.content.company_card_title}
                                                onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, company_card_title: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-orange-700 dark:text-orange-300 mb-1">
                                            {t('admin.cms.investor_card_desc_label')}
                                        </label>
                                            <input
                                                type="text"
                                                value={featuresForm.data.content.company_card_desc}
                                                onChange={(e) => featuresForm.setData('content', { ...featuresForm.data.content, company_card_desc: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-[#FF6B00]">{t('admin.cms.company_features_list_title')}</h4>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = [...(featuresForm.data.content.company_features || []), t('admin.cms.new_comp_feature')];
                                            featuresForm.setData('content', { ...featuresForm.data.content, company_features: updated });
                                        }}
                                        className="px-3 py-1 bg-orange-50 dark:bg-orange-500/10 hover:bg-orange-100 dark:hover:bg-orange-500/20 text-[#FF6B00] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>{t('admin.cms.btn_add_feature')}</span>
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
                                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = featuresForm.data.content.company_features.filter((_, i) => i !== idx);
                                                    featuresForm.setData('content', { ...featuresForm.data.content, company_features: updated });
                                                }}
                                                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                                                title={t('admin.cms.btn_delete_feature')}
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
                                    <span>{featuresForm.processing ? t('common.loading') : t('admin.cms.btn_save_features')}</span>
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
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('admin.cms.faq_section_title')}</h3>
                                <p className="text-xs text-slate-500">{t('admin.cms.faq_section_desc')}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    const updated = [
                                        ...(faqForm.data.content.faqs || []),
                                        { q: t('admin.cms.new_faq_q'), a: t('admin.cms.new_faq_a') }
                                    ];
                                    faqForm.setData('content', { ...faqForm.data.content, faqs: updated });
                                }}
                                className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{t('admin.cms.btn_add_faq')}</span>
                            </button>
                        </div>

                        <form onSubmit={(e) => submitForm(faqForm, faqSec.id, e)} className="space-y-4">
                            {/* Section Title & Subtitle */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.faq_sec_title')}
                                    </label>
                                    <input
                                        type="text"
                                        value={faqForm.data.title_ar}
                                        onChange={(e) => faqForm.setData('title_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500 font-bold"
                                        placeholder={t('admin.cms.ph_faq_sec_title')}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                        {t('admin.cms.how_sec_desc')}
                                    </label>
                                    <input
                                        type="text"
                                        value={faqForm.data.subtitle_ar}
                                        onChange={(e) => faqForm.setData('subtitle_ar', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        placeholder={t('admin.cms.ph_faq_sec_desc')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                {faqForm.data.content.faqs?.map((faq, idx) => (
                                    <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 relative group">
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-violet-600 dark:text-violet-400">{t('admin.cms.question_num', { num: idx + 1 })}</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updated = faqForm.data.content.faqs.filter((_, i) => i !== idx);
                                                    faqForm.setData('content', { ...faqForm.data.content, faqs: updated });
                                                }}
                                                className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                                title={t('admin.cms.btn_delete_faq')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                                    {t('admin.cms.field_question')}
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
                                                    {t('admin.cms.field_answer')}
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
                                    <span>{faqForm.processing ? t('common.loading') : t('admin.cms.btn_save_faq')}</span>
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
                                    <span>{t('admin.cms.footer_section_title')}</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {t('admin.cms.footer_section_desc')}
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
                                    <span>{t('admin.cms.chk_show_footer')}</span>
                                </label>
                            </div>
                        </div>

                        <form onSubmit={(e) => submitForm(contactForm, contactSec.id, e)} className="space-y-6">
                            {/* Section 1: Footer Bio & Description */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                    <span>{t('admin.cms.platform_summary_title')}</span>
                                </h4>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                        {t('admin.cms.summary_desc_hint')}
                                    </label>
                                    <textarea
                                        value={contactForm.data.content.description_ar}
                                        onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, description_ar: e.target.value })}
                                        placeholder={t('admin.cms.ph_summary_desc')}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white h-20 leading-relaxed focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            </div>

                            {/* Section 2: Direct Contact Channels */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <PhoneCall className="w-4 h-4 text-orange-400" />
                                    <span>{t('admin.cms.contact_channels_title')}</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            {t('admin.cms.field_phone_hotline')}
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
                                            {t('admin.cms.field_whatsapp')}
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
                                            {t('admin.cms.field_support_email')}
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
                                            {t('admin.cms.field_working_hours')}
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.working_hours}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, working_hours: e.target.value })}
                                            placeholder={t('admin.cms.ph_working_hours')}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Social Media Channels */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 space-y-4">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-violet-400" />
                                    <span>{t('admin.cms.social_links_title')}</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            {t('admin.cms.link_twitter')}
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
                                            {t('admin.cms.link_linkedin')}
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
                                            {t('admin.cms.link_instagram')}
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
                                            {t('admin.cms.link_facebook')}
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
                                            {t('admin.cms.link_youtube')}
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
                                            {t('admin.cms.link_telegram')}
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
                                    <span>{t('admin.cms.hq_business_info_title')}</span>
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="sm:col-span-3">
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            {t('admin.cms.field_address_hq')}
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.address}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, address: e.target.value })}
                                            placeholder={t('admin.cms.ph_address_hq')}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                                            {t('admin.cms.field_cr_num')}
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
                                            {t('admin.cms.field_vat_num')}
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
                                            {t('admin.cms.field_copyright')}
                                        </label>
                                        <input
                                            type="text"
                                            value={contactForm.data.content.copyright_text}
                                            onChange={(e) => contactForm.setData('content', { ...contactForm.data.content, copyright_text: e.target.value })}
                                            placeholder={t('admin.cms.ph_copyright')}
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
                                    <span>{contactForm.processing ? t('common.loading') : t('admin.cms.btn_save_footer')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
