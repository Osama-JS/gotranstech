import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
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
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
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
        { value: '', label: t('admin.deposits.filter_status_all') },
        { value: 'pending', label: t('status.pending') },
        { value: 'approved', label: t('status.approved') },
        { value: 'rejected', label: t('status.rejected') },
    ];

    const bankOptions = [
        { value: '', label: t('admin.deposits.filter_bank_all') },
        ...banks.map(b => ({ value: b, label: b }))
    ];

    return (
        <AuthenticatedLayout title={t('admin.deposits.page_title')}>
            <Head title={t('admin.deposits.page_title')} />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title={t('admin.deposits.header_title')}
                    subtitle={t('admin.deposits.header_subtitle')}
                    breadcrumbs={[
                        { label: t('common.home'), url: route('admin.dashboard') },
                        { label: t('admin.nav.items.deposits') }
                    ]}
                    icon={Receipt}
                    iconColor="text-violet-400"
                    badge={{ text: t('admin.deposits.badge_pending', { count: stats?.pending || 0 }), color: stats?.pending > 0 ? 'amber' : 'brand' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title={t('admin.deposits.stat_total_deposits')}
                        value={stats?.total || 0}
                        icon={Receipt}
                        color="blue"
                        description={t('admin.deposits.stat_total_desc')}
                    />
                    <StatCard
                        title={t('admin.deposits.stat_pending_deposits')}
                        value={stats?.pending || 0}
                        icon={Clock}
                        color="amber"
                        description={t('admin.deposits.stat_pending_desc', { amount: Number(stats?.total_pending_amount || 0).toLocaleString(isAr ? 'ar-SA' : 'en-US'), sar: t('common.sar') })}
                    />
                    <StatCard
                        title={t('admin.deposits.stat_approved_deposits')}
                        value={stats?.approved || 0}
                        icon={CheckCircle}
                        color="brand"
                        description={t('admin.deposits.stat_approved_desc')}
                    />
                    <StatCard
                        title={t('admin.deposits.stat_approved_deposits')}
                        value={`${Number(stats?.total_approved_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t('common.sar')}`}
                        icon={DollarSign}
                        color="purple"
                        description={t('admin.deposits.stat_rejected_desc')}
                    />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-30 overflow-visible">
                    <form onSubmit={handleFilter} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">{t('admin.deposits.filter_search_label')}</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('admin.deposits.filter_search_placeholder')}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                                    />
                                </div>
                            </div>

                            <SearchableSelect
                                label={t('common.status')}
                                options={statusOptions}
                                value={status}
                                onChange={setStatus}
                                placeholder={t('admin.deposits.filter_select_status')}
                            />

                            <SearchableSelect
                                label={t('admin.deposits.table_bank')}
                                options={bankOptions}
                                value={bankName}
                                onChange={setBankName}
                                placeholder={t('admin.deposits.filter_select_bank')}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 items-end">
                            <DatePicker
                                label={t('admin.tasks.filter_date_from')}
                                value={dateFrom}
                                onChange={setDateFrom}
                                placeholder={t('admin.deposits.filter_date_from')}
                            />

                            <DatePicker
                                label={t('admin.tasks.filter_date_to')}
                                value={dateTo}
                                onChange={setDateTo}
                                placeholder={t('admin.deposits.filter_date_to')}
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>{t('admin.tasks.btn_filter')}</span>
                                </button>
                                {(search || status || bankName || dateFrom || dateTo) && (
                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                                        title={t('admin.tasks.btn_reset')}
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
                                    <th className="p-4">{t('admin.deposits.table_id')}</th>
                                    <th className="p-4">{t('admin.deposits.table_investor')}</th>
                                    <th className="p-4">{t('admin.deposits.table_amount')}</th>
                                    <th className="p-4">{t('admin.deposits.table_bank')}</th>
                                    <th className="p-4">{t('admin.deposits.table_reference')}</th>
                                    <th className="p-4">{t('admin.deposits.table_date')}</th>
                                    <th className="p-4">{t('common.status')}</th>
                                    <th className="p-4">{t('admin.deposits.table_receipt')}</th>
                                    <th className="p-4 text-center">{t('common.actions')}</th>
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
                                                    {amountVal.toLocaleString('en-US', { minimumFractionDigits: 2 })} {t('common.sar')}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 text-slate-200">
                                                        <Building className="w-3.5 h-3.5 text-slate-500" />
                                                        <span>{dep.bank_name || t('admin.tasks.unspecified')}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="space-y-0.5">
                                                        <span className="text-slate-200 block">{dep.depositor_name || dep.sender_name || '-'}</span>
                                                        {dep.bank_reference_number && (
                                                            <span className="text-[10px] text-slate-400 font-mono block">
                                                                {t('admin.deposits.reference_label', { ref: dep.bank_reference_number })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-400 text-[11px] font-mono">
                                                    {dep.transfer_date || new Date(dep.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
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
                                                        <span>{t('admin.deposits.btn_view_receipt')}</span>
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
                                                                <span>{t('admin.deposits.btn_approve')}</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenReview(dep, 'reject')}
                                                                className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                            >
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                <span>{t('admin.deposits.btn_reject')}</span>
                                                            </button>
                                                        </div>
                                                    ) : dep.status === 'approved' ? (
                                                        <span className="text-[11px] text-violet-400 font-medium">
                                                            {t('admin.deposits.approved_by', { name: dep.reviewer?.name || t('admin.deposits.admin_name') })}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[11px] text-rose-400">
                                                            {t('admin.deposits.rejected_reason', { reason: dep.rejection_reason ? `(${dep.rejection_reason})` : '' })}
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
                                                <p className="text-sm font-semibold">{t('admin.deposits.empty_deposits')}</p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline"
                                                >
                                                    {t('admin.deposits.clear_filters')}
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
                title={actionType === 'approve' ? t('admin.deposits.modal_approve_title') : t('admin.deposits.modal_reject_title')}
                maxWidth="md"
            >
                <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">{t('admin.deposits.modal_investor')}</span>
                            <span className="font-bold text-white">{selectedDeposit?.user?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">{t('admin.deposits.modal_amount')}</span>
                            <span className="font-mono font-bold text-violet-400 text-sm">
                                {parseFloat(selectedDeposit?.amount || 0).toLocaleString('en-US')} {t('common.sar')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500">{t('admin.deposits.modal_bank')}</span>
                            <span className="text-white">{selectedDeposit?.bank_name}</span>
                        </div>
                        {selectedDeposit?.depositor_name && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">{t('admin.deposits.modal_account_holder')}</span>
                                <span className="text-white">{selectedDeposit?.depositor_name}</span>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                        {actionType === 'approve'
                            ? t('admin.deposits.modal_approve_confirm', { name: selectedDeposit?.user?.name })
                            : t('admin.deposits.modal_reject_prompt')}
                    </p>

                    {actionType === 'reject' && (
                        <div>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder={t('admin.deposits.rejection_reason_placeholder')}
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
                            {t('common.cancel')}
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
                                <span>{actionType === 'approve' ? t('admin.deposits.btn_approve') : t('admin.deposits.btn_reject')}</span>
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
