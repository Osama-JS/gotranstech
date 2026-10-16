import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Modal from '@/Components/Modal';
import Badge from '@/Components/Badge';
import ReceiptViewerModal from '@/Components/ReceiptViewerModal';
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
} from 'lucide-react';

export default function CommissionWallet({
    wallet,
    investmentWallet,
    stats = {},
    transactions,
    investorProfile,
}) {
    const { t, locale } = useTranslation();
    const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);

    // Withdrawal Form
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        bank_name: investorProfile?.bank_name || t('investor.wallet.default_bank_name'),
        iban: investorProfile?.iban || '',
        account_holder: investorProfile?.account_holder || '',
    });

    const handleWithdrawSubmit = (e) => {
        e.preventDefault();
        post(route('investor.wallet.commission.withdraw'), {
            onSuccess: () => {
                setWithdrawModalOpen(false);
                reset('amount');
            },
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
                        label: t('investor.wallet.btn_request_withdrawal'),
                        icon: ArrowDownToLine,
                        onClick: () => setWithdrawModalOpen(true),
                        variant: 'primary',
                    },
                    {
                        label: `${t('investor.nav.investment_wallet')} (${Number(investmentWallet?.available_balance || 0).toLocaleString('en-US')} ${t('common.sar')})`,
                        icon: Wallet,
                        url: route('investor.wallet.investment'),
                    },
                ]}
            />

            {/* 4 Financial Stat Cards for Commission Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Available Profits to Withdraw */}
                <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_comm_available')}</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.available_balance || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-orange-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.wallet.kpi_comm_ready_to_withdraw')}
                    </p>
                </div>

                {/* Total Historical Earnings */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_comm_total_earned')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        +{Number(stats.total_earned || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.wallet.kpi_comm_logistics_returns')}
                    </p>
                </div>

                {/* Total Withdrawn to Bank */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_comm_total_withdrawn')}</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.total_withdrawn || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-slate-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.wallet.kpi_comm_transferred_to_bank')}
                    </p>
                </div>

                {/* Tasks Count & Avg Profit */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('investor.wallet.kpi_comm_rewarded_tasks')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 dark:text-violet-400 flex items-center justify-center font-bold">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {stats.tasks_rewarded_count || 0}
                        <span className="text-xs font-sans font-bold text-slate-500">{t('investor.analytics.task_unit')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('investor.wallet.kpi_comm_avg_profit', { amount: stats.avg_profit_per_task || 0 })}
                    </p>
                </div>
            </div>

            {/* Commission Ledger Transactions Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-orange-500" />
                        <span>{t('investor.wallet.comm_ledger_title')}</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                        {t('investor.wallet.wallet_number_label', { number: wallet.wallet_number || `COMM-W-${wallet.id}` })}
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
                    <div className="py-10 text-center text-xs text-slate-500">
                        {t('investor.wallet.no_comm_transactions_yet')}
                    </div>
                )}
            </div>

            {/* Withdrawal Modal */}
            <Modal
                isOpen={withdrawModalOpen}
                onClose={() => setWithdrawModalOpen(false)}
                title={t('investor.wallet.withdraw_modal_title')}
                maxWidth="md"
            >
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-600 dark:text-orange-400">
                        {t('investor.wallet.withdraw_available_now', {
                            amount: Number(wallet.available_balance || 0).toLocaleString('en-US'),
                            currency: t('common.sar'),
                        })}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            {t('investor.wallet.withdrawal_amount_label')} *
                        </label>
                        <input
                            type="number"
                            min="50"
                            max={wallet.available_balance || 0}
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder={t('investor.wallet.withdraw_amount_min_hint')}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500"
                            required
                        />
                        {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            {t('investor.wallet.withdraw_recipient_bank')}
                        </label>
                        <input
                            type="text"
                            value={data.bank_name}
                            onChange={(e) => setData('bank_name', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                            required
                        />
                        {errors.bank_name && <p className="text-[10px] text-rose-500 mt-1">{errors.bank_name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            {t('investor.wallet.iban_label')} *
                        </label>
                        <input
                            type="text"
                            value={data.iban}
                            onChange={(e) => setData('iban', e.target.value)}
                            placeholder={t('investor.wallet.iban_placeholder')}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-orange-500"
                            required
                        />
                        {errors.iban && <p className="text-[10px] text-rose-500 mt-1">{errors.iban}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            {t('investor.wallet.account_holder_label')} *
                        </label>
                        <input
                            type="text"
                            value={data.account_holder}
                            onChange={(e) => setData('account_holder', e.target.value)}
                            placeholder={t('investor.wallet.withdraw_holder_placeholder')}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setWithdrawModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 shadow-md shadow-orange-600/30 cursor-pointer"
                        >
                            {processing ? t('investor.wallet.btn_submitting_withdrawal') : t('investor.wallet.submit_withdrawal_btn')}
                        </button>
                    </div>
                </form>
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
