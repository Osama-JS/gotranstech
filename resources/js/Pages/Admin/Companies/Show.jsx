import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
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
} from 'lucide-react';

export default function AdminCompanyShow({ company, profileStats }) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('wallets'); // wallets, keys, tasks, withdrawals
    const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [confirmRevokeTarget, setConfirmRevokeTarget] = useState(null);

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
    });

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
        <AuthenticatedLayout title={`ملف الشركة: ${company.company_name}`}>
            <Head title={`الشركة: ${company.company_name}`} />

            <AdminPageHeader
                title={company.company_name}
                subtitle={`شركة مسجلة في مدينة ${company.city} منذ ${new Date(company.created_at).toLocaleDateString('ar-SA')}`}
                icon={Building2}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/10 border-blue-500/20"
                breadcrumbs={[
                    { label: 'الشركات اللوجستية', href: route('admin.companies.index') },
                    { label: company.company_name },
                ]}
                badge={<Badge status={company.status} />}
                actions={
                    <Link
                        href={route('admin.companies.index')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <ChevronLeft className="w-4 h-4 rtl:rotate-0 ltr:rotate-180" />
                        <span>العودة لقائمة الشركات</span>
                    </Link>
                }
            />

            {/* Generated API Key Banner */}
            {flash?.generated_key && (
                <div className="bg-violet-950/90 border-2 border-violet-500/60 p-6 rounded-3xl shadow-2xl mb-8 animate-fadeIn">
                    <div className="flex items-center gap-3 mb-2">
                        <Key className="w-6 h-6 text-violet-400" />
                        <h4 className="font-bold text-white text-base">تم توليد مفتاح API للشركة بنجاح!</h4>
                    </div>
                    <p className="text-xs text-slate-300 mb-4">
                        يرجى نسخ هذا المفتاح وتسليمه لممثل الشركة، فلن يظهر كاملاً مرة أخرى:
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
                            <span>{copiedKey ? 'تم النسخ' : 'نسخ المفتاح'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="رصيد التمويل المتاح"
                    value={`${parseFloat(profileStats?.funding_balance || 0).toLocaleString('en-US')} ر.س`}
                    subtitle="متاح للصرف عبر طلبات السحب"
                    icon={DollarSign}
                    color="brand"
                />
                <StatCard
                    title="المديونيات والالتزامات القائمة"
                    value={`${parseFloat(profileStats?.debt_balance || 0).toLocaleString('en-US')} ر.س`}
                    subtitle="مستحقة السداد عند انتهاء المهام"
                    icon={TrendingUp}
                    color="rose"
                />
                <StatCard
                    title="إجمالي حجم التمويل المنفذ"
                    value={`${parseFloat(profileStats?.total_funded_tasks_volume || 0).toLocaleString('en-US')} ر.س`}
                    subtitle={`من إجمالي ${company.tasks_count || 0} مهمة مرسلة`}
                    icon={Truck}
                    color="blue"
                />
                <StatCard
                    title="إجمالي المسحوبات المصروفة"
                    value={`${parseFloat(profileStats?.total_withdrawals || 0).toLocaleString('en-US')} ر.س`}
                    subtitle="تم اعتمادها وسحبها بعقود رسمية"
                    icon={ArrowDownToLine}
                    color="purple"
                />
            </div>

            {/* Company Info Summary Card */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span>البيانات التجارية ومسؤول التواصل</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
                    <div>
                        <span className="text-slate-400 block mb-1">اسم الشركة التجاري</span>
                        <span className="text-slate-200 font-bold">{company.company_name}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">رقم السجل التجاري (CR)</span>
                        <span className="font-mono text-slate-200 font-bold">{company.cr_number || '-'}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">المدينة الرئيسية</span>
                        <span className="text-slate-200 font-bold">{company.city || '-'}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">نسبة عمولة المنصة</span>
                        <span className="font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                            {company.platform_commission_rate}%
                        </span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">مسؤول التواصل</span>
                        <span className="text-slate-200 font-bold">{company.contact_person || company.user?.name}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">البريد الإلكتروني</span>
                        <span className="font-mono text-slate-200 font-bold select-all">{company.contact_email || company.user?.email}</span>
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">رقم الهاتف الجوال</span>
                        <PhoneDisplay countryCode={company.user?.country_code} phone={company.user?.phone || company.contact_phone} />
                    </div>

                    <div>
                        <span className="text-slate-400 block mb-1">حالة الحساب</span>
                        <Badge status={company.status} />
                    </div>
                </div>

                {/* Additional Dynamic Data Fields if any */}
                {company.user?.additional_data && Object.keys(company.user.additional_data).length > 0 && (
                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <h4 className="text-xs font-bold text-blue-400 mb-3 flex items-center gap-1.5">
                            <FormInput className="w-3.5 h-3.5" />
                            <span>البيانات الإضافية المعبأة للشركة (حسب نموذج التسجيل)</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(company.user.additional_data).map(([key, val]) => (
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
                    { key: 'wallets', label: 'المحافظ والقيود المحاسبية', icon: Wallet, count: allTransactions.length },
                    { key: 'keys', label: 'مفاتيح الربط والـ API', icon: Key, count: company.api_keys?.length || 0 },
                    { key: 'tasks', label: 'سجل المهام والشحنات', icon: Truck, count: company.tasks?.length || 0 },
                    { key: 'withdrawals', label: 'طلبات السحب والمديونيات', icon: ArrowDownToLine, count: company.withdrawal_requests?.length || 0 },
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
                        <h4 className="font-bold text-white text-sm">سجل القيود المزدوجة (Funding & Debt Ledger)</h4>
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
                                                        {tx.wallet?.wallet_type === 'company_funding' ? 'محفظة التمويل' : 'محفظة المديونيات'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center gap-1 font-bold ${isCredit ? 'text-violet-400' : 'text-rose-400'}`}>
                                                        {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                                                        {isCredit ? 'إضافة / إيداع' : 'خصم / سحب'}
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
                                            لا توجد حركات مالية مسجلة لهذه الشركة بعد.
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
                            <span>توليد مفتاح API جديد</span>
                        </button>
                    </div>

                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-start text-xs text-slate-300">
                                <thead>
                                    <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold">
                                        <th className="p-4 text-start">تسمية المفتاح</th>
                                        <th className="p-4 text-start">بادئة المفتاح (Prefix)</th>
                                        <th className="p-4 text-start">آخر استخدام</th>
                                        <th className="p-4 text-start">الحالة</th>
                                        <th className="p-4 text-start">تاريخ الإنشاء</th>
                                        <th className="p-4 text-center">تعطيل</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {company.api_keys && company.api_keys.length > 0 ? (
                                        company.api_keys.map((k) => (
                                            <tr key={k.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 font-bold text-slate-200">{k.key_name}</td>
                                                <td className="p-4 font-mono text-violet-400 font-bold">{k.key_prefix}...</td>
                                                <td className="p-4 font-mono text-slate-400">
                                                    {k.last_used_at ? new Date(k.last_used_at).toLocaleString('ar-SA') : 'لم يستخدم بعد'}
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
                                                            title="تعطيل المفتاح"
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
                                                لا توجد مفاتيح API مولدة لهذه الشركة.
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
                                    <th className="p-4 text-start">رقم المهمة</th>
                                    <th className="p-4 text-start">المعرف الخارجي</th>
                                    <th className="p-4 text-start">المسار (من ➔ إلى)</th>
                                    <th className="p-4 text-start">مبلغ المهمة</th>
                                    <th className="p-4 text-start">عمولة المنصة</th>
                                    <th className="p-4 text-start">صافي التمويل</th>
                                    <th className="p-4 text-start">الحالة</th>
                                    <th className="p-4 text-start">التاريخ</th>
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
                                                {parseFloat(task.amount).toLocaleString('en-US')} ر.س
                                            </td>
                                            <td className="p-4 font-mono text-rose-400">
                                                -{parseFloat(task.platform_commission_amount).toLocaleString('en-US')} ر.س
                                            </td>
                                            <td className="p-4 font-mono font-bold text-violet-400">
                                                {parseFloat(task.net_funding_amount).toLocaleString('en-US')} ر.س
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
                                            لا توجد مهام مسجلة لهذه الشركة.
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
                                    <th className="p-4 text-start">رقم طلب السحب</th>
                                    <th className="p-4 text-start">عدد المهام</th>
                                    <th className="p-4 text-start">إجمالي المبلغ المطلوب</th>
                                    <th className="p-4 text-start">تاريخ الاستحقاق (المديونية)</th>
                                    <th className="p-4 text-start">الحالة</th>
                                    <th className="p-4 text-center">عقد السحب الموثق (PDF)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {company.withdrawal_requests && company.withdrawal_requests.length > 0 ? (
                                    company.withdrawal_requests.map((w) => (
                                        <tr key={w.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4 font-mono text-slate-300 font-bold">
                                                #{w.request_number}
                                            </td>
                                            <td className="p-4 font-mono text-slate-400">{w.items_count || w.items?.length || 1} مهام</td>
                                            <td className="p-4 font-mono font-bold text-violet-400 text-sm">
                                                {parseFloat(w.requested_amount || w.total_amount || 0).toLocaleString('en-US')} ر.س
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
                                                        <span>تحميل PDF</span>
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
                                            لا توجد طلبات سحب رصيد مسجلة.
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
                title="توليد مفتاح API جديد للشركة"
                maxWidth="max-w-md"
            >
                <form onSubmit={handleKeySubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">تسمية المفتاح</label>
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
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={keyProcessing}
                            className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {keyProcessing ? 'جاري التوليد...' : 'توليد المفتاح'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Revoke API Key Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!confirmRevokeTarget}
                onClose={() => setConfirmRevokeTarget(null)}
                onConfirm={confirmRevoke}
                title="تعطيل مفتاح API"
                message="هل أنت متأكد من تعطيل هذا المفتاح؟ ستتوقف أنظمة الشركة عن الاتصال عبر هذا المفتاح فوراً."
                confirmText="تأكيد التعطيل"
                cancelText="إلغاء"
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
