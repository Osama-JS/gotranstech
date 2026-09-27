import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({
    title,
    value,
    subtitle = null,
    icon: Icon,
    color = 'brand', // brand (violet), orange, blue, amber, rose, cyan
    trend = null, // { value: '+12%', isPositive: true }
    className = '',
}) {
    const colorStyles = {
        brand: {
            border: 'border-violet-200 dark:border-violet-500/30 hover:border-violet-400 dark:hover:border-violet-500/60',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border-violet-200 dark:border-violet-500/40',
            text: 'text-violet-700 dark:text-violet-300',
        },
        orange: {
            border: 'border-orange-200 dark:border-orange-500/30 hover:border-orange-400 dark:hover:border-orange-500/60',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/40',
            text: 'text-orange-700 dark:text-orange-400',
        },
        emerald: {
            border: 'border-violet-200 dark:border-violet-500/25 hover:border-violet-400 dark:hover:border-violet-500/50',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 border-violet-200 dark:border-violet-500/30',
            text: 'text-violet-700 dark:text-violet-300',
        },
        blue: {
            border: 'border-indigo-200 dark:border-indigo-500/25 hover:border-indigo-400 dark:hover:border-indigo-500/50',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
            text: 'text-indigo-700 dark:text-indigo-300',
        },
        amber: {
            border: 'border-amber-200 dark:border-amber-500/25 hover:border-amber-400 dark:hover:border-amber-500/50',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
            text: 'text-amber-700 dark:text-amber-400',
        },
        purple: {
            border: 'border-purple-200 dark:border-purple-500/25 hover:border-purple-400 dark:hover:border-purple-500/50',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30',
            text: 'text-purple-700 dark:text-purple-300',
        },
        rose: {
            border: 'border-rose-200 dark:border-rose-500/25 hover:border-rose-400 dark:hover:border-rose-500/50',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
            text: 'text-rose-700 dark:text-rose-400',
        },
        cyan: {
            border: 'border-cyan-200 dark:border-cyan-500/25 hover:border-cyan-400 dark:hover:border-cyan-500/50',
            bg: 'bg-white dark:bg-[#0A0E2A]/80',
            iconBg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400 border-cyan-200 dark:border-cyan-500/30',
            text: 'text-cyan-700 dark:text-cyan-400',
        },
    };

    const currentStyle = colorStyles[color] || colorStyles.brand;

    return (
        <div className={`relative overflow-hidden rounded-3xl border ${currentStyle.border} ${currentStyle.bg} backdrop-blur-xl p-5 shadow-sm dark:shadow-lg transition-all duration-300 group ${className}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide mb-1.5">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">{value}</h3>
                        {trend && (
                            <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${trend.isPositive ? 'text-orange-600 dark:text-orange-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {trend.value}
                            </span>
                        )}
                    </div>
                    {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 font-medium">{subtitle}</p>}
                </div>

                {Icon && (
                    <div className={`w-12 h-12 rounded-2xl ${currentStyle.iconBg} border flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                        <Icon className="w-6 h-6" />
                    </div>
                )}
            </div>
        </div>
    );
}
