import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import StatCard from '../../../Components/StatCard';
import Badge from '../../../Components/Badge';
import PhoneDisplay from '../../../Components/PhoneDisplay';
import {
    Users,
    Wallet,
    TrendingUp,
    Receipt,
    Truck,
    FileText,
    Building2,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    Clock,
    CreditCard,
    Shield,
    ChevronLeft,
    Eye,
    FormInput,
} from 'lucide-react';

export default function AdminInvestorShow({ investor, profileStats }) {
    const [activeTab, setActiveTab] = useState('wallets'); // wallets, tasks, deposits, contracts

    const profile = investor.investor_profile;
    const invWallet = investor.wallets?.find((w) => w.wallet_type === 'investor_investment');
    const commWallet = investor.wallets?.find((w) => w.wallet_type === 'investor_commission');

    // Combine transactions from both wallets
    const allTransactions = (invWallet?.transactions || [])
        .concat(commWallet?.transactions || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <AuthenticatedLayout title={t('admin.investors.show_title', { name: investor.name })}>
            <Head title={t('admin.investors.show_title', { name: investor.name })} />

            <AdminPageHeader
                title={investor.name}
                subtitle={t('admin.investors.show_member_since', { date: new Date(investor.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US') })}
                icon={Users}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/10 border-violet-500/20"
                breadcrumbs={[
                    { label: t('admin.nav.investors'), href: route('admin.investors.index') },
                    { label: investor.name },
                ]}
                badge={<Badge status={investor.status} />}
                actions={
                    <Link
                        href={route('admin.investors.index')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                        <span>{t('admin.investors.show_btn_back')}</span>
                    </Link>
                }
            />

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title={t('admin.investors.show_stat_invest_balance')}
                    value={`${parseFloat(profileStats?.investment_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.investors.show_stat_invest_balance_sub')}
                    icon={Wallet}
                    color="brand"
                />
                <StatCard
                    title={t('admin.investors.show_stat_commission_balance')}
                    value={`${parseFloat(profileStats?.commission_balance || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.investors.show_stat_commission_balance_sub')}
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title={t('admin.investors.show_stat_total_invested')}
                    value={`${parseFloat(profileStats?.total_invested || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.investors.show_stat_total_invested_sub', { count: profileStats?.funded_tasks_count || 0 })}
                    icon={Truck}
                    color="purple"
                />
                <StatCard
                    title={t('admin.investors.show_stat_total_profit')}
                    value={`${parseFloat(profileStats?.total_profits || 0).toLocaleString('en-US')} ${t('common.sar')}`}
                    subtitle={t('admin.investors.show_stat_total_profit_sub', { rate: profile?.platform_commission_share_rate || 70 })}
                    icon={Receipt}
                    color="cyan"
                />
            </div>

            {/* Contract & Legal Agreement Status Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-6 mb-8 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#6320EE]/10 border border-violet-500/20 text-[#6320EE] dark:text-violet-400 flex items-center justify-center">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>{t('admin.investors.show_contract_status_title')}</span>
                                {investor.agreement_signed_at ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#6320EE]/15 text-[#6320EE] dark:text-violet-300 border border-violet-500/30">
                                        {t('admin.investors.show_contract_signed')}
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                                        {t('admin.investors.show_contract_pending')}
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                                {investor.agreement_signed_at 
                                    ? t('admin.investors.show_contract_signed_at', { date: new Date(investor.agreement_signed_at).toLocaleString(isAr ? 'ar-SA' : 'en-US') }) 
                                    : t('admin.investors.show_contract_not_signed')}
                            </p>
                        </div>
                    </div>

                    {investor.contracts?.[0] && (
                        <div className="flex items-center gap-2">
                            <Link
                                href={route('admin.contracts.show', investor.contracts[0].id)}
                                className="px-3.5 py-2 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                <Eye className="w-4 h-4" />
                                <span>{t('admin.investors.show_btn_view_contract', { number: '#' + investor.contracts[0].contract_number })}</span>
                            </Link>
                            <a
                                href={route('admin.contracts.view-pdf', investor.contracts[0].id)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>{t('common.view')}</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Investor Profile Summary Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-400" />
                    <span>{t('admin.investors.show_personal_info')}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.investors.field_email')}</span>
                        <span className="font-mono text-slate-200 font-bold select-all">{investor.email}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.investors.field_phone')}</span>
                        <PhoneDisplay countryCode={investor.country_code} phone={investor.phone} />
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.investors.field_national_id')}</span>
                        <span className="font-mono text-slate-200 font-bold">{profile?.national_id || '-'}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.investors.table_profit_rate')}</span>
                        <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/20">
                            {profile?.platform_commission_share_rate || 70}%
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.investors.field_bank_name')}</span>
                        <span className="text-slate-200 font-bold">{profile?.bank_name || '-'}</span>
                    </div>

                    <div className="lg:col-span-2">
                        <span className="text-slate-400 block mb-1">{t('admin.investors.field_iban')}</span>
                        <span className="font-mono text-slate-200 font-bold select-all" dir="ltr">
                            {profile?.bank_iban || '-'}
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">{t('admin.investors.field_status')}</span>
                        <Badge status={investor.status} />
                    </div>
                </div>

                {/* Additional Dynamic Data Fields if any */}
                {investor.additional_data && Object.keys(investor.additional_data).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-violet-400 mb-3 flex items-center gap-1.5">
                            <FormInput className="w-3.5 h-3.5" />
                            <span>{t('admin.investors.show_extra_info')}</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(investor.additional_data).map(([key, val]) => (
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

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-800/80 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'wallets', label: t('admin.investors.show_tab_wallets'), icon: Wallet, count: allTransactions.length },
                    { key: 'tasks', label: t('admin.investors.show_tab_tasks'), icon: Truck, count: investor.investments?.length || 0 },
                    { key: 'deposits', label: t('admin.investors.show_tab_deposits'), icon: Receipt, count: investor.bank_deposits?.length || 0 },
                    { key: 'contracts', label: t('admin.investors.show_tab_contracts'), icon: FileText, count: investor.contracts?.length || 0 },
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

            {/* Tab 1: Wallets & Ledger */}
            {activeTab === 'wallets' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">{t('admin.investors.show_ledger_title')}</h4>
                        <span className="text-xs text-slate-400">{t('admin.investors.show_ledger_sub')}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.investors.show_tx_num')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.show_tx_wallet_type')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.show_tx_action_type')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.show_tx_amount')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.show_tx_balance_after')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.show_tx_desc')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.show_tx_datetime')}</th>
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
                                                        {tx.wallet?.wallet_type === 'investor_investment' ? t('admin.investors.show_tx_wallet_invest') : t('admin.investors.show_tx_wallet_comm')}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 font-bold ${isCredit ? 'text-violet-400' : 'text-rose-400'}`}>
                                                        {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                        {isCredit ? t('admin.investors.show_tx_credit') : t('admin.investors.show_tx_debit')}
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
                                            {t('admin.investors.show_tx_empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 2: Funded Tasks */}
            {activeTab === 'tasks' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.investors.table_task_num')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_logistics_comp')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_shipment_route')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_funding_amt')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_earned_profit')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_task_status')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_funding_date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {investor.investments && investor.investments.length > 0 ? (
                                    investor.investments.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono text-violet-400 font-bold">
                                                {inv.task?.task_number}
                                            </td>
                                            <td className="p-4 font-bold text-slate-200">
                                                {inv.task?.company?.company_name}
                                            </td>
                                            <td className="p-4 text-slate-400">
                                                {inv.task?.pickup_city} ➔ {inv.task?.dropoff_city}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-white">
                                                {parseFloat(inv.invested_amount).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-violet-400">
                                                +{parseFloat(inv.investor_profit_amount).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4">
                                                <Badge status={inv.task?.status} />
                                            </td>
                                            <td className="p-4 font-mono text-slate-500 text-[11px]">
                                                {new Date(inv.created_at).toLocaleDateString('ar-SA')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-500">
                                            {t('admin.investors.show_tasks_empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Bank Deposits */}
            {activeTab === 'deposits' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.investors.table_deposit_num')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_deposited_amt')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_dest_bank')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_ref_num')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_status')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_deposit_date')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {investor.bank_deposits && investor.bank_deposits.length > 0 ? (
                                    investor.bank_deposits.map((dep) => (
                                        <tr key={dep.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono text-slate-400 font-bold">
                                                #{dep.deposit_number}
                                            </td>
                                            <td className="p-4 font-mono font-bold text-violet-400 text-sm">
                                                {parseFloat(dep.amount).toLocaleString('en-US')} {t('common.sar')}
                                            </td>
                                            <td className="p-4 text-slate-200">{dep.bank_name}</td>
                                            <td className="p-4 font-mono text-slate-400">{dep.bank_reference_number || '-'}</td>
                                            <td className="p-4"><Badge status={dep.status} /></td>
                                            <td className="p-4 font-mono text-slate-500 text-[11px]">
                                                {new Date(dep.created_at).toLocaleString('ar-SA')}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            {t('admin.investors.show_deposits_empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 4: Contracts */}
            {activeTab === 'contracts' && (
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">{t('admin.investors.table_contract_num')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_agreement_title')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_agreed_comm')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_start_date')}</th>
                                    <th className="p-4 text-start">{t('admin.investors.table_status')}</th>
                                    <th className="p-4 text-center">{t('admin.investors.table_view_contract')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {investor.contracts && investor.contracts.length > 0 ? (
                                    investor.contracts.map((c) => (
                                        <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono text-violet-400 font-bold">
                                                #{c.contract_number}
                                            </td>
                                            <td className="p-4 font-bold text-slate-200">{c.title}</td>
                                            <td className="p-4 font-mono font-bold text-violet-400">
                                                {c.commission_rate}%
                                            </td>
                                            <td className="p-4 font-mono text-slate-400">
                                                {c.start_date}
                                            </td>
                                            <td className="p-4"><Badge status={c.status} /></td>
                                            <td className="p-4 text-center">
                                                <Link
                                                    href={route('admin.contracts.show', c.id)}
                                                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors inline-flex items-center gap-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    <span>{t('admin.investors.show_btn_details')}</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            {t('admin.investors.show_contracts_empty')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
