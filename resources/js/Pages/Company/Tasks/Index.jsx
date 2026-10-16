import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Badge from '../../../Components/Badge';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { useTranslation } from '../../../Utils/i18n';
import {
    Truck,
    Search,
    Ban,
    Clock,
    Filter,
    RefreshCw,
    CheckCircle2,
    DollarSign,
    ArrowDownToLine,
    Wallet,
    Key,
    Zap,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

export default function CompanyTasks({ tasks, stats = {}, filters = {} }) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [cancelLoading, setCancelLoading] = useState(false);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('company.tasks.index'), { search, status }, { preserveState: true });
    };

    const handleOpenCancel = (task) => {
        setSelectedTask(task);
        setCancelModalOpen(true);
    };

    const handleConfirmCancel = () => {
        if (!selectedTask) return;
        setCancelLoading(true);
        router.post(route('company.tasks.cancel', selectedTask.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setCancelLoading(false);
                setCancelModalOpen(false);
                setSelectedTask(null);
            },
        });
    };

    return (
        <AuthenticatedLayout title={t('company.tasks.title')}>
            <Head title={t('company.tasks.page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('company.tasks.title')}
                subtitle={t('company.tasks.subtitle')}
                icon={Truck}
                iconColor="text-orange-400"
                iconBg="bg-orange-500/15 border-orange-500/30"
                breadcrumbs={[{ label: t('company.nav.tasks') }]}
                badge={{
                    text: t('company.tasks.badge_registered', { count: stats.total_tasks || 0 }),
                    color: 'orange',
                }}
                actions={[
                    {
                        label: t('company.tasks.btn_withdraw'),
                        icon: ArrowDownToLine,
                        url: route('company.withdrawals.index'),
                        variant: 'primary',
                    },
                    {
                        label: t('company.tasks.btn_funding_wallet'),
                        icon: Wallet,
                        url: route('company.wallet.funding'),
                    },
                    {
                        label: t('company.tasks.btn_api_keys'),
                        icon: Key,
                        url: route('company.api.index'),
                    },
                ]}
            />

            {/* 4 Financial & Operational KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Tasks */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-violet-900/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.tasks.kpi_total')}</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {stats.total_tasks || 0}
                        <span className="text-xs font-sans font-bold text-slate-500">{t('company.tasks.unit_task')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('company.tasks.kpi_total_note', { count: stats.completed_tasks || 0 })}
                    </p>
                </div>

                {/* Funded Tasks */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.tasks.kpi_funded')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {stats.funded_tasks || 0}
                        <span className="text-xs font-sans font-bold text-violet-500">{t('company.tasks.unit_task')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                        {t('company.tasks.kpi_funded_note', { amount: Number(stats.total_funding_amount || 0).toLocaleString('en-US') })}
                    </p>
                </div>

                {/* Available for Funding */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.tasks.kpi_available')}</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-amber-500 flex items-baseline gap-1">
                        {stats.available_tasks || 0}
                        <span className="text-xs font-sans font-bold text-amber-500">{t('company.tasks.unit_task')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('company.tasks.kpi_available_note')}
                    </p>
                </div>

                {/* Ready to Claim / Withdraw */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/40 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('company.tasks.kpi_claimable')}</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold border border-violet-500/30">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400 flex items-baseline gap-1">
                        {Number(stats.claimable_amount || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {t('company.tasks.kpi_claimable_note', { count: stats.claimable_count || 0 })}
                    </p>
                </div>
            </div>

            {/* Filter Box */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 mb-6 shadow-sm">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t('company.tasks.search_label')}
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('company.tasks.search_placeholder')}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2 rtl:pr-9 ltr:pl-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">{t('company.tasks.status_label')}</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                        >
                            <option value="">{t('company.tasks.status_all')}</option>
                            <option value="available">{t('company.tasks.status_opt_available')}</option>
                            <option value="funded">{t('company.tasks.status_opt_funded')}</option>
                            <option value="completed">{t('company.tasks.status_opt_completed')}</option>
                            <option value="cancelled_by_company">{t('company.tasks.status_opt_cancelled')}</option>
                            <option value="expired">{t('company.tasks.status_opt_expired')}</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 rounded-xl font-bold text-xs bg-[#6320EE] hover:bg-[#5217D4] text-white transition-colors flex items-center justify-center gap-1.5 h-[38px] shadow-sm cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>{t('company.tasks.btn_apply_filter')}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setStatus('');
                                router.get(route('company.tasks.index'));
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors h-[38px] border border-slate-200 dark:border-slate-700 cursor-pointer"
                            title={t('company.tasks.btn_reset')}
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Tasks Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <Truck className="w-5 h-5 text-orange-500" />
                        <span>{t('company.tasks.table_title')}</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                        {t('company.tasks.table_showing', { count: tasks.data?.length || 0, total: tasks.total || 0 })}
                    </span>
                </div>

                {tasks.data && tasks.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs rtl:text-right ltr:text-left">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">{t('company.tasks.th_task_number')}</th>
                                    <th className="p-3">{t('company.tasks.th_external_id')}</th>
                                    <th className="p-3">{t('company.tasks.th_route_title')}</th>
                                    <th className="p-3">{t('company.tasks.th_funding_amount')}</th>
                                    <th className="p-3">{t('company.tasks.th_investor')}</th>
                                    <th className="p-3">{t('company.tasks.th_status')}</th>
                                    <th className="p-3">{t('company.tasks.th_withdrawal_status')}</th>
                                    <th className="p-3 text-center">{t('company.tasks.th_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {tasks.data.map((task) => (
                                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                                            #{task.task_number}
                                        </td>
                                        <td className="p-3 font-mono text-slate-500 dark:text-slate-400">
                                            {task.external_task_id || '-'}
                                        </td>
                                        <td className="p-3">
                                            <span className="font-bold text-slate-900 dark:text-white block">{task.title}</span>
                                            <span className="text-[10px] text-slate-500 block">
                                                {task.pickup_city || t('company.tasks.unspecified')} ← {task.dropoff_city || t('company.tasks.unspecified')}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                            {parseFloat(task.funding_amount).toLocaleString('en-US')} {t('common.sar')}
                                        </td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">
                                            {task.funded_by_investor ? (
                                                <span className="font-semibold text-violet-600 dark:text-violet-400">
                                                    {task.funded_by_investor.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <Badge status={task.status} />
                                        </td>
                                        <td className="p-3">
                                            {task.withdrawal_request_id ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                                    {t('company.tasks.included_in_withdrawal', { number: task.withdrawal_request?.request_number || task.withdrawal_request_id })}
                                                </span>
                                            ) : task.status === 'funded' ? (
                                                <Link
                                                    href={route('company.withdrawals.index')}
                                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors inline-block"
                                                >
                                                    {t('company.tasks.available_to_withdraw')}
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400 text-[11px]">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {task.status === 'available' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCancel(task)}
                                                    className="px-2.5 py-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg border border-rose-500/20 transition-colors flex items-center justify-center gap-1 mx-auto cursor-pointer"
                                                >
                                                    <Ban className="w-3 h-3" />
                                                    <span>{t('company.tasks.btn_cancel')}</span>
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
                    <div className="py-12 text-center text-xs text-slate-500">
                        {t('company.tasks.no_tasks_found')}
                    </div>
                )}

                {/* Pagination */}
                {tasks.links && tasks.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        {tasks.links.map((link, idx) => (
                            <Link
                                key={idx}
                                href={link.url || '#'}
                                preserveScroll
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    link.active
                                        ? 'bg-[#6320EE] text-white shadow-sm'
                                        : link.url
                                        ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                        : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Cancel Modal */}
            <ConfirmDialog
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                onConfirm={handleConfirmCancel}
                isLoading={cancelLoading}
                type="danger"
                title={t('company.tasks.cancel_modal_title')}
                message={t('company.tasks.cancel_modal_message_detailed', {
                    number: selectedTask?.task_number || '',
                    external: selectedTask?.external_task_id ? `(${selectedTask.external_task_id})` : '',
                })}
                confirmText={t('company.tasks.cancel_modal_confirm')}
                cancelText={t('company.tasks.cancel_modal_abort')}
            />
        </AuthenticatedLayout>
    );
}
