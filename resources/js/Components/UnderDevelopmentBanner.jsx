import React from 'react';
import { usePage } from '@inertiajs/react';
import { Wrench, Sparkles } from 'lucide-react';

export default function UnderDevelopmentBanner() {
    const { underDevelopment, locale } = usePage().props;

    const isAr = (locale || 'ar') === 'ar';

    if (!underDevelopment?.enabled) {
        return null;
    }

    // Determine animation speed class
    const speed = underDevelopment.speed || 'normal';
    let animationClass = isAr ? 'animate-ticker-rtl' : 'animate-ticker-ltr';
    if (speed === 'slow') {
        animationClass = isAr ? 'animate-ticker-rtl-slow' : 'animate-ticker-ltr-slow';
    } else if (speed === 'fast') {
        animationClass = isAr ? 'animate-ticker-rtl-fast' : 'animate-ticker-ltr-fast';
    }

    const badgeText = underDevelopment.badge || (isAr ? 'نسخة تجريبية قيد التطوير' : 'Beta Development Mode');
    const tickerText = underDevelopment.text || (isAr ? 'تنبيه: المنصة حالياً قيد التطوير والتحديث المستمر.' : 'Notice: Platform is currently undergoing continuous development and updates.');

    return (
        <aside 
            aria-label="Under Development Notice"
            className="fixed bottom-0 inset-x-0 z-[9990] h-11 bg-amber-50/95 dark:bg-[#070A1E]/95 backdrop-blur-md border-t border-amber-300 dark:border-amber-500/30 text-slate-800 dark:text-white shadow-[0_-4px_20px_rgba(245,158,11,0.15)] dark:shadow-2xl flex items-center select-none overflow-hidden transition-colors duration-200"
            dir={isAr ? 'rtl' : 'ltr'}
        >
            {/* Top Amber Glowing Accent Line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 opacity-90" />

            {/* Left/Start Badge (Fixed) */}
            <div className="relative z-20 flex items-center h-full px-3 sm:px-4 bg-amber-100/95 dark:bg-[#070A1E] border-x border-amber-300/80 dark:border-amber-500/20 shadow-md shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-200/80 dark:bg-amber-500/15 border border-amber-400 dark:border-amber-500/40 text-amber-950 dark:text-amber-300 font-bold text-[11px] sm:text-xs shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600 dark:bg-amber-500"></span>
                    </span>
                    <Wrench className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                    <span className="whitespace-nowrap">{badgeText}</span>
                </div>
            </div>

            {/* Scrolling Ticker Track */}
            <div className="relative flex-1 h-full overflow-hidden flex items-center">
                {/* Fade edges adapted to both Light (amber-50) and Dark (#070A1E) */}
                <div className="pointer-events-none absolute inset-y-0 start-0 w-8 bg-gradient-to-r from-amber-50 dark:from-[#070A1E] to-transparent z-10 rtl:bg-gradient-to-l" />
                <div className="pointer-events-none absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-amber-50 dark:from-[#070A1E] to-transparent z-10 rtl:bg-gradient-to-r" />

                {/* Animated looping container */}
                <div className={`flex items-center gap-12 font-medium text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 cursor-default ${animationClass}`}>
                    <div className="inline-flex items-center gap-10 shrink-0">
                        <span className="flex items-center gap-2 font-medium">
                            <span>{tickerText}</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-black text-xs opacity-70">✦</span>
                        <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{isAr ? 'نظام تشغيل لوجستي وتقني متطور - تجربة مستخدم في مرحلة التطوير الأخير' : 'Advanced logistics & tech infrastructure - UX in final development phase'}</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-black text-xs opacity-70">✦</span>
                    </div>

                    <div className="inline-flex items-center gap-10 shrink-0">
                        <span className="flex items-center gap-2 font-medium">
                            <span>{tickerText}</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-black text-xs opacity-70">✦</span>
                        <span className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>{isAr ? 'نظام تشغيل لوجستي وتقني متطور - تجربة مستخدم في مرحلة التطوير الأخير' : 'Advanced logistics & tech infrastructure - UX in final development phase'}</span>
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-black text-xs opacity-70">✦</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
