import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, User, Phone, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import Toast from '../../Components/Toast';
import PhoneInput from '../../Components/PhoneInput';
import BrandLogo from '../../Components/BrandLogo';
import UnderDevelopmentBanner from '../../Components/UnderDevelopmentBanner';

export default function Register() {
    const [role, setRole] = useState('investor'); // investor, company

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        country_code: '+966',
        phone: '',
        password: '',
        password_confirmation: '',
        user_type: 'investor',
        company_name: '',
        cr_number: '',
        city: 'الرياض',
        national_id: '',
    });

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setData('user_type', newRole);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#06081B] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden transition-colors duration-200" dir="rtl">
            <Head title="إرسال طلب تسجيل | GoTransTech" />
            <Toast />

            <div className="w-full max-w-lg z-10 my-8">
                {/* Brand */}
                <div className="text-center mb-6">
                    <Link href="/" className="inline-block group hover:scale-105 transition-transform">
                        <BrandLogo size="lg" variant="stacked" showSlogan={true} />
                    </Link>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-6 tracking-tight">إرسال طلب تسجيل</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-md mx-auto">
                        سجّل بياناتك الأساسية لإرسال طلب الانضمام، وسيتم توجيهك لتوقيع الاتفاقية واستكمال متطلبات تفعيل الحساب.
                    </p>
                </div>

                {/* Account Type Selector Tabs */}
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 rounded-2xl mb-6 shadow-inner">
                    <button
                        type="button"
                        onClick={() => handleRoleChange('investor')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            role === 'investor'
                                ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <User className="w-4 h-4" />
                        <span>طلب مستثمر (تمويل مهام)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleChange('company')}
                        className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                            role === 'company'
                                ? 'bg-[#FF6B00] text-white shadow-md shadow-orange-500/30'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        <Building2 className="w-4 h-4" />
                        <span>طلب شركة لوجستية (ربط API)</span>
                    </button>
                </div>

                {/* Form Card */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-violet-900/30 shadow-xl bg-white dark:bg-[#0B0F2A]/90">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                                {role === 'company' ? 'اسم ممثل الشركة المفوض' : 'الاسم الكامل'} <span className="text-rose-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="الاسم ثلاثي"
                                className="w-full bg-[#070A1E]/80 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                                required
                            />
                            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
                        </div>

                        {/* Company Specific Fields */}
                        {role === 'company' && (
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">اسم الشركة الرسمي *</label>
                                    <input
                                        type="text"
                                        value={data.company_name}
                                        onChange={(e) => setData('company_name', e.target.value)}
                                        placeholder="شركة النقل السريع"
                                        className="w-full bg-[#070A1E]/80 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم السجل التجاري *</label>
                                    <input
                                        type="text"
                                        value={data.cr_number}
                                        onChange={(e) => setData('cr_number', e.target.value)}
                                        placeholder="1010XXXXXX"
                                        className="w-full bg-[#070A1E]/80 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email & Phone */}
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني <span className="text-rose-400">*</span></label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-[#070A1E]/80 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
                            </div>
                            
                            <PhoneInput
                                label="رقم الجوال"
                                countryCode={data.country_code}
                                onCountryCodeChange={(code) => setData('country_code', code)}
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                error={errors.phone || errors.country_code}
                                required
                            />
                        </div>

                        {/* Investor Specific Fields */}
                        {role === 'investor' && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">رقم الهوية الوطنية / الإقامة</label>
                                <input
                                    type="text"
                                    value={data.national_id}
                                    onChange={(e) => setData('national_id', e.target.value)}
                                    placeholder="10XXXXXXXX"
                                    className="w-full bg-[#070A1E]/80 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                                />
                            </div>
                        )}

                        {/* Password & Confirm */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">كلمة المرور *</label>
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#070A1E]/80 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                                {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-300 mb-1.5">تأكيد كلمة المرور *</label>
                                <input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-[#070A1E]/80 border border-violet-800/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full mt-4 py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>إرسال طلب التسجيل والمتابعة</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer link */}
                <div className="text-center mt-6">
                    <span className="text-xs text-slate-500 dark:text-slate-400">لديك حساب مسجل بالفعل؟ </span>
                    <Link href={route('login')} className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
                        تسجيل الدخول
                    </Link>
                </div>
            </div>

            {/* Bottom Under Development Banner */}
            <UnderDevelopmentBanner />
        </div>
    );
}
