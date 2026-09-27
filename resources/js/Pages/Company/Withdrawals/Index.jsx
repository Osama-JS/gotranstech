import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import ReceiptViewerModal from '../../../Components/ReceiptViewerModal';
import {
    ArrowDownToLine,
    PlusCircle,
    FileText,
    Download,
    CheckSquare,
    Square,
    Truck,
    AlertCircle,
    Clock,
    DollarSign,
    CheckCircle2,
    Eye,
    Wallet,
    ChevronLeft,
} from 'lucide-react';

export default function CompanyWithdrawals({
    withdrawals,
    claimableTasks = [],
    fundingWallet,
    stats = {},
}) {
    const [createModal, setCreateModal] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [signature, setSignature] = useState('');
    const [selectedPdf, setSelectedPdf] = useState(null);
    const [pdfViewerOpen, setPdfViewerOpen] = useState(false);

    const { post, processing, errors } = useForm();

    const toggleSelectTask = (taskId) => {
        if (selectedTaskIds.includes(taskId)) {
            setSelectedTaskIds(selectedTaskIds.filter((id) => id !== taskId));
        } else {
            setSelectedTaskIds([...selectedTaskIds, taskId]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedTaskIds.length === claimableTasks.length) {
            setSelectedTaskIds([]);
        } else {
            setSelectedTaskIds(claimableTasks.map((t) => t.id));
        }
    };

    const selectedTotal = claimableTasks
        .filter((t) => selectedTaskIds.includes(t.id))
        .reduce((sum, t) => sum + parseFloat(t.funding_amount), 0);

    const handleSubmitWithdrawal = (e) => {
        e.preventDefault();
        if (selectedTaskIds.length === 0) return;

        post(route('company.withdrawals.store', {
            task_ids: selectedTaskIds,
            company_signature: signature || 'توقيع إلكتروني مفوض',
        }), {
            onSuccess: () => {
                setCreateModal(false);
                setSelectedTaskIds([]);
            },
        });
    };

    const handleViewPdf = (withdrawal) => {
        setSelectedPdf({
            ...withdrawal,
            title: `سند صرف واتفاقية تمويل #${withdrawal.request_number}`,
            receipt_url: route('company.withdrawals.view-pdf', withdrawal.id),
            is_pdf: true,
            amount: withdrawal.requested_amount,
        });
        setPdfViewerOpen(true);
    };

    return (
        <AuthenticatedLayout title="سحب رصيد تمويل المهام وسندات الصرف (PDF)">
            <Head title="سحب رصيد التمويل" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="سحب رصيد تمويل المهام وسندات الصرف"
                subtitle="تقديم طلبات صرف سيولة المهام الممولة، توليد وتوقيع سندات الصرف بصيغة PDF، ومتابعة اعتماد الإدارة"
                icon={ArrowDownToLine}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: 'سحب رصيد التمويل' }]}
                badge={{
                    text: `رصيد متاح: ${Number(stats.available_to_withdraw || fundingWallet?.available_balance || 0).toLocaleString('en-US')} ر.س`,
                    color: 'brand',
                }}
                actions={[
                    {
                        label: 'إنشاء طلب سحب رصيد جديد',
                        icon: PlusCircle,
                        onClick: () => setCreateModal(true),
                        variant: 'primary',
                    },
                    {
                        label: 'محفظة التمويل والمسحوبات',
                        icon: Wallet,
                        url: route('company.wallet.funding'),
                    },
                    {
                        label: 'محفظة الديون والالتزامات',
                        icon: DollarSign,
                        url: route('company.wallet.debt'),
                    },
                ]}
            />

            {/* 4 Financial Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Available to Withdraw */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/40 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">الرصيد المتاح للمطالبة والصرف</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center font-bold border border-violet-500/30">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-violet-600 dark:text-violet-400 flex items-baseline gap-1">
                        {Number(stats.available_to_withdraw || fundingWallet?.available_balance || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-mono">
                        الرصيد الكلي: {Number(stats.current_balance || fundingWallet?.balance || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* Total Withdrawn */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-violet-900/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي المبالغ المصروفة</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.total_withdrawn || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-slate-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {stats.approved_withdrawals_count || 0} طلب سحب معتمد ومحول
                    </p>
                </div>

                {/* Pending Under Review */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">قيد التدقيق والاعتماد</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-amber-500 flex items-baseline gap-1">
                        {Number(stats.pending_withdrawals_amount || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-amber-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {stats.pending_withdrawals_count || 0} طلب سحب بانتظار موافقة الإدارة
                    </p>
                </div>

                {/* Claimable Tasks Total */}
                <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">مهام جاهزة لطلب السحب</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-orange-500 flex items-baseline gap-1">
                        {Number(stats.claimable_tasks_total || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-orange-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        في {stats.claimable_tasks_count || 0} مهمة ممولة لم تُطلب بعد
                    </p>
                </div>
            </div>

            {/* Withdrawals List Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-500" />
                        <span>سجل طلبات سحب رصيد التمويل وسندات الأمر</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                        إجمالي الطلبات: {withdrawals.total || withdrawals.data?.length || 0}
                    </span>
                </div>

                {withdrawals.data && withdrawals.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">رقم الطلب والسند</th>
                                    <th className="p-3">المبلغ المطالب بسحبه</th>
                                    <th className="p-3">عدد المهام المشمولة</th>
                                    <th className="p-3">تاريخ استحقاق السداد</th>
                                    <th className="p-3">حالة الطلب</th>
                                    <th className="p-3">تاريخ التقديم</th>
                                    <th className="p-3 text-center">معاينة وتنزيل السند (PDF)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {withdrawals.data.map((w) => (
                                    <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                                            #{w.request_number}
                                        </td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                            {parseFloat(w.requested_amount).toLocaleString('en-US')} ر.س
                                        </td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300 font-mono font-semibold">
                                            {w.number_of_tasks} مهام
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono">
                                            {w.due_date ? (
                                                <span className="font-semibold text-slate-900 dark:text-white">{w.due_date}</span>
                                            ) : (
                                                <span className="text-slate-400">يحدد عند الاعتماد</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <Badge status={w.status} />
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono">
                                            {new Date(w.created_at).toLocaleDateString('ar-SA')}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewPdf(w)}
                                                    className="px-2.5 py-1.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 transition-colors inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                                                    title="معاينة السند بدقة عالية"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>عرض السند</span>
                                                </button>
                                                <a
                                                    href={route('company.withdrawals.pdf', w.id)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors inline-flex items-center"
                                                    title="تنزيل ملف PDF"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                        لا توجد طلبات سحب رصيد مسجلة حتى الآن.
                    </div>
                )}

                {/* Pagination */}
                {withdrawals.links && withdrawals.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1.5 mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                        {withdrawals.links.map((link, idx) => (
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

            {/* Create Withdrawal Modal with Tasks Checkboxes */}
            <Modal
                isOpen={createModal}
                onClose={() => setCreateModal(false)}
                title="إنشاء طلب سحب رصيد تمويل مهام"
                maxWidth="3xl"
            >
                <form onSubmit={handleSubmitWithdrawal} className="space-y-5">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        حدد المهام الممولة التي ترغب في سحب رصيدها من محفظة التمويل. سيتم توليد مستند PDF رسمي يربط هذه المهام بالطلب وتسجيل المبلغ المسحوب في محفظة الديون بعد الاعتماد.
                    </p>

                    {/* Task Selection Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                        >
                            {selectedTaskIds.length === claimableTasks.length && claimableTasks.length > 0 ? (
                                <CheckSquare className="w-4 h-4" />
                            ) : (
                                <Square className="w-4 h-4" />
                            )}
                            <span>تحديد الكل ({claimableTasks.length} مهمة متاحة للسحب)</span>
                        </button>

                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            المحدد: <span className="text-violet-600 dark:text-violet-400 font-mono font-bold">{selectedTaskIds.length}</span> مهمة
                        </span>
                    </div>

                    {/* Tasks List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {claimableTasks.length > 0 ? (
                            claimableTasks.map((task) => {
                                const isSelected = selectedTaskIds.includes(task.id);
                                return (
                                    <div
                                        key={task.id}
                                        onClick={() => toggleSelectTask(task.id)}
                                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                                            isSelected
                                                ? 'bg-violet-500/10 border-violet-500/50 text-slate-900 dark:text-white'
                                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isSelected ? (
                                                <CheckSquare className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
                                            ) : (
                                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                                            )}
                                            <div>
                                                <span className="font-mono font-bold text-violet-600 dark:text-violet-400 block">
                                                    #{task.task_number}
                                                </span>
                                                <span className="font-semibold block text-slate-900 dark:text-slate-100">
                                                    {task.title}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="text-left font-mono font-bold text-sm text-slate-900 dark:text-white">
                                            {parseFloat(task.funding_amount).toLocaleString('en-US')} ر.س
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-6">
                                لا توجد مهام ممولة جديدة متاحة للسحب حالياً.
                            </p>
                        )}
                    </div>

                    {/* Selected Total Box */}
                    <div className="bg-slate-100 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            إجمالي المبلغ المطالب بسحبه:
                        </span>
                        <span className="text-xl font-black font-mono text-violet-600 dark:text-violet-400">
                            {selectedTotal.toLocaleString('en-US')} ر.س
                        </span>
                    </div>

                    {/* Digital Signature */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            اسم المفوض بالتوقيع الإلكتروني على السند
                        </label>
                        <input
                            type="text"
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="الاسم الكامل للممثل النظامي للشركة"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={selectedTaskIds.length === 0 || processing}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-violet-600/30"
                    >
                        {processing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>تقديم الطلب وتوليد مستند الـ PDF</span>
                        )}
                    </button>
                </form>
            </Modal>

            {/* Receipt & Document Viewer Modal */}
            <ReceiptViewerModal
                isOpen={pdfViewerOpen}
                onClose={() => {
                    setPdfViewerOpen(false);
                    setSelectedPdf(null);
                }}
                deposit={selectedPdf}
            />
        </AuthenticatedLayout>
    );
}
