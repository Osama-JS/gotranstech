import React from 'react';

export default function Badge({ status, text }) {
    const statusMap = {
        active: {
            bg: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/20',
            dot: 'bg-violet-500 dark:bg-violet-400',
            defaultText: 'نشط',
        },
        available: {
            bg: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/25',
            dot: 'bg-orange-500 dark:bg-orange-400 animate-pulse',
            defaultText: 'متاحة للتمويل',
        },
        funded: {
            bg: 'bg-violet-100 dark:bg-violet-500/15 text-violet-800 dark:text-violet-200 border-violet-200 dark:border-violet-500/30',
            dot: 'bg-violet-600 dark:bg-violet-400',
            defaultText: 'ممولة بنجاح',
        },
        completed: {
            bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/20',
            dot: 'bg-indigo-500 dark:bg-indigo-400',
            defaultText: 'مكتملة',
        },
        pending: {
            bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            dot: 'bg-amber-500 dark:bg-amber-400 animate-pulse',
            defaultText: 'قيد المراجعة',
        },
        approved: {
            bg: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/20',
            dot: 'bg-violet-500 dark:bg-violet-400',
            defaultText: 'معتمد',
        },
        rejected: {
            bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
            dot: 'bg-rose-500 dark:bg-rose-400',
            defaultText: 'مرفوض',
        },
        expired: {
            bg: 'bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-500/20',
            dot: 'bg-slate-500 dark:bg-slate-400',
            defaultText: 'منتهية الصلاحية',
        },
        cancelled_by_company: {
            bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
            dot: 'bg-rose-500 dark:bg-rose-400',
            defaultText: 'ملغاة من الشركة',
        },
        unpaid: {
            bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
            dot: 'bg-rose-500 dark:bg-rose-400',
            defaultText: 'غير مسدد',
        },
        partially_paid: {
            bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            dot: 'bg-amber-500 dark:bg-amber-400',
            defaultText: 'مسدد جزئياً',
        },
        paid: {
            bg: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-500/20',
            dot: 'bg-violet-500 dark:bg-violet-400',
            defaultText: 'مسدد بالكامل',
        },
    };

    const config = statusMap[status] || {
        bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
        dot: 'bg-slate-400',
        defaultText: status,
    };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {text || config.defaultText}
        </span>
    );
}
