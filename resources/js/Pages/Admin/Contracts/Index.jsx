import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import StatCard from '../../../Components/StatCard';
import SearchableSelect from '../../../Components/SearchableSelect';
import DatePicker from '../../../Components/DatePicker';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import { 
    FileText, 
    PlusCircle, 
    ShieldCheck, 
    Award, 
    Calendar, 
    Search, 
    Filter, 
    RefreshCw, 
    CheckCircle2, 
    Clock, 
    Users, 
    Building2, 
    UserCheck, 
    Percent,
    Eye,
    Download,
    Printer
} from 'lucide-react';

export default function AdminContracts({ contracts, stats, filters = {} }) {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
    const [search, setSearch] = useState(filters?.search || '');
    const [partyType, setPartyType] = useState(filters?.party_type || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    const [selectedContract, setSelectedContract] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);

    const handleOpenDetails = (c) => {
        setSelectedContract(c);
        setDetailsModalOpen(true);
    };

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.contracts.index'), {
            search,
            party_type: partyType,
            status,
            date_from: dateFrom,
            date_to: dateTo,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setPartyType('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.contracts.index'));
    };

    const statusOptions = [
        { value: '', label: t('admin.tasks.filter_status_all') },
        { value: 'active', label: t('admin.contracts.stat_active') },
        { value: 'pending_signature', label: t('admin.contracts.stat_pending') },
        { value: 'expired', label: t('admin.contracts.stat_expired') },
        { value: 'terminated', label: t('status.cancelled') },
    ];

    const partyTypeOptions = [
        { value: '', label: t('admin.contracts.filter_party_all') },
        { value: 'investor', label: t('admin.contracts.filter_party_investor') },
        { value: 'company', label: t('admin.contracts.filter_party_company') },
    ];

    return (
        <AuthenticatedLayout title={t('admin.contracts.page_title')}>
            <Head title={t('admin.contracts.page_title')} />

            <div className="space-y-6 pb-12">
                {/* Unified Header */}
                <AdminPageHeader
                    title={t('admin.contracts.header_title')}
                    subtitle={t('admin.contracts.header_subtitle')}
                    breadcrumbs={[
                        { label: t('common.home'), url: route('admin.dashboard') },
                        { label: t('admin.nav.items.contracts') }
                    ]}
                    icon={FileText}
                    iconColor="text-violet-400"
                    actions={[
                        {
                            label: t('admin.contracts.btn_create_contract'),
                            icon: PlusCircle,
                            url: route('admin.contracts.create'),
                            variant: 'primary',
                        }
                    ]}
                    badge={{ text: t('admin.contracts.badge_total', { count: stats?.total || 0 }), color: 'brand' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title={t('admin.contracts.stat_total')}
                        value={stats?.total || 0}
                        icon={FileText}
                        color="blue"
                        description={t('admin.contracts.stat_total_desc')}
                    />
                    <StatCard
                        title={t('admin.contracts.stat_active')}
                        value={stats?.active || 0}
                        icon={ShieldCheck}
                        color="brand"
                        description={t('admin.contracts.stat_active_desc')}
                    />
                    <StatCard
                        title={t('admin.contracts.filter_party_investor')}
                        value={stats?.investor_contracts || 0}
                        icon={UserCheck}
                        color="purple"
                        description={t('admin.contracts.stat_pending_desc')}
                    />
                    <StatCard
                        title={t('admin.contracts.filter_party_company')}
                        value={stats?.company_contracts || 0}
                        icon={Building2}
                        color="amber"
                        description={t('admin.contracts.stat_expired_desc')}
                    />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-30 overflow-visible">
                    <form onSubmit={handleFilter} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">{t('admin.contracts.filter_search_label')}</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder={t('admin.contracts.filter_search_placeholder')}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 transition-all"
                                    />
                                </div>
                            </div>

                            <SearchableSelect
                                label={t('admin.contracts.field_party_type')}
                                options={partyTypeOptions}
                                value={partyType}
                                onChange={setPartyType}
                                placeholder={t('admin.contracts.filter_select_type')}
                            />

                            <SearchableSelect
                                label={t('common.status')}
                                options={statusOptions}
                                value={status}
                                onChange={setStatus}
                                placeholder={t('admin.contracts.filter_select_status')}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 items-end">
                            <DatePicker
                                label={t('admin.contracts.field_start_date')}
                                value={dateFrom}
                                onChange={setDateFrom}
                                placeholder={t('admin.contracts.filter_date_from')}
                            />

                            <DatePicker
                                label={t('admin.contracts.field_end_date')}
                                value={dateTo}
                                onChange={setDateTo}
                                placeholder={t('admin.contracts.filter_date_to')}
                            />

                            <div className="flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-2xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>{t('admin.tasks.btn_filter')}</span>
                                </button>
                                {(search || partyType || status || dateFrom || dateTo) && (
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
                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">{t('admin.contracts.table_number')}</th>
                                    <th className="p-4">{t('admin.contracts.table_type')}</th>
                                    <th className="p-4">{t('admin.contracts.table_party')}</th>
                                    <th className="p-4">{t('admin.contracts.field_party_type')}</th>
                                    <th className="p-4">{t('admin.contracts.table_commission_terms')}</th>
                                    <th className="p-4">{t('admin.contracts.table_dates')}</th>
                                    <th className="p-4">{t('admin.contracts.table_status')}</th>
                                    <th className="p-4 text-center">{t('admin.contracts.table_actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {contracts?.data && contracts.data.length > 0 ? (
                                    contracts.data.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
                                                    {c.contract_number}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-slate-500" />
                                                    <span className="font-bold text-slate-100">{c.title}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="space-y-0.5">
                                                    <span className="font-semibold text-slate-200 block">{c.user?.name}</span>
                                                    <span className="text-[11px] text-slate-400 font-mono block">{c.user?.email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                                    c.party_type === 'company' 
                                                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                                                        : 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                                }`}>
                                                    {c.party_type === 'company' ? t('admin.contracts.party_company') : t('admin.contracts.party_investor')}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20 inline-flex items-center gap-1">
                                                    <span>{c.commission_rate || c.rate || 0}%</span>
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                                                {c.start_date || new Date(c.created_at).toLocaleDateString('ar-SA')}
                                            </td>
                                            <td className="p-4">
                                                <Badge status={c.status} />
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetails(c)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors cursor-pointer"
                                                        title={t('admin.contracts.action_view')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <a
                                                        href={route('admin.contracts.view-pdf', c.id)}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 rounded-xl text-slate-400 hover:text-orange-400 hover:bg-orange-500/10 transition-colors cursor-pointer"
                                                        title={t('admin.contracts.action_print')}
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                    </a>
                                                    <a
                                                        href={route('admin.contracts.pdf', c.id)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                                                        title={t('admin.contracts.action_download')}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center py-12 text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <FileText className="w-8 h-8 text-slate-600" />
                                                <p className="text-sm font-semibold">{t('admin.contracts.empty_contracts')}</p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-2 text-xs text-violet-400 hover:text-violet-300 underline cursor-pointer"
                                                >
                                                    {t('common.cancel')}
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
                        <Pagination links={contracts?.links} meta={contracts} />
                    </div>
                </div>

                {/* Contract Full Details Modal */}
                <Modal
                    isOpen={detailsModalOpen}
                    onClose={() => setDetailsModalOpen(false)}
                    title={`${t('admin.contracts.show_title', { number: selectedContract?.contract_number || '' })}`}
                    maxWidth="3xl"
                >
                    {selectedContract && (
                        <div className="space-y-4 text-xs font-sans">
                            {/* Header summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('admin.contracts.label_contract_title')}</span>
                                    <strong className="text-white text-sm">{selectedContract.title}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('admin.contracts.table_party')}</span>
                                    <strong className="text-violet-400 font-semibold">{selectedContract.user?.name}</strong>
                                    <span className="text-[10px] text-slate-500 block font-mono">{selectedContract.user?.email}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('admin.contracts.table_type')}</span>
                                    <span className="font-bold text-slate-300">
                                        {selectedContract.party_type === 'company' ? t('admin.contracts.party_logistics_company') : t('admin.contracts.party_investor_funding')}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('admin.contracts.table_commission_terms')}</span>
                                    <strong className="text-violet-400 font-mono text-sm font-bold">
                                        {selectedContract.commission_rate || selectedContract.rate || 0}%
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('admin.contracts.field_start_date')}</span>
                                    <strong className="text-slate-300 font-mono">{selectedContract.start_date || '-'}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 block mb-0.5">{t('admin.contracts.field_end_date')}</span>
                                    <strong className="text-slate-300 font-mono">{selectedContract.end_date || t('admin.contracts.open_ended')}</strong>
                                </div>
                            </div>

                            {/* Clauses & Terms Content */}
                            <div>
                                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">{t('admin.contracts.terms_section_title')}</span>
                                <div 
                                    className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed max-h-72 overflow-y-auto custom-scrollbar text-xs leading-relaxed"
                                    dangerouslySetInnerHTML={{ 
                                        __html: selectedContract.terms_text || selectedContract.terms_content || selectedContract.content || `<p>${t('admin.contracts.terms_default_text')}</p>` 
                                    }}
                                />
                            </div>

                            {/* Signatures Status */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
                                    <ShieldCheck className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                                    <div>
                                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('admin.contracts.field_admin_signature')}</span>
                                        <span className="font-bold text-violet-600 dark:text-violet-400 text-xs">{t('admin.contracts.seal_status_val')} ✓</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 flex items-center gap-3">
                                    {selectedContract.signed_at ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400 shrink-0" />
                                            <div>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('admin.contracts.party_signature_label')}</span>
                                                <span className="font-bold text-violet-600 dark:text-violet-400 text-xs">
                                                    {t('admin.contracts.signed_on', { date: new Date(selectedContract.signed_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') })}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                                            <div>
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{t('admin.contracts.party_signature_label')}</span>
                                                <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">{t('admin.contracts.awaiting_sign')}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                    <a
                                        href={route('admin.contracts.view-pdf', selectedContract.id)}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
                                    >
                                        <Printer className="w-4 h-4" />
                                        <span>{t('admin.contracts.btn_preview_doc')}</span>
                                    </a>
                                    <a
                                        href={route('admin.contracts.pdf', selectedContract.id)}
                                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span>{t('admin.contracts.btn_download_file')}</span>
                                    </a>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setDetailsModalOpen(false)}
                                    className="px-5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </AuthenticatedLayout>
    );
}
