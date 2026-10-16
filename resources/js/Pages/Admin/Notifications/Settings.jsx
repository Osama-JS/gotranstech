import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import Select2 from '@/Components/Select2';
import notificationSound from '@/Services/NotificationSound';
import browserNotification from '@/Services/BrowserNotification';
import { useTranslation } from '@/Utils/useTranslation';
import {
    Bell,
    Shield,
    Users,
    Building2,
    Send,
    Radio,
    Mail,
    Monitor,
    Volume2,
    VolumeX,
    ShieldAlert,
    AlertTriangle,
    CheckCircle2,
    Save,
    Sparkles,
    Filter,
    Check,
    X,
    HelpCircle,
    Info,
    RotateCcw,
} from 'lucide-react';

export default function NotificationSettings({ settings = [], roles = [], admins = [] }) {
    const { t, isAr } = useTranslation();
    const [activeTab, setActiveTab] = useState('admin'); // 'admin', 'portals', 'broadcast'
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [savingId, setSavingId] = useState(null);

    // Local state for all settings to allow real-time toggling before saving
    const [settingsState, setSettingsState] = useState(() => {
        const stateMap = {};
        settings.forEach((s) => {
            stateMap[s.id] = {
                is_active: Boolean(s.is_active),
                channels_in_app: Boolean(s.channels_in_app),
                channels_browser: Boolean(s.channels_browser),
                channels_email: Boolean(s.channels_email),
                severity: s.severity || 'info',
                target_roles: Array.isArray(s.target_roles) ? s.target_roles : [],
                target_user_ids: Array.isArray(s.target_user_ids) ? s.target_user_ids.map(Number) : [],
            };
        });
        return stateMap;
    });

    // Broadcast Form State
    const [broadcastForm, setBroadcastForm] = useState({
        target_audience: 'all_admins',
        title: '',
        message: '',
        severity: 'info',
        action_url: '',
        channels_in_app: true,
        channels_browser: true,
        channels_email: false,
    });
    const [broadcastSending, setBroadcastSending] = useState(false);

    // Helpers to update individual setting in local state
    const handleToggleChannel = (settingId, channel) => {
        setSettingsState((prev) => ({
            ...prev,
            [settingId]: {
                ...prev[settingId],
                [channel]: !prev[settingId][channel],
            },
        }));
    };

    const handleToggleActive = (settingId) => {
        setSettingsState((prev) => ({
            ...prev,
            [settingId]: {
                ...prev[settingId],
                is_active: !prev[settingId].is_active,
            },
        }));
    };

    const handleSeverityChange = (settingId, severity) => {
        setSettingsState((prev) => ({
            ...prev,
            [settingId]: {
                ...prev[settingId],
                severity,
            },
        }));
    };

    const handleToggleRole = (settingId, roleName) => {
        setSettingsState((prev) => {
            const currentRoles = prev[settingId].target_roles || [];
            const exists = currentRoles.includes(roleName);
            const nextRoles = exists
                ? currentRoles.filter((r) => r !== roleName)
                : [...currentRoles, roleName];
            return {
                ...prev,
                [settingId]: {
                    ...prev[settingId],
                    target_roles: nextRoles,
                },
            };
        });
    };

    const handleToggleAdminUser = (settingId, adminId) => {
        setSettingsState((prev) => {
            const currentAdmins = prev[settingId].target_user_ids || [];
            const exists = currentAdmins.includes(Number(adminId));
            const nextAdmins = exists
                ? currentAdmins.filter((id) => id !== Number(adminId))
                : [...currentAdmins, Number(adminId)];
            return {
                ...prev,
                [settingId]: {
                    ...prev[settingId],
                    target_user_ids: nextAdmins,
                },
            };
        });
    };

    // Save individual setting
    const handleSaveSetting = (settingId) => {
        const payload = settingsState[settingId];
        setSavingId(settingId);
        router.put(route('admin.notifications.settings.update', settingId), payload, {
            preserveScroll: true,
            onFinish: () => setSavingId(null),
        });
    };

    // Handle Direct Broadcast Submission
    const handleSendBroadcast = (e) => {
        e.preventDefault();
        setBroadcastSending(true);
        router.post(route('admin.notifications.broadcast'), broadcastForm, {
            preserveScroll: true,
            onSuccess: () => {
                setBroadcastForm({
                    target_audience: 'all_admins',
                    title: '',
                    message: '',
                    severity: 'info',
                    action_url: '',
                    channels_in_app: true,
                    channels_browser: true,
                    channels_email: false,
                });
            },
            onFinish: () => setBroadcastSending(false),
        });
    };

    // Filtered lists
    const adminSettings = settings.filter((s) => s.target_group === 'admin');
    const portalSettings = settings.filter((s) => s.target_group !== 'admin');

    const filteredAdminSettings = adminSettings.filter((s) => {
        if (categoryFilter === 'all') return true;
        return s.category === categoryFilter;
    });

    const filteredPortalSettings = portalSettings.filter((s) => {
        if (categoryFilter === 'all') return true;
        return s.target_group === categoryFilter;
    });

    // Counts
    const activeAdminCount = adminSettings.filter((s) => settingsState[s.id]?.is_active).length;
    const activePortalsCount = portalSettings.filter((s) => settingsState[s.id]?.is_active).length;
    const urgentCount = settings.filter((s) => settingsState[s.id]?.severity === 'urgent').length;

    // Severity styling options
    const severityOptions = [
        { value: 'info', label: t('admin.notifications.severity_info'), color: 'text-violet-400' },
        { value: 'success', label: t('admin.notifications.severity_success'), color: 'text-[#6320EE]' },
        { value: 'warning', label: t('admin.notifications.severity_warning'), color: 'text-orange-400' },
        { value: 'urgent', label: t('admin.notifications.severity_urgent'), color: 'text-orange-500 font-bold' },
    ];

    return (
        <AuthenticatedLayout title={t('admin.notifications.page_title')}>
            <Head title={t('admin.notifications.page_title')} />

            <div className="space-y-6">
                {/* Header */}
                <AdminPageHeader
                    title={t('admin.notifications.header_title')}
                    subtitle={t('admin.notifications.header_subtitle')}
                    icon={Bell}
                    iconColor="text-orange-400"
                    iconBg="bg-orange-500/15 border-orange-500/30"
                    breadcrumbs={[
                        { label: t('admin.nav.home'), href: route('admin.dashboard') },
                        { label: t('admin.nav.notifications') },
                    ]}
                    actions={
                        <div className="flex items-center gap-2">
                            {/* Audio Test Chime */}
                            <button
                                type="button"
                                onClick={() => notificationSound.playChime()}
                                className="px-3.5 py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title={t('admin.notifications.title_test_chime')}
                            >
                                <Volume2 className="w-3.5 h-3.5 text-violet-400" />
                                <span>{t('admin.notifications.btn_test_chime')}</span>
                            </button>

                            {/* Audio Test Urgent */}
                            <button
                                type="button"
                                onClick={() => notificationSound.playUrgentAlert()}
                                className="px-3.5 py-2 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                title={t('admin.notifications.title_test_urgent')}
                            >
                                <ShieldAlert className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                                <span>{t('admin.notifications.btn_test_urgent')}</span>
                            </button>
                        </div>
                    }
                />

                {/* KPI / Overview Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#6320EE]/10 border border-violet-500/20 text-[#6320EE] dark:text-violet-300 flex items-center justify-center font-bold">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.notifications.stat_total_events')}</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{settings.length}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.notifications.stat_active_admin')}</span>
                            <span className="text-xl font-black text-violet-600 dark:text-violet-300 font-mono">
                                {activeAdminCount} / {adminSettings.length}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.notifications.stat_active_portals')}</span>
                            <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-mono">
                                {activePortalsCount} / {portalSettings.length}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 flex items-center justify-center font-bold">
                            <ShieldAlert className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.notifications.stat_urgent')}</span>
                            <span className="text-xl font-black text-orange-500 font-mono">{urgentCount}</span>
                        </div>
                    </div>
                </div>

                {/* Primary Tabs Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-violet-900/40 pb-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => { setActiveTab('admin'); setCategoryFilter('all'); }}
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === 'admin'
                                    ? 'bg-[#6320EE] text-white shadow-lg shadow-violet-600/30'
                                    : 'bg-slate-100 dark:bg-violet-950/30 hover:bg-slate-200 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <Shield className="w-4 h-4" />
                            <span>{t('admin.notifications.tab_admin')}</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                                {adminSettings.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => { setActiveTab('portals'); setCategoryFilter('all'); }}
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === 'portals'
                                    ? 'bg-[#6320EE] text-white shadow-lg shadow-violet-600/30'
                                    : 'bg-slate-100 dark:bg-violet-950/30 hover:bg-slate-200 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <Users className="w-4 h-4" />
                            <span>{t('admin.notifications.tab_portals')}</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                                {portalSettings.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('broadcast')}
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                                activeTab === 'broadcast'
                                    ? 'bg-[#6320EE] text-white shadow-lg shadow-violet-600/30'
                                    : 'bg-slate-100 dark:bg-violet-950/30 hover:bg-slate-200 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <Radio className="w-4 h-4 text-orange-400" />
                            <span>{t('admin.notifications.tab_broadcast')}</span>
                        </button>
                    </div>

                    {/* Filter Category pills for Tab 1 & 2 */}
                    {activeTab === 'admin' && (
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                            <span className="text-xs text-slate-400 hidden lg:inline">{t('admin.notifications.label_category')}</span>
                            {[
                                { key: 'all', label: t('admin.notifications.cat_all') },
                                { key: 'tasks', label: t('admin.notifications.cat_tasks') },
                                { key: 'finance', label: t('admin.notifications.cat_finance') },
                                { key: 'compliance', label: t('admin.notifications.cat_compliance') },
                                { key: 'security', label: t('admin.notifications.cat_security') },
                            ].map((cat) => (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => setCategoryFilter(cat.key)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                        categoryFilter === cat.key
                                            ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
                                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {activeTab === 'portals' && (
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                            <span className="text-xs text-slate-400 hidden lg:inline">{t('admin.notifications.label_audience')}</span>
                            {[
                                { key: 'all', label: t('admin.notifications.aud_all') },
                                { key: 'investor', label: t('admin.notifications.aud_investors') },
                                { key: 'company', label: t('admin.notifications.aud_companies') },
                            ].map((aud) => (
                                <button
                                    key={aud.key}
                                    type="button"
                                    onClick={() => setCategoryFilter(aud.key)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                        categoryFilter === aud.key
                                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {aud.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* TAB 1: Admin Notification Rules */}
                {activeTab === 'admin' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-[#6320EE]/5 dark:bg-violet-950/20 border border-violet-500/20 flex items-start gap-3">
                            <Info className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
                            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                                    {t('admin.notifications.admin_rules_title')}
                                </span>
                                {t('admin.notifications.admin_rules_p1')} 
                                {t('admin.notifications.admin_rules_p2')}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {filteredAdminSettings.map((setting) => {
                                const st = settingsState[setting.id] || {};
                                const isSaving = savingId === setting.id;

                                return (
                                    <div
                                        key={setting.id}
                                        className={`rounded-2xl border transition-all p-5 ${
                                            st.is_active
                                                ? 'bg-white dark:bg-[#0B0F2A] border-slate-200 dark:border-violet-900/40 shadow-sm'
                                                : 'bg-slate-50 dark:bg-[#070A1E]/60 border-slate-200 dark:border-slate-800/60 opacity-60'
                                        }`}
                                    >
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-violet-900/30">
                                            {/* Event Title & Description */}
                                            <div className="flex items-start gap-3.5">
                                                <div className={`w-11 h-11 rounded-xl shrink-0 flex items-center justify-center border ${
                                                    st.severity === 'urgent'
                                                        ? 'bg-orange-500/15 border-orange-500/40 text-orange-500'
                                                        : st.severity === 'warning'
                                                        ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                                                        : 'bg-[#6320EE]/10 border-violet-500/20 text-[#6320EE] dark:text-violet-300'
                                                }`}>
                                                    {st.severity === 'urgent' ? (
                                                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                                                    ) : (
                                                        <Bell className="w-5 h-5" />
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                                            {setting.title_ar}
                                                        </h4>
                                                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-violet-950/40 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-violet-900/40">
                                                            {setting.event_key}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                            st.severity === 'urgent'
                                                                ? 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                                                                : 'bg-violet-500/10 text-violet-300 border-violet-500/20'
                                                        }`}>
                                                            {st.severity === 'urgent' ? t('admin.notifications.severity_urgent_badge') : t('admin.notifications.severity_normal_badge')}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
                                                        {setting.description_ar}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Active Switch & Save Button */}
                                            <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                                                {/* Active Toggle Switch */}
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        {st.is_active ? t('admin.notifications.status_active') : t('admin.notifications.status_inactive')}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleActive(setting.id)}
                                                        className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                                                            st.is_active ? 'bg-[#6320EE]' : 'bg-slate-300 dark:bg-slate-700'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                                                st.is_active ? 'translate-x-6' : 'translate-x-0'
                                                            }`}
                                                        />
                                                    </button>
                                                </label>

                                                {/* Save button */}
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => handleSaveSetting(setting.id)}
                                                    className="px-4 py-2 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold shadow-md shadow-violet-600/25 flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                    <span>{isSaving ? t('admin.notifications.saving_in_progress') : t('admin.notifications.btn_save')}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Configuration Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                                            {/* Channel Toggles */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                                    {t('admin.notifications.channels_title')}
                                                </label>
                                                <div className="flex flex-col gap-2">
                                                    {/* In-App */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleChannel(setting.id, 'channels_in_app')}
                                                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                            st.channels_in_app
                                                                ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                                                : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Monitor className="w-4 h-4" />
                                                            <span>{t('admin.notifications.channel_in_app_label')}</span>
                                                        </span>
                                                        {st.channels_in_app && <Check className="w-3.5 h-3.5" />}
                                                    </button>

                                                    {/* Browser */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleChannel(setting.id, 'channels_browser')}
                                                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                            st.channels_browser
                                                                ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                                                : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Radio className="w-4 h-4 text-orange-400" />
                                                            <span>{t('admin.notifications.channel_browser_label')}</span>
                                                        </span>
                                                        {st.channels_browser && <Check className="w-3.5 h-3.5" />}
                                                    </button>

                                                    {/* Email */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleChannel(setting.id, 'channels_email')}
                                                        className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                                                            st.channels_email
                                                                ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                                                : 'bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-400'
                                                        }`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4 text-orange-500" />
                                                            <span>{t('admin.notifications.channel_email_label')}</span>
                                                        </span>
                                                        {st.channels_email && <Check className="w-3.5 h-3.5" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Target Roles & Users (Select2) */}
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                        {t('admin.notifications.target_roles_title')}
                                                    </label>
                                                    <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                                                        {roles.length > 0 ? (
                                                            roles.map((r) => {
                                                                const isSelected = (st.target_roles || []).includes(r);
                                                                return (
                                                                    <button
                                                                        key={r}
                                                                        type="button"
                                                                        onClick={() => handleToggleRole(setting.id, r)}
                                                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                                                                            isSelected
                                                                                ? 'bg-[#6320EE] text-white border-violet-500'
                                                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-violet-500'
                                                                        }`}
                                                                    >
                                                                        {r}
                                                                    </button>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="text-[11px] text-slate-400">{t('admin.notifications.no_roles')}</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 mt-1 block">
                                                        {(st.target_roles || []).length === 0 ? t('admin.notifications.default_all_roles') : t('admin.notifications.specified_roles_only')}
                                                    </span>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                                        {t('admin.notifications.target_admins_title')}
                                                    </label>
                                                    <Select2
                                                        options={[
                                                            { value: '', label: t('admin.notifications.choose_admin_placeholder') },
                                                            ...admins.map((adm) => ({
                                                                value: adm.id,
                                                                label: `${adm.name} (${adm.email})`,
                                                                description: (st.target_user_ids || []).includes(adm.id) ? t('admin.notifications.admin_currently_selected') : t('admin.notifications.admin_click_to_select'),
                                                            })),
                                                        ]}
                                                        value=""
                                                        onChange={(val) => {
                                                            if (val) handleToggleAdminUser(setting.id, val);
                                                        }}
                                                        placeholder={t('admin.notifications.search_admin_placeholder')}
                                                    />

                                                    {/* Selected Admins Badges */}
                                                    {(st.target_user_ids || []).length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {st.target_user_ids.map((id) => {
                                                                const adm = admins.find((a) => a.id === id);
                                                                if (!adm) return null;
                                                                return (
                                                                    <span
                                                                        key={id}
                                                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-500/15 border border-violet-500/30 text-violet-300"
                                                                    >
                                                                        <span>{adm.name}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleToggleAdminUser(setting.id, id)}
                                                                            className="hover:text-red-400"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Severity & Alert Type */}
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                                                    {t('admin.notifications.severity_sound_title')}
                                                </label>
                                                <Select2
                                                    options={severityOptions}
                                                    value={st.severity}
                                                    onChange={(val) => handleSeverityChange(setting.id, val)}
                                                    placeholder={t('admin.notifications.choose_severity_placeholder')}
                                                />

                                                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed mt-2">
                                                    {st.severity === 'urgent' ? (
                                                        <span className="text-orange-500 font-bold flex items-center gap-1.5">
                                                            <ShieldAlert className="w-4 h-4 shrink-0" />
                                                            <span>{t('admin.notifications.severity_urgent_hint')}</span>
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            {t('admin.notifications.severity_normal_hint')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 2: Portals (Investors & Companies) Notification Rules */}
                {activeTab === 'portals' && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-orange-500/5 dark:bg-orange-950/20 border border-orange-500/20 flex items-start gap-3">
                            <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                                    {t('admin.notifications.portals_rules_title')}
                                </span>
                                {t('admin.notifications.portals_rules_desc')}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredPortalSettings.map((setting) => {
                                const st = settingsState[setting.id] || {};
                                const isSaving = savingId === setting.id;
                                const isInvestor = setting.target_group === 'investor';

                                return (
                                    <div
                                        key={setting.id}
                                        className={`rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                                            st.is_active
                                                ? 'bg-white dark:bg-[#0B0F2A] border-slate-200 dark:border-violet-900/40 shadow-sm'
                                                : 'bg-slate-50 dark:bg-[#070A1E]/60 border-slate-200 dark:border-slate-800/60 opacity-60'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                                        isInvestor
                                                            ? 'bg-violet-500/10 text-violet-300 border-violet-500/30'
                                                            : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                                                    }`}>
                                                        {isInvestor ? t('admin.notifications.badge_investor_portal') : t('admin.notifications.badge_company_portal')}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                        {setting.event_key}
                                                    </span>
                                                </div>

                                                {/* Active Toggle Switch */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(setting.id)}
                                                    className={`w-10 h-5 rounded-full transition-colors relative focus:outline-none shrink-0 ${
                                                        st.is_active ? 'bg-[#6320EE]' : 'bg-slate-300 dark:bg-slate-700'
                                                    }`}
                                                >
                                                    <span
                                                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                                                            st.is_active ? 'translate-x-5' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                                {setting.title_ar}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                                {setting.description_ar}
                                            </p>
                                        </div>

                                        {/* Channels & Action */}
                                        <div className="pt-3 border-t border-slate-100 dark:border-violet-900/30 space-y-3">
                                            <div className="grid grid-cols-3 gap-2">
                                                {/* In App */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleChannel(setting.id, 'channels_in_app')}
                                                    className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                                                        st.channels_in_app
                                                            ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    <Monitor className="w-3.5 h-3.5" />
                                                    <span>{t('admin.notifications.channel_in_app_short')}</span>
                                                </button>

                                                {/* Browser */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleChannel(setting.id, 'channels_browser')}
                                                    className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                                                        st.channels_browser
                                                            ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    <Radio className="w-3.5 h-3.5 text-orange-400" />
                                                    <span>{t('admin.notifications.channel_browser_short')}</span>
                                                </button>

                                                {/* Email */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleChannel(setting.id, 'channels_email')}
                                                    className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center justify-center gap-1 transition-colors ${
                                                        st.channels_email
                                                            ? 'bg-violet-600/15 border-violet-500/40 text-violet-300'
                                                            : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                                                    }`}
                                                >
                                                    <Mail className="w-3.5 h-3.5 text-orange-500" />
                                                    <span>{t('admin.notifications.channel_email_short')}</span>
                                                </button>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    disabled={isSaving}
                                                    onClick={() => handleSaveSetting(setting.id)}
                                                    className="w-full py-2 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold shadow-md shadow-violet-600/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Save className="w-3.5 h-3.5" />
                                                    <span>{isSaving ? t('admin.notifications.saving_in_progress') : t('admin.notifications.btn_save_changes')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* TAB 3: Direct Broadcast (Manual Notification) */}
                {activeTab === 'broadcast' && (
                    <div className="max-w-3xl mx-auto">
                        <div className="rounded-3xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 p-6 sm:p-8 shadow-xl">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-violet-900/30">
                                <div className="w-12 h-12 rounded-2xl bg-[#6320EE] text-white flex items-center justify-center font-bold shadow-lg shadow-violet-600/20">
                                    <Send className="w-6 h-6 rtl:rotate-180" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                        {t('admin.notifications.broadcast_title')}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {t('admin.notifications.broadcast_desc')}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSendBroadcast} className="space-y-5">
                                {/* Audience Selection */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                        {t('admin.notifications.field_target_audience')}
                                    </label>
                                    <Select2
                                        options={[
                                            { value: 'all_admins', label: t('admin.notifications.aud_opt_admins') },
                                            { value: 'all_investors', label: t('admin.notifications.aud_opt_investors') },
                                            { value: 'all_companies', label: t('admin.notifications.aud_opt_companies') },
                                            { value: 'everyone', label: t('admin.notifications.aud_opt_everyone') },
                                        ]}
                                        value={broadcastForm.target_audience}
                                        onChange={(val) => setBroadcastForm({ ...broadcastForm, target_audience: val })}
                                        placeholder={t('admin.notifications.ph_choose_audience')}
                                    />
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                        {t('admin.notifications.field_broadcast_title')}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={broadcastForm.title}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                                        placeholder={t('admin.notifications.ph_broadcast_title')}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                        {t('admin.notifications.field_broadcast_message')}
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={broadcastForm.message}
                                        onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                                        placeholder={t('admin.notifications.ph_broadcast_message')}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                                    />
                                </div>

                                {/* Severity & Action Url */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                            {t('admin.notifications.field_broadcast_severity')}
                                        </label>
                                        <Select2
                                            options={severityOptions}
                                            value={broadcastForm.severity}
                                            onChange={(val) => setBroadcastForm({ ...broadcastForm, severity: val })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                            {t('admin.notifications.field_action_url')}
                                        </label>
                                        <input
                                            type="text"
                                            value={broadcastForm.action_url}
                                            onChange={(e) => setBroadcastForm({ ...broadcastForm, action_url: e.target.value })}
                                            placeholder={t('admin.notifications.ph_action_url')}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-[#6320EE] focus:ring-1 focus:ring-[#6320EE]"
                                        />
                                    </div>
                                </div>

                                {/* Channel Checkboxes */}
                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-3">
                                        {t('admin.notifications.broadcast_channels_title')}
                                    </span>
                                    <div className="grid grid-cols-3 gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={broadcastForm.channels_in_app}
                                                onChange={(e) => setBroadcastForm({ ...broadcastForm, channels_in_app: e.target.checked })}
                                                className="w-4 h-4 rounded text-[#6320EE] focus:ring-[#6320EE]"
                                            />
                                            <span>{t('admin.notifications.channel_in_app_label')}</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={broadcastForm.channels_browser}
                                                onChange={(e) => setBroadcastForm({ ...broadcastForm, channels_browser: e.target.checked })}
                                                className="w-4 h-4 rounded text-[#6320EE] focus:ring-[#6320EE]"
                                            />
                                            <span>{t('admin.notifications.channel_browser_label')}</span>
                                        </label>

                                        <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                            <input
                                                type="checkbox"
                                                checked={broadcastForm.channels_email}
                                                onChange={(e) => setBroadcastForm({ ...broadcastForm, channels_email: e.target.checked })}
                                                className="w-4 h-4 rounded text-[#6320EE] focus:ring-[#6320EE]"
                                            />
                                            <span>{t('admin.notifications.channel_email_label')}</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={broadcastSending}
                                    className="w-full py-3.5 rounded-2xl bg-[#6320EE] hover:bg-[#5219cf] text-white font-extrabold text-sm shadow-xl shadow-violet-600/25 flex items-center justify-center gap-2 transition-all transform active:scale-98 disabled:opacity-50 cursor-pointer"
                                >
                                    <Send className="w-4 h-4 rtl:rotate-180" />
                                    <span>{broadcastSending ? t('admin.notifications.broadcasting_in_progress') : t('admin.notifications.btn_send_broadcast_now')}</span>
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
