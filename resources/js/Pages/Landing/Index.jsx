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
    const heroSection = sections?.hero?.content || {};
    const heroTitle = heroSection?.title_ar || 'نمول حركة الغد في قطاع النقل والخدمات اللوجستية';
    const heroSubtitle = heroSection?.subtitle_ar || 'اربط شركتك اللوجستية بمستثمري السيولة، أو استثمر في تمويل شحنات التوصيل اليومية وحقق عوائد وأرباح فورية بكل شفافية وأمان.';
    
    const statsSection = sections?.stats?.content || {};
    const howSection = sections?.how_it_works?.content || {};
    const featuresSection = sections?.features?.content || {};
    const faqSection = sections?.faq?.content || {};
    const footerSection = sections?.contact_footer?.content || {};

    const [faqOpen, setFaqOpen] = useState(null);

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
                    <span>{heroSection?.badge_ar || '🚀 نمول حركة الغد | FINANCING WHAT MOVES TOMORROW'}</span>
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
                            <span>{heroSection?.cta_primary_text_ar || 'ابدأ الاستثمار الآن'}</span>
                            <Zap className="w-5 h-5 fill-white text-white" />
                        </Link>
                    )}
                    <a
                        href="#api"
                        className="w-full sm:w-auto px-7 py-3.5 sm:px-8 sm:py-4 rounded-2xl font-bold text-sm sm:text-base bg-[#0E1338]/90 hover:bg-[#151D52] text-slate-200 border border-violet-800/40 hover:border-orange-500/40 flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                        <Code className="w-5 h-5 text-orange-400" />
                        <span>{heroSection?.cta_secondary_text_ar || 'بوابة الشركات (API)'}</span>
                    </a>
                </div>

                {/* Live Statistics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-violet-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-violet-400 mb-1">
                            {statsSection?.stat1_value || (liveStats?.total_funded_tasks ? `+${liveStats.total_funded_tasks.toLocaleString('en-US')}` : '+250,000')}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.stat1_label || 'مهمة لوجستية ممولة'}
                        </span>
                    </div>
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-orange-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-orange-400 mb-1">
                            {statsSection?.stat2_value || (liveStats?.total_invested_amount ? `${liveStats.total_invested_amount.toLocaleString('en-US')} ر.س` : '3,450,000 ر.س')}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.stat2_label || 'إجمالي التمويل المستثمر'}
                        </span>
                    </div>
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-violet-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-violet-300 mb-1">
                            {statsSection?.stat3_value || `${liveStats?.available_tasks_count || 24} مهمة`}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.stat3_label || 'مهام حية متاحة للتمويل'}
                        </span>
                    </div>
                    <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-violet-900/30 text-center hover:border-orange-500/40 transition-colors">
                        <span className="block text-xl sm:text-3xl font-black font-mono text-orange-300 mb-1">
                            {statsSection?.stat4_value || '100%'}
                        </span>
                        <span className="text-[11px] sm:text-sm text-slate-400 font-medium">
                            {statsSection?.stat4_label || 'ضمان محاسبي وعقود رسمية'}
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

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 relative">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400 font-mono font-bold flex items-center justify-center mb-4">
                                01
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                {howSection?.step1_title || 'إرسال المهام عبر API'}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {howSection?.step1_desc || 'تقوم الشركات اللوجستية بإرسال مهام التوصيل اللحظية عبر الـ API المؤمن إلى سوق التمويل.'}
                            </p>
                        </div>

                        <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 relative">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono font-bold flex items-center justify-center mb-4">
                                02
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                {howSection?.step2_title || 'شحن المحفظة والتمويل'}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {howSection?.step2_desc || 'يشحن المستثمر محفظته عبر HyperPay أو التحويل البنكي ويختار المهام لتمويلها بضغطة زر.'}
                            </p>
                        </div>

                        <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 relative">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-300 font-mono font-bold flex items-center justify-center mb-4">
                                03
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                {howSection?.step3_title || 'أرباح عمولات فورية'}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {howSection?.step3_desc || 'تُضاف أرباح العمولة لمحفظة المستثمر فور تمويل المهمة وفق النسبة المحددة في عقده.'}
                            </p>
                        </div>

                        <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 relative">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-300 font-mono font-bold flex items-center justify-center mb-4">
                                04
                            </div>
                            <h3 className="text-base font-bold text-white mb-2">
                                {howSection?.step4_title || 'سحب التمويل وسداد الديون'}
                            </h3>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                {howSection?.step4_desc || 'تطلب الشركة سحب مبالغ التمويل بسندات PDF موقعة وتسددها في تاريخ الاستحقاق المحدد.'}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                        {sections?.features?.title_ar || 'مميزات صُممت لتمكين منظومة النقل والاستثمار'}
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base">
                        {sections?.features?.subtitle_ar || 'تقنيات مالية متطورة لتسريع تدفقاتك النقدية وتحقيق أقصى درجات الأمان والشفافية.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 hover:border-violet-500/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/30 text-violet-400 flex items-center justify-center mb-4 glow-violet">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {featuresSection?.feat1_title || 'أمان مالي ونظام قيود مزدوجة'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            {featuresSection?.feat1_desc || 'تدقيق محاسبي غير قابل للتلاعب (Double-Entry Ledger) يضمن سلامة كل هللة في النظام وتطابقها التام.'}
                        </p>
                    </div>

                    <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 hover:border-orange-500/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-4 glow-orange">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {featuresSection?.feat2_title || 'عوائد أرباح فورية'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            {featuresSection?.feat2_desc || 'تحصل على نسبتك من أرباح العمولة مباشرة في محفظتك لحظة تمويل المهمة دون انتظار انتهاء فترة التوصيل.'}
                        </p>
                    </div>

                    <div className="glass-panel-card p-6 rounded-2xl border border-violet-900/30 hover:border-violet-500/40 transition-all duration-300">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-300 flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {featuresSection?.feat3_title || 'ربط برمجي فائق السرعة'}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                            {featuresSection?.feat3_desc || 'واجهات برمجية RESTful مهيأة وموثقة للربط المباشر مع أنظمة تخطيط الموارد وسجلات الشحنات بسهولة تامة.'}
                        </p>
                    </div>
                </div>
            </section>

            {/* API Integration Section */}
            <section id="api" className="py-20 bg-[#080B22]/80 border-y border-violet-950/40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/25 text-orange-400 text-xs font-bold mb-4">
                                <Code className="w-4 h-4" />
                                <span>للمطورين والشركات اللوجستية</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                                بوابة برمجية متكاملة لربط أنظمة التوصيل والنقل
                            </h2>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                وفر لعملياتك اللوجستية السيولة الفورية المطلوبة عن طريق ربط منصتك مع GoTransTech API. أرسل المهام واستقبل إشعارات الـ Webhook الموقعة لحظياً عند تمويل كل مهمة.
                            </p>

                            <ul className="space-y-3 mb-8 text-sm">
                                <li className="flex items-center gap-2 text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                                    <span>توثيق قوي عبر مفاتيح API Keys وتشفير HMAC Signatures</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                                    <span>إشعارات Webhooks فورية لحالات التمويل وسحب الأرصدة</span>
                                </li>
                                <li className="flex items-center gap-2 text-slate-300">
                                    <CheckCircle2 className="w-4 h-4 text-orange-400 shrink-0" />
                                    <span>لوحة تحكم متكاملة لمراقبة الرصيد، المهام، والديون المستحقة</span>
                                </li>
                            </ul>

                            <Link
                                href={user ? dashboardUrl : route('register')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                            >
                                <span>{user ? 'الانتقال إلى لوحة التحكم' : 'تسجيل شركة وطلب مفاتيح الربط'}</span>
                                <ArrowLeft className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Code Preview Box */}
                        <div className="glass-panel p-5 rounded-2xl border border-violet-800/40 font-mono text-xs overflow-x-auto shadow-2xl bg-[#090C28]/95">
                            <div className="flex items-center justify-between pb-3 mb-3 border-b border-violet-900/40 text-slate-400">
                                <span className="text-orange-400 font-bold">POST /api/v1/tasks</span>
                                <span className="text-[10px] bg-violet-950/80 text-violet-300 border border-violet-800/50 px-2 py-0.5 rounded font-mono">Bearer Auth</span>
                            </div>
                            <pre className="text-slate-300 leading-relaxed overflow-x-auto">
{`// إرسال مهمة جديدة للتمويل
curl -X POST https://api.gotranstech.sa/api/v1/tasks \\
  -H "Authorization: Bearer gtt_live_9988776655..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_task_id": "ORD-RYD-9982",
    "title": "شحنة معدات وخوادم تقنية",
    "funding_amount": 5000.00,
    "pickup_city": "الرياض",
    "pickup_address": "حي الصحافة",
    "dropoff_city": "الرياض",
    "dropoff_address": "حي العليا",
    "duration_minutes": 45
  }'`}
                            </pre>
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
