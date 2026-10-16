import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import TaskCard from '../../Components/TaskCard';
import ConfirmDialog from '../../Components/ConfirmDialog';
import Badge from '../../Components/Badge';
import OnboardingStepper from '../../Components/OnboardingStepper';
import AdminPageHeader from '../../Components/AdminPageHeader';
import LegalAgreementModal from '../../Components/LegalAgreementModal';
import { useTranslation } from '../../Utils/i18n';
import {
    Wallet,
    TrendingUp,
    Zap,
    ArrowUpRight,
    ArrowDownLeft,
    Truck,
    ShieldCheck,
    CreditCard,
    PlusCircle,
    ChevronLeft,
    LayoutDashboard,
    FileText,
} from 'lucide-react';

export default function InvestorDashboard({ stats, recentInvestments, recentTransactions, liveTasks, formTemplate, contract }) {
    const { t, locale } = useTranslation();
    const { auth } = usePage().props;
    const user = auth?.user;
    const [selectedTask, setSelectedTask] = useState(null);
    const [fundingLoading, setFundingLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [estimatedProfit, setEstimatedProfit] = useState(0);
    const [agreementModalOpen, setAgreementModalOpen] = useState(false);

    const handleOpenFundModal = (task, profit) => {
        setSelectedTask(task);
        setEstimatedProfit(profit);
        setConfirmOpen(true);
    };

    const handleConfirmFunding = () => {
        if (!selectedTask) return;
        setFundingLoading(true);
        router.post(route('investor.tasks.fund', selectedTask.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setFundingLoading(false);
                setConfirmOpen(false);
                setSelectedTask(null);
            },
        });
    };

    return (
        <AuthenticatedLayout title={t('investor.dashboard.title')}>
            <Head title={t('investor.dashboard.title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('investor.dashboard.title')}
                subtitle={t('investor.dashboard.subtitle')}
                icon={LayoutDashboard}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                badge={{
                    text: user?.status === 'active' ? t('investor.dashboard.active_badge') : t('investor.dashboard.pending_badge'),
                    color: user?.status === 'active' ? 'brand' : 'amber',
                }}
                actions={[
                    {
                        label: t('investor.dashboard.investment_wallet_btn'),
                        icon: PlusCircle,
                        url: route('investor.wallet.investment'),
                        variant: 'primary',
                    },
                    {
                        label: t('investor.dashboard.commission_wallet_btn'),
                        icon: CreditCard,
                        url: route('investor.wallet.commission'),
                    },
                    {
                        label: t('investor.dashboard.live_market_btn'),
                        icon: Zap,
                        url: route('investor.market.index'),
                    },
                    {
                        label: t('investor.dashboard.legal_contract_btn'),
                        icon: FileText,
                        onClick: () => setAgreementModalOpen(true),
                    },
                ]}
            />

            {/* Onboarding Stepper for New Users */}
            {(user?.status === 'pending_approval' || !user?.agreement_signed_at || !user?.form_template_id) && (
                <OnboardingStepper formTemplate={formTemplate} />
            )}

            {/* Top Financial Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Investment Wallet Card */}
                <div className="glass-panel p-6 rounded-3xl border border-violet-500/30 relative overflow-hidden group hover:border-violet-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <Link
                            href={route('investor.wallet.investment')}
                            className="text-xs font-bold text-violet-300 hover:text-white flex items-center gap-1 bg-violet-500/10 px-3 py-1.5 rounded-xl border border-violet-500/20 transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            <span>{t('investor.dashboard.view_wallet')}</span>
                        </Link>
                    </div>
                    <span className="text-xs font-medium text-slate-400 block mb-1">{t('investor.dashboard.available_investment_balance')}</span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {stats.investment_available.toLocaleString('en-US')}
                        <span className="text-sm font-sans font-bold text-violet-400">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {t('investor.dashboard.total_balance')} {stats.investment_balance.toLocaleString('en-US')} {t('common.sar')}
                    </p>
                </div>

                {/* Commission Wallet Card */}
                <div className="glass-panel p-6 rounded-3xl border border-orange-500/30 relative overflow-hidden group hover:border-orange-500/50 transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <Link
                            href={route('investor.wallet.commission')}
                            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 transition-colors"
                        >
                            <span>{t('investor.dashboard.view_and_withdraw_profits')}</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                    <span className="text-xs font-medium text-slate-400 block mb-1">{t('investor.dashboard.commission_wallet_balance')}</span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {stats.commission_balance.toLocaleString('en-US')}
                        <span className="text-sm font-sans font-bold text-orange-400">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {t('investor.dashboard.total_earnings_achieved')} {stats.total_earnings_earned.toLocaleString('en-US')} {t('common.sar')}
                    </p>
                </div>

                {/* Investment Metrics */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                            <Truck className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-xl border border-indigo-500/20">
                            {stats.total_investments_count} {t('investor.dashboard.completed_funding')}
                        </span>
                    </div>
                    <span className="text-xs font-medium text-slate-400 block mb-1">{t('investor.dashboard.total_invested_capital')}</span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {stats.total_invested_amount.toLocaleString('en-US')}
                        <span className="text-sm font-sans font-bold text-indigo-400">{t('common.sar')}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                        {stats.active_available_tasks} {t('investor.dashboard.live_tasks_waiting')}
                    </p>
                </div>
            </div>

            {/* Live Market Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="w-5 h-5 text-orange-400 fill-orange-400" />
                            <span>{t('investor.dashboard.live_market_title')}</span>
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">{t('investor.dashboard.live_market_subtitle')}</p>
                    </div>

                    <Link
                        href={route('investor.market.index')}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
                    >
                        <span>{t('investor.dashboard.view_all_tasks')} ({stats.active_available_tasks})</span>
                        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                    </Link>
                </div>

                {liveTasks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {liveTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                onFund={handleOpenFundModal}
                                walletBalance={stats.investment_available}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center">
                        <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-300 text-base mb-1">{t('investor.dashboard.no_tasks_available')}</h4>
                        <p className="text-xs text-slate-500">{t('investor.dashboard.no_tasks_desc')}</p>
                    </div>
                )}
            </div>

            {/* Recent Investments & Transactions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Investments */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                    <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-violet-400" />
                        <span>{t('investor.dashboard.recent_investments')}</span>
                    </h3>

                    <div className="space-y-3">
                        {recentInvestments.length > 0 ? (
                            recentInvestments.map((inv) => (
                                <div key={inv.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                                    <div>
                                        <span className="text-xs font-bold text-white block">
                                            {inv.task?.title || `${t('investor.dashboard.task_prefix')}${inv.task?.task_number}`}
                                        </span>
                                        <span className="text-[11px] text-slate-400 block mt-0.5">
                                            {inv.task?.company?.company_name} • {new Date(inv.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>
                                    <div className="text-left rtl:text-left ltr:text-right">
                                        <span className="font-mono font-bold text-sm text-white block">
                                            {parseFloat(inv.investment_amount).toLocaleString('en-US')} {t('common.sar')}
                                        </span>
                                        <span className="text-xs font-mono font-bold text-violet-400 block">
                                            +{parseFloat(inv.investor_commission_amount).toFixed(2)} {t('common.sar')} {t('investor.dashboard.profit')}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-6">{t('investor.dashboard.no_investments_yet')}</p>
                        )}
                    </div>
                </div>

                {/* Recent Ledger Transactions */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                    <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-blue-400" />
                        <span>{t('investor.dashboard.recent_transactions')}</span>
                    </h3>

                    <div className="space-y-3">
                        {recentTransactions.length > 0 ? (
                            recentTransactions.map((tx) => (
                                <div key={tx.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                                            parseFloat(tx.amount) > 0 
                                                ? 'bg-violet-500/20 text-violet-400' 
                                                : 'bg-rose-500/20 text-rose-400'
                                        }`}>
                                            {parseFloat(tx.amount) > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-white block truncate max-w-[200px]">{tx.description}</span>
                                            <span className="text-[10px] text-slate-500 block">{new Date(tx.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                        </div>
                                    </div>
                                    <span className={`font-mono font-bold text-sm ${
                                        parseFloat(tx.amount) > 0 ? 'text-violet-400' : 'text-slate-200'
                                    }`}>
                                        {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toLocaleString('en-US')}` : parseFloat(tx.amount).toLocaleString('en-US')} {t('common.sar')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-xs text-slate-500 text-center py-6">{t('investor.dashboard.no_transactions_yet')}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Custom Modal for Funding Confirmation (No Sweetalert) */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmFunding}
                isLoading={fundingLoading}
                type="success"
                title={t('investor.dashboard.confirm_funding_title')}
                message={t('investor.dashboard.confirm_funding_msg', {
                    task: selectedTask?.task_number,
                    amount: parseFloat(selectedTask?.funding_amount || 0).toLocaleString('en-US'),
                    profit: estimatedProfit.toFixed(2),
                    currency: t('common.sar'),
                })}
                confirmText={t('investor.dashboard.confirm_funding_btn')}
                cancelText={t('investor.dashboard.cancel_funding_btn')}
            />

            {/* Official Legal Agreement Modal */}
            <LegalAgreementModal
                isOpen={agreementModalOpen}
                onClose={() => setAgreementModalOpen(false)}
                contract={contract}
            />
        </AuthenticatedLayout>
    );
}
