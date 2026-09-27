import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import {
    Server,
    Database,
    Cpu,
    HardDrive,
    Zap,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    Activity,
    Shield,
    Layers,
    Terminal,
    Settings2,
} from 'lucide-react';

export default function AdminSystemHealth({
    phpInfo = {},
    storageInfo = {},
    dbInfo = {},
    servicesInfo = {},
}) {
    const { post, processing } = useForm();

    const triggerAction = (actionName) => {
        post(route('admin.system-health.action'), {
            data: { action: actionName },
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout title="مراقبة الخادم وصحة النظام">
            <Head title="مراقبة الخادم وصحة قاعدة البيانات" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <AdminPageHeader
                        title="مراقبة الخادم وصحة قاعدة البيانات"
                        description="متابعة أداء خادم الاستضافة، سلامة الاتصال بقاعدة البيانات، وسعة التخزين والذاكرة"
                        icon={Server}
                        badge="نظام المراقبة الحية"
                    />

                    {/* Overall Status Badge */}
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800 self-start sm:self-center">
                        <span className="w-3 h-3 rounded-full bg-[#6320EE] animate-pulse" />
                        <span className="text-xs font-bold text-violet-400">كافة الخدمات تعمل بكفاءة</span>
                    </div>
                </div>

                {/* 4 Health Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* DB Status */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-400">اتصال قاعدة البيانات</span>
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dbInfo.connected ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                <Database className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                            {dbInfo.connected ? (
                                <CheckCircle2 className="w-5 h-5 text-violet-400" />
                            ) : (
                                <XCircle className="w-5 h-5 text-rose-400" />
                            )}
                            <span className="text-xl font-black text-white">
                                {dbInfo.connected ? 'متصل بنجاح' : 'انقطع الاتصال'}
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                            استجابة: {dbInfo.latency_ms} ms ({dbInfo.driver})
                        </div>
                    </div>

                    {/* DB Size */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-400">حجم قاعدة البيانات</span>
                            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                                <HardDrive className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black font-mono text-blue-400 mb-1">
                            {dbInfo.database_size || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                            قاعدة: {dbInfo.database}
                        </div>
                    </div>

                    {/* Memory Usage */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-400">استهلاك الذاكرة (RAM)</span>
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
                                <Cpu className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black font-mono text-purple-400 mb-1">
                            {phpInfo.memory_current_usage}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                            أقصى حد: {phpInfo.memory_limit} (ذروة: {phpInfo.memory_peak_usage})
                        </div>
                    </div>

                    {/* Disk Storage */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800 relative group">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-400">سعة القرص الصلب</span>
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                                <HardDrive className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black font-mono text-violet-400 mb-1">
                            {storageInfo.free_space} <span className="text-xs text-slate-400 font-sans">متاح</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
                            <div
                                style={{ width: `${storageInfo.usage_percentage}%` }}
                                className="h-full rounded-full bg-[#6320EE]"
                            />
                        </div>
                    </div>
                </div>

                {/* System Maintenance & Quick Actions */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-amber-400" />
                        <span>إجراءات الصيانة السريعة للخادم</span>
                    </h3>
                    <p className="text-xs text-slate-400 mb-5">
                        تنفيذ أوامر تفريغ الذاكرة المؤقتة وضبط سرعة استجابة المنصة
                    </p>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => triggerAction('clear_cache')}
                            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-center transition-all group hover:scale-[1.02] disabled:opacity-50"
                        >
                            <RefreshCw className="w-5 h-5 text-violet-400 mx-auto mb-2 group-hover:rotate-180 transition-transform" />
                            <span className="block text-xs font-bold text-slate-200">مسح كاش التطبيق</span>
                            <span className="text-[10px] text-slate-500">cache:clear</span>
                        </button>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => triggerAction('clear_config')}
                            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-center transition-all group hover:scale-[1.02] disabled:opacity-50"
                        >
                            <Settings2 className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                            <span className="block text-xs font-bold text-slate-200">مسح كاش الإعدادات</span>
                            <span className="text-[10px] text-slate-500">config:clear</span>
                        </button>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => triggerAction('clear_route')}
                            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-center transition-all group hover:scale-[1.02] disabled:opacity-50"
                        >
                            <Activity className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                            <span className="block text-xs font-bold text-slate-200">مسح كاش التوجيهات</span>
                            <span className="text-[10px] text-slate-500">route:clear</span>
                        </button>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => triggerAction('clear_view')}
                            className="p-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-center transition-all group hover:scale-[1.02] disabled:opacity-50"
                        >
                            <Layers className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                            <span className="block text-xs font-bold text-slate-200">مسح كاش الواجهات</span>
                            <span className="text-[10px] text-slate-500">view:clear</span>
                        </button>

                        <button
                            type="button"
                            disabled={processing}
                            onClick={() => triggerAction('optimize')}
                            className="p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-center transition-all group hover:scale-[1.02] disabled:opacity-50"
                        >
                            <Zap className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                            <span className="block text-xs font-bold text-amber-300">تحسين شامل للأداء</span>
                            <span className="text-[10px] text-amber-400/70">optimize:clear</span>
                        </button>
                    </div>
                </div>

                {/* Main Technical Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* PHP & Environment Details */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
                            <Cpu className="w-5 h-5 text-purple-400" />
                            <span>بيئة التشغيل وخادم PHP</span>
                        </h3>

                        <div className="divide-y divide-slate-800 text-xs font-mono">
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-slate-400 font-sans">إصدار PHP:</span>
                                <span className="font-bold text-slate-200">{phpInfo.php_version}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-slate-400 font-sans">إصدار Laravel Framework:</span>
                                <span className="font-bold text-violet-400">{phpInfo.laravel_version}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-slate-400 font-sans">نظام التشغيل (OS):</span>
                                <span className="font-bold text-slate-200">{phpInfo.os}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-slate-400 font-sans">أقصى وقت تنفيذ (Max Execution Time):</span>
                                <span className="font-bold text-slate-200">{phpInfo.max_execution_time}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-slate-400 font-sans">أقصى حجم لرفع الملفات (Upload Max):</span>
                                <span className="font-bold text-slate-200">{phpInfo.upload_max_filesize}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-slate-400 font-sans">المنطقة الزمنية (Timezone):</span>
                                <span className="font-bold text-slate-200">{phpInfo.timezone}</span>
                            </div>
                            <div className="py-2.5 flex items-center justify-between">
                                <span className="text-slate-400 font-sans">وضع التطوير (Debug Mode):</span>
                                <span className="font-bold text-slate-200">{phpInfo.debug_mode}</span>
                            </div>
                        </div>
                    </div>

                    {/* Database & Table Statistics */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
                            <Database className="w-5 h-5 text-blue-400" />
                            <span>إحصائيات جداول قاعدة البيانات</span>
                        </h3>

                        <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1">
                            {dbInfo.tables && dbInfo.tables.length > 0 ? (
                                dbInfo.tables.map((tbl, i) => (
                                    <div key={i} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[#6320EE]" />
                                            <span className="font-mono font-bold text-slate-300">{tbl.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-bold text-slate-100">{tbl.row_count.toLocaleString('en-US')} سجل</span>
                                            <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 font-sans">
                                                {tbl.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-500 text-xs text-center py-6">جداول قاعدة البيانات غير متاحة</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* System Drivers & Services */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
                        <Shield className="w-5 h-5 text-violet-400" />
                        <span>مشغلات الخدمات المعتمدة (System Drivers)</span>
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-slate-500 block mb-1 text-[11px]">Cache Driver</span>
                            <span className="font-bold font-mono text-slate-200">{servicesInfo.cache_driver || 'file'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-slate-500 block mb-1 text-[11px]">Session Driver</span>
                            <span className="font-bold font-mono text-slate-200">{servicesInfo.session_driver || 'file'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-slate-500 block mb-1 text-[11px]">Queue Driver</span>
                            <span className="font-bold font-mono text-slate-200">{servicesInfo.queue_driver || 'sync'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-slate-500 block mb-1 text-[11px]">Mail Driver</span>
                            <span className="font-bold font-mono text-slate-200">{servicesInfo.mail_mailer || 'smtp'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                            <span className="text-slate-500 block mb-1 text-[11px]">Log Channel</span>
                            <span className="font-bold font-mono text-slate-200">{servicesInfo.log_channel || 'stack'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
