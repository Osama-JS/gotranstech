import React, { useState, useEffect } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Truck,
    ShieldCheck,
    TrendingUp,
    Zap,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
    Lock,
    Globe,
    Building2,
    Wallet,
    CreditCard,
    Code,
    FileText,
    Sparkles,
    ChevronDown,
    Layers,
    PhoneCall,
    LayoutDashboard,
    Phone,
    Mail,
    MapPin,
    Clock,
    MessageCircle,
    Send,
    ExternalLink,
    Menu,
    X,
    HelpCircle,
    ChevronLeft,
} from 'lucide-react';
import BrandLogo from '../../Components/BrandLogo';

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.21a1.65 1.65 0 0 0-1.66 1.66c0 .92.74 1.66 1.66 1.66a1.66 1.66 0 0 0 0-3.32z" />
    </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
);

const FacebookIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
);

export default function LandingIndex({ sections = {}, liveStats = {} }) {
    const { auth, branding } = usePage().props;
    const user = auth?.user;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setMobileMenuOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const getDashboardUrl = () => {
        if (!user) return route('login');
        if (user.is_admin || user.user_type === 'admin') {
            return route('admin.dashboard');
        }
        if (user.is_company || user.user_type === 'company') {
            return route('company.dashboard');
        }
        return route('investor.dashboard');
    };

    const dashboardUrl = getDashboardUrl();
    const heroSec = sections?.hero || {};
    const heroSection = heroSec?.content || {};
    const heroTitle = heroSec?.title_ar || 'منصة التمويل اللوجستي الذكية لربط المستثمرين بشركات النقل';
    const heroSubtitle = heroSec?.subtitle_ar || 'حوّل تدفقاتك النقدية إلى أرباح حقيقية من خلال تمويل مهام الشحن والتوصيل اللوجستية بعوائد فورية ومضمونة.';
    const heroBadge = heroSection?.badge_text || heroSection?.badge_ar || 'منصة التمويل والاستثمار اللوجستي المعتمدة بالمملكة 🇸🇦';
    const heroPrimaryBtn = heroSection?.primary_button_text || heroSection?.cta_primary_text_ar || 'ابدأ الاستثمار الآن';
    const heroSecondaryBtn = heroSection?.secondary_button_text || heroSection?.cta_secondary_text_ar || 'ربط الشركات اللوجستية (API)';
    
    const statsSec = sections?.stats || {};
    const statsSection = statsSec?.content || {};
    const howSection = sections?.how_it_works?.content || {};
    const featuresSection = sections?.features?.content || {};
    const faqSection = sections?.faq?.content || {};
    const footerSection = sections?.contact_footer?.content || {};

    const [faqOpen, setFaqOpen] = useState(null);

    const defaultSteps = [
        {
            step: 1,
            title: 'شحن المحفظة الاستثمارية',
            description: 'قم بإيداع رأس المال بأمان عبر التحويل البنكي المعتمد أو الدفع الإلكتروني الفوري HyperPay.'
        },
        {
            step: 2,
            title: 'استعراض المهام اللوجستية',
            description: 'تصفح قائمة المهام اليومية الواردة لحظياً من شركات الشحن عبر الـ API مع تفاصيل المسار والعمولة.'
        },
        {
            step: 3,
            title: 'تمويل المهمة بضغطة زر',
            description: 'اختر المهمة المناسبة وسيتم اقتطاع قيمتها من محفظتك وتوجيه التمويل مباشرة للشركة المنفذة.'
        },
        {
            step: 4,
            title: 'جني الأرباح الفورية',
            description: 'استلم حصتك من عمولة المنصة فور تمويل المهمة وأعد استثمارها أو اطلب سحبها لحسابك البنكي.'
        },
    ];

    const displaySteps = Array.isArray(howSection?.steps) && howSection.steps.length > 0 
        ? howSection.steps 
        : defaultSteps;

    const defaultInvestorFeatures = [
        'عوائد استثمارية فورية على كل مهمة يتم تمويلها',
        'عقود قانونية إلكترونية موثقة تضمن حقوق الأطراف',
        'سحب وإيداع مرن مع دعم المدفوعات السعودية المعتمدة',
        'لوحة تحكم تفاعلية وتقارير أداء ومحافظ مالية معزولة',
    ];

    const defaultCompanyFeatures = [
        'سيولة فورية لتمويل وقود وصيانة ومصاريف رحلات النقل',
        'ربط تقني فوري عبر RESTful APIs مع توثيق كامل للـ Webhooks',
        'توليد سندات قبض ودين معتمدة بصيغة PDF فور سحب الرصيد',
        'تتبع لحظي لحالة المهام وحركة السداد والمطابقات المالية',
    ];

    const displayInvestorFeatures = Array.isArray(featuresSection?.investor_features) && featuresSection.investor_features.length > 0
        ? featuresSection.investor_features
        : defaultInvestorFeatures;

    const displayCompanyFeatures = Array.isArray(featuresSection?.company_features) && featuresSection.company_features.length > 0
        ? featuresSection.company_features
        : defaultCompanyFeatures;

    const defaultFaqs = [
        {
            q: 'ما هو نموذج التمويل في منصة GoTransTech؟',
            a: 'تقوم شركات الخدمات اللوجستية المعتمدة بربط أنظمتها عبر API لإرسال المهام والشحنات القابلة للتمويل. يقوم المستثمرون بشحن محافظهم واختيار المهام لتمويلها لحظياً، ويحصل المستثمر على نسبة متفق عليها من صافي عمولة المنصة فور تمويل المهمة.'
        },
        {
            q: 'ما هي طرق شحن محفظة الاستثمار المتاحة؟',
            a: 'توفر المنصة خيارين معتمدين: الدفع الإلكتروني الفوري عبر بوابة HyperPay (مدى، فيزا، ماستركارد، Apple Pay)، أو عبر التحويل البنكي المباشر لحساب المنصة مع رفع صورة الإيصال للاعتماد.'
        },
        {
            q: 'كيف تضمن المنصة حقوق الأطراف والشفافية المالية؟',
            a: 'تعتمد المنصة على نظام قيود محاسبية مزدوجة غير قابل للتلاعب (Double-Entry Ledger) مع عقود قانونية موثقة إلكترونياً، وتوليد مستندات PDF موقعة رقمياً لكل عملية سحب رصيد، مع عزل تام وتشفير لكافة العمليات.'
        },
        {
            q: 'كيف يمكن لشركات التوصيل والنقل اللوجستي الربط مع المنصة؟',
            a: 'توفر المنصة بوابة برمجية مشفرة (API Gateway) تمكّن الشركات من توليد مفاتيح API وإرسال المهام اللوجستية واستقبال تحديثات Webhooks لحظية عند نجاح تمويل كل مهمة.'
        }
    ];

    const displayFaqs = Array.isArray(faqSection?.faqs) && faqSection.faqs.length > 0 
        ? faqSection.faqs 
        : defaultFaqs;

    return (
        <div className="relative min-h-screen w-full max-w-full bg-[#06081B] text-slate-100 selection:bg-violet-600 selection:text-white font-sans overflow-x-hidden">
            <Head title="GoTransTech | نمول حركة الغد - منصة الاستثمار والتمويل اللوجستي" />

            {/* Background glowing orbs in GoTransTech Brand Colors - Strictly Contained with Zero Overflow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] max-w-full h-[480px] bg-violet-600/10 blur-[140px] rounded-full" />
                <div className="absolute top-[500px] right-0 translate-x-1/4 w-[500px] h-[400px] bg-orange-500/10 blur-[150px] rounded-full" />
                <div className="absolute top-[1200px] left-0 -translate-x-1/4 w-[500px] h-[450px] bg-violet-600/10 blur-[160px] rounded-full" />
            </div>

            {/* Persistent Fixed Header */}
            <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
                scrolled 
                    ? 'bg-[#06081B]/95 backdrop-blur-xl border-b border-violet-900/50 shadow-2xl shadow-black/60 py-3.5' 
                    : 'bg-[#06081B]/85 backdrop-blur-md border-b border-violet-900/20 py-4 sm:py-5'
            }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <BrandLogo size={branding?.navbar_brand_size || 'md'} showSlogan={false} displayMode={branding?.navbar_brand_display || 'both'} textClassName="text-white" />
                    </Link>

                    {/* Desktop Navigation Links */}
                    <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
                        <a href="#how-it-works" className="hover:text-orange-400 transition-colors">آلية العمل</a>
                        <a href="#features" className="hover:text-orange-400 transition-colors">المميزات</a>
                        <a href="#api" className="hover:text-orange-400 transition-colors">ربط الشركات (API)</a>
                        <a href="#faq" className="hover:text-orange-400 transition-colors">الأسئلة الشائعة</a>
                    </nav>

                    {/* Desktop Action Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <Link
                                href={dashboardUrl}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>لوحة التحكم</span>
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
                                >
                                    تسجيل الدخول
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] cursor-pointer"
                                >
                                    إنشاء حساب جديد
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Hamburger Button & Quick Action */}
                    <div className="flex md:hidden items-center gap-2">
                        {user ? (
                            <Link
                                href={dashboardUrl}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6320EE] text-white flex items-center gap-1.5 shadow-sm"
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                <span>لوحتي</span>
                            </Link>
                        ) : (
                            <Link
                                href={route('login')}
                                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-900 border border-violet-900/50"
                            >
                                دخول
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="w-10 h-10 rounded-xl bg-slate-900/90 border border-violet-900/50 text-slate-200 hover:text-white hover:border-[#6320EE] flex items-center justify-center transition-all focus:outline-none cursor-pointer"
                            aria-label="فتح القائمة الرئيسية"
                        >
                            <Menu className="w-5 h-5 text-orange-400" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Slide-Over Drawer Navigation */}
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
                    mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Slide-in Drawer Container */}
            <aside
                className={`fixed inset-y-0 right-0 z-50 w-[300px] sm:w-[350px] max-w-[85vw] bg-[#070A24] border-s border-violet-900/60 shadow-2xl flex flex-col justify-between transition-all duration-300 ease-out md:hidden ${
                    mobileMenuOpen 
                        ? 'translate-x-0 opacity-100 visible' 
                        : 'translate-x-full opacity-0 invisible pointer-events-none'
                }`}
                style={{ direction: 'rtl' }}
                aria-label="القائمة الجانبية للموبايل"
            >
                <div className="overflow-y-auto flex-1 p-5 sm:p-6 no-scrollbar">
                    {/* Drawer Header with Close Button */}
                    <div className="flex items-center justify-between pb-4 border-b border-violet-950/80">
                        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="inline-block">
                            <BrandLogo 
                                size={Math.min(36, parseInt(branding?.navbar_brand_size, 10) || 30)} 
                                showSlogan={false} 
                                displayMode={branding?.navbar_brand_display || 'both'} 
                                textClassName="text-white" 
                            />
                        </Link>
                        
                        {/* Highly Prominent Close Button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-violet-900/60 hover:border-rose-500/50 transition-all text-xs font-bold cursor-pointer shadow-sm"
                            aria-label="إغلاق القائمة"
                            title="إغلاق القائمة (Esc)"
                        >
                            <span>إغلاق</span>
                            <X className="w-4 h-4 text-orange-400" />
                        </button>
                    </div>

                    {/* Drawer Nav Links */}
                    <nav className="my-5 space-y-1">
                        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">أقسام المنصة</span>
                        <a
                            href="#top"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-violet-950/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-4 h-4 text-violet-400" />
                                <span>الرئيسية</span>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </a>
                        <a
                            href="#how-it-works"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-violet-950/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Layers className="w-4 h-4 text-orange-400" />
                                <span>آلية العمل (4 خطوات)</span>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </a>
                        <a
                            href="#features"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-violet-950/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-4 h-4 text-violet-400" />
                                <span>المميزات الاستثمارية</span>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </a>
                        <a
                            href="#api"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-violet-950/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <Code className="w-4 h-4 text-orange-400" />
                                <span>ربط الشركات (API)</span>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </a>
                        <a
                            href="#faq"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-violet-950/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-4 h-4 text-violet-400" />
                                <span>الأسئلة الشائعة</span>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-500" />
                        </a>
                    </nav>

                    {/* Dedicated Fast Access Portals */}
                    <div className="space-y-2 mb-5">
                        <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1">بوابات الدخول السريع</span>
                        <Link
                            href={user ? dashboardUrl : route('login')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between p-3 rounded-xl bg-violet-950/40 border border-violet-900/40 hover:border-[#6320EE] transition-all"
                        >
                            <div className="flex items-center gap-2.5">
                                <Wallet className="w-4 h-4 text-violet-400" />
                                <div>
                                    <div className="text-xs font-bold text-white">بوابة المستثمرين</div>
                                    <div className="text-[10px] text-slate-400">عوائد تمويل فورية وموثقة</div>
                                </div>
                            </div>
                            <ArrowLeft className="w-3.5 h-3.5 text-violet-400" />
                        </Link>
                        <Link
                            href={user ? dashboardUrl : route('login')}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between p-3 rounded-xl bg-orange-950/20 border border-orange-900/40 hover:border-[#FF6B00] transition-all"
                        >
                            <div className="flex items-center gap-2.5">
                                <Truck className="w-4 h-4 text-orange-400" />
                                <div>
                                    <div className="text-xs font-bold text-white">بوابة الشركات اللوجستية</div>
                                    <div className="text-[10px] text-slate-400">سيولة فورية للشحنات اليومية</div>
                                </div>
                            </div>
                            <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
                        </Link>
                    </div>
                </div>

                {/* Drawer Footer Auth & Contact */}
                <div className="p-5 border-t border-violet-950/80 bg-[#06081E] space-y-3">
                    {user ? (
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-violet-900/40">
                                <div className="w-8 h-8 rounded-lg bg-[#6320EE] text-white font-bold flex items-center justify-center text-xs">
                                    {user.name ? user.name.charAt(0) : 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <div className="text-xs font-bold text-white truncate">{user.name}</div>
                                    <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                                </div>
                            </div>
                            <Link
                                href={dashboardUrl}
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span>الانتقال إلى لوحة التحكم</span>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Link
                                href={route('register')}
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
                            >
                                <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                                <span>إنشاء حساب جديد</span>
                            </Link>
                            <Link
                                href={route('login')}
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-violet-900/50 flex items-center justify-center transition-colors"
                            >
                                تسجيل الدخول
                            </Link>
                        </div>
                    )}

                    <div className="text-center pt-2 text-[10px] text-slate-500 font-mono">
                        GoTransTech - نمول حركة الغد 🇸🇦
                    </div>
                </div>
            </aside>

            {/* Hero Section */}
            <section id="top" className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
                {/* Investment Background Charts & Technical Grids Layer */}
                <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden select-none opacity-40 sm:opacity-60">
                    <svg className="w-full h-full max-w-[1200px] min-h-[500px]" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6320EE" strokeWidth="0.5" strokeOpacity="0.15" />
                            </pattern>
                        </defs>

                        {/* Grid Background */}
                        <rect width="1200" height="600" fill="url(#grid-pattern)" />

                        {/* Horizontal Market Reference Lines */}
                        <line x1="80" y1="150" x2="1120" y2="150" stroke="#6320EE" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.2" />
                        <line x1="80" y1="300" x2="1120" y2="300" stroke="#6320EE" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.2" />
                        <line x1="80" y1="450" x2="1120" y2="450" stroke="#6320EE" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.2" />

                        {/* Market Candlestick Bars in Brand Colors #FF6B00 and #6320EE */}
                        {/* Candlestick 1 */}
                        <line x1="160" y1="420" x2="160" y2="490" stroke="#6320EE" strokeWidth="1.5" strokeOpacity="0.4" />
                        <rect x="154" y="440" width="12" height="35" rx="2" fill="#6320EE" fillOpacity="0.4" stroke="#6320EE" strokeWidth="1" />

                        {/* Candlestick 2 */}
                        <line x1="260" y1="360" x2="260" y2="450" stroke="#FF6B00" strokeWidth="1.5" strokeOpacity="0.4" />
                        <rect x="254" y="380" width="12" height="45" rx="2" fill="#FF6B00" fillOpacity="0.4" stroke="#FF6B00" strokeWidth="1" />

                        {/* Candlestick 3 */}
                        <line x1="380" y1="310" x2="380" y2="410" stroke="#6320EE" strokeWidth="1.5" strokeOpacity="0.5" />
                        <rect x="374" y="330" width="12" height="50" rx="2" fill="#6320EE" fillOpacity="0.5" stroke="#6320EE" strokeWidth="1" />

                        {/* Candlestick 4 */}
                        <line x1="520" y1="260" x2="520" y2="360" stroke="#FF6B00" strokeWidth="1.5" strokeOpacity="0.5" />
                        <rect x="514" y="275" width="12" height="55" rx="2" fill="#FF6B00" fillOpacity="0.5" stroke="#FF6B00" strokeWidth="1" />

                        {/* Candlestick 5 */}
                        <line x1="680" y1="210" x2="680" y2="320" stroke="#6320EE" strokeWidth="1.5" strokeOpacity="0.6" />
                        <rect x="674" y="230" width="12" height="60" rx="2" fill="#6320EE" fillOpacity="0.5" stroke="#6320EE" strokeWidth="1" />

                        {/* Candlestick 6 */}
                        <line x1="840" y1="160" x2="840" y2="270" stroke="#FF6B00" strokeWidth="1.5" strokeOpacity="0.6" />
                        <rect x="834" y="175" width="12" height="65" rx="2" fill="#FF6B00" fillOpacity="0.5" stroke="#FF6B00" strokeWidth="1" />

                        {/* Candlestick 7 */}
                        <line x1="1000" y1="110" x2="1000" y2="220" stroke="#6320EE" strokeWidth="1.5" strokeOpacity="0.7" />
                        <rect x="994" y="125" width="12" height="65" rx="2" fill="#6320EE" fillOpacity="0.6" stroke="#6320EE" strokeWidth="1" />

                        {/* Upward Investment Growth Spline (Royal Violet #6320EE) */}
                        <path
                            d="M 80 500 C 240 470, 360 380, 520 330 C 680 280, 820 190, 1020 140 C 1080 125, 1140 115, 1180 110"
                            fill="none"
                            stroke="#6320EE"
                            strokeWidth="3"
                            strokeLinecap="round"
                        />

                        {/* Secondary High-Yield Trajectory (Sunset Orange #FF6B00) */}
                        <path
                            d="M 120 530 C 280 510, 420 420, 580 370 C 740 320, 880 230, 1060 170 C 1120 150, 1160 140, 1190 135"
                            fill="none"
                            stroke="#FF6B00"
                            strokeWidth="2.5"
                            strokeDasharray="8 6"
                            strokeLinecap="round"
                            strokeOpacity="0.8"
                        />

                        {/* Key Investment Data Markers */}
                        <circle cx="520" cy="330" r="6" fill="#6320EE" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="520" cy="330" r="14" stroke="#6320EE" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

                        <circle cx="820" cy="210" r="7" fill="#FF6B00" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="820" cy="210" r="16" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 4" opacity="0.7" />

                        <circle cx="1020" cy="140" r="8" fill="#6320EE" stroke="#ffffff" strokeWidth="2" />
                        <circle cx="1020" cy="140" r="20" stroke="#6320EE" strokeWidth="1.5" opacity="0.5" />
                    </svg>
                </div>

                {/* Floating Investment Widget (Left - Logistics Liquidity Activity) */}
                <div className="hidden xl:flex items-center gap-3 absolute top-28 start-4 p-3.5 rounded-2xl bg-[#090C29]/85 border border-violet-800/40 backdrop-blur-md shadow-2xl text-start pointer-events-none max-w-[220px]">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                        <TrendingUp className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold">مؤشر نمو التمويل</span>
                            <span className="text-[9px] font-bold text-orange-400 font-mono">+28.4%</span>
                        </div>
                        <div className="text-xs font-black text-white font-mono mt-0.5">3,450,000 ر.س</div>
                    </div>
                </div>

                {/* Floating Investment Widget (Right - Live Verified Contract) */}
                <div className="hidden xl:flex items-center gap-3 absolute top-36 end-4 p-3.5 rounded-2xl bg-[#090C29]/85 border border-orange-500/30 backdrop-blur-md shadow-2xl text-start pointer-events-none max-w-[220px]">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400 font-bold">عقد تمويل لحظي موثق</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                        </div>
                        <div className="text-xs font-black text-white font-mono mt-0.5">شحنة #GTT-9022</div>
                    </div>
                </div>

                {/* Brand Slogan Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-bold mb-8 animate-fade-in shadow-inner">
                    <Sparkles className="w-4 h-4 text-orange-400" />
                    <span>{heroBadge}</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white tracking-tight leading-[1.2] mb-6 max-w-4xl mx-auto">
                    {heroTitle}
                </h1>

                {/* Subtitle */}
                <p className="text-sm sm:text-lg lg:text-xl text-slate-300/80 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
                    {heroSubtitle}
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto mb-14 sm:mb-16">
                    {user ? (
                        <Link
                            href={dashboardUrl}
                            className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-xl shadow-violet-600/35 flex items-center justify-center gap-2 transition-all hover:scale-105"
                        >
                            <LayoutDashboard className="w-5 h-5 text-white" />
                            <span>الانتقال إلى لوحة التحكم</span>
                        </Link>
                    ) : (
                        <Link
                            href={route('register')}
                            className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-xl shadow-violet-600/35 flex items-center justify-center gap-2 transition-all hover:scale-105"
                        >
                            <span>{heroPrimaryBtn}</span>
                            <Zap className="w-5 h-5 fill-white text-white" />
                        </Link>
                    )}
                    <a
                        href="#api"
                        className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-[#0E1338]/90 hover:bg-[#151D52] text-slate-200 border border-violet-800/40 hover:border-orange-500/40 flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        <Code className="w-5 h-5 text-orange-400" />
                        <span>{heroSecondaryBtn}</span>
                    </a>
                </div>

                {/* Live Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-violet-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-violet-400 mb-1">
                            {liveStats?.total_funded_tasks ? `+${Number(liveStats.total_funded_tasks).toLocaleString('en-US')}` : '+1,280'}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.funded_tasks_label || statsSection?.stat1_label || 'مهمة لوجستية ممولة'}
                        </span>
                    </div>
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-orange-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-orange-400 mb-1">
                            {liveStats?.total_invested_amount ? `${Number(liveStats.total_invested_amount).toLocaleString('en-US')} ر.س` : '3,450,000 ر.س'}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.invested_amount_label || statsSection?.stat2_label || 'ريال حجم التمويل المنفذ'}
                        </span>
                    </div>
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-violet-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-violet-300 mb-1">
                            {liveStats?.active_investors_count ? `+${Number(liveStats.active_investors_count).toLocaleString('en-US')}` : '+150'}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.active_investors_label || statsSection?.stat3_label || 'مستثمر نشط بالمنصة'}
                        </span>
                    </div>
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-orange-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-orange-300 mb-1">
                            {liveStats?.connected_companies_count ? `+${Number(liveStats.connected_companies_count).toLocaleString('en-US')}` : '+48'}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.companies_label || statsSection?.stat4_label || 'شركة لوجستية مربوطة'}
                        </span>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-20 bg-[#080B22]/80 border-y border-violet-950/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                            {sections?.how_it_works?.title_ar || 'كيف تعمل منصة GoTransTech في 4 خطوات بسيطة؟'}
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base">
                            {sections?.how_it_works?.subtitle_ar || 'دورة تمويل واستثمار مؤتمتة بالكامل تضمن السرعة والربحية والأمان لجميع الأطراف.'}
                        </p>
                    </div>

                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${displaySteps.length <= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'} gap-6`}>
                        {displaySteps.map((stepItem, idx) => (
                            <div key={idx} className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 hover:border-violet-500/40 transition-all duration-300 relative group">
                                <div className={`w-10 h-10 rounded-xl ${idx % 2 === 0 ? 'bg-violet-500/10 border-violet-500/30 text-violet-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400'} border font-mono font-bold flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    {String(idx + 1).padStart(2, '0')}
                                </div>
                                <h3 className="text-base font-bold text-white mb-2">
                                    {stepItem.title}
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {stepItem.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features & Solutions Section */}
            <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                        {sections?.features?.title_ar || 'حلول ومميزات مصممة خصيصاً للطرفين'}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base">
                        {sections?.features?.subtitle_ar || 'مزايا استثنائية تمكّن المستثمرين من تحقيق عوائد مستمرة وتمنح شركات النقل سيولة تشغيلية فورية.'}
                    </p>
                </div>

                {/* Core Pillars Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 hover:border-violet-500/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            أمان محاسبي ونظام قيود مزدوجة
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            تدقيق محاسبي غير قابل للتلاعب (Double-Entry Ledger) يضمن سلامة كل هللة في النظام وتطابقها التام.
                        </p>
                    </div>

                    <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 hover:border-orange-500/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-4">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            عوائد أرباح فورية وموثقة
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            تحصل على نسبتك من أرباح العمولة مباشرة في محفظتك لحظة تمويل المهمة دون انتظار انتهاء فترة التوصيل.
                        </p>
                    </div>

                    <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 hover:border-violet-500/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            ربط برمجي فائق السرعة
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            واجهات برمجية RESTful مهيأة وموثقة للربط المباشر مع أنظمة تخطيط الموارد وسجلات الشحنات بسهولة تامة.
                        </p>
                    </div>
                </div>

                {/* Two Dedicated Portals: Investors Hub & Logistics Hub (Dynamic from Admin CMS) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Investors Portal */}
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-900/40 relative overflow-hidden flex flex-col justify-between hover:border-violet-500/50 transition-all duration-300">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300">
                                    بوابة المستثمرين
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                                استثمار ذكي وآمن في مهام النقل اللوجستي
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                                نوفر للمستثمر بيئة آمنة توفر سيولة مباشرة لمهام نقل حقيقية بعوائد فورية وإدارة متكاملة للمحفظة.
                            </p>
                            <ul className="space-y-3.5 mb-8">
                                {displayInvestorFeatures.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                                        <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                        <span className="leading-snug">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link
                            href={user ? dashboardUrl : route('register')}
                            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#6320EE] hover:bg-[#5217D4] text-white font-bold text-xs sm:text-sm shadow-lg shadow-violet-900/30 transition-all hover:scale-[1.02]"
                        >
                            <span>{user ? 'الانتقال إلى المحفظة الاستثمارية' : 'سجّل كمستثمر وابدأ الآن'}</span>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>

                    {/* Logistics Companies Portal */}
                    <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-violet-900/40 relative overflow-hidden flex flex-col justify-between hover:border-orange-500/50 transition-all duration-300">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300">
                                    بوابة الشركات اللوجستية
                                </span>
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                                سيولة نقدية تشغيلية فورية وتوسع بلا قيود
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
                                حلول تمويلية فورية تغطي مصاريف التشغيل والوقود والصيانة لكل رحلة مع ربط تقني سلس عبر الـ API.
                            </p>
                            <ul className="space-y-3.5 mb-8">
                                {displayCompanyFeatures.map((feat, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                                        <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                                        <span className="leading-snug">{feat}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Link
                            href={user ? dashboardUrl : route('register')}
                            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-900/30 transition-all hover:scale-[1.02]"
                        >
                            <span>{user ? 'لوحة تحكم الشركات' : 'انضم كشريك لوجستي واطلب الربط'}</span>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Land Logistics & Transport Network Section */}
            <section id="api" className="py-20 bg-[#080B22]/80 border-y border-violet-950/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold mb-4">
                                <Truck className="w-4 h-4" />
                                <span>للشركات اللوجستية ومزودي النقل</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                                بنية رقمية وهندسية متكاملة لتمويل أساطيل النقل البري
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                وفر لعملياتك اللوجستية تدفقاً نقدياً فورياً لتغطية مصاريف الوقود والتشغيل والصيانة لكل رحلة. بنية تحتية ذكية تضمن الربط السريع، حوكمة مسارات الشحن، وتأمين السيولة قبل انطلاق الشاحنة.
                            </p>

                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-center gap-2 text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                                    <span>تغطية هندسية شاملة للمسارات ومحاور النقل البري بين كافة مدن المملكة</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                                    <span>حوكمة رقمية وسندات قبض ودين فورية لحماية حقوق الأسطول والمستثمر</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                                    <span>لوحة تحكم مركزية لمراقبة حركة الشحنات، الرصيد المتاح، والمطابقات المالية</span>
                                </li>
                            </ul>

                            <Link
                                href={user ? dashboardUrl : route('register')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                            >
                                <span>{user ? 'الانتقال إلى لوحة التحكم' : 'تسجيل شركة وطلب الربط اللوجستي'}</span>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Pure Geometric Land Transport & Logistics Art (No text, No names, No stats) */}
                        <div className="relative p-6 sm:p-10 rounded-3xl border border-violet-800/40 bg-[#090C28]/95 overflow-hidden shadow-2xl flex items-center justify-center min-h-[420px]">
                            {/* Subtle Ambient Glow Behind Illustration */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-violet-600/15 blur-[100px] pointer-events-none rounded-full" />
                            <div className="absolute bottom-8 right-8 w-48 h-48 bg-orange-500/15 blur-[80px] pointer-events-none rounded-full" />

                            {/* Background Grid Pattern */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <pattern id="logistics-grid-clean" width="32" height="32" patternUnits="userSpaceOnUse">
                                            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#6320EE" strokeWidth="0.7" strokeDasharray="3 3" />
                                            <circle cx="32" cy="32" r="1.2" fill="#FF6B00" />
                                        </pattern>
                                    </defs>
                                    <rect width="100%" height="100%" fill="url(#logistics-grid-clean)" />
                                </svg>
                            </div>

                            {/* Master Geometric Land Freight Vector Composition */}
                            <div className="relative z-10 w-full max-w-lg mx-auto">
                                <svg viewBox="0 0 540 400" className="w-full h-auto drop-shadow-2xl">
                                    <defs>
                                        {/* Gradients for geometric facets */}
                                        <linearGradient id="violetPlane" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#6320EE" stopOpacity="0.4" />
                                            <stop offset="100%" stopColor="#1E0B4E" stopOpacity="0.8" />
                                        </linearGradient>
                                        <linearGradient id="roadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#12173E" />
                                            <stop offset="50%" stopColor="#1F2868" />
                                            <stop offset="100%" stopColor="#12173E" />
                                        </linearGradient>
                                    </defs>

                                    {/* Base Isometric Ground Grid Platters */}
                                    <polygon points="270,360 490,240 270,120 50,240" fill="url(#violetPlane)" stroke="#6320EE" strokeWidth="1.5" strokeOpacity="0.6" />
                                    <polygon points="270,335 450,235 270,140 90,235" fill="none" stroke="#FF6B00" strokeWidth="1" strokeDasharray="6 6" strokeOpacity="0.4" />

                                    {/* Radar / Telemetry Concentric Wave Rings at Platform Center */}
                                    <ellipse cx="270" cy="235" rx="140" ry="75" fill="none" stroke="#6320EE" strokeWidth="1" strokeOpacity="0.25" />
                                    <ellipse cx="270" cy="235" rx="95" ry="50" fill="none" stroke="#FF6B00" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" />
                                    <ellipse cx="270" cy="235" rx="45" ry="24" fill="none" stroke="#6320EE" strokeWidth="1.5" strokeOpacity="0.6" />

                                    {/* Geometric Highway Arteries */}
                                    {/* Highway 1: South-West to North-East */}
                                    <polygon points="65,245 85,255 475,75 455,65" fill="url(#roadGrad)" stroke="#6320EE" strokeWidth="1.2" />
                                    <path d="M 75 250 L 465 70" stroke="#FF6B00" strokeWidth="2" strokeDasharray="8 6" strokeOpacity="0.9" />

                                    {/* Highway 2: North-West to South-East */}
                                    <polygon points="110,95 130,85 435,275 415,285" fill="url(#roadGrad)" stroke="#6320EE" strokeWidth="1.2" />
                                    <path d="M 120 90 L 425 280" stroke="#6320EE" strokeWidth="2" strokeDasharray="8 6" strokeOpacity="0.8" />

                                    {/* Elevated Highway Flyover Arch */}
                                    <path d="M 140 250 Q 270 140 400 230" fill="none" stroke="#FF6B00" strokeWidth="3" strokeOpacity="0.75" />
                                    <path d="M 140 250 Q 270 140 400 230" fill="none" stroke="#FFA043" strokeWidth="1.5" strokeDasharray="5 5" />

                                    {/* ======================================================== */}
                                    {/* GEOMETRIC ISOMETRIC TRUCK 1 (Heading North-East on Highway 1) */}
                                    {/* ======================================================== */}
                                    <g transform="translate(190, 165)">
                                        {/* Truck Shadow */}
                                        <polygon points="0,20 70,-15 50,-25 -20,10" fill="#030514" fillOpacity="0.8" />

                                        {/* Cargo Trailer Body (Long Isometric 3D Prism) */}
                                        {/* Top Face */}
                                        <polygon points="10,-28 60,-53 45,-60 -5,-35" fill="#FF8833" />
                                        {/* Left Face */}
                                        <polygon points="-5,-35 10,-28 10,-8 -5,-15" fill="#FF6B00" />
                                        {/* Right Face */}
                                        <polygon points="10,-28 60,-53 60,-33 10,-8" fill="#D45500" />

                                        {/* Truck Cabin (Front Cab) */}
                                        {/* Top Face */}
                                        <polygon points="60,-53 78,-62 70,-66 52,-57" fill="#8444F6" />
                                        {/* Left Face */}
                                        <polygon points="52,-57 60,-53 60,-39 52,-43" fill="#6320EE" />
                                        {/* Right Face */}
                                        <polygon points="60,-53 78,-62 78,-48 60,-39" fill="#4B12C2" />
                                        {/* Windshield Glass */}
                                        <polygon points="63,-53 75,-59 75,-54 63,-48" fill="#0A0E2E" />

                                        {/* Wheels */}
                                        <circle cx="5" cy="-7" r="4.5" fill="#0A0E2E" stroke="#FF6B00" strokeWidth="1.2" />
                                        <circle cx="28" cy="-19" r="4.5" fill="#0A0E2E" stroke="#FF6B00" strokeWidth="1.2" />
                                        <circle cx="48" cy="-29" r="4.5" fill="#0A0E2E" stroke="#FF6B00" strokeWidth="1.2" />
                                        <circle cx="70" cy="-40" r="4.5" fill="#0A0E2E" stroke="#6320EE" strokeWidth="1.2" />

                                        {/* Headlight Beams */}
                                        <polygon points="78,-53 115,-62 105,-72 78,-58" fill="#FF6B00" fillOpacity="0.25" />
                                    </g>

                                    {/* ======================================================== */}
                                    {/* GEOMETRIC ISOMETRIC TRUCK 2 (Heading South-East on Highway 2) */}
                                    {/* ======================================================== */}
                                    <g transform="translate(310, 195)">
                                        {/* Truck Shadow */}
                                        <polygon points="-30,-15 35,22 15,30 -50,-8" fill="#030514" fillOpacity="0.8" />

                                        {/* Cargo Trailer Body */}
                                        {/* Top Face */}
                                        <polygon points="-40,-15 10,12 2,-2 -48,-28" fill="#8444F6" />
                                        {/* Left Face */}
                                        <polygon points="-48,-28 2,-2 2,18 -48,-8" fill="#6320EE" />
                                        {/* Right Face */}
                                        <polygon points="2,-2 10,12 10,32 2,18" fill="#4B12C2" />

                                        {/* Truck Cabin (Front Cab) */}
                                        {/* Top Face */}
                                        <polygon points="10,12 28,21 24,14 6,5" fill="#FF8833" />
                                        {/* Left Face */}
                                        <polygon points="6,5 24,14 24,28 6,19" fill="#FF6B00" />
                                        {/* Right Face */}
                                        <polygon points="24,14 28,21 28,35 24,28" fill="#D45500" />

                                        {/* Wheels */}
                                        <circle cx="-35" cy="-3" r="4" fill="#0A0E2E" stroke="#6320EE" strokeWidth="1.2" />
                                        <circle cx="-15" cy="8" r="4" fill="#0A0E2E" stroke="#6320EE" strokeWidth="1.2" />
                                        <circle cx="16" cy="24" r="4" fill="#0A0E2E" stroke="#FF6B00" strokeWidth="1.2" />
                                    </g>

                                    {/* ======================================================== */}
                                    {/* CENTRAL LOGISTICS ELEVATED HUB (Geometric Hexagonal Tower) */}
                                    {/* ======================================================== */}
                                    <g transform="translate(270, 150)">
                                        {/* Hexagon Ground Pillar */}
                                        <polygon points="0,40 30,22 30,-8 0,-26 -30,-8 -30,22" fill="#0B0F33" stroke="#6320EE" strokeWidth="2" />
                                        {/* Mid Hexagon Ring */}
                                        <polygon points="0,30 22,17 22,-6 0,-19 -22,-6 -22,17" fill="#18134B" stroke="#FF6B00" strokeWidth="1.5" />
                                        {/* Top Core Prism */}
                                        <polygon points="0,-19 22,-6 0,7 -22,-6" fill="#8444F6" />
                                        <polygon points="-22,-6 0,7 0,25 -22,12" fill="#6320EE" />
                                        <polygon points="0,7 22,-6 22,12 0,25" fill="#4B12C2" />

                                        {/* Core Glowing Beacon Node */}
                                        <circle cx="0" cy="-6" r="6" fill="#FF6B00" />
                                        <circle cx="0" cy="-6" r="11" fill="none" stroke="#FF6B00" strokeWidth="1.5" strokeDasharray="3 3" />
                                    </g>

                                    {/* ======================================================== */}
                                    {/* GEOMETRIC CARGO CRATES & LOGISTICS PALLETS (Isometric Blocks) */}
                                    {/* ======================================================== */}
                                    {/* Stack 1: Left Flank Logistics Staging */}
                                    <g transform="translate(130, 270)">
                                        {/* Cube 1 (Orange Cargo Container) */}
                                        <polygon points="0,-16 16,-7 0,2 -16,-7" fill="#FF8833" />
                                        <polygon points="-16,-7 0,2 0,20 -16,11" fill="#FF6B00" />
                                        <polygon points="0,2 16,-7 16,11 0,20" fill="#D45500" />

                                        {/* Cube 2 (Stacked Behind - Violet) */}
                                        <g transform="translate(20, -12)">
                                            <polygon points="0,-16 16,-7 0,2 -16,-7" fill="#8444F6" />
                                            <polygon points="-16,-7 0,2 0,20 -16,11" fill="#6320EE" />
                                            <polygon points="0,2 16,-7 16,11 0,20" fill="#4B12C2" />
                                        </g>

                                        {/* Cube 3 (Stacked On Top - Orange) */}
                                        <g transform="translate(10, -28)">
                                            <polygon points="0,-12 12,-5 0,2 -12,-5" fill="#FFA043" />
                                            <polygon points="-12,-5 0,2 0,16 -12,9" fill="#FF6B00" />
                                            <polygon points="0,2 12,-5 12,9 0,16" fill="#D45500" />
                                        </g>
                                    </g>

                                    {/* Stack 2: Right Flank Cargo Staging */}
                                    <g transform="translate(390, 240)">
                                        {/* Cube A */}
                                        <polygon points="0,-16 16,-7 0,2 -16,-7" fill="#8444F6" />
                                        <polygon points="-16,-7 0,2 0,20 -16,11" fill="#6320EE" />
                                        <polygon points="0,2 16,-7 16,11 0,20" fill="#4B12C2" />

                                        {/* Cube B */}
                                        <g transform="translate(-16, -10)">
                                            <polygon points="0,-16 16,-7 0,2 -16,-7" fill="#FF8833" />
                                            <polygon points="-16,-7 0,2 0,20 -16,11" fill="#FF6B00" />
                                            <polygon points="0,2 16,-7 16,11 0,20" fill="#D45500" />
                                        </g>
                                    </g>

                                    {/* ======================================================== */}
                                    {/* FLOATING GEOMETRIC LOGISTICS WAYPOINTS & BEACONS */}
                                    {/* ======================================================== */}
                                    {/* Waypoint Diamond 1 (West Node) */}
                                    <g transform="translate(80, 160)">
                                        <polygon points="0,-14 12,0 0,14 -12,0" fill="#0E1339" stroke="#6320EE" strokeWidth="2" />
                                        <circle cx="0" cy="0" r="4" fill="#6320EE" />
                                        <line x1="0" y1="14" x2="0" y2="40" stroke="#6320EE" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                                        <ellipse cx="0" cy="40" rx="10" ry="5" fill="none" stroke="#6320EE" strokeWidth="1" opacity="0.5" />
                                    </g>

                                    {/* Waypoint Diamond 2 (East Node) */}
                                    <g transform="translate(450, 130)">
                                        <polygon points="0,-14 12,0 0,14 -12,0" fill="#0E1339" stroke="#FF6B00" strokeWidth="2" />
                                        <circle cx="0" cy="0" r="4" fill="#FF6B00" />
                                        <line x1="0" y1="14" x2="0" y2="45" stroke="#FF6B00" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                                        <ellipse cx="0" cy="45" rx="10" ry="5" fill="none" stroke="#FF6B00" strokeWidth="1" opacity="0.5" />
                                    </g>

                                    {/* Waypoint Diamond 3 (North-Central Node) */}
                                    <g transform="translate(200, 65)">
                                        <polygon points="0,-12 10,0 0,12 -10,0" fill="#0E1339" stroke="#6320EE" strokeWidth="1.8" />
                                        <circle cx="0" cy="0" r="3.5" fill="#FF6B00" />
                                    </g>

                                    {/* Floating Geometric Particle Cubes / Nav Dots */}
                                    <g transform="translate(360, 80)">
                                        <polygon points="0,-8 8,-3 0,2 -8,-3" fill="#FF8833" />
                                        <polygon points="-8,-3 0,2 0,10 -8,5" fill="#FF6B00" />
                                        <polygon points="0,2 8,-3 8,5 0,10" fill="#D45500" />
                                    </g>
                                    <g transform="translate(150, 110)">
                                        <polygon points="0,-7 7,-2 0,3 -7,-2" fill="#8444F6" />
                                        <polygon points="-7,-2 0,3 0,9 -7,4" fill="#6320EE" />
                                        <polygon points="0,3 7,-2 7,4 0,9" fill="#4B12C2" />
                                    </g>

                                    {/* Constellation / Route Network Interconnect Vector Lines */}
                                    <line x1="80" y1="160" x2="200" y2="65" stroke="#6320EE" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                                    <line x1="200" y1="65" x2="270" y2="150" stroke="#FF6B00" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                                    <line x1="270" y1="150" x2="450" y2="130" stroke="#6320EE" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-[#06081B]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-white mb-3">
                            {sections?.faq?.title_ar || 'الأسئلة الشائعة'}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {sections?.faq?.subtitle_ar || 'كل ما تحتاج لمعرفته حول الاستثمار والربط في منصة GoTransTech'}
                        </p>
                    </div>

                    <div className="space-y-4">
                        {displayFaqs.map((faq, index) => (
                            <div key={index} className="glass-panel-card rounded-2xl border border-violet-900/30 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                                    className="w-full p-5 text-start flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-200 hover:text-orange-400 transition-colors"
                                >
                                    <span>{faq.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${faqOpen === index ? 'rotate-180 text-orange-400' : ''}`} />
                                </button>
                                {faqOpen === index && (
                                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-violet-950/60 pt-3">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comprehensive Footer Managed from Admin CMS */}
            {sections?.contact_footer?.is_active !== false && (
                <footer className="border-t border-violet-900/40 bg-[#040615] text-slate-300 relative overflow-hidden">
                    {/* Subtle background ambient lights */}
                    <div className="absolute bottom-0 right-1/4 w-96 h-48 bg-violet-600/5 blur-[120px] pointer-events-none" />
                    <div className="absolute top-0 left-1/4 w-96 h-48 bg-orange-500/5 blur-[120px] pointer-events-none" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
                        {/* 4-Column Responsive Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-violet-950/80">
                            {/* Col 1 & 2: Platform Identity, Bio & Social Networks */}
                            <div className="lg:col-span-2 space-y-5">
                                <Link href="/" className="inline-block">
                                    <BrandLogo size={branding?.navbar_brand_size || 'md'} showSlogan={true} displayMode={branding?.navbar_brand_display || 'both'} textClassName="text-white" />
                                </Link>

                                <p className="text-xs text-slate-400 leading-relaxed max-w-md">
                                    {footerSection?.description_ar || 'المنصة السعودية الذكية الأولى المتخصصة في تمويل المهام والخدمات اللوجستية، نربط بين المستثمرين وشركات النقل لتمكين النمو وتدفق السيولة السريعة بعوائد فورية وموثقة.'}
                                </p>

                                {/* Trust & Regulatory Badge */}
                                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-950/60 border border-violet-800/40 text-[11px] text-violet-300">
                                    <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0" />
                                    <span>منظومة تقنية مالية معتمدة وفق أعلى معايير الحوكمة والشفافية 🇸🇦</span>
                                </div>

                                {/* Social Media Channels */}
                                <div className="pt-1">
                                    <span className="block text-[11px] font-bold text-slate-400 mb-2.5">تابعنا على شبكات التواصل الاجتماعي:</span>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {footerSection?.twitter_url && (
                                            <a
                                                href={footerSection.twitter_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-[#6320EE] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                                                title="منصة X (تويتر)"
                                            >
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                                </svg>
                                            </a>
                                        )}
                                        {footerSection?.linkedin_url && (
                                            <a
                                                href={footerSection.linkedin_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-[#6320EE] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                                                title="LinkedIn"
                                            >
                                                <LinkedinIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        {footerSection?.instagram_url && (
                                            <a
                                                href={footerSection.instagram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-[#6320EE] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                                                title="Instagram"
                                            >
                                                <InstagramIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        {footerSection?.facebook_url && (
                                            <a
                                                href={footerSection.facebook_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-[#6320EE] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                                                title="Facebook"
                                            >
                                                <FacebookIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        {footerSection?.youtube_url && (
                                            <a
                                                href={footerSection.youtube_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-[#6320EE] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                                                title="YouTube"
                                            >
                                                <YoutubeIcon className="w-4 h-4" />
                                            </a>
                                        )}
                                        {footerSection?.telegram_url && (
                                            <a
                                                href={footerSection.telegram_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-9 h-9 rounded-xl bg-slate-900 border border-violet-900/40 hover:border-[#6320EE] text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-105"
                                                title="Telegram"
                                            >
                                                <Send className="w-4 h-4" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Col 3: Investors Gateway */}
                            <div className="space-y-3.5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-violet-400" />
                                    <span>بوابة المستثمرين</span>
                                </h4>
                                <ul className="space-y-2.5 text-xs text-slate-400">
                                    <li>
                                        <a href="#how-it-works" className="hover:text-orange-400 transition-colors block">
                                            آلية التمويل اللوجستي
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#features" className="hover:text-orange-400 transition-colors block">
                                            عوائد الأرباح الفورية
                                        </a>
                                    </li>
                                    <li>
                                        <Link href={user ? dashboardUrl : route('register')} className="hover:text-orange-400 transition-colors block">
                                            فتح حساب مستثمر جديد
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('login')} className="hover:text-orange-400 transition-colors block">
                                            شحن المحفظة الاستثمارية
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="#faq" className="hover:text-orange-400 transition-colors block">
                                            ضمانات وحماية رأس المال
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Col 4: Shippers & Logistics Companies Links */}
                            <div className="space-y-3.5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-orange-400" />
                                    <span>شركات النقل والـ API</span>
                                </h4>
                                <ul className="space-y-2.5 text-xs text-slate-400">
                                    <li>
                                        <a href="#api" className="hover:text-orange-400 transition-colors block">
                                            الربط التقني عبر REST API
                                        </a>
                                    </li>
                                    <li>
                                        <Link href={user ? dashboardUrl : route('register')} className="hover:text-orange-400 transition-colors block">
                                            طلب تمويل شحنات النقل
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href={route('login')} className="hover:text-orange-400 transition-colors block">
                                            توليد مفاتيح الربط البرمجي
                                        </Link>
                                    </li>
                                    <li>
                                        <a href="#features" className="hover:text-orange-400 transition-colors block">
                                            سيولة وقود وصيانة الرحلات
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#faq" className="hover:text-orange-400 transition-colors block">
                                            سندات الصرف وسداد الديون
                                        </a>
                                    </li>
                                </ul>
                            </div>

                            {/* Col 5: Contact & Customer Support */}
                            <div className="space-y-3.5">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                    <PhoneCall className="w-4 h-4 text-blue-400" />
                                    <span>خدمة العملاء والدعم الفني</span>
                                </h4>

                                <div className="space-y-3 text-xs text-slate-300">
                                    {footerSection?.phone && (
                                        <a
                                            href={`tel:${footerSection.phone.replace(/\s+/g, '')}`}
                                            className="flex items-center gap-2 hover:text-orange-400 transition-colors group"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-violet-950/80 border border-violet-800/40 flex items-center justify-center shrink-0 group-hover:border-orange-500">
                                                <Phone className="w-3.5 h-3.5 text-violet-400 group-hover:text-orange-400" />
                                            </div>
                                            <span className="font-mono text-xs">{footerSection.phone}</span>
                                        </a>
                                    )}

                                    {footerSection?.whatsapp_number && (
                                        <a
                                            href={`https://wa.me/${footerSection.whatsapp_number.replace(/[^0-9]/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 hover:text-orange-400 transition-colors group"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-800/40 flex items-center justify-center shrink-0 group-hover:border-emerald-500">
                                                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                                            </div>
                                            <span className="font-mono text-xs">{footerSection.whatsapp_number} (واتساب)</span>
                                        </a>
                                    )}

                                    {footerSection?.email && (
                                        <a
                                            href={`mailto:${footerSection.email}`}
                                            className="flex items-center gap-2 hover:text-orange-400 transition-colors group break-all"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-violet-950/80 border border-violet-800/40 flex items-center justify-center shrink-0 group-hover:border-orange-500">
                                                <Mail className="w-3.5 h-3.5 text-violet-400 group-hover:text-orange-400" />
                                            </div>
                                            <span className="font-mono text-xs">{footerSection.email}</span>
                                        </a>
                                    )}

                                    {footerSection?.address && (
                                        <div className="flex items-start gap-2 text-slate-400 leading-relaxed pt-1">
                                            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                                                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                                            </div>
                                            <span className="text-[11px]">{footerSection.address}</span>
                                        </div>
                                    )}

                                    {footerSection?.working_hours && (
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-0.5">
                                            <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                                                <Clock className="w-3.5 h-3.5 text-blue-400" />
                                            </div>
                                            <span>{footerSection.working_hours}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Bar: Copyrights & Regulatory */}
                        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-start">
                                <p>
                                    {footerSection?.copyright_text || `جميع الحقوق محفوظة © ${new Date().getFullYear()} GoTransTech للتقنية المالية والخدمات اللوجستية.`}
                                </p>
                                {(footerSection?.cr_number || footerSection?.tax_number) && (
                                    <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
                                        {footerSection.cr_number && <span>س.ت: {footerSection.cr_number}</span>}
                                        {footerSection.tax_number && <span>الرقم الضريبي: {footerSection.tax_number}</span>}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-[11px] text-slate-400">
                                <a href="#faq" className="hover:text-slate-200 transition-colors">شروط الاستخدام</a>
                                <span className="text-slate-700">•</span>
                                <a href="#faq" className="hover:text-slate-200 transition-colors">سياسة الخصوصية</a>
                                <span className="text-slate-700">•</span>
                                <a href="#faq" className="hover:text-slate-200 transition-colors">مكافحة غسيل الأموال</a>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
