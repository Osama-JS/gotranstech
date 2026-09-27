import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Badge from '../../../Components/Badge';
import ConfirmDialog from '../../../Components/ConfirmDialog';
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
        <AuthenticatedLayout title="إدارة وتتبع المهام اللوجستية">
            <Head title="مهام الشركة" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="إدارة وتتبع المهام اللوجستية"
                subtitle="متابعة حالة الشحنات والمهام اللوجستية، تغطية التمويل من المستثمرين، وسحب الأرصدة الممولة"
                icon={Truck}
                iconColor="text-orange-400"
                iconBg="bg-orange-500/15 border-orange-500/30"
                breadcrumbs={[{ label: 'إدارة المهام' }]}
                badge={{
                    text: `${stats.total_tasks || 0} مهمة مسجلة`,
                    color: 'orange',
                }}
                actions={[
                    {
                        label: 'طلب سحب تمويل المهام',
                        icon: ArrowDownToLine,
                        url: route('company.withdrawals.index'),
                        variant: 'primary',
                    },
                    {
                        label: 'محفظة التمويل والمسحوبات',
                        icon: Wallet,
                        url: route('company.wallet.funding'),
                    },
                    {
                        label: 'مفاتيح الربط والـ API',
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
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي المهام المسجلة</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {stats.total_tasks || 0}
                        <span className="text-xs font-sans font-bold text-slate-500">مهمة</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {stats.completed_tasks || 0} مهمة مكتملة ومسلمة
                    </p>
                </div>

                {/* Funded Tasks */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">المهام الممولة بنجاح</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {stats.funded_tasks || 0}
                        <span className="text-xs font-sans font-bold text-violet-500">مهمة</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                        بقيمة: {Number(stats.total_funding_amount || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* Available for Funding */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">قيد العرض للتمويل الآن</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-amber-500 flex items-baseline gap-1">
                        {stats.available_tasks || 0}
                        <span className="text-xs font-sans font-bold text-amber-500">مهمة</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        معروضة بسوق التمويل للمستثمرين
                    </p>
                </div>

                {/* Ready to Claim / Withdraw */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/40 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">جاهز للمطالبة والسحب</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold border border-violet-500/30">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400 flex items-baseline gap-1">
                        {Number(stats.claimable_amount || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        في {stats.claimable_count || 0} مهمة ممولة غير مسحوبة
                    </p>
                </div>
            </div>

            {/* Filter Box */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 mb-6 shadow-sm">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            بحث برقم المهمة أو العنوان أو المعرف الخارجي
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="مثلاً: TSK-00123 أو عنوان الشحنة..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2 pr-9 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">حالة المهمة</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                        >
                            <option value="">جميع الحالات</option>
                            <option value="available">متاحة للتمويل (في الانتظار)</option>
                            <option value="funded">ممولة بنجاح (جاهزة للسحب)</option>
                            <option value="completed">مكتملة ومسلمة</option>
                            <option value="cancelled_by_company">ملغاة من قبل الشركة</option>
                            <option value="expired">منتهية الصلاحية</option>
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 rounded-xl font-bold text-xs bg-[#6320EE] hover:bg-[#5217D4] text-white transition-colors flex items-center justify-center gap-1.5 h-[38px] shadow-sm cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>تطبيق التصفية</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                setStatus('');
                                router.get(route('company.tasks.index'));
                            }}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors h-[38px] border border-slate-200 dark:border-slate-700 cursor-pointer"
                            title="إعادة ضبط"
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
                        <span>قائمة وجدول المهام اللوجستية</span>
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                        عرض {tasks.data?.length || 0} من أصل {tasks.total || 0} مهمة
                    </span>
                </div>

                {tasks.data && tasks.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">رقم المهمة بالمنصة</th>
                                    <th className="p-3">المعرف الخارجي</th>
                                    <th className="p-3">عنوان الشحنة والمسار</th>
                                    <th className="p-3">مبلغ التمويل</th>
                                    <th className="p-3">المستثمر الممول</th>
                                    <th className="p-3">حالة المهمة</th>
                                    <th className="p-3">طلب الصرف والسحب</th>
                                    <th className="p-3 text-center">الإجراءات</th>
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
                                                {task.pickup_city || 'غير محدد'} ← {task.dropoff_city || 'غير محدد'}
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                            {parseFloat(task.funding_amount).toLocaleString('en-US')} ر.س
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
                                                    مدرجة بطلب سحب #{task.withdrawal_request?.request_number || task.withdrawal_request_id}
                                                </span>
                                            ) : task.status === 'funded' ? (
                                                <Link
                                                    href={route('company.withdrawals.index')}
                                                    className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors inline-block"
                                                >
                                                    متاحة للسحب الآن
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
                                                    <span>إلغاء</span>
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
                        لا توجد مهام مطابقة لمعايير البحث الحالية.
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
                title="تأكيد إلغاء المهمة اللوجستية"
                message={`هل أنت متأكد من رغبتك في إلغاء المهمة رقم #${selectedTask?.task_number} (${selectedTask?.external_task_id || ''})؟ سيتم إيقاف عرضها فوريًا من سوق التمويل ومنع المستثمرين من تمويلها.`}
                confirmText="نعم، إلغاء المهمة الآن"
                cancelText="تراجع"
            />
        </AuthenticatedLayout>
    );
}
