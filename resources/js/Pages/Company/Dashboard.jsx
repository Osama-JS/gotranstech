import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import Badge from '../../Components/Badge';
import OnboardingStepper from '../../Components/OnboardingStepper';
import AdminPageHeader from '../../Components/AdminPageHeader';
import LegalAgreementModal from '../../Components/LegalAgreementModal';
import { useTranslation } from '../../Utils/i18n';
import {
    Building2,
    Truck,
    ArrowDownToLine,
    DollarSign,
    Key,
    PlusCircle,
    ChevronLeft,
    CheckCircle2,
    Clock,
    FileText,
    ArrowUpRight,
} from 'lucide-react';

export default function CompanyDashboard({ company, stats, recentTasks, recentWithdrawals, formTemplate }) {
    const { auth } = usePage().props;
    const { t } = useTranslation();
    const user = auth?.user;
    const [agreementModalOpen, setAgreementModalOpen] = useState(false);

    const displayName = company?.company_name || user?.name;

    return (
        <AuthenticatedLayout title={t('company.dashboard.title', { name: displayName })}>
            <Head title={t('company.dashboard.page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('company.dashboard.title', { name: displayName })}
                subtitle={t('company.dashboard.subtitle')}
                icon={Building2}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                badge={{
                    text: user?.status === 'active' ? t('company.dashboard.status_active') : t('company.dashboard.status_pending'),
                    color: user?.status === 'active' ? 'brand' : 'amber',
                }}
                actions={[
                    {
                        label: t('company.dashboard.btn_funding_wallet'),
                        icon: ArrowDownToLine,
                        url: route('company.wallet.funding'),
                        variant: 'primary',
                    },
                    {
                        label: t('company.dashboard.btn_debt_wallet'),
                        icon: DollarSign,
                        url: route('company.wallet.debt'),
                    },
                    {
                        label: t('company.dashboard.btn_legal_agreement'),
                        icon: FileText,
                        onClick: () => setAgreementModalOpen(true),
                    },
                ]}
            />

            {/* Onboarding Stepper for New Users */}
            {(user?.status === 'pending_approval' || !user?.agreement_signed_at || !user?.form_template_id) && (
                <div className="mb-6">
                    <OnboardingStepper formTemplate={formTemplate} />
                </div>
            )}

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Available Funding Balance */}
                <div className="glass-panel p-6 rounded-3xl border border-violet-500/40 relative overflow-hidden group hover:border-violet-500/60 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                            <ArrowDownToLine className="w-6 h-6" />
                        </div>
                        <Link
                            href={route('company.wallet.funding')}
                            className="text-xs font-bold text-violet-300 hover:text-white flex items-center gap-1 bg-violet-500/10 px-3 py-1.5 rounded-xl border border-violet-500/20 transition-colors"
                        >
                            <span>{t('company.dashboard.btn_funding_wallet')}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">
                        {t('company.dashboard.card_funding_title')}
                    </span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {stats.funding_available.toLocaleString('en-US')}
                        <span className="text-sm font-sans font-bold text-violet-400">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {t('company.dashboard.card_funding_locked', { amount: stats.locked_in_withdrawals.toLocaleString('en-US') })}
                    </p>
                </div>

                {/* Outstanding Debts */}
                <div className="glass-panel p-6 rounded-3xl border border-rose-500/40 relative overflow-hidden group hover:border-rose-500/60 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <Link
                            href={route('company.wallet.debt')}
                            className="text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 transition-colors"
                        >
                            {t('company.dashboard.card_debt_link')}
                        </Link>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">
                        {t('company.dashboard.card_debt_title')}
                    </span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {stats.total_debt_outstanding.toLocaleString('en-US')}
                        <span className="text-sm font-sans font-bold text-rose-400">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {t('company.dashboard.card_debt_note')}
                    </p>
                </div>

                {/* Tasks Stats */}
                <div className="glass-panel p-6 rounded-3xl border border-orange-500/40 relative overflow-hidden group hover:border-orange-500/60 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                            <Truck className="w-6 h-6" />
                        </div>
                        <Link
                            href={route('company.api.index')}
                            className="text-xs font-bold text-orange-300 hover:text-white flex items-center gap-1 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 transition-colors"
                        >
                            <Key className="w-3.5 h-3.5" />
                            <span>{t('company.dashboard.card_tasks_api_link')}</span>
                        </Link>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">
                        {t('company.dashboard.card_tasks_title')}
                    </span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {stats.funded_tasks_count}
                        <span className="text-sm font-sans font-bold text-orange-400">{t('common.tasks')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {t('company.dashboard.card_tasks_available', { count: stats.available_tasks_count })}
                    </p>
                </div>
            </div>

            {/* Recent Tasks & Recent Withdrawals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tasks */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                            <Truck className="w-5 h-5 text-orange-400" />
                            <span>{t('company.dashboard.recent_tasks_title')}</span>
                        </h3>
                        <Link href={route('company.tasks.index')} className="text-xs text-orange-400 hover:text-orange-300 transition-colors">
                            {t('common.view_all')}
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentTasks.length > 0 ? (
                            recentTasks.map((task) => (
                                <div key={task.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold text-orange-400">{task.task_number}</span>
                                            <span className="text-[10px] text-slate-500 font-mono">({task.external_task_id})</span>
                                        </div>
                                        <span className="text-xs font-bold text-white block truncate max-w-[200px]">{task.title}</span>
                                        <span className="text-[10px] text-slate-400 block mt-0.5">{task.pickup_city} ← {task.dropoff_city}</span>
                                    </div>
                                    <div className="text-left flex flex-col items-end gap-1">
                                        <span className="font-mono font-bold text-sm text-white">
                                            {parseFloat(task.funding_amount).toLocaleString('en-US')} {t('common.sar')}
                                        </span>
                                        <Badge status={task.status} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-6">{t('company.dashboard.no_recent_tasks')}</p>
                        )}
                    </div>
                </div>

                {/* Recent Withdrawals */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                            <ArrowDownToLine className="w-5 h-5 text-violet-400" />
                            <span>{t('company.dashboard.recent_withdrawals_title')}</span>
                        </h3>
                        <Link href={route('company.withdrawals.index')} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                            {t('common.view_all')}
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {recentWithdrawals.length > 0 ? (
                            recentWithdrawals.map((w) => (
                                <div key={w.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                                    <div>
                                        <span className="font-mono text-xs font-bold text-violet-400 block">{w.request_number}</span>
                                        <span className="text-[11px] text-slate-400 block mt-0.5">{t('company.dashboard.tasks_included', { count: w.number_of_tasks })}</span>
                                    </div>
                                    <div className="text-left flex flex-col items-end gap-1">
                                        <span className="font-mono font-bold text-sm text-white">
                                            {parseFloat(w.requested_amount).toLocaleString('en-US')} {t('common.sar')}
                                        </span>
                                        <Badge status={w.status} />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-6">{t('company.dashboard.no_recent_withdrawals')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Legal Agreement Modal */}
            <LegalAgreementModal
                isOpen={agreementModalOpen}
                onClose={() => setAgreementModalOpen(false)}
            />
        </AuthenticatedLayout>
    );
}
