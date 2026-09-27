import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ChevronLeft, Home } from 'lucide-react';

export default function AdminPageHeader({
    title,
    subtitle,
    icon: Icon,
    iconColor = 'text-violet-300',
    iconBg = 'bg-violet-500/15 border-violet-500/30',
    breadcrumbs = [],
    actions = null,
    badge = null,
    className = '',
    homeRoute = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const resolvedHomeRoute = homeRoute || (
        user?.user_type === 'investor' 
            ? route('investor.dashboard') 
            : (user?.user_type === 'company' ? route('company.dashboard') : route('admin.dashboard'))
    );
    const getBadgeStyle = (color) => {
        switch (color) {
            case 'orange':
                return 'bg-orange-500/10 text-orange-400 border-orange-500/25';
            case 'blue':
                return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
            case 'purple':
            case 'violet':
            case 'brand':
                return 'bg-violet-500/15 text-violet-300 border-violet-500/30';
            case 'amber':
                return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'rose':
            case 'red':
                return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'emerald':
            case 'green':
            default:
                return 'bg-violet-500/15 text-violet-300 border-violet-500/25';
        }
    };

    const renderBadge = () => {
        if (!badge) return null;

        if (typeof badge === 'object' && badge !== null && 'text' in badge) {
            return (
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${getBadgeStyle(badge.color)}`}>
                    {badge.text}
                </span>
            );
        }

        if (typeof badge === 'string' || typeof badge === 'number') {
            return (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/25">
                    {badge}
                </span>
            );
        }

        return badge;
    };

    const renderActions = () => {
        if (!actions) return null;

        if (Array.isArray(actions)) {
            return (
                <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    {actions.map((act, idx) => {
                        if (React.isValidElement(act)) {
                            return <React.Fragment key={idx}>{act}</React.Fragment>;
                        }

                        if (typeof act === 'object' && act !== null) {
                            const ActIcon = act.icon;
                            const isPrimary = act.variant === 'primary';
                            const btnClasses = `px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
                                isPrimary
                                    ? 'bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-violet-600/30'
                                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#0E1338] dark:hover:bg-[#151D52] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-violet-800/40 hover:border-orange-500/40'
                            }`;

                            if (act.url || act.href) {
                                return (
                                    <Link key={idx} href={act.url || act.href} className={btnClasses}>
                                        {ActIcon && <ActIcon className="w-4 h-4" />}
                                        <span>{act.label}</span>
                                    </Link>
                                );
                            }

                            return (
                                <button key={idx} type="button" onClick={act.onClick} className={btnClasses}>
                                    {ActIcon && <ActIcon className="w-4 h-4" />}
                                    <span>{act.label}</span>
                                </button>
                            );
                        }

                        return null;
                    })}
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                {actions}
            </div>
        );
    };

    return (
        <div className={`mb-8 ${className}`}>
            {/* Breadcrumbs Navigation */}
            {breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-3 select-none" aria-label="Breadcrumb">
                    <Link
                        href={resolvedHomeRoute}
                        className="flex items-center gap-1 hover:text-orange-500 transition-colors"
                    >
                        <Home className="w-3.5 h-3.5" />
                        <span>الرئيسية</span>
                    </Link>

                    {breadcrumbs.map((item, index) => {
                        const isLast = index === breadcrumbs.length - 1;
                        const linkUrl = item.url || item.href;
                        return (
                            <React.Fragment key={index}>
                                <ChevronLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 rtl:rotate-0 ltr:rotate-180" />
                                {linkUrl && !isLast ? (
                                    <Link
                                        href={linkUrl}
                                        className="hover:text-orange-500 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                ) : (
                                    <span className={isLast ? 'text-violet-600 dark:text-violet-300 font-semibold' : ''}>
                                        {item.label}
                                    </span>
                                )}
                            </React.Fragment>
                        );
                    })}
                </nav>
            )}

            {/* Header Content & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0E2A]/85 backdrop-blur-xl border border-slate-200 dark:border-violet-900/35 p-6 rounded-3xl shadow-sm dark:shadow-xl relative overflow-hidden">
                <div className="flex items-center gap-4">
                    {Icon && (
                        <div className={`w-14 h-14 rounded-2xl ${iconBg} border flex items-center justify-center shrink-0 shadow-sm`}>
                            <Icon className={`w-7 h-7 ${iconColor}`} />
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
                            {renderBadge()}
                        </div>
                        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{subtitle}</p>}
                    </div>
                </div>

                {renderActions()}
            </div>
        </div>
    );
}
