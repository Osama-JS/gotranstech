import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import ConfirmDialog from '@/Components/ConfirmDialog';
import { useTranslation } from '@/Utils/i18n';
import notificationSound from '@/Services/NotificationSound';
import {
    Database,
    ShieldCheck,
    Cloud,
    HardDrive,
    Download,
    RotateCcw,
    Send,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    RefreshCw,
    Plus,
    Upload,
    Lock,
    Unlock,
    Key,
    Clock,
    FileArchive,
    Layers,
    Mail,
    Bot,
    Check,
    X,
    ExternalLink,
    Play,
    Info,
    Search,
    ChevronDown,
    Save,
    FileText,
    Copy,
    Server,
    ShieldAlert,
    Radio
} from 'lucide-react';

export default function BackupsIndex({ backups = [], storageStats = {}, config = {} }) {
    const { t, isAr } = useTranslation();
    const { auth } = usePage().props;
    const [activeTab, setActiveTab] = useState('list'); // 'list' | 'settings'
    const [searchQuery, setSearchQuery] = useState('');
    const [backupsList, setBackupsList] = useState(backups);
    const [stats, setStats] = useState(storageStats);
    const [refreshing, setRefreshing] = useState(false);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showRestoreModal, setShowRestoreModal] = useState(false);
    const [showDispatchModal, setShowDispatchModal] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);

    // Deletion Modal State
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [copiedHash, setCopiedHash] = useState(null);

    // Inline errors for modals
    const [createError, setCreateError] = useState(null);
    const [restoreError, setRestoreError] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // Create Backup Form State
    const [createForm, setCreateForm] = useState({
        type: 'full',
        encrypt: config.backup_default_encrypt ?? true,
        passphrase: '',
        destinations: {
            telegram: false,
            email: false,
            google_drive: false,
        },
        notes: '',
    });
    const [creatingBackup, setCreatingBackup] = useState(false);

    // Upload & Restore Form
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadPassphrase, setUploadPassphrase] = useState('');
    const [uploadConfirm, setUploadConfirm] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Verify Form
    const [verifyPassphrase, setVerifyPassphrase] = useState('');
    const [verifyResult, setVerifyResult] = useState(null);
    const [verifying, setVerifying] = useState(false);

    // Restore Form
    const [restorePassphrase, setRestorePassphrase] = useState('');
    const [restoreConfirm, setRestoreConfirm] = useState(false);
    const [restoring, setRestoring] = useState(false);

    // Dispatch Modal Form
    const [dispatchDest, setDispatchDest] = useState('telegram');
    const [dispatching, setDispatching] = useState(false);
    const [dispatchResult, setDispatchResult] = useState(null);

    // Cloud Settings State
    const [settingsForm, setSettingsForm] = useState({
        backup_auto_enabled: Boolean(config.backup_auto_enabled),
        backup_schedule_time: config.backup_schedule_time || '02:00',
        backup_max_retained: config.backup_max_retained || 15,
        backup_default_encrypt: Boolean(config.backup_default_encrypt),
        backup_master_password: config.backup_master_password || '',
        telegram_backup_enabled: Boolean(config.telegram_backup_enabled),
        telegram_backup_bot_token: config.telegram_backup_bot_token || '',
        telegram_backup_chat_id: config.telegram_backup_chat_id || '',
        email_backup_enabled: Boolean(config.email_backup_enabled),
        email_backup_recipients: config.email_backup_recipients || '',
        gdrive_backup_enabled: Boolean(config.gdrive_backup_enabled),
        gdrive_backup_webhook_url: config.gdrive_backup_webhook_url || '',
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [testingDest, setTestingDest] = useState(null); // 'telegram' | 'email' | 'google_drive'
    const [testResult, setTestResult] = useState({});

    // Live refresh backups list
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const res = await axios.get(route('admin.backups.list'));
            if (res.data.success) {
                setBackupsList(res.data.backups || []);
                setStats(res.data.storage || {});
                notificationSound.playChime();
            }
        } catch (err) {
            console.error('Failed to refresh backups:', err);
        } finally {
            setRefreshing(false);
        }
    };

    // Filter backups by search query
    const filteredBackups = backupsList.filter((b) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            b.filename.toLowerCase().includes(q) ||
            (b.notes && b.notes.toLowerCase().includes(q)) ||
            (b.created_at && b.created_at.includes(q))
        );
    });

    // Handle Create Backup
    const handleCreateBackup = async (e) => {
        e.preventDefault();
        setCreatingBackup(true);
        setCreateError(null);
        try {
            const res = await axios.post(route('admin.backups.create'), createForm);
            if (res.data.success) {
                setShowCreateModal(false);
                setCreateForm({
                    type: 'full',
                    encrypt: config.backup_default_encrypt ?? true,
                    passphrase: '',
                    destinations: { telegram: false, email: false, google_drive: false },
                    notes: '',
                });
                await handleRefresh();
            }
        } catch (err) {
            setCreateError(err.response?.data?.message || t('admin.backups.err_create'));
        } finally {
            setCreatingBackup(false);
        }
    };

    // Handle Verify Integrity
    const handleVerify = async (e) => {
        if (e) e.preventDefault();
        if (!selectedBackup) return;
        setVerifying(true);
        setVerifyResult(null);
        try {
            const res = await axios.post(route('admin.backups.verify', selectedBackup.filename), {
                passphrase: verifyPassphrase,
            });
            setVerifyResult(res.data.data);
            if (res.data.success) {
                notificationSound.playChime();
            }
        } catch (err) {
            setVerifyResult(err.response?.data?.data || { valid: false, message: err.response?.data?.message || t('admin.backups.err_verify') });
        } finally {
            setVerifying(false);
        }
    };

    // Handle Restore
    const handleRestore = async (e) => {
        e.preventDefault();
        if (!selectedBackup || !restoreConfirm) return;
        setRestoring(true);
        setRestoreError(null);
        try {
            const res = await axios.post(route('admin.backups.restore'), {
                filename: selectedBackup.filename,
                passphrase: restorePassphrase,
                confirm: true,
            });
            if (res.data.success) {
                notificationSound.playUrgentAlert();
                setShowRestoreModal(false);
                setRestorePassphrase('');
                setRestoreConfirm(false);
                window.location.reload();
            }
        } catch (err) {
            setRestoreError(err.response?.data?.message || t('admin.backups.err_restore'));
        } finally {
            setRestoring(false);
        }
    };

    // Handle Upload & Restore
    const handleUploadRestore = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadConfirm) return;
        setUploading(true);
        setUploadError(null);
        const data = new FormData();
        data.append('backup_file', uploadFile);
        data.append('passphrase', uploadPassphrase);
        data.append('confirm', '1');

        try {
            const res = await axios.post(route('admin.backups.upload-restore'), data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                notificationSound.playUrgentAlert();
                setShowUploadModal(false);
                window.location.reload();
            }
        } catch (err) {
            setUploadError(err.response?.data?.message || t('admin.backups.err_upload'));
        } finally {
            setUploading(false);
        }
    };

    // Handle Dispatch
    const handleDispatch = async (e) => {
        e.preventDefault();
        if (!selectedBackup) return;
        setDispatching(true);
        setDispatchResult(null);
        try {
            const res = await axios.post(route('admin.backups.dispatch', selectedBackup.filename), {
                destination: dispatchDest,
            });
            setDispatchResult(res.data);
            if (res.data.success) {
                notificationSound.playChime();
            }
        } catch (err) {
            setDispatchResult(err.response?.data || { success: false, message: t('admin.backups.err_dispatch') });
        } finally {
            setDispatching(false);
        }
    };

    // Confirm Delete Backup via Modal
    const confirmDelete = () => {
        if (!deleteTarget) return;
        setDeleting(true);
        router.delete(route('admin.backups.destroy', deleteTarget.filename), {
            preserveScroll: true,
            onSuccess: () => {
                setBackupsList((prev) => prev.filter((b) => b.filename !== deleteTarget.filename));
                setDeleteTarget(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    // Save Cloud & Automation Settings
    const handleSaveSettings = (e) => {
        e.preventDefault();
        setSavingSettings(true);
        router.post(route('admin.backups.config'), settingsForm, {
            preserveScroll: true,
            onFinish: () => setSavingSettings(false),
        });
    };

    // Test Destination
    const handleTestDestination = async (type) => {
        setTestingDest(type);
        setTestResult((prev) => ({ ...prev, [type]: null }));
        try {
            const credentials = {
                telegram_bot_token: settingsForm.telegram_backup_bot_token,
                telegram_chat_id: settingsForm.telegram_backup_chat_id,
                email_recipients: settingsForm.email_backup_recipients,
                google_drive_webhook_url: settingsForm.gdrive_backup_webhook_url,
            };
            const res = await axios.post(route('admin.backups.test-destination'), {
                type,
                credentials,
            });
            setTestResult((prev) => ({ ...prev, [type]: res.data }));
            if (res.data.success) {
                notificationSound.playChime();
            }
        } catch (err) {
            setTestResult((prev) => ({
                ...prev,
                [type]: err.response?.data || { success: false, message: t('admin.backups.err_test') },
            }));
        } finally {
            setTestingDest(null);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedHash(text);
        setTimeout(() => setCopiedHash(null), 2500);
    };

    return (
        <AuthenticatedLayout title={t('admin.backups.page_title')}>
            <Head title={t('admin.backups.page_title')} />

            <div className="space-y-6">
                {/* Header */}
                <AdminPageHeader
                    title={t('admin.backups.header_title')}
                    subtitle={t('admin.backups.header_subtitle')}
                    icon={Database}
                    iconColor="text-orange-400"
                    iconBg="bg-orange-500/15 border-orange-500/30"
                    breadcrumbs={[
                        { label: t('admin.nav.home'), href: route('admin.dashboard') },
                        { label: t('admin.nav.backups') },
                    ]}
                    actions={
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                title={t('admin.backups.btn_refresh')}
                            >
                                <RefreshCw className={`w-4 h-4 text-orange-500 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowUploadModal(true)}
                                className="px-3.5 py-2.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/30 text-violet-700 dark:text-violet-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Upload className="w-4 h-4 text-violet-500" />
                                <span>{t('admin.backups.btn_upload_restore')}</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2.5 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-extrabold shadow-lg shadow-violet-600/25 transition-all flex items-center gap-2 cursor-pointer transform active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span>{t('admin.backups.btn_create_backup_now')}</span>
                            </button>
                        </div>
                    }
                />

                {/* Storage & Disaster Recovery Overview KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#6320EE]/10 border border-violet-500/20 text-[#6320EE] dark:text-violet-300 flex items-center justify-center font-bold">
                            <FileArchive className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.backups.kpi_retained_backups')}</span>
                            <span className="text-xl font-black text-slate-900 dark:text-white font-mono">{stats.total_backups_count || 0}</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                            <HardDrive className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.backups.kpi_total_archive_size')}</span>
                            <span className="text-xl font-black text-violet-600 dark:text-violet-300 font-mono">
                                {stats.total_storage_human || '0 B'}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                            <Server className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.backups.kpi_free_disk_space')}</span>
                            <span className="text-xl font-black text-orange-600 dark:text-orange-400 font-mono">
                                {stats.free_disk_human || 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 shadow-sm flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 flex items-center justify-center font-bold">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">{t('admin.backups.kpi_encryption_standard')}</span>
                            <span className="text-sm font-extrabold text-orange-500 font-mono block mt-1">
                                AES-256 + HMAC
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-violet-900/40 pb-3">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => setActiveTab('list')}
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'list'
                                    ? 'bg-[#6320EE] text-white shadow-lg shadow-violet-600/30'
                                    : 'bg-slate-100 dark:bg-violet-950/30 hover:bg-slate-200 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <Database className="w-4 h-4" />
                            <span>{t('admin.backups.tab_repository')}</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                                {backupsList.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('settings')}
                            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                                activeTab === 'settings'
                                    ? 'bg-[#6320EE] text-white shadow-lg shadow-violet-600/30'
                                    : 'bg-slate-100 dark:bg-violet-950/30 hover:bg-slate-200 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            <Cloud className="w-4 h-4 text-orange-400" />
                            <span>{t('admin.backups.tab_cloud_automation')}</span>
                        </button>
                    </div>

                    {activeTab === 'list' && (
                        <div className="relative w-full sm:w-72">
                            <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5 pointer-events-none" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('admin.backups.search_placeholder')}
                                className="w-full ps-9 pe-3 py-1.5 bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#6320EE]"
                            />
                        </div>
                    )}
                </div>

                {/* TAB 1: Backups Repository List */}
                {activeTab === 'list' && (
                    <div className="space-y-4">
                        {filteredBackups.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {filteredBackups.map((b) => (
                                    <div
                                        key={b.filename}
                                        className="rounded-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 p-5 shadow-sm hover:border-violet-500/40 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                    >
                                        {/* File Info */}
                                        <div className="flex items-start gap-3.5 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-[#6320EE] dark:text-violet-300 flex items-center justify-center shrink-0">
                                                <FileArchive className="w-6 h-6" />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-mono truncate">
                                                        {b.filename}
                                                    </h4>

                                                    {b.is_encrypted ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
                                                            <Lock className="w-3 h-3" />
                                                            <span>{t('admin.backups.badge_encrypted')}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                                            <Unlock className="w-3 h-3" />
                                                            <span>{t('admin.backups.badge_unencrypted')}</span>
                                                        </span>
                                                    )}

                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-violet-950/40 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-violet-900/40">
                                                        {b.includes_files ? t('admin.backups.type_db_and_files') : t('admin.backups.type_db_only')}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                                    <span className="flex items-center gap-1 font-mono">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{b.created_at}</span>
                                                    </span>

                                                    <span className="font-bold text-violet-600 dark:text-violet-300 font-mono">
                                                        {b.size_human}
                                                    </span>

                                                    {b.db_tables_count !== null && (
                                                        <span className="text-[11px] text-slate-400">
                                                            {t('admin.backups.info_tables_records', { tables: b.db_tables_count, records: b.db_records_count?.toLocaleString(isAr ? 'ar-SA' : 'en-US') })}
                                                        </span>
                                                    )}

                                                    {b.notes && (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            "{b.notes}"
                                                        </span>
                                                    )}
                                                </div>

                                                {/* SHA-256 Signature */}
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-[10px] text-slate-400 font-mono">SHA256:</span>
                                                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">
                                                        {b.sha256}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(b.sha256)}
                                                        className="text-slate-400 hover:text-orange-500 p-0.5 flex items-center gap-1"
                                                        title={t('admin.backups.btn_copy_hash')}
                                                    >
                                                        {copiedHash === b.sha256 ? (
                                                            <>
                                                                <Check className="w-3 h-3 text-violet-400" />
                                                                <span className="text-[10px] text-violet-400 font-bold">{t('admin.backups.hash_copied')}</span>
                                                            </>
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                                            {/* Download */}
                                            <a
                                                href={route('admin.backups.download', b.filename)}
                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                title={t('admin.backups.btn_download')}
                                            >
                                                <Download className="w-4 h-4 text-violet-400" />
                                                <span className="hidden sm:inline">{t('admin.backups.action_download')}</span>
                                            </a>

                                            {/* Verify */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedBackup(b);
                                                    setVerifyResult(null);
                                                    setVerifyPassphrase('');
                                                    setShowVerifyModal(true);
                                                }}
                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                title={t('admin.backups.btn_verify')}
                                            >
                                                <ShieldCheck className="w-4 h-4 text-orange-400" />
                                                <span className="hidden sm:inline">{t('admin.backups.action_verify')}</span>
                                            </button>

                                            {/* Dispatch */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedBackup(b);
                                                    setDispatchResult(null);
                                                    setShowDispatchModal(true);
                                                }}
                                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                title={t('admin.backups.btn_dispatch')}
                                            >
                                                <Send className="w-4 h-4 text-[#6320EE] rtl:rotate-180" />
                                                <span className="hidden sm:inline">{t('admin.backups.action_dispatch')}</span>
                                            </button>

                                            {/* Restore */}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedBackup(b);
                                                    setRestorePassphrase('');
                                                    setRestoreConfirm(false);
                                                    setShowRestoreModal(true);
                                                }}
                                                className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                                                title={t('admin.backups.btn_restore')}
                                            >
                                                <RotateCcw className="w-4 h-4 text-orange-500" />
                                                <span className="hidden sm:inline">{t('admin.backups.action_restore')}</span>
                                            </button>

                                            {/* Delete */}
                                            <button
                                                type="button"
                                                onClick={() => setDeleteTarget(b)}
                                                className="p-2 rounded-xl hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-slate-400 hover:text-rose-500 text-xs transition-colors cursor-pointer"
                                                title={t('admin.backups.btn_delete')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/30 p-8">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-violet-950/40 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-violet-900/40">
                                    <Database className="w-8 h-8 stroke-1" />
                                </div>
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                                    {t('admin.backups.empty_search_title')}
                                </h4>
                                <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                                    {t('admin.backups.empty_search_desc')}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-5 py-2.5 rounded-xl bg-[#6320EE] text-white text-xs font-bold shadow-lg shadow-violet-600/30"
                                >
                                    {t('admin.backups.modal_create_title')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: Cloud & Automation Settings */}
                {activeTab === 'settings' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                            {/* General & Scheduler Section */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-5">
                                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-violet-900/30">
                                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center font-bold">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                                            {t('admin.backups.card_schedule_title')}
                                        </h3>
                                        <p className="text-xs text-slate-400">
                                            {t('admin.backups.card_schedule_desc')}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    {/* Enable Auto */}
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {t('admin.backups.field_auto_enabled')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSettingsForm({ ...settingsForm, backup_auto_enabled: !settingsForm.backup_auto_enabled })}
                                            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                                settingsForm.backup_auto_enabled ? 'bg-[#6320EE]' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                                    settingsForm.backup_auto_enabled ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {/* Schedule Time */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                            {t('admin.backups.field_schedule_time')}
                                        </label>
                                        <input
                                            type="time"
                                            value={settingsForm.backup_schedule_time}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, backup_schedule_time: e.target.value })}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#6320EE]"
                                        />
                                    </div>

                                    {/* Retention Count */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                            {t('admin.backups.field_max_retained')}
                                        </label>
                                        <input
                                            type="number"
                                            min="3"
                                            max="100"
                                            value={settingsForm.backup_max_retained}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, backup_max_retained: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#6320EE]"
                                        />
                                    </div>
                                </div>

                                {/* Master Encryption Key */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-violet-900/30">
                                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40">
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                            {t('admin.backups.field_default_encrypt')}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSettingsForm({ ...settingsForm, backup_default_encrypt: !settingsForm.backup_default_encrypt })}
                                            className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                                settingsForm.backup_default_encrypt ? 'bg-[#6320EE]' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                                    settingsForm.backup_default_encrypt ? 'translate-x-5' : 'translate-x-0'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                            {t('admin.backups.field_master_passphrase')}
                                        </label>
                                        <input
                                            type="password"
                                            value={settingsForm.backup_master_password}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, backup_master_password: e.target.value })}
                                            placeholder={t('admin.backups.ph_master_passphrase')}
                                            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#6320EE]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Telegram Bot Destination */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {t('admin.backups.card_telegram_title')}
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                {t('admin.backups.card_telegram_desc')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSettingsForm({ ...settingsForm, telegram_backup_enabled: !settingsForm.telegram_backup_enabled })}
                                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                            settingsForm.telegram_backup_enabled ? 'bg-[#6320EE]' : 'bg-slate-300 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                                settingsForm.telegram_backup_enabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            {t('admin.backups.field_telegram_token')}
                                        </label>
                                        <input
                                            type="text"
                                            value={settingsForm.telegram_backup_bot_token}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, telegram_backup_bot_token: e.target.value })}
                                            placeholder="123456789:ABCdefGhIJKlmNoPQRstuVWXyz..."
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#6320EE]"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                            {t('admin.backups.field_telegram_chat_id')}
                                        </label>
                                        <input
                                            type="text"
                                            value={settingsForm.telegram_backup_chat_id}
                                            onChange={(e) => setSettingsForm({ ...settingsForm, telegram_backup_chat_id: e.target.value })}
                                            placeholder={t('admin.backups.ph_telegram_chat_id')}
                                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#6320EE]"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        disabled={testingDest === 'telegram'}
                                        onClick={() => handleTestDestination('telegram')}
                                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Radio className="w-3.5 h-3.5 text-sky-400" />
                                        <span>{testingDest === 'telegram' ? t('admin.backups.testing_in_progress') : t('admin.backups.btn_test_telegram')}</span>
                                    </button>

                                    {testResult.telegram && (
                                        <span className={`text-xs font-bold ${testResult.telegram.success ? 'text-violet-400' : 'text-red-400'}`}>
                                            {testResult.telegram.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Email Destination */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {t('admin.backups.card_email_title')}
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                {t('admin.backups.card_email_desc')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSettingsForm({ ...settingsForm, email_backup_enabled: !settingsForm.email_backup_enabled })}
                                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                            settingsForm.email_backup_enabled ? 'bg-[#6320EE]' : 'bg-slate-300 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                                settingsForm.email_backup_enabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        {t('admin.backups.field_email_recipients')}
                                    </label>
                                    <input
                                        type="text"
                                        value={settingsForm.email_backup_recipients}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, email_backup_recipients: e.target.value })}
                                        placeholder="backup@gotranstech.com, security@gotranstech.com"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#6320EE]"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        disabled={testingDest === 'email'}
                                        onClick={() => handleTestDestination('email')}
                                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Mail className="w-3.5 h-3.5 text-orange-400" />
                                        <span>{testingDest === 'email' ? t('admin.backups.testing_in_progress') : t('admin.backups.btn_test_email')}</span>
                                    </button>

                                    {testResult.email && (
                                        <span className={`text-xs font-bold ${testResult.email.success ? 'text-violet-400' : 'text-red-400'}`}>
                                            {testResult.email.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Google Drive Webhook Destination */}
                            <div className="p-6 rounded-3xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-4">
                                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-[#6320EE]/10 border border-violet-500/20 text-[#6320EE] dark:text-violet-300 flex items-center justify-center font-bold">
                                            <Cloud className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                                {t('admin.backups.card_gdrive_title')}
                                            </h3>
                                            <p className="text-xs text-slate-400">
                                                {t('admin.backups.card_gdrive_desc')}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSettingsForm({ ...settingsForm, gdrive_backup_enabled: !settingsForm.gdrive_backup_enabled })}
                                        className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                                            settingsForm.gdrive_backup_enabled ? 'bg-[#6320EE]' : 'bg-slate-300 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                                                settingsForm.gdrive_backup_enabled ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                        />
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        {t('admin.backups.field_gdrive_url')}
                                    </label>
                                    <input
                                        type="url"
                                        value={settingsForm.gdrive_backup_webhook_url}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, gdrive_backup_webhook_url: e.target.value })}
                                        placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#6320EE]"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <button
                                        type="button"
                                        disabled={testingDest === 'google_drive'}
                                        onClick={() => handleTestDestination('google_drive')}
                                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/50 border border-slate-200 dark:border-violet-800/40 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <Cloud className="w-3.5 h-3.5 text-violet-400" />
                                        <span>{testingDest === 'google_drive' ? t('admin.backups.testing_in_progress') : t('admin.backups.btn_test_gdrive')}</span>
                                    </button>

                                    {testResult.google_drive && (
                                        <span className={`text-xs font-bold ${testResult.google_drive.success ? 'text-violet-400' : 'text-red-400'}`}>
                                            {testResult.google_drive.message}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Submit Save Button */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={savingSettings}
                                    className="px-6 py-3 rounded-2xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{savingSettings ? t('admin.backups.saving_in_progress') : t('admin.backups.btn_save_config')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* ======================================================== */}
            {/* MODAL 1: Create Backup Modal */}
            {/* ======================================================== */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => !creatingBackup && setShowCreateModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-800/50 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-violet-900/30 mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 flex items-center justify-center font-bold">
                                    <Database className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {t('admin.backups.modal_create_title')}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                disabled={creatingBackup}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBackup} className="space-y-4">
                            {/* Type */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                    {t('admin.backups.field_backup_scope')}
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { val: 'full', label: t('admin.backups.scope_full') },
                                        { val: 'db_only', label: t('admin.backups.scope_db') },
                                        { val: 'files_only', label: t('admin.backups.scope_files') },
                                    ].map((t) => (
                                        <button
                                            key={t.val}
                                            type="button"
                                            onClick={() => setCreateForm({ ...createForm, type: t.val })}
                                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                                                createForm.type === t.val
                                                    ? 'bg-[#6320EE] text-white border-violet-500 shadow-md shadow-violet-600/30'
                                                    : 'bg-slate-50 dark:bg-[#070A1E] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-violet-900/40 hover:border-violet-500/50'
                                            }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Encryption Checkbox */}
                            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 space-y-2.5">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Lock className="w-4 h-4 text-orange-500" />
                                        <span>{t('admin.backups.field_encrypt_check')}</span>
                                    </span>
                                    <input
                                        type="checkbox"
                                        checked={createForm.encrypt}
                                        onChange={(e) => setCreateForm({ ...createForm, encrypt: e.target.checked })}
                                        className="w-4 h-4 rounded text-[#6320EE] focus:ring-[#6320EE]"
                                    />
                                </label>

                                {createForm.encrypt && (
                                    <input
                                        type="password"
                                        value={createForm.passphrase}
                                        onChange={(e) => setCreateForm({ ...createForm, passphrase: e.target.value })}
                                        placeholder={t('admin.backups.ph_custom_pass')}
                                        className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-violet-900/60 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#6320EE]"
                                    />
                                )}
                            </div>

                            {/* Cloud Destinations */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                    {t('admin.backups.field_instant_dispatch')}
                                </label>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={createForm.destinations.telegram}
                                            onChange={(e) => setCreateForm({
                                                ...createForm,
                                                destinations: { ...createForm.destinations, telegram: e.target.checked },
                                            })}
                                            className="w-3.5 h-3.5 rounded text-[#6320EE]"
                                        />
                                        <span>{t('admin.backups.dest_telegram')}</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={createForm.destinations.email}
                                            onChange={(e) => setCreateForm({
                                                ...createForm,
                                                destinations: { ...createForm.destinations, email: e.target.checked },
                                            })}
                                            className="w-3.5 h-3.5 rounded text-[#6320EE]"
                                        />
                                        <span>{t('admin.backups.dest_email')}</span>
                                    </label>

                                    <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={createForm.destinations.google_drive}
                                            onChange={(e) => setCreateForm({
                                                ...createForm,
                                                destinations: { ...createForm.destinations, google_drive: e.target.checked },
                                            })}
                                            className="w-3.5 h-3.5 rounded text-[#6320EE]"
                                        />
                                        <span>Google Drive</span>
                                    </label>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                    {t('admin.backups.field_notes')}
                                </label>
                                <input
                                    type="text"
                                    value={createForm.notes}
                                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                                    placeholder={t('admin.backups.ph_notes')}
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#6320EE]"
                                />
                            </div>

                            {createError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold">
                                    {createError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={creatingBackup}
                                className="w-full py-3.5 rounded-2xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-violet-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                            >
                                <Database className="w-4 h-4" />
                                <span>{creatingBackup ? t('admin.backups.creating_backup_in_progress') : t('admin.backups.btn_start_backup')}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 2: Verify Integrity Modal */}
            {/* ======================================================== */}
            {showVerifyModal && selectedBackup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowVerifyModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-800/50 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-900/30 mb-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-orange-400" />
                                <span>{t('admin.backups.modal_verify_title')}</span>
                            </h3>
                            <button type="button" onClick={() => setShowVerifyModal(false)}>
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 text-xs font-mono space-y-1">
                                <div className="text-slate-500 truncate">{t('admin.backups.info_file')} <span className="text-slate-900 dark:text-white font-bold">{selectedBackup.filename}</span></div>
                                <div className="text-slate-500">{t('admin.backups.info_size')} <span className="text-violet-400 font-bold">{selectedBackup.size_human}</span></div>
                                <div className="text-slate-500 truncate">{t('admin.backups.info_sha')} <span className="text-slate-400">{selectedBackup.sha256}</span></div>
                            </div>

                            {selectedBackup.is_encrypted && (
                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        {t('admin.backups.field_decrypt_pass_verify')}
                                    </label>
                                    <input
                                        type="password"
                                        value={verifyPassphrase}
                                        onChange={(e) => setVerifyPassphrase(e.target.value)}
                                        placeholder={t('admin.backups.ph_default_pass')}
                                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#6320EE]"
                                    />
                                </div>
                            )}

                            <button
                                type="button"
                                disabled={verifying}
                                onClick={handleVerify}
                                className="w-full py-2.5 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>{verifying ? t('admin.backups.verifying_in_progress') : t('admin.backups.btn_start_verify')}</span>
                            </button>

                            {verifyResult && (
                                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                                    verifyResult.valid
                                        ? 'bg-violet-600/10 border-violet-500/30 text-violet-300'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                    <div className="font-bold flex items-center gap-1.5 mb-1">
                                        {verifyResult.valid ? <CheckCircle2 className="w-4 h-4 text-violet-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                                        <span>{verifyResult.valid ? t('admin.backups.verify_success') : t('admin.backups.verify_failed')}</span>
                                    </div>
                                    <p>{verifyResult.message}</p>
                                    {verifyResult.manifest && (
                                        <div className="mt-2 pt-2 border-t border-violet-500/20 text-[11px] font-mono">
                                            <div>{t('admin.backups.info_app')} {verifyResult.manifest.app_name}</div>
                                            <div>{t('admin.backups.info_tables')} {verifyResult.manifest.db_tables_count}</div>
                                            <div>{t('admin.backups.info_records')} {verifyResult.manifest.db_records_count}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 3: Restore Backup Modal */}
            {/* ======================================================== */}
            {showRestoreModal && selectedBackup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => !restoring && setShowRestoreModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#0B0F2A] border-2 border-orange-500 rounded-3xl shadow-[0_0_50px_rgba(255,107,0,0.3)] p-6 sm:p-8 z-10 animate-in zoom-in-95">
                        <div className="flex items-start gap-3.5 mb-5">
                            <div className="w-12 h-12 rounded-2xl bg-orange-500/15 border border-orange-500/40 text-orange-500 flex items-center justify-center shrink-0">
                                <ShieldAlert className="w-7 h-7 animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white">
                                    {t('admin.backups.warn_critical_restore_title')}
                                </h3>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    {t('admin.backups.warn_critical_restore_msg')}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleRestore} className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-400 leading-relaxed">
                                <span className="font-bold block mb-1">{t('admin.backups.safety_note_title')}</span>
                                {t('admin.backups.safety_note_desc')}
                            </div>

                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 text-xs font-mono">
                                <span className="text-slate-500">{t('admin.backups.info_file_to_restore')}</span>
                                <span className="text-slate-900 dark:text-white font-bold">{selectedBackup.filename}</span>
                            </div>

                            {selectedBackup.is_encrypted && (
                                <div>
                                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                        {t('admin.backups.field_decrypt_pass')}
                                    </label>
                                    <input
                                        type="password"
                                        value={restorePassphrase}
                                        onChange={(e) => setRestorePassphrase(e.target.value)}
                                        placeholder={t('admin.backups.ph_enter_pass')}
                                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#6320EE]"
                                    />
                                </div>
                            )}

                            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    required
                                    checked={restoreConfirm}
                                    onChange={(e) => setRestoreConfirm(e.target.checked)}
                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 mt-0.5"
                                />
                                <span className="text-xs text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                                    {t('admin.backups.chk_confirm_restore')}
                                </span>
                            </label>

                            {restoreError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold">
                                    {restoreError}
                                </div>
                            )}

                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRestoreModal(false)}
                                    disabled={restoring}
                                    className="w-1/2 py-3 rounded-xl border border-slate-300 dark:border-violet-900/60 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-violet-950/40 transition-colors"
                                >
                                    {t('admin.backups.btn_cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={!restoreConfirm || restoring}
                                    className="w-1/2 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-lg shadow-orange-500/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    <span>{restoring ? t('admin.backups.restoring_in_progress') : t('admin.backups.btn_confirm_restore_now')}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 4: Dispatch Modal */}
            {/* ======================================================== */}
            {showDispatchModal && selectedBackup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => !dispatching && setShowDispatchModal(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-800/50 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-900/30 mb-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Send className="w-4 h-4 text-[#6320EE] rtl:rotate-180" />
                                <span>{t('admin.backups.modal_dispatch_title')}</span>
                            </h3>
                            <button type="button" onClick={() => setShowDispatchModal(false)}>
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleDispatch} className="space-y-4">
                            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 text-xs font-mono truncate">
                                {t('admin.backups.info_file')} <span className="text-slate-900 dark:text-white font-bold">{selectedBackup.filename}</span>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                    {t('admin.backups.choose_dispatch_dest')}
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { val: 'telegram', label: t('admin.backups.dest_telegram_label'), icon: Bot },
                                        { val: 'email', label: t('admin.backups.dest_email_label'), icon: Mail },
                                        { val: 'google_drive', label: 'Google Drive Webhook', icon: Cloud },
                                    ].map((d) => {
                                        const Icon = d.icon;
                                        return (
                                            <button
                                                key={d.val}
                                                type="button"
                                                onClick={() => setDispatchDest(d.val)}
                                                className={`w-full p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                                                    dispatchDest === d.val
                                                        ? 'bg-violet-600/15 border-violet-500/50 text-[#6320EE] dark:text-violet-300 shadow-sm'
                                                        : 'bg-slate-50 dark:bg-[#070A1E] border-slate-200 dark:border-violet-900/30 text-slate-700 dark:text-slate-300'
                                                }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4 text-orange-400" />
                                                    <span>{d.label}</span>
                                                </span>
                                                {dispatchDest === d.val && <Check className="w-4 h-4 text-violet-400" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={dispatching}
                                className="w-full py-3 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-extrabold shadow-lg shadow-violet-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                            >
                                <Send className="w-4 h-4 rtl:rotate-180" />
                                <span>{dispatching ? t('admin.backups.dispatching_in_progress') : t('admin.backups.btn_send_backup_now')}</span>
                            </button>

                            {dispatchResult && (
                                <div className={`p-3.5 rounded-xl border text-xs ${
                                    dispatchResult.success
                                        ? 'bg-violet-600/10 border-violet-500/30 text-violet-300'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                    {dispatchResult.message}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* ======================================================== */}
            {/* MODAL 5: Upload & Restore Modal */}
            {/* ======================================================== */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={() => !uploading && setShowUploadModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#0B0F2A] border-2 border-orange-500 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 animate-in zoom-in-95">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-900/30 mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 text-orange-500 flex items-center justify-center font-bold">
                                    <Upload className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    {t('admin.backups.modal_upload_title')}
                                </h3>
                            </div>
                            <button type="button" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUploadRestore} className="space-y-4">
                            {/* File Input */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                                    {t('admin.backups.field_select_file')}
                                </label>
                                <input
                                    type="file"
                                    required
                                    accept=".gtbak,.gtbak.enc,.zip,.enc,.mshbak"
                                    onChange={(e) => setUploadFile(e.target.files[0] || null)}
                                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs file:me-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#6320EE] file:text-white"
                                />
                            </div>

                            {/* Passphrase if encrypted */}
                            <div>
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                                    {t('admin.backups.field_decrypt_pass_optional')}
                                </label>
                                <input
                                    type="password"
                                    value={uploadPassphrase}
                                    onChange={(e) => setUploadPassphrase(e.target.value)}
                                    placeholder={t('admin.backups.ph_enter_pass_optional')}
                                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-300 dark:border-violet-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-[#6320EE]"
                                />
                            </div>

                            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 cursor-pointer">
                                <input
                                    type="checkbox"
                                    required
                                    checked={uploadConfirm}
                                    onChange={(e) => setUploadConfirm(e.target.checked)}
                                    className="w-4 h-4 rounded text-orange-500 focus:ring-orange-500 mt-0.5"
                                />
                                <span className="text-xs text-orange-400 font-bold leading-relaxed">
                                    {t('admin.backups.chk_confirm_upload_restore')}
                                </span>
                            </label>

                            {uploadError && (
                                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-bold">
                                    {uploadError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!uploadFile || !uploadConfirm || uploading}
                                className="w-full py-3.5 rounded-2xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-violet-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <RotateCcw className="w-4 h-4" />
                                <span>{uploading ? t('admin.backups.uploading_in_progress') : t('admin.backups.btn_upload_restore_now')}</span>
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Dedicated Deletion Confirmation Modal */}
            <ConfirmDialog
                isOpen={Boolean(deleteTarget)}
                onClose={() => !deleting && setDeleteTarget(null)}
                onConfirm={confirmDelete}
                isLoading={deleting}
                title={t('admin.backups.delete_confirm_title')}
                message={t('admin.backups.delete_confirm_msg', { filename: deleteTarget?.filename })}
                confirmText={t('admin.backups.btn_delete_permanently')}
                cancelText={t('admin.backups.btn_cancel')}
                type="danger"
            />
        </AuthenticatedLayout>
    );
}
