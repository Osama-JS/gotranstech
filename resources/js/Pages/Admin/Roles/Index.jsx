import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
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
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
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
        users: t('admin.roles.cat_users'),
        logistics: t('admin.roles.cat_logistics'),
        finance: t('admin.roles.cat_finance'),
        system: t('admin.roles.cat_system'),
        general: t('admin.roles.cat_general')
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
        <AuthenticatedLayout title={t('admin.roles.page_title')}>
            <Head title={t('admin.roles.page_title')} />

            <div className="space-y-6 pb-12">
                {/* Header */}
                <AdminPageHeader
                    title={t('admin.roles.header_title')}
                    subtitle={t('admin.roles.header_subtitle')}
                    breadcrumbs={[
                        { label: t('common.home'), url: route('admin.dashboard') },
                        { label: t('admin.nav.roles') }
                    ]}
                    icon={ShieldCheck}
                    iconColor="text-purple-400"
                    actions={[
                        {
                            label: t('admin.roles.btn_create_role'),
                            icon: PlusCircle,
                            onClick: () => setCreateModalOpen(true),
                            variant: 'primary',
                        }
                    ]}
                    badge={{ text: t('admin.roles.badge_roles_count', { count: stats?.total_roles || roles.length }), color: 'purple' }}
                />

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard
                        title={t('admin.roles.stat_total_roles')}
                        value={stats?.total_roles || roles.length}
                        icon={ShieldCheck}
                        color="purple"
                        description={t('admin.roles.stat_roles_desc')}
                    />
                    <StatCard
                        title={t('admin.roles.stat_permissions_total')}
                        value={stats?.total_permissions || permissions.length}
                        icon={Key}
                        color="blue"
                        description={t('admin.roles.stat_permissions_desc')}
                    />
                    <StatCard
                        title={t('admin.roles.stat_custom_roles')}
                        value={stats?.custom_roles || 0}
                        icon={Layers}
                        color="brand"
                        description={t('admin.roles.stat_custom_roles_desc')}
                    />
                </div>

                {/* Roles Table */}
                <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                                <tr>
                                    <th className="p-4">{t('admin.roles.table_role_name')}</th>
                                    <th className="p-4">{t('admin.roles.table_role_type')}</th>
                                    <th className="p-4">{t('admin.roles.table_assigned_users')}</th>
                                    <th className="p-4">{t('admin.roles.table_granted_permissions')}</th>
                                    <th className="p-4">{t('admin.roles.table_created_at')}</th>
                                    <th className="p-4 text-center">{t('admin.roles.table_actions')}</th>
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
                                                        <Lock className="w-3 h-3" /> {t('admin.roles.badge_core_system')}
                                                    </span>
                                                ) : (
                                                    <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-1 rounded-lg text-[11px] font-bold">
                                                        {t('admin.roles.badge_custom_role')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-slate-300">
                                                    {t('admin.roles.users_count', { count: role.users_count || 0 })}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-lg font-mono font-bold text-xs">
                                                    {t('admin.roles.permissions_count', { count: role.permissions?.length || 0 })}
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
                                                        <span>{t('admin.roles.btn_edit_permissions')}</span>
                                                    </button>
                                                    {!isSys && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDelete(role)}
                                                            disabled={role.users_count > 0}
                                                            className="p-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 transition-all text-xs disabled:opacity-30 cursor-pointer"
                                                            title={role.users_count > 0 ? t('admin.roles.cant_delete_with_users') : t('admin.roles.btn_delete_role')}
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
                title={t('admin.roles.modal_create_title')}
                maxWidth="3xl"
            >
                <form onSubmit={submitCreate} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            {t('admin.roles.field_role_name_en')}
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
                            {t('admin.roles.permissions_available')}
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
                                            <span>{allSelected ? t('admin.roles.btn_deselect_all') : t('admin.roles.btn_select_all')}</span>
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
                            {t('common.cancel')}
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
                                    <span>{t('admin.roles.btn_submit_create')}</span>
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
                title={t('admin.roles.modal_edit_title', { name: selectedRole?.name })}
                maxWidth="3xl"
            >
                <form onSubmit={submitEdit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            {t('admin.roles.field_role_name')}
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
                            <p className="text-[11px] text-slate-500 mt-1">{t('admin.roles.core_role_notice')}</p>
                        )}
                        {editErrors.name && <p className="text-xs text-rose-400 mt-1">{editErrors.name}</p>}
                    </div>

                    {/* Permissions Matrix */}
                    <div className="space-y-4">
                        <label className="block text-xs font-bold text-slate-200">
                            {t('admin.roles.permissions_granted')}
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
                                            <span>{allSelected ? t('admin.roles.btn_deselect_all') : t('admin.roles.btn_select_all')}</span>
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
                            {t('common.cancel')}
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
                                    <span>{t('admin.roles.btn_submit_edit')}</span>
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
                title={t('admin.roles.delete_dialog_title')}
                message={t('admin.roles.delete_dialog_msg', { name: selectedRole?.name })}
                confirmText={t('admin.roles.delete_dialog_confirm')}
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
