import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import StatCard from '../../Components/StatCard';
import Pagination from '../../Components/Pagination';
import ConfirmDialog from '../../Components/ConfirmDialog';
import { 
    Bell, 
    BellRing, 
    CheckCheck, 
    Check, 
    Trash2, 
    Search, 
    Filter, 
    ExternalLink, 
    Clock, 
    AlertCircle, 
    ShieldAlert, 
    Info, 
    Sparkles, 
    Settings,
    Mail,
    Globe,
    Monitor,
    RefreshCw,
    X
} from 'lucide-react';

export default function NotificationsIndex({ notifications, filters = {}, stats = {} }) {
    const { auth } = usePage().props;
    const user = auth?.user;

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [severity, setSeverity] = useState(filters?.severity || '');

    // State for modals
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);
    const [clearReadModalOpen, setClearReadModalOpen] = useState(false);
    const [processingAction, setProcessingAction] = useState(false);

    // Apply filters
    const handleFilter = (customParams = {}) => {
        const query = {
            search: customParams.search !== undefined ? customParams.search : search,
            status: customParams.status !== undefined ? customParams.status : status,
            severity: customParams.severity !== undefined ? customParams.severity : severity,
        };

        // Clean empty values
        Object.keys(query).forEach((key) => {
            if (!query[key] || query[key] === 'all') {
                delete query[key];
            }
        });

        router.get(route('notifications.index'), query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilter();
    };

    const handleStatusChange = (newStatus) => {
        setStatus(newStatus);
        handleFilter({ status: newStatus });
    };

    const handleSeverityChange = (newSeverity) => {
        setSeverity(newSeverity);
        handleFilter({ severity: newSeverity });
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('all');
        setSeverity('');
        router.get(route('notifications.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Mark single as read
    const handleMarkAsRead = (id) => {
        router.post(route('notifications.mark-read', id), {}, {
            preserveScroll: true,
        });
    };

    // Mark all as read
    const handleMarkAllAsRead = () => {
        router.post(route('notifications.mark-all-read'), {}, {
            preserveScroll: true,
        });
    };

    // Open delete modal
    const confirmDelete = (item) => {
        setNotificationToDelete(item);
        setDeleteModalOpen(true);
    };

    const executeDelete = () => {
        if (!notificationToDelete) return;
        setProcessingAction(true);
        router.delete(route('notifications.destroy', notificationToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setProcessingAction(false);
                setDeleteModalOpen(false);
                setNotificationToDelete(null);
            },
        });
    };

    // Open clear read modal
    const executeClearRead = () => {
        setProcessingAction(true);
        router.delete(route('notifications.clear-read'), {
            preserveScroll: true,
            onFinish: () => {
                setProcessingAction(false);
                setClearReadModalOpen(false);
            },
        });
    };

    const getSeverityBadge = (sev) => {
        switch (sev) {
            case 'urgent':
                return {
                    label: 'عاجل جداً',
                    icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-500" />,
                    badgeClass: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
                    borderHighlight: 'border-r-4 border-r-orange-500',
                };
            case 'warning':
                return {
                    label: 'تحذيري',
                    icon: <AlertCircle className="w-3.5 h-3.5 text-amber-500" />,
                    badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                    borderHighlight: 'border-r-4 border-r-amber-500',
                };
            case 'success':
                return {
                    label: 'نجاح وعمليات',
                    icon: <Sparkles className="w-3.5 h-3.5 text-violet-500" />,
                    badgeClass: 'bg-violet-500/10 text-[#6320EE] dark:text-violet-300 border-violet-500/20',
                    borderHighlight: 'border-r-4 border-r-[#6320EE]',
                };
            default:
                return {
                    label: 'معلوماتي',
                    icon: <Info className="w-3.5 h-3.5 text-slate-500" />,
                    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
                    borderHighlight: 'border-r-4 border-r-slate-400',
                };
        }
    };

    const items = notifications?.data || [];

    return (
        <AuthenticatedLayout>
            <Head title="مركز الإشعارات والتنبيهات" />

            <div className="space-y-6 pb-12">
                {/* Page Header */}
                <div className="bg-white dark:bg-[#0E1338] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-violet-900/40 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#6320EE] text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
                                    <Bell className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                                        مركز الإشعارات والتنبيهات
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        سجل متكامل بكافة التنبيهات، حركة الحسابات، وتحديثات النظام الموجهة إليك
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-2.5 flex-wrap">
                            {stats?.unread > 0 && (
                                <button
                                    type="button"
                                    onClick={handleMarkAllAsRead}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all shadow-md shadow-violet-600/20 cursor-pointer"
                                >
                                    <CheckCheck className="w-4 h-4 text-orange-400" />
                                    <span>تحديد الكل كمقروء</span>
                                </button>
                            )}

                            {stats?.read > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setClearReadModalOpen(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-violet-800/40 text-xs font-bold transition-all cursor-pointer"
                                >
                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                    <span>مسح المقروءة</span>
                                </button>
                            )}

                            {user?.is_admin && (
                                <Link
                                    href={route('admin.notifications.settings')}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-[#6320EE] dark:text-violet-300 border border-slate-200 dark:border-violet-800/40 text-xs font-bold transition-all"
                                >
                                    <Settings className="w-4 h-4" />
                                    <span>إعدادات وقنوات الإشعارات</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        title="إجمالي الإشعارات"
                        value={stats?.total || 0}
                        icon={Bell}
                        color="brand"
                    />
                    <StatCard
                        title="تنبيهات غير مقروءة"
                        value={stats?.unread || 0}
                        icon={BellRing}
                        color="orange"
                    />
                    <StatCard
                        title="تنبيهات عاجلة"
                        value={stats?.urgent || 0}
                        icon={ShieldAlert}
                        color="rose"
                    />
                    <StatCard
                        title="إشعارات تمت قراءتها"
                        value={stats?.read || 0}
                        icon={CheckCheck}
                        color="blue"
                    />
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-[#0E1338] rounded-3xl p-5 border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#070A1E] rounded-2xl border border-slate-200 dark:border-violet-900/30 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => handleStatusChange('all')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    status === 'all'
                                        ? 'bg-[#6320EE] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                الكل ({stats?.total || 0})
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('unread')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                                    status === 'unread'
                                        ? 'bg-orange-500 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <span>غير المقروءة</span>
                                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                                    status === 'unread' ? 'bg-white/20 text-white' : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                                }`}>
                                    {stats?.unread || 0}
                                </span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleStatusChange('read')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                                    status === 'read'
                                        ? 'bg-[#6320EE] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                المقروءة ({stats?.read || 0})
                            </button>
                        </div>

                        {/* Search & Severity Filters */}
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {/* Severity Filter */}
                            <select
                                value={severity}
                                onChange={(e) => handleSeverityChange(e.target.value)}
                                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-violet-900/40 bg-slate-50 dark:bg-[#070A1E] text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
                            >
                                <option value="">كافة درجات الأهمية</option>
                                <option value="urgent">عاجل جداً</option>
                                <option value="warning">تحذير</option>
                                <option value="info">معلوماتي</option>
                                <option value="success">نجاح وعمليات</option>
                            </select>

                            {/* Search Box */}
                            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="بحث في عنوان الإشعار أو النص..."
                                    className="w-full pr-10 pl-8 py-2.5 rounded-xl border border-slate-200 dark:border-violet-900/40 bg-slate-50 dark:bg-[#070A1E] text-slate-800 dark:text-slate-200 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            handleFilter({ search: '' });
                                        }}
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </form>

                            {/* Reset button if active filter */}
                            {(search || severity || status !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-violet-900/40 text-xs font-bold transition-all shrink-0"
                                    title="إعادة ضبط الفلاتر"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {items.length > 0 ? (
                        items.map((item) => {
                            const badgeInfo = getSeverityBadge(item.severity);
                            return (
                                <div
                                    key={item.id}
                                    className={`relative bg-white dark:bg-[#0E1338] rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-violet-900/40 shadow-sm transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                                        !item.is_read
                                            ? `bg-violet-50/20 dark:bg-violet-950/15 ${badgeInfo.borderHighlight}`
                                            : 'opacity-90 hover:opacity-100'
                                    }`}
                                >
                                    {/* Left Details */}
                                    <div className="flex items-start gap-4 flex-1">
                                        {/* Severity Icon Box */}
                                        <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center border mt-0.5 ${
                                            item.severity === 'urgent'
                                                ? 'bg-orange-500/10 border-orange-500/30 text-orange-500 shadow-sm shadow-orange-500/20'
                                                : item.severity === 'warning'
                                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                                : item.severity === 'success'
                                                ? 'bg-[#6320EE]/10 border-violet-500/30 text-[#6320EE]'
                                                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                                        }`}>
                                            {badgeInfo.icon}
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-1.5 flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className={`text-sm ${
                                                    !item.is_read
                                                        ? 'font-black text-slate-900 dark:text-white'
                                                        : 'font-bold text-slate-800 dark:text-slate-200'
                                                }`}>
                                                    {item.title}
                                                </h3>

                                                {/* Status Badges */}
                                                {!item.is_read && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-sm shadow-orange-500/20">
                                                        جديد
                                                    </span>
                                                )}

                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeInfo.badgeClass}`}>
                                                    {badgeInfo.label}
                                                </span>

                                                {/* Delivery Channels Tags */}
                                                <div className="flex items-center gap-1">
                                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700/60" title="تم التسليم داخلياً">
                                                        <Monitor className="w-2.5 h-2.5 text-[#6320EE]" />
                                                        <span>داخلي</span>
                                                    </span>
                                                    {item.is_browser_delivered && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700/60" title="تم الإرسال لمتصفح المستخدم">
                                                            <Globe className="w-2.5 h-2.5 text-blue-500" />
                                                            <span>متصفح</span>
                                                        </span>
                                                    )}
                                                    {item.is_email_sent && (
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] bg-slate-100 dark:bg-slate-800/80 text-slate-500 border border-slate-200 dark:border-slate-700/60" title="تم الإرسال عبر البريد الإلكتروني">
                                                            <Mail className="w-2.5 h-2.5 text-orange-500" />
                                                            <span>إيميل</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                                                {item.message || item.body}
                                            </p>

                                            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span>{item.created_at_human || item.created_at}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-violet-900/20 shrink-0 self-end md:self-center">
                                        {item.action_url && (
                                            <a
                                                href={item.action_url}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                                            >
                                                <span>معاينة الإجراء</span>
                                                <ExternalLink className="w-3.5 h-3.5 rtl:rotate-180" />
                                            </a>
                                        )}

                                        {!item.is_read && (
                                            <button
                                                type="button"
                                                onClick={() => handleMarkAsRead(item.id)}
                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-violet-950/40 hover:bg-slate-200 dark:hover:bg-violet-900/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-violet-800/40 text-xs font-semibold transition-colors cursor-pointer"
                                                title="تحديد كمقروء"
                                            >
                                                <Check className="w-3.5 h-3.5 text-orange-500" />
                                                <span>تمت القراءة</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => confirmDelete(item)}
                                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                                            title="حذف هذا الإشعار"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="bg-white dark:bg-[#0E1338] rounded-3xl p-12 text-center border border-slate-200 dark:border-violet-900/40 shadow-sm">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-violet-950/40 border border-slate-200 dark:border-violet-900/40 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-4">
                                <Bell className="w-8 h-8 stroke-1" />
                            </div>
                            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                                لا توجد إشعارات مطابقة حالياً
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                                لم يتم العثور على أية إشعارات أو تنبيهات مطابقة لمعايير البحث والتصفية المحددة.
                            </p>
                            {(search || severity || status !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6320EE] text-white text-xs font-bold shadow-md shadow-violet-600/20"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    <span>إعادة ضبط الفلاتر</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {notifications && (
                    <Pagination
                        links={notifications.links}
                        from={notifications.from}
                        to={notifications.to}
                        total={notifications.total}
                    />
                )}
            </div>

            {/* Modal: Confirm Delete Single Notification */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setNotificationToDelete(null);
                }}
                onConfirm={executeDelete}
                title="تأكيد حذف الإشعار"
                message={`هل أنت متأكد من رغبتك في حذف الإشعار (${notificationToDelete?.title}) من سجلك؟`}
                confirmText="حذف الإشعار"
                cancelText="إلغاء التراجع"
                type="danger"
                isLoading={processingAction}
            />

            {/* Modal: Confirm Clear Read Notifications */}
            <ConfirmDialog
                isOpen={clearReadModalOpen}
                onClose={() => setClearReadModalOpen(false)}
                onConfirm={executeClearRead}
                title="مسح كافة الإشعارات المقروءة"
                message="هل أنت متأكد من رغبتك في مسح وتنظيف كافة الإشعارات المقروءة؟ هذا الإجراء نهائي ولا يمكن التراجع عنه."
                confirmText="مسح المقروءة الآن"
                cancelText="إلغاء"
                type="danger"
                isLoading={processingAction}
            />
        </AuthenticatedLayout>
    );
}
