import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Modal from '../../../Components/Modal';
import Pagination from '../../../Components/Pagination';
import Select2 from '../../../Components/Select2';
import { 
    Zap, 
    Search, 
    Filter, 
    RefreshCw, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    AlertTriangle, 
    Building2, 
    Landmark, 
    ShieldCheck, 
    Lock, 
    ExternalLink, 
    Eye, 
    User, 
    Calendar, 
    DollarSign,
    ArrowUpRight,
    ArrowDownLeft
} from 'lucide-react';

export default function AdminPayoutsIndex({ payouts = { data: [] }, metrics = {}, banks = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [typeFilter, setTypeFilter] = useState(filters.payout_type || '');
    const [bankFilter, setBankFilter] = useState(filters.bank_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Action Modals State
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);

    // Form for Approve
    const { data: approveData, setData: setApproveData, post: postApprove, processing: approving, reset: resetApprove, errors: approveErrors } = useForm({
        password: '',
    });

    // Form for Reject
    const { data: rejectData, setData: setRejectData, post: postReject, processing: rejecting, reset: resetReject, errors: rejectErrors } = useForm({
        rejection_reason: '',
    });

    const [checkingStatusId, setCheckingStatusId] = useState(null);

    const handleApplyFilters = () => {
        router.get(route('admin.payouts.index'), {
            search: searchTerm || undefined,
            status: statusFilter || undefined,
            payout_type: typeFilter || undefined,
            bank_id: bankFilter || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
        }, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setTypeFilter('');
        setBankFilter('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.payouts.index'), {}, { replace: true });
    };

    const openApproveModal = (payout) => {
        setSelectedPayout(payout);
        resetApprove();
        setApproveModalOpen(true);
    };

    const handleApproveSubmit = (e) => {
        e.preventDefault();
        if (!selectedPayout) return;
        postApprove(route('admin.payouts.approve', selectedPayout.id), {
            onSuccess: () => {
                setApproveModalOpen(false);
                setSelectedPayout(null);
            }
        });
    };

    const openRejectModal = (payout) => {
        setSelectedPayout(payout);
        resetReject();
        setRejectModalOpen(true);
    };

    const handleRejectSubmit = (e) => {
        e.preventDefault();
        if (!selectedPayout) return;
        postReject(route('admin.payouts.reject', selectedPayout.id), {
            onSuccess: () => {
                setRejectModalOpen(false);
                setSelectedPayout(null);
            }
        });
    };

    const handleCheckStatus = (payout) => {
        setCheckingStatusId(payout.id);
        router.post(route('admin.payouts.check-status', payout.id), {}, {
            preserveScroll: true,
            onFinish: () => setCheckingStatusId(null)
        });
    };

    const openDetailsModal = (payout) => {
        setSelectedPayout(payout);
        setDetailsModalOpen(true);
    };

    return (
        <AuthenticatedLayout title="إدارة التحويلات البنكية الفورية (HyperPay Payouts)">
            <Head title="إدارة التحويلات البنكية الفورية (HyperPay Payouts)" />

            <div className="space-y-6 pb-12 max-w-7xl mx-auto">
                {/* Page Header */}
                <AdminPageHeader
                    title="إدارة التحويلات البنكية الفورية (HyperPay Payouts)"
                    subtitle="مراجعة واعتماد طلبات الصرف الفوري للمستثمرين وشركات النقل عبر نظام سريع IPS والتحقق من الآيبان"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'التحويلات البنكية الفورية' }
                    ]}
                    icon={Zap}
                    iconColor="text-emerald-400"
                    badge={{ text: 'سريع IPS - فوري 24/7', color: 'success' }}
                />

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-slate-900/60 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-amber-400">بانتظار الاعتماد المالي</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                                <Clock className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">
                            {Number(metrics.pending_amount || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
                        </div>
                        <span className="text-[11px] text-amber-300 font-medium">{metrics.pending_count || 0} طلب سحب معلق بانتظار مصادقة المدير</span>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-blue-500/20 bg-slate-900/60 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-blue-400">قيد المعالجة البنكية (سريع)</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <RefreshCw className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">
                            {Number(metrics.processing_amount || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
                        </div>
                        <span className="text-[11px] text-blue-300 font-medium">{metrics.processing_count || 0} حوالة أرسلت للبنك بانتظار تأكيد التسوية</span>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-slate-900/60 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-emerald-400">تم التحويل بنجاح</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">
                            {Number(metrics.completed_amount || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
                        </div>
                        <span className="text-[11px] text-emerald-300 font-medium">{metrics.completed_count || 0} عملية سحب مكتملة ومقيدة بالدفاتر</span>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-rose-500/20 bg-slate-900/60 shadow-xl relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-rose-400">عمليات مرفوضة / متعثرة</span>
                            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
                                <XCircle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-white mb-1">
                            {metrics.failed_count || 0} <span className="text-xs font-normal text-slate-400">عملية</span>
                        </div>
                        <span className="text-[11px] text-rose-300 font-medium">تم رفضها إدارياً أو تعثرت بنكياً واستردت مبالغها</span>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="lg:col-span-2">
                            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">البحث السريع</label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                                    placeholder="رقم المرجع، اسم المستفيد، الجوال..."
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pr-10 pl-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">حالة الحوالة</label>
                            <Select2
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val)}
                                options={[
                                    { value: '', label: 'كافة الحالات' },
                                    { value: 'pending_approval', label: 'بانتظار الاعتماد المالي' },
                                    { value: 'processing', label: 'قيد المعالجة البنكية' },
                                    { value: 'completed', label: 'تم التحويل بنجاح' },
                                    { value: 'rejected', label: 'مرفوض إدارياً' },
                                    { value: 'failed', label: 'فشل بنكياً' },
                                ]}
                                placeholder="اختر الحالة..."
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">جهة السحب</label>
                            <Select2
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val)}
                                options={[
                                    { value: '', label: 'كافة الجهات' },
                                    { value: 'investor_commission', label: 'أرباح مستثمر (Commission)' },
                                    { value: 'company_funding', label: 'تمويل شركة نقل (Company)' },
                                ]}
                                placeholder="اختر النوع..."
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-bold text-slate-400 block mb-1.5">البنك المستلم</label>
                            <Select2
                                value={bankFilter}
                                onChange={(val) => setBankFilter(val)}
                                options={[
                                    { value: '', label: 'كافة البنوك المعتمدة' },
                                    ...banks.map(b => ({ value: String(b.id), label: `${b.name} (${b.code})` }))
                                ]}
                                placeholder="اختر البنك..."
                            />
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={handleApplyFilters}
                                className="flex-1 py-2 bg-[#6320EE] hover:bg-[#5218cc] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>فلترة</span>
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
                                title="إعادة تعيين"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-xs">
                            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                                <tr>
                                    <th className="py-3.5 px-4">مرجع الحوالة</th>
                                    <th className="py-3.5 px-4">المستفيد / الحساب</th>
                                    <th className="py-3.5 px-4">البنك وكود BIC</th>
                                    <th className="py-3.5 px-4">المبلغ</th>
                                    <th className="py-3.5 px-4">الحالة</th>
                                    <th className="py-3.5 px-4">التاريخ والتدقيق</th>
                                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                {payouts.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="py-12 text-center text-slate-500">
                                            لا توجد طلبات تحويل بنكي مطابقة لمعايير البحث الحالية
                                        </td>
                                    </tr>
                                ) : (
                                    payouts.data.map((p) => {
                                        const details = p.beneficiary_details || {};
                                        const beneficiaryName = details.beneficiary_name || p.user?.name || '—';
                                        const bankName = details.bank_name || p.bank?.name || '—';
                                        const iban = details.iban || '—';
                                        const bic = details.bic || p.bank?.code || '—';

                                        return (
                                            <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                                                <td className="py-3.5 px-4">
                                                    <div className="font-mono font-bold text-white text-xs">{p.reference_id}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {p.payout_type === 'investor_commission' ? (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                                                أرباح مستثمر
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                                تمويل شركة
                                                            </span>
                                                        )}
                                                        {p.payout_id && (
                                                            <span className="text-[10px] text-slate-400 font-mono">
                                                                #{p.payout_id}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="font-bold text-white text-xs">{beneficiaryName}</div>
                                                    <div className="text-[11px] text-slate-400 font-mono tracking-wider">{iban}</div>
                                                    {p.user && (
                                                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <User className="w-3 h-3" />
                                                            <span>{p.user.name} ({p.user.phone || p.user.email})</span>
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="text-xs text-slate-200 font-medium">{bankName}</div>
                                                    <div className="mt-0.5">
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-violet-300 border border-slate-700">
                                                            {bic}
                                                        </span>
                                                    </div>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <div className="text-sm font-black text-emerald-400 font-mono">
                                                        {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-bold">{p.currency || 'SAR'}</span>
                                                </td>

                                                <td className="py-3.5 px-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                                                        p.status === 'completed'
                                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                                            : p.status === 'processing'
                                                            ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                                                            : p.status === 'pending_approval'
                                                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                                    }`}>
                                                        {p.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                                                        {p.status === 'processing' && <RefreshCw className="w-3 h-3 animate-spin" />}
                                                        {p.status === 'pending_approval' && <Clock className="w-3 h-3" />}
                                                        {p.status === 'rejected' && <XCircle className="w-3 h-3" />}
                                                        {p.status === 'failed' && <AlertTriangle className="w-3 h-3" />}
                                                        <span>{p.status_badge?.label || p.status}</span>
                                                    </span>
                                                    {p.failure_reason && (
                                                        <div className="text-[10px] text-rose-400 mt-1 max-w-[180px] truncate" title={p.failure_reason}>
                                                            {p.failure_reason}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-[11px] text-slate-400">
                                                    <div className="flex items-center gap-1 font-mono text-[10px]">
                                                        <Calendar className="w-3 h-3 text-slate-500" />
                                                        <span>{new Date(p.created_at).toLocaleDateString('ar-SA')}</span>
                                                    </div>
                                                    {p.approver && (
                                                        <div className="text-[10px] text-emerald-400 mt-0.5">
                                                            اعتماد: {p.approver.name}
                                                        </div>
                                                    )}
                                                    {p.rejector && (
                                                        <div className="text-[10px] text-rose-400 mt-0.5">
                                                            رفض: {p.rejector.name}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="py-3.5 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Details button */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openDetailsModal(p)}
                                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                                                            title="عرض التفاصيل الكاملة"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Approve Button */}
                                                        {p.status === 'pending_approval' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openApproveModal(p)}
                                                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1 cursor-pointer"
                                                                title="اعتماد وصرف فوري عبر سريع"
                                                            >
                                                                <Zap className="w-3.5 h-3.5" />
                                                                <span>اعتماد وصرف</span>
                                                            </button>
                                                        )}

                                                        {/* Reject Button */}
                                                        {p.status === 'pending_approval' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openRejectModal(p)}
                                                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                                                title="رفض الطلب"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                            </button>
                                                        )}

                                                        {/* Check Status Button for processing or pending */}
                                                        {p.status === 'processing' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCheckStatus(p)}
                                                                disabled={checkingStatusId === p.id}
                                                                className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-colors cursor-pointer disabled:opacity-50"
                                                                title="استعلام لحظي من البنك"
                                                            >
                                                                <RefreshCw className={`w-3.5 h-3.5 ${checkingStatusId === p.id ? 'animate-spin' : ''}`} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {payouts.links && payouts.links.length > 3 && (
                        <div className="p-4 border-t border-slate-800">
                            <Pagination links={payouts.links} />
                        </div>
                    )}
                </div>
            </div>

            {/* Manager Password Approval Modal */}
            <Modal isOpen={approveModalOpen} onClose={() => setApproveModalOpen(false)} maxWidth="md">
                {selectedPayout && (
                    <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <ShieldCheck className="w-5 h-5" />
                                <h3 className="font-bold text-white text-sm">تأكيد مصادقة وصرف الحوالة البنكية</h3>
                            </div>
                            <button type="button" onClick={() => setApproveModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                            <div className="flex justify-between text-slate-300">
                                <span>المستفيد:</span>
                                <span className="font-bold text-white">{selectedPayout.beneficiary_details?.beneficiary_name || selectedPayout.user?.name}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>البنك المستلم:</span>
                                <span className="font-bold text-violet-300">{selectedPayout.beneficiary_details?.bank_name || selectedPayout.bank?.name}</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                                <span>الآيبان البنكي:</span>
                                <span className="font-mono text-slate-200">{selectedPayout.beneficiary_details?.iban}</span>
                            </div>
                            <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800/80">
                                <span className="font-bold">المبلغ المحول:</span>
                                <span className="font-black text-emerald-400 text-sm">{Number(selectedPayout.amount).toLocaleString()} SAR</span>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-right">
                            <label className="text-xs font-semibold text-slate-300 block">
                                كلمة مرور المشرف (Security Authorization) *
                            </label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                                <input
                                    type="password"
                                    required
                                    value={approveData.password}
                                    onChange={(e) => setApproveData('password', e.target.value)}
                                    placeholder="أدخل كلمة مرور حسابك الإداري..."
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pr-10 pl-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                                    autoFocus
                                />
                            </div>
                            {approveErrors.password && (
                                <span className="text-[11px] text-rose-400">{approveErrors.password}</span>
                            )}
                            <span className="text-[10px] text-slate-400 block mt-1">
                                سيتم إرسال أمر التحويل البنكي الفوري مباشرة عبر بوابة HyperPay وقناة سريع IPS لحساب المستفيد.
                            </span>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setApproveModalOpen(false)}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                            >
                                تراجع
                            </button>
                            <button
                                type="submit"
                                disabled={approving || !approveData.password}
                                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {approving ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-3.5 h-3.5" />
                                        <span>تأكيد والصرف الآن</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Rejection Modal */}
            <Modal isOpen={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="md">
                {selectedPayout && (
                    <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-rose-400">
                                <XCircle className="w-5 h-5" />
                                <h3 className="font-bold text-white text-sm">رفض طلب التحويل البنكي</h3>
                            </div>
                            <button type="button" onClick={() => setRejectModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            سيتم رفض طلب التحويل البنكي للمرجع <span className="font-mono font-bold text-white">{selectedPayout.reference_id}</span> وإعادة مبلغ <span className="text-emerald-400 font-bold">{selectedPayout.amount} SAR</span> تلقائياً إلى محفظة المستفيد.
                        </p>

                        <div className="space-y-1.5 text-right">
                            <label className="text-xs font-semibold text-slate-300 block">سبب الرفض البنكي / الإداري *</label>
                            <textarea
                                required
                                rows={3}
                                value={rejectData.rejection_reason}
                                onChange={(e) => setRejectData('rejection_reason', e.target.value)}
                                placeholder="مثال: تعذر التحقق من الحساب، رقم الآيبان غير متطابق مع اسم المستفيد..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                            />
                            {rejectErrors.rejection_reason && (
                                <span className="text-[11px] text-rose-400">{rejectErrors.rejection_reason}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setRejectModalOpen(false)}
                                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={rejecting || !rejectData.rejection_reason}
                                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {rejecting ? 'جاري الرفض...' : 'تأكيد الرفض وإعادة الرصيد'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Details Modal */}
            <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} maxWidth="lg">
                {selectedPayout && (
                    <div className="p-6 space-y-4 text-right">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                            <div className="flex items-center gap-2 text-violet-400">
                                <Zap className="w-5 h-5" />
                                <h3 className="font-bold text-white text-sm">تفاصيل الحوالة البنكية الكاملة</h3>
                            </div>
                            <button type="button" onClick={() => setDetailsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-400 block text-[10px] mb-1">المرجع الداخلي:</span>
                                <span className="font-mono font-bold text-white">{selectedPayout.reference_id}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-400 block text-[10px] mb-1">رقم العملية لدى HyperPay:</span>
                                <span className="font-mono font-bold text-violet-300">{selectedPayout.payout_id || 'لم يُحدد بعد'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-400 block text-[10px] mb-1">اسم المستفيد:</span>
                                <span className="font-bold text-white">{selectedPayout.beneficiary_details?.beneficiary_name || '—'}</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                                <span className="text-slate-400 block text-[10px] mb-1">البنك وكود السويفت BIC:</span>
                                <span className="font-bold text-slate-200">{selectedPayout.beneficiary_details?.bank_name} ({selectedPayout.beneficiary_details?.bic})</span>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2">
                                <span className="text-slate-400 block text-[10px] mb-1">رقم الآيبان (IBAN):</span>
                                <span className="font-mono font-bold text-emerald-400 tracking-wider">{selectedPayout.beneficiary_details?.iban}</span>
                            </div>
                        </div>

                        {selectedPayout.webhook_payload && (
                            <div className="space-y-1">
                                <span className="text-[11px] font-bold text-slate-400 block">بيانات استجابة البوابة (Webhook Payload):</span>
                                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto max-h-40">
                                    {JSON.stringify(selectedPayout.webhook_payload, null, 2)}
                                </pre>
                            </div>
                        )}

                        <div className="flex justify-end pt-3 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => setDetailsModalOpen(false)}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
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

