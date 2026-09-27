import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import SearchableSelect from '../../../Components/SearchableSelect';
import DatePicker from '../../../Components/DatePicker';
import RichTextEditor from '../../../Components/RichTextEditor';
import { FileText, ArrowRight, ShieldCheck, PlusCircle, Save, ArrowLeft } from 'lucide-react';

export default function AdminContractsCreate({ users = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        user_id: '',
        contract_type: 'investment_agreement',
        title: 'عقد اتفاقية استثمار وتمويل مهام لوجستية',
        terms_text: '<p>تم الاتفاق والتراضي بين منصة <strong>GoTransTech</strong> (الطرف الأول) والطرف الثاني الموضح بياناته على تنظيم عمليات التمويل والخدمات اللوجستية وتوزيع نسب العمولات والأرباح وفق القوانين والأنظمة المعمول بها في المملكة العربية السعودية.</p><blockquote style="border-right: 4px solid #6320EE; background-color: #f5f3ff; color: #3b0764; padding: 10px 14px; margin: 12px 0;"><strong>التزام الطرفين:</strong> يلتزم الطرفان بكافة اللوائح والأنظمة الصادرة عن الهيئة العامة للنقل والجهات المختصة.</blockquote>',
        commission_rate: '70.00',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.contracts.store'));
    };

    const userOptions = [
        { value: '', label: 'اختر المستخدم أو الشركة...' },
        ...users.map(u => ({
            value: u.id,
            label: `${u.name} (${u.user_type === 'company' ? 'شركة لوجستية' : 'مستثمر'}) - ${u.email}`
        }))
    ];

    return (
        <AuthenticatedLayout>
            <Head title="إنشاء عقد جديد - إدارة المنصة" />

            <div className="space-y-6 pb-12 max-w-4xl mx-auto">
                {/* Unified Header */}
                <AdminPageHeader
                    title="إنشاء وتوثيق عقد جديد"
                    subtitle="إصدار عقد إلكتروني وتحديد بنود وشروط الاتفاقية ونسب الأرباح والعمولات"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'العقود والاتفاقيات', url: route('admin.contracts.index') },
                        { label: 'إنشاء عقد' }
                    ]}
                    icon={FileText}
                    iconColor="text-violet-400"
                    badge={{ text: 'توثيق إلكتروني', color: 'brand' }}
                />

                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <form onSubmit={submit} className="space-y-5">
                        {/* Select User */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                الطرف الثاني (المستثمر أو الشركة اللوجستية) *
                            </label>
                            <SearchableSelect
                                options={userOptions}
                                value={data.user_id}
                                onChange={(val) => setData('user_id', val)}
                                placeholder="اختر المستخدم أو الشركة..."
                            />
                            {errors.user_id && <p className="text-xs text-rose-500 mt-1">{errors.user_id}</p>}
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                عنوان العقد / الاتفاقية *
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
                                    نوع الاتفاقية *
                                </label>
                                <select
                                    value={data.contract_type}
                                    onChange={(e) => setData('contract_type', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                >
                                    <option value="investment_agreement">اتفاقية استثمار وتمويل مهام (للمستثمرين)</option>
                                    <option value="logistics_service">اتفاقية تقديم وطلب خدمات لوجستية (للشركات)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    نسبة العمولة المتفق عليها (%) *
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
                                label="بنود وشروط العقد والمسؤوليات *"
                                value={data.terms_text}
                                onChange={(val) => setData('terms_text', val)}
                                error={errors.terms_text}
                                placeholder="اكتب بنود الاتفاقية والشروط والالتزامات والمسؤوليات بالتفصيل، يمكنك إضافة جداول وروابط وصور وعناوين فرعية..."
                            />
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <DatePicker
                                label="تاريخ بدء السريان *"
                                value={data.start_date}
                                onChange={(val) => setData('start_date', val)}
                                error={errors.start_date}
                                placeholder="اختر تاريخ البدء..."
                            />

                            <DatePicker
                                label="تاريخ الانتهاء (اختياري)"
                                value={data.end_date}
                                onChange={(val) => setData('end_date', val)}
                                error={errors.end_date}
                                placeholder="اختر تاريخ الانتهاء..."
                            />
                        </div>

                        <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                            <Link
                                href={route('admin.contracts.index')}
                                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                            >
                                إلغاء
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
                                        <span>إنشاء وتوثيق العقد إلكترونياً</span>
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
