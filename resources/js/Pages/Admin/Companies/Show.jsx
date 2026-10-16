import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import StatCard from '../../../Components/StatCard';
import Modal from '../../../Components/Modal';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import Badge from '../../../Components/Badge';
import PhoneDisplay from '../../../Components/PhoneDisplay';
import {
    Building2,
    Wallet,
    TrendingUp,
    Truck,
    Key,
    Receipt,
    DollarSign,
    FileText,
    ArrowDownToLine,
    ArrowUpRight,
    ArrowDownLeft,
    Check,
    Copy,
    PlusCircle,
    Trash2,
    Download,
    ChevronLeft,
    Shield,
    FormInput,
    Server,
    ShieldCheck,
    CheckCircle2,
    RefreshCw,
} from 'lucide-react';

export default function AdminCompanyShow({ company, profileStats }) {
    const { t, isAr } = useTranslation();
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('wallets'); // wallets, keys, tasks, test_tasks, withdrawals
    const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [confirmRevokeTarget, setConfirmRevokeTarget] = useState(null);
    const [promoteModalOpen, setPromoteModalOpen] = useState(false);
    const [switchTestModalOpen, setSwitchTestModalOpen] = useState(false);

    const fundingWallet = company.user?.wallets?.find((w) => w.wallet_type === 'company_funding');
    const debtWallet = company.user?.wallets?.find((w) => w.wallet_type === 'company_debt');

    // Combine transactions
    const allTransactions = (fundingWallet?.transactions || [])
        .concat(debtWallet?.transactions || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // API Key Form
    const {
        data: keyData,
        setData: setKeyData,
        post: postKey,
        processing: keyProcessing,
    } = useForm({
        key_name: `Key - ${company.company_name}`,
        environment: company.environment || 'test',
    });

    // Environment Toggle Form
    const {
        data: envData,
        setData: setEnvData,
        post: postEnv,
        processing: envProcessing,
    } = useForm({
        environment: 'live',
        test_notes: company.test_notes || '',
    });

    const handleOpenPromote = () => {
        setEnvData({
            environment: 'live',
            test_notes: company.test_notes || '',
        });
        setPromoteModalOpen(true);
    };

    const handleOpenSwitchTest = () => {
        setEnvData({
            environment: 'test',
            test_notes: company.test_notes || '',
        });
        setSwitchTestModalOpen(true);
    };

    const handlePromoteSubmit = (e) => {
        e.preventDefault();
        postEnv(route('admin.companies.toggle-environment', company.id), {
            preserveState: true,
            onSuccess: () => setPromoteModalOpen(false),
        });
    };

    const handleSwitchTestSubmit = (e) => {
        e.preventDefault();
        postEnv(route('admin.companies.toggle-environment', company.id), {
            preserveState: true,
            onSuccess: () => setSwitchTestModalOpen(false),
        });
    };

    const handleKeySubmit = (e) => {
        e.preventDefault();
        postKey(route('admin.companies.api-key', company.id), {
            onSuccess: () => setApiKeyModalOpen(false),
        });
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 2000);
    };

    const handleRevokeKey = (keyId) => {
        setConfirmRevokeTarget(keyId);
    };

    const confirmRevoke = () => {
        if (confirmRevokeTarget) {
            router.delete(route('company.api.revoke', confirmRevokeTarget), {
                onSuccess: () => setConfirmRevokeTarget(null),
                onFinish: () => setConfirmRevokeTarget(null),
            });
        }
    };

    return (
        <AuthenticatedLayout title={t('admin.companies.show_title', { name: company.company_name })}>
            <Head title={t('admin.companies.show_title', { name: company.company_name })} />

            <AdminPageHeader
                title={t('admin.companies.show_title', { name: company.company_name })}
                subtitle={t('admin.companies.show_registered_since', { city: company.city, date: new Date(company.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') })}
                icon={Building2}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/10 border-blue-500/20"
                breadcrumbs={[
                    { label: t('admin.nav.companies'), href: route('admin.companies.index') },
                    { label: company.company_name },
                ]}
                badge={<Badge status={company.status} />}
                actions={
                    <Link
                        href={route('admin.companies.index')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                        <span>{t('admin.companies.show_btn_back')}</span>
                    </Link>
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
                    title={t('admin.companies.show_stat_avail_funding')}
                    value={`${parseFloat(profileStats?.funding_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.companies.show_stat_avail_funding_sub')}
                    icon={DollarSign}
                    color="brand"
                />
                <StatCard
                    title={t('admin.companies.show_stat_debt_balance')}
                    value={`${parseFloat(profileStats?.debt_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.companies.show_stat_debt_balance_sub')}
                    icon={TrendingUp}
                    color="rose"
                />
                <StatCard
                    title={t('admin.companies.show_stat_total_funded')}
                    value={`${parseFloat(profileStats?.total_funded_tasks_volume || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.companies.show_stat_total_funded_sub', { count: company.tasks_count || 0 })}
                    icon={Truck}
                    color="blue"
                />
                <StatCard
                    title={t('admin.companies.show_stat_total_withdrawn')}
                    value={`${parseFloat(profileStats?.total_withdrawals || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.companies.show_stat_total_withdrawn_sub')}
                    icon={ArrowDownToLine}
                    color="purple"
                />
            </div>

            {/* Company Info Summary Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>{t('admin.companies.show_business_info_title')}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.field_company_name')}</span>
                        <span className="text-slate-200 font-bold">{company.company_name}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.field_cr')}</span>
                        <span className="font-mono text-slate-200 font-bold">{company.cr_number || '-'}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.field_city')}</span>
                        <span className="text-slate-200 font-bold">{company.city || '-'}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.table_commission')}</span>
                        <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                            {company.platform_commission_rate}%
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.table_contact_person')}</span>
                        <span className="text-slate-200 font-bold">{company.contact_person || company.user?.name}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.field_email')}</span>
                        <span className="font-mono text-slate-200 font-bold select-all">{company.contact_email || company.user?.email}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.field_phone')}</span>
                        <PhoneDisplay countryCode={company.user?.country_code} phone={company.user?.phone || company.contact_phone} />
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.companies.table_status')}</span>
                        <Badge status={company.status} />
                    </div>
                </div>

                {/* Additional Dynamic Data Fields if any */}
                {company.user?.additional_data && Object.keys(company.user.additional_data).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-1.5">
                            <FormInput className="w-3.5 h-3.5" />
                            <span>{t('admin.companies.show_extra_info_title')}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(company.user.additional_data).map(([key, val]) => (
                                <div key={key} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                    <span className="text-[11px] text-slate-400 block mb-1">{key}</span>
                                    <span className="text-xs font-bold text-slate-200 font-mono">
                                        {typeof val === 'boolean' ? (val ? t('common.yes') : t('common.no')) : String(val || '-')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* API Integration Environment Banner Card */}
            <div className={`p-6 rounded-3xl mb-8 border backdrop-blur-xl shadow-xl transition-all ${
                company.environment === 'live'
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-amber-950/20 border-amber-500/30'
            }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                            company.environment === 'live'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                            {company.environment === 'live' ? <ShieldCheck className="w-6 h-6" /> : <Server className="w-6 h-6" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                <h4 className="text-base font-bold text-white">
                                    {t('admin.companies.show_env_card_title')}
                                </h4>
                                {company.environment === 'live' ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        {t('admin.companies.show_env_live_badge')}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                                        {t('admin.companies.show_env_test_badge')}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl mb-2">
                                {company.environment === 'live'
                                    ? t('admin.companies.show_env_live_desc')
                                    : t('admin.companies.show_env_test_desc')}
                            </p>
                            {company.environment === 'live' && company.test_mode_approved_at && (
                                <p className="text-[11px] text-emerald-400/90 font-mono">
                                    {t('admin.companies.approved_by_info', {
                                        admin: company.approved_by_admin?.name || t('admin.companies.ph_admin_signature'),
                                        date: new Date(company.test_mode_approved_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US'),
                                    })}
                                </p>
                            )}
                            {company.test_notes && (
                                <p className="text-[11px] text-slate-400 mt-1 italic">
                                    "{company.test_notes}"
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {company.environment === 'live' ? (
                            <button
                                type="button"
                                onClick={handleOpenSwitchTest}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
                            >
                                <RefreshCw className="w-4 h-4" />
                                <span>{t('admin.companies.btn_switch_to_test')}</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleOpenPromote}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{t('admin.companies.btn_promote_to_live')}</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'wallets', label: t('admin.companies.show_tab_wallets'), icon: Wallet, count: allTransactions.length },
                    { key: 'keys', label: t('admin.companies.show_tab_keys'), icon: Key, count: company.api_keys?.length || 0 },
                    { key: 'tasks', label: t('admin.companies.show_tab_tasks'), icon: Truck, count: company.tasks?.length || 0 },
                    { key: 'test_tasks', label: t('admin.companies.show_tab_test_tasks'), icon: Server, count: company.test_tasks?.length || profileStats?.total_test_tasks_count || 0 },
                    { key: 'withdrawals', label: t('admin.companies.show_tab_withdrawals'), icon: ArrowDownToLine, count: company.withdrawal_requests?.length || 0 },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                                isActive
                                    ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                                    : 'bg-slate-100 dark:bg-slate-900/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Tab 1: Wallets & Transactions */}
            {activeTab === 'wallets' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">{t('admin.companies.show_ledger_title')}</h4>
                        <span className="text-xs text-slate-400">{t('admin.companies.show_ledger_sub')}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.companies.show_tx_num')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.show_tx_wallet_type')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.show_tx_action_type')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.show_tx_amount')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.show_tx_balance_after')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.show_tx_desc')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.show_tx_datetime')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {allTransactions.length > 0 ? (
                                    allTransactions.map((tx) => {
                                        const isCredit = tx.type === 'credit';
                                        return (
                                            <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-mono text-slate-400 font-bold">
                                                    #{tx.transaction_number}
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono">
                                                        {tx.wallet?.wallet_type === 'company_funding' ? t('admin.companies.wallet_funding') : t('admin.companies.wallet_debt')}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 font-bold ${isCredit ? 'text-violet-400' : 'text-rose-400'}`}>
                                                        {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                        {isCredit ? t('admin.companies.action_credit') : t('admin.companies.action_debit')}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-sm">
                                                    <span className={isCredit ? 'text-violet-400' : 'text-rose-400'}>
                                                        {isCredit ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en-US')} {t('common.sar')}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-slate-200">
                                                    {parseFloat(tx.balance_after).toLocaleString('en-US')} {t('common.sar')}
                                                </td>
                                                <td className="p-4 text-slate-300">{tx.description || '-'}</td>
                                                <td className="p-4 font-mono text-slate-500 text-[11px]">
                                                    {new Date(tx.created_at).toLocaleString('ar-SA')}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            {t('admin.companies.empty_company_wallets')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: API Keys */}
            {activeTab === 'keys' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setApiKeyModalOpen(true)}
                            className="px-4 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-lg shadow-violet-950/50"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>{t('admin.companies.show_btn_generate_key')}</span>
                        </button>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs text-slate-300">
                                <thead>
                                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                        <th className="p-4 text-start">{t('admin.companies.show_table_key_name')}</th>
                                        <th className="p-4 text-start">{t('admin.companies.show_table_key_prefix')}</th>
                                        <th className="p-4 text-start">{t('admin.companies.show_table_key_last_used')}</th>
                                        <th className="p-4 text-start">{t('admin.companies.show_table_key_status')}</th>
                                        <th className="p-4 text-start">{t('admin.companies.show_table_key_created_at')}</th>
                                        <th className="p-4 text-center">{t('admin.companies.show_table_key_disable')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {company.api_keys && company.api_keys.length > 0 ? (
                                        company.api_keys.map((k) => (
                                            <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-bold text-slate-200">{k.key_name}</td>
                                                <td className="p-4 font-mono text-violet-400 font-bold">{k.key_prefix}...</td>
                                                <td className="p-4 font-mono text-slate-400">
                                                    {k.last_used_at ? new Date(k.last_used_at).toLocaleString(isAr ? 'ar-SA' : 'en-US') : t('admin.companies.never_used')}
                                                </td>
                                                <td className="p-4"><Badge status={k.status} /></td>
                                                <td className="p-4 font-mono text-slate-500 text-[11px]">
                                                    {new Date(k.created_at).toLocaleDateString('ar-SA')}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {k.status === 'active' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRevokeKey(k.id)}
                                                            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                            title={t('admin.companies.btn_disable_key')}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="p-8 text-center text-slate-500">
                                                {t('admin.companies.empty_keys')}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 3: Tasks */}
            {activeTab === 'tasks' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.companies.table_task_id')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_external_id')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_route')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_task_amount')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_platform_comm')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_net_funding')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_status')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {company.tasks && company.tasks.length > 0 ? (
                                    company.tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono text-blue-400 font-bold">
                                                <Link href={route('admin.tasks.show', task.id)} className="hover:underline">
                                                    {task.task_number}
                                                </Link>
                                            </td>
                                            <td className="p-4 font-mono text-slate-400">{task.external_task_id || '-'}</td>
                                            <td className="p-4 text-slate-300">
                                                {task.pickup_city} ➔ {task.dropoff_city}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-white">
                                                {parseFloat(task.amount).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4 font-mono text-rose-400">
                                                -{parseFloat(task.platform_commission_amount).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-violet-400">
                                                {parseFloat(task.net_funding_amount).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4"><Badge status={task.status} /></td>
                                            <td className="p-4 font-mono text-slate-500 text-[11px]">
                                                {new Date(task.created_at).toLocaleDateString('ar-SA')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="p-8 text-center text-slate-500">
                                            {t('admin.companies.empty_company_tasks')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Withdrawals & Debts */}
            {activeTab === 'withdrawals' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.companies.table_withdrawal_id')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_tasks_count_withdrawn')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_req_amount')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_due_date_debt')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_status')}</th>
                                    <th className="p-4 text-center">{t('admin.companies.table_withdrawal_contract')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {company.withdrawal_requests && company.withdrawal_requests.length > 0 ? (
                                    company.withdrawal_requests.map((w) => (
                                        <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono text-slate-300 font-bold">
                                                #{w.request_number}
                                            </td>
                                            <td className="p-4 font-mono text-slate-400">{w.items_count || w.items?.length || 1} {t('common.tasks')}</td>
                                            <td className="p-4 font-mono font-bold text-violet-400 text-sm">
                                                {parseFloat(w.requested_amount || w.total_amount || 0).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4 font-mono text-rose-400 font-bold">
                                                {w.debt?.due_date || '-'}
                                            </td>
                                            <td className="p-4"><Badge status={w.status} /></td>
                                            <td className="p-4 text-center">
                                                {w.status === 'approved' ? (
                                                    <a
                                                        href={route('admin.withdrawals.pdf', w.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 text-xs font-bold transition-colors inline-flex items-center gap-1"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>{t('admin.companies.btn_download_contract_file')}</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-600 text-xs">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            {t('admin.companies.empty_company_withdrawals')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 5: Test Tasks (Sandbox) */}
            {activeTab === 'test_tasks' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h4 className="font-bold text-white text-sm flex items-center gap-2">
                                <Server className="w-4 h-4 text-amber-400" />
                                <span>{t('admin.companies.show_tab_test_tasks')}</span>
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {t('admin.companies.show_stat_test_tasks_sub')}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono px-3 py-1 bg-slate-800 text-slate-300 rounded-xl border border-slate-700">
                                {t('admin.companies.show_stat_test_tasks')}: {company.test_tasks?.length || 0}
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.companies.table_test_task_number')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_external_id')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_route')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_task_amount')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_test_mock_funding')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_status')}</th>
                                    <th className="p-4 text-start">{t('admin.companies.table_date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {company.test_tasks && company.test_tasks.length > 0 ? (
                                    company.test_tasks.map((task) => (
                                        <tr key={task.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono font-bold text-amber-400">
                                                {task.task_number}
                                            </td>
                                            <td className="p-4 font-mono text-slate-400 font-bold">
                                                {task.external_task_id || '-'}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-semibold text-slate-200">
                                                    {task.pickup_city || '-'} ➔ {task.dropoff_city || '-'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-mono font-bold text-blue-400">
                                                {parseFloat(task.funding_amount).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4">
                                                {task.is_mock_funded ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        {t('admin.companies.mock_funded_yes')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-normal bg-slate-800 text-slate-400">
                                                        {t('admin.companies.mock_funded_no')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <Badge status={task.status} />
                                            </td>
                                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                                                {new Date(task.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-slate-500">
                                            <Server className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                                            <p>{t('admin.companies.empty_test_tasks')}</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Generate API Key Modal */}
            <Modal
                isOpen={apiKeyModalOpen}
                onClose={() => setApiKeyModalOpen(false)}
                title={t('admin.companies.show_btn_generate_key')}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleKeySubmit} className="space-y-4">
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
                            onClick={() => setApiKeyModalOpen(false)}
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

            {/* Revoke API Key Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!confirmRevokeTarget}
                onClose={() => setConfirmRevokeTarget(null)}
                onConfirm={confirmRevoke}
                title={t('admin.companies.disable_key_dialog_title')}
                message={t('admin.companies.disable_key_dialog_msg')}
                confirmText={t('admin.companies.disable_key_dialog_confirm')}
                cancelText={t('common.cancel')}
                type="danger"
            />

            {/* Promote to Live Modal */}
            <Modal
                isOpen={promoteModalOpen}
                onClose={() => setPromoteModalOpen(false)}
                title={t('admin.companies.promote_dialog_title')}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handlePromoteSubmit} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-emerald-300">
                        {t('admin.companies.promote_dialog_desc')}
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            {t('admin.companies.promote_notes_label')}
                        </label>
                        <textarea
                            value={envData.test_notes}
                            onChange={(e) => setEnvData('test_notes', e.target.value)}
                            placeholder={t('admin.companies.promote_notes_ph')}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setPromoteModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={envProcessing}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {envProcessing ? t('admin.companies.promoting_in_progress') : t('admin.companies.btn_confirm_promote')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Switch to Test Modal */}
            <Modal
                isOpen={switchTestModalOpen}
                onClose={() => setSwitchTestModalOpen(false)}
                title={t('admin.companies.switch_test_dialog_title')}
                maxWidth="max-w-lg"
            >
                <form onSubmit={handleSwitchTestSubmit} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-amber-300">
                        {t('admin.companies.switch_test_dialog_desc')}
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            {t('admin.companies.switch_test_notes_label')}
                        </label>
                        <textarea
                            value={envData.test_notes}
                            onChange={(e) => setEnvData('test_notes', e.target.value)}
                            placeholder={t('admin.companies.switch_test_notes_ph')}
                            rows={3}
                            className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setSwitchTestModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={envProcessing}
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {envProcessing ? t('common.loading') : t('admin.companies.btn_confirm_switch_test')}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
