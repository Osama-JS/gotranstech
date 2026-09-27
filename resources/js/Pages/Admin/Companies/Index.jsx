import React, { useState } from 'react';
import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
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
        city: 'الرياض',
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
            { search, status, city, date_from: dateFrom, date_to: dateTo },
            { preserveState: true }
        );
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('');
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
            city: comp.city || 'الرياض',
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
        { value: '', label: 'جميع الحالات' },
        { value: 'active', label: 'نشطة (Active)' },
        { value: 'suspended', label: 'موقوفة (Suspended)' },
        { value: 'pending', label: 'معلقة (Pending)' },
        { value: 'inactive', label: 'غير مفعلة (Inactive)' },
    ];

    const cityOptions = [
        { value: '', label: 'جميع المدن' },
        { value: 'الرياض', label: 'الرياض (Riyadh)' },
        { value: 'جدة', label: 'جدة (Jeddah)' },
        { value: 'الدمام', label: 'الدمام (Dammam)' },
        { value: 'مكة المكرمة', label: 'مكة المكرمة (Makkah)' },
        { value: 'المدينة المنورة', label: 'المدينة المنورة (Madinah)' },
        { value: 'الخبر', label: 'الخبر (Khobar)' },
        { value: 'القصيم', label: 'القصيم (Qassim)' },
        { value: 'أبها', label: 'أبها (Abha)' },
        { value: 'تبوك', label: 'تبوك (Tabuk)' },
    ];

    return (
        <AuthenticatedLayout title="إدارة الشركات اللوجستية وعمولات الـ API">
            <Head title="إدارة الشركات اللوجستية" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="إدارة الشركات اللوجستية"
                subtitle="إدارة حسابات شركات الشحن والنقل، توليد مفاتيح الربط B2B API، وتحديد نسب عمولة المنصة ومتابعة المديونيات"
                icon={Building2}
                iconColor="text-blue-400"
                iconBg="bg-blue-500/10 border-blue-500/20"
                breadcrumbs={[{ label: 'الشركات اللوجستية' }]}
                badge={`${stats?.total || 0} شركة`}
                actions={
                    <button
                        type="button"
                        onClick={handleOpenCreateModal}
                        className="px-4 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center gap-2 cursor-pointer"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>إضافة شركة لوجستية جديدة</span>
                    </button>
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
                    title="إجمالي الشركات اللوجستية"
                    value={stats?.total || 0}
                    subtitle={`منها ${stats?.active || 0} نشطة ومربوطة`}
                    icon={Building2}
                    color="blue"
                />
                <StatCard
                    title="الشركات الموقوفة"
                    value={stats?.suspended || 0}
                    subtitle="حسابات متوقفة عن استلام التمويل"
                    icon={ShieldAlert}
                    color="amber"
                />
                <StatCard
                    title="إجمالي رصيد التمويل المتاح"
                    value={`${parseFloat(stats?.total_funding_balance || 0).toLocaleString('en-US')} ر.س`}
                    subtitle="مستحق للصرف للشركات"
                    icon={DollarSign}
                    color="brand"
                />
                <StatCard
                    title="إجمالي المديونيات القائمة"
                    value={`${parseFloat(stats?.total_debt_balance || 0).toLocaleString('en-US')} ر.س`}
                    subtitle="التزامات واجبة السداد"
                    icon={TrendingUp}
                    color="rose"
                />
            </div>

            {/* Advanced Filter Bar */}
            <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-5 rounded-3xl mb-6 shadow-xl relative z-30 overflow-visible">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                    {/* Search */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400">البحث السريع</label>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="ابحث باسم الشركة، السجل، أو البريد..."
                                className="w-full ps-10 pe-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <SearchableSelect
                        label="الحالة"
                        options={statusOptions}
                        value={status}
                        onChange={(val) => setStatus(val)}
                        placeholder="جميع الحالات"
                    />

                    {/* City Filter */}
                    <SearchableSelect
                        label="المدينة"
                        options={cityOptions}
                        value={city}
                        onChange={(val) => setCity(val)}
                        placeholder="جميع المدن"
                    />

                    {/* Date From */}
                    <DatePicker
                        label="تاريخ التسجيل من"
                        value={dateFrom}
                        onChange={(val) => setDateFrom(val)}
                        placeholder="من تاريخ..."
                    />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <Search className="w-3.5 h-3.5" />
                            <span>تصفية</span>
                        </button>
                        {(search || status || city || dateFrom || dateTo) && (
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl text-xs transition-colors cursor-pointer"
                                title="إعادة تعيين الفلاتر"
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
                                <th className="p-4 text-start">الشركة اللوجستية</th>
                                <th className="p-4 text-start">السجل التجاري</th>
                                <th className="p-4 text-start">مسؤول التواصل</th>
                                <th className="p-4 text-start">عمولة المنصة</th>
                                <th className="p-4 text-start">رصيد التمويل المتاح</th>
                                <th className="p-4 text-start">المهام</th>
                                <th className="p-4 text-start">الحالة</th>
                                <th className="p-4 text-center">الإجراءات</th>
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
                                                {parseFloat(fundingWallet?.balance || 0).toLocaleString('en-US')} ر.س
                                                {parseFloat(debtWallet?.balance || 0) > 0 && (
                                                    <span className="text-[10px] text-rose-400 block font-normal">
                                                        ديون: {parseFloat(debtWallet?.balance || 0).toLocaleString('en-US')} ر.س
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
                                                        title="عرض الملف المفصل والمحافظ"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditModal(comp)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                                        title="تعديل البيانات والنسبة"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenKeyModal(comp)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                                                        title="توليد مفتاح API"
                                                    >
                                                        <Key className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenResetPassModal(comp)}
                                                        className="p-2 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                                                        title="إعادة تعيين كلمة المرور"
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
                                                        title={comp.status === 'active' ? 'إيقاف الشركة' : 'تفعيل الشركة'}
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
                                        لا توجد شركات لوجستية تطابق معايير البحث.
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
                title="إضافة شركة لوجستية جديدة"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم الشركة اللوجستية *</label>
                            <input
                                type="text"
                                value={createData.company_name}
                                onChange={(e) => setCreateData('company_name', e.target.value)}
                                placeholder="شركة أسطول النقل السريع"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {createErrors.company_name && <p className="text-xs text-rose-400 mt-1">{createErrors.company_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم السجل التجاري (CR)</label>
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
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم ممثل الشركة *</label>
                            <input
                                type="text"
                                value={createData.name}
                                onChange={(e) => setCreateData('name', e.target.value)}
                                placeholder="فهد عبد العزيز"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                                required
                            />
                            {createErrors.name && <p className="text-xs text-rose-400 mt-1">{createErrors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني للربط *</label>
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
                            label="رقم هاتف التواصل"
                            countryCode={createData.country_code}
                            onCountryCodeChange={(code) => setCreateData('country_code', code)}
                            value={createData.phone}
                            onChange={(e) => setCreateData('phone', e.target.value)}
                            error={createErrors.phone}
                            required
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور الابتدائية *</label>
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
                            label="المدينة الرئيسية"
                            options={cityOptions.filter((o) => o.value !== '')}
                            value={createData.city}
                            onChange={(val) => setCreateData('city', val)}
                            placeholder="اختر المدينة..."
                        />

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">نسبة عمولة المنصة (%) *</label>
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
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={createProcessing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {createProcessing ? 'جاري الإنشاء...' : 'إنشاء حساب الشركة'}
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
                title={`تعديل بيانات الشركة: ${selectedCompany?.company_name || ''}`}
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleEditSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم الشركة *</label>
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
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">السجل التجاري (CR)</label>
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
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم مسؤول التواصل *</label>
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
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني *</label>
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
                            label="رقم الهاتف"
                            countryCode={editData.country_code}
                            onCountryCodeChange={(code) => setEditData('country_code', code)}
                            value={editData.phone}
                            onChange={(e) => setEditData('phone', e.target.value)}
                            error={editErrors.phone}
                            required
                        />

                        <SearchableSelect
                            label="المدينة"
                            options={cityOptions.filter((o) => o.value !== '')}
                            value={editData.city}
                            onChange={(val) => setEditData('city', val)}
                            placeholder="اختر المدينة..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">نسبة عمولة المنصة (%) *</label>
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
                            label="حالة الحساب"
                            options={statusOptions.filter((o) => o.value !== '')}
                            value={editData.status}
                            onChange={(val) => setEditData('status', val)}
                            placeholder="اختر الحالة..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={editProcessing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {editProcessing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
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
                title={`توليد مفتاح API للشركة: ${selectedCompany?.company_name || ''}`}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleKeySubmit} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        سيتم توليد مفتاح API بصلاحيات كاملة للشركة لإرسال المهام والاستعلام. المفتاح سيظهر مرة واحدة فقط.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم وتسمية المفتاح</label>
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
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={keyProcessing}
                            className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {keyProcessing ? 'جاري التوليد...' : 'توليد المفتاح الآن'}
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
                title={`إعادة تعيين كلمة المرور: ${selectedCompany?.company_name || ''}`}
                maxWidth="max-w-md"
            >
                <form onSubmit={handleResetPassSubmit} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        أدخل كلمة المرور الجديدة لحساب الشركة. سيتم تحديث الحساب وتشفيرها فوراً.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور الجديدة *</label>
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
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">تأكيد كلمة المرور الجديدة *</label>
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
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={passProcessing}
                            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {passProcessing ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Status Change Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!confirmStatusTarget}
                onClose={() => setConfirmStatusTarget(null)}
                onConfirm={confirmToggleStatus}
                title="تغيير حالة الشركة اللوجستية"
                message={`هل أنت متأكد من رغبتك في تغيير حالة الشركة "${confirmStatusTarget?.company_name}"؟`}
                confirmText="تأكيد تغيير الحالة"
                cancelText="إلغاء"
                type="warning"
            />
        </AuthenticatedLayout>
    );
}
