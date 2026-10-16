import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import Badge from '../../../Components/Badge';
import { useTranslation } from '../../../Utils/i18n';
import { DollarSign, Calendar, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function CompanyDebts({ debts, debtWallet, totalOutstanding, totalPaid }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout title={t('company.debts.title')}>
            <Head title={t('company.debts.page_title')} />

            {/* Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="glass-panel p-6 rounded-3xl border border-rose-500/40">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">{t('company.debts.card_outstanding')}</span>
                    <div className="text-3xl font-black font-mono text-rose-400">
                        {totalOutstanding.toLocaleString('en-US')} <span className="text-sm font-sans text-rose-300">{t('common.sar')}</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-violet-500/40">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">{t('company.debts.card_paid')}</span>
                    <div className="text-3xl font-black font-mono text-violet-400">
                        {totalPaid.toLocaleString('en-US')} <span className="text-sm font-sans text-violet-300">{t('common.sar')}</span>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 block mb-1">{t('company.debts.card_count')}</span>
                    <div className="text-3xl font-black font-mono text-white">
                        {debts.total} <span className="text-sm font-sans text-slate-400">{t('company.debts.unit_note')}</span>
                    </div>
                </div>
            </div>

            {/* Debts Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-rose-400" />
                    <span>{t('company.debts.table_title')}</span>
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs rtl:text-right ltr:text-left">
                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3">{t('company.debts.th_withdrawal_req')}</th>
                                <th className="p-3">{t('company.debts.th_principal')}</th>
                                <th className="p-3">{t('company.debts.th_paid')}</th>
                                <th className="p-3">{t('company.debts.th_remaining')}</th>
                                <th className="p-3">{t('company.debts.th_due_date')}</th>
                                <th className="p-3">{t('company.debts.th_status')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {debts.data.map((debt) => (
                                <tr key={debt.id} className="hover:bg-slate-900/40">
                                    <td className="p-3 font-mono font-bold text-blue-400">
                                        {debt.withdrawal_request?.request_number || `#${debt.withdrawal_request_id}`}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-white">
                                        {parseFloat(debt.principal_amount).toLocaleString('en-US')} {t('common.sar')}
                                    </td>
                                    <td className="p-3 font-mono text-violet-400">
                                        {parseFloat(debt.paid_amount).toLocaleString('en-US')} {t('common.sar')}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-rose-400">
                                        {parseFloat(debt.remaining_amount).toLocaleString('en-US')} {t('common.sar')}
                                    </td>
                                    <td className="p-3 font-mono font-bold text-slate-300">
                                        {debt.due_date}
                                    </td>
                                    <td className="p-3"><Badge status={debt.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
