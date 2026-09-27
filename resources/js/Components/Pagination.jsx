import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
    links = [],
    from = 0,
    to = 0,
    total = 0,
    currentPage = 1,
    lastPage = 1,
    className = '',
}) {
    if (!links || links.length <= 3) {
        if (total > 0) {
            return (
                <div className={`flex items-center justify-between py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 px-2 ${className}`}>
                    <div>
                        عرض <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{from || 1}</span> إلى{' '}
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{to || total}</span> من أصل{' '}
                        <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{total}</span> سجل
                    </div>
                </div>
            );
        }
        return null;
    }

    return (
        <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/80 px-2 select-none ${className}`}>
            {/* Info Summary */}
            <div className="font-medium text-slate-500 dark:text-slate-400 text-center sm:text-start">
                عرض <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{from || 0}</span> إلى{' '}
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{to || 0}</span> من أصل{' '}
                <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{total}</span> سجل
            </div>

            {/* Pagination Links */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
                {links.map((link, index) => {
                    // Check if it's "Previous" or "Next"
                    let label = link.label;
                    let isPrev = label.includes('&laquo;') || label.toLowerCase().includes('previous');
                    let isNext = label.includes('&raquo;') || label.toLowerCase().includes('next');

                    if (isPrev) {
                        return link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-medium shadow-sm"
                                title="السابق"
                            >
                                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                                <span className="hidden sm:inline">السابق</span>
                            </Link>
                        ) : (
                            <span
                                key={index}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed flex items-center gap-1 text-xs"
                            >
                                <ChevronRight className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                                <span className="hidden sm:inline">السابق</span>
                            </span>
                        );
                    }

                    if (isNext) {
                        return link.url ? (
                            <Link
                                key={index}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1 text-xs font-medium shadow-sm"
                                title="التالي"
                            >
                                <span className="hidden sm:inline">التالي</span>
                                <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                            </Link>
                        ) : (
                            <span
                                key={index}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-400 dark:text-slate-600 opacity-50 cursor-not-allowed flex items-center gap-1 text-xs"
                            >
                                <span className="hidden sm:inline">التالي</span>
                                <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-0 ltr:rotate-180" />
                            </span>
                        );
                    }

                    // Numbered Page
                    const isActive = link.active;
                    return link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            preserveState
                            className={`min-w-[34px] h-[34px] flex items-center justify-center rounded-xl text-xs font-mono font-bold transition-all ${
                                isActive
                                    ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30 border border-violet-500'
                                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-sm'
                            }`}
                        >
                            {link.label}
                        </Link>
                    ) : (
                        <span
                            key={index}
                            className="min-w-[34px] h-[34px] flex items-center justify-center rounded-xl text-xs font-mono text-slate-400 dark:text-slate-600 select-none"
                        >
                            {link.label}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}
