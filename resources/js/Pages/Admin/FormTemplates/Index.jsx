import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import Modal from '../../../Components/Modal';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import Badge from '../../../Components/Badge';
import {
    FileSpreadsheet,
    PlusCircle,
    Edit3,
    Trash2,
    CheckCircle2,
    Users,
    Building2,
    Layers,
    ListPlus,
    X,
    GripVertical,
    HelpCircle,
    Sparkles,
} from 'lucide-react';

export default function AdminFormTemplates({ templates = [] }) {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [confirmDeleteTarget, setConfirmDeleteTarget] = useState(null);

    // Create / Edit Form
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        description: '',
        applies_to: 'investor',
        is_active: true,
        fields: [
            { name: '', label: '', type: 'text', placeholder: '', is_required: false, options: [] },
        ],
    });

    const handleOpenCreate = () => {
        reset();
        setData({
            name: '',
            description: '',
            applies_to: 'investor',
            is_active: true,
            fields: [
                { name: 'national_id_copy', label: t('admin.form_templates.sample_field_id'), type: 'file', placeholder: t('admin.form_templates.sample_ph_id'), is_required: true, options: [] },
                { name: 'investment_experience', label: t('admin.form_templates.sample_field_exp'), type: 'select', placeholder: t('admin.form_templates.sample_ph_exp'), is_required: false, options: [t('admin.form_templates.exp_beginner'), t('admin.form_templates.exp_intermediate'), t('admin.form_templates.exp_expert')] },
            ],
        });
        setCreateModalOpen(true);
    };

    const handleOpenEdit = (tpl) => {
        setSelectedTemplate(tpl);
        setData({
            name: tpl.name,
            description: tpl.description || '',
            applies_to: tpl.applies_to,
            is_active: tpl.is_active,
            fields: tpl.fields?.map((f) => ({
                id: f.id,
                name: f.name,
                label: f.label,
                type: f.type,
                placeholder: f.placeholder || '',
                is_required: f.is_required,
                options: f.options || [],
            })) || [],
        });
        setEditModalOpen(true);
    };

    const handleAddField = () => {
        setData('fields', [
            ...data.fields,
            { name: '', label: '', type: 'text', placeholder: '', is_required: false, options: [] },
        ]);
    };

    const handleRemoveField = (index) => {
        const updated = [...data.fields];
        updated.splice(index, 1);
        setData('fields', updated);
    };

    const handleFieldChange = (index, key, val) => {
        const updated = [...data.fields];
        updated[index][key] = val;
        setData('fields', updated);
    };

    const handleOptionsChange = (index, rawStr) => {
        const opts = rawStr
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean);
        handleFieldChange(index, 'options', opts);
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('admin.form-templates.store'), {
            onSuccess: () => {
                setCreateModalOpen(false);
                reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!selectedTemplate) return;
        put(route('admin.form-templates.update', selectedTemplate.id), {
            onSuccess: () => {
                setEditModalOpen(false);
                setSelectedTemplate(null);
            },
        });
    };

    const confirmDelete = () => {
        if (confirmDeleteTarget) {
            router.delete(route('admin.form-templates.destroy', confirmDeleteTarget.id), {
                onSuccess: () => setConfirmDeleteTarget(null),
                onFinish: () => setConfirmDeleteTarget(null),
            });
        }
    };

    const fieldTypes = [
        { value: 'text', label: t('admin.form_templates.type_text') },
        { value: 'number', label: t('admin.form_templates.type_number') },
        { value: 'select', label: t('admin.form_templates.type_select') },
        { value: 'date', label: t('admin.form_templates.type_date') },
        { value: 'textarea', label: t('admin.form_templates.type_textarea') },
        { value: 'checkbox', label: t('admin.form_templates.type_checkbox') },
        { value: 'file', label: t('admin.form_templates.type_file') },
    ];

    return (
        <AuthenticatedLayout title={t('admin.form_templates.page_title')}>
            <Head title={t('admin.form_templates.page_title')} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <AdminPageHeader
                        title={t('admin.form_templates.header_title')}
                        description={t('admin.form_templates.header_subtitle')}
                        icon={FileSpreadsheet}
                        badge={t('admin.form_templates.badge_registered_count', { count: templates.length })}
                    />

                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="px-4 py-2.5 rounded-xl bg-[#6320EE] hover:bg-[#5217D4] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-violet-600/30 transition-all self-start sm:self-center"
                    >
                        <PlusCircle className="w-4 h-4" />
                        <span>{t('admin.form_templates.btn_create_new')}</span>
                    </button>
                </div>

                {/* Templates Grid */}
                {templates.length === 0 ? (
                    <div className="glass-panel p-12 text-center rounded-3xl border border-slate-800">
                        <FileSpreadsheet className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <h3 className="text-base font-bold text-white mb-1">{t('admin.form_templates.empty_templates_title')}</h3>
                        <p className="text-xs text-slate-400 mb-6">
                            {t('admin.form_templates.empty_templates_desc')}
                        </p>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="px-5 py-2.5 rounded-xl bg-[#6320EE] hover:bg-violet-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
                        >
                            <PlusCircle className="w-4 h-4" />
                            <span>{t('admin.form_templates.btn_create_first')}</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((tpl) => (
                            <div
                                key={tpl.id}
                                className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group hover:border-slate-700 transition-all"
                            >
                                <div>
                                    {/* Top badges */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span
                                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                                                tpl.applies_to === 'company'
                                                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                    : tpl.applies_to === 'investor'
                                                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                                                    : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}
                                        >
                                            {tpl.applies_to === 'company'
                                                ? t('admin.form_templates.target_company')
                                                : tpl.applies_to === 'investor'
                                                ? t('admin.form_templates.target_investor')
                                                : t('admin.form_templates.target_all')}
                                        </span>

                                        <span
                                            className={`w-2.5 h-2.5 rounded-full ${
                                                tpl.is_active ? 'bg-[#6320EE] shadow-sm shadow-violet-500/50' : 'bg-slate-600'
                                            }`}
                                        />
                                    </div>

                                    <h3 className="text-base font-bold text-white mb-1.5">{tpl.name}</h3>
                                    <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                                        {tpl.description || t('admin.form_templates.no_desc')}
                                    </p>

                                    {/* Fields count & pill tags */}
                                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 mb-4">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">{t('admin.form_templates.defined_fields')}</span>
                                            <span className="font-bold font-mono text-violet-400">
                                                {t('admin.form_templates.fields_count', { count: tpl.fields?.length || 0 })}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400">{t('admin.form_templates.assigned_users')}</span>
                                            <span className="font-bold font-mono text-blue-400">
                                                {t('admin.form_templates.users_count', { count: tpl.users_count || 0 })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Preview of fields */}
                                    <div className="space-y-1 mb-4">
                                        <span className="text-[11px] font-bold text-slate-400 block mb-1">{t('admin.form_templates.sample_fields')}</span>
                                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-scrollbar">
                                            {tpl.fields?.map((f, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700"
                                                >
                                                    {f.label} ({f.type})
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(tpl)}
                                        className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                                        <span>{t('admin.form_templates.btn_edit_template')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setConfirmDeleteTarget(tpl)}
                                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                                        title={t('admin.form_templates.btn_delete_template')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create / Edit Modal */}
                <Modal
                    isOpen={createModalOpen || editModalOpen}
                    onClose={() => {
                        setCreateModalOpen(false);
                        setEditModalOpen(false);
                    }}
                    title={createModalOpen ? t('admin.form_templates.modal_create_title') : t('admin.form_templates.modal_edit_title')}
                    maxWidth="max-w-4xl"
                >
                    <form onSubmit={createModalOpen ? submitCreate : submitEdit} className="space-y-6">
                        {/* Basic Template Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.form_templates.field_tpl_name')}</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder={t('admin.form_templates.ph_tpl_name')}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.form_templates.field_target')}</label>
                                <select
                                    value={data.applies_to}
                                    onChange={(e) => setData('applies_to', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
                                >
                                    <option value="investor">{t('admin.form_templates.opt_investors')}</option>
                                    <option value="company">{t('admin.form_templates.opt_companies')}</option>
                                    <option value="all">{t('admin.form_templates.opt_all')}</option>
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">{t('admin.form_templates.field_desc')}</label>
                                <textarea
                                    rows={2}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder={t('admin.form_templates.ph_desc')}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-violet-500"
                                />
                            </div>
                        </div>

                        {/* Fields Builder Section */}
                        <div className="space-y-4 pt-4 border-t border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-violet-400" />
                                        <span>{t('admin.form_templates.section_dynamic_fields')}</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        {t('admin.form_templates.section_dynamic_fields_desc')}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddField}
                                    className="px-3.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-[#5217D4]/20 text-violet-400 border border-violet-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                                >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>{t('admin.form_templates.btn_add_field')}</span>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                                {data.fields.map((field, idx) => (
                                    <div
                                        key={idx}
                                        className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative space-y-3"
                                    >
                                        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-300">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-5 h-5 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center font-mono text-[10px]">
                                                    {idx + 1}
                                                </span>
                                                <span>{t('admin.form_templates.field_settings')}</span>
                                            </span>

                                            {data.fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveField(idx)}
                                                    className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>{t('admin.form_templates.btn_delete_field')}</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">{t('admin.form_templates.field_key')}</label>
                                                <input
                                                    type="text"
                                                    value={field.name}
                                                    onChange={(e) => handleFieldChange(idx, 'name', e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                                                    placeholder="commercial_register"
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-violet-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">{t('admin.form_templates.field_label')}</label>
                                                <input
                                                    type="text"
                                                    value={field.label}
                                                    onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                                                    placeholder={t('admin.form_templates.ph_field_label')}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">{t('admin.form_templates.field_type')}</label>
                                                <select
                                                    value={field.type}
                                                    onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                                                >
                                                    {fieldTypes.map((t) => (
                                                        <option key={t.value} value={t.value}>
                                                            {t.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] text-slate-400 mb-1">{t('admin.form_templates.field_ph')}</label>
                                                <input
                                                    type="text"
                                                    value={field.placeholder}
                                                    onChange={(e) => handleFieldChange(idx, 'placeholder', e.target.value)}
                                                    placeholder={t('admin.form_templates.ph_field_ph')}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                                                />
                                            </div>

                                            {/* Select Options helper */}
                                            {field.type === 'select' && (
                                                <div className="sm:col-span-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                                                    <label className="block text-[11px] text-slate-300 font-bold mb-1">
                                                        {t('admin.form_templates.field_options')}
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        value={Array.isArray(field.options) ? field.options.join('\n') : ''}
                                                        onChange={(e) => handleOptionsChange(idx, e.target.value)}
                                                        placeholder={t('admin.form_templates.options_ph')}
                                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-white"
                                                    />
                                                </div>
                                            )}

                                            <div className="sm:col-span-4 flex items-center gap-2 pt-1">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={field.is_required}
                                                        onChange={(e) => handleFieldChange(idx, 'is_required', e.target.checked)}
                                                        className="w-4 h-4 rounded border-slate-700 text-violet-500 focus:ring-violet-500 bg-slate-950"
                                                    />
                                                    <span className="text-xs text-slate-300">{t('admin.form_templates.chk_required')}</span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setCreateModalOpen(false);
                                    setEditModalOpen(false);
                                }}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? t('admin.form_templates.saving_in_progress') : createModalOpen ? t('admin.form_templates.btn_save_template') : t('admin.form_templates.btn_update_template')}
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Delete Confirmation Modal */}
                <ConfirmDialog
                    isOpen={!!confirmDeleteTarget}
                    onClose={() => setConfirmDeleteTarget(null)}
                    onConfirm={confirmDelete}
                    title={t('admin.form_templates.delete_dialog_title')}
                    message={t('admin.form_templates.delete_dialog_msg', { name: confirmDeleteTarget?.name })}
                    confirmText={t('admin.form_templates.delete_dialog_confirm')}
                    cancelText={t('common.cancel')}
                    type="danger"
                />
            </div>
        </AuthenticatedLayout>
    );
}
