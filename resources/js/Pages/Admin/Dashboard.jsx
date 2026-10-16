import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../Components/AdminPageHeader';
import StatCard from '../../Components/StatCard';
import Badge from '../../Components/Badge';
import {
    LayoutDashboard,
    Users,
    Building2,
    Truck,
    TrendingUp,
    ArrowDownToLine,
    Receipt,
    DollarSign,
    ShieldCheck,
    History,
    ChevronLeft,
    Wallet,
    Clock,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import { useTranslation } from '../../Utils/i18n';

export default function AdminDashboard({ metrics, recentTasks = [], recentTransactions = [], recentAudits = [] }) {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';

    return (
        <AuthenticatedLayout>
            <Head title={t('admin.dashboard.page_title')} />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title={t('admin.dashboard.title')}
                    subtitle={t('admin.dashboard.subtitle')}
                    breadcrumbs={[
                        { label: t('common.home') }
                    ]}
                    icon={LayoutDashboard}
                    iconColor="text-violet-400"
                    badge={{ text: t('admin.dashboard.badge_connected'), color: 'brand' }}
                />

                {/* Top KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title={t('admin.dashboard.stat_total_investors')}
                        value={metrics?.total_investors || 0}
                        icon={Users}
                        color="brand"
                        description={t('admin.dashboard.stat_total_investors_desc')}
                    />
                    <StatCard
                        title={t('admin.dashboard.stat_total_companies')}
                        value={metrics?.total_companies || 0}
                        icon={Building2}
                        color="orange"
                        description={t('admin.dashboard.stat_total_companies_desc')}
                    />
                    <StatCard
                        title={t('admin.dashboard.stat_platform_revenue')}
                        value={`${Number(metrics?.total_platform_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('common.sar')}`}
                        icon={TrendingUp}
                        color="brand"
                        description={t('admin.dashboard.stat_platform_revenue_desc', { count: metrics?.total_tasks_funded || 0 })}
                    />
                    <StatCard
                        title={t('admin.dashboard.stat_pending_approval')}
                        value={t('admin.dashboard.stat_pending_approval_val', {
                            deposits: metrics?.pending_bank_deposits || 0,
                            withdrawals: metrics?.pending_withdrawals || 0
                        })}
                        icon={Receipt}
                        color="orange"
                        description={t('admin.dashboard.stat_pending_approval_desc')}
                    />
                </div>

                {/* Recent Logistics Tasks Table */}
                <div className="glass-panel p-6 rounded-3xl border border-violet-900/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                                <Truck className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-white text-sm">{t('admin.dashboard.recent_tasks_title')}</h3>
                        </div>
                        <Link href={route('admin.tasks.index')} className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors">
                            <span>{t('admin.dashboard.view_all_tasks')}</span>
                            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-3.5">{t('admin.dashboard.col_task_number')}</th>
                                    <th className="p-3.5">{t('admin.dashboard.col_company')}</th>
                                    <th className="p-3.5">{t('admin.dashboard.col_route')}</th>
                                    <th className="p-3.5">{t('admin.dashboard.col_funding_amount')}</th>
                                    <th className="p-3.5">{t('admin.dashboard.col_funder')}</th>
                                    <th className="p-3.5">{t('admin.dashboard.col_status')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {recentTasks && recentTasks.length > 0 ? (
                                    recentTasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="p-3.5 font-mono font-bold text-violet-400">
                                                <span className="bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/20">
                                                    {task.task_number}
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-slate-200 font-semibold">{task.company?.company_name}</td>
                                            <td className="p-3.5">
                                                <span className="text-slate-100 font-bold block">{task.title}</span>
                                                <span className="text-[11px] text-slate-400 block">{task.pickup_city} ← {task.dropoff_city}</span>
                                            </td>
                                            <td className="p-3.5 font-mono font-bold text-white">
                                                {parseFloat(task.funding_amount || task.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} {t('common.sar')}
                                            </td>
                                            <td className="p-3.5 text-slate-300">
                                                {task.funded_by_investor ? (
                                                    <span className="text-violet-400 font-medium">{task.funded_by_investor.name}</span>
                                                ) : (
                                                    <span className="text-slate-500 italic">{t('admin.dashboard.waiting_funder')}</span>
                                                )}
                                            </td>
                                            <td className="p-3.5"><Badge status={task.status} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-500">{t('admin.dashboard.no_recent_tasks')}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Audit Feed & Transactions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Audits */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                                    <History className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-white text-sm">{t('admin.dashboard.recent_audits_title')}</h3>
                            </div>
                            <Link href={route('admin.audit.index')} className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                                <span>{t('admin.dashboard.view_all_audits')}</span>
                                <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                            </Link>
                        </div>

                        <div className="space-y-2.5">
                            {recentAudits && recentAudits.length > 0 ? (
                                recentAudits.map((log) => (
                                    <div key={log.id} className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs flex items-start justify-between gap-3 hover:border-slate-700 transition-colors">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-purple-400 uppercase text-[10px] bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                                                    {log.event_type}
                                                </span>
                                                <span className="text-slate-200 font-semibold">{log.user?.name || t('admin.dashboard.auto_system')}</span>
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed">{log.description}</p>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                            {new Date(log.created_at).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-slate-500 text-xs">{t('admin.dashboard.no_recent_audits')}</p>
                            )}
                        </div>
                    </div>

                    {/* Ledger Transactions */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-xl">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                    <Wallet className="w-4 h-4" />
                                </div>
                                <h3 className="font-bold text-white text-sm">{t('admin.dashboard.recent_tx_title')}</h3>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {recentTransactions && recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div key={tx.id} className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                                        <div>
                                            <span className="font-bold text-slate-200 block truncate max-w-[220px]">{tx.description}</span>
                                            <span className="text-[10px] text-slate-500 block">{tx.user?.name} • {new Date(tx.created_at).toLocaleString(isAr ? 'ar-SA' : 'en-US')}</span>
                                        </div>
                                        <span className={`font-mono font-bold text-xs ${
                                            parseFloat(tx.amount) > 0 ? 'text-violet-400' : 'text-slate-300'
                                        }`}>
                                            {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toLocaleString('en-US')}` : parseFloat(tx.amount).toLocaleString('en-US')} {t('common.sar')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-slate-500 text-xs">{t('admin.dashboard.no_recent_tx')}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

