import React, { useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ExternalLink, CheckCircle2, X } from 'lucide-react';
import { router } from '@inertiajs/react';
import notificationSound from '../Services/NotificationSound';

export default function UrgentNotificationModal({ notification, onClose, onAcknowledge }) {
    if (!notification) return null;

    useEffect(() => {
        // Trigger high-priority urgent sound alert
        notificationSound.playUrgentAlert();
    }, [notification?.id]);

    const handleActionClick = () => {
        if (onAcknowledge) {
            onAcknowledge(notification.id);
        }
        if (notification.action_url) {
            router.visit(notification.action_url);
        } else {
            onClose();
        }
    };

    const handleDismiss = () => {
        if (onAcknowledge) {
            onAcknowledge(notification.id);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
            {/* Dark Dramatic Backdrop with Blur */}
            <div 
                className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
                onClick={handleDismiss}
            />

            {/* Urgent Center Dialog */}
            <div className="relative w-full max-w-lg bg-white dark:bg-[#0B0F2A] border-2 border-orange-500 rounded-3xl shadow-[0_0_50px_rgba(255,107,0,0.35)] overflow-hidden z-10 animate-in zoom-in-95 duration-200 text-slate-900 dark:text-white">
                {/* Top Warning Bar */}
                <div className="h-2 w-full bg-orange-500 animate-pulse" />

                {/* Content Box */}
                <div className="p-6 sm:p-8">
                    {/* Header with Pulse Icon */}
                    <div className="flex items-start gap-4 mb-6">
                        <div className="relative shrink-0">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/15 border border-orange-500/40 flex items-center justify-center text-orange-500 shadow-lg shadow-orange-500/20">
                                <ShieldAlert className="w-8 h-8 animate-bounce" />
                            </div>
                            <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500"></span>
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-orange-500 text-white shadow-sm shadow-orange-500/40">
                                    تنبيه إداري طارئ
                                </span>
                                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                    {notification.created_at_human || 'الآن'}
                                </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                                {notification.title}
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Message Body */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A1E]/80 border border-slate-200 dark:border-violet-900/40 mb-6 text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200 font-medium">
                        {notification.body}
                    </div>

                    {/* Meta Data info if present */}
                    {notification.data && Object.keys(notification.data).length > 0 && (
                        <div className="mb-6 grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(notification.data).map(([key, val]) => (
                                typeof val === 'string' || typeof val === 'number' ? (
                                    <div key={key} className="p-2.5 rounded-xl bg-slate-100 dark:bg-violet-950/30 border border-slate-200 dark:border-violet-900/30 truncate">
                                        <span className="text-slate-500 dark:text-slate-400 block text-[10px] mb-0.5">{key}:</span>
                                        <span className="font-bold text-violet-700 dark:text-violet-300 font-mono truncate block">{val}</span>
                                    </div>
                                ) : null
                            ))}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="w-full sm:w-1/2 px-5 py-3 rounded-2xl border border-slate-300 dark:border-violet-900/60 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-violet-950/40 transition-colors text-center"
                        >
                            تأكيد الاطلاع والإغلاق
                        </button>

                        {notification.action_url ? (
                            <button
                                type="button"
                                onClick={handleActionClick}
                                className="w-full sm:w-1/2 px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
                            >
                                <span>الانتقال فوراً للمعاينة</span>
                                <ExternalLink className="w-4 h-4 rtl:rotate-180" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="w-full sm:w-1/2 px-5 py-3 rounded-2xl bg-[#6320EE] hover:bg-[#5219cf] text-white font-bold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 transition-all"
                            >
                                <CheckCircle2 className="w-4 h-4 text-orange-400" />
                                <span>تم الاستيعاب</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
