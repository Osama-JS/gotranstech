import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Modal from '@/Components/Modal';
import Badge from '@/Components/Badge';
import ReceiptViewerModal from '@/Components/ReceiptViewerModal';
import Select2 from '@/Components/Select2';
import { useTranslation } from '@/Utils/i18n';
import {
    CreditCard,
    Wallet,
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    PlusCircle,
    FileText,
    TrendingUp,
    Building2,
    DollarSign,
    ArrowDownToLine,
    ShieldCheck,
    Eye,
    Search,
    RotateCcw,
    X,
    Filter,
    Zap,
    Landmark,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Lock,
    Edit3,
    Upload,
} from 'lucide-react';

export default function CommissionWallet({
    wallet,
    investmentWallet,
    stats = {},
    transactions,
    investorProfile,
    pendingBankChangeRequest = null,
    banks = [],
    payouts = [],
}) {
    const { t, locale } = useTranslation();
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [initialBankModalOpen, setInitialBankModalOpen] = useState(false);
    const [changeBankModalOpen, setChangeBankModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' or 'payouts'

    // Formatted bank details on file
    const hasApprovedBank = Boolean(investorProfile?.bank_id && (investorProfile?.bank_iban || investorProfile?.iban));
    const approvedBank = investorProfile?.bank || banks.find(b => String(b.id) === String(investorProfile?.bank_id));
    const approvedIban = investorProfile?.bank_iban || investorProfile?.iban || '';
    const approvedHolder = investorProfile?.account_holder_name || investorProfile?.account_holder || '';

    // Filters for Commission Ledger
    const [commSearch, setCommSearch] = useState('');
    const [commTypeFilter, setCommTypeFilter] = useState('all');

    const formatReferenceType = (type) => {
        if (!type) return '';
        const isAr = locale === 'ar';
        if (type.includes('TaskFunding') || type.includes('InvestmentTask') || type.includes('Task')) return isAr ? 'مهمة لوجستية' : 'Logistics Task';
        if (type.includes('Commission') || type.includes('Profit')) return isAr ? 'أرباح عمولة' : 'Profit Commission';
        if (type.includes('Withdrawal')) return isAr ? 'سحب أرباح' : 'Bank Withdrawal';
        if (type.includes('HyperpayTransaction')) return isAr ? 'دفع إلكتروني' : 'Online Payment';
        if (type.includes('BankDeposit')) return isAr ? 'إيداع بنكي' : 'Bank Deposit';
        const shortName = type.split('\\').pop();
        return shortName.replace(/([A-Z])/g, ' $1').trim();
    };

    const formatLedgerDescription = (desc) => {
        if (!desc) return '';
        return desc
            .replace(/HyperPay\s*\(\#[A-Za-z0-9\.\-]+\)/g, 'بوابة الدفع الإلكتروني')
            .replace(/App\\Models\\[A-Za-z0-9_]+/g, '');
    };

    const filteredTransactions = (transactions.data || []).filter((tx) => {
        const isCredit = parseFloat(tx.amount) > 0;
        if (commTypeFilter === 'credit' && !isCredit) return false;
        if (commTypeFilter === 'debit' && isCredit) return false;

        if (commSearch.trim()) {
            const q = commSearch.toLowerCase().trim();
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

    const formatIban = (iban) => {
        if (!iban) return '—';
        return iban.replace(/(.{4})/g, '$1 ').trim();
    };

    // 1. Withdrawal Form (Amount only - strictly uses approved bank on file)
    const { 
        data: withdrawData, 
        setData: setWithdrawData, 
        post: postWithdraw, 
        processing: withdrawing, 
        errors: withdrawErrors, 
        reset: resetWithdraw 
    } = useForm({
        amount: '',
    });

    const handleWithdrawSubmit = (e) => {
        e.preventDefault();
        postWithdraw(route('investor.wallet.commission.withdraw'), {
            onSuccess: () => {
                setWithdrawModalOpen(false);
                resetWithdraw('amount');
            },
        });
    };

    // 2. Initial Bank Registration Form (For users who have not registered a bank yet)
    const {
        data: initialData,
        setData: setInitialData,
        post: postInitial,
        processing: registeringInitial,
        errors: initialErrors,
        reset: resetInitial
    } = useForm({
        bank_id: banks.length > 0 ? String(banks[0].id) : '',
        iban: '',
        account_holder: '',
        city: 'Riyadh',
        country: 'SA',
    });

    const handleInitialSubmit = (e) => {
        e.preventDefault();
        postInitial(route('bank-account.initial'), {
            onSuccess: () => {
                setInitialBankModalOpen(false);
                resetInitial();
            }
        });
    };

    // 3. Bank Account Change Request Form (Requires Platform Admin Approval)
    const {
        data: changeData,
        setData: setChangeData,
        post: postChange,
        processing: submittingChange,
        errors: changeErrors,
        reset: resetChange
    } = useForm({
        new_bank_id: banks.length > 0 ? String(banks[0].id) : '',
        new_iban: '',
        new_account_holder: '',
        new_bank_city: 'Riyadh',
        new_bank_country: 'SA',
        reason: '',
        certificate_file: null,
    });

    const handleChangeSubmit = (e) => {
        e.preventDefault();
        postChange(route('bank-account.change-request'), {
            onSuccess: () => {
                setChangeBankModalOpen(false);
                resetChange();
            }
        });
    };

    const handleViewReceipt = (tx) => {
        const path = tx.reference?.receipt_file_path || tx.metadata?.receipt_path;
        setSelectedReceipt({
            ...tx,
            title: tx.description || t('investor.wallet.receipt_withdrawal_title'),
            receipt_url: path ? `/storage/${path}` : null,
            amount: Math.abs(parseFloat(tx.amount)),
        });
        setReceiptModalOpen(true);
    };

    return (
        <AuthenticatedLayout title={t('investor.wallet.comm_title')}>
            <Head title={t('investor.wallet.comm_page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('investor.wallet.comm_title')}
                subtitle={t('investor.wallet.comm_subtitle')}
                icon={CreditCard}
                iconColor="text-orange-400"
                iconBg="bg-orange-500/15 border-orange-500/30"
                breadcrumbs={[{ label: t('investor.wallet.comm_title') }]}
                badge={{
                    text: t('investor.wallet.comm_badge', { rate: stats.commission_share_rate || 70 }),
                    color: 'orange',
                }}
                actions={[
                    {
                        label: 'طلب سحب أرباح (تحويل فوري)',
                        icon: Zap,
                        variant: 'primary',
                        onClick: () => setWithdrawModalOpen(true),
                        disabled: (wallet.available_balance || 0) < 50,
                    },
                ]}
            />

            {/* Bank Account Verification & Status Banner */}
            {!hasApprovedBank ? (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                لم يتم تسجيل وتأكيد حسابك البنكي المعتمد حتى الآن
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                يتطلب النظام تسجيل حساب بنكي معتمد مرة واحدة فقط ليتم استخدامه حصرياً لجميع عمليات سحب الأرباح الفورية.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setInitialBankModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm shadow-amber-500/20"
                    >
                        <Landmark className="w-4 h-4" />
                        <span>تسجيل الحساب البنكي الآن</span>
                    </button>
                </div>
            ) : pendingBankChangeRequest ? (
                <div className="mb-6 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                    لديك طلب تغيير حساب بنكي قيد المراجعة والاعتماد
                                </h4>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                                    قيد التدقيق
                                </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                البنك المطلوب الجديد: <strong className="text-slate-700 dark:text-slate-200">{pendingBankChangeRequest.new_bank?.name || pendingBankChangeRequest.new_bank_name}</strong> ({formatIban(pendingBankChangeRequest.new_iban)}). ستستمر عمليات السحب بالتحويل لحسابك الحالي حتى اعتماد الطلب.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                    الحساب البنكي المعتمد للصرف:
                                </span>
                                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    {approvedBank?.name || investorProfile?.bank_name}
                                </span>
                                {approvedBank?.code && (
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                        {approvedBank.code}
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tracking-wider flex items-center gap-2">
                                <span>{formatIban(approvedIban)}</span>
                                <span className="text-slate-300 dark:text-slate-700">|</span>
                                <span className="font-sans text-[10px]">{approvedHolder}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setChangeBankModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>طلب تغيير الحساب البنكي</span>
                    </button>
                </div>
            )}

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('investor.wallet.stat_comm_balance')}</span>
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                            <Wallet className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {stats.current_balance ? stats.current_balance.toFixed(2) : '0.00'} <span className="text-xs font-normal text-slate-500">{t('common.sar')}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">{t('investor.wallet.available_for_withdraw')}</span>
                        <span className="font-bold text-emerald-500">{stats.available_balance ? stats.available_balance.toFixed(2) : '0.00'} {t('common.sar')}</span>
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('investor.wallet.stat_total_profits_earned')}</span>
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-500 font-mono">
                        +{stats.total_earned ? stats.total_earned.toFixed(2) : '0.00'} <span className="text-xs font-normal text-slate-500">{t('common.sar')}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                        {t('investor.wallet.from_tasks_completed', { count: stats.tasks_rewarded_count || 0 })}
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('investor.wallet.stat_total_withdrawn')}</span>
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <ArrowDownToLine className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                        {stats.total_withdrawn ? stats.total_withdrawn.toFixed(2) : '0.00'} <span className="text-xs font-normal text-slate-500">{t('common.sar')}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                        {t('investor.wallet.transferred_to_bank')}
                    </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t('investor.wallet.stat_profit_share_rate')}</span>
                        <div className="p-2 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-violet-500 font-mono">
                        {stats.commission_share_rate || 70}%
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                        {t('investor.wallet.avg_task_profit', { amount: stats.avg_profit_per_task || '0.00', currency: t('common.sar') })}
                    </div>
                </div>
            </div>

            {/* Tab Navigation between Ledger and Payouts */}
            <div className="flex items-center gap-2 mb-4 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-md">
                <button
                    type="button"
                    onClick={() => setActiveTab('ledger')}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'ledger'
                            ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md shadow-orange-500/10'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <FileText className="w-3.5 h-3.5" />
                    <span>سجل أرباح العمولات (Ledger)</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('payouts')}
                    className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        activeTab === 'payouts'
                            ? 'bg-white dark:bg-slate-800 text-orange-500 shadow-md shadow-orange-500/10'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                    <Zap className="w-3.5 h-3.5" />
                    <span>طلبات التحويل الفوري (Payouts)</span>
                    {payouts.filter(p => p.status === 'pending_approval' || p.status === 'processing').length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    )}
                </button>
            </div>

            {/* TAB 1: COMMISSION LEDGER */}
            {activeTab === 'ledger' && (
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                                <FileText className="w-4 h-4 text-orange-500" />
                                <span>{t('investor.wallet.comm_ledger_title')}</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {t('investor.wallet.comm_ledger_subtitle')}
                            </p>
                        </div>
                    </div>

                    {/* Filters Toolbar */}
                    <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                            <div className="sm:col-span-8 relative">
                                <Search className="w-4 h-4 absolute start-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={commSearch}
                                    onChange={(e) => setCommSearch(e.target.value)}
                                    placeholder={t('investor.wallet.filter_search_placeholder')}
                                    className="w-full ps-9 pe-8 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                                />
                                {commSearch && (
                                    <button
                                        type="button"
                                        onClick={() => setCommSearch('')}
                                        className="absolute end-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>

                            <div className="sm:col-span-3">
                                <Select2
                                    value={commTypeFilter}
                                    onChange={(val) => setCommTypeFilter(val)}
                                    options={[
                                        { value: 'all', label: t('investor.wallet.filter_type_all') },
                                        { value: 'credit', label: t('investor.wallet.type_comm_credit') },
                                        { value: 'debit', label: t('investor.wallet.type_comm_debit') },
                                    ]}
                                    placeholder={t('investor.wallet.filter_type_all')}
                                    searchPlaceholder={t('common.search', 'بحث...')}
                                />
                            </div>

                            <div className="sm:col-span-1 flex items-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setCommSearch('');
                                        setCommTypeFilter('all');
                                    }}
                                    disabled={!commSearch && commTypeFilter === 'all'}
                                    title={t('investor.wallet.clear_filters')}
                                    className="w-full py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition-colors flex items-center justify-center cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {filteredTransactions.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-3">{t('investor.wallet.table_desc')}</th>
                                        <th className="p-3">{t('investor.wallet.table_amount')}</th>
                                        <th className="p-3">{t('investor.wallet.table_balance_after')}</th>
                                        <th className="p-3">{t('investor.wallet.table_type')}</th>
                                        <th className="p-3">{t('investor.wallet.table_date')}</th>
                                        <th className="p-3 text-center">{t('investor.wallet.table_receipt')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="p-3">
                                                <div className="font-semibold text-slate-900 dark:text-white">
                                                    {formatLedgerDescription(tx.description)}
                                                </div>
                                                {tx.reference_type && (
                                                    <span className="text-[10px] text-slate-400 font-mono inline-flex items-center gap-1.5 mt-0.5">
                                                        <span className="text-orange-500 font-bold bg-orange-500/10 px-1.5 py-0.5 rounded">
                                                            {formatReferenceType(tx.reference_type)}
                                                        </span>
                                                        <span className="text-slate-400">#{tx.reference_id}</span>
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 font-mono font-bold">
                                                <span className={parseFloat(tx.amount) > 0 ? 'text-orange-500' : 'text-slate-700 dark:text-slate-300'}>
                                                    {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toFixed(2)}` : parseFloat(tx.amount).toFixed(2)} {t('common.sar')}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                                {parseFloat(tx.balance_after).toFixed(2)} {t('common.sar')}
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                                    parseFloat(tx.amount) > 0
                                                        ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20'
                                                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                                                }`}>
                                                    {parseFloat(tx.amount) > 0 ? t('investor.wallet.type_comm_credit') : t('investor.wallet.type_comm_debit')}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-500 font-mono">
                                                {new Date(tx.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                            </td>
                                            <td className="p-3 text-center">
                                                {tx.reference?.receipt_file_path || tx.metadata?.receipt_path ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewReceipt(tx)}
                                                        className="p-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 transition-colors cursor-pointer"
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
                            <p>{commSearch || commTypeFilter !== 'all' ? t('investor.wallet.no_filtered_results') : t('investor.wallet.no_comm_transactions_yet')}</p>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: PAYOUT REQUESTS & LIVE STATUS */}
            {activeTab === 'payouts' && (
                <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                                <Zap className="w-4 h-4 text-orange-500" />
                                <span>سجل طلبات التحويل البنكي الفوري (سريع IPS)</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                متابعة حالة التحويل المباشر من البنك لحسابك المعتمد برقم العملية البنكية
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setWithdrawModalOpen(true)}
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                        >
                            <Zap className="w-3.5 h-3.5" />
                            <span>طلب سحب جديد</span>
                        </button>
                    </div>

                    {payouts.length > 0 ? (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                            <table className="w-full text-start text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                    <tr>
                                        <th className="p-3">رقم المرجع والعملية</th>
                                        <th className="p-3">البنك المستلم والآيبان</th>
                                        <th className="p-3">مبلغ السحب</th>
                                        <th className="p-3">الحالة البنكية المباشرة</th>
                                        <th className="p-3">التاريخ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {payouts.map((p) => {
                                        const details = p.beneficiary_details || {};
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="p-3">
                                                    <span className="font-mono font-bold text-slate-900 dark:text-white block">{p.reference_id}</span>
                                                    {p.payout_id && (
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            رقم التحويل: #{p.payout_id}
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="p-3">
                                                    <div className="font-semibold text-slate-900 dark:text-white">
                                                        {details.bank_name || p.bank?.name || 'البنك المعتمد'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-mono tracking-wider">
                                                        {details.iban}
                                                    </div>
                                                </td>

                                                <td className="p-3 font-mono font-black text-orange-500">
                                                    {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} {p.currency || 'SAR'}
                                                </td>

                                                <td className="p-3">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                                                        p.status === 'completed'
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                                            : p.status === 'processing'
                                                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
                                                            : p.status === 'pending_approval'
                                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                                            : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                                                    }`}>
                                                        {p.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                                        {p.status === 'processing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                                                        {p.status === 'pending_approval' && <Clock className="w-3 h-3" />}
                                                        {p.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                        {p.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
                                                        <span>{p.status_badge?.label || p.status}</span>
                                                    </span>

                                                    {p.failure_reason && (
                                                        <div className="text-[10px] text-rose-500 mt-1 max-w-xs leading-relaxed">
                                                            {p.failure_reason}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="p-3 text-slate-500 font-mono">
                                                    {new Date(p.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-500 space-y-1">
                            <p>لا توجد طلبات تحويل بنكي مسجلة بعد. عند طلب سحب الأرباح سيتم إيداعها فوراً بحسابك البنكي.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Smart Withdrawal Modal (Strictly uses approved bank account on file) */}
            <Modal
                isOpen={withdrawModalOpen}
                onClose={() => setWithdrawModalOpen(false)}
                title="طلب سحب الأرباح الفوري إلى حسابك البنكي"
                maxWidth="md"
            >
                {!hasApprovedBank ? (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-2">
                            <div className="flex items-center gap-2 font-bold text-sm">
                                <AlertTriangle className="w-5 h-5 shrink-0" />
                                <span>الحساب البنكي المعتمد غير مسجل بعد</span>
                            </div>
                            <p className="leading-relaxed text-[11px]">
                                لضمان أمان أموالك وحمايتها، يتطلب النظام تسجيل الحساب البنكي مرة واحدة فقط ليكون هو الحساب المعتمد لجميع عمليات السحب الفوري. لا يمكن السحب لحسابات بنكية متغيرة عشوائياً.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setWithdrawModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setWithdrawModalOpen(false);
                                    setInitialBankModalOpen(true);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                                <Landmark className="w-4 h-4" />
                                <span>تسجيل الحساب البنكي الآن</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-600 dark:text-orange-400 flex items-center justify-between">
                            <span>رصيد الأرباح المتاح للسحب الفوري:</span>
                            <span className="font-mono font-bold text-sm">
                                {Number(wallet.available_balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {t('common.sar')}
                            </span>
                        </div>

                        {/* Approved Bank Card (Locked & Verified) */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <ShieldCheck className="w-3 h-3" />
                                    <span>الحساب البنكي المعتمد (مقفل ومحمي)</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setWithdrawModalOpen(false);
                                        setChangeBankModalOpen(true);
                                    }}
                                    className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                    <Edit3 className="w-3 h-3" />
                                    <span>طلب تغيير</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-sans">البنك المستلم:</span>
                                    <span className="font-bold text-slate-800 dark:text-white">
                                        {approvedBank?.name || investorProfile?.bank_name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] text-slate-400 block font-sans">كود التحويل الفوري:</span>
                                    <span className="font-bold text-violet-600 dark:text-violet-400">
                                        {approvedBank?.code || 'IPS-SAR'}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] text-slate-400 block font-sans">رقم الآيبان (IBAN):</span>
                                    <span className="font-bold text-slate-800 dark:text-white tracking-wider">
                                        {formatIban(approvedIban)}
                                    </span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] text-slate-400 block font-sans">المستفيد:</span>
                                    <span className="text-slate-700 dark:text-slate-300 font-sans">
                                        {approvedHolder}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Pending change request warning if any */}
                        {pendingBankChangeRequest && (
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
                                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                                <span>
                                    تنبيه: لديك طلب تغيير حساب بنكي قيد المراجعة حالياً من قبل الإدارة. سيتم تحويل المبالغ لحسابك الحالي المعتمد أعلاه حتى اعتماد الطلب الجديد.
                                </span>
                            </div>
                        )}

                        {/* Amount */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                المبلغ المطلوب سحبه (ر.س) *
                            </label>
                            <input
                                type="number"
                                min="50"
                                max={wallet.available_balance || 0}
                                step="0.01"
                                value={withdrawData.amount}
                                onChange={(e) => setWithdrawData('amount', e.target.value)}
                                placeholder="الحد الأدنى 50 ر.س"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500"
                                required
                            />
                            {withdrawErrors.amount && <p className="text-[10px] text-rose-500 mt-1">{withdrawErrors.amount}</p>}
                            {withdrawErrors.general && <p className="text-[10px] text-rose-500 mt-1">{withdrawErrors.general}</p>}
                        </div>

                        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold">
                                <Zap className="w-3.5 h-3.5 text-orange-500" />
                                <span>ميزة الصرف الفوري (نظام سريع البنكي)</span>
                            </div>
                            <p className="leading-relaxed">
                                تتم معالجة وإرسال الحوالات البنكية الفورية عبر بوابة HyperPay المعتمدة فور مصادقة الإدارة وتصل لحسابك البنكي خلال دقائق.
                            </p>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setWithdrawModalOpen(false)}
                                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={withdrawing || !withdrawData.amount}
                                className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                                {withdrawing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-3.5 h-3.5" />
                                        <span>تأكيد وإرسال طلب التحويل الفوري</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Initial Bank Account Setup Modal (First time setup only) */}
            <Modal
                isOpen={initialBankModalOpen}
                onClose={() => setInitialBankModalOpen(false)}
                title="تسجيل الحساب البنكي المعتمد (لأول مرة)"
                maxWidth="md"
            >
                <form onSubmit={handleInitialSubmit} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Lock className="w-4 h-4 text-blue-500" />
                            <span>تثبيت وقفل الحساب البنكي المعتمد</span>
                        </div>
                        <p className="leading-relaxed text-[11px]">
                            سيتم اعتماد هذا الحساب البنكي رسمياً لكافة عمليات سحب الأرباح الفورية. لن تتمكن من تغييره لاحقاً إلا بتقديم طلب تدقيق رسمي للإدارة.
                        </p>
                    </div>

                    {/* Bank Selection via Select2 */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            البنك المستلم *
                        </label>
                        <Select2
                            value={initialData.bank_id}
                            onChange={(val) => setInitialData('bank_id', val)}
                            options={banks.map(b => ({
                                value: String(b.id),
                                label: `${b.name} (${b.code})`,
                            }))}
                            placeholder="اختر بنكك المعتمد..."
                            searchPlaceholder="ابحث باسم البنك أو الكود..."
                        />
                        {initialErrors.bank_id && <p className="text-[10px] text-rose-500 mt-1">{initialErrors.bank_id}</p>}
                    </div>

                    {/* IBAN */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            رقم الآيبان البنكي (Saudi IBAN) *
                        </label>
                        <input
                            type="text"
                            maxLength={24}
                            value={initialData.iban}
                            onChange={(e) => setInitialData('iban', e.target.value.toUpperCase())}
                            placeholder="SA0000000000000000000000"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono tracking-wider focus:outline-none focus:border-blue-500 uppercase"
                            required
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">يجب أن يبدأ بـ SA ويتكون من 24 خانة وفق المعيار البنكي المعتمد.</span>
                        {initialErrors.iban && <p className="text-[10px] text-rose-500 mt-1">{initialErrors.iban}</p>}
                    </div>

                    {/* Account Holder Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            اسم صاحب الحساب البنكي (مطابق للهوية) *
                        </label>
                        <input
                            type="text"
                            value={initialData.account_holder}
                            onChange={(e) => setInitialData('account_holder', e.target.value)}
                            placeholder="الاسم الكامل كما هو مسجل في البنك"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        {initialErrors.account_holder && <p className="text-[10px] text-rose-500 mt-1">{initialErrors.account_holder}</p>}
                    </div>

                    {/* City & Country */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                مدينة الحساب البنكي
                            </label>
                            <input
                                type="text"
                                value={initialData.city}
                                onChange={(e) => setInitialData('city', e.target.value)}
                                placeholder="مثال: Riyadh أو جدة"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                رمز الدولة (ISO-2)
                            </label>
                            <input
                                type="text"
                                maxLength={2}
                                value={initialData.country}
                                onChange={(e) => setInitialData('country', e.target.value.toUpperCase())}
                                placeholder="SA"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                    {initialErrors.general && <p className="text-[10px] text-rose-500 mt-1">{initialErrors.general}</p>}

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setInitialBankModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={registeringInitial || !initialData.bank_id || !initialData.iban || !initialData.account_holder}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                            {registeringInitial ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>حفظ وتأكيد الحساب البنكي</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Bank Account Change Request Modal (Submitted to Platform Admin) */}
            <Modal
                isOpen={changeBankModalOpen}
                onClose={() => setChangeBankModalOpen(false)}
                title="طلب تغيير الحساب البنكي المعتمد"
                maxWidth="md"
            >
                <form onSubmit={handleChangeSubmit} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>مراجعة وتدقيق من قبل إدارة المنصة</span>
                        </div>
                        <p className="leading-relaxed text-[11px]">
                            تخضع كافة طلبات تغيير الحسابات البنكية لتدقيق الإدارة لضمان ملكية الحساب. سيتم تحديث حسابك فور الموافقة على الطلب.
                        </p>
                    </div>

                    {/* Current Account Summary (Read Only) */}
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block">الحساب الحالي المسجل:</span>
                        <div className="font-bold text-slate-800 dark:text-white flex items-center justify-between">
                            <span>{approvedBank?.name || investorProfile?.bank_name}</span>
                            <span className="font-mono text-[11px] text-slate-500">{formatIban(approvedIban)}</span>
                        </div>
                    </div>

                    {/* New Bank Selection */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            البنك الجديد المطلوب *
                        </label>
                        <Select2
                            value={changeData.new_bank_id}
                            onChange={(val) => setChangeData('new_bank_id', val)}
                            options={banks.map(b => ({
                                value: String(b.id),
                                label: `${b.name} (${b.code})`,
                            }))}
                            placeholder="اختر البنك الجديد..."
                            searchPlaceholder="ابحث باسم البنك أو الكود..."
                        />
                        {changeErrors.new_bank_id && <p className="text-[10px] text-rose-500 mt-1">{changeErrors.new_bank_id}</p>}
                    </div>

                    {/* New IBAN */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            رقم الآيبان الجديد (Saudi IBAN) *
                        </label>
                        <input
                            type="text"
                            maxLength={24}
                            value={changeData.new_iban}
                            onChange={(e) => setChangeData('new_iban', e.target.value.toUpperCase())}
                            placeholder="SA0000000000000000000000"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono tracking-wider focus:outline-none focus:border-amber-500 uppercase"
                            required
                        />
                        {changeErrors.new_iban && <p className="text-[10px] text-rose-500 mt-1">{changeErrors.new_iban}</p>}
                    </div>

                    {/* New Account Holder Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            اسم صاحب الحساب الجديد (مطابق للآيبان) *
                        </label>
                        <input
                            type="text"
                            value={changeData.new_account_holder}
                            onChange={(e) => setChangeData('new_account_holder', e.target.value)}
                            placeholder="الاسم الكامل المسجل لدى البنك الجديد"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            required
                        />
                        {changeErrors.new_account_holder && <p className="text-[10px] text-rose-500 mt-1">{changeErrors.new_account_holder}</p>}
                    </div>

                    {/* New City & Country */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                مدينة الحساب الجديد
                            </label>
                            <input
                                type="text"
                                value={changeData.new_bank_city}
                                onChange={(e) => setChangeData('new_bank_city', e.target.value)}
                                placeholder="مثال: Riyadh"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                رمز الدولة (ISO-2)
                            </label>
                            <input
                                type="text"
                                maxLength={2}
                                value={changeData.new_bank_country}
                                onChange={(e) => setChangeData('new_bank_country', e.target.value.toUpperCase())}
                                placeholder="SA"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            سبب طلب التغيير *
                        </label>
                        <textarea
                            rows={2}
                            value={changeData.reason}
                            onChange={(e) => setChangeData('reason', e.target.value)}
                            placeholder="توضيح سبب التغيير (مثال: إغلاق الحساب القديم، الانتقال لبنك آخر...)"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            required
                        />
                        {changeErrors.reason && <p className="text-[10px] text-rose-500 mt-1">{changeErrors.reason}</p>}
                    </div>

                    {/* Certificate Attachment */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            شهادة الآيبان أو خطاب بنكي رسمي (اختياري / موصى به لتسريع الاعتماد)
                        </label>
                        <div className="relative border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors">
                            <input
                                type="file"
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={(e) => setChangeData('certificate_file', e.target.files[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center gap-1 text-slate-500">
                                <Upload className="w-5 h-5 text-slate-400" />
                                <span className="text-[11px] font-medium">
                                    {changeData.certificate_file ? changeData.certificate_file.name : 'انقر لاختيار ملف شهادة الآيبان (PDF أو صورة)'}
                                </span>
                                <span className="text-[9px] text-slate-400">الحد الأقصى للحجم 5 ميجابايت</span>
                            </div>
                        </div>
                        {changeErrors.certificate_file && <p className="text-[10px] text-rose-500 mt-1">{changeErrors.certificate_file}</p>}
                        {changeErrors.general && <p className="text-[10px] text-rose-500 mt-1">{changeErrors.general}</p>}
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setChangeBankModalOpen(false)}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={submittingChange || !changeData.new_bank_id || !changeData.new_iban || !changeData.new_account_holder || !changeData.reason}
                            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                        >
                            {submittingChange ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Clock className="w-4 h-4" />
                                    <span>إرسال طلب التغيير للإدارة</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Receipt Modal */}
            <ReceiptViewerModal
                isOpen={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                receipt={selectedReceipt}
            />
        </AuthenticatedLayout>
    );
}
