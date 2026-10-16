import React, { useState, useEffect, useRef } from 'react';
import { 
    Bell, 
    BellRing, 
    Check, 
    CheckCheck, 
    Volume2, 
    VolumeX, 
    Globe, 
    ExternalLink, 
    Settings, 
    AlertCircle, 
    Info, 
    ShieldAlert, 
    Clock,
    X,
    Sparkles
} from 'lucide-react';
import { Link, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import notificationSound from '../Services/NotificationSound';
import browserNotification from '../Services/BrowserNotification';

export default function NotificationBell({ onUrgentDetected }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMuted, setIsMuted] = useState(notificationSound.isMuted());
    const [browserPerm, setBrowserPerm] = useState(browserNotification.getPermission());

    const dropdownRef = useRef(null);
    const lastPolledCountRef = useRef(null);

    // Fetch live feed
    const fetchFeed = async (isPolling = false) => {
        try {
            const res = await axios.get(route('notifications.feed'));
            const data = res.data;

            // Check if there is an unread urgent notification
            if (data.urgent_notification && onUrgentDetected) {
                onUrgentDetected(data.urgent_notification);
            }

            // Check if new unread notification arrived during polling
            if (isPolling && lastPolledCountRef.current !== null && data.unread_count > lastPolledCountRef.current) {
                // Play notification chime
                notificationSound.playChime();

                // If browser notification is granted, display the latest one
                if (data.notifications && data.notifications.length > 0) {
                    const latest = data.notifications[0];
                    if (!latest.is_read) {
                        browserNotification.show({
                            title: latest.title,
                            body: latest.body,
                            url: latest.action_url || window.location.href,
                        });
                    }
                }
            }

            lastPolledCountRef.current = data.unread_count;
            setUnreadCount(data.unread_count);
            setNotifications(data.notifications || []);
        } catch (error) {
            console.debug('Failed to fetch notifications feed:', error);
        }
    };

    // Initial fetch and 25s polling
    useEffect(() => {
        fetchFeed(false);
        const interval = setInterval(() => {
            fetchFeed(true);
        }, 25000);

        return () => clearInterval(interval);
    }, []);

    // Outside click listener
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleSound = () => {
        const newState = notificationSound.toggleMuted();
        setIsMuted(newState);
        if (!newState) {
            notificationSound.playChime();
        }
    };

    const enableBrowserAlerts = async () => {
        const res = await browserNotification.requestPermission();
        setBrowserPerm(res);
        if (res === 'granted') {
            browserNotification.show({
                title: 'منصة جو تيك',
                body: 'تم تفعيل إشعارات المتصفح بنجاح!',
            });
        }
    };

    const handleMarkAsRead = async (id, actionUrl = null) => {
        try {
            await axios.post(route('notifications.read', id));
            // Optimistically update
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            if (actionUrl) {
                setIsOpen(false);
                router.visit(actionUrl);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setLoading(true);
            await axios.post(route('notifications.read-all'));
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityIcon = (sev) => {
        switch (sev) {
            case 'urgent':
                return <ShieldAlert className="w-4 h-4 text-orange-500 animate-pulse" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-orange-400" />;
            case 'success':
                return <Sparkles className="w-4 h-4 text-[#6320EE]" />;
            default:
                return <Info className="w-4 h-4 text-violet-400" />;
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-xl transition-all cursor-pointer ${
                    isOpen 
                        ? 'bg-violet-600/15 text-[#6320EE] dark:text-violet-300 ring-2 ring-violet-500/30' 
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-violet-950/40 border border-transparent hover:border-slate-200 dark:hover:border-violet-800/40'
                }`}
                title="مركز الإشعارات والتنبيهات"
            >
                {unreadCount > 0 ? (
                    <BellRing className="w-5 h-5 text-orange-500 animate-wiggle" />
                ) : (
                    <Bell className="w-5 h-5" />
                )}

                {/* Unread Counter Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-black bg-orange-500 text-white shadow-md shadow-orange-500/30 border-2 border-white dark:border-[#0B0F2A] animate-pulse">
                        {unreadCount > 99 ? '+99' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Popover Dropdown */}
            {isOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 rtl:sm:right-auto rtl:sm:left-0 mt-2 w-[340px] sm:w-[420px] max-w-[95vw] bg-white dark:bg-[#0E1338] border border-slate-200 dark:border-violet-800/50 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
                    {/* Header */}
                    <div className="p-4 bg-slate-50/80 dark:bg-[#0B0F2A]/90 border-b border-slate-200 dark:border-violet-900/40 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#6320EE]/10 border border-violet-500/20 text-[#6320EE] dark:text-violet-300 flex items-center justify-center font-bold">
                                <Bell className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <span>مركز الإشعارات</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                                            {unreadCount} جديد
                                        </span>
                                    )}
                                </h4>
                            </div>
                        </div>

                        {/* Top Action Icons */}
                        <div className="flex items-center gap-1">
                            {/* Sound Mute Toggle */}
                            <button
                                type="button"
                                onClick={toggleSound}
                                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                    isMuted 
                                        ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400' 
                                        : 'bg-violet-500/10 border-violet-500/20 text-[#6320EE] dark:text-violet-300'
                                }`}
                                title={isMuted ? 'تفعيل أصوات التنبيه' : 'كتم أصوات التنبيه'}
                            >
                                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </button>

                            {/* Mark All Read */}
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    disabled={loading}
                                    className="p-1.5 rounded-lg bg-slate-100 dark:bg-violet-950/40 hover:bg-slate-200 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-slate-600 dark:text-slate-300 text-xs transition-colors"
                                    title="تحديد الكل كمقروء"
                                >
                                    <CheckCheck className="w-3.5 h-3.5 text-orange-500" />
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Browser Notification Banner if not granted */}
                    {browserPerm === 'default' && (
                        <div className="px-4 py-2 bg-violet-500/10 border-b border-violet-900/20 flex items-center justify-between text-xs">
                            <span className="text-slate-600 dark:text-slate-300 text-[11px]">
                                تفعيل تنبيهات المتصفح على جهازك؟
                            </span>
                            <button
                                type="button"
                                onClick={enableBrowserAlerts}
                                className="px-2.5 py-1 rounded-lg bg-[#6320EE] hover:bg-[#5219cf] text-white text-[10px] font-bold shadow-sm"
                            >
                                تفعيل الآن
                            </button>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="overflow-y-auto max-h-[380px] divide-y divide-slate-100 dark:divide-violet-900/20 custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleMarkAsRead(item.id, item.action_url)}
                                    className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 ${
                                        !item.is_read
                                            ? 'bg-violet-500/5 dark:bg-violet-950/20 hover:bg-violet-500/10 dark:hover:bg-violet-950/30'
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 opacity-80'
                                    }`}
                                >
                                    {/* Icon Badge */}
                                    <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border mt-0.5 ${
                                        item.severity === 'urgent'
                                            ? 'bg-orange-500/15 border-orange-500/40 text-orange-500 shadow-sm shadow-orange-500/20'
                                            : item.severity === 'warning'
                                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                                            : 'bg-[#6320EE]/10 border-violet-500/20 text-[#6320EE] dark:text-violet-300'
                                    }`}>
                                        {getSeverityIcon(item.severity)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                            <h5 className={`text-xs truncate ${
                                                !item.is_read 
                                                    ? 'font-bold text-slate-900 dark:text-white' 
                                                    : 'font-medium text-slate-700 dark:text-slate-300'
                                            }`}>
                                                {item.title}
                                            </h5>
                                            {!item.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
                                            )}
                                        </div>

                                        <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-1.5">
                                            {item.body}
                                        </p>

                                        <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                                            <span className="flex items-center gap-1 font-mono">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span>{item.created_at_human}</span>
                                            </span>

                                            {item.action_url && (
                                                <span className="text-[#6320EE] dark:text-violet-400 font-bold group-hover:underline flex items-center gap-0.5">
                                                    <span>معاينة</span>
                                                    <ExternalLink className="w-2.5 h-2.5 rtl:rotate-180" />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 px-4 text-center">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-violet-950/40 border border-slate-200 dark:border-violet-900/30 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                                    <Bell className="w-6 h-6 stroke-1" />
                                </div>
                                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                    لا توجد إشعارات حالياً
                                </h5>
                                <p className="text-[11px] text-slate-400">
                                    ستظهر هنا كافة تنبيهات العمليات والمهام وتحديثات الحساب.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Popover Footer */}
                    <div className="p-3 bg-slate-50/90 dark:bg-[#070A1E]/95 border-t border-slate-200 dark:border-violet-900/40 flex flex-col gap-2">
                        <Link
                            href={route('notifications.index')}
                            onClick={() => setIsOpen(false)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 flex items-center justify-center gap-2 group cursor-pointer"
                        >
                            <span>عرض جميع الإشعارات</span>
                            <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180 group-hover:translate-x-[-2px] transition-transform" />
                        </Link>

                        {user?.is_admin && (
                            <Link
                                href={route('admin.notifications.settings')}
                                onClick={() => setIsOpen(false)}
                                className="inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#6320EE] dark:hover:text-violet-300 transition-colors py-1"
                            >
                                <Settings className="w-3.5 h-3.5 text-violet-500" />
                                <span>إدارة وضبط إعدادات الإشعارات وقنواتها</span>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
