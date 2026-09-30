import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Modal from '../../../Components/Modal';
import { 
    Settings, 
    Lock, 
    CreditCard, 
    Mail, 
    MessageSquare, 
    ShieldCheck, 
    Save, 
    Send, 
    Eye, 
    EyeOff, 
    DollarSign, 
    Percent, 
    Clock, 
    Key, 
    Server, 
    CheckCircle2, 
    AlertTriangle,
    Zap,
    Printer,
    FileText,
    Wrench,
    Megaphone,
    Bell
} from 'lucide-react';
import Select2 from '../../../Components/Select2';

export default function AdminSettings({ settings, currentGroup, groups }) {
    const initialSettings = settings.reduce((acc, s) => {
        acc[s.key] = s.value || '';
        return acc;
    }, {});

    const { data, setData, post, processing } = useForm({
        settings: initialSettings,
        group: currentGroup,
    });

    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    const togglePasswordVisibility = (key) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleTabChange = (groupKey) => {
        router.get(route('admin.settings.index'), { group: groupKey }, { preserveState: false });
    };

    const handleSettingChange = (key, value) => {
        setData('settings', {
            ...data.settings,
            [key]: value,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    const handleSendTestEmail = (e) => {
        e.preventDefault();
        if (!testEmail) return;
        setSendingTest(true);
        router.post(route('admin.settings.test-email'), {
            test_email: testEmail,
        }, {
            onFinish: () => {
                setSendingTest(false);
                setTestEmailModalOpen(false);
            }
        });
    };

    const getGroupIcon = (groupKey) => {
        switch (groupKey) {
            case 'hyperpay': return CreditCard;
            case 'mail': return Mail;
            case 'financial': return DollarSign;
            case 'sms': return MessageSquare;
            case 'security': return ShieldCheck;
            case 'pdf_branding': return Printer;
            case 'maintenance': return Wrench;
            default: return Settings;
        }
    };

    const currentGroupObj = groups.find(g => g.key === currentGroup) || groups[0];

    return (
        <AuthenticatedLayout title="إعدادات النظام المشفرة">
            <Head title="إعدادات النظام وبوابات الربط - إدارة المنصة" />

            <div className="space-y-6 pb-12 max-w-5xl mx-auto">
                {/* Unified Header */}
                <AdminPageHeader
                    title="إدارة الإعدادات المشفرة وبوابات الربط"
                    subtitle="ضبط المفاتيح الحساسة، بوابات الدفع HyperPay، خادم SMTP، والقواعد المالية المشفرة في قاعدة البيانات"
                    breadcrumbs={[
                        { label: 'الرئيسية', url: route('admin.dashboard') },
                        { label: 'إعدادات النظام' }
                    ]}
                    icon={Settings}
                    iconColor="text-violet-400"
                    actions={
                        currentGroup === 'mail' ? [
                            {
                                label: 'إرسال بريد تجريبي لفحص SMTP',
                                icon: Send,
                                onClick: () => setTestEmailModalOpen(true),
                                variant: 'primary',
                            }
                        ] : []
                    }
                    badge={{ text: 'تشفير AES-256', color: 'brand' }}
                />

                {/* Tabs Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
                    {groups.map((g) => {
                        const IconComp = getGroupIcon(g.key);
                        const isActive = currentGroup === g.key;
                        return (
                            <button
                                key={g.key}
                                type="button"
                                onClick={() => handleTabChange(g.key)}
                                className={`px-4 py-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                                }`}
                            >
                                <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span className="text-center">{g.label_ar}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Settings Card */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                    {/* Active Tab Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                {React.createElement(getGroupIcon(currentGroup), { className: 'w-5 h-5' })}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm sm:text-base">
                                    {currentGroupObj?.label_ar}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {currentGroupObj?.desc}
                                </p>
                            </div>
                        </div>

                        {currentGroup === 'mail' && (
                            <button
                                type="button"
                                onClick={() => setTestEmailModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>فحص الإرسال الآن</span>
                            </button>
                        )}
                    </div>

                    {/* HyperPay Environment Notice */}
                    {currentGroup === 'hyperpay' && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-300 space-y-1">
                                <span className="font-bold block">تنبيه بوابات الدفع HyperPay:</span>
                                <p className="leading-relaxed">
                                    يتم استخدام رموز التفويض (Access Tokens) ومعرفات الكيانات (Entity IDs) لإنشاء جلسات دفع مشفرة Checkout IDs لبطاقات مدى وفيزا وماستركارد وأبل باي. تأكد من تحديد بيئة العمل (Test / Live) بدقة لتجنب إخفاق العمليات.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Under Development Banner Notice */}
                    {currentGroup === 'maintenance' && (
                        <div className="p-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-start gap-3">
                            <Wrench className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-violet-200 space-y-1">
                                <span className="font-bold block text-white">إشعار شريط المنصة قيد التطوير:</span>
                                <p className="leading-relaxed text-slate-300">
                                    عند تفعيل هذا الخيار، سيظهر شريط تنبيه متحرك احترافي مثبت في أسفل المنصة على مدار الساعة في كافة الصفحات (صفحة الهبوط، تسجيل الدخول، لوحة التحكم، وبوابات المستثمرين والشركات). يتيح لك إبلاغ الزوار والمستخدمين بمرحلة التطوير مع تحديث فوري للنص في أي وقت.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {settings.map((s) => {
                                const isPassword = s.is_encrypted && !visiblePasswords[s.key];
                                const isSelectField = s.key === 'hyperpay_mode' || 
                                    s.key === 'require_kyc_verification' || 
                                    s.key === 'enable_two_factor_auth' || 
                                    s.key === 'sms_provider' || 
                                    s.key === 'mail_encryption' ||
                                    s.key === 'is_under_development' ||
                                    s.key === 'under_development_speed';
                                const isTextareaField = s.key === 'under_development_text' || s.key === 'pdf_footer_legal_text';

                                return (
                                    <div 
                                        key={s.id} 
                                        className={`p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2 transition-all hover:border-slate-700 ${
                                            s.key.includes('token') || s.key.includes('url') || s.key.includes('host') || s.key.includes('password') || s.key === 'under_development_text' || s.key === 'pdf_footer_legal_text'
                                                ? 'md:col-span-2'
                                                : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                                                <span>{s.label || s.key}</span>
                                            </label>
                                            <div className="flex items-center gap-2">
                                                {s.is_encrypted && (
                                                    <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 flex items-center gap-1 font-mono">
                                                        <Lock className="w-2.5 h-2.5" /> AES-256
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-500 font-mono">
                                                    {s.key}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            {isSelectField ? (
                                                (() => {
                                                    let optionsList = [];
                                                    if (s.key === 'hyperpay_mode') {
                                                        optionsList = [
                                                            { value: 'test', label: 'تجريبي (Test Sandbox)', description: 'بيئة اختبارية لا تسحب أموالاً حقيقية' },
                                                            { value: 'live', label: 'إنتاجي حقيقي (Live Production)', description: 'البيئة التشغيلية الحقيقية' },
                                                        ];
                                                    } else if (s.key === 'require_kyc_verification') {
                                                        optionsList = [
                                                            { value: 'yes', label: 'نعم، إلزامي لجميع الحسابات', description: 'يمنع الاستثمار والتمويل قبل رفع الوثائق' },
                                                            { value: 'no', label: 'لا، اختياري', description: 'السماح بالوصول دون تحقق إلزامي' },
                                                        ];
                                                    } else if (s.key === 'enable_two_factor_auth') {
                                                        optionsList = [
                                                            { value: 'optional', label: 'اختياري حسب رغبة المستخدم', description: 'يمكن للمستخدم تفعيله أو تركه' },
                                                            { value: 'forced', label: 'إلزامي لجميع المشرفين والمستثمرين', description: 'فرض التحقق الثنائي بكود OTP' },
                                                        ];
                                                    } else if (s.key === 'sms_provider') {
                                                        optionsList = [
                                                            { value: 'unifonic', label: 'Unifonic (يونيفونيك)', description: 'بوابة الرسائل السعودية المعتمدة' },
                                                            { value: 'twilio', label: 'Twilio', description: 'البوابة العالمية Twilio SMS' },
                                                            { value: 'taqnyat', label: 'تقنيات (Taqnyat)', description: 'بوابة تقنيات للرسائل القصيرة' },
                                                        ];
                                                    } else if (s.key === 'mail_encryption') {
                                                        optionsList = [
                                                            { value: 'tls', label: 'TLS (المنفذ 587)', description: 'تشفير النقل الموصى به' },
                                                            { value: 'ssl', label: 'SSL (المنفذ 465)', description: 'تشفير SSL المباشر' },
                                                            { value: 'null', label: 'بدون تشفير', description: 'اتصال غير مشفر' },
                                                        ];
                                                    } else if (s.key === 'is_under_development') {
                                                        optionsList = [
                                                            { value: 'no', label: 'معطل (وضع التشغيل الطبيعي)', description: 'إخفاء شريط التنبيه وتعمل المنصة بالشكل المعتاد' },
                                                            { value: 'yes', label: 'مفعل (إظهار شريط المنصة قيد التطوير)', description: 'تثبيت الشريط المتحرك إجبارياً أسفل كافة الصفحات' },
                                                        ];
                                                    } else if (s.key === 'under_development_speed') {
                                                        optionsList = [
                                                            { value: 'slow', label: 'حركة بطيئة وهادئة (Slow)', description: 'دوران هادئ ومريح للعين' },
                                                            { value: 'normal', label: 'حركة معتدلة وسلسة (Normal - مستحسن)', description: 'السرعة القياسية لسهولة قراءة الإعلان' },
                                                            { value: 'fast', label: 'حركة سريعة (Fast)', description: 'تمرير سريع للتنبيهات العاجلة' },
                                                        ];
                                                    }

                                                    return (
                                                        <Select2
                                                            value={data.settings[s.key] !== undefined ? data.settings[s.key] : (s.value || '')}
                                                            onChange={(val) => handleSettingChange(s.key, val)}
                                                            options={optionsList}
                                                            placeholder={`اختر ${s.label || s.key}...`}
                                                            searchPlaceholder="ابحث في الخيارات..."
                                                        />
                                                    );
                                                })()
                                            ) : isTextareaField ? (
                                                <textarea
                                                    rows={3}
                                                    value={data.settings[s.key] !== undefined ? data.settings[s.key] : (s.value || '')}
                                                    onChange={(e) => handleSettingChange(s.key, e.target.value)}
                                                    placeholder={s.label || s.key}
                                                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-sans leading-relaxed"
                                                />
                                            ) : (
                                                <div className="relative">
                                                    <input
                                                        type={isPassword ? 'password' : 'text'}
                                                        value={data.settings[s.key] !== undefined ? data.settings[s.key] : (s.value || '')}
                                                        onChange={(e) => handleSettingChange(s.key, e.target.value)}
                                                        placeholder={s.label || s.key}
                                                        className={`w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono ${
                                                            s.is_encrypted ? 'pl-10' : ''
                                                        }`}
                                                    />
                                                    {s.is_encrypted && (
                                                        <button
                                                            type="button"
                                                            onClick={() => togglePasswordVisibility(s.key)}
                                                            className="absolute left-3 top-2.5 text-slate-400 hover:text-white transition-colors"
                                                            title={visiblePasswords[s.key] ? 'إخفاء' : 'إظهار'}
                                                        >
                                                            {visiblePasswords[s.key] ? (
                                                                <EyeOff className="w-4 h-4" />
                                                            ) : (
                                                                <Eye className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {s.description && (
                                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                                {s.description}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Lock className="w-4 h-4 text-orange-500" />
                                <span>يتم حفظ جميع التغييرات بصيغة مشفرة ويسجل الحدث في سجل التدقيق.</span>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-8 py-3 bg-[#6320EE] hover:bg-[#5217D4] text-white font-bold text-xs rounded-xl shadow-md shadow-violet-600/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>حفظ وتطبيق الإعدادات</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Test Email Modal */}
            <Modal
                isOpen={testEmailModalOpen}
                onClose={() => setTestEmailModalOpen(false)}
                title="إرسال بريد تجريبي لفحص خادم SMTP"
                maxWidth="md"
            >
                <form onSubmit={handleSendTestEmail} className="space-y-4">
                    <p className="text-xs text-slate-300 leading-relaxed">
                        سيقوم النظام بإرسال رسالة بريد إلكتروني تجريبية فورية باستخدام بيانات خادم SMTP المضبوطة حالياً للتأكد من صحة الاتصال وسلامة المنفذ وبيانات الاعتماد.
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                            البريد الإلكتروني المستلم (Recipient Email)
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setTestEmailModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={sendingTest || !testEmail}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {sendingTest ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>إرسال بريد الفحص</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
