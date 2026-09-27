import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Badge from '@/Components/Badge';
import ReceiptViewerModal from '@/Components/ReceiptViewerModal';
import {
    Wallet,
    DollarSign,
    ArrowDownToLine,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    Clock,
    FileText,
    Download,
    Eye,
    TrendingUp,
    Truck,
    Building2,
    ShieldCheck,
} from 'lucide-react';

export default function FundingWallet({
    wallet,
    debtWallet,
    stats = {},
    transactions,
    withdrawals,
    company,
}) {
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [docModalOpen, setDocModalOpen] = useState(false);

    const handleViewDoc = (item) => {
        const filePath = item.signed_pdf_file_path || item.pdf_file_path;
        setSelectedDoc({
            ...item,
            title: `سند صرف واتفاقية تمويل #${item.request_number}`,
            receipt_url: route('company.withdrawals.view-pdf', item.id),
            pdf_file_path: filePath,
            is_pdf: true,
            amount: item.requested_amount,
        });
        setDocModalOpen(true);
    };

    return (
        <AuthenticatedLayout title="محفظة التمويل والمسحوبات">
            <Head title="محفظة التمويل والمسحوبات" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="محفظة التمويل والمسحوبات"
                subtitle="إدارة رصيد التمويل المنصرف للشحنات والمهام، متابعة طلبات الصرف المالي، والاطلاع على سندات الصرف المعتمدة"
                icon={Wallet}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: 'محفظة التمويل والمسحوبات' }]}
                badge={{
                    text: 'سيولة التمويل اللوجستي',
                    color: 'brand',
                }}
                actions={[
                    {
                        label: 'طلب سحب تمويل جديد',
                        icon: ArrowDownToLine,
                        url: route('company.withdrawals.index'),
                        variant: 'primary',
                    },
                    {
                        label: `محفظة الديون (${Number(debtWallet?.balance || 0).toLocaleString('en-US')} ر.س)`,
                        icon: DollarSign,
                        url: route('company.wallet.debt'),
                    },
                ]}
            />

            {/* 4 Financial Stat Cards for Funding Wallet */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Available Funding Balance */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">رصيد التمويل المتاح</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <Wallet className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.available_balance || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        الرصيد الكلي: {Number(stats.current_balance || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* Total Funding Received from Investors */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي التمويل الوارد</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <ArrowDownLeft className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        +{Number(stats.total_funding_received || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        تمويلات مكتملة من المستثمرين
                    </p>
                </div>

                {/* Total Withdrawn to Company Account */}
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إجمالي المبالغ المنصرفة</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                            <ArrowDownToLine className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.total_withdrawn || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-indigo-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {stats.approved_count || 0} طلبات صرف معتمدة
                    </p>
                </div>

                {/* Pending Withdrawals */}
                <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">طلبات صرف قيد المراجعة</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(stats.pending_amount || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-amber-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {stats.pending_count || 0} طلبات بانتظار اعتماد الإدارة
                    </p>
                </div>
            </div>

            {/* Withdrawal Requests Table with Document / PDF Viewer */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <ArrowDownToLine className="w-5 h-5 text-violet-500" />
                        <span>طلبات سحب وصرف التمويل وسندات الأمر (PDF)</span>
                    </h3>
                    <Link
                        href={route('company.withdrawals.index')}
                        className="text-xs font-bold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                        إدارة طلبات الصرف ←
                    </Link>
                </div>

                {withdrawals.data && withdrawals.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">رقم الطلب</th>
                                    <th className="p-3">المبلغ المصروف</th>
                                    <th className="p-3">عدد المهام</th>
                                    <th className="p-3">تاريخ الاستحقاق</th>
                                    <th className="p-3">الحالة</th>
                                    <th className="p-3 text-center">مستند الصرف وسند الأمر</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {withdrawals.data.map((req) => (
                                    <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">{req.request_number}</td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">{parseFloat(req.requested_amount).toLocaleString('en-US')} ر.س</td>
                                        <td className="p-3 text-slate-700 dark:text-slate-300">{req.number_of_tasks || req.items?.length || 1} مهمة</td>
                                        <td className="p-3 text-slate-500 font-mono">{req.due_date}</td>
                                        <td className="p-3"><Badge status={req.status} /></td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {(req.signed_pdf_file_path || req.pdf_file_path) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDoc(req)}
                                                        className="px-3 py-1 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-bold text-[11px] transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                        title="معاينة سند الصرف والاتفاقية"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        <span>عرض السند</span>
                                                    </button>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">قيد التوليد</span>
                                                )}
                                                <a
                                                    href={route('company.withdrawals.pdf', req.id)}
                                                    target="_blank"
                                                    className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                                                    title="تحميل PDF"
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
                    <div className="py-10 text-center text-xs text-slate-500">
                        لا توجد طلبات صرف تمويل مسجلة بعد.
                    </div>
                )}
            </div>

            {/* Funding Ledger Transactions */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                        <FileText className="w-5 h-5 text-violet-500" />
                        <span>سجل القيود المحاسبية لمحفظة التمويل (Ledger)</span>
                    </h3>
                    <span className="text-xs font-mono text-slate-500">
                        رقم المحفظة: {wallet.wallet_number || `FUND-W-${wallet.id}`}
                    </span>
                </div>

                {transactions.data && transactions.data.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">نوع الحركة والبيان</th>
                                    <th className="p-3">المبلغ</th>
                                    <th className="p-3">الرصيد بعد الحركة</th>
                                    <th className="p-3">الحالة والنوع</th>
                                    <th className="p-3">التاريخ والوقت</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                                {transactions.data.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                        <td className="p-3">
                                            <span className="font-semibold text-slate-900 dark:text-white block">{tx.description}</span>
                                        </td>
                                        <td className="p-3 font-mono font-bold">
                                            <span className={parseFloat(tx.amount) > 0 ? 'text-violet-600 dark:text-violet-400' : 'text-slate-700 dark:text-slate-300'}>
                                                {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toLocaleString('en-US')}` : parseFloat(tx.amount).toLocaleString('en-US')} ر.س
                                            </span>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-slate-900 dark:text-white">
                                            {parseFloat(tx.balance_after).toLocaleString('en-US')} ر.س
                                        </td>
                                        <td className="p-3">
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                                {tx.transaction_type === 'credit' ? 'تمويل وارد' : 'صرف / تحويل'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-500 font-mono">
                                            {new Date(tx.created_at).toLocaleString('ar-SA')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-10 text-center text-xs text-slate-500">
                        لا توجد حركات مالية مسجلة بعد في محفظة التمويل.
                    </div>
                )}
            </div>

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
