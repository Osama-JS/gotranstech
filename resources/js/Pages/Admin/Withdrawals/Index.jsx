import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import StatCard from '../../../Components/StatCard';
import SearchableSelect from '../../../Components/SearchableSelect';
import DatePicker from '../../../Components/DatePicker';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import {
    ArrowDownToLine,
    Download,
    CheckCircle,
    XCircle,
    Calendar,
    FileText,
    Eye,
    ShieldCheck,
    Search,
    Filter,
    RefreshCw,
    Clock,
    DollarSign,
    Building2,
    Layers
} from 'lucide-react';

export default function AdminWithdrawals({ withdrawals, stats, companies = [], filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [companyId, setCompanyId] = useState(filters?.company_id || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [dueDate, setDueDate] = useState('');
    const [adminSignature, setAdminSignature] = useState('مدير عام المنصة');
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.withdrawals.index'), {
            search,
            status,
            company_id: companyId,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setCompanyId('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.withdrawals.index'));
    };

    const handleOpenApprove = (w) => {
        setSelectedWithdrawal(w);
        const defaultDue = new Date();
        defaultDue.setDate(defaultDue.getDate() + 30);
        setDueDate(defaultDue.toISOString().split('T')[0]);
        setApproveModalOpen(true);
    };

    const handleConfirmApprove = (e) => {
        e.preventDefault();
        if (!selectedWithdrawal) return;
        setLoading(true);

        router.post(route('admin.withdrawals.approve', selectedWithdrawal.id), {
            due_date: dueDate,
            admin_signature: adminSignature,
            admin_notes: adminNotes,
        }, {
            onFinish: () => {
                setLoading(false);
                setApproveModalOpen(false);
            },
        });
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!selectedWithdrawal) return;
        setLoading(true);

        router.post(route('admin.withdrawals.reject', selectedWithdrawal.id), {
            rejection_reason: rejectionReason,
        }, {
            onFinish: () => {
                setLoading(false);
                setRejectModalOpen(false);
            },
        });
    };

    const statusOptions = [
        { value: '', label: 'جميع الحالات' },
        { value: 'pending', label: 'قيد المراجعة والاعتماد' },
        { value: 'approved', label: 'معتمد وموقع إلكترونياً' },
        { value: 'rejected', label: 'مرفوض' },
    ];

    const companyOptions = [
        { value: '', label: 'جميع الشركات اللوجستية' },
        ...companies.map(c => ({ value: c.id, label: c.company_name }))
    ];

    return (
        <AuthenticatedLayout title="طلبات سحب رصيد التمويل للشركات">
            <Head title="طلبات سحب الرصيد - إدارة المنصة" />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title="طلبات سحب رصيد التمويل للشركات"
                    subtitle="مراجعة وتوقيع طلبات سحب رصيد المهام المنفذة للشركات اللوجستية وتوليد سندات الدين بصيغة PDF"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'طلبات سحب الرصيد' }
                    ]}
                    icon={ArrowDownToLine}
                    iconColor="text-blue-400"
                    badge={{ text: `${stats?.pending || 0} بانتظار التوقيع`, color: stats?.pending > 0 ? 'amber' : 'blue' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="إجمالي طلبات السحب"
                        value={stats?.total || 0}
                        icon={ArrowDownToLine}
                        color="blue"
                        description="إجمالي السحوبات المرفوعة"
                    />
                    <StatCard
                        title="بانتظار الاعتماد"
                        value={stats?.pending || 0}
                        icon={Clock}
                        color="amber"
                        description={`بقيمة ${Number(stats?.total_pending_amount || 0).toLocaleString('en-US')} ر.س`}
                    />
                    <StatCard
                        title="سحوبات معتمدة"
                        value={stats?.approved || 0}
                        icon={CheckCircle}
                        color="brand"
                        description="تم قيد المديونية وتوقيعها"
                    />
                    <StatCard
                        title="إجمالي المبالغ المسحوبة"
                        value={`${Number(stats?.total_approved_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`}
                        icon={DollarSign}
                        color="purple"
                        description="السيولة المصروفة للشركات"
                    />
                </div>

                {/* Filters Panel */}
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-30 overflow-visible">
                    <form onSubmit={handleFilter} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">بحث سريع</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="رقم الطلب، اسم الشركة، السجل التجاري..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <SearchableSelect
                                label="الحالة"
                                options={statusOptions}
                                value={status}
                                onChange={setStatus}
                                placeholder="اختر الحالة..."
                            />

                            <SearchableSelect
                                label="الشركة اللوجستية"
                                options={companyOptions}
                                value={companyId}
                                onChange={setCompanyId}
                                placeholder="اختر الشركة..."
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
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>تطبيق الفلترة</span>
                                </button>
                                {(search || status || companyId || dateFrom || dateTo) && (
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
                                    <th className="p-4">رقم الطلب</th>
                                    <th className="p-4">الشركة اللوجستية</th>
                                    <th className="p-4">المبلغ المطالب به</th>
                                    <th className="p-4">عدد المهام</th>
                                    <th className="p-4">تاريخ الاستحقاق</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4">مستند العقد (PDF)</th>
                                    <th className="p-4 text-center">الإجراءات والاعتماد</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {withdrawals?.data && withdrawals.data.length > 0 ? (
                                    withdrawals.data.map((w) => {
                                        const amountVal = parseFloat(w.requested_amount || w.total_amount || 0);

                                        return (
                                            <tr key={w.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                                                        {w.request_number}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className="w-4 h-4 text-slate-500" />
                                                        <div>
                                                            <span className="font-bold text-slate-200 block">{w.company?.company_name}</span>
                                                            <span className="text-[11px] text-slate-400 block">{w.company?.contact_person || w.company?.user?.name}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white text-sm">
                                                    {amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                                                </td>
                                                <td className="p-4 font-mono text-slate-300">
                                                    {w.number_of_tasks || w.items_count || 1} مهمة
                                                </td>
                                                <td className="p-4 font-mono text-slate-300">
                                                    {w.due_date ? (
                                                        <span className="text-amber-400 font-semibold">{w.due_date}</span>
                                                    ) : (
                                                        <span className="text-slate-500 italic">بانتظار التحديد</span>
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <Badge status={w.status} />
                                                </td>
                                                <td className="p-4">
                                                    <a
                                                        href={route('admin.withdrawals.pdf', w.id)}
                                                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-violet-600 dark:text-violet-400 border border-slate-200 dark:border-slate-700 transition-all inline-flex items-center gap-1.5 text-xs font-semibold"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>تحميل PDF</span>
                                                    </a>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {w.status === 'pending' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenApprove(w)}
                                                                className="px-3 py-1.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                <span>اعتماد وتوقيع</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedWithdrawal(w);
                                                                    setRejectModalOpen(true);
                                                                }}
                                                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>رفض</span>
                                                            </button>
                                                        </div>
                                                    ) : w.status === 'approved' ? (
                                                        <div className="text-violet-600 dark:text-violet-400 text-[11px] font-medium flex items-center justify-center gap-1">
                                                            <ShieldCheck className="w-3.5 h-3.5" />
                                                            <span>معتمد وموقع إلكترونياً</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-rose-400">
                                                            مرفوض {w.rejection_reason && `(${w.rejection_reason})`}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12 text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <ArrowDownToLine className="w-8 h-8 text-slate-600" />
                                                <p className="text-sm font-semibold">لا توجد طلبات سحب مطابقة لمعايير البحث</p>
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
                        <Pagination links={withdrawals?.links} meta={withdrawals} />
                    </div>
                </div>
            </div>

            {/* Approve Modal with Due Date and Signature */}
            <Modal
                isOpen={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                title="اعتماد طلب السحب وتحديد موعد الاستحقاق والتوقيع"
                maxWidth="lg"
            >
                <form onSubmit={handleConfirmApprove} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                        عند اعتماد هذا الطلب، سيتم خصم مبلغ <strong className="text-white font-mono">{parseFloat(selectedWithdrawal?.requested_amount || selectedWithdrawal?.total_amount || 0).toLocaleString('en-US')} ر.س</strong> من محفظة تمويل شركة ({selectedWithdrawal?.company?.company_name})، وقيد المديونية عليها في محفظة الديون، وإعادة توليد سند العقد بصيغة PDF حاملاً توقيع واعتماد الإدارة وتاريخ الاستحقاق.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            تاريخ استحقاق سداد الدين (Due Date)
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            اسم المفوض بالتوقيع من إدارة المنصة
                        </label>
                        <input
                            type="text"
                            value={adminSignature}
                            onChange={(e) => setAdminSignature(e.target.value)}
                            placeholder="الاسم الكامل لمدير المنصة"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            ملاحظات إدارية (اختياري)
                        </label>
                        <textarea
                            value={adminNotes}
                            onChange={(e) => setAdminNotes(e.target.value)}
                            placeholder="أي شروط إضافية أو ملاحظات تظهر في السند..."
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white h-20 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setApproveModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>اعتماد الطلب وتوقيع الـ PDF</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="رفض طلب سحب الرصيد"
                maxWidth="md"
            >
                <form onSubmit={handleConfirmReject} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">سبب الرفض</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="توضيح سبب رفض سحب الرصيد..."
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white h-24 focus:outline-none focus:border-rose-500"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setRejectModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !rejectionReason.trim()}
                            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>تأكيد الرفض وإلغاء حجز الرصيد</span>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
