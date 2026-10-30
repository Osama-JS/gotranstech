import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import confetti from 'canvas-confetti';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Modal from '@/Components/Modal';
import Badge from '@/Components/Badge';
import ReceiptViewerModal from '@/Components/ReceiptViewerModal';
import Select2 from '@/Components/Select2';
import { useTranslation } from '@/Utils/i18n';
import {
    Wallet,
    CreditCard,
    Building,
    Upload,
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    PlusCircle,
    FileText,
    Copy,
    Eye,
    TrendingUp,
    ShieldCheck,
    Layers,
    DollarSign,
    ExternalLink,
    Check,
    AlertTriangle,
    Shield,
    Search,
    Filter,
    RotateCcw,
    X,
} from 'lucide-react';

function MadaLogo() {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
            <span className="font-black text-xs text-[#008459] dark:text-emerald-400">مدى</span>
            <div className="w-[1px] h-3 bg-emerald-500/30" />
            <span className="font-extrabold text-xs text-[#008459] dark:text-emerald-400 font-sans tracking-tight">mada</span>
        </div>
    );
}

function VisaMastercardLogo() {
    return (
        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-500/20">
            <svg viewBox="0 0 48 16" className="h-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.4 0.5L12.7 15.5H8.4L5.1 3.4C4.9 2.6 4.7 2.3 4.1 2C3.1 1.5 1.5 1 0 0.7L0.1 0.5H7.1C8 0.5 8.8 1.1 9 2.1L10.7 10.9L15.1 0.5H19.4ZM36.5 10.6C36.5 6.6 30.9 6.3 31 4.5C31.1 3.9 31.6 3.3 32.8 3.1C33.4 3 35 2.9 36.7 3.7L37.4 0.6C36.4 0.2 35.1 0 33.5 0C29.4 0 26.5 2.2 26.5 5.3C26.5 7.6 28.6 8.9 30.2 9.7C31.8 10.5 32.3 11 32.3 11.7C32.3 12.8 31 13.3 29.8 13.3C27.7 13.3 26.5 13 25.1 12.4L24.4 15.6C25.5 16.1 27.5 16.5 29.5 16.5C33.9 16.5 36.5 14.3 36.5 10.6ZM47.3 15.5H51L47.7 0.5H44.3C43.5 0.5 42.9 0.9 42.6 1.7L36.4 15.5H40.7L41.6 13.1H46.8L47.3 15.5ZM42.7 10.1L44.8 4.3L46 10.1H42.7ZM25.7 0.5L22.3 15.5H18.2L21.6 0.5H25.7Z" fill="#1434CB" />
            </svg>
            <div className="w-[1px] h-3 bg-slate-300 dark:bg-slate-700" />
            <svg viewBox="0 0 36 22" className="h-3.5" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="11" fill="#EB001B" />
                <circle cx="25" cy="11" r="11" fill="#F79E1B" fillOpacity="0.85" />
            </svg>
        </div>
    );
}

function ApplePayLogo() {
    return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 font-sans font-bold text-slate-900 dark:text-white">
            <svg viewBox="0 0 170 170" className="h-3.5 w-3.5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.74-7.85-12.14-14.34-6.3-9.4-11.28-20.12-14.94-32.17-3.66-12.04-5.49-23.4-5.49-34.08 0-14.07 3.41-25.54 10.23-34.42 6.82-8.88 15.65-13.43 26.49-13.65 4.7 0 10.02 1.25 15.96 3.75 5.94 2.5 9.77 3.75 11.5 3.75 1.52 0 5.46-1.32 11.83-3.96 6.37-2.64 11.85-3.83 16.44-3.56 12.5.65 22.36 4.97 29.58 12.98-10.89 6.53-16.22 15.45-16 26.78.23 8.88 3.53 16.27 9.9 22.18 6.37 5.9 14.15 9.3 23.34 10.2-2.17 6.74-4.78 13.59-7.84 20.55zm-28.53-108.64c0 6.6-2.4 12.82-7.21 17.65-4.8 4.83-10.74 7.67-17.81 7.42-.11-1.09-.16-2.07-.16-2.94 0-6.4 2.5-12.71 7.5-17.92 5-5.21 11.16-8.21 18.48-9 .11.98.2 1.91.2 2.79z"/>
            </svg>
            <span className="text-xs font-black tracking-tight">Pay</span>
        </div>
    );
}

