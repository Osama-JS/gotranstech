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

export default function AdminDashboard({ metrics, recentTasks = [], recentTransactions = [], recentAudits = [] }) {
    return (
        <AuthenticatedLayout>
            <Head title="لوحة تحكم الإدارة العامة" />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title="لوحة القيادة والتحكم المركزية"
                    subtitle="مؤشرات الأداء اللحظية، مراقبة تدفق السيولة والمهام اللوجستية، وسجل التدقيق المباشر"
                    breadcrumbs={[
                        { label: 'الرئيسية' }
                    ]}
                    icon={LayoutDashboard}
                    iconColor="text-violet-400"
                    badge={{ text: 'نظام متصل ومباشر', color: 'brand' }}
                />

                {/* Top KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="إجمالي المستثمرين"
                        value={metrics?.total_investors || 0}
                        icon={Users}
                        color="brand"
                        description="مستثمرون مسجلون وموثقون"
                    />
                    <StatCard
                        title="الشركات اللوجستية"
                        value={metrics?.total_companies || 0}
                        icon={Building2}
                        color="orange"
                        description="شركاء الخدمات اللوجستية"
                    />
                    <StatCard
                        title="أرباح عمولات المنصة"
                        value={`${Number(metrics?.total_platform_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`}
                        icon={TrendingUp}
                        color="brand"
                        description={`من ${metrics?.total_tasks_funded || 0} مهمة ممولة`}
                    />
                    <StatCard
                        title="بانتظار الاعتماد"
                        value={`${metrics?.pending_bank_deposits || 0} إيداع • ${metrics?.pending_withdrawals || 0} سحب`}
                        icon={Receipt}
                        color="orange"
                        description="حوالات وسحوبات معلقة"
                    />
                </div>

                {/* Recent Logistics Tasks Table */}
                <div className="glass-panel p-6 rounded-3xl border border-violet-900/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                                <Truck className="w-4 h-4" />
                            </div>
                            <h3 className="font-bold text-white text-sm">أحدث المهام اللوجستية المسجلة</h3>
                        </div>
                        <Link href={route('admin.tasks.index')} className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors">
                            <span>عرض كافة المهام</span>
                            <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-3.5">رقم المهمة</th>
                                    <th className="p-3.5">الشركة اللوجستية</th>
                                    <th className="p-3.5">العنوان والمسار</th>
                                    <th className="p-3.5">مبلغ التمويل</th>
                                    <th className="p-3.5">المستثمر الممول</th>
                                    <th className="p-3.5">الحالة</th>
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
                                                {parseFloat(task.funding_amount || task.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                                            </td>
                                            <td className="p-3.5 text-slate-300">
                                                {task.funded_by_investor ? (
                                                    <span className="text-violet-400 font-medium">{task.funded_by_investor.name}</span>
                                                ) : (
                                                    <span className="text-slate-500 italic">بانتظار ممول...</span>
                                                )}
                                            </td>
                                            <td className="p-3.5"><Badge status={task.status} /></td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-8 text-slate-500">لا توجد مهام مسجلة حديثاً</td>
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
                                <h3 className="font-bold text-white text-sm">سجل التدقيق والرقابة اللحظي</h3>
                            </div>
                            <Link href={route('admin.audit.index')} className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1">
                                <span>عرض كامل السجل</span>
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
                                                <span className="text-slate-200 font-semibold">{log.user?.name || 'النظام التلقائي'}</span>
                                            </div>
                                            <p className="text-slate-400 text-xs leading-relaxed">{log.description}</p>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                            {new Date(log.created_at).toLocaleTimeString('ar-SA')}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-slate-500 text-xs">لا توجد سجلات تدقيق حديثة</p>
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
                                <h3 className="font-bold text-white text-sm">آخر الحركات المحاسبية للمحافظ</h3>
                            </div>
                        </div>

                        <div className="space-y-2.5">
                            {recentTransactions && recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div key={tx.id} className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 text-xs flex items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                                        <div>
                                            <span className="font-bold text-slate-200 block truncate max-w-[220px]">{tx.description}</span>
                                            <span className="text-[10px] text-slate-500 block">{tx.user?.name} • {new Date(tx.created_at).toLocaleString('ar-SA')}</span>
                                        </div>
                                        <span className={`font-mono font-bold text-xs ${
                                            parseFloat(tx.amount) > 0 ? 'text-violet-400' : 'text-slate-300'
                                        }`}>
                                            {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toLocaleString('en-US')}` : parseFloat(tx.amount).toLocaleString('en-US')} ر.س
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-6 text-slate-500 text-xs">لا توجد حركات محاسبية حديثة</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
