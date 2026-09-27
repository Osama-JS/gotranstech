import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
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
        <AuthenticatedLayout title={`ملف المستثمر: ${investor.name}`}>
            <Head title={`المستثمر: ${investor.name}`} />

            <AdminPageHeader
                title={investor.name}
                subtitle={`عضوية مستثمر منذ ${new Date(investor.created_at).toLocaleDateString('ar-SA')}`}
                icon={Users}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/10 border-violet-500/20"
                breadcrumbs={[
                    { label: 'المستثمرون', href: route('admin.investors.index') },
                    { label: investor.name },
                ]}
                badge={<Badge status={investor.status} />}
                actions={
                    <Link
                        href={route('admin.investors.index')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                        <span>العودة لقائمة المستثمرين</span>
                    </Link>
                }
            />

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="رصيد محفظة الاستثمار"
                    value={`${parseFloat(profileStats?.investment_balance || 0).toLocaleString('en-US')} ر.س`}
                    subtitle="متاح للاستثمار الفوري"
                    icon={Wallet}
                    color="brand"
                />
                <StatCard
                    title="رصيد محفظة العمولات"
                    value={`${parseFloat(profileStats?.commission_balance || 0).toLocaleString('en-US')} ر.س`}
                    subtitle="أرباح محققة قابلة للسحب"
                    icon={TrendingUp}
                    color="blue"
                />
                <StatCard
                    title="إجمالي المبالغ المستثمرة"
                    value={`${parseFloat(profileStats?.total_invested || 0).toLocaleString('en-US')} ر.س`}
                    subtitle={`في ${profileStats?.funded_tasks_count || 0} مهمة لوجستية`}
                    icon={Truck}
                    color="purple"
                />
                <StatCard
                    title="إجمالي الأرباح الموزعة"
                    value={`${parseFloat(profileStats?.total_profits || 0).toLocaleString('en-US')} ر.س`}
                    subtitle={`بنسبة ربح ${profile?.platform_commission_share_rate || 70}%`}
                    icon={Receipt}
                    color="cyan"
                />
            </div>

            {/* Investor Profile Summary Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-400" />
                    <span>البيانات الشخصية والحساب البنكي</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                    <div>
                        <span className="text-slate-400 block mb-1">البريد الإلكتروني</span>
                        <span className="font-mono text-slate-200 font-bold select-all">{investor.email}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">رقم الهاتف الجوال</span>
                        <PhoneDisplay countryCode={investor.country_code} phone={investor.phone} />
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">الهوية الوطنية / الإقامة</span>
                        <span className="font-mono text-slate-200 font-bold">{profile?.national_id || '-'}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">نسبة توزيع الأرباح</span>
                        <span className="font-mono font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/20">
                            {profile?.platform_commission_share_rate || 70}%
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">البنك المعتمد</span>
                        <span className="text-slate-200 font-bold">{profile?.bank_name || '-'}</span>
                    </div>

                    <div className="lg:col-span-2">
                        <span className="text-slate-400 block mb-1">رقم الآيبان (IBAN)</span>
                        <span className="font-mono text-slate-200 font-bold select-all" dir="ltr">
                            {profile?.bank_iban || '-'}
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">حالة الحساب</span>
                        <Badge status={investor.status} />
                    </div>
                </div>

                {/* Additional Dynamic Data Fields if any */}
                {investor.additional_data && Object.keys(investor.additional_data).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-violet-400 mb-3 flex items-center gap-1.5">
                            <FormInput className="w-3.5 h-3.5" />
                            <span>البيانات الإضافية المعبأة (حسب نموذج التسجيل)</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(investor.additional_data).map(([key, val]) => (
                                <div key={key} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                                    <span className="text-[11px] text-slate-400 block mb-1">{key}</span>
                                    <span className="text-xs font-bold text-slate-200 font-mono">
                                        {typeof val === 'boolean' ? (val ? 'نعم' : 'لا') : String(val || '-')}
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
                    { key: 'wallets', label: 'المحافظ وسجل المعاملات المالية', icon: Wallet, count: allTransactions.length },
                    { key: 'tasks', label: 'المهام الممولة', icon: Truck, count: investor.investments?.length || 0 },
                    { key: 'deposits', label: 'سجل الإيداعات البنكية', icon: Receipt, count: investor.bank_deposits?.length || 0 },
                    { key: 'contracts', label: 'العقود والاتفاقيات', icon: FileText, count: investor.contracts?.length || 0 },
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
                        <h4 className="font-bold text-white text-sm">سجل القيود المزدوجة (Double-Entry Ledger)</h4>
                        <span className="text-xs text-slate-400">آخر 30 حركة مالية</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-start text-xs text-slate-300">
                            <thead>
                                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                    <th className="p-4 text-start">رقم المعاملة</th>
                                    <th className="p-4 text-start">نوع المحفظة</th>
                                    <th className="p-4 text-start">نوع الحركة</th>
                                    <th className="p-4 text-start">المبلغ</th>
                                    <th className="p-4 text-start">الرصيد بعدها</th>
                                    <th className="p-4 text-start">الوصف والبيان</th>
                                    <th className="p-4 text-start">التاريخ والوقت</th>
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
                                                        {tx.wallet?.wallet_type === 'investor_investment' ? 'محفظة الاستثمار' : 'محفظة العمولات'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 font-bold ${isCredit ? 'text-violet-400' : 'text-rose-400'}`}>
                                                        {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                        {isCredit ? 'إيداع / إضافة' : 'خصم / تمويل'}
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-sm">
                                                    <span className={isCredit ? 'text-violet-400' : 'text-rose-400'}>
                                                        {isCredit ? '+' : '-'}{parseFloat(tx.amount).toLocaleString('en-US')} ر.س
                                                    </span>
                                                </td>
                                                <td className="p-4 font-mono text-slate-200">
                                                    {parseFloat(tx.balance_after).toLocaleString('en-US')} ر.س
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
                                            لا توجد حركات مالية مسجلة حتى الآن.
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
                                    <th className="p-4 text-start">رقم المهمة</th>
                                    <th className="p-4 text-start">الشركة اللوجستية</th>
                                    <th className="p-4 text-start">مسار الشحنة</th>
                                    <th className="p-4 text-start">مبلغ التمويل</th>
                                    <th className="p-4 text-start">ربح المستثمر المحقق</th>
                                    <th className="p-4 text-start">حالة المهمة</th>
                                    <th className="p-4 text-start">تاريخ التمويل</th>
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
                                                {parseFloat(inv.invested_amount).toLocaleString('en-US')} ر.س
                                            </td>
                                            <td className="p-4 font-mono font-bold text-violet-400">
                                                +{parseFloat(inv.investor_profit_amount).toLocaleString('en-US')} ر.س
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
                                            لم يقم المستثمر بتمويل أي مهام لوجستية بعد.
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
                                    <th className="p-4 text-start">رقم الإيداع</th>
                                    <th className="p-4 text-start">المبلغ المودع</th>
                                    <th className="p-4 text-start">البنك المحول إليه</th>
                                    <th className="p-4 text-start">الرقم المرجعي</th>
                                    <th className="p-4 text-start">الحالة</th>
                                    <th className="p-4 text-start">تاريخ الإيداع</th>
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
                                                {parseFloat(dep.amount).toLocaleString('en-US')} ر.س
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
                                            لا توجد طلبات إيداع بنكي مسجلة.
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
                                    <th className="p-4 text-start">رقم العقد</th>
                                    <th className="p-4 text-start">عنوان الاتفاقية</th>
                                    <th className="p-4 text-start">نسبة العمولة المتفق عليها</th>
                                    <th className="p-4 text-start">تاريخ البدء</th>
                                    <th className="p-4 text-start">الحالة</th>
                                    <th className="p-4 text-center">عرض العقد</th>
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
                                                    <span>التفاصيل</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-500">
                                            لا توجد عقود مسجلة لهذا المستثمر.
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
