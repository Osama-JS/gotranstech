import React from 'react';
import { usePage } from '@inertiajs/react';
import { AlertTriangle, Wrench, Sparkles } from 'lucide-react';

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

    const badgeText = underDevelopment.badge || 'نسخة تجريبية قيد التطوير';
    const tickerText = underDevelopment.text || 'تنبيه: المنصة حالياً قيد التطوير والتحديث المستمر.';

    return (
        <aside 
            aria-label="Under Development Notice"
            className="fixed bottom-0 inset-x-0 z-[9990] h-11 bg-slate-950/95 dark:bg-[#070A1E]/95 backdrop-blur-md border-t border-amber-500/30 text-white shadow-2xl flex items-center select-none overflow-hidden"
            dir={isAr ? 'rtl' : 'ltr'}
        >
            {/* Top Amber Glowing Accent Line */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 via-orange-500 to-violet-600 opacity-90" />

            {/* Left/Start Badge (Fixed) */}
            <div className="relative z-20 flex items-center h-full px-3 sm:px-4 bg-slate-950 dark:bg-[#070A1E] border-x border-amber-500/20 shadow-lg shrink-0">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[11px] sm:text-xs">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <Wrench className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="whitespace-nowrap">{badgeText}</span>
                </div>
            </div>

            {/* Scrolling Ticker Track */}
            <div className="relative flex-1 h-full overflow-hidden flex items-center">
                {/* Fade edges */}
                <div className="pointer-events-none absolute inset-y-0 start-0 w-8 bg-gradient-to-r from-slate-950 dark:from-[#070A1E] to-transparent z-10 rtl:bg-gradient-to-l" />
                <div className="pointer-events-none absolute inset-y-0 end-0 w-8 bg-gradient-to-l from-slate-950 dark:from-[#070A1E] to-transparent z-10 rtl:bg-gradient-to-r" />

                {/* Animated looping container (double repetition ensures seamless infinite loop) */}
                <div className={`flex items-center gap-12 font-medium text-xs sm:text-[13px] text-slate-200 cursor-default ${animationClass}`}>
                    <div className="inline-flex items-center gap-10 shrink-0">
                        <span className="flex items-center gap-2">
                            <span>{tickerText}</span>
                        </span>
                        <span className="text-amber-400 font-black text-xs opacity-60">✦</span>
                        <span className="flex items-center gap-2 text-amber-200">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>نظام تشغيل لوجستي وتقني متطور - تجربة مستخدم في مرحلة التطوير الأخير</span>
                        </span>
                        <span className="text-amber-400 font-black text-xs opacity-60">✦</span>
                    </div>

                    <div className="inline-flex items-center gap-10 shrink-0">
                        <span className="flex items-center gap-2">
                            <span>{tickerText}</span>
                        </span>
                        <span className="text-amber-400 font-black text-xs opacity-60">✦</span>
                        <span className="flex items-center gap-2 text-amber-200">
                            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>نظام تشغيل لوجستي وتقني متطور - تجربة مستخدم في مرحلة التطوير الأخير</span>
                        </span>
                        <span className="text-amber-400 font-black text-xs opacity-60">✦</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
