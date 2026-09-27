import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import LegalAgreementModal from '@/Components/LegalAgreementModal';
import {
    User,
    Lock,
    Key,
    ShieldCheck,
    Building2,
    Wallet,
    CreditCard,
    FileText,
    Calendar,
    Phone,
    Mail,
    CheckCircle2,
    Eye,
    EyeOff,
    AlertCircle,
    Clock,
    Hash,
    Sparkles,
} from 'lucide-react';

export default function ProfileShow({
    user,
    activeContract,
    recentActivities = [],
    roles = [],
    permissions = [],
}) {
    const [activeTab, setActiveTab] = useState('overview'); // overview, edit, security
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [agreementModalOpen, setAgreementModalOpen] = useState(false);

    // Profile Edit Form
    const {
        data: profileData,
        setData: setProfileData,
        put: putProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        phone_country_code: user.country_code || user.phone_country_code || '+966',
        // Investor fields
        national_id: user.investor_profile?.national_id || '',
        bank_name: user.investor_profile?.bank_name || user.company_profile?.bank_name || '',
        iban: user.investor_profile?.iban || user.company_profile?.iban || '',
        // Company fields
        company_name: user.company_profile?.company_name || '',
        commercial_registration: user.company_profile?.commercial_registration || '',
        tax_number: user.company_profile?.tax_number || '',
    });

    // Password Update Form
    const {
        data: passData,
        setData: setPassData,
        put: putPass,
        processing: passProcessing,
        errors: passErrors,
        reset: resetPass,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        putProfile(route('profile.update'), {
            preserveScroll: true,
            onSuccess: () => setActiveTab('overview'),
        });
    };

    const handlePassSubmit = (e) => {
        e.preventDefault();
        putPass(route('profile.password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPass();
            },
        });
    };

    const getUserTypeTitle = () => {
        if (user.user_type === 'admin') return 'مدير نظام (Admin)';
        if (user.user_type === 'investor') return 'مستثمر معتمد (Investor)';
        if (user.user_type === 'company') return 'شركة لوجستية (Logistics Partner)';
        return user.user_type;
    };

    return (
        <AuthenticatedLayout title="الملف الشخصي وإعدادات الحساب">
            <Head title="الملف الشخصي" />

            {/* Header */}
            <AdminPageHeader
                title="الملف الشخصي وإعدادات الحساب"
                subtitle="استعراض وتعديل كافة بياناتك الأساسية والبنكية، إدارة الأمان وكلمة المرور، والاطلاع على وثائق الاعتماد"
                icon={User}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: 'الملف الشخصي' }]}
                badge={{
                    text: getUserTypeTitle(),
                    color: user.user_type === 'admin' ? 'brand' : (user.user_type === 'investor' ? 'orange' : 'blue'),
                }}
            />

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-violet-900/40 pb-4 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('overview')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'overview'
                            ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                            : 'bg-white dark:bg-[#0A0E2A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <User className="w-4 h-4" />
                    <span>نظرة عامة على الحساب</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('edit')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'edit'
                            ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                            : 'bg-white dark:bg-[#0A0E2A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    <span>تحديث البيانات والمعلومات</span>
                </button>

                <button
                    type="button"
                    onClick={() => setActiveTab('security')}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        activeTab === 'security'
                            ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                            : 'bg-white dark:bg-[#0A0E2A] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                    }`}
                >
                    <Lock className="w-4 h-4" />
                    <span>الأمان وتغيير كلمة المرور</span>
                </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* User Identity Card */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-[#6320EE] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-violet-600/30">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">{user.name}</h2>
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
                                            {user.status === 'active' ? '✓ حساب معتمد' : '⏳ قيد المراجعة'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                                        <span className="flex items-center gap-1 font-mono">
                                            <Mail className="w-3.5 h-3.5 text-violet-500" />
                                            <span>{user.email}</span>
                                        </span>
                                        {user.phone && (
                                            <span className="flex items-center gap-1 font-mono">
                                                <Phone className="w-3.5 h-3.5 text-orange-500" />
                                                <span>{user.country_code || '+966'} {user.phone}</span>
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setActiveTab('edit')}
                                className="px-4 py-2 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all shadow-md self-start sm:self-auto cursor-pointer"
                            >
                                تعديل بيانات الحساب
                            </button>
                        </div>

                        {/* Account Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs">
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">نوع العضوية</span>
                                <strong className="text-slate-900 dark:text-white font-bold">{getUserTypeTitle()}</strong>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">تاريخ الانضمام</span>
                                <strong className="text-slate-900 dark:text-white font-bold">
                                    {new Date(user.created_at).toLocaleDateString('ar-SA')}
                                </strong>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">حالة البريد الإلكتروني</span>
                                <span className="text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>مؤكد ومحمي</span>
                                </span>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-1">حالة وثيقة الاتفاقية</span>
                                {user.agreement_signed_at ? (
                                    <button
                                        type="button"
                                        onClick={() => setAgreementModalOpen(true)}
                                        className="text-violet-600 dark:text-violet-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>موقّعة (عرض الوثيقة)</span>
                                    </button>
                                ) : (
                                    <span className="text-amber-500 font-bold">بانتظار التوقيع</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Section */}
                    {user.user_type === 'investor' && (
                        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Wallet className="w-5 h-5 text-violet-500" />
                                <span>البيانات الاستثمارية والمالية للمستثمر</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">رقم الهوية / الإقامة:</span>
                                    <strong className="text-slate-900 dark:text-white font-mono text-sm">
                                        {user.investor_profile?.national_id || 'لم يتم التسجيل بعد'}
                                    </strong>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">البنك والآيبان المعتمد للسحب:</span>
                                    <strong className="text-slate-900 dark:text-white font-mono text-sm block">
                                        {user.investor_profile?.bank_name || 'مصرف الراجحي'}
                                    </strong>
                                    <span className="font-mono text-slate-500 text-[11px]">
                                        {user.investor_profile?.iban || 'SA0000000000000000000000'}
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">نسبة حصتك من العمولات:</span>
                                    <strong className="text-orange-500 font-mono text-lg block">
                                        {user.investor_profile?.platform_commission_share_rate || 70}%
                                    </strong>
                                    <span className="text-[10px] text-slate-500">حصة فورية من كل مهمة ممولة</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {user.user_type === 'company' && (
                        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Building2 className="w-5 h-5 text-orange-500" />
                                <span>بيانات المنشأة والربط اللوجستي</span>
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">اسم المنشأة / الشركة:</span>
                                    <strong className="text-slate-900 dark:text-white font-bold text-sm">
                                        {user.company_profile?.company_name || user.name}
                                    </strong>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">السجل التجاري والضريبي:</span>
                                    <strong className="text-slate-900 dark:text-white font-mono block">
                                        CR: {user.company_profile?.commercial_registration || 'غير مسجل'}
                                    </strong>
                                    <span className="font-mono text-slate-500 text-[11px]">
                                        TAX: {user.company_profile?.tax_number || 'غير مسجل'}
                                    </span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-500 dark:text-slate-400 block mb-1">السقف الائتماني والعمولة:</span>
                                    <strong className="text-violet-600 dark:text-violet-400 font-mono text-sm block">
                                        سقف: {Number(user.company_profile?.credit_limit || 100000).toLocaleString('en-US')} ر.س
                                    </strong>
                                    <span className="text-[11px] text-slate-500">
                                        عمولة المنصة: {user.company_profile?.platform_commission_rate || 10}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Recent Security & Activity Logs */}
                    {recentActivities.length > 0 && (
                        <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-indigo-500" />
                                <span>أحدث النشاطات وحركات التدقيق بالحساب</span>
                            </h3>

                            <div className="space-y-3">
                                {recentActivities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-2 h-2 rounded-full bg-violet-500" />
                                            <span className="text-slate-800 dark:text-slate-200 font-medium">
                                                {act.description || act.action}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-mono">
                                            {new Date(act.created_at).toLocaleString('ar-SA')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 2: EDIT PROFILE */}
            {activeTab === 'edit' && (
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl max-w-3xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">تحديث بيانات الملف الشخصي</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        قم بتحديث بيانات الاتصال والبيانات المالية المرتبطة بحسابك، وسيتم حفظها مباشرة في قاعدة البيانات.
                    </p>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    الاسم الكامل *
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData('name', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                {profileErrors.name && <p className="text-[10px] text-rose-500 mt-1">{profileErrors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    البريد الإلكتروني *
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData('email', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                    required
                                />
                                {profileErrors.email && <p className="text-[10px] text-rose-500 mt-1">{profileErrors.email}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    رقم الجوال
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={profileData.phone_country_code}
                                        onChange={(e) => setProfileData('phone_country_code', e.target.value)}
                                        className="w-20 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-2.5 text-xs text-slate-900 dark:text-white text-center font-mono"
                                    />
                                    <input
                                        type="text"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData('phone', e.target.value)}
                                        placeholder="5XXXXXXXX"
                                        className="flex-1 bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                                {profileErrors.phone && <p className="text-[10px] text-rose-500 mt-1">{profileErrors.phone}</p>}
                            </div>

                            {user.user_type === 'investor' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        رقم الهوية الوطنية / الإقامة
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.national_id}
                                        onChange={(e) => setProfileData('national_id', e.target.value)}
                                        placeholder="1XXXXXXXXX"
                                        className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            )}

                            {user.user_type === 'company' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                        اسم الشركة التجاري
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.company_name}
                                        onChange={(e) => setProfileData('company_name', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Financial bank fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    اسم البنك المعتمد
                                </label>
                                <input
                                    type="text"
                                    value={profileData.bank_name}
                                    onChange={(e) => setProfileData('bank_name', e.target.value)}
                                    placeholder="مصرف الراجحي، بنك الرياض..."
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                    رقم الآيبان البنكي (IBAN)
                                </label>
                                <input
                                    type="text"
                                    value={profileData.iban}
                                    onChange={(e) => setProfileData('iban', e.target.value)}
                                    placeholder="SA0000000000000000000000"
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={() => setActiveTab('overview')}
                                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={profileProcessing}
                                className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-violet-600/30 cursor-pointer"
                            >
                                {profileProcessing ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 3: SECURITY & PASSWORD CHANGE */}
            {activeTab === 'security' && (
                <div className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl max-w-2xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">تغيير كلمة المرور وإعدادات الأمان</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                        لضمان أمان حسابك، استخدم كلمة مرور قوية تحتوي على 8 خانات على الأقل مع مزيج من الحروف والأرقام والرموز.
                    </p>

                    <form onSubmit={handlePassSubmit} className="space-y-4">
                        {/* Current Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                كلمة المرور الحالية *
                            </label>
                            <div className="relative">
                                <input
                                    type={showCurrentPass ? 'text' : 'password'}
                                    value={passData.current_password}
                                    onChange={(e) => setPassData('current_password', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passErrors.current_password && (
                                <p className="text-[10px] text-rose-500 mt-1">{passErrors.current_password}</p>
                            )}
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                كلمة المرور الجديدة *
                            </label>
                            <div className="relative">
                                <input
                                    type={showNewPass ? 'text' : 'password'}
                                    value={passData.password}
                                    onChange={(e) => setPassData('password', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPass(!showNewPass)}
                                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passErrors.password && (
                                <p className="text-[10px] text-rose-500 mt-1">{passErrors.password}</p>
                            )}
                        </div>

                        {/* Confirm New Password */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                                تأكيد كلمة المرور الجديدة *
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPass ? 'text' : 'password'}
                                    value={passData.password_confirmation}
                                    onChange={(e) => setPassData('password_confirmation', e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                    className="absolute left-3 top-3 text-slate-400 hover:text-slate-200 cursor-pointer"
                                >
                                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={passProcessing}
                                className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-violet-600/30 flex items-center gap-1.5 cursor-pointer"
                            >
                                <Lock className="w-4 h-4" />
                                <span>{passProcessing ? 'جاري التحديث...' : 'تحديث كلمة المرور'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Official Legal Agreement Modal */}
            <LegalAgreementModal
                isOpen={agreementModalOpen}
                onClose={() => setAgreementModalOpen(false)}
                contract={activeContract}
            />
        </AuthenticatedLayout>
    );
}
