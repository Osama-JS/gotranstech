import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import {
    Wallet,
    CreditCard,
    Building,
    Upload,
    ArrowDownLeft,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    PlusCircle,
    FileText,
    Copy,
} from 'lucide-react';

export default function InvestorWallet({ investmentWallet, commissionWallet, transactions, bankDeposits, platformBankInfo }) {
    const { t, locale } = useTranslation();
    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [depositTab, setDepositTab] = useState('hyperpay'); // hyperpay, bank
    const [copiedIban, setCopiedIban] = useState(false);

    // HyperPay form
    const [hpAmount, setHpAmount] = useState('1000');
    const [hpBrand, setHpBrand] = useState('MADA');
    const [hpLoading, setHpLoading] = useState(false);

    // Bank Deposit Form
    const { data, setData, post, processing, errors, reset } = useForm({
        amount: '',
        bank_name: t('investor.wallet.default_bank_name'),
        sender_name: '',
        sender_account: '',
        reference_number: '',
        transfer_date: new Date().toISOString().split('T')[0],
        receipt_file: null,
    });

    const handleCopyIban = () => {
        navigator.clipboard.writeText(platformBankInfo.bank_iban);
        setCopiedIban(true);
        setTimeout(() => setCopiedIban(false), 2000);
    };

    const handleHyperPaySubmit = (e) => {
        e.preventDefault();
        setHpLoading(true);
        fetch(route('investor.wallet.hyperpay.checkout'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
            },
            body: JSON.stringify({
                amount: hpAmount,
                payment_brand: hpBrand,
            }),
        })
        .then((res) => res.json())
        .then((data) => {
            setHpLoading(false);
            if (data.checkout_id) {
                // Mock callback redirect
                window.location.href = route('payments.hyperpay.callback', { id: data.checkout_id });
            }
        })
        .catch(() => setHpLoading(false));
    };

    const handleBankSubmit = (e) => {
        e.preventDefault();
        post(route('investor.wallet.deposit.bank'), {
            onSuccess: () => {
                setDepositModalOpen(false);
                reset();
            },
        });
    };

    return (
        <AuthenticatedLayout title={t('investor.wallet.title')}>
            <Head title={t('investor.wallet.page_title')} />

            {/* Professional Page Header */}
            <AdminPageHeader
                title={t('investor.wallet.header_title')}
                subtitle={t('investor.wallet.subtitle')}
                icon={Wallet}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: t('investor.wallet.breadcrumb') }]}
                badge={{
                    text: t('investor.wallet.double_entry_badge'),
                    color: 'brand',
                }}
                actions={[
                    {
                        label: t('investor.wallet.deposit_action'),
                        icon: PlusCircle,
                        onClick: () => setDepositModalOpen(true),
                        variant: 'primary',
                    },
                ]}
            />

            {/* Balances Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {/* Investment Wallet */}
                <div className="glass-panel p-6 rounded-3xl border border-violet-500/40 relative overflow-hidden bg-[#0A0E2A]/80 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-300 flex items-center justify-center border border-violet-500/30 glow-violet">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <button
                            type="button"
                            onClick={() => setDepositModalOpen(true)}
                            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>{t('investor.wallet.deposit_action')}</span>
                        </button>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">{t('investor.wallet.investment_wallet_title')}</span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {parseFloat(investmentWallet?.balance || 0).toLocaleString('en-US')}
                        <span className="text-sm font-sans font-bold text-violet-300">{t('common.sar')}</span>
                    </div>
                </div>

                {/* Commission Wallet */}
                <div className="glass-panel p-6 rounded-3xl border border-orange-500/40 relative overflow-hidden bg-[#0A0E2A]/80 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 glow-orange">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
                            {t('investor.wallet.earned_profits_badge')}
                        </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-400 block mb-1">{t('investor.wallet.commission_wallet_title')}</span>
                    <div className="text-3xl font-black font-mono text-white flex items-baseline gap-1.5">
                        {parseFloat(commissionWallet?.balance || 0).toLocaleString('en-US')}
                        <span className="text-sm font-sans font-bold text-orange-400">{t('common.sar')}</span>
                    </div>
                </div>
            </div>

            {/* Bank Deposits Pending Table */}
            {bankDeposits.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 mb-8">
                    <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <span>{t('investor.wallet.pending_deposits_title')}</span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                            <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                                <tr>
                                    <th className="p-3">{t('investor.wallet.deposit_number_th')}</th>
                                    <th className="p-3">{t('investor.wallet.amount_th')}</th>
                                    <th className="p-3">{t('investor.wallet.bank_th')}</th>
                                    <th className="p-3">{t('investor.wallet.sender_name_th')}</th>
                                    <th className="p-3">{t('investor.wallet.transfer_date_th')}</th>
                                    <th className="p-3">{t('investor.wallet.status_th')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {bankDeposits.map((dep) => (
                                    <tr key={dep.id} className="hover:bg-slate-900/40">
                                        <td className="p-3 font-mono font-bold text-violet-400">{dep.deposit_number}</td>
                                        <td className="p-3 font-mono font-bold text-white">{parseFloat(dep.amount).toLocaleString('en-US')} {t('common.sar')}</td>
                                        <td className="p-3 text-slate-300">{dep.bank_name}</td>
                                        <td className="p-3 text-slate-300">{dep.sender_name}</td>
                                        <td className="p-3 text-slate-400">{dep.transfer_date}</td>
                                        <td className="p-3"><Badge status={dep.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Ledger Transactions Table */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800">
                <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-400" />
                    <span>{t('investor.wallet.ledger_title')}</span>
                </h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
                        <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="p-3">{t('investor.wallet.tx_type_th')}</th>
                                <th className="p-3">{t('investor.wallet.wallet_th')}</th>
                                <th className="p-3">{t('investor.wallet.amount_th')}</th>
                                <th className="p-3">{t('investor.wallet.balance_after_th')}</th>
                                <th className="p-3">{t('investor.wallet.details_th')}</th>
                                <th className="p-3">{t('investor.wallet.datetime_th')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {transactions.data.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-900/40">
                                    <td className="p-3">
                                        <span className="font-semibold text-slate-200">{tx.description}</span>
                                    </td>
                                    <td className="p-3 text-slate-400">
                                        {tx.wallet?.wallet_type === 'investor_investment' ? t('investor.nav.investment_wallet') : t('investor.nav.commission_wallet')}
                                    </td>
                                    <td className="p-3 font-mono font-bold">
                                        <span className={parseFloat(tx.amount) > 0 ? 'text-violet-400' : 'text-slate-200'}>
                                            {parseFloat(tx.amount) > 0 ? `+${parseFloat(tx.amount).toLocaleString('en-US')}` : parseFloat(tx.amount).toLocaleString('en-US')} {t('common.sar')}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-slate-400">
                                        {parseFloat(tx.balance_after).toLocaleString('en-US')} {t('common.sar')}
                                    </td>
                                    <td className="p-3 text-slate-400 font-mono text-[11px]">
                                        {tx.status}
                                    </td>
                                    <td className="p-3 text-slate-500 font-mono">
                                        {new Date(tx.created_at).toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deposit Modal */}
            <Modal
                isOpen={depositModalOpen}
                onClose={() => setDepositModalOpen(false)}
                title={t('investor.wallet.deposit_modal_title')}
                maxWidth="lg"
            >
                {/* Method Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-5 border border-slate-800">
                    <button
                        type="button"
                        onClick={() => setDepositTab('hyperpay')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            depositTab === 'hyperpay'
                                ? 'bg-[#6320EE] text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <CreditCard className="w-4 h-4" />
                        <span>{t('investor.wallet.hyperpay_tab')}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setDepositTab('bank')}
                        className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                            depositTab === 'bank'
                                ? 'bg-[#6320EE] text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Building className="w-4 h-4" />
                        <span>{t('investor.wallet.bank_tab')}</span>
                    </button>
                </div>

                {depositTab === 'hyperpay' ? (
                    <form onSubmit={handleHyperPaySubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('investor.wallet.deposit_amount_label')}</label>
                            <input
                                type="number"
                                min="50"
                                value={hpAmount}
                                onChange={(e) => setHpAmount(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2">{t('investor.wallet.choose_payment_method')}</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['MADA', 'VISA', 'APPLEPAY'].map((brand) => (
                                    <button
                                        key={brand}
                                        type="button"
                                        onClick={() => setHpBrand(brand)}
                                        className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                                            hpBrand === brand
                                                ? 'border-violet-500 bg-violet-500/10 text-violet-400'
                                                : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                                        }`}
                                    >
                                        {brand}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={hpLoading}
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {hpLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>{t('investor.wallet.continue_hyperpay_btn')}</span>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleBankSubmit} className="space-y-4">
                        {/* Platform Bank Details Info Card */}
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5 mb-3">
                            <div className="flex justify-between text-slate-400">
                                <span>{t('investor.wallet.official_bank')}</span>
                                <strong className="text-slate-200">{platformBankInfo.bank_name}</strong>
                            </div>
                            <div className="flex justify-between text-slate-400">
                                <span>{t('investor.wallet.account_holder')}</span>
                                <strong className="text-slate-200">{platformBankInfo.account_holder}</strong>
                            </div>
                            <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
                                <span className="font-mono text-orange-400 font-bold">{platformBankInfo.bank_iban}</span>
                                <button
                                    type="button"
                                    onClick={handleCopyIban}
                                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                                >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>{copiedIban ? t('investor.wallet.copied') : t('investor.wallet.copy')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('investor.wallet.transferred_amount_label')}</label>
                                <input
                                    type="number"
                                    value={data.amount}
                                    onChange={(e) => setData('amount', e.target.value)}
                                    placeholder="1000"
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                                    required
                                />
                                {errors.amount && <p className="text-[10px] text-rose-400 mt-1">{errors.amount}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('investor.wallet.sender_bank_label')}</label>
                                <input
                                    type="text"
                                    value={data.bank_name}
                                    onChange={(e) => setData('bank_name', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('investor.wallet.account_holder_label')}</label>
                                <input
                                    type="text"
                                    value={data.sender_name}
                                    onChange={(e) => setData('sender_name', e.target.value)}
                                    placeholder={t('investor.wallet.account_holder_placeholder')}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1">{t('investor.wallet.transfer_date_label')}</label>
                                <input
                                    type="date"
                                    value={data.transfer_date}
                                    onChange={(e) => setData('transfer_date', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1">{t('investor.wallet.receipt_attachment_label')}</label>
                            <input
                                type="file"
                                onChange={(e) => setData('receipt_file', e.target.files[0])}
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-2 rtl:file:mr-0 rtl:file:ml-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:bg-violet-600 file:text-white cursor-pointer"
                                required
                            />
                            {errors.receipt_file && <p className="text-[10px] text-rose-400 mt-1">{errors.receipt_file}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>{t('investor.wallet.submit_deposit_btn')}</span>
                            )}
                        </button>
                    </form>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
