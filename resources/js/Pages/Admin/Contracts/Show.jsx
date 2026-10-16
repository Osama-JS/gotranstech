import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import StatCard from '../../../Components/StatCard';
import Badge from '../../../Components/Badge';
import PhoneDisplay from '../../../Components/PhoneDisplay';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import {
    FileText,
    ShieldCheck,
    Calendar,
    Users,
    Building2,
    Percent,
    Download,
    Printer,
    ChevronLeft,
    CheckCircle2,
    Clock,
    AlertCircle,
    UserCheck,
    CreditCard,
    ExternalLink,
    Hash,
    ShieldAlert,
    RefreshCw,
    User,
} from 'lucide-react';

export default function AdminContractShow({ contract }) {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [statusToChange, setStatusToChange] = useState('');

    const isInvestor = contract.party_type === 'investor';
    const partyUser = contract.user;
    const investorProfile = partyUser?.investor_profile;
    const companyProfile = partyUser?.company_profile;

    const { post, processing } = useForm({});

    const handleStatusChangeRequest = (newStatus) => {
        setStatusToChange(newStatus);
        setConfirmModalOpen(true);
    };

    const confirmStatusChange = () => {
        if (!statusToChange) return;
        router.post(
            route('admin.contracts.status', contract.id),
            { status: statusToChange },
            {
                onSuccess: () => setConfirmModalOpen(false),
            }
        );
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return { text: t('admin.contracts.badge_active_verified'), color: 'purple', bg: 'bg-[#6320EE]/10 text-[#6320EE] border-[#6320EE]/20' };
            case 'pending_signature':
                return { text: t('admin.contracts.badge_pending_sign'), color: 'amber', bg: 'bg-orange-500/10 text-orange-500 border-orange-500/20' };
            case 'terminated':
                return { text: t('admin.contracts.badge_terminated'), color: 'red', bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20' };
            case 'expired':
                return { text: t('admin.contracts.badge_expired'), color: 'slate', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
            default:
                return { text: status, color: 'blue', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
        }
    };

    const statusBadge = getStatusBadge(contract.status);

    return (
        <AuthenticatedLayout title={t('admin.contracts.show_title', { number: contract.contract_number })}>
            <Head title={`${t('admin.contracts.table_number')} ${contract.contract_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <AdminPageHeader
                    title={t('admin.contracts.show_title', { number: contract.contract_number })}
                    subtitle={contract.title || t('admin.contracts.default_subtitle')}
                    icon={FileText}
                    iconColor="text-violet-400"
                    iconBg="bg-[#6320EE]/10 border-violet-500/20"
                    breadcrumbs={[
                        { label: t('admin.nav.items.contracts'), href: route('admin.contracts.index') },
                        { label: contract.contract_number },
                    ]}
                    badge={
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
                            <span className="w-2 h-2 rounded-full bg-current" />
                            {statusBadge.text}
                        </span>
                    }
                    actions={
                        <div className="flex flex-wrap items-center gap-2">
                            <a
                                href={route('admin.contracts.view-pdf', contract.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                title={t('admin.contracts.title_preview_doc')}
                            >
                                <Printer className="w-4 h-4" />
                                <span>{t('admin.contracts.btn_preview_doc_short')}</span>
                            </a>

                            <a
                                href={route('admin.contracts.pdf', contract.id)}
                                className="px-3.5 py-2 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                title={t('admin.contracts.title_download_doc')}
                            >
                                <Download className="w-4 h-4" />
                                <span>{t('admin.contracts.btn_download_doc_short')}</span>
                            </a>

                            <Link
                                href={route('admin.contracts.index')}
                                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                                <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                                <span>{t('admin.contracts.btn_back_to_list')}</span>
                            </Link>
                        </div>
                    }
                />

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title={t('admin.contracts.stat_rate_title')}
                        value={`${contract.commission_rate}%`}
                        icon={Percent}
                        color="purple"
                        description={isInvestor ? t('admin.contracts.stat_rate_investor_desc') : t('admin.contracts.stat_rate_company_desc')}
                    />
                    <StatCard
                        title={t('admin.contracts.stat_party_type_title')}
                        value={isInvestor ? t('admin.contracts.party_investor_funding') : t('admin.contracts.party_logistics_company')}
                        icon={isInvestor ? Users : Building2}
                        color="blue"
                        description={contract.contract_type || t('admin.contracts.stat_contract_type_desc')}
                    />
                    <StatCard
                        title={t('admin.contracts.stat_sign_datetime_title')}
                        value={contract.signed_at ? new Date(contract.signed_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') : t('admin.contracts.not_signed_yet')}
                        icon={ShieldCheck}
                        color="brand"
                        description={contract.signed_at ? new Date(contract.signed_at).toLocaleTimeString(isAr ? 'ar-SA' : 'en-US') : t('admin.contracts.awaiting_verification')}
                    />
                    <StatCard
                        title={t('admin.contracts.stat_validity_title')}
                        value={contract.start_date ? new Date(contract.start_date).toLocaleDateString('ar-SA') : '-'}
                        icon={Calendar}
                        color="amber"
                        description={contract.end_date ? t('admin.contracts.stat_expires_on', { date: new Date(contract.end_date).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') }) : t('admin.contracts.stat_open_ended')}
                    />
                </div>

                {/* Two-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (2 Cols): Legal Text and Signature Stamp */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Digital Signature & Legal Stamp Card */}
                        <div className="bg-white dark:bg-[#0E1338] rounded-3xl border border-violet-500/20 p-6 shadow-sm">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-violet-900/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-[#6320EE]/10 border border-violet-500/20 text-[#6320EE] dark:text-violet-400 flex items-center justify-center">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {t('admin.contracts.seal_title')}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('admin.contracts.seal_legal_note')}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-[#6320EE]/10 text-[#6320EE] dark:text-violet-300 text-xs font-bold border border-violet-500/20">
                                    {t('admin.contracts.seal_active_badge')}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40">
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">{t('admin.contracts.seal_signer_label')}</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-violet-400" />
                                        <span>{contract.signer?.name || partyUser?.name || t('admin.contracts.seal_second_party_default')}</span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">{t('admin.contracts.seal_datetime_label')}</span>
                                    <p className="text-sm font-bold font-mono text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-orange-400" />
                                        <span>
                                            {contract.signed_at 
                                                ? new Date(contract.signed_at).toLocaleString('ar-SA') 
                                                : t('admin.contracts.not_signed_yet')}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">{t('admin.contracts.seal_doc_num_label')}</span>
                                    <p className="text-xs font-mono font-bold text-[#6320EE] dark:text-violet-300">
                                        {contract.contract_number}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-1">{t('admin.contracts.seal_status_label')}</span>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-[#6320EE]" />
                                        <span>{t('admin.contracts.seal_status_val')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contract Terms and Conditions Full Box */}
                        <div className="bg-white dark:bg-[#0E1338] rounded-3xl border border-slate-200 dark:border-violet-900/30 p-6 shadow-sm">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-violet-900/30 mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {t('admin.contracts.terms_section_title')}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {t('admin.contracts.terms_section_subtitle')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/30 text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                                {contract.terms_text || (
                                    <p className="text-slate-400 italic">
                                        {t('admin.contracts.terms_default_text')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column (1 Col): Second Party Details & Admin Actions */}
                    <div className="space-y-6">
                        {/* Party Card */}
                        <div className="bg-white dark:bg-[#0E1338] rounded-3xl border border-slate-200 dark:border-violet-900/30 p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Users className="w-4 h-4 text-violet-400" />
                                <span>{t('admin.contracts.party_info_title')}</span>
                            </h4>

                            <div className="space-y-3.5">
                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_full_name')}</span>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {partyUser?.name || t('admin.contracts.party_unknown')}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_account_type')}</span>
                                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-bold border border-violet-500/20">
                                        {isInvestor ? t('admin.contracts.party_investor_funding') : t('admin.contracts.party_logistics_company')}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_email')}</span>
                                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                                        {partyUser?.email || '-'}
                                    </p>
                                </div>

                                <div>
                                    <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_phone')}</span>
                                    <p className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                        <PhoneDisplay phone={partyUser?.phone} countryCode={partyUser?.country_code} />
                                    </p>
                                </div>

                                {isInvestor && investorProfile && (
                                    <>
                                        <div className="pt-2 border-t border-slate-100 dark:border-violet-900/30">
                                            <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_national_id')}</span>
                                            <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                                {investorProfile.national_id || t('admin.contracts.not_entered_yet')}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_bank_iban')}</span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {investorProfile.bank_name || t('admin.contracts.party_unknown')}
                                            </p>
                                            <p className="text-[11px] font-mono text-slate-500 truncate">
                                                {investorProfile.bank_iban || '-'}
                                            </p>
                                        </div>
                                    </>
                                )}

                                {!isInvestor && companyProfile && (
                                    <>
                                        <div className="pt-2 border-t border-slate-100 dark:border-violet-900/30">
                                            <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_company_name')}</span>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                                {companyProfile.company_name}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-[11px] text-slate-400 block mb-0.5">{t('admin.contracts.party_cr_number')}</span>
                                            <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                                                {companyProfile.cr_number || t('admin.contracts.not_entered_yet')}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="pt-4 border-t border-slate-100 dark:border-violet-900/30">
                                    {isInvestor ? (
                                        <Link
                                            href={route('admin.investors.show', partyUser?.id)}
                                            className="w-full py-2.5 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-[#6320EE] dark:text-violet-300 text-xs font-bold border border-violet-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <UserCheck className="w-4 h-4" />
                                            <span>{t('admin.contracts.btn_open_investor_profile')}</span>
                                            <ExternalLink className="w-3 h-3 rtl:rotate-180" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={route('admin.companies.show', companyProfile?.id || partyUser?.id)}
                                            className="w-full py-2.5 px-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-[#6320EE] dark:text-violet-300 text-xs font-bold border border-violet-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <Building2 className="w-4 h-4" />
                                            <span>{t('admin.contracts.btn_open_company_profile')}</span>
                                            <ExternalLink className="w-3 h-3 rtl:rotate-180" />
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Contract Management Card */}
                        <div className="bg-white dark:bg-[#0E1338] rounded-3xl border border-slate-200 dark:border-violet-900/30 p-6 shadow-sm">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-orange-400" />
                                <span>{t('admin.contracts.actions_card_title')}</span>
                            </h4>

                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                {t('admin.contracts.actions_card_subtitle')}
                            </p>

                            <div className="space-y-2">
                                {contract.status !== 'active' && (
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChangeRequest('active')}
                                        className="w-full py-2.5 px-3 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>{t('admin.contracts.btn_activate_contract')}</span>
                                    </button>
                                )}

                                {contract.status !== 'terminated' && (
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChangeRequest('terminated')}
                                        className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-bold border border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <AlertCircle className="w-4 h-4" />
                                        <span>{t('admin.contracts.btn_terminate_contract')}</span>
                                    </button>
                                )}

                                {contract.status !== 'expired' && (
                                    <button
                                        type="button"
                                        onClick={() => handleStatusChangeRequest('expired')}
                                        className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Clock className="w-4 h-4" />
                                        <span>{t('admin.contracts.btn_expire_contract')}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={confirmStatusChange}
                title={t('admin.contracts.confirm_change_title')}
                message={t('admin.contracts.confirm_change_msg', { number: contract.contract_number, status: statusToChange })}
                confirmText={t('admin.contracts.confirm_change_btn')}
                cancelText={t('common.cancel')}
                variant={statusToChange === 'terminated' ? 'danger' : 'primary'}
                loading={processing}
            />
        </AuthenticatedLayout>
    );
}
