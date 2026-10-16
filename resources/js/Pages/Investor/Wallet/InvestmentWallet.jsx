import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Modal from '@/Components/Modal';
import Badge from '@/Components/Badge';
import ReceiptViewerModal from '@/Components/ReceiptViewerModal';
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
} from 'lucide-react';

export default function InvestmentWallet({
    wallet,
    commissionWallet,
    stats = {},
    transactions,
    bankDeposits,
    platformBankInfo,
}) {
    const { t, locale } = useTranslation();
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [depositTab, setDepositTab] = useState('hyperpay'); // hyperpay, bank
    const [copiedIban, setCopiedIban] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    // HyperPay form
    const [hpAmount, setHpAmount] = useState('1000');
    const [hpBrand, setHpBrand] = useState('MADA');
    const [hpLoading, setHpLoading] = useState(false);

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
            if (data.checkout_id) {
                window.location.href = route('payments.hyperpay.callback', { id: data.checkout_id });
            }
        })
        .catch(() => setHpLoading(false));
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

            {/* Bank Deposits Submissions Table with Receipt Viewing */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <span>{t('investor.wallet.deposits_with_receipts_title')}</span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        {t('investor.wallet.total_requests_count', { count: bankDeposits.total || bankDeposits.data?.length || 0 })}
                    </span>
                </div>

                {bankDeposits.data && bankDeposits.data.length > 0 ? (
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
                                {bankDeposits.data.map((dep) => (
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
                    <div className="py-10 text-center text-xs text-slate-500">
                        {t('investor.wallet.no_deposits_yet')}
                    </div>
                )}
            </div>

            {/* Investment Wallet Ledger Transactions */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-500" />
                        <span>{t('investor.wallet.inv_ledger_title')}</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                        {t('investor.wallet.wallet_number_label', { number: wallet.wallet_number || `INV-W-${wallet.id}` })}
                    </span>
                </div>

                {transactions.data && transactions.data.length > 0 ? (
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
                                {transactions.data.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3">
                                            <span className="font-semibold text-slate-900 dark:text-white block">{tx.description}</span>
                                            {tx.reference_type && (
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {t('investor.wallet.ref_prefix', { type: tx.reference_type, id: tx.reference_id || '' })}
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
                    <div className="py-10 text-center text-xs text-slate-500">
                        {t('investor.wallet.no_inv_transactions_yet')}
                    </div>
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
                                ? 'bg-[#6320EE] text-white shadow-md'
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
                                ? 'bg-[#6320EE] text-white shadow-md'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Building className="w-4 h-4" />
                        <span>{t('investor.wallet.bank_tab')}</span>
                    </button>
                </div>

                {depositTab === 'hyperpay' ? (
                    <form onSubmit={handleHyperPaySubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">{t('investor.wallet.deposit_amount_label')}</label>
                            <input
                                type="number"
                                min="50"
                                value={hpAmount}
                                onChange={(e) => setHpAmount(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('investor.wallet.choose_payment_method')}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['MADA', 'VISA', 'APPLEPAY'].map((brand) => (
                                    <button
                                        key={brand}
                                        type="button"
                                        onClick={() => setHpBrand(brand)}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                            hpBrand === brand
                                                ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                                                : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                                        }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={hpLoading}
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {hpLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>{t('investor.wallet.continue_hyperpay_btn')}</span>
                            )}
                        </button>
                    </form>
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
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
        </AuthenticatedLayout>
    );
}
