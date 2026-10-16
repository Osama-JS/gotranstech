import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Badge from '@/Components/Badge';
import ReceiptViewerModal from '@/Components/ReceiptViewerModal';
import { useTranslation } from '@/Utils/i18n';
import {
    Wallet,
    DollarSign,
    ArrowDownToLine,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    Clock,
    FileText,
    Download,
    Eye,
    TrendingUp,
    Truck,
    Building2,
    ShieldCheck,
} from 'lucide-react';

export default function FundingWallet({
    wallet,
    debtWallet,
    stats = {},
    transactions,
    withdrawals,
    company,
}) {
    const { t, locale } = useTranslation();
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docModalOpen, setDocModalOpen] = useState(false);

    const handleViewDoc = (item) => {
        const filePath = item.signed_pdf_file_path || item.pdf_file_path;
        setSelectedDoc({
            ...item,
            title: t('company.funding_wallet.voucher_modal_title', { number: item.request_number }),
            receipt_url: route('company.withdrawals.view-pdf', item.id),
            pdf_file_path: filePath,
            is_pdf: true,
            amount: item.requested_amount,
        });
        setDocModalOpen(true);
    };

    return (
        <AuthenticatedLayout title={t('company.funding_wallet.title')}>
            <Head title={t('company.funding_wallet.page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('company.funding_wallet.title')}
                subtitle={t('company.funding_wallet.subtitle')}
                icon={Wallet}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: t('company.nav.funding_wallet') }]}
                badge={{
                    text: t('company.funding_wallet.badge'),
                    color: 'brand',
                }}
                actions={[
                    {
                        label: t('company.funding_wallet.btn_new_withdrawal'),
                        icon: ArrowDownToLine,
                        url: route('company.withdrawals.index'),
                        variant: 'primary',
                    },
                    {
                        label: t('company.funding_wallet.btn_debt_wallet', { amount: Number(debtWallet?.balance || 0).toLocaleString('en-US') }),
                        icon: DollarSign,
                        url: route('company.wallet.debt'),
                    },
                ]}
            />

            {/* 4 Financial Stat Cards for Funding Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Available Funding Balance */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.funding_wallet.kpi_available')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.available_balance || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('company.funding_wallet.kpi_total_balance_note', { amount: Number(stats.current_balance || 0).toLocaleString('en-US') })}
                    </p>
                </div>

                {/* Total Funding Received from Investors */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.funding_wallet.kpi_received')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        +{Number(stats.total_funding_received || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('company.funding_wallet.kpi_received_note')}
                    </p>
                </div>

                {/* Total Withdrawn to Company Account */}
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.funding_wallet.kpi_withdrawn')}</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.total_withdrawn || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-indigo-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('company.funding_wallet.kpi_withdrawn_note', { count: stats.approved_count || 0 })}
                    </p>
                </div>

                {/* Pending Withdrawals */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.funding_wallet.kpi_pending')}</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.pending_amount || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-amber-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('company.funding_wallet.kpi_pending_note', { count: stats.pending_count || 0 })}
                    </p>
                </div>
            </div>

            {/* Withdrawal Requests Table with Document / PDF Viewer */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <ArrowDownToLine className="w-5 h-5 text-violet-500" />
                        <span>{t('company.funding_wallet.withdrawals_section_title')}</span>
                    </h3>
                    <Link
                        href={route('company.withdrawals.index')}
                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                        {t('company.funding_wallet.btn_manage_withdrawals')}
                    </Link>
                </div>

                {withdrawals.data && withdrawals.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs rtl:text-right ltr:text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">{t('company.funding_wallet.th_req_no')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_req_amount')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_tasks_count')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_due_date')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_status')}</th>
                                    <th className="p-3 text-center">{t('company.funding_wallet.th_voucher_col')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {withdrawals.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{req.request_number}</td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{parseFloat(req.requested_amount).toLocaleString('en-US')} {t('common.sar')}</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{req.number_of_tasks || req.items?.length || 1} {t('common.task')}</td>
                                        <td className="p-3 text-slate-500 font-mono">{req.due_date}</td>
                                        <td className="p-3"><Badge status={req.status} /></td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {(req.signed_pdf_file_path || req.pdf_file_path) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDoc(req)}
                                                        className="px-3 py-1 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                        title={t('company.funding_wallet.btn_view_voucher')}
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>{t('company.funding_wallet.btn_view_voucher')}</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">{t('company.funding_wallet.generating_pdf')}</span>
                                                )}
                                                <a
                                                    href={route('company.withdrawals.pdf', req.id)}
                                                    target="_blank"
                                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                                    title={t('common.download')}
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center text-xs text-slate-500">
                        {t('company.funding_wallet.no_withdrawals_yet')}
                    </div>
                )}
            </div>

            {/* Funding Ledger Transactions */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-500" />
                        <span>{t('company.funding_wallet.ledger_section_title')}</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                        {t('company.funding_wallet.wallet_number_label', { number: wallet.wallet_number || `FUND-W-${wallet.id}` })}
                    </span>
                </div>

                {transactions.data && transactions.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs rtl:text-right ltr:text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">{t('company.funding_wallet.th_tx_desc')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_tx_amount')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_tx_balance')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_tx_type')}</th>
                                    <th className="p-3">{t('company.funding_wallet.th_tx_date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {transactions.data.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3">
                                            <span className="font-semibold text-slate-900 dark:text-white block">{tx.description}</span>
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
                                                {tx.transaction_type === 'credit' ? t('company.funding_wallet.tx_type_credit') : t('company.funding_wallet.tx_type_debit')}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono">
                                            {new Date(tx.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center text-xs text-slate-500">
                        {t('company.funding_wallet.no_transactions_yet')}
                    </div>
                )}
            </div>

            {/* Interactive Document / PDF Viewer Modal */}
            <ReceiptViewerModal
                isOpen={docModalOpen}
                onClose={() => {
                    setDocModalOpen(false);
                    setSelectedDoc(null);
                }}
                deposit={selectedDoc}
            />
        </AuthenticatedLayout>
    );
}
