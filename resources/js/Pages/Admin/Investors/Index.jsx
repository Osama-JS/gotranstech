import React, { useState } from 'react';
import { Head, router, useForm, Link } from '@inertiajs/react';
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
    Users,
    Search,
    Edit3,
    Key,
    ShieldAlert,
    CheckCircle2,
    TrendingUp,
    Power,
    PlusCircle,
    Eye,
    Lock,
    Calendar,
    Wallet,
    Percent,
    Building2,
    RefreshCw,
    FileText,
    Clock,
} from 'lucide-react';

export default function AdminInvestors({ investors, stats, filters }) {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from || '');
    const [dateTo, setDateTo] = useState(filters?.date_to || '');

    // Modals state
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [resetPassModalOpen, setResetPassModalOpen] = useState(false);
    const [selectedInvestor, setSelectedInvestor] = useState(null);
    const [confirmStatusTarget, setConfirmStatusTarget] = useState(null);

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
        national_id: '',
        bank_name: t('admin.investors.bank_alrajhi'),
        bank_iban: '',
        platform_commission_share_rate: '70',
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
        national_id: '',
        bank_name: '',
        bank_iban: '',
        platform_commission_share_rate: '70',
        status: 'active',
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

    // Filter Trigger
    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(
            route('admin.investors.index'),
            { search, status, date_from: dateFrom, date_to: dateTo },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        router.get(route('admin.investors.index'));
    };

    // Open Create Modal
    const handleOpenCreateModal = () => {
        resetCreate();
        setCreateModalOpen(true);
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        postCreate(route('admin.investors.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                resetCreate();
            },
        });
    };

    // Open Edit Modal
    const handleOpenEditModal = (inv) => {
        setSelectedInvestor(inv);
        setEditData({
            name: inv.name || '',
            email: inv.email || '',
            country_code: inv.country_code || '+966',
            phone: inv.phone || '',
            national_id: inv.investor_profile?.national_id || '',
            bank_name: inv.investor_profile?.bank_name || t('admin.investors.bank_alrajhi'),
            bank_iban: inv.investor_profile?.bank_iban || '',
            platform_commission_share_rate: inv.investor_profile?.platform_commission_share_rate || '70',
            status: inv.status || 'active',
        });
        setEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(route('admin.investors.update', selectedInvestor.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                resetEdit();
            },
        });
    };

    // Open Reset Password Modal
    const handleOpenResetPassModal = (inv) => {
        setSelectedInvestor(inv);
        resetPass();
        setResetPassModalOpen(true);
    };

    const handleResetPassSubmit = (e) => {
        e.preventDefault();
        postPass(route('admin.investors.reset-password', selectedInvestor.id), {
            onSuccess: () => {
                setResetPassModalOpen(false);
                resetPass();
            },
        });
    };

    // Toggle Status
    const handleToggleStatus = (inv) => {
        setConfirmStatusTarget(inv);
    };

    const confirmToggleStatus = () => {
        if (confirmStatusTarget) {
            router.post(route('admin.investors.status', confirmStatusTarget.id), {}, {
                preserveState: true,
                onSuccess: () => setConfirmStatusTarget(null),
                onFinish: () => setConfirmStatusTarget(null),
            });
        }
    };

    const statusOptions = [
        { value: '', label: t('admin.investors.filter_all_statuses') },
        { value: 'active', label: t('admin.investors.filter_status_active') },
        { value: 'suspended', label: t('admin.investors.filter_status_suspended') },
        { value: 'pending', label: t('admin.investors.filter_status_pending') },
        { value: 'inactive', label: t('admin.investors.filter_status_inactive') },
    ];

    const bankOptions = [
        { value: t('admin.investors.bank_alrajhi'), label: `${t('admin.investors.bank_alrajhi')} (Al Rajhi Bank)` },
        { value: t('admin.investors.bank_snb'), label: t('admin.investors.bank_snb') },
        { value: t('admin.investors.bank_riyad'), label: t('admin.investors.bank_riyad') },
        { value: t('admin.investors.bank_alinma'), label: t('admin.investors.bank_alinma') },
        { value: t('admin.investors.bank_sab'), label: t('admin.investors.bank_sab') },
        { value: t('admin.investors.bank_anb'), label: t('admin.investors.bank_anb') },
        { value: t('admin.investors.bank_albilad'), label: t('admin.investors.bank_albilad') },
        { value: t('admin.investors.bank_aljazira'), label: t('admin.investors.bank_aljazira') },
    ];

    return (
        <AuthenticatedLayout title={t('admin.investors.page_title')}>
            <Head title={t('admin.investors.page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('admin.investors.header_title')}
                subtitle={t('admin.investors.header_subtitle')}
                icon={Users}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/10 border-violet-500/20"
                breadcrumbs={[{ label: t('admin.nav.items.investors') }]}
                badge={t('admin.investors.badge_total', { count: stats?.total || 0 })}
                actions={
                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="px-4 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center gap-2 cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>{t('admin.investors.btn_create')}</span>
                    </button>
                }
            />

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title={t('admin.investors.stat_total')}
                    value={stats?.total || 0}
                    subtitle={t('admin.investors.stat_active_subtitle', { count: stats?.active || 0 })}
                    icon={Users}
                    color="brand"
                />
                <StatCard
                    title={t('admin.investors.stat_pending')}
                    value={stats?.suspended || 0}
                    subtitle={t('admin.investors.stat_pending_subtitle')}
                    icon={ShieldAlert}
                    color="amber"
                />
                <StatCard
                    title={t('admin.investors.stat_total_balance')}
                    value={`${parseFloat(stats?.total_investment_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.investors.stat_ready_subtitle')}
                    icon={Wallet}
                    color="cyan"
                />
                <StatCard
                    title={t('admin.investors.stat_total_profit')}
                    value={`${parseFloat(stats?.total_commission_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.investors.stat_total_profit_subtitle')}
                    icon={TrendingUp}
                    color="purple"
                />
            </div>

            {/* Advanced Filters Panel */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 rounded-3xl mb-6 shadow-xl relative z-30 overflow-visible">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    {/* Search Input */}
                    <div className="lg:col-span-2 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400">{t('admin.investors.filter_search_label')}</label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('admin.investors.filter_search_ph')}
                                className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Status Filter (SearchableSelect) */}
                    <SearchableSelect
                        label={t('admin.investors.filter_status_label')}
                        options={statusOptions}
                        value={status}
                        onChange={(val) => setStatus(val)}
                        placeholder={t('admin.investors.filter_all_statuses')}
                    />

                    {/* Date From */}
                    <DatePicker
                        label={t('admin.investors.filter_date_from')}
                        value={dateFrom}
                        onChange={(val) => setDateFrom(val)}
                        placeholder={t('admin.investors.filter_date_from_ph')}
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>{t('admin.investors.btn_filter')}</span>
                        </button>
                        {(search || status || dateFrom || dateTo) && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs transition-colors cursor-pointer"
                                title={t('admin.investors.btn_reset_filters')}
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Investors Table */}
            <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
                <div className="overflow-x-auto">
                    <table className="w-full text-start text-xs text-slate-300">
                        <thead>
                            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                <th className="p-4 text-start">{t('admin.investors.table_investor')}</th>
                                <th className="p-4 text-start">{t('admin.investors.table_phone')}</th>
                                <th className="p-4 text-start">{t('admin.investors.table_invest_balance')}</th>
                                <th className="p-4 text-start">{t('admin.investors.table_profit_balance')}</th>
                                <th className="p-4 text-start">{t('admin.investors.table_profit_rate')}</th>
                                <th className="p-4 text-start">{t('admin.investors.table_funded_tasks')}</th>
                                <th className="p-4 text-start">{t('admin.investors.table_status')}</th>
                                <th className="p-4 text-start">{t('admin.investors.table_kyc_contract')}</th>
                                <th className="p-4 text-center">{t('admin.investors.table_actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {investors.data.length > 0 ? (
                                investors.data.map((inv) => {
                                    const invWallet = inv.wallets?.find((w) => w.wallet_type === 'investor_investment');
                                    const commWallet = inv.wallets?.find((w) => w.wallet_type === 'investor_commission');
                                    const shareRate = inv.investor_profile?.platform_commission_share_rate || 70;

                                    return (
                                        <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                        {inv.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            href={route('admin.investors.show', inv.id)}
                                                            className="font-bold text-slate-100 hover:text-violet-400 transition-colors block"
                                                        >
                                                            {inv.name}
                                                        </Link>
                                                        <span className="text-[11px] text-slate-400 font-mono block">{inv.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <PhoneDisplay countryCode={inv.country_code} phone={inv.phone} />
                                            </td>
                                            <td className="p-4 font-mono font-bold text-violet-400">
                                                {parseFloat(invWallet?.balance || 0).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-blue-400">
                                                {parseFloat(commWallet?.balance || 0).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-xl border border-violet-500/20">
                                                    {shareRate}%
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono text-slate-300">{inv.funded_tasks_count || 0}</td>
                                            <td className="p-4">
                                                <Badge status={inv.status} />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1 items-start">
                                                    {inv.agreement_signed_at ? (
                                                        <Link
                                                            href={inv.contracts?.[0]?.id ? route('admin.contracts.show', inv.contracts[0].id) : route('admin.investors.show', inv.id)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-[#6320EE]/10 hover:bg-[#6320EE]/20 text-[#6320EE] dark:text-violet-300 border border-violet-500/20 text-[11px] font-bold transition-colors cursor-pointer"
                                                            title={t('admin.investors.contract_signed_on', { date: new Date(inv.agreement_signed_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') })}
                                                        >
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-[#6320EE]" />
                                                            <span>{t('admin.investors.contract_signed', { number: inv.contracts?.[0]?.contract_number ? `#${inv.contracts[0].contract_number}` : '' })}</span>
                                                        </Link>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[11px] font-medium">
                                                            <Clock className="w-3 h-3 text-orange-500" />
                                                            <span>{t('admin.investors.contract_pending')}</span>
                                                        </span>
                                                    )}

                                                    {inv.form_template_id || (inv.additional_data && Object.keys(inv.additional_data).length > 0) ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                                                            <CheckCircle2 className="w-2.5 h-2.5" />
                                                            <span>{t('admin.investors.kyc_complete')}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 text-[10px]">
                                                            <span>{t('admin.investors.kyc_incomplete')}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={route('admin.investors.show', inv.id)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                                        title={t('admin.investors.btn_view_profile')}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(inv)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                        title={t('admin.investors.btn_edit_profile')}
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenResetPassModal(inv)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                                        title={t('admin.investors.btn_reset_pass')}
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleStatus(inv)}
                                                        className={`p-2 rounded-xl transition-colors ${
                                                            inv.status === 'active'
                                                                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                                                                : 'text-slate-400 hover:text-violet-400 hover:bg-violet-500/10'
                                                        }`}
                                                        title={inv.status === 'active' ? t('admin.investors.btn_suspend_account') : t('admin.investors.btn_activate_account')}
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
                                        {t('admin.investors.empty_investors')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4">
                    <Pagination
                        links={investors.links}
                        from={investors.from}
                        to={investors.to}
                        total={investors.total}
                    />
                </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* Create Investor Modal */}
            {/* ------------------------------------------------------------- */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title={t('admin.investors.create_modal_title')}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_investor_name')}</label>
                            <input
                                type="text"
                                value={createData.name}
                                onChange={(e) => setCreateData('name', e.target.value)}
                                placeholder={t('admin.investors.ph_investor_name')}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                required
                            />
                            {createErrors.name && <p className="text-xs text-rose-400 mt-1">{createErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_email')}</label>
                            <input
                                type="email"
                                value={createData.email}
                                onChange={(e) => setCreateData('email', e.target.value)}
                                placeholder="investor@example.com"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                required
                            />
                            {createErrors.email && <p className="text-xs text-rose-400 mt-1">{createErrors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PhoneInput
                            label={t('admin.investors.field_phone')}
                            countryCode={createData.country_code}
                            onCountryCodeChange={(code) => setCreateData('country_code', code)}
                            value={createData.phone}
                            onChange={(e) => setCreateData('phone', e.target.value)}
                            error={createErrors.phone}
                            required
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_initial_pass')}</label>
                            <input
                                type="password"
                                value={createData.password}
                                onChange={(e) => setCreateData('password', e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                required
                            />
                            {createErrors.password && <p className="text-xs text-rose-400 mt-1">{createErrors.password}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_national_id')}</label>
                            <input
                                type="text"
                                value={createData.national_id}
                                onChange={(e) => setCreateData('national_id', e.target.value)}
                                placeholder="10XXXXXXXX"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                            />
                        </div>

                        <SearchableSelect
                            label={t('admin.investors.field_bank_name')}
                            options={bankOptions}
                            value={createData.bank_name}
                            onChange={(val) => setCreateData('bank_name', val)}
                            placeholder={t('admin.investors.ph_select_bank')}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_iban')}</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={createData.bank_iban}
                                onChange={(e) => setCreateData('bank_iban', e.target.value)}
                                placeholder="SA4480000XXXXXXXXXXXXXXX"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                            />
                            {createErrors.bank_iban && <p className="text-xs text-rose-400 mt-1">{createErrors.bank_iban}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_profit_share')}</label>
                            <div className="relative">
                                <Percent className="w-4 h-4 text-violet-400 absolute end-3.5 top-3" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={createData.platform_commission_share_rate}
                                    onChange={(e) => setCreateData('platform_commission_share_rate', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
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
                            className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {createProcessing ? t('admin.investors.creating_in_progress') : t('admin.investors.btn_submit_create')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* ------------------------------------------------------------- */}
            {/* Edit Investor Modal */}
            {/* ------------------------------------------------------------- */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={t('admin.investors.edit_modal_title', { name: selectedInvestor?.name || '' })}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_investor_name')}</label>
                            <input
                                type="text"
                                value={editData.name}
                                onChange={(e) => setEditData('name', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                required
                            />
                            {editErrors.name && <p className="text-xs text-rose-400 mt-1">{editErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_email')}</label>
                            <input
                                type="email"
                                value={editData.email}
                                onChange={(e) => setEditData('email', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                required
                            />
                            {editErrors.email && <p className="text-xs text-rose-400 mt-1">{editErrors.email}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PhoneInput
                            label={t('admin.investors.field_phone')}
                            countryCode={editData.country_code}
                            onCountryCodeChange={(code) => setEditData('country_code', code)}
                            value={editData.phone}
                            onChange={(e) => setEditData('phone', e.target.value)}
                            error={editErrors.phone}
                            required
                        />

                        <SearchableSelect
                            label={t('admin.investors.field_account_status')}
                            options={statusOptions.filter((o) => o.value !== '')}
                            value={editData.status}
                            onChange={(val) => setEditData('status', val)}
                            placeholder={t('admin.investors.ph_select_status')}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_national_id')}</label>
                            <input
                                type="text"
                                value={editData.national_id}
                                onChange={(e) => setEditData('national_id', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                            />
                        </div>

                        <SearchableSelect
                            label={t('admin.investors.field_bank_name')}
                            options={bankOptions}
                            value={editData.bank_name}
                            onChange={(val) => setEditData('bank_name', val)}
                            placeholder={t('admin.investors.ph_select_bank')}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_iban')}</label>
                            <input
                                type="text"
                                dir="ltr"
                                value={editData.bank_iban}
                                onChange={(e) => setEditData('bank_iban', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_profit_share')}</label>
                            <div className="relative">
                                <Percent className="w-4 h-4 text-violet-400 absolute end-3.5 top-3" />
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="100"
                                    value={editData.platform_commission_share_rate}
                                    onChange={(e) => setEditData('platform_commission_share_rate', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                                    required
                                />
                            </div>
                        </div>
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
                            {editProcessing ? t('admin.investors.saving_in_progress') : t('admin.investors.btn_submit_edit')}
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
                title={t('admin.investors.reset_pass_title', { name: selectedInvestor?.name || '' })}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleResetPassSubmit} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        {t('admin.investors.reset_pass_note')}
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.investors.field_new_pass')}</label>
                        <input
                            type="password"
                            value={passData.password}
                            onChange={(e) => setPassData('password', e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
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
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
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
                            {passProcessing ? t('admin.investors.updating_in_progress') : t('admin.investors.btn_submit_pass')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Status Change Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!confirmStatusTarget}
                onClose={() => setConfirmStatusTarget(null)}
                onConfirm={confirmToggleStatus}
                title={t('admin.investors.status_dialog_title')}
                message={t('admin.investors.status_dialog_msg', { name: confirmStatusTarget?.name })}
                confirmText={t('admin.investors.status_dialog_confirm')}
                cancelText={t('common.cancel')}
                type="warning"
            />
        </AuthenticatedLayout>
    );
}
