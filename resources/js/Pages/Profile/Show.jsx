import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import LegalAgreementModal from '@/Components/LegalAgreementModal';
import { useTranslation } from '@/Utils/i18n';
import {
    User,
    Lock,
    Key,
    ShieldCheck,
    Building2,
    Wallet,
    CreditCard,
    FileText,
    Calendar,
    Phone,
    Mail,
    CheckCircle2,
    Eye,
    EyeOff,
    AlertCircle,
    Clock,
    Hash,
    Sparkles,
} from 'lucide-react';

export default function ProfileShow({
    user,
    activeContract,
    recentActivities = [],
    roles = [],
    permissions = [],
}) {
    const { t, locale } = useTranslation();
    const [activeTab, setActiveTab] = useState('overview'); // overview, edit, security
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [agreementModalOpen, setAgreementModalOpen] = useState(false);
    const [supportModalOpen, setSupportModalOpen] = useState(false);

    // If account is active, official and banking data are locked and protected
    const isLockedAccount = user.status === 'active' && user.user_type !== 'admin';

    // Profile Edit Form
    const {
        data: profileData,
        setData: setProfileData,
        put: putProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        phone_country_code: user.country_code || user.phone_country_code || '+966',
        // Investor fields
        national_id: user.investor_profile?.national_id || '',
        bank_name: user.investor_profile?.bank_name || user.company_profile?.bank_name || '',
        iban: user.investor_profile?.iban || user.company_profile?.iban || '',
        // Company fields
        company_name: user.company_profile?.company_name || '',
        commercial_registration: user.company_profile?.commercial_registration || '',
        tax_number: user.company_profile?.tax_number || '',
    });

    // Password Update Form
    const {
        data: passData,
        setData: setPassData,
        put: putPass,
        processing: passProcessing,
        errors: passErrors,
        reset: resetPass,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        putProfile(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setActiveTab('overview'),
        });
    };

    const handlePassSubmit = (e) => {
        e.preventDefault();
        putPass(route('profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPass();
            },
        });
    };

    const getUserTypeTitle = () => {
        if (user.user_type === 'admin') return t('profile.user_type_admin');
        if (user.user_type === 'investor') return t('profile.user_type_investor');
        if (user.user_type === 'company') return t('profile.user_type_company');
        return user.user_type;
    };

    return (
        <AuthenticatedLayout title={t('profile.title')}>
            <Head title={t('profile.page_title')} />

            {/* Header */}
            <AdminPageHeader
                title={t('profile.title')}
                subtitle={t('profile.subtitle')}
                icon={User}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: t('profile.breadcrumb') }]}
                badge={{
                    text: getUserTypeTitle(),
                    color: user.user_type === 'admin' ? 'brand' : (user.user_type === 'investor' ? 'orange' : 'blue'),
                }}
            />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-violet-900/40 pb-4 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'overview'
                            ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                            : 'bg-white dark:bg-[#0A0E2A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <User className="w-4 h-4" />
                    <span>{t('profile.tab_overview')}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'edit'
                            ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                            : 'bg-white dark:bg-[#0A0E2A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>{t('profile.tab_edit')}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'security'
                            ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                            : 'bg-white dark:bg-[#0A0E2A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <Lock className="w-4 h-4" />
                    <span>{t('profile.tab_security')}</span>
                </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* User Identity Card */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#6320EE] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-violet-600/30">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{user.name}</h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                            {user.status === 'active' ? t('profile.verified_account') : t('profile.pending_review')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1 font-mono">
                                            <Mail className="w-3.5 h-3.5 text-violet-500" />
                                            <span>{user.email}</span>
                                        </span>
                                        {user.phone && (
                                            <span className="flex items-center gap-1 font-mono">
                                                <Phone className="w-3.5 h-3.5 text-orange-500" />
                                                <span>{user.country_code || '+966'} {user.phone}</span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveTab('edit')}
                                className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto cursor-pointer"
                            >
                                {t('profile.btn_edit_profile')}
                            </button>
                        </div>

                        {/* Account Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('profile.membership_type')}</span>
                                <strong className="text-slate-900 dark:text-white font-bold">{getUserTypeTitle()}</strong>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('profile.field_created_at')}</span>
                                <strong className="text-slate-900 dark:text-white font-bold font-mono">
                                    {new Date(user.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                </strong>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('profile.field_email_status')}</span>
                                <span className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>{t('profile.email_verified_protected')}</span>
                                </span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">{t('profile.agreement_doc_status')}</span>
                                {user.agreement_signed_at ? (
                                    <button
                                        type="button"
                                        onClick={() => setAgreementModalOpen(true)}
                                        className="text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>{t('profile.agreement_signed_view')}</span>
                                    </button>
                                ) : (
                                    <span className="text-amber-500 font-bold">{t('profile.agreement_pending')}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Section: Investor */}
                    {user.user_type === 'investor' && (
                        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Wallet className="w-5 h-5 text-violet-500" />
                                <span>{t('profile.investor_data_title')}</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.national_id_label')}</span>
                                    <strong className="text-slate-900 dark:text-white font-mono text-sm">
                                        {user.investor_profile?.national_id || t('profile.not_registered_yet')}
                                    </strong>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.bank_and_iban_label')}</span>
                                    <strong className="text-slate-900 dark:text-white font-mono text-sm block">
                                        {user.investor_profile?.bank_name || t('profile.default_bank_fallback')}
                                    </strong>
                                    <span className="font-mono text-slate-500 text-[11px]">
                                        {user.investor_profile?.iban || 'SA0000000000000000000000'}
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.commission_share_label')}</span>
                                    <strong className="text-orange-500 font-mono text-lg block">
                                        {user.investor_profile?.platform_commission_share_rate || 70}%
                                    </strong>
                                    <span className="text-[10px] text-slate-500">{t('profile.instant_share_desc')}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Role Specific Section: Company */}
                    {user.user_type === 'company' && (
                        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Building2 className="w-5 h-5 text-orange-500" />
                                <span>{t('profile.company_logistics_title')}</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.company_name_label')}</span>
                                    <strong className="text-slate-900 dark:text-white font-bold text-sm">
                                        {user.company_profile?.company_name || user.name}
                                    </strong>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.cr_and_tax_label')}</span>
                                    <strong className="text-slate-900 dark:text-white font-mono block">
                                        CR: {user.company_profile?.commercial_registration || t('profile.not_registered')}
                                    </strong>
                                    <span className="font-mono text-slate-500 text-[11px]">
                                        TAX: {user.company_profile?.tax_number || t('profile.not_registered')}
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.credit_limit_and_comm_label')}</span>
                                    <strong className="text-violet-600 dark:text-violet-400 font-mono text-sm block">
                                        {t('profile.credit_ceiling_val', { amount: Number(user.company_profile?.credit_limit || 100000).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US') })}
                                    </strong>
                                    <span className="text-[11px] text-slate-500">
                                        {t('profile.platform_comm_rate_val', { rate: user.company_profile?.platform_commission_rate || 10 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Role Specific Section: Admin */}
                    {user.user_type === 'admin' && (
                        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <ShieldCheck className="w-5 h-5 text-indigo-500" />
                                <span>{t('profile.admin_roles_perms')}</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.roles_assigned')}</span>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {roles.length > 0 ? (
                                            roles.map((r, i) => (
                                                <span key={i} className="px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 font-bold text-xs border border-violet-500/20">
                                                    {r}
                                                </span>
                                            ))
                                        ) : (
                                            <strong className="text-slate-900 dark:text-white font-bold text-sm">
                                                {t('profile.super_admin_role')}
                                            </strong>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">{t('profile.permissions_count')}</span>
                                    <strong className="text-slate-900 dark:text-white font-mono text-sm block">
                                        {permissions.length > 0 ? permissions.length : t('profile.root_access_perms')}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Security & Activity Logs */}
                    {recentActivities.length > 0 && (
                        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <span>{t('profile.audit_activity_title')}</span>
                            </h3>

                            <div className="space-y-3">
                                {recentActivities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2 h-2 rounded-full bg-violet-500" />
                                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                                                {act.description || act.action}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(act.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: EDIT PROFILE */}
            {activeTab === 'edit' && (
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl max-w-3xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('profile.edit_section_title')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        {t('profile.edit_section_desc')}
                    </p>

                    {/* Official & Legal Verification Lock Banner */}
                    {isLockedAccount && (
                        <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/25 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 shadow-inner">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{t('profile.locked_fields_notice_title')}</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                        {t('profile.locked_fields_notice_desc')}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSupportModalOpen(true)}
                                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white shrink-0 transition-all shadow-md shadow-violet-600/20 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>{t('profile.contact_support_to_update')}</span>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {t('profile.field_full_name')} *
                                    </label>
                                    {isLockedAccount && (
                                        <span className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                                            <Lock className="w-3 h-3" />
                                            <span>{t('profile.field_locked_badge')}</span>
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => !isLockedAccount && setProfileData('name', e.target.value)}
                                    disabled={isLockedAccount}
                                    className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${
                                        isLockedAccount
                                            ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed select-none'
                                            : 'bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-violet-500'
                                    }`}
                                    required
                                />
                                {profileErrors.name && <p className="text-[10px] text-rose-500 mt-1">{profileErrors.name}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {t('profile.field_email')} *
                                    </label>
                                    {isLockedAccount && (
                                        <span className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                                            <Lock className="w-3 h-3" />
                                            <span>{t('profile.field_locked_badge')}</span>
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => !isLockedAccount && setProfileData('email', e.target.value)}
                                    disabled={isLockedAccount}
                                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none ${
                                        isLockedAccount
                                            ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed select-none'
                                            : 'bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-violet-500'
                                    }`}
                                    required
                                />
                                {profileErrors.email && <p className="text-[10px] text-rose-500 mt-1">{profileErrors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('profile.field_phone')}
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={profileData.phone_country_code}
                                        onChange={(e) => setProfileData('phone_country_code', e.target.value)}
                                        className="w-20 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 text-xs text-slate-900 dark:text-white text-center font-mono focus:outline-none focus:border-violet-500"
                                    />
                                    <input
                                        type="text"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData('phone', e.target.value)}
                                        placeholder="5XXXXXXXX"
                                        className="flex-1 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                {profileErrors.phone && <p className="text-[10px] text-rose-500 mt-1">{profileErrors.phone}</p>}
                            </div>

                            {user.user_type === 'investor' && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {t('profile.national_id_label')}
                                        </label>
                                        {isLockedAccount && (
                                            <span className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                                                <Lock className="w-3 h-3" />
                                                <span>{t('profile.field_locked_badge')}</span>
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={profileData.national_id}
                                        onChange={(e) => !isLockedAccount && setProfileData('national_id', e.target.value)}
                                        disabled={isLockedAccount}
                                        placeholder="1XXXXXXXXX"
                                        className={`w-full rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none ${
                                            isLockedAccount
                                                ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed select-none'
                                                : 'bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-violet-500'
                                        }`}
                                    />
                                </div>
                            )}

                            {user.user_type === 'company' && (
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {t('profile.company_name_label')}
                                        </label>
                                        {isLockedAccount && (
                                            <span className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                                                <Lock className="w-3 h-3" />
                                                <span>{t('profile.field_locked_badge')}</span>
                                            </span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        value={profileData.company_name}
                                        onChange={(e) => !isLockedAccount && setProfileData('company_name', e.target.value)}
                                        disabled={isLockedAccount}
                                        className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${
                                            isLockedAccount
                                                ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed select-none'
                                                : 'bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-violet-500'
                                        }`}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Financial bank fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {t('profile.field_bank_name')}
                                    </label>
                                    {isLockedAccount && (
                                        <span className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                                            <Lock className="w-3 h-3" />
                                            <span>{t('profile.field_locked_badge')}</span>
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={profileData.bank_name}
                                    onChange={(e) => !isLockedAccount && setProfileData('bank_name', e.target.value)}
                                    disabled={isLockedAccount}
                                    placeholder={t('profile.bank_placeholder')}
                                    className={`w-full rounded-xl px-4 py-2.5 text-xs focus:outline-none ${
                                        isLockedAccount
                                            ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed select-none'
                                            : 'bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-violet-500'
                                    }`}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {t('profile.field_iban')}
                                    </label>
                                    {isLockedAccount && (
                                        <span className="flex items-center gap-1 text-[10px] text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-md border border-violet-500/20">
                                            <Lock className="w-3 h-3" />
                                            <span>{t('profile.field_locked_badge')}</span>
                                        </span>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    value={profileData.iban}
                                    onChange={(e) => !isLockedAccount && setProfileData('iban', e.target.value)}
                                    disabled={isLockedAccount}
                                    placeholder="SA0000000000000000000000"
                                    className={`w-full rounded-xl px-4 py-2.5 text-xs font-mono focus:outline-none ${
                                        isLockedAccount
                                            ? 'bg-slate-100 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 cursor-not-allowed select-none'
                                            : 'bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-violet-500'
                                    }`}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={profileProcessing}
                                className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-violet-600/30 cursor-pointer"
                            >
                                {profileProcessing ? t('profile.saving_profile') : t('profile.btn_save_profile')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD CHANGE */}
            {activeTab === 'security' && (
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl max-w-2xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('profile.security_section_title')}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        {t('profile.security_section_desc')}
                    </p>

                    <form onSubmit={handlePassSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                {t('profile.field_current_password')} *
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPass ? 'text' : 'password'}
                                    value={passData.current_password}
                                    onChange={(e) => setPassData('current_password', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passErrors.current_password && (
                                <p className="text-[10px] text-rose-500 mt-1">{passErrors.current_password}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                {t('profile.field_new_password')} *
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPass ? 'text' : 'password'}
                                    value={passData.password}
                                    onChange={(e) => setPassData('password', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passErrors.password && (
                                <p className="text-[10px] text-rose-500 mt-1">{passErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                {t('profile.field_confirm_password')} *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPass ? 'text' : 'password'}
                                    value={passData.password_confirmation}
                                    onChange={(e) => setPassData('password_confirmation', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={passProcessing}
                                className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-violet-600/30 flex items-center gap-1.5 cursor-pointer"
                            >
                                <Lock className="w-4 h-4" />
                                <span>{passProcessing ? t('profile.saving_password') : t('profile.btn_save_password')}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Official Legal Agreement Modal */}
            <LegalAgreementModal
                isOpen={agreementModalOpen}
                onClose={() => setAgreementModalOpen(false)}
                contract={activeContract}
            />

            {/* Official Data Update Request Modal */}
            {supportModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#0E1330] border border-slate-200 dark:border-violet-900/40 p-6 md:p-8 shadow-2xl space-y-5">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {t('profile.support_modal_title')}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                    {t('profile.support_modal_p1')}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                {t('profile.support_modal_reqs_title')}
                            </span>
                            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] list-disc list-inside">
                                <li>{t('profile.support_modal_req_iban')}</li>
                                <li>{t('profile.support_modal_req_cr')}</li>
                                <li>{t('profile.support_modal_req_id')}</li>
                            </ul>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-xs">
                            <span className="text-slate-700 dark:text-slate-300 block mb-1">
                                {t('profile.support_modal_send_channel')}
                            </span>
                            <a
                                href="mailto:compliance@go-tech.sa?subject=Official Data Update Request"
                                className="font-mono font-bold text-violet-600 dark:text-violet-400 text-sm hover:underline block"
                            >
                                compliance@go-tech.sa
                            </a>
                            <span className="text-[11px] text-slate-500 block mt-1">
                                {t('profile.support_modal_or_whatsapp')}
                            </span>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setSupportModalOpen(false)}
                                className="px-6 py-2.5 rounded-xl bg-[#6320EE] hover:bg-[#5217D4] text-white font-bold text-xs transition-all shadow-md shadow-violet-600/30 cursor-pointer"
                            >
                                {t('profile.btn_close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
