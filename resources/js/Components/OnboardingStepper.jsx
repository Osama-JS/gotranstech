import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Clock,
    FileText,
    FileSpreadsheet,
    ShieldCheck,
    AlertCircle,
    ChevronDown,
    ArrowLeft,
    Sparkles,
    Lock,
} from 'lucide-react';
import Modal from './Modal';
import DynamicFormRenderer from './DynamicFormRenderer';
import LegalAgreementModal from './LegalAgreementModal';

export default function OnboardingStepper({
    formTemplate = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [agreementModalOpen, setAgreementModalOpen] = useState(false);
    const [dataModalOpen, setDataModalOpen] = useState(false);

    // Agreement Sign Form
    const { post: postAgreement, processing: agreementProcessing, data: agreeData, setData: setAgreeData } = useForm({
        agree_terms: false,
    });

    // Dynamic Data Form
    const { data: dynData, setData: setDynData, post: postDynData, processing: dynProcessing, errors: dynErrors } = useForm({
        form_template_id: formTemplate?.id || user?.form_template_id || '',
        additional_data: user?.additional_data || {},
    });

    const isAgreementSigned = !!user?.agreement_signed_at;
    const isDataSubmitted = !!user?.additional_data && Object.keys(user.additional_data).length > 0;
    const isAccountActive = user?.status === 'active';

    const handleSignAgreement = (e) => {
        e.preventDefault();
        postAgreement(route('portal.agreement.sign'), {
            onSuccess: () => setAgreementModalOpen(false),
        });
    };

    const handleFieldChange = (fieldName, val) => {
        setDynData('additional_data', {
            ...dynData.additional_data,
            [fieldName]: val,
        });
    };

    const handleSubmitData = (e) => {
        e.preventDefault();
        postDynData(route('portal.additional-data.submit'), {
            onSuccess: () => setDataModalOpen(false),
        });
    };

    if (isAccountActive && isAgreementSigned && isDataSubmitted) {
        return null; // All done, normal active dashboard
    }

    return (
        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-white dark:bg-[#0E1338] mb-6 shadow-sm dark:shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>مسار تفعيل الحساب والاعتماد الرسمي</span>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-semibold">
                                {user?.status === 'active' ? 'مفعل' : 'قيد الاستكمال والاعتماد'}
                            </span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            يرجى استكمال الخطوات التالية لفتح كافة ميزات التمويل وسحب الأرصدة والربط البرمجي
                        </p>
                    </div>
                </div>
            </div>

            {/* Stepper Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4">
                {/* Step 1: Registered */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-violet-500/30 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
                                1
                            </span>
                            <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">طلب التسجيل</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">تم استلام طلبك والتحقق من البريد بنجاح</p>
                    </div>
                    <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold mt-3 block">✓ مكتمل</span>
                </div>

                {/* Step 2: Agreement */}
                <div
                    className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border flex flex-col justify-between ${
                        isAgreementSigned
                            ? 'border-violet-500/30'
                            : 'border-amber-500/40 shadow-sm'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span
                                className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                                    isAgreementSigned
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-amber-500 text-slate-950 animate-pulse'
                                }`}
                            >
                                2
                            </span>
                            {isAgreementSigned ? (
                                <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            ) : (
                                <FileText className="w-5 h-5 text-amber-500" />
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">توقيع الاتفاقية والعقد</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isAgreementSigned
                                ? `تم التوقيع في ${new Date(user.agreement_signed_at).toLocaleDateString('ar-SA')}`
                                : 'مطلوب مراجعة وتوقيع اتفاقية الاستخدام'}
                        </p>
                    </div>

                    {isAgreementSigned ? (
                        <div className="mt-3 space-y-1.5">
                            <span className="text-[10px] text-violet-600 dark:text-violet-400 font-bold block">✓ تم التوقيع والاعتماد</span>
                            <button
                                type="button"
                                onClick={() => setAgreementModalOpen(true)}
                                className="w-full py-1.5 px-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                                <FileText className="w-3.5 h-3.5" />
                                <span>عرض وتوسيع وثيقة الاتفاقية</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setAgreementModalOpen(true)}
                            className="mt-3 w-full py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                        >
                            <span>مراجعة وتوقيع الاتفاقية</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Step 3: Additional Data */}
                <div
                    className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border flex flex-col justify-between ${
                        isDataSubmitted
                            ? 'border-violet-500/30'
                            : isAgreementSigned
                            ? 'border-blue-500/40'
                            : 'border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span
                                className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                                    isDataSubmitted
                                        ? 'bg-violet-600 text-white'
                                        : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                }`}
                            >
                                3
                            </span>
                            {isDataSubmitted ? (
                                <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            ) : (
                                <FileSpreadsheet className="w-5 h-5 text-blue-500" />
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">البيانات والوثائق الإضافية</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isDataSubmitted
                                ? 'تم إدخال كافة البيانات المطلوبة'
                                : 'تعبئة نموذج التوثيق والبيانات المخصصة'}
                        </p>
                    </div>

                    {isDataSubmitted ? (
                        <button
                            type="button"
                            onClick={() => setDataModalOpen(true)}
                            className="text-[10px] text-blue-500 hover:underline mt-3 block text-start font-semibold"
                        >
                            تعديل البيانات المدخلة
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={!isAgreementSigned}
                            onClick={() => setDataModalOpen(true)}
                            className="mt-3 w-full py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                            <span>تعبئة النموذج</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Step 4: Final Admin Activation */}
                <div
                    className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border flex flex-col justify-between ${
                        isAccountActive ? 'border-violet-500/30' : 'border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span
                                className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center ${
                                    isAccountActive ? 'bg-violet-600 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                            >
                                4
                            </span>
                            {isAccountActive ? (
                                <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            ) : (
                                <Clock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                            )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">الاعتماد والتفعيل النهائي</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isAccountActive ? 'الحساب مفعّل بالكامل' : 'مراجعة وتأكيد الاعتماد من إدارة المنصة'}
                        </p>
                    </div>

                    <span
                        className={`text-[10px] font-bold mt-3 block ${
                            isAccountActive ? 'text-violet-600 dark:text-violet-400' : 'text-amber-500'
                        }`}
                    >
                        {isAccountActive ? '✓ نشط ومفعل' : '⏳ قيد مراجعة الإدارة'}
                    </span>
                </div>
            </div>

            {/* Professional Legal Agreement Modal */}
            <LegalAgreementModal
                isOpen={agreementModalOpen}
                onClose={() => setAgreementModalOpen(false)}
            />

            {/* Dynamic Data Modal */}
            <Modal
                isOpen={dataModalOpen}
                onClose={() => setDataModalOpen(false)}
                title="تعبئة نموذج البيانات والوثائق الإضافية"
                maxWidth="max-w-2xl"
            >
                <form onSubmit={handleSubmitData} className="space-y-4">
                    <p className="text-xs text-slate-400">
                        يرجى تعبئة الحقول المطلوبة بدقة لتسريع مراجعة وتفعيل حسابك من قبل الإدارة.
                    </p>

                    <DynamicFormRenderer
                        fields={formTemplate?.fields || []}
                        values={dynData.additional_data}
                        onChange={handleFieldChange}
                        errors={dynErrors}
                    />

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setDataModalOpen(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={dynProcessing}
                            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50"
                        >
                            {dynProcessing ? 'جاري الحفظ...' : 'حفظ البيانات الإضافية'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
