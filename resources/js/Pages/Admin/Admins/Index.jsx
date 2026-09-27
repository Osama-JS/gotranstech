import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import StatCard from '../../../Components/StatCard';
import SearchableSelect from '../../../Components/SearchableSelect';
import Pagination from '../../../Components/Pagination';
import Modal from '../../../Components/Modal';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import Badge from '../../../Components/Badge';
import PhoneInput from '../../../Components/PhoneInput';
import PhoneDisplay from '../../../Components/PhoneDisplay';
import { 
    UserCog, 
    PlusCircle, 
    Edit, 
    Key, 
    ShieldCheck, 
    Search, 
    Filter, 
    RefreshCw, 
    UserCheck, 
    UserX, 
    Lock, 
    Mail, 
    Shield, 
    Save, 
    Users,
    Activity
} from 'lucide-react';

export default function AdminAdmins({ admins, roles = [], stats = {}, filters = {} }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');

    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [confirmStatusTarget, setConfirmStatusTarget] = useState(null);

    // Form for Create Admin
    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, reset: resetCreate, errors: createErrors } = useForm({
        name: '',
        email: '',
        country_code: '+966',
        phone: '',
        password: '',
        role: roles[0]?.name || 'admin',
        status: 'active',
    });

    // Form for Edit Admin
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors } = useForm({
        name: '',
        email: '',
        country_code: '+966',
        phone: '',
        role: 'admin',
        status: 'active',
    });

    // Form for Reset Password
    const { data: passData, setData: setPassData, post: postPass, processing: passProcessing, reset: resetPass, errors: passErrors } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleFilter = (e) => {
        if (e) e.preventDefault();
        router.get(route('admin.admins.index'), {
            search,
            role: roleFilter,
            status: statusFilter,
        }, { preserveState: true, preserveScroll: true });
    };

    const handleReset = () => {
        setSearch('');
        setRoleFilter('');
        setStatusFilter('');
        router.get(route('admin.admins.index'));
    };

    const handleOpenEdit = (admin) => {
        setSelectedAdmin(admin);
        const assignedRole = admin.roles && admin.roles.length > 0 ? admin.roles[0].name : 'admin';
        setEditData({
            name: admin.name,
            email: admin.email,
            country_code: admin.country_code || '+966',
            phone: admin.phone || '',
            role: assignedRole,
            status: admin.status || 'active',
        });
        setEditModalOpen(true);
    };

    const handleOpenPassword = (admin) => {
        setSelectedAdmin(admin);
        resetPass();
        setPasswordModalOpen(true);
    };

    const handleToggleStatus = (admin) => {
        setConfirmStatusTarget(admin);
    };

    const confirmToggleStatus = () => {
        if (confirmStatusTarget) {
            router.post(route('admin.admins.toggle-status', confirmStatusTarget.id), {}, {
                preserveScroll: true,
                onSuccess: () => setConfirmStatusTarget(null),
                onFinish: () => setConfirmStatusTarget(null),
            });
        }
    };

    const submitCreate = (e) => {
        e.preventDefault();
        postCreate(route('admin.admins.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                resetCreate();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        putEdit(route('admin.admins.update', selectedAdmin.id), {
            onSuccess: () => {
                setEditModalOpen(false);
            },
        });
    };

    const submitPassword = (e) => {
        e.preventDefault();
        if (!selectedAdmin) return;
        postPass(route('admin.admins.reset-password', selectedAdmin.id), {
            onSuccess: () => {
                setPasswordModalOpen(false);
                resetPass();
            },
        });
    };

    const roleOptions = [
        { value: '', label: 'جميع الرتب والأدوار' },
        ...roles.map(r => ({ value: r.name, label: r.name }))
    ];

    const statusOptions = [
        { value: '', label: 'جميع الحالات' },
        { value: 'active', label: 'نشط (Active)' },
        { value: 'suspended', label: 'موقوف (Suspended)' },
    ];

    return (
        <AuthenticatedLayout title="إدارة المشرفين والمسؤولين">
            <Head title="إدارة المشرفين والمسؤولين - إدارة المنصة" />

            <div className="space-y-6 pb-12">
                {/* Header */}
                <AdminPageHeader
                    title="إدارة المشرفين والمسؤولين"
                    subtitle="إدارة حسابات طاقم الإدارة، تعيين الأدوار والصلاحيات، وإعادة ضبط كلمات المرور"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'المشرفين والمسؤولين' }
                    ]}
                    icon={UserCog}
                    iconColor="text-indigo-400"
                    actions={[
                        {
                            label: 'إضافة مشرف / مسؤول جديد',
                            icon: PlusCircle,
                            onClick: () => setCreateModalOpen(true),
                            variant: 'primary',
                        }
                    ]}
                    badge={{ text: `${stats?.total_admins || admins.total || 0} مشرف مسجل`, color: 'indigo' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title="إجمالي طاقم الإدارة"
                        value={stats?.total_admins || 0}
                        icon={Users}
                        color="blue"
                        description="مشرفين وموظفين مسجلين"
                    />
                    <StatCard
                        title="الحسابات النشطة"
                        value={stats?.active_admins || 0}
                        icon={UserCheck}
                        color="brand"
                        description="حسابات مفعلة حالياً"
                    />
                    <StatCard
                        title="مدراء النظام (Super Admins)"
                        value={stats?.super_admins || 0}
                        icon={ShieldCheck}
                        color="purple"
                        description="بكامل الصلاحيات"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl relative z-30 overflow-visible">
                    <form onSubmit={handleFilter} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-400 mb-1.5">بحث سريع</label>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute start-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="الاسم، البريد، رقم الهاتف..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl ps-10 pe-3.5 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                                    />
                                </div>
                            </div>

                            <SearchableSelect
                                label="الدور / الرتبة"
                                options={roleOptions}
                                value={roleFilter}
                                onChange={setRoleFilter}
                                placeholder="اختر الدور..."
                            />

                            <SearchableSelect
                                label="الحالة"
                                options={statusOptions}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                placeholder="اختر الحالة..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="submit"
                                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                <span>تطبيق الفلترة</span>
                            </button>
                            {(search || roleFilter || statusFilter) && (
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                                    title="إعادة ضبط"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Admins Table */}
                <div className="bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl relative z-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">الاسم والبيانات</th>
                                    <th className="p-4">رقم الهاتف الدولي</th>
                                    <th className="p-4">الدور / الرتبة</th>
                                    <th className="p-4">نوع الحساب</th>
                                    <th className="p-4">الحالة</th>
                                    <th className="p-4">تاريخ الانضمام</th>
                                    <th className="p-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {admins?.data && admins.data.length > 0 ? (
                                    admins.data.map((admin) => {
                                        const primaryRole = admin.roles && admin.roles.length > 0 ? admin.roles[0].name : 'admin';

                                        return (
                                            <tr key={admin.id} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                                            {admin.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-slate-100 block">{admin.name}</span>
                                                            <span className="text-[11px] text-slate-400 font-mono block">{admin.email}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <PhoneDisplay countryCode={admin.country_code} phone={admin.phone} />
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold inline-flex items-center gap-1">
                                                        <Shield className="w-3 h-3 text-indigo-400" />
                                                        <span>{primaryRole}</span>
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-slate-300 font-medium">
                                                        {admin.user_type === 'admin' ? 'مدير نظام' : 'موظف / مشغل'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <Badge status={admin.status} />
                                                </td>
                                                <td className="p-4 text-slate-400 font-mono text-[11px]">
                                                    {new Date(admin.created_at).toLocaleDateString('ar-SA')}
                                                </td>
                                                <td className="p-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEdit(admin)}
                                                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition-all text-xs"
                                                            title="تعديل البيانات والدور"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenPassword(admin)}
                                                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border border-slate-700 transition-all text-xs"
                                                            title="إعادة تعيين كلمة المرور"
                                                        >
                                                            <Key className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleStatus(admin)}
                                                            className={`p-1.5 rounded-xl border transition-all text-xs ${
                                                                admin.status === 'active'
                                                                    ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/20'
                                                                    : 'bg-violet-500/10 hover:bg-[#5217D4]/20 text-violet-400 border-violet-500/20'
                                                            }`}
                                                            title={admin.status === 'active' ? 'إيقاف الحساب' : 'تفعيل الحساب'}
                                                        >
                                                            {admin.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <UserCog className="w-8 h-8 text-slate-600" />
                                                <p className="text-sm font-semibold">لا يوجد مشرفين مطابقين لمعايير البحث</p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline"
                                                >
                                                    إلغاء الفلاتر
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/40">
                        <Pagination links={admins?.links} meta={admins} />
                    </div>
                </div>
            </div>

            {/* Create Admin Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="إضافة مشرف / مسؤول جديد"
                maxWidth="lg"
            >
                <form onSubmit={submitCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">الاسم الكامل</label>
                        <input
                            type="text"
                            value={createData.name}
                            onChange={(e) => setCreateData('name', e.target.value)}
                            placeholder="محمد أحمد"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            required
                        />
                        {createErrors.name && <p className="text-xs text-rose-400 mt-1">{createErrors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={createData.email}
                            onChange={(e) => setCreateData('email', e.target.value)}
                            placeholder="admin@example.com"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                            required
                        />
                        {createErrors.email && <p className="text-xs text-rose-400 mt-1">{createErrors.email}</p>}
                    </div>

                    {/* Phone Input with Country Code */}
                    <PhoneInput
                        countryCode={createData.country_code}
                        phone={createData.phone}
                        onCountryChange={(code) => setCreateData('country_code', code)}
                        onPhoneChange={(p) => setCreateData('phone', p)}
                        error={createErrors.phone}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">الدور / الرتبة</label>
                            <SearchableSelect
                                options={roles.map(r => ({ value: r.name, label: r.name }))}
                                value={createData.role}
                                onChange={(val) => setCreateData('role', val)}
                                placeholder="اختر الدور..."
                            />
                            {createErrors.role && <p className="text-xs text-rose-400 mt-1">{createErrors.role}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">حالة الحساب</label>
                            <select
                                value={createData.status}
                                onChange={(e) => setCreateData('status', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="active">نشط (Active)</option>
                                <option value="suspended">موقوف (Suspended)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور الأولية</label>
                        <input
                            type="password"
                            value={createData.password}
                            onChange={(e) => setCreateData('password', e.target.value)}
                            placeholder="********"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                            required
                        />
                        {createErrors.password && <p className="text-xs text-rose-400 mt-1">{createErrors.password}</p>}
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setCreateModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={createProcessing}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {createProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>إضافة وتفعيل المشرف</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Admin Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={`تعديل بيانات المشرف (${selectedAdmin?.name})`}
                maxWidth="lg"
            >
                <form onSubmit={submitEdit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">الاسم الكامل</label>
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData('name', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            required
                        />
                        {editErrors.name && <p className="text-xs text-rose-400 mt-1">{editErrors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني</label>
                        <input
                            type="email"
                            value={editData.email}
                            onChange={(e) => setEditData('email', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                            required
                        />
                        {editErrors.email && <p className="text-xs text-rose-400 mt-1">{editErrors.email}</p>}
                    </div>

                    {/* Phone Input with Country Code */}
                    <PhoneInput
                        countryCode={editData.country_code}
                        phone={editData.phone}
                        onCountryChange={(code) => setEditData('country_code', code)}
                        onPhoneChange={(p) => setEditData('phone', p)}
                        error={editErrors.phone}
                        required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">الدور / الرتبة</label>
                            <SearchableSelect
                                options={roles.map(r => ({ value: r.name, label: r.name }))}
                                value={editData.role}
                                onChange={(val) => setEditData('role', val)}
                                placeholder="اختر الدور..."
                            />
                            {editErrors.role && <p className="text-xs text-rose-400 mt-1">{editErrors.role}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">حالة الحساب</label>
                            <select
                                value={editData.status}
                                onChange={(e) => setEditData('status', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="active">نشط (Active)</option>
                                <option value="suspended">موقوف (Suspended)</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setEditModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={editProcessing}
                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {editProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>حفظ التعديلات</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal
                isOpen={passwordModalOpen}
                onClose={() => setPasswordModalOpen(false)}
                title={`إعادة تعيين كلمة المرور للمشرف (${selectedAdmin?.name})`}
                maxWidth="md"
            >
                <form onSubmit={submitPassword} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                        سيتم تحديث وتشفير كلمة المرور الجديدة في قاعدة البيانات فوراً.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور الجديدة</label>
                        <input
                            type="password"
                            value={passData.password}
                            onChange={(e) => setPassData('password', e.target.value)}
                            placeholder="********"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                            required
                        />
                        {passErrors.password && <p className="text-xs text-rose-400 mt-1">{passErrors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">تأكيد كلمة المرور</label>
                        <input
                            type="password"
                            value={passData.password_confirmation}
                            onChange={(e) => setPassData('password_confirmation', e.target.value)}
                            placeholder="********"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setPasswordModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={passProcessing}
                            className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {passProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Key className="w-4 h-4" />
                                    <span>تحديث كلمة المرور</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Status Change Confirmation Modal */}
            <ConfirmDialog
                isOpen={!!confirmStatusTarget}
                onClose={() => setConfirmStatusTarget(null)}
                onConfirm={confirmToggleStatus}
                title="تغيير حالة حساب المدير / الموظف"
                message={`هل أنت متأكد من رغبتك في تغيير حالة حساب "${confirmStatusTarget?.name}"؟`}
                confirmText="تأكيد تغيير الحالة"
                cancelText="إلغاء"
                type="warning"
            />
        </AuthenticatedLayout>
    );
}
