import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import StatCard from '../../../Components/StatCard';
import SearchableSelect from '../../../Components/SearchableSelect';
import DatePicker from '../../../Components/DatePicker';
import Pagination from '../../../Components/Pagination';
import Badge from '../../../Components/Badge';
import { 
    Truck, 
    Search, 
    Filter, 
    RefreshCw, 
    Eye, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Layers, 
    DollarSign,
    TrendingUp,
    MapPin,
    Calendar,
    Building2,
    UserCheck,
    XCircle
} from 'lucide-react';

export default function AdminTasks({ tasks, stats, companies = [], investors = [], filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [companyId, setCompanyId] = useState(filters?.company_id || '');
    const [investorId, setInvestorId] = useState(filters?.investor_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.tasks.index'), {
            search,
            status,
            company_id: companyId,
            investor_id: investorId,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setCompanyId('');
        setInvestorId('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.tasks.index'));
    };

    const statusOptions = [
        { value: '', label: 'جميع الحالات' },
        { value: 'open', label: 'مفتوحة للتمويل (Open)' },
        { value: 'funded', label: 'ممولة (Funded)' },
        { value: 'in_transit', label: 'قيد التنفيذ / النقل' },
        { value: 'delivered', label: 'تم التوصيل' },
        { value: 'completed', label: 'مكتملة ومسواة' },
        { value: 'cancelled', label: 'ملغاة' },
        { value: 'expired', label: 'منتهية الصلاحية' },
    ];

    const companyOptions = [
        { value: '', label: 'جميع الشركات اللوجستية' },
        ...companies.map(c => ({ value: c.id, label: c.company_name }))
    ];

    const investorOptions = [
        { value: '', label: 'جميع المستثمرين الممولين' },
        ...investors.map(i => ({ value: i.id, label: i.name }))
    ];

    return (
        <AuthenticatedLayout title="إدارة ومراقبة المهام اللوجستية">
            <Head title="المهام اللوجستية - إدارة المنصة" />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title="إدارة وتتبع المهام اللوجستية"
                    subtitle="مراقبة ومتابعة تدفق المهام اللوجستية الممولة وعمولات المنصة اللحظية"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'المهام اللوجستية' }
                    ]}
                    icon={Truck}
                    iconColor="text-blue-400"
                    badge={{ text: `${stats?.total || 0} مهمة مسجلة`, color: 'blue' }}
                />

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="إجمالي المهام"
                        value={stats?.total || 0}
                        icon={Layers}
                        color="blue"
                        description="إجمالي المهام بالنظام"
                    />
                    <StatCard
                        title="متاحة للتمويل"
                        value={stats?.open || 0}
                        icon={Clock}
                        color="amber"
                        description="في انتظار ممول"
                    />
                    <StatCard
                        title="مهام ممولة ونشطة"
                        value={stats?.funded || 0}
                        icon={TrendingUp}
                        color="brand"
                        description="تم تأمين رأس مالها"
                    />
                    <StatCard
                        title="عمولة المنصة الإجمالية"
                        value={`${Number(stats?.total_platform_commission || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`}
                        icon={DollarSign}
                        color="purple"
                        description="أرباح المنصة المحققة"
                    />
                </div>

                {/* Advanced Filters Panel */}
                <div className="bg-slate-900/80 dark:bg-slate-900/80 bg-white backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-30 overflow-visible">
                    <form onSubmit={handleFilter} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">بحث سريع</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="رقم المهمة، المسار، المدينة..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <SearchableSelect
                                label="حالة المهمة"
                                options={statusOptions}
                                value={status}
                                onChange={setStatus}
                                placeholder="اختر الحالة..."
                            />

                            {/* Company */}
                            <SearchableSelect
                                label="الشركة اللوجستية"
                                options={companyOptions}
                                value={companyId}
                                onChange={setCompanyId}
                                placeholder="اختر الشركة..."
                            />

                            {/* Investor */}
                            <SearchableSelect
                                label="المستثمر الممول"
                                options={investorOptions}
                                value={investorId}
                                onChange={setInvestorId}
                                placeholder="اختر المستثمر..."
                            />
                        </div>

                        {/* Date Range & Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 items-end">
                            <DatePicker
                                label="تاريخ التسجيل من"
                                value={dateFrom}
                                onChange={setDateFrom}
                                placeholder="من تاريخ..."
                            />

                            <DatePicker
                                label="تاريخ التسجيل إلى"
                                value={dateTo}
                                onChange={setDateTo}
                                placeholder="إلى تاريخ..."
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>تطبيق الفلترة</span>
                                </button>
                                {(search || status || companyId || investorId || dateFrom || dateTo) && (
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

                {/* Tasks Table */}
                <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">رقم المهمة</th>
                                    <th className="p-4">الشركة اللوجستية</th>
                                    <th className="p-4">العنوان والمسار</th>
                                    <th className="p-4">مبلغ التمويل</th>
                                    <th className="p-4">عمولة المنصة</th>
                                    <th className="p-4">المستثمر الممول</th>
                                    <th className="p-4">ربح المستثمر</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4">تاريخ الإنشاء</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {tasks?.data && tasks.data.length > 0 ? (
                                    tasks.data.map((task) => {
                                        const amountVal = parseFloat(task.funding_amount || task.amount || 0);
                                        const platformFee = parseFloat(task.platform_commission_amount || 0);
                                        const investorProfit = task.investment ? parseFloat(task.investment.investor_commission_amount || 0) : null;

                                        return (
                                            <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                                                        {task.task_number}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-slate-500" />
                                                        <span className="font-semibold text-slate-200">
                                                            {task.company?.company_name || 'غير محدد'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-0.5">
                                                        <span className="font-bold text-slate-100 block">{task.title}</span>
                                                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                                            <MapPin className="w-3 h-3 text-slate-500" />
                                                            <span>{task.pickup_city || 'المصدر'}</span>
                                                            <span className="text-slate-600">←</span>
                                                            <span>{task.dropoff_city || 'الوجهة'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white">
                                                    {amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                                                </td>
                                                <td className="p-4 font-mono font-bold text-violet-400">
                                                    {platformFee.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                                                </td>
                                                <td className="p-4">
                                                    {task.funded_by_investor ? (
                                                        <div className="flex items-center gap-1.5 text-violet-400 font-medium">
                                                            <UserCheck className="w-3.5 h-3.5" />
                                                            <span>{task.funded_by_investor.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-500 italic">في الانتظار...</span>
                                                    )}
                                                </td>
                                                <td className="p-4 font-mono">
                                                    {investorProfit !== null ? (
                                                        <span className="text-violet-400 font-bold">
                                                            +{investorProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600">-</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <Badge status={task.status} />
                                                </td>
                                                <td className="p-4 text-slate-400 text-[11px] font-mono">
                                                    {new Date(task.created_at).toLocaleDateString('ar-SA')}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-12 text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Truck className="w-8 h-8 text-slate-600" />
                                                <p className="text-sm font-semibold">لا توجد مهام مطابقة لمعايير البحث</p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-2 text-xs text-blue-400 hover:text-blue-300 underline"
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
                        <Pagination links={tasks?.links} meta={tasks} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
