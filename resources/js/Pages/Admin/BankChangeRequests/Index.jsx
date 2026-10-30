import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Modal from '../../../Components/Modal';
import Pagination from '../../../Components/Pagination';
import Select2 from '../../../Components/Select2';
import { 
    Landmark, 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertTriangle, 
    Building2, 
    User, 
    FileText, 
    ExternalLink, 
    Eye, 
    ArrowRight,
    ShieldCheck, 
    Check, 
    X,
    Calendar,
    ArrowLeftRight,
    Download
} from 'lucide-react';

export default function AdminBankChangeRequestsIndex({ requests = { data: [] }, stats = {}, filters = {}, banks = [] }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [userTypeFilter, setUserTypeFilter] = useState(filters.user_type || 'all');

    // Modals
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedReq, setSelectedReq] = useState(null);

    // Reject Form
    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting, reset: resetReject, errors: rejectErrors } = useForm({
        rejection_reason: '',
    });

    const [approving, setApproving] = useState(false);

    const handleApplyFilters = () => {
        router.get(route('admin.bank-change-requests.index'), {
            search: searchTerm || undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            user_type: userTypeFilter !== 'all' ? userTypeFilter : undefined,
        }, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setUserTypeFilter('all');
        router.get(route('admin.bank-change-requests.index'));
    };

    const openApproveModal = (req) => {
        setSelectedReq(req);
        setApproveModalOpen(true);
    };

    const handleConfirmApprove = () => {
        if (!selectedReq) return;
        setApproving(true);
        router.post(route('admin.bank-change-requests.approve', selectedReq.id), {}, {
            onSuccess: () => {
                setApproveModalOpen(false);
                setSelectedReq(null);
                setApproving(false);
            },
            onError: () => {
                setApproving(false);
            }
        });
    };

    const openRejectModal = (req) => {
        setSelectedReq(req);
        resetReject();
        setRejectModalOpen(true);
    };

    const handleConfirmReject = (e) => {
        e.preventDefault();
        if (!selectedReq) return;
        postReject(route('admin.bank-change-requests.reject', selectedReq.id), {
            onSuccess: () => {
                setRejectModalOpen(false);
                setSelectedReq(null);
                resetReject();
            }
        });
    };

    const openDetailsModal = (req) => {
        setSelectedReq(req);
        setDetailsModalOpen(true);
    };

    const formatIban = (iban) => {
        if (!iban) return '—';
        return iban.replace(/(.{4})/g, '$1 ').trim();
    };

    return (
        <AuthenticatedLayout>
            <Head title="طلبات تغيير الحسابات البنكية المعتمدة" />

            <div className="space-y-6">
                <AdminPageHeader
                    title="طلبات تغيير الحسابات البنكية المعتمدة"
                    description="تدقيق ومراجعة طلبات تغيير الحسابات البنكية للمستثمرين والشركات مع التحديث التلقائي للملف المعتمد عند الموافقة."
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'العمليات والتمويل' },
                        { label: 'تغيير الحسابات البنكية' }
                    ]}
                />

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-500">إجمالي الطلبات</span>
                            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                                <Landmark className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold font-mono text-slate-800 dark:text-white">
                            {stats.total || 0}
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">كافة الطلبات المسجلة في المنصة</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl p-4 shadow-sm relative overflow-hidden">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">بانتظار المراجعة والاعتماد</span>
                            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center relative">
                                <Clock className="w-4 h-4" />
                                {stats.pending > 0 && (
                                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
                                )}
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
                            {stats.pending || 0}
                        </div>
                        <span className="text-[11px] text-amber-600/70 dark:text-amber-400/70 mt-1 block">تتطلب تدقيق وموافقة الإدارة</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">الطلبات المعتمدة</span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {stats.approved || 0}
                        </div>
                        <span className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 mt-1 block">تم تحديث بياناتهم الرسمية بنجاح</span>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-rose-200/60 dark:border-rose-900/40 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">الطلبات المرفوضة</span>
                            <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                                <XCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
                            {stats.rejected || 0}
                        </div>
                        <span className="text-[11px] text-rose-600/70 dark:text-rose-400/70 mt-1 block">تم رفضها مع ذكر الأسباب للعميل</span>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                البحث
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="اسم العميل، البريد، الآيبان..."
                                    className="w-full pl-3 pr-9 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-slate-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                حالة الطلب
                            </label>
                            <Select2
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                options={[
                                    { value: 'all', label: 'كافة الحالات' },
                                    { value: 'pending', label: 'بانتظار المراجعة (قيد الانتظار)' },
                                    { value: 'approved', label: 'معتمد' },
                                    { value: 'rejected', label: 'مرفوض' },
                                ]}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                نوع العميل
                            </label>
                            <Select2
                                value={userTypeFilter}
                                onChange={(val) => setUserTypeFilter(val)}
                                options={[
                                    { value: 'all', label: 'الكل (مستثمرين وشركات)' },
                                    { value: 'investor', label: 'مستثمر (محفظة أرباح)' },
                                    { value: 'company', label: 'شركة (محفظة تمويل)' },
                                ]}
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="flex-1 py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm shadow-blue-500/20"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>تطبيق الفلترة</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                title="إعادة ضبط الفلاتر"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500">
                                <tr>
                                    <th className="py-3 px-4 font-semibold">مقدم الطلب</th>
                                    <th className="py-3 px-4 font-semibold">الحساب البنكي السابق</th>
                                    <th className="py-3 px-4 font-semibold">الحساب البنكي الجديد المطلوب</th>
                                    <th className="py-3 px-4 font-semibold">السبب والمرفقات</th>
                                    <th className="py-3 px-4 font-semibold">الحالة والتدقيق</th>
                                    <th className="py-3 px-4 font-semibold text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                                {requests.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-slate-400">
                                            <Landmark className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                                            <p className="font-medium text-sm">لا توجد طلبات تغيير حسابات بنكية مطابقة للبحث</p>
                                        </td>
                                    </tr>
                                ) : (
                                    requests.data.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                            {/* User Info */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                        req.user_type === 'company' 
                                                            ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' 
                                                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                        {req.user_type === 'company' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <span>{req.user?.name || 'مستخدم غير معروف'}</span>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                                req.user_type === 'company'
                                                                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                                                    : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                                            }`}>
                                                                {req.user_type === 'company' ? 'شركة' : 'مستثمر'}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] text-slate-400 block font-mono">
                                                            {req.user?.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Current Bank */}
                                            <td className="py-3.5 px-4 font-mono">
                                                <div className="space-y-0.5">
                                                    <div className="font-bold text-slate-800 dark:text-slate-200">
                                                        {req.current_bank?.name || req.current_bank_name || 'غير مسجل'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 tracking-wider">
                                                        {req.current_iban ? formatIban(req.current_iban) : '—'}
                                                    </div>
                                                    {req.current_account_holder && (
                                                        <div className="text-[10px] text-slate-400">
                                                            {req.current_account_holder}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* New Bank */}
                                            <td className="py-3.5 px-4 font-mono">
                                                <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-800/40 space-y-0.5">
                                                    <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1">
                                                        <span>{req.new_bank?.name || req.new_bank_name}</span>
                                                        {req.new_bank?.code && (
                                                            <span className="text-[9px] px-1 py-0.2 rounded bg-blue-200/50 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                                                                {req.new_bank.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                                                        {formatIban(req.new_iban)}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                                        المستفيد: {req.new_account_holder}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Reason & Attachment */}
                                            <td className="py-3.5 px-4">
                                                <div className="max-w-[200px] space-y-1">
                                                    <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2" title={req.reason}>
                                                        {req.reason || '—'}
                                                    </p>
                                                    {req.certificate_file && (
                                                        <a
                                                            href={route('bank-account.certificate.view', req.id)}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                                                        >
                                                            <Download className="w-3 h-3" />
                                                            <span>شهادة الآيبان / الخطاب</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="py-3.5 px-4">
                                                {req.status === 'pending' && (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>بانتظار الاعتماد</span>
                                                    </span>
                                                )}
                                                {req.status === 'approved' && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                            <span>معتمد</span>
                                                        </span>
                                                        {req.reviewer && (
                                                            <span className="block text-[10px] text-slate-400">
                                                                بواسطة: {req.reviewer.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {req.status === 'rejected' && (
                                                    <div className="space-y-0.5">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                                                            <XCircle className="w-3.5 h-3.5" />
                                                            <span>مرفوض</span>
                                                        </span>
                                                        {req.rejection_reason && (
                                                            <p className="text-[10px] text-rose-500 line-clamp-1 max-w-[150px]" title={req.rejection_reason}>
                                                                السبب: {req.rejection_reason}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{new Date(req.created_at).toLocaleDateString('ar-SA')}</span>
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {req.status === 'pending' && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openApproveModal(req)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer"
                                                                title="اعتماد وتحديث الحساب"
                                                            >
                                                                <Check className="w-3.5 h-3.5" />
                                                                <span>اعتماد</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => openRejectModal(req)}
                                                                className="px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                                                                title="رفض الطلب مع السبب"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                                <span>رفض</span>
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => openDetailsModal(req)}
                                                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                                        title="استعراض التفاصيل"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {requests.data.length > 0 && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <Pagination links={requests.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Approve Confirmation Modal */}
            <Modal
                isOpen={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                title="تأكيد اعتماد وتفعيل الحساب البنكي الجديد"
                maxWidth="md"
            >
                {selectedReq && (
                    <div className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
                            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                                <p className="font-bold">هل أنت متأكد من رغبتك في اعتماد وتفعيل هذا الحساب البنكي؟</p>
                                <p className="mt-1">
                                    الموافقة ستقوم تلقائياً بتحديث الحساب البنكي الرسمي في ملف العميل ({selectedReq.user?.name}) وقفله لكافة عمليات الصرف والتحويل اللاحقة.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                            <div>
                                <span className="text-slate-400 block text-[10px]">البنك الجديد المعتمد:</span>
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {selectedReq.new_bank?.name || selectedReq.new_bank_name} ({selectedReq.new_bank?.code})
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">رقم الآيبان (IBAN):</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                                    {formatIban(selectedReq.new_iban)}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block text-[10px]">اسم المستفيد:</span>
                                <span className="font-bold text-slate-800 dark:text-white">
                                    {selectedReq.new_account_holder}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                إلغاء
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmApprove}
                                disabled={approving}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {approving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>تأكيد الاعتماد والتفعيل</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={rejectModalOpen}
                onClose={() => setRejectModalOpen(false)}
                title="رفض طلب تغيير الحساب البنكي"
                maxWidth="md"
            >
                {selectedReq && (
                    <form onSubmit={handleConfirmReject} className="space-y-4">
                        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-400">
                            <p className="font-bold">سيتم إشعار العميل برفض الطلب مع إرسال سبب الرفض المحدد.</p>
                            <p className="mt-1 text-[11px]">
                                سيستمر حساب العميل الحالي معتمداً كما هو بدون أي تغيير.
                            </p>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                سبب الرفض (إلزامي للعميل) *
                            </label>
                            <textarea
                                rows={3}
                                value={rejectData.rejection_reason}
                                onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                placeholder="مثال: اسم صاحب الحساب لا يطابق الهوية الوطنية، أو المستند المرفق غير واضح..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                                required
                            />
                            {rejectErrors.rejection_reason && (
                                <p className="text-[10px] text-rose-500 mt-1">{rejectErrors.rejection_reason}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={rejecting || !rejectData.rejection_reason}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {rejecting ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <X className="w-4 h-4" />
                                        <span>تأكيد الرفض والإشعار</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Full Details Modal */}
            <Modal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                title="تفاصيل طلب تغيير الحساب البنكي"
                maxWidth="lg"
            >
                {selectedReq && (
                    <div className="space-y-4">
                        {/* Comparison Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Current Bank Box */}
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                                    الحساب البنكي السابق
                                </span>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">اسم البنك:</span>
                                    <span className="font-bold text-xs text-slate-800 dark:text-white">
                                        {selectedReq.current_bank?.name || selectedReq.current_bank_name || 'غير مسجل'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">رقم الآيبان:</span>
                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {selectedReq.current_iban ? formatIban(selectedReq.current_iban) : '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">اسم صاحب الحساب:</span>
                                    <span className="text-xs font-medium text-slate-800 dark:text-white">
                                        {selectedReq.current_account_holder || '—'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block">المدينة / الدولة:</span>
                                    <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                        {selectedReq.current_bank_city || 'Riyadh'} ({selectedReq.current_bank_country || 'SA'})
                                    </span>
                                </div>
                            </div>

                            {/* New Bank Box */}
                            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                                    الحساب البنكي الجديد المطلوب
                                </span>
                                <div>
                                    <span className="text-[11px] text-blue-400 block">اسم البنك:</span>
                                    <span className="font-bold text-xs text-blue-700 dark:text-blue-300">
                                        {selectedReq.new_bank?.name || selectedReq.new_bank_name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-blue-400 block">رقم الآيبان:</span>
                                    <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                                        {formatIban(selectedReq.new_iban)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-blue-400 block">اسم صاحب الحساب:</span>
                                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                                        {selectedReq.new_account_holder}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[11px] text-blue-400 block">المدينة / الدولة:</span>
                                    <span className="text-xs font-mono text-blue-700 dark:text-blue-300">
                                        {selectedReq.new_bank_city || 'Riyadh'} ({selectedReq.new_bank_country || 'SA'})
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reason Box */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block">سبب طلب التغيير:</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                {selectedReq.reason || 'لا يوجد سبب مدخل'}
                            </p>
                        </div>

                        {/* Attachment */}
                        {selectedReq.certificate_file && (
                            <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 font-bold">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    <span>مرفق شهادة الآيبان البنكي / الخطاب الرسمي</span>
                                </div>
                                <a
                                    href={route('bank-account.certificate.view', selectedReq.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>تحميل المستند</span>
                                </a>
                            </div>
                        )}

                        <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDetailsModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}