export default function InvestmentWallet({
    wallet,
    commissionWallet,
    stats = {},
    transactions,
    bankDeposits,
    platformBankInfo,
    enabledPaymentMethods = { MADA: true, VISA: true, APPLEPAY: true },
}) {
    const { t, locale } = useTranslation();
    const { flash } = usePage().props;
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [depositTab, setDepositTab] = useState('hyperpay'); // hyperpay, bank
    const [copiedIban, setCopiedIban] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const triggerCelebration = () => {
        confetti({
            particleCount: 75,
            spread: 65,
            origin: { y: 0.5 },
            zIndex: 10001,
        });
        setTimeout(() => {
            confetti({
                particleCount: 45,
                angle: 60,
                spread: 55,
                origin: { x: 0.1, y: 0.5 },
                zIndex: 10001,
            });
            confetti({
                particleCount: 45,
                angle: 120,
                spread: 55,
                origin: { x: 0.9, y: 0.5 },
                zIndex: 10001,
            });
        }, 200);
    };

    // List of electronic payment methods filtered by Admin configuration
    const availableBrandsList = [
        {
            id: 'MADA',
            name: t('investor.wallet.hp_brand_mada'),
            sub: t('investor.wallet.hp_brand_mada_sub'),
            enabled: enabledPaymentMethods?.MADA !== false,
            logo: <MadaLogo />,
        },
        {
            id: 'VISA',
            name: t('investor.wallet.hp_brand_visa_master'),
            sub: t('investor.wallet.hp_brand_visa_master_sub'),
            enabled: enabledPaymentMethods?.VISA !== false,
            logo: <VisaMastercardLogo />,
        },
        {
            id: 'APPLEPAY',
            name: t('investor.wallet.hp_brand_apple'),
            sub: t('investor.wallet.hp_brand_apple_sub'),
            enabled: enabledPaymentMethods?.APPLEPAY !== false,
            logo: <ApplePayLogo />,
        },
    ].filter((b) => b.enabled);

    const defaultBrand = availableBrandsList[0]?.id || 'MADA';

    useEffect(() => {
        if (flash?.success) {
            setSuccessMessage(flash.success);
            setSuccessModalOpen(true);
            triggerCelebration();
        }
    }, [flash?.success]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('deposit') === 'open' || urlParams.get('deposit') === '1') {
                setDepositModalOpen(true);
            }
        }
    }, []);

    // Tabs for tables: 'ledger' | 'deposits'
    const [activeTableTab, setActiveTableTab] = useState('ledger');

    // Filter states
    const [ledgerSearch, setLedgerSearch] = useState('');
    const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');
    const [depositSearch, setDepositSearch] = useState('');
    const [depositStatusFilter, setDepositStatusFilter] = useState('all');

    // Clean reference types & descriptions formatting
    const formatReferenceType = (type) => {
        if (!type) return '';
        const isAr = locale === 'ar';
        if (type.includes('HyperpayTransaction')) return isAr ? 'دفع إلكتروني' : 'Online Payment';
        if (type.includes('BankDeposit')) return isAr ? 'إيداع بنكي' : 'Bank Deposit';
        if (type.includes('TaskFunding') || type.includes('InvestmentTask') || type.includes('Task')) return isAr ? 'تمويل مهمة' : 'Task Funding';
        if (type.includes('Commission') || type.includes('Profit')) return isAr ? 'أرباح عمولة' : 'Profit Commission';
        if (type.includes('Withdrawal')) return isAr ? 'سحب بنكي' : 'Withdrawal';
        const shortName = type.split('\\').pop();
        return shortName.replace(/([A-Z])/g, ' $1').trim();
    };

    const formatLedgerDescription = (desc) => {
        if (!desc) return '';
        return desc
            .replace(/HyperPay\s*\(\#[A-Za-z0-9\.\-]+\)/g, 'بوابة الدفع الإلكتروني')
            .replace(/App\\Models\\[A-Za-z0-9_]+/g, '');
    };

    // Filtered Ledger list
    const filteredLedgerTransactions = (transactions.data || []).filter((tx) => {
        if (ledgerTypeFilter !== 'all') {
            if (ledgerTypeFilter === 'credit' && tx.transaction_type !== 'credit') return false;
            if (ledgerTypeFilter === 'debit' && tx.transaction_type !== 'debit') return false;
        }
        if (ledgerSearch.trim()) {
            const q = ledgerSearch.toLowerCase().trim();
            const desc = (tx.description || '').toLowerCase();
            const ref = String(tx.reference_id || '');
            const refType = formatReferenceType(tx.reference_type).toLowerCase();
            const amount = String(tx.amount || '');
            if (!desc.includes(q) && !ref.includes(q) && !refType.includes(q) && !amount.includes(q)) {
                return false;
            }
        }
        return true;
    });

    // Filtered Bank Deposits list
    const filteredBankDeposits = (bankDeposits.data || []).filter((dep) => {
        if (depositStatusFilter !== 'all' && dep.status !== depositStatusFilter) {
            return false;
        }
        if (depositSearch.trim()) {
            const q = depositSearch.toLowerCase().trim();
            const depNum = (dep.deposit_number || '').toLowerCase();
            const bankName = (dep.bank_name || '').toLowerCase();
            const senderName = (dep.sender_name || '').toLowerCase();
            const amount = String(dep.amount || '');
            if (!depNum.includes(q) && !bankName.includes(q) && !senderName.includes(q) && !amount.includes(q)) {
                return false;
            }
        }
        return true;
    });

    // HyperPay form
    const [hpAmount, setHpAmount] = useState('1000');
    const [hpBrand, setHpBrand] = useState(defaultBrand);
    const [hpLoading, setHpLoading] = useState(false);

    useEffect(() => {
        if (availableBrandsList.length > 0 && !availableBrandsList.some((b) => b.id === hpBrand)) {
            setHpBrand(availableBrandsList[0].id);
        }
    }, [enabledPaymentMethods]);

    // Bank Deposit Form
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        bank_name: t('investor.wallet.default_bank_name'),
        sender_name: '',
        sender_account: '',
        reference_number: '',
        transfer_date: new Date().toISOString().split('T')[0],
        receipt_file: null,
    });

    const handleCopyIban = () => {
        navigator.clipboard.writeText(platformBankInfo.bank_iban);
        setCopiedIban(true);
        setTimeout(() => setCopiedIban(false), 2000);
    };

    const handleHyperPaySubmit = (e) => {
        e.preventDefault();
        setHpLoading(true);
        fetch(route('investor.wallet.hyperpay.checkout'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
            body: JSON.stringify({
                amount: hpAmount,
                payment_brand: hpBrand,
            }),
        })
        .then((res) => res.json())
        .then((data) => {
            setHpLoading(false);
            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            } else if (data.checkout_id) {
                window.location.href = route('investor.wallet.hyperpay.checkout.show', { checkoutId: data.checkout_id });
            } else if (data.error) {
                alert(data.error);
            }
        })
        .catch(() => {
            setHpLoading(false);
            alert('حدث خطأ أثناء بدء عملية الدفع، يرجى المحاولة مرة أخرى.');
        });
    };

    const handleBankSubmit = (e) => {
        e.preventDefault();
        post(route('investor.wallet.deposit.bank'), {
            onSuccess: () => {
                setDepositModalOpen(false);
                reset();
            },
        });
    };

    const handleViewReceipt = (deposit) => {
        const url = deposit.receipt_url || (deposit.receipt_file_path ? `/storage/${deposit.receipt_file_path}` : null);
        const isPdf = deposit.is_pdf ?? (url ? url.toLowerCase().includes('.pdf') : false);
        setSelectedReceipt({
            ...deposit,
            title: t('investor.wallet.receipt_deposit_title', { name: deposit.sender_name || 'Investor' }),
            receipt_url: url,
            is_pdf: isPdf,
        });
        setReceiptModalOpen(true);
    };

    return (
        <AuthenticatedLayout title={t('investor.wallet.inv_title')}>
            <Head title={t('investor.wallet.inv_page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('investor.wallet.inv_title')}
                subtitle={t('investor.wallet.inv_subtitle')}
                icon={Wallet}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: t('investor.wallet.inv_title') }]}
                badge={{
                    text: t('investor.wallet.inv_direct_funding_badge'),
                    color: 'brand',
                }}
                actions={[
                    {
                        label: t('investor.wallet.btn_deposit_capital'),
                        icon: PlusCircle,
                        onClick: () => setDepositModalOpen(true),
                        variant: 'primary',
                    },
                    {
                        label: `${t('investor.nav.commission_wallet')} (${Number(commissionWallet?.balance || 0).toLocaleString('en-US')} ${t('common.sar')})`,
                        icon: CreditCard,
                        url: route('investor.wallet.commission'),
                    },
                ]}
            />

            {/* Flash Alerts Banner */}
            {flash?.success && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-3 shadow-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm font-bold">{flash.success}</span>
                </div>
            )}
            {flash?.error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-3 shadow-sm">
                    <span className="text-sm font-bold">{flash.error}</span>
                </div>
            )}

            {/* 4 Financial Stat Cards for Investment Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Available Balance */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_inv_available')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.available_balance || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.dashboard.total_balance')} {Number(stats.current_balance || 0).toLocaleString('en-US')} {t('common.sar')}
                    </p>
                </div>

                {/* Total Inflow (Deposits) */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_inv_total_inflow')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        +{Number(stats.total_inflow || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.wallet.kpi_inv_inflow_sub', { count: stats.approved_deposits_count || 0 })}
                    </p>
                </div>

                {/* Total Deployed in Tasks */}
                <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_inv_deployed')}</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <ArrowUpRight className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        -{Number(stats.total_deployed || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-orange-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.wallet.kpi_inv_deployed_sub')}
                    </p>
                </div>

                {/* Pending Deposits */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_inv_pending_deposits')}</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.pending_deposits_amount || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-amber-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.wallet.kpi_inv_pending_sub', { count: stats.pending_deposits_count || 0 })}
                    </p>
                </div>
            </div>

            {/* Unified Table Section with Modern Tabs & Professional Filters */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-8">
                {/* Tabs Header & Quick Stats */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setActiveTableTab('ledger')}
                            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTableTab === 'ledger'
                                    ? 'bg-[#6320EE] text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span>{t('investor.wallet.tab_ledger')}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                activeTableTab === 'ledger'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                                {transactions.data?.length || 0}
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTableTab('deposits')}
                            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                activeTableTab === 'deposits'
                                    ? 'bg-[#6320EE] text-white'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>{t('investor.wallet.tab_bank_deposits')}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                                activeTableTab === 'deposits'
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}>
                                {bankDeposits.data?.length || 0}
                            </span>
                        </button>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                        {t('investor.wallet.wallet_number_label', { number: wallet.wallet_number || `INV-W-${wallet.id}` })}
                    </div>
                </div>

                {/* Filter Toolbar depending on Active Tab */}
                {activeTableTab === 'ledger' ? (
                    <div className="mb-5 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            {/* Search Field */}
                            <div className="sm:col-span-8 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3 pointer-events-none" />
                                <input
                                    type="text"
                                    value={ledgerSearch}
                                    onChange={(e) => setLedgerSearch(e.target.value)}
                                    placeholder={t('investor.wallet.filter_search_ledger_ph')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl ps-10 pe-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                                />
                                {ledgerSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setLedgerSearch('')}
                                        className="absolute end-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Type Filter */}
                            <div className="sm:col-span-3">
                                <Select2
                                    value={ledgerTypeFilter}
                                    onChange={(val) => setLedgerTypeFilter(val)}
                                    options={[
                                        { value: 'all', label: t('investor.wallet.filter_type_all') },
                                        { value: 'credit', label: t('investor.wallet.filter_type_credit') },
                                        { value: 'debit', label: t('investor.wallet.filter_type_debit') },
                                    ]}
                                    placeholder={t('investor.wallet.filter_type_all')}
                                    searchPlaceholder={t('common.search', 'بحث...')}
                                />
                            </div>

                            {/* Reset Button */}
                            <div className="sm:col-span-1 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLedgerSearch('');
                                        setLedgerTypeFilter('all');
                                    }}
                                    disabled={!ledgerSearch && ledgerTypeFilter === 'all'}
                                    title={t('investor.wallet.clear_filters')}
                                    className="w-full py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {(ledgerSearch || ledgerTypeFilter !== 'all') && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                                <span>{t('investor.wallet.filter_results_count', { count: filteredLedgerTransactions.length })}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLedgerSearch('');
                                        setLedgerTypeFilter('all');
                                    }}
                                    className="text-violet-500 hover:underline font-bold"
                                >
                                    {t('investor.wallet.clear_filters')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mb-5 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            {/* Search Field */}
                            <div className="sm:col-span-8 relative">
                                <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-3 pointer-events-none" />
                                <input
                                    type="text"
                                    value={depositSearch}
                                    onChange={(e) => setDepositSearch(e.target.value)}
                                    placeholder={t('investor.wallet.filter_search_deposits_ph')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl ps-10 pe-9 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                                />
                                {depositSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setDepositSearch('')}
                                        className="absolute end-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="sm:col-span-3">
                                <Select2
                                    value={depositStatusFilter}
                                    onChange={(val) => setDepositStatusFilter(val)}
                                    options={[
                                        { value: 'all', label: t('investor.wallet.filter_status_all') },
                                        { value: 'pending', label: t('investor.wallet.filter_status_pending') },
                                        { value: 'approved', label: t('investor.wallet.filter_status_approved') },
                                        { value: 'rejected', label: t('investor.wallet.filter_status_rejected') },
                                    ]}
                                    placeholder={t('investor.wallet.filter_status_all')}
                                    searchPlaceholder={t('common.search', 'بحث...')}
                                />
                            </div>

                            {/* Reset Button */}
                            <div className="sm:col-span-1 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDepositSearch('');
                                        setDepositStatusFilter('all');
                                    }}
                                    disabled={!depositSearch && depositStatusFilter === 'all'}
                                    title={t('investor.wallet.clear_filters')}
                                    className="w-full py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {(depositSearch || depositStatusFilter !== 'all') && (
                            <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                                <span>{t('investor.wallet.filter_results_count', { count: filteredBankDeposits.length })}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDepositSearch('');
                                        setDepositStatusFilter('all');
                                    }}
                                    className="text-violet-500 hover:underline font-bold"
                                >
                                    {t('investor.wallet.clear_filters')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab 1: Ledger Table */}
                {activeTableTab === 'ledger' && (
                    filteredLedgerTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-3">{t('investor.wallet.th_desc_and_type')}</th>
                                        <th className="p-3">{t('investor.wallet.amount_th')}</th>
                                        <th className="p-3">{t('investor.wallet.balance_after_th')}</th>
                                        <th className="p-3">{t('investor.wallet.th_status_and_type')}</th>
                                        <th className="p-3">{t('investor.wallet.datetime_th')}</th>
                                        <th className="p-3 text-center">{t('investor.wallet.th_attachments')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {filteredLedgerTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="p-3">
                                                <span className="font-semibold text-slate-900 dark:text-white block">
                                                    {formatLedgerDescription(tx.description)}
                                                </span>
                                                {tx.reference_type && (
                                                    <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-violet-500 dark:text-violet-400 font-bold bg-violet-500/10 px-1.5 py-0.5 rounded">
                                                            {formatReferenceType(tx.reference_type)}
                                                        </span>
                                                        <span className="text-slate-400">#{tx.reference_id}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 font-mono font-bold">
                                                <span className={parseFloat(tx.amount) > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'}>
                                                    {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toLocaleString('en-US')}` : parseFloat(tx.amount).toLocaleString('en-US')} {t('common.sar')}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                                {parseFloat(tx.balance_after).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                                    {tx.transaction_type === 'credit' ? t('investor.wallet.type_inv_credit') : t('investor.wallet.type_inv_debit')}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-500 font-mono">
                                                {new Date(tx.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                            </td>
                                            <td className="p-3 text-center">
                                                {tx.reference?.receipt_file_path || tx.metadata?.receipt_path ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewReceipt(tx.reference || { receipt_file_path: tx.metadata?.receipt_path, description: tx.description })}
                                                        className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 transition-colors cursor-pointer"
                                                        title={t('investor.wallet.view_receipt_title')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                            <p>{ledgerSearch || ledgerTypeFilter !== 'all' ? t('investor.wallet.no_filtered_results') : t('investor.wallet.no_inv_transactions_yet')}</p>
                        </div>
                    )
                )}

                {/* Tab 2: Bank Deposits Table */}
                {activeTableTab === 'deposits' && (
                    filteredBankDeposits.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-3">{t('investor.wallet.deposit_number_th')}</th>
                                        <th className="p-3">{t('investor.wallet.amount_th')}</th>
                                        <th className="p-3">{t('investor.wallet.bank_th')}</th>
                                        <th className="p-3">{t('investor.wallet.sender_name_th')}</th>
                                        <th className="p-3">{t('investor.wallet.transfer_date_th')}</th>
                                        <th className="p-3">{t('investor.wallet.status_th')}</th>
                                        <th className="p-3 text-center">{t('investor.wallet.th_receipt_col')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                    {filteredBankDeposits.map((dep) => (
                                        <tr key={dep.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                            <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{dep.deposit_number}</td>
                                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{parseFloat(dep.amount).toLocaleString('en-US')} {t('common.sar')}</td>
                                            <td className="p-3 text-slate-700 dark:text-slate-300">{dep.bank_name}</td>
                                            <td className="p-3 text-slate-700 dark:text-slate-300">{dep.sender_name}</td>
                                            <td className="p-3 text-slate-500 font-mono">{dep.transfer_date}</td>
                                            <td className="p-3"><Badge status={dep.status} /></td>
                                            <td className="p-3 text-center">
                                                {dep.receipt_file_path ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewReceipt(dep)}
                                                        className="px-3 py-1 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                        title={t('investor.wallet.view_receipt_title')}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>{t('investor.wallet.btn_view_receipt_text')}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">{t('investor.wallet.no_receipt_attached')}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                            <p>{depositSearch || depositStatusFilter !== 'all' ? t('investor.wallet.no_filtered_results') : t('investor.wallet.no_deposits_yet')}</p>
                        </div>
                    )
                )}
            </div>

            {/* Deposit Modal */}
            <Modal
                isOpen={depositModalOpen}
                onClose={() => setDepositModalOpen(false)}
                title={t('investor.wallet.deposit_modal_title')}
                maxWidth="lg"
            >
                {/* Method Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl mb-5 border border-slate-200 dark:border-slate-800">
                    <button
                        type="button"
                        onClick={() => setDepositTab('hyperpay')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            depositTab === 'hyperpay'
                                ? 'bg-[#6320EE] text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>{t('investor.wallet.hyperpay_tab')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDepositTab('bank')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            depositTab === 'bank'
                                ? 'bg-[#6320EE] text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Building className="w-4 h-4" />
                        <span>{t('investor.wallet.bank_tab')}</span>
                    </button>
                </div>

                {depositTab === 'hyperpay' ? (
                    availableBrandsList.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                            <h4 className="text-sm font-bold text-amber-400">
                                {t('investor.wallet.no_payment_methods_available')}
                            </h4>
                            <button
                                type="button"
                                onClick={() => setDepositTab('bank')}
                                className="px-4 py-2 bg-[#6320EE] text-white rounded-xl text-xs font-bold hover:bg-[#5217D4] transition-all cursor-pointer"
                            >
                                {t('investor.wallet.deposit_tab_bank')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleHyperPaySubmit} className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        {t('investor.wallet.amount_sar_label')} *
                                    </label>
                                    <span className="text-[10px] text-violet-500 font-bold bg-violet-500/10 px-2 py-0.5 rounded-full">
                                        {t('investor.wallet.instant_credit_badge')}
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="50"
                                        step="1"
                                        value={hpAmount}
                                        onChange={(e) => setHpAmount(e.target.value)}
                                        placeholder="1000"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                    {t('investor.wallet.min_deposit_limit_hint')}
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    {t('investor.wallet.choose_payment_method')}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                    {availableBrandsList.map((brandObj) => {
                                        const isSelected = hpBrand === brandObj.id;
                                        return (
                                            <div
                                                key={brandObj.id}
                                                onClick={() => setHpBrand(brandObj.id)}
                                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between relative select-none ${
                                                    isSelected
                                                        ? 'border-[#6320EE] bg-violet-500/10 dark:bg-violet-600/15 ring-2 ring-violet-500/30'
                                                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>{brandObj.logo}</div>
                                                    <div
                                                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                                            isSelected
                                                                ? 'border-[#6320EE] bg-[#6320EE] text-white'
                                                                : 'border-slate-300 dark:border-slate-700'
                                                        }`}
                                                    >
                                                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="block text-xs font-bold text-slate-900 dark:text-white">
                                                        {brandObj.name}
                                                    </span>
                                                    <span className="block text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                                        {brandObj.sub}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                                <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{t('investor.wallet.payment_gateway_note')}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={hpLoading}
                                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white border border-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {hpLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <CreditCard className="w-4 h-4" />
                                        <span>{t('investor.wallet.btn_proceed_payment')}</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )
                ) : (
                    <form onSubmit={handleBankSubmit} className="space-y-4">
                        {/* Platform Bank Details Info Card */}
                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 mb-3">
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{t('investor.wallet.official_bank')}</span>
                                <strong className="text-slate-800 dark:text-slate-200">{platformBankInfo.bank_name}</strong>
                            </div>
                            <div className="flex justify-between text-slate-500 dark:text-slate-400">
                                <span>{t('investor.wallet.account_holder')}</span>
                                <strong className="text-slate-800 dark:text-slate-200">{platformBankInfo.account_holder}</strong>
                            </div>
                            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="font-mono text-orange-500 font-bold">{platformBankInfo.bank_iban}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyIban}
                                    className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{copiedIban ? t('investor.wallet.copied') : t('investor.wallet.copy')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('investor.wallet.transferred_amount_label')} *</label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="1000"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                    required
                                />
                                {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('investor.wallet.sender_bank_label')} *</label>
                                <input
                                    type="text"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('investor.wallet.account_holder_label')} *</label>
                                <input
                                    type="text"
                                    value={data.sender_name}
                                    onChange={(e) => setData('sender_name', e.target.value)}
                                    placeholder={t('investor.wallet.account_holder_placeholder')}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('investor.wallet.transfer_date_label')} *</label>
                                <input
                                    type="date"
                                    value={data.transfer_date}
                                    onChange={(e) => setData('transfer_date', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{t('investor.wallet.receipt_attachment_label')} *</label>
                            <input
                                type="file"
                                onChange={(e) => setData('receipt_file', e.target.files[0])}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 file:mr-2 rtl:file:mr-0 rtl:file:ml-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-violet-600 file:text-white cursor-pointer"
                                required
                            />
                            {errors.receipt_file && <p className="text-[10px] text-rose-500 mt-1">{errors.receipt_file}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white border border-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>{t('investor.wallet.submit_deposit_btn')}</span>
                            )}
                        </button>
                    </form>
                )}
            </Modal>

            {/* Interactive WhatsApp-style Receipt Viewer Modal */}
            <ReceiptViewerModal
                isOpen={receiptModalOpen}
                onClose={() => {
                    setReceiptModalOpen(false);
                    setSelectedReceipt(null);
                }}
                deposit={selectedReceipt}
            />

            {/* Payment & Operation Success Modal (Centered with Confetti Synchronization) */}
            <Modal
                isOpen={successModalOpen}
                onClose={() => setSuccessModalOpen(false)}
                title={t('investor.wallet.payment_success_modal_title')}
                maxWidth="md"
            >
                <div className="text-center py-2 px-1 space-y-4">
                    {/* Animated Emerald Seal */}
                    <div className="relative inline-flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-500 animate-pulse">
                            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {t('investor.wallet.payment_success_badge')}
                        </span>
                        <h4 className="text-lg font-black text-slate-900 dark:text-white pt-1">
                            {t('investor.wallet.payment_success_modal_title')}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                            {successMessage}
                        </p>
                    </div>

                    {/* Quick Financial Summary */}
                    <div className="bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-start">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                            <span>{t('investor.wallet.kpi_inv_available')}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                                {Number(stats.available_balance || 0).toLocaleString('en-US')} {t('common.sar')}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-2 text-slate-600 dark:text-slate-400">
                            <span>{t('investor.wallet.status_th')}</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                                {t('investor.wallet.instant_credit_badge')}
                            </span>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => setSuccessModalOpen(false)}
                            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#6320EE] hover:bg-[#5217D4] text-white border border-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>{t('investor.wallet.payment_success_btn')}</span>
                        </button>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
