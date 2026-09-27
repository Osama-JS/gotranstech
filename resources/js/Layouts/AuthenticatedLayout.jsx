import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    User,
    Building2,
    Truck,
    Wallet,
    FileText,
    ArrowDownToLine,
    CreditCard,
    Settings,
    History,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Globe,
    Zap,
    Key,
    DollarSign,
    ShieldAlert,
    LayoutTemplate,
    Receipt,
    ShieldCheck,
    UserCog,
    BarChart3,
    Server,
    Layers,
    Search,
    FormInput,
} from 'lucide-react';
import Toast from '../Components/Toast';
import ThemeToggle from '../Components/ThemeToggle';
import QuickSearchModal from '../Components/QuickSearchModal';
import BrandLogo from '../Components/BrandLogo';

export default function AuthenticatedLayout({ children, title }) {
    const { auth, locale, landingUrl } = usePage().props;
    const user = auth?.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [quickSearchOpen, setQuickSearchOpen] = useState(false);

    const isAr = locale === 'ar';

    useEffect(() => {
        const handleOpenSearch = () => setQuickSearchOpen(true);
        window.addEventListener('open-quick-search', handleOpenSearch);
        return () => window.removeEventListener('open-quick-search', handleOpenSearch);
    }, []);

    // Navigation configuration based on user_type (categorized groups for admin)
    const getAdminNavGroups = () => [
        {
            title: 'الرئيسية والتحليلات',
            items: [
                { name: 'لوحة المؤشرات', href: route('admin.dashboard'), icon: LayoutDashboard, routeKey: 'admin.dashboard' },
                { name: 'التحليلات والإحصائيات', href: route('admin.analytics.index'), icon: BarChart3, routeKey: 'admin.analytics.*' },
            ],
        },
        {
            title: 'العمليات والتمويل اللوجستي',
            items: [
                { name: 'المهام اللوجستية', href: route('admin.tasks.index'), icon: Truck, routeKey: 'admin.tasks.*' },
                { name: 'الإيداعات البنكية', href: route('admin.deposits.index'), icon: Receipt, routeKey: 'admin.deposits.*' },
                { name: 'طلبات سحب الرصيد', href: route('admin.withdrawals.index'), icon: ArrowDownToLine, routeKey: 'admin.withdrawals.*' },
                { name: 'العقود والاتفاقيات', href: route('admin.contracts.index'), icon: FileText, routeKey: 'admin.contracts.*' },
            ],
        },
        {
            title: 'الشركاء والمستخدمون',
            items: [
                { name: 'المستثمرون', href: route('admin.investors.index'), icon: Users, routeKey: 'admin.investors.*' },
                { name: 'الشركات اللوجستية', href: route('admin.companies.index'), icon: Building2, routeKey: 'admin.companies.*' },
                { name: 'إدارة المديرين', href: route('admin.admins.index'), icon: UserCog, routeKey: 'admin.admins.*' },
                { name: 'الصلاحيات والأدوار', href: route('admin.roles.index'), icon: ShieldCheck, routeKey: 'admin.roles.*' },
            ],
        },
        {
            title: 'إدارة المحتوى والنماذج',
            items: [
                { name: 'صفحة الهبوط (CMS)', href: route('admin.cms.index'), icon: LayoutTemplate, routeKey: 'admin.cms.*' },
                { name: 'قوالب الحقول الإضافية', href: route('admin.form-templates.index'), icon: FormInput, routeKey: 'admin.form-templates.*' },
            ],
        },
        {
            title: 'الرقابة وصحة النظام',
            items: [
                { name: 'سجل العمليات والتدقيق', href: route('admin.audit.index'), icon: History, routeKey: 'admin.audit.*' },
                { name: 'صحة الخادم والقاعدة', href: route('admin.system-health.index'), icon: Server, routeKey: 'admin.system-health.*' },
                { name: 'الإعدادات وبوابات الدفع', href: route('admin.settings.index'), icon: Settings, routeKey: 'admin.settings.*' },
            ],
        },
    ];

    const getPortalNavItems = () => {
        if (user?.is_investor) {
            return [
                { name: 'لوحة التحكم', href: route('investor.dashboard'), icon: LayoutDashboard, routeKey: 'investor.dashboard' },
                { name: 'التحليلات والمؤشرات', href: route('investor.analytics.index'), icon: BarChart3, routeKey: 'investor.analytics.*' },
                { name: 'سوق المهام الحية', href: route('investor.market.index'), icon: Zap, routeKey: 'investor.market.*' },
                { name: 'محفظة الاستثمار ورأس المال', href: route('investor.wallet.investment'), icon: Wallet, routeKey: 'investor.wallet.investment' },
                { name: 'محفظة الأرباح والعمولات', href: route('investor.wallet.commission'), icon: CreditCard, routeKey: 'investor.wallet.commission' },
                { name: 'عقود الاستثمار', href: route('investor.contracts.index'), icon: FileText, routeKey: 'investor.contracts.*' },
            ];
        }

        if (user?.is_company) {
            return [
                { name: 'لوحة التحكم', href: route('company.dashboard'), icon: LayoutDashboard, routeKey: 'company.dashboard' },
                { name: 'التحليلات والمؤشرات', href: route('company.analytics.index'), icon: BarChart3, routeKey: 'company.analytics.*' },
                { name: 'إدارة المهام', href: route('company.tasks.index'), icon: Truck, routeKey: 'company.tasks.*' },
                { name: 'محفظة التمويل والمسحوبات', href: route('company.wallet.funding'), icon: Wallet, routeKey: 'company.wallet.funding' },
                { name: 'محفظة الديون والالتزامات', href: route('company.wallet.debt'), icon: DollarSign, routeKey: 'company.wallet.debt' },
                { name: 'سحب رصيد التمويل (PDF)', href: route('company.withdrawals.index'), icon: ArrowDownToLine, routeKey: 'company.withdrawals.*' },
                { name: 'مفاتيح الربط والـ API', href: route('company.api.index'), icon: Key, routeKey: 'company.api.*' },
            ];
        }

        return [];
    };

    const handleSwitchLocale = () => {
        const targetLocale = locale === 'ar' ? 'en' : 'ar';
        router.post(route('locale.switch'), { locale: targetLocale });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#070A1E] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200" dir={isAr ? 'rtl' : 'ltr'}>
            <Toast />
            <QuickSearchModal isOpen={quickSearchOpen} onClose={() => setQuickSearchOpen(false)} />

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B0F2A]/90 backdrop-blur-xl border-b border-slate-200 dark:border-violet-900/30 px-4 lg:px-8 h-16 flex items-center justify-between shadow-sm dark:shadow-black/20">
                {/* Brand & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-violet-950/40 transition-colors"
                    >
                        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>

                    <Link href="/" className="flex items-center gap-3 group">
                        <BrandLogo size="sm" showSlogan={false} />
                        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                            {user?.is_admin ? 'لوحة الإدارة' : user?.is_company ? 'بوابة الشركات' : 'بوابة المستثمر'}
                        </span>
                    </Link>

                    {/* Quick Search Bar Trigger (Admins) */}
                    {user?.is_admin && (
                        <>
                            <button
                                type="button"
                                onClick={() => setQuickSearchOpen(true)}
                                className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-violet-950/30 dark:hover:bg-violet-900/40 border border-slate-200 dark:border-violet-800/40 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-all text-xs mr-4 rtl:mr-4 rtl:ml-0 shadow-inner cursor-pointer"
                            >
                                <Search className="w-3.5 h-3.5 text-orange-500" />
                                <span>البحث السريع في النظام...</span>
                                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-violet-900/60 border border-slate-300 dark:border-violet-700/50 text-[10px] font-mono text-slate-700 dark:text-violet-200">
                                    Ctrl + K
                                </kbd>
                            </button>
                            <button
                                type="button"
                                onClick={() => setQuickSearchOpen(true)}
                                className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-violet-950/40 transition-colors mr-2 rtl:mr-2 rtl:ml-0 cursor-pointer"
                                title="البحث الشامل (Ctrl + K)"
                            >
                                <Search className="w-5 h-5 text-orange-500" />
                            </button>
                        </>
                    )}
                </div>

                {/* Right Area (Wallets Pill + Locale Switcher + User Dropdown) */}
                <div className="flex items-center gap-3">
                    {/* Investor quick balance */}
                    {user?.is_investor && user?.wallets?.investor_investment && (
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-violet-950/40 border border-slate-200 dark:border-violet-800/40 px-3.5 py-1.5 rounded-xl">
                            <Wallet className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                            <div className="text-xs">
                                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">محفظة الاستثمار:</span>
                                <span className="font-bold font-mono text-orange-600 dark:text-orange-400">
                                    {user.wallets.investor_investment.available_balance.toLocaleString('en-US')} ر.س
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Company quick funding balance */}
                    {user?.is_company && user?.wallets?.company_funding && (
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-violet-950/40 border border-slate-200 dark:border-violet-800/40 px-3.5 py-1.5 rounded-xl">
                            <ArrowDownToLine className="w-4 h-4 text-orange-500" />
                            <div className="text-xs">
                                <span className="text-slate-500 dark:text-slate-400 block text-[10px]">رصيد التمويل المتاح:</span>
                                <span className="font-bold font-mono text-violet-700 dark:text-violet-300">
                                    {user.wallets.company_funding.available_balance.toLocaleString('en-US')} ر.س
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Language Switcher */}
                    <button
                        type="button"
                        onClick={handleSwitchLocale}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-violet-800/40 transition-colors"
                        title="تغيير اللغة"
                    >
                        <Globe className="w-3.5 h-3.5 text-orange-500" />
                        <span>{locale === 'ar' ? 'English' : 'عربي'}</span>
                    </button>

                    {/* Theme Toggle (Light / Dark Mode) */}
                    <ThemeToggle />

                    {/* User Profile dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-violet-950/40 border border-transparent hover:border-slate-200 dark:hover:border-violet-800/40 transition-all"
                        >
                            <div className="w-8 h-8 rounded-lg bg-[#6320EE] text-white flex items-center justify-center font-bold text-sm shadow-md">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden md:block text-start text-xs">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[120px]">{user?.name}</span>
                                <span className="text-violet-600 dark:text-violet-400 text-[10px] block">{user?.email}</span>
                            </div>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        {userMenuOpen && (
                            <div 
                                className="absolute left-0 rtl:right-0 rtl:left-auto mt-2 w-56 bg-white dark:bg-[#0E1338] border border-slate-200 dark:border-violet-800/50 rounded-2xl shadow-2xl py-2 z-50 animate-scaleUp backdrop-blur-xl"
                                onClick={() => setUserMenuOpen(false)}
                            >
                                <div className="px-4 py-2 border-b border-slate-200 dark:border-violet-900/40">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                                    <p className="text-[11px] text-violet-600 dark:text-violet-400 truncate">{user?.email}</p>
                                </div>

                                <Link
                                    href={route('profile.show')}
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-violet-950/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <User className="w-4 h-4 text-violet-500" />
                                    <span>الملف الشخصي وإعدادات الحساب</span>
                                </Link>

                                <a
                                    href={landingUrl || '/'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-violet-950/50 hover:text-slate-900 dark:hover:text-white transition-colors"
                                >
                                    <LayoutTemplate className="w-4 h-4 text-[#FF6B00]" />
                                    <span>زيارة صفحة الهبوط العامة</span>
                                </a>

                                <button
                                    type="button"
                                    onClick={() => router.post(route('logout'))}
                                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-colors border-t border-slate-200 dark:border-violet-900/40 mt-1 text-start"
                                >
                                    <LogOut className="w-4 h-4 text-rose-500" />
                                    <span>تسجيل الخروج</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Wrapper */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className={`fixed inset-y-0 ${isAr ? 'right-0' : 'left-0'} top-16 z-30 w-64 bg-white/95 dark:bg-[#0B0F2A]/95 backdrop-blur-xl border-l border-slate-200 dark:border-violet-900/30 p-3.5 transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : (isAr ? 'translate-x-full' : '-translate-x-full')
                }`}>
                    <nav className="space-y-4 h-full overflow-y-auto pr-1 pb-16 no-scrollbar scrollbar-none">
                        {user?.is_admin ? (
                            getAdminNavGroups().map((group, gIdx) => (
                                <div key={gIdx} className="space-y-1">
                                    <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-violet-300/70">
                                        {group.title}
                                    </div>
                                    <div className="space-y-0.5">
                                        {group.items.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = route().current(item.routeKey);

                                            return (
                                                <Link
                                                    key={item.name}
                                                    href={item.href}
                                                    onClick={() => setSidebarOpen(false)}
                                                    data-active={isActive ? 'true' : 'false'}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                        isActive
                                                            ? 'active-nav-link bg-[#6320EE] text-white shadow-md shadow-violet-600/20'
                                                            : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-violet-950/40 border border-transparent'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-violet-600 dark:text-violet-400/80'}`} />
                                                    <span className="truncate">{item.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="space-y-1">
                                {getPortalNavItems().map((item) => {
                                    const Icon = item.icon;
                                    const isActive = route().current(item.routeKey);

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            data-active={isActive ? 'true' : 'false'}
                                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                                isActive
                                                    ? 'active-nav-link bg-[#6320EE] text-white shadow-md shadow-violet-600/20'
                                                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-violet-950/40 border border-transparent'
                                            }`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-violet-600 dark:text-violet-400/80'}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </nav>
                </aside>

                {/* Content Area */}
                <main className={`flex-1 overflow-y-auto p-4 lg:p-8 transition-all ${isAr ? 'lg:mr-64' : 'lg:ml-64'}`}>
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
