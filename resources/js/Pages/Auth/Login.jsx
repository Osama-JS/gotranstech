import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Toast from '../../Components/Toast';
import BrandLogo from '../../Components/BrandLogo';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#06081B] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden transition-colors duration-200" dir="rtl">
            <Head title="تسجيل الدخول | GoTransTech" />
            <Toast />

            <div className="w-full max-w-md z-10">
                {/* Brand Logo & Slogan */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block group hover:scale-105 transition-transform">
                        <BrandLogo size="lg" variant="stacked" showSlogan={true} />
                    </Link>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-6">تسجيل الدخول للمنصة</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">مرحباً بك مجدداً، أدخل بيانات حسابك للمتابعة</p>
                </div>

                {/* Card */}
                <div className="glass-panel p-8 rounded-3xl border border-slate-200 dark:border-violet-900/30 shadow-xl bg-white dark:bg-[#0B0F2A]/90">
                    <form onSubmit={submit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">البريد الإلكتروني</label>
                            <div className="relative">
                                <Mail className="w-4 h-4 text-violet-500 absolute right-3.5 top-3.5" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-50 dark:bg-[#070A1E]/80 border border-slate-200 dark:border-violet-800/40 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">كلمة المرور</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-orange-500 absolute right-3.5 top-3.5" />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 dark:bg-[#070A1E]/80 border border-slate-200 dark:border-violet-800/40 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all font-sans"
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password}</p>}
                        </div>

                        {/* Remember me */}
                        <div className="flex items-center justify-between py-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 dark:border-violet-800 bg-white dark:bg-[#070A1E] text-violet-600 focus:ring-violet-500"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-400">تذكر تسجيل الدخول</span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-md shadow-violet-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <span>دخول للمنصة</span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer link */}
                <div className="text-center mt-6">
                    <span className="text-xs text-slate-500 dark:text-slate-400">ليس لديك حساب؟ </span>
                    <Link href={route('register')} className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
                        أنشئ حساباً جديداً
                    </Link>
                </div>
            </div>
        </div>
    );
}
