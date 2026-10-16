import React, { useState } from 'react';
import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import StatCard from '../../../Components/StatCard';
import SearchableSelect from '../../../Components/SearchableSelect';
import DatePicker from '../../../Components/DatePicker';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import Badge from '../../../Components/Badge';
import PhoneInput from '../../../Components/PhoneInput';
import PhoneDisplay from '../../../Components/PhoneDisplay';
import {
    Building2,
    Search,
    Edit3,
    Key,
    PlusCircle,
    Check,
    Copy,
    ShieldAlert,
    TrendingUp,
    DollarSign,
    Truck,
    Eye,
    Power,
    RefreshCw,
    Percent,
    MapPin,
    Lock,
} from 'lucide-react';

export default function AdminCompanies({ companies, stats, cities = [], filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [environment, setEnvironment] = useState(filters?.environment || '');
    const [city, setCity] = useState(filters?.city || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [keyModalOpen, setKeyModalOpen] = useState(false);
    const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
    const [confirmStatusTarget, setConfirmStatusTarget] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [copiedKey, setCopiedKey] = useState(false);

    // Create Form
    const {
        data: createData,
        setData: setCreateData,
        post: postCreate,
        processing: createProcessing,
        errors: createErrors,
        reset: resetCreate,
    } = useForm({
        name: '',
        email: '',
        country_code: '+966',
        phone: '',
        password: '',
        company_name: '',
        cr_number: '',
        city: t('admin.companies.city_riyadh'),
        platform_commission_rate: '10',
        status: 'active',
    });

    // Edit Form
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
        reset: resetEdit,
    } = useForm({
        name: '',
        email: '',
        country_code: '+966',
        phone: '',
        company_name: '',
        cr_number: '',
        city: '',
        platform_commission_rate: '10',
        status: 'active',
    });

    // API Key Form
    const {
        data: keyData,
        setData: setKeyData,
        post: postKey,
        processing: keyProcessing,
        errors: keyErrors,
    } = useForm({
        key_name: 'Production Server Key',
    });

    // Password Reset Form
    const {
        data: passData,
        setData: setPassData,
        post: postPass,
        processing: passProcessing,
        errors: passErrors,
        reset: resetPass,
    } = useForm({
        password: '',
        password_confirmation: '',
    });

    // Filter Handler
    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.companies.index'),
            { search, status, environment, city, date_from: dateFrom, date_to: dateTo },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setEnvironment('');
        setCity('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.companies.index'));
    };

    // Open Create Modal
    const handleOpenCreateModal = () => {
        resetCreate();
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate(route('admin.companies.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                resetCreate();
            },
        });
    };

    // Open Edit Modal
    const handleOpenEditModal = (comp) => {
        setSelectedCompany(comp);
        setEditData({
            name: comp.contact_person || comp.user?.name || '',
            email: comp.contact_email || comp.user?.email || '',
            country_code: comp.user?.country_code || '+966',
            phone: comp.user?.phone || comp.contact_phone || '',
            company_name: comp.company_name || '',
            cr_number: comp.cr_number || '',
            city: comp.city || t('admin.companies.city_riyadh'),
            platform_commission_rate: comp.platform_commission_rate || '10',
            status: comp.status || 'active',
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(route('admin.companies.update', selectedCompany.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                resetEdit();
            },
        });
    };

    // Open API Key Modal
    const handleOpenKeyModal = (comp) => {
        setSelectedCompany(comp);
        setKeyData({ key_name: `Production Key - ${comp.company_name}` });
        setKeyModalOpen(true);
    };

    const handleKeySubmit = (e) => {
        e.preventDefault();
        postKey(route('admin.companies.api-key', selectedCompany.id), {
            onSuccess: () => setKeyModalOpen(false),
        });
    };

    // Open Password Reset Modal
    const handleOpenResetPassModal = (comp) => {
        setSelectedCompany(comp);
        resetPass();
        setResetPassModalOpen(true);
    };

    const handleResetPassSubmit = (e) => {
        e.preventDefault();
        postPass(route('admin.companies.reset-password', selectedCompany.id), {
            onSuccess: () => {
                setResetPassModalOpen(false);
                resetPass();
            },
        });
    };

    // Toggle Status
    const handleToggleStatus = (comp) => {
        setConfirmStatusTarget(comp);
    };

    const confirmToggleStatus = () => {
        if (confirmStatusTarget) {
            router.post(route('admin.companies.status', confirmStatusTarget.id), {}, {
                preserveState: true,
                onSuccess: () => setConfirmStatusTarget(null),
                onFinish: () => setConfirmStatusTarget(null),
            });
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const statusOptions = [
        { value: '', label: t('admin.companies.filter_all_statuses') },
        { value: 'active', label: t('admin.companies.filter_status_active') },
        { value: 'suspended', label: t('admin.companies.filter_status_suspended') },
        { value: 'pending', label: t('admin.companies.filter_status_pending') },
        { value: 'inactive', label: t('admin.companies.filter_status_inactive') },
    ];

    const environmentOptions = [
        { value: '', label: t('admin.companies.filter_all_environments') },
        { value: 'test', label: t('admin.companies.filter_env_test') },
        { value: 'live', label: t('admin.companies.filter_env_live') },
    ];

    const cityOptions = [
        { value: '', label: t('admin.companies.filter_all_cities') },
        { value: t('admin.companies.city_riyadh'), label: `${t('admin.companies.city_riyadh')} (Riyadh)` },
        { value: t('admin.companies.city_jeddah'), label: `${t('admin.companies.city_jeddah')} (Jeddah)` },
        { value: t('admin.companies.city_dammam'), label: `${t('admin.companies.city_dammam')} (Dammam)` },
        { value: t('admin.companies.city_makkah'), label: `${t('admin.companies.city_makkah')} (Makkah)` },
        { value: t('admin.companies.city_madinah'), label: `${t('admin.companies.city_madinah')} (Madinah)` },
        { value: t('admin.companies.city_khobar'), label: `${t('admin.companies.city_khobar')} (Khobar)` },
        { value: t('admin.companies.city_qassim'), label: `${t('admin.companies.city_qassim')} (Qassim)` },
        { value: t('admin.companies.city_abha'), label: `${t('admin.companies.city_abha')} (Abha)` },
        { value: t('admin.companies.city_tabuk'), label: `${t('admin.companies.city_tabuk')} (Tabuk)` },
    ];

    return (
        <AuthenticatedLayout title={t('admin.companies.page_title')}>
            <Head title={t('admin.companies.page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('admin.companies.header_title')}
                subtitle={t('admin.companies.header_subtitle')}
                icon={Building2}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/10 border-blue-500/20"
                breadcrumbs={[{ label: t('admin.nav.items.companies') }]}
                badge={t('admin.companies.badge_total', { count: stats?.total || 0 })}
                actions={
                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="px-4 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center gap-2 cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>{t('admin.companies.btn_create')}</span>
                    </button>
                }
            />

            {/* Generated API Key Banner */}
            {flash?.generated_key && (
                <div className="bg-violet-950/90 border-2 border-violet-500/60 p-6 rounded-3xl shadow-2xl mb-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-2">
                        <Key className="w-6 h-6 text-violet-400" />
                        <h4 className="font-bold text-white text-base">{t('admin.companies.api_key_generated_title')}</h4>
                    </div>
                    <p className="text-xs text-slate-300 mb-4">
                        {t('admin.companies.api_key_generated_desc')}
                    </p>
                    <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-violet-500/40">
                        <span className="font-mono text-violet-400 font-bold text-sm select-all break-all" dir="ltr">
                            {flash.generated_key}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleCopy(flash.generated_key)}
                            className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
                        >
                            {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedKey ? t('admin.companies.key_copied') : t('admin.companies.btn_copy_key')}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title={t('admin.companies.stat_total_companies')}
                    value={stats?.total || 0}
                    subtitle={`${t('admin.companies.badge_env_live')}: ${stats?.total_live_companies || 0} | ${t('admin.companies.badge_env_test')}: ${stats?.total_test_companies || 0}`}
                    icon={Building2}
                    color="blue"
                />
                <StatCard
                    title={t('admin.companies.stat_suspended_companies')}
                    value={stats?.suspended || 0}
                    subtitle={t('admin.companies.stat_suspended_companies_sub')}
                    icon={ShieldAlert}
                    color="amber"
                />
                <StatCard
                    title={t('admin.companies.stat_avail_funding')}
                    value={`${parseFloat(stats?.total_funding_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.companies.stat_avail_funding_sub')}
                    icon={DollarSign}
                    color="brand"
                />
                <StatCard
                    title={t('admin.companies.stat_debt_total')}
                    value={`${parseFloat(stats?.total_debt_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.companies.stat_debt_total_sub')}
                    icon={TrendingUp}
                    color="rose"
                />
            </div>

            {/* Advanced Filter Bar */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 rounded-3xl mb-6 shadow-xl relative z-30 overflow-visible">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
                    {/* Search */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400">{t('admin.companies.filter_search_label')}</label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('admin.companies.filter_search_ph')}
                                className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <SearchableSelect
                        label={t('admin.companies.filter_status_label')}
                        options={statusOptions}
                        value={status}
                        onChange={(val) => setStatus(val)}
                        placeholder={t('admin.companies.filter_all_statuses')}
                    />

                    {/* Environment Filter */}
                    <SearchableSelect
                        label={t('admin.companies.filter_environment_label')}
                        options={environmentOptions}
                        value={environment}
                        onChange={(val) => setEnvironment(val)}
                        placeholder={t('admin.companies.filter_all_environments')}
                    />

                    {/* City Filter */}
                    <SearchableSelect
                        label={t('admin.companies.filter_city_label')}
                        options={cityOptions}
                        value={city}
                        onChange={(val) => setCity(val)}
                        placeholder={t('admin.companies.filter_city_ph')}
                    />

                    {/* Date From */}
                    <DatePicker
                        label={t('admin.companies.filter_reg_date_from')}
                        value={dateFrom}
                        onChange={(val) => setDateFrom(val)}
                        placeholder={t('admin.investors.filter_date_from_ph')}
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>{t('admin.companies.btn_filter')}</span>
                        </button>
                        {(search || status || environment || city || dateFrom || dateTo) && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs transition-colors cursor-pointer"
                                title={t('admin.companies.btn_reset_filters')}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Companies Table */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs text-slate-300">
                        <thead>
                            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                <th className="p-4 text-start">{t('admin.companies.header_title')}</th>
                                <th className="p-4 text-start">{t('admin.companies.table_environment')}</th>
                                <th className="p-4 text-start">{t('admin.companies.table_cr')}</th>
                                <th className="p-4 text-start">{t('admin.companies.table_contact_person')}</th>
                                <th className="p-4 text-start">{t('admin.companies.table_commission')}</th>
                                <th className="p-4 text-start">{t('admin.companies.table_avail_funding')}</th>
                                <th className="p-4 text-start">{t('admin.companies.table_tasks_count')}</th>
                                <th className="p-4 text-start">{t('admin.companies.table_status')}</th>
                                <th className="p-4 text-center">{t('admin.companies.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {companies.data.length > 0 ? (
                                companies.data.map((comp) => {
                                    const fundingWallet = comp.user?.wallets?.find((w) => w.wallet_type === 'company_funding');
                                    const debtWallet = comp.user?.wallets?.find((w) => w.wallet_type === 'company_debt');

                                    return (
                                        <tr key={comp.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {comp.company_name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={route('admin.companies.show', comp.id)}
                                                            className="font-bold text-slate-100 hover:text-blue-400 transition-colors block"
                                                        >
                                                            {comp.company_name}
                                                        </Link>
                                                        <span className="text-[11px] text-slate-400 block">{comp.city}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {comp.environment === 'live' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                                        {t('admin.companies.badge_env_live')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                                        {t('admin.companies.badge_env_test')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-slate-400 font-bold">{comp.cr_number || '-'}</td>
                                            <td className="p-4 text-slate-300">
                                                <span className="font-semibold block">{comp.contact_person || comp.user?.name}</span>
                                                <span className="text-[11px] text-slate-500 font-mono block">{comp.contact_email || comp.user?.email}</span>
                                                {(comp.user?.phone || comp.contact_phone) && (
                                                    <div className="mt-0.5">
                                                        <PhoneDisplay countryCode={comp.user?.country_code} phone={comp.user?.phone || comp.contact_phone} />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-xl border border-blue-500/20">
                                                    {comp.platform_commission_rate}%
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono font-bold text-violet-400">
                                                {parseFloat(fundingWallet?.balance || 0).toLocaleString('en-US')} {t('common.sar')}
                                                {parseFloat(debtWallet?.balance || 0) > 0 && (
                                                    <span className="text-[10px] text-rose-400 block font-normal">
                                                        {t('admin.companies.debt_label', { amount: parseFloat(debtWallet?.balance || 0).toLocaleString('en-US'), sar: t('common.sar') })}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 font-mono text-slate-300">{comp.tasks_count || 0}</td>
                                            <td className="p-4">
                                                <Badge status={comp.status} />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={route('admin.companies.show', comp.id)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                        title={t('admin.companies.btn_view_profile')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(comp)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                                        title={t('admin.companies.btn_edit_company')}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenKeyModal(comp)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                                        title={t('admin.companies.btn_generate_api')}
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenResetPassModal(comp)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                                        title={t('admin.companies.btn_reset_pass')}
                                                    >
                                                        <Lock className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(comp)}
                                                        className={`p-2 rounded-xl transition-colors ${
                                                            comp.status === 'active'
                                                                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                                                : 'text-slate-400 hover:text-violet-400 hover:bg-violet-500/10'
                                                        }`}
                                                        title={comp.status === 'active' ? t('admin.companies.btn_suspend_company') : t('admin.companies.btn_activate_company')}
                                                    >
                                                        <Power className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-slate-500">
                                        {t('admin.companies.empty_companies')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4">
                    <Pagination
                        links={companies.links}
                        from={companies.from}
                        to={companies.to}
                        total={companies.total}
                    />
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Create Company Modal */}
            {/* ------------------------------------------------------------- */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={t('admin.companies.create_modal_title')}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_company_name')}</label>
                            <input
                                type="text"
                                value={createData.company_name}
                                onChange={(e) => setCreateData('company_name', e.target.value)}
                                placeholder={t('admin.companies.ph_company_name')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {createErrors.company_name && <p className="text-xs text-rose-400 mt-1">{createErrors.company_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_cr')}</label>
                            <input
                                type="text"
                                value={createData.cr_number}
                                onChange={(e) => setCreateData('cr_number', e.target.value)}
                                placeholder="1010XXXXXX"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_rep_name')}</label>
                            <input
                                type="text"
                                value={createData.name}
                                onChange={(e) => setCreateData('name', e.target.value)}
                                placeholder={t('admin.companies.ph_rep_name')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {createErrors.name && <p className="text-xs text-rose-400 mt-1">{createErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_email')}</label>
                            <input
                                type="email"
                                value={createData.email}
                                onChange={(e) => setCreateData('email', e.target.value)}
                                placeholder="api@fastlogistics.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {createErrors.email && <p className="text-xs text-rose-400 mt-1">{createErrors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PhoneInput
                            label={t('admin.companies.field_phone')}
                            countryCode={createData.country_code}
                            onCountryCodeChange={(code) => setCreateData('country_code', code)}
                            value={createData.phone}
                            onChange={(e) => setCreateData('phone', e.target.value)}
                            error={createErrors.phone}
                            required
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_initial_pass')}</label>
                            <input
                                type="password"
                                value={createData.password}
                                onChange={(e) => setCreateData('password', e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {createErrors.password && <p className="text-xs text-rose-400 mt-1">{createErrors.password}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SearchableSelect
                            label={t('admin.companies.field_city')}
                            options={cityOptions.filter((o) => o.value !== '')}
                            value={createData.city}
                            onChange={(val) => setCreateData('city', val)}
                            placeholder={t('admin.companies.ph_select_city')}
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_commission')}</label>
                            <div className="relative">
                                <Percent className="w-4 h-4 text-blue-400 absolute end-3.5 top-3" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={createData.platform_commission_rate}
                                    onChange={(e) => setCreateData('platform_commission_rate', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >{t('common.cancel')}</button>
                        <button
                            type="submit"
                            disabled={createProcessing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {createProcessing ? t('admin.companies.creating_in_progress') : t('admin.companies.btn_submit_create')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ------------------------------------------------------------- */}
            {/* Edit Company Modal */}
            {/* ------------------------------------------------------------- */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={t('admin.companies.edit_modal_title', { name: selectedCompany?.company_name || '' })}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_company_name')}</label>
                            <input
                                type="text"
                                value={editData.company_name}
                                onChange={(e) => setEditData('company_name', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {editErrors.company_name && <p className="text-xs text-rose-400 mt-1">{editErrors.company_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_cr')}</label>
                            <input
                                type="text"
                                value={editData.cr_number}
                                onChange={(e) => setEditData('cr_number', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.table_contact_person')}</label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData('name', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {editErrors.name && <p className="text-xs text-rose-400 mt-1">{editErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_email')}</label>
                            <input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData('email', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {editErrors.email && <p className="text-xs text-rose-400 mt-1">{editErrors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PhoneInput
                            label={t('admin.companies.field_phone')}
                            countryCode={editData.country_code}
                            onCountryCodeChange={(code) => setEditData('country_code', code)}
                            value={editData.phone}
                            onChange={(e) => setEditData('phone', e.target.value)}
                            error={editErrors.phone}
                            required
                        />

                        <SearchableSelect
                            label={t('admin.companies.field_city')}
                            options={cityOptions.filter((o) => o.value !== '')}
                            value={editData.city}
                            onChange={(val) => setEditData('city', val)}
                            placeholder={t('admin.companies.ph_select_city')}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_commission')}</label>
                            <div className="relative">
                                <Percent className="w-4 h-4 text-blue-400 absolute end-3.5 top-3" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={editData.platform_commission_rate}
                                    onChange={(e) => setEditData('platform_commission_rate', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                                    required
                                />
                            </div>
                        </div>

                        <SearchableSelect
                            label={t('admin.companies.table_status')}
                            options={statusOptions.filter((o) => o.value !== '')}
                            value={editData.status}
                            onChange={(val) => setEditData('status', val)}
                            placeholder={t('admin.investors.ph_select_status')}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >{t('common.cancel')}</button>
                        <button
                            type="submit"
                            disabled={editProcessing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {editProcessing ? t('admin.companies.saving_in_progress') : t('admin.companies.btn_submit_edit')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ------------------------------------------------------------- */}
            {/* Generate API Key Modal */}
            {/* ------------------------------------------------------------- */}
            <Modal
                isOpen={keyModalOpen}
                onClose={() => setKeyModalOpen(false)}
                title={t('admin.companies.generate_key_title', { name: selectedCompany?.company_name || '' })}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleKeySubmit} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        {t('admin.companies.generate_key_desc')}
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.companies.field_key_name')}</label>
                        <input
                            type="text"
                            value={keyData.key_name}
                            onChange={(e) => setKeyData('key_name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setKeyModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >{t('common.cancel')}</button>
                        <button
                            type="submit"
                            disabled={keyProcessing}
                            className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {keyProcessing ? t('admin.companies.generating_in_progress') : t('admin.companies.btn_submit_generate_key')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ------------------------------------------------------------- */}
            {/* Reset Password Modal */}
            {/* ------------------------------------------------------------- */}
            <Modal
                isOpen={resetPassModalOpen}
                onClose={() => setResetPassModalOpen(false)}
                title={t('admin.companies.reset_pass_title', { name: selectedCompany?.company_name || '' })}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleResetPassSubmit} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        {t('admin.companies.reset_pass_desc')}
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_new_pass')}</label>
                        <input
                            type="password"
                            value={passData.password}
                            onChange={(e) => setPassData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                        {passErrors.password && <p className="text-xs text-rose-400 mt-1">{passErrors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_confirm_pass')}</label>
                        <input
                            type="password"
                            value={passData.password_confirmation}
                            onChange={(e) => setPassData('password_confirmation', e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setResetPassModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >{t('common.cancel')}</button>
                        <button
                            type="submit"
                            disabled={passProcessing}
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {passProcessing ? t('admin.companies.updating_in_progress') : t('admin.companies.btn_submit_pass')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Status Change Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!confirmStatusTarget}
                onClose={() => setConfirmStatusTarget(null)}
                onConfirm={confirmToggleStatus}
                title={t('admin.companies.status_dialog_title')}
                message={t('admin.companies.status_dialog_msg', { name: confirmStatusTarget?.company_name })}
                confirmText={t('admin.companies.status_dialog_confirm')}
                cancelText={t('common.cancel')}
                type="warning"
            />
        </AuthenticatedLayout>
    );
}
