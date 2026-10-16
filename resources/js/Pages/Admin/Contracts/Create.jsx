import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { useTranslation } from '../../../Utils/i18n';
import SearchableSelect from '../../../Components/SearchableSelect';
import DatePicker from '../../../Components/DatePicker';
import RichTextEditor from '../../../Components/RichTextEditor';
import { FileText, ArrowRight, ShieldCheck, PlusCircle, Save, ArrowLeft } from 'lucide-react';

export default function AdminContractsCreate({ users = [] }) {
    const { t, locale } = useTranslation();
    const isAr = locale === 'ar';
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        contract_type: 'investment_agreement',
        title: t('admin.contracts.default_contract_title'),
        terms_text: t('admin.contracts.terms_default_text'),
        commission_rate: '70.00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.contracts.store'));
    };

    const userOptions = [
        { value: '', label: t('admin.contracts.opt_select_party_ph') },
        ...users.map(u => ({
            value: u.id,
            label: `${u.name} (${u.user_type === 'company' ? t('admin.contracts.party_company') : t('admin.contracts.party_investor')}) - ${u.email}`
        }))
    ];

    return (
        <AuthenticatedLayout>
            <Head title={t('admin.contracts.create_title')} />

            <div className="space-y-6 pb-12 max-w-4xl mx-auto">
                {/* Unified Header */}
                <AdminPageHeader
                    title={t('admin.contracts.create_title')}
                    subtitle={t('admin.contracts.create_subtitle')}
                    breadcrumbs={[
                        { label: t('common.home'), url: route('admin.dashboard') },
                        { label: t('admin.nav.items.contracts'), url: route('admin.contracts.index') },
                        { label: t('admin.contracts.btn_create_contract') }
                    ]}
                    icon={FileText}
                    iconColor="text-violet-400"
                    badge={{ text: t('admin.contracts.badge_electronic_verify'), color: 'brand' }}
                />

                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <form onSubmit={submit} className="space-y-5">
                        {/* Select User */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                {t('admin.contracts.label_second_party')}
                            </label>
                            <SearchableSelect
                                options={userOptions}
                                value={data.user_id}
                                onChange={(val) => setData('user_id', val)}
                                placeholder={t('admin.contracts.opt_select_party_ph')}
                            />
                            {errors.user_id && <p className="text-xs text-rose-500 mt-1">{errors.user_id}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                {t('admin.contracts.label_contract_title')}
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                required
                            />
                            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
                        </div>

                        {/* Commission rate & Contract Type */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('admin.contracts.label_agreement_type')}
                                </label>
                                <select
                                    value={data.contract_type}
                                    onChange={(e) => setData('contract_type', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                >
                                    <option value="investment_agreement">{t('admin.contracts.opt_type_investment')}</option>
                                    <option value="logistics_service">{t('admin.contracts.opt_type_logistics')}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    {t('admin.contracts.label_agreed_commission')}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={data.commission_rate}
                                    onChange={(e) => setData('commission_rate', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                    required
                                />
                                {errors.commission_rate && <p className="text-xs text-rose-500 mt-1">{errors.commission_rate}</p>}
                            </div>
                        </div>

                        {/* Terms & Conditions Rich Text Editor */}
                        <div>
                            <RichTextEditor
                                label={t('admin.contracts.label_terms_and_conditions')}
                                value={data.terms_text}
                                onChange={(val) => setData('terms_text', val)}
                                error={errors.terms_text}
                                placeholder={t('admin.contracts.ph_terms_and_conditions')}
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DatePicker
                                label={t('admin.contracts.label_start_date')}
                                value={data.start_date}
                                onChange={(val) => setData('start_date', val)}
                                error={errors.start_date}
                                placeholder={t('admin.contracts.ph_start_date')}
                            />

                            <DatePicker
                                label={t('admin.contracts.label_end_date')}
                                value={data.end_date}
                                onChange={(val) => setData('end_date', val)}
                                error={errors.end_date}
                                placeholder={t('admin.contracts.ph_end_date')}
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                            <Link
                                href={route('admin.contracts.index')}
                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                            >
                                {t('common.cancel')}
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{t('admin.contracts.btn_create_submit')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
