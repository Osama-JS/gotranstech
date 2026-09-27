import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Modal from '@/Components/Modal';
import Badge from '@/Components/Badge';
import ReceiptViewerModal from '@/Components/ReceiptViewerModal';
import {
    DollarSign,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    Clock,
    AlertCircle,
    CheckCircle2,
    FileText,
    CreditCard,
    Upload,
    Eye,
    ShieldCheck,
    Calendar,
} from 'lucide-react';

export default function DebtWallet({
    wallet,
    fundingWallet,
    stats = {},
    debts,
    transactions,
    company,
}) {
    const [repayModalOpen, setRepayModalOpen] = useState(false);
    const [selectedDebt, setSelectedDebt] = useState(null);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docModalOpen, setDocModalOpen] = useState(false);

    // Repayment Form
    const { data, setData, post, processing, errors, reset } = useForm({
        debt_id: '',
        amount: '',
        bank_name: 'مصرف الراجحي',
        reference_number: '',
        receipt_file: null,
    });

    const handleOpenRepayModal = (debt) => {
        setSelectedDebt(debt);
        setData('debt_id', debt.id);
        setData('amount', debt.remaining_amount);
        setRepayModalOpen(true);
    };

    const handleRepaySubmit = (e) => {
        e.preventDefault();
        post(route('company.wallet.debt.repay'), {
            onSuccess: () => {
                setRepayModalOpen(false);
                reset();
                setSelectedDebt(null);
            },
        });
    };

    const handleViewAttachment = (item, type = 'repayment') => {
        if (type === 'withdrawal') {
            const filePath = item.signed_pdf_file_path || item.pdf_file_path;
            setSelectedDoc({
                ...item,
                title: `سند أمر وتمويل #${item.request_number}`,
                receipt_url: route('company.withdrawals.view-pdf', item.id),
                pdf_file_path: filePath,
                is_pdf: true,
                amount: item.requested_amount,
            });
        } else {
            const filePath = item.metadata?.receipt_path || item.receipt_path;
            setSelectedDoc({
                ...item,
                title: item.description || 'إيصال سداد التزام',
                receipt_url: filePath ? `/storage/${filePath}` : null,
                receipt_file_path: filePath,
                amount: item.amount || item.paid_amount,
            });
        }
        setDocModalOpen(true);
    };

    return (
        <AuthenticatedLayout title="محفظة الديون والالتزامات وسداد المستحقات">
            <Head title="محفظة الديون والالتزامات" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="محفظة الديون والالتزامات وسداد المستحقات"
                subtitle="متابعة الالتزامات المالية المستحقة، السقف الائتماني المتاح، وتوثيق سداد الأقساط بمستندات وإيصالات بنكية"
                icon={DollarSign}
                iconColor="text-amber-500"
                iconBg="bg-amber-500/15 border-amber-500/30"
                breadcrumbs={[{ label: 'محفظة الديون والالتزامات' }]}
                badge={{
                    text: `استغلال الائتمان: ${stats.credit_utilization_rate || 0}%`,
                    color: (stats.credit_utilization_rate || 0) > 80 ? 'rose' : 'amber',
                }}
                actions={[
                    {
                        label: `محفظة التمويل (${Number(fundingWallet?.balance || 0).toLocaleString('en-US')} ر.س)`,
                        icon: Wallet,
                        url: route('company.wallet.funding'),
                    },
                ]}
            />

            {/* 4 Financial Stat Cards for Debt Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Outstanding Debt */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي الالتزامات القائمة</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.total_outstanding || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-amber-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {stats.active_debts_count || 0} التزامات مستحقة السداد
                    </p>
                </div>

                {/* Total Repaid Amount */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي المبالغ المسددة</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        +{Number(stats.total_paid || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        دفعات سداد موثقة بالنظام
                    </p>
                </div>

                {/* Remaining Credit Limit */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">السقف الائتماني المتبقي</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.remaining_credit || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        من أصل سقف: {Number(stats.credit_limit || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* Overdue Debts Indicator */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">الالتزامات المتأخرة</span>
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {stats.overdue_count || 0}
                        <span className="text-xs font-sans font-bold text-slate-500">متأخرات</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {stats.overdue_count > 0 ? 'يرجى سرعة السداد لتفادي تجميد السقف' : '✓ السجل الائتماني منتظم ومثالي'}
                    </p>
                </div>
            </div>

            {/* Debts Installments Table with Document & Receipt Viewers */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-amber-500" />
                        <span>جدول التزامات التمويل وسندات الأمر (مع فحص السندات والإيصالات)</span>
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                        إجمالي الالتزامات: {debts.total || debts.data?.length || 0}
                    </span>
                </div>

                {debts.data && debts.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">رقم الالتزام / السند</th>
                                    <th className="p-3">أصل مبلغ التمويل</th>
                                    <th className="p-3">المسدد</th>
                                    <th className="p-3">المتبقي للسداد</th>
                                    <th className="p-3">تاريخ الاستحقاق</th>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3 text-center">الإجراء والسندات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {debts.data.map((debt) => (
                                    <tr key={debt.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                                            #{debt.id} {debt.withdrawal_request?.request_number ? `(${debt.withdrawal_request.request_number})` : ''}
                                        </td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                            {parseFloat(debt.principal_amount).toLocaleString('en-US')} ر.س
                                        </td>
                                        <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">
                                            {parseFloat(debt.paid_amount).toLocaleString('en-US')} ر.س
                                        </td>
                                        <td className="p-3 font-mono font-bold text-amber-500">
                                            {parseFloat(debt.remaining_amount).toLocaleString('en-US')} ر.س
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono">{debt.due_date}</td>
                                        <td className="p-3"><Badge status={debt.status} /></td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {debt.status !== 'paid' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenRepayModal(debt)}
                                                        className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-xl transition-all shadow-sm cursor-pointer"
                                                    >
                                                        سداد دفعة
                                                    </button>
                                                )}
                                                {debt.withdrawal_request && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewAttachment(debt.withdrawal_request, 'withdrawal')}
                                                        className="px-2.5 py-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-xl text-[11px] font-bold border border-violet-500/20 transition-all flex items-center gap-1 cursor-pointer"
                                                        title="معاينة سند الأمر والاتفاقية الموقعة"
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                        <span>عرض السند</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center text-xs text-slate-500">
                        لا توجد التزامات أو ديون مسجلة على المنشأة حالياً.
                    </div>
                )}
            </div>

            {/* Debt Wallet Ledger Transactions with Repayment Receipt Viewing */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-500" />
                        <span>سجل القيود المحاسبية لمحفظة الديون والالتزامات (Ledger)</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                        رقم المحفظة: {wallet.wallet_number || `DEBT-W-${wallet.id}`}
                    </span>
                </div>

                {transactions.data && transactions.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">نوع الحركة والبيان</th>
                                    <th className="p-3">المبلغ</th>
                                    <th className="p-3">رصيد الالتزام بعد الحركة</th>
                                    <th className="p-3">الحالة والنوع</th>
                                    <th className="p-3">التاريخ والوقت</th>
                                    <th className="p-3 text-center">إيصال السداد</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {transactions.data.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3">
                                            <span className="font-semibold text-slate-900 dark:text-white block">{tx.description}</span>
                                        </td>
                                        <td className="p-3 font-mono font-bold">
                                            <span className={parseFloat(tx.amount) < 0 ? 'text-violet-600 dark:text-violet-400' : 'text-amber-500'}>
                                                {parseFloat(tx.amount).toLocaleString('en-US')} ر.س
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                            {parseFloat(tx.balance_after).toLocaleString('en-US')} ر.س
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                {parseFloat(tx.amount) < 0 ? 'سداد التزام' : 'قيد تمويل جديد'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono">
                                            {new Date(tx.created_at).toLocaleString('ar-SA')}
                                        </td>
                                        <td className="p-3 text-center">
                                            {(tx.metadata?.receipt_path || tx.reference?.receipt_file_path) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleViewAttachment(tx, 'repayment')}
                                                    className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 transition-colors cursor-pointer"
                                                    title="معاينة إيصال سداد الدفعة"
                                                >
                                                    <Eye className="w-4 h-4" />
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
                    <div className="py-10 text-center text-xs text-slate-500">
                        لا توجد حركات سداد مسجلة بعد في محفظة الديون.
                    </div>
                )}
            </div>

            {/* Repayment Modal */}
            <Modal
                isOpen={repayModalOpen}
                onClose={() => setRepayModalOpen(false)}
                title={`سداد التزام التمويل #${selectedDebt?.id || ''}`}
                maxWidth="md"
            >
                <form onSubmit={handleRepaySubmit} className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                        المبلغ المتبقي لهذا الالتزام: <strong>{Number(selectedDebt?.remaining_amount || 0).toLocaleString('en-US')} ر.س</strong>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            المبلغ المراد سداده (ر.س) *
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={selectedDebt?.remaining_amount || 1000000}
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                            required
                        />
                        {errors.amount && <p className="text-[10px] text-rose-500 mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            البنك المحول منه *
                        </label>
                        <input
                            type="text"
                            value={data.bank_name}
                            onChange={(e) => setData('bank_name', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            رقم الحوالة أو المرجع البنكي
                        </label>
                        <input
                            type="text"
                            value={data.reference_number}
                            onChange={(e) => setData('reference_number', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            إرفاق صورة أو مستند إيصال السداد البنكي *
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setData('receipt_file', e.target.files[0])}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-amber-500 file:text-slate-950 font-bold cursor-pointer"
                            required
                        />
                        {errors.receipt_file && <p className="text-[10px] text-rose-500 mt-1">{errors.receipt_file}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                        <button
                            type="button"
                            onClick={() => setRepayModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-all disabled:opacity-50 shadow-md shadow-amber-600/30 cursor-pointer"
                        >
                            {processing ? 'جاري رفع الإيصال...' : 'تأكيد تسجيل السداد'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Interactive Document / PDF Viewer Modal */}
            <ReceiptViewerModal
                isOpen={docModalOpen}
                onClose={() => {
                    setDocModalOpen(false);
                    setSelectedDoc(null);
                }}
                deposit={selectedDoc}
            />
        </AuthenticatedLayout>
    );
}
