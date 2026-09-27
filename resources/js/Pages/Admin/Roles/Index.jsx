import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import StatCard from '../../../Components/StatCard';
import Modal from '../../../Components/Modal';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { 
    ShieldCheck, 
    PlusCircle, 
    Edit, 
    Trash2, 
    Lock, 
    Users, 
    Key, 
    CheckSquare, 
    Square, 
    Layers, 
    Save, 
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function AdminRoles({ roles = [], permissions = [], stats = {} }) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    // Form for Create Role
    const { data: createData, setData: setCreateData, post: postCreate, processing: createProcessing, reset: resetCreate, errors: createErrors } = useForm({
        name: '',
        permissions: [],
    });

    // Form for Edit Role
    const { data: editData, setData: setEditData, put: putEdit, processing: editProcessing, errors: editErrors } = useForm({
        name: '',
        permissions: [],
    });

    const handleOpenEdit = (role) => {
        setSelectedRole(role);
        setEditData({
            name: role.name,
            permissions: role.permissions || [],
        });
        setEditModalOpen(true);
    };

    const handleOpenDelete = (role) => {
        setSelectedRole(role);
        setDeleteConfirmOpen(true);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        postCreate(route('admin.roles.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                resetCreate();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!selectedRole) return;
        putEdit(route('admin.roles.update', selectedRole.id), {
            onSuccess: () => {
                setEditModalOpen(false);
            },
        });
    };

    const confirmDelete = () => {
        if (!selectedRole) return;
        router.delete(route('admin.roles.destroy', selectedRole.id), {
            onFinish: () => setDeleteConfirmOpen(false),
        });
    };

    // Permission Groups
    const groupLabels = {
        users: 'إدارة المستخدمين والحسابات',
        logistics: 'المهام اللوجستية وتتبعها',
        finance: 'العمليات المالية والمحافظ والعقود',
        system: 'إعدادات النظام والتدقيق وCMS',
        general: 'صلاحيات عامة أخرى'
    };

    const groupedPermissions = permissions.reduce((acc, p) => {
        const grp = p.group || 'general';
        if (!acc[grp]) acc[grp] = [];
        acc[grp].push(p);
        return acc;
    }, {});

    const togglePermission = (formType, permName) => {
        if (formType === 'create') {
            const current = [...createData.permissions];
            const idx = current.indexOf(permName);
            if (idx > -1) {
                current.splice(idx, 1);
            } else {
                current.push(permName);
            }
            setCreateData('permissions', current);
        } else {
            const current = [...editData.permissions];
            const idx = current.indexOf(permName);
            if (idx > -1) {
                current.splice(idx, 1);
            } else {
                current.push(permName);
            }
            setEditData('permissions', current);
        }
    };

    const toggleGroupAll = (formType, groupName) => {
        const groupPerms = groupedPermissions[groupName].map(p => p.name);
        const current = formType === 'create' ? [...createData.permissions] : [...editData.permissions];
        const allSelected = groupPerms.every(p => current.includes(p));

        let updated;
        if (allSelected) {
            updated = current.filter(p => !groupPerms.includes(p));
        } else {
            updated = Array.from(new Set([...current, ...groupPerms]));
        }

        if (formType === 'create') {
            setCreateData('permissions', updated);
        } else {
            setEditData('permissions', updated);
        }
    };

    const isSystemRole = (name) => ['admin', 'investor', 'company'].includes(name);

    return (
        <AuthenticatedLayout title="إدارة الأدوار ومصفوفة الصلاحيات">
            <Head title="إدارة الأدوار والصلاحيات - إدارة المنصة" />

            <div className="space-y-6 pb-12">
                {/* Header */}
                <AdminPageHeader
                    title="إدارة الأدوار ومصفوفة الصلاحيات"
                    subtitle="تحديد مستويات الوصول والأذونات للمشرفين والمسؤولين بنظام Spatie RBAC"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'الأدوار والصلاحيات' }
                    ]}
                    icon={ShieldCheck}
                    iconColor="text-purple-400"
                    actions={[
                        {
                            label: 'إضافة دور جديد',
                            icon: PlusCircle,
                            onClick: () => setCreateModalOpen(true),
                            variant: 'primary',
                        }
                    ]}
                    badge={{ text: `${stats?.total_roles || roles.length} دور معرف`, color: 'purple' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title="إجمالي الأدوار"
                        value={stats?.total_roles || roles.length}
                        icon={ShieldCheck}
                        color="purple"
                        description="الأدوار المعرفة في النظام"
                    />
                    <StatCard
                        title="إجمالي الصلاحيات"
                        value={stats?.total_permissions || permissions.length}
                        icon={Key}
                        color="blue"
                        description="صلاحية قابلة للتعيين"
                    />
                    <StatCard
                        title="أدوار مخصصة"
                        value={stats?.custom_roles || 0}
                        icon={Layers}
                        color="brand"
                        description="أنشأتها الإدارة"
                    />
                </div>

                {/* Roles Table */}
                <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">اسم الدور</th>
                                    <th className="p-4">نوع الدور</th>
                                    <th className="p-4">المستخدمين المرتبطين</th>
                                    <th className="p-4">عدد الصلاحيات الممنوحة</th>
                                    <th className="p-4">تاريخ الإنشاء</th>
                                    <th className="p-4 text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {roles.map((role) => {
                                    const isSys = isSystemRole(role.name);
                                    return (
                                        <tr key={role.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold font-mono">
                                                        {role.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-white block text-sm font-mono">{role.name}</span>
                                                        <span className="text-[10px] text-slate-500 font-mono">Guard: {role.guard_name}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                {isSys ? (
                                                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-lg text-[11px] font-bold inline-flex items-center gap-1">
                                                        <Lock className="w-3 h-3" /> دور نظام أساسي
                                                    </span>
                                                ) : (
                                                    <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                                                        دور مخصص
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-slate-300">
                                                    {role.users_count || 0} مستخدم
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                                                    {role.permissions?.length || 0} صلاحية
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                                                {role.created_at || '-'}
                                            </td>
                                            <td className="p-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(role)}
                                                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 border border-slate-700 transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                        <span>تعديل الصلاحيات</span>
                                                    </button>
                                                    {!isSys && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDelete(role)}
                                                            disabled={role.users_count > 0}
                                                            className="p-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 transition-all text-xs disabled:opacity-30 cursor-pointer"
                                                            title={role.users_count > 0 ? "لا يمكن حذف دور به مستخدمين" : "حذف الدور"}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create Role Modal */}
            <Modal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                title="إنشاء دور وتعيين مصفوفة الصلاحيات"
                maxWidth="3xl"
            >
                <form onSubmit={submitCreate} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            اسم الدور باللغة الإنجليزية (مثال: accountant, operations_manager)
                        </label>
                        <input
                            type="text"
                            value={createData.name}
                            onChange={(e) => setCreateData('name', e.target.value)}
                            placeholder="role_name"
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                            required
                        />
                        {createErrors.name && <p className="text-xs text-rose-400 mt-1">{createErrors.name}</p>}
                    </div>

                    {/* Permissions Matrix */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-200">
                            مصفوفة الصلاحيات المتاحة:
                        </label>

                        {Object.entries(groupedPermissions).map(([grp, perms]) => {
                            const groupPermNames = perms.map(p => p.name);
                            const allSelected = groupPermNames.every(p => createData.permissions.includes(p));

                            return (
                                <div key={grp} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                                        <span className="text-xs font-bold text-purple-400">
                                            {groupLabels[grp] || grp} ({perms.length})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroupAll('create', grp)}
                                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                                        >
                                            {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-purple-400" /> : <Square className="w-3.5 h-3.5" />}
                                            <span>{allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل في القسم'}</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {perms.map((p) => {
                                            const isChecked = createData.permissions.includes(p.name);
                                            return (
                                                <label
                                                    key={p.id}
                                                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                                        isChecked
                                                            ? 'bg-purple-500/10 border-purple-500/40 text-white'
                                                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission('create', p.name)}
                                                        className="hidden"
                                                    />
                                                    {isChecked ? (
                                                        <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                                    )}
                                                    <span className="text-[11px] font-mono select-none truncate" title={p.name}>
                                                        {p.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
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
                            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {createProcessing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    <span>إنشاء الدور وحفظ الصلاحيات</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Role Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={`تعديل صلاحيات الدور (${selectedRole?.name})`}
                maxWidth="3xl"
            >
                <form onSubmit={submitEdit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            اسم الدور
                        </label>
                        <input
                            type="text"
                            value={editData.name}
                            onChange={(e) => setEditData('name', e.target.value)}
                            disabled={isSystemRole(selectedRole?.name)}
                            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-500 disabled:opacity-60"
                            required
                        />
                        {isSystemRole(selectedRole?.name) && (
                            <p className="text-[11px] text-slate-500 mt-1">لا يمكن تعديل اسم الأدوار الأساسية للنظام.</p>
                        )}
                        {editErrors.name && <p className="text-xs text-rose-400 mt-1">{editErrors.name}</p>}
                    </div>

                    {/* Permissions Matrix */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-200">
                            مصفوفة الصلاحيات الممنوحة:
                        </label>

                        {Object.entries(groupedPermissions).map(([grp, perms]) => {
                            const groupPermNames = perms.map(p => p.name);
                            const allSelected = groupPermNames.every(p => editData.permissions.includes(p));

                            return (
                                <div key={grp} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                                        <span className="text-xs font-bold text-purple-400">
                                            {groupLabels[grp] || grp} ({perms.length})
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => toggleGroupAll('edit', grp)}
                                            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
                                        >
                                            {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-purple-400" /> : <Square className="w-3.5 h-3.5" />}
                                            <span>{allSelected ? 'إلغاء تحديد الكل' : 'تحديد الكل في القسم'}</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                        {perms.map((p) => {
                                            const isChecked = editData.permissions.includes(p.name);
                                            return (
                                                <label
                                                    key={p.id}
                                                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                                                        isChecked
                                                            ? 'bg-purple-500/10 border-purple-500/40 text-white'
                                                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-900'
                                                    }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => togglePermission('edit', p.name)}
                                                        className="hidden"
                                                    />
                                                    {isChecked ? (
                                                        <CheckSquare className="w-4 h-4 text-purple-400 shrink-0" />
                                                    ) : (
                                                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                                                    )}
                                                    <span className="text-[11px] font-mono select-none truncate" title={p.name}>
                                                        {p.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
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
                            className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            {/* Delete Confirm */}
            <ConfirmDialog
                isOpen={deleteConfirmOpen}
                onClose={() => setDeleteConfirmOpen(false)}
                onConfirm={confirmDelete}
                title="حذف الدور المخصص"
                message={`هل أنت متأكد من رغبتك في حذف الدور (${selectedRole?.name}) نهائياً من النظام؟ لا يمكن التراجع عن هذا الإجراء.`}
                confirmText="تأكيد الحذف"
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
