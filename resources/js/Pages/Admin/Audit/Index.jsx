import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import StatCard from '../../../Components/StatCard';
import SearchableSelect from '../../../Components/SearchableSelect';
import DatePicker from '../../../Components/DatePicker';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import { 
    History, 
    Search, 
    Filter, 
    RefreshCw, 
    Eye, 
    User, 
    Globe, 
    Code, 
    ShieldCheck,
    Lock,
    Settings,
    Activity,
    FileCode,
    Sliders
} from 'lucide-react';

export default function AdminAuditLogs({ logs, stats, eventTypes = {}, filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [eventType, setEventType] = useState(filters?.event_type || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const [selectedLog, setSelectedLog] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.audit.index'), {
            search,
            event_type: eventType,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setEventType('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.audit.index'));
    };

    const handleOpenDetails = (log) => {
        setSelectedLog(log);
        setDetailsModalOpen(true);
    };

    // Format eventTypes options
    const eventTypeOptions = [
        { value: '', label: 'جميع أنواع العمليات' },
        ...Object.entries(eventTypes).map(([key, label]) => ({
            value: key,
            label: `${label} (${key})`
        }))
    ];

    const getEventBadge = (type) => {
        switch (type) {
            case 'login':
                return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'created':
                return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
            case 'updated':
            case 'status_changed':
                return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            case 'deleted':
            case 'rejected':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'approved':
            case 'funded':
                return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'setting_changed':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default:
                return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    return (
        <AuthenticatedLayout title="سجل التدقيق والرقابة وتتبع العمليات">
            <Head title="سجل التدقيق والعمليات - إدارة المنصة" />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title="سجل التدقيق والرقابة وتتبع العمليات"
                    subtitle="مراقبة وتتبع العمليات الإدارية، التغييرات المالية، تعديلات النظام وعناوين IP لحظياً"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'سجل العمليات والتدقيق' }
                    ]}
                    icon={History}
                    iconColor="text-purple-400"
                    badge={{ text: `${stats?.total || 0} عملية مسجلة`, color: 'purple' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="إجمالي السجلات"
                        value={stats?.total || 0}
                        icon={Activity}
                        color="blue"
                        description="سجل العمليات المسجلة للنظام"
                    />
                    <StatCard
                        title="عمليات مالية واعتمادات"
                        value={stats?.financial || 0}
                        icon={ShieldCheck}
                        color="purple"
                        description="تمويل، اعتماد، ورفض"
                    />
                    <StatCard
                        title="تعديلات وتحديث بيانات"
                        value={stats?.changes || 0}
                        icon={Sliders}
                        color="cyan"
                        description="إضافة وتعديل وحذف"
                    />
                    <StatCard
                        title="تغييرات الإعدادات"
                        value={stats?.settings || 0}
                        icon={Settings}
                        color="amber"
                        description="تعديلات على ضبط النظام"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-30 overflow-visible">
                    <form onSubmit={handleFilter} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">بحث سريع</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="الوصف، عنوان IP، اسم المستخدم، الكيان..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                                    />
                                </div>
                            </div>

                            <SearchableSelect
                                label="نوع العملية (Event Type)"
                                options={eventTypeOptions}
                                value={eventType}
                                onChange={setEventType}
                                placeholder="اختر نوع العملية..."
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 items-end">
                            <DatePicker
                                label="من تاريخ"
                                value={dateFrom}
                                onChange={setDateFrom}
                                placeholder="من تاريخ..."
                            />

                            <DatePicker
                                label="إلى تاريخ"
                                value={dateTo}
                                onChange={setDateTo}
                                placeholder="إلى تاريخ..."
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>تطبيق الفلترة</span>
                                </button>
                                {(search || eventType || dateFrom || dateTo) && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                                        title="إعادة ضبط"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">نوع الحدث</th>
                                    <th className="p-4">المستخدم المسؤول</th>
                                    <th className="p-4">الكيان والجدول</th>
                                    <th className="p-4">وصف العملية</th>
                                    <th className="p-4">عنوان IP</th>
                                    <th className="p-4">التاريخ والوقت</th>
                                    <th className="p-4 text-center">التفاصيل</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {logs?.data && logs.data.length > 0 ? (
                                    logs.data.map((log) => (
                                        <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border ${getEventBadge(log.event_type)}`}>
                                                    {eventTypes[log.event_type] || log.event_type}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                {log.user ? (
                                                    <div className="space-y-0.5">
                                                        <span className="font-bold text-slate-200 block">{log.user.name}</span>
                                                        <span className="text-[10px] text-slate-400 font-mono block">{log.user.email}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-500 font-medium">النظام / ضيف</span>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-slate-400">
                                                {log.auditable_type ? (
                                                    <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                                                        {log.auditable_type.split('\\').pop()} #{log.auditable_id}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-slate-300 max-w-sm truncate" title={log.description}>
                                                {log.description}
                                            </td>
                                            <td className="p-4 font-mono text-slate-400 text-[11px]">
                                                {log.ip_address || '-'}
                                            </td>
                                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                                                {new Date(log.created_at).toLocaleString('ar-SA')}
                                            </td>
                                            <td className="p-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetails(log)}
                                                    className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 flex items-center gap-1 border border-slate-700 transition-all text-xs font-semibold mx-auto cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>فحص</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <History className="w-8 h-8 text-slate-600" />
                                                <p className="text-sm font-semibold">لا توجد سجلات مطابقة لمعايير البحث</p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 underline"
                                                >
                                                    إلغاء الفلاتر
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/40">
                        <Pagination links={logs?.links} meta={logs} />
                    </div>
                </div>
            </div>

            {/* Audit Log Details Modal with JSON Inspector */}
            <Modal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                title={`تفاصيل حدث التدقيق #${selectedLog?.id} (${selectedLog?.event_type})`}
                maxWidth="2xl"
            >
                {selectedLog && (
                    <div className="space-y-4 text-xs font-sans">
                        <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                            <div>
                                <span className="text-slate-500 block mb-0.5">المستخدم:</span>
                                <strong className="text-white">{selectedLog.user?.name || 'النظام'}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-0.5">عنوان IP:</span>
                                <strong className="text-purple-400 font-mono">{selectedLog.ip_address || '-'}</strong>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-0.5">الكيان والصف:</span>
                                <strong className="text-slate-300 font-mono">
                                    {selectedLog.auditable_type ? `${selectedLog.auditable_type} #${selectedLog.auditable_id}` : '-'}
                                </strong>
                            </div>
                            <div>
                                <span className="text-slate-500 block mb-0.5">التاريخ والوقت:</span>
                                <strong className="text-slate-300 font-mono">{new Date(selectedLog.created_at).toLocaleString('ar-SA')}</strong>
                            </div>
                        </div>

                        <div>
                            <span className="font-bold text-slate-300 block mb-1">البيان والوصف:</span>
                            <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                                {selectedLog.description}
                            </p>
                        </div>

                        {/* Changes Comparison Table */}
                        {(() => {
                            const oldVal = selectedLog.old_values || {};
                            const newVal = selectedLog.new_values || {};
                            const allKeys = Array.from(new Set([...Object.keys(oldVal), ...Object.keys(newVal)]));

                            if (allKeys.length === 0) return null;

                            const formatVal = (val) => {
                                if (val === null || val === undefined) return <span className="text-slate-500 italic">فارغ (null)</span>;
                                if (typeof val === 'boolean') return val ? <span className="text-violet-400 font-bold">صحيح (true)</span> : <span className="text-rose-400 font-bold">خطأ (false)</span>;
                                if (typeof val === 'object') return <span className="font-mono text-[10px]">{JSON.stringify(val)}</span>;
                                return <span className="font-mono">{String(val)}</span>;
                            };

                            return (
                                <div>
                                    <span className="font-bold text-slate-200 dark:text-slate-200 block mb-2">جدول مقارنة التغييرات:</span>
                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner">
                                        <div className="overflow-x-auto max-h-64">
                                            <table className="w-full text-xs text-start">
                                                <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                                                    <tr>
                                                        <th className="p-3 text-start">الحقل</th>
                                                        <th className="p-3 text-start">القيمة السابقة</th>
                                                        <th className="p-3 text-start">القيمة الجديدة</th>
                                                        <th className="p-3 text-center">نوع التغيير</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/60">
                                                    {allKeys.map((key) => {
                                                        const o = oldVal[key];
                                                        const n = newVal[key];
                                                        const isAdded = !(key in oldVal) && (key in newVal);
                                                        const isRemoved = (key in oldVal) && !(key in newVal);
                                                        const isChanged = JSON.stringify(o) !== JSON.stringify(n);

                                                        return (
                                                            <tr key={key} className="hover:bg-slate-900/50 transition-colors">
                                                                <td className="p-3 font-semibold text-slate-300 font-mono">
                                                                    {key}
                                                                </td>
                                                                <td className="p-3 text-amber-300/90 bg-amber-500/5">
                                                                    {formatVal(o)}
                                                                </td>
                                                                <td className="p-3 text-violet-300/90 bg-violet-500/5">
                                                                    {formatVal(n)}
                                                                </td>
                                                                <td className="p-3 text-center">
                                                                    {isAdded && (
                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                                            إضافة +
                                                                        </span>
                                                                    )}
                                                                    {isRemoved && (
                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                                            حذف -
                                                                        </span>
                                                                    )}
                                                                    {!isAdded && !isRemoved && isChanged && (
                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                            تعديل ✎
                                                                        </span>
                                                                    )}
                                                                    {!isChanged && (
                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-500">
                                                                            بدون تغيير
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setDetailsModalOpen(false)}
                                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                                إغلاق النافذة
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
