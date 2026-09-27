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
import ReceiptViewerModal from '../../../Components/ReceiptViewerModal';
import { 
    Receipt, 
    CheckCircle, 
    XCircle, 
    Eye, 
    Download, 
    Search, 
    Filter, 
    RefreshCw, 
    Clock, 
    DollarSign, 
    Building, 
    User, 
    Calendar,
    FileText,
    ExternalLink
} from 'lucide-react';

export default function AdminDeposits({ deposits, stats, banks = [], filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [bankName, setBankName] = useState(filters?.bank_name || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [actionType, setActionType] = useState('approve'); // approve, reject
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Receipt viewer modal state
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [activeReceiptDeposit, setActiveReceiptDeposit] = useState(null);

    const handleOpenReceipt = (dep) => {
        setActiveReceiptDeposit(dep);
        setReceiptModalOpen(true);
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.deposits.index'), {
            search,
            status,
            bank_name: bankName,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setBankName('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.deposits.index'));
    };

    const handleOpenReview = (deposit, type) => {
        setSelectedDeposit(deposit);
        setActionType(type);
        setRejectionReason('');
        setReviewModalOpen(true);
    };

    const handleConfirmAction = () => {
        if (!selectedDeposit) return;
        setLoading(true);

        if (actionType === 'approve') {
            router.post(route('admin.deposits.approve', selectedDeposit.id), {}, {
                onFinish: () => {
                    setLoading(false);
                    setReviewModalOpen(false);
                },
            });
        } else {
            router.post(route('admin.deposits.reject', selectedDeposit.id), {
                rejection_reason: rejectionReason,
            }, {
                onFinish: () => {
                    setLoading(false);
                    setReviewModalOpen(false);
                },
            });
        }
    };

    const statusOptions = [
        { value: '', label: 'جميع الحالات' },
        { value: 'pending', label: 'قيد المراجعة والتدقيق' },
        { value: 'approved', label: 'معتمد ومقيد بالمحفظة' },
        { value: 'rejected', label: 'مرفوض' },
    ];

    const bankOptions = [
        { value: '', label: 'جميع البنوك المحول إليها' },
        ...banks.map(b => ({ value: b, label: b }))
    ];

    return (
        <AuthenticatedLayout title="مراجعة واعتماد الحوالات البنكية">
            <Head title="الإيداعات البنكية - إدارة المنصة" />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title="سجل ومراجعة الإيداعات البنكية"
                    subtitle="تدقيق ومطابقة الحوالات البنكية المرفوعة من المستثمرين وشحن محافظهم الاستثمارية"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'الإيداعات البنكية' }
                    ]}
                    icon={Receipt}
                    iconColor="text-violet-400"
                    badge={{ text: `${stats?.pending || 0} بانتظار المراجعة`, color: stats?.pending > 0 ? 'amber' : 'brand' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="إجمالي الإيداعات"
                        value={stats?.total || 0}
                        icon={Receipt}
                        color="blue"
                        description="إجمالي طلبات الإيداع"
                    />
                    <StatCard
                        title="بانتظار المراجعة"
                        value={stats?.pending || 0}
                        icon={Clock}
                        color="amber"
                        description={`بقيمة ${Number(stats?.total_pending_amount || 0).toLocaleString('en-US')} ر.س`}
                    />
                    <StatCard
                        title="إيداعات معتمدة"
                        value={stats?.approved || 0}
                        icon={CheckCircle}
                        color="brand"
                        description="تم قيدها في المحافظ"
                    />
                    <StatCard
                        title="إجمالي السيولة المودعة"
                        value={`${Number(stats?.total_approved_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`}
                        icon={DollarSign}
                        color="purple"
                        description="إجمالي الأموال المعتمدة"
                    />
                </div>

                {/* Filters */}
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
                                        placeholder="رقم الإيداع، المرجع، اسم المستثمر..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
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
                                label="البنك"
                                options={bankOptions}
                                value={bankName}
                                onChange={setBankName}
                                placeholder="اختر البنك..."
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
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>تطبيق الفلترة</span>
                                </button>
                                {(search || status || bankName || dateFrom || dateTo) && (
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
                <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">رقم الإيداع</th>
                                    <th className="p-4">المستثمر</th>
                                    <th className="p-4">المبلغ المودع</th>
                                    <th className="p-4">البنك المحول إليه</th>
                                    <th className="p-4">اسم المحوّل / المرجع</th>
                                    <th className="p-4">تاريخ التحويل</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4">الإيصال</th>
                                    <th className="p-4 text-center">الإجراءات والاعتماد</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {deposits?.data && deposits.data.length > 0 ? (
                                    deposits.data.map((dep) => {
                                        const amountVal = parseFloat(dep.amount || 0);

                                        return (
                                            <tr key={dep.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                                                        {dep.deposit_number}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-0.5">
                                                        <span className="font-bold text-slate-100 block">{dep.user?.name}</span>
                                                        <span className="text-[11px] text-slate-400 font-mono block">{dep.user?.email}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-white text-sm">
                                                    {amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-200">
                                                        <Building className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{dep.bank_name || 'غير محدد'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-0.5">
                                                        <span className="text-slate-200 block">{dep.depositor_name || dep.sender_name || '-'}</span>
                                                        {dep.bank_reference_number && (
                                                            <span className="text-[10px] text-slate-400 font-mono block">
                                                                مرجع: {dep.bank_reference_number}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-400 text-[11px] font-mono">
                                                    {dep.transfer_date || new Date(dep.created_at).toLocaleDateString('ar-SA')}
                                                </td>
                                                <td className="p-4">
                                                    <Badge status={dep.status} />
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenReceipt(dep)}
                                                        className="inline-flex items-center gap-1.5 text-violet-400 hover:text-violet-300 font-semibold bg-violet-500/10 hover:bg-[#5217D4]/20 px-2.5 py-1.5 rounded-lg border border-violet-500/20 transition-all text-xs cursor-pointer shadow-sm"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>عرض الإيصال</span>
                                                    </button>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {dep.status === 'pending' ? (
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenReview(dep, 'approve')}
                                                                className="px-3 py-1.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                <span>اعتماد وشحن</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenReview(dep, 'reject')}
                                                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>رفض</span>
                                                            </button>
                                                        </div>
                                                    ) : dep.status === 'approved' ? (
                                                        <span className="text-[11px] text-violet-400 font-medium">
                                                            معتمد بواسطة {dep.reviewer?.name || 'الإدارة'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-rose-400">
                                                            مرفوض {dep.rejection_reason && `(${dep.rejection_reason})`}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center py-12 text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Receipt className="w-8 h-8 text-slate-600" />
                                                <p className="text-sm font-semibold">لا توجد إيداعات مطابقة لمعايير البحث</p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline"
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
                        <Pagination links={deposits?.links} meta={deposits} />
                    </div>
                </div>
            </div>

            {/* Approve / Reject Review Modal */}
            <Modal
                isOpen={reviewModalOpen}
                onClose={() => setReviewModalOpen(false)}
                title={actionType === 'approve' ? 'اعتماد الحوالة وقيد الرصيد بالمحفظة' : 'رفض طلب الإيداع البنكي'}
                maxWidth="md"
            >
                <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">المستثمر:</span>
                            <span className="font-bold text-white">{selectedDeposit?.user?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">مبلغ التحويل:</span>
                            <span className="font-mono font-bold text-violet-400 text-sm">
                                {parseFloat(selectedDeposit?.amount || 0).toLocaleString('en-US')} ر.س
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">البنك المحول إليه:</span>
                            <span className="text-white">{selectedDeposit?.bank_name}</span>
                        </div>
                        {selectedDeposit?.depositor_name && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">اسم صاحب الحساب:</span>
                                <span className="text-white">{selectedDeposit?.depositor_name}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                        {actionType === 'approve'
                            ? `تأكيد قيد المبلغ فوراً في محفظة استثمار المستثمر ${selectedDeposit?.user?.name}؟ سيتم إنشاء قيد مزدوج في سجل العمليات وتحديث رصيد المحفظة تلقائياً.`
                            : `يرجى تدوين سبب رفض الإيداع البنكي لإشعار المستثمر به:`}
                    </p>

                    {actionType === 'reject' && (
                        <div>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="سبب الرفض (مثال: الإيصال غير واضح، أو لم نتحقق من وصول المبلغ للحساب البنكي)..."
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white h-24 focus:outline-none focus:border-rose-500"
                                required
                            />
                        </div>
                    )}

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setReviewModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmAction}
                            disabled={loading || (actionType === 'reject' && !rejectionReason.trim())}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                                actionType === 'approve' 
                                    ? 'bg-[#6320EE] hover:bg-[#5217D4] shadow-lg shadow-violet-600/20' 
                                    : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20'
                            }`}
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>{actionType === 'approve' ? 'تأكيد الاعتماد والشحن' : 'تأكيد الرفض'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Dedicated WhatsApp Web-style Receipt Viewer Modal */}
            <ReceiptViewerModal
                isOpen={receiptModalOpen}
                onClose={() => setReceiptModalOpen(false)}
                deposit={activeReceiptDeposit}
            />
        </AuthenticatedLayout>
    );
}
