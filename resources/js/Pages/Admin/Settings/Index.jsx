import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Modal from '../../../Components/Modal';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import { useTranslation } from '@/Utils/i18n';
import { 
    Settings, 
    Lock, 
    CreditCard, 
    Mail, 
    MessageSquare, 
    ShieldCheck, 
    Save, 
    Send, 
    Eye, 
    EyeOff, 
    DollarSign, 
    Percent, 
    Clock, 
    Key, 
    Server, 
    CheckCircle2, 
    AlertTriangle,
    Zap,
    Printer,
    FileText,
    Wrench,
    Megaphone,
    Bell,
    Landmark,
    Plus,
    Trash2,
    Edit3,
    Check,
    X,
    Building2,
    ArrowDownLeft
} from 'lucide-react';
import Select2 from '../../../Components/Select2';

export default function AdminSettings({ settings = [], currentGroup = 'hyperpay', groups = [], banks = [] }) {
    const { t, isAr } = useTranslation();
    const initialSettings = settings.reduce((acc, s) => {
        acc[s.key] = s.value || '';
        return acc;
    }, {});

    const { data, setData, post, processing } = useForm({
        settings: initialSettings,
        group: currentGroup,
    });

    const [visiblePasswords, setVisiblePasswords] = useState({});
    const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [sendingTest, setSendingTest] = useState(false);

    // Bank Management Modal States
    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [bankForm, setBankForm] = useState({
        name: '',
        name_en: '',
        code: '',
        is_active: true,
        notes: '',
    });
    const [savingBank, setSavingBank] = useState(false);
    const [bankToDelete, setBankToDelete] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const togglePasswordVisibility = (key) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleTabChange = (groupKey) => {
        router.get(route('admin.settings.index'), { group: groupKey }, { preserveState: false });
    };

    const handleSettingChange = (key, value) => {
        setData('settings', {
            ...data.settings,
            [key]: value,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.settings.update'));
    };

    const handleSendTestEmail = (e) => {
        e.preventDefault();
        if (!testEmail) return;
        setSendingTest(true);
        router.post(route('admin.settings.test-email'), {
            test_email: testEmail,
        }, {
            onFinish: () => {
                setSendingTest(false);
                setTestEmailModalOpen(false);
            }
        });
    };

    // Bank CRUD handlers
    const openAddBankModal = () => {
        setEditingBank(null);
        setBankForm({
            name: '',
            name_en: '',
            code: '',
            is_active: true,
            notes: '',
        });
        setBankModalOpen(true);
    };

    const openEditBankModal = (bank) => {
        setEditingBank(bank);
        setBankForm({
            name: bank.name || '',
            name_en: bank.name_en || '',
            code: bank.code || '',
            is_active: !!bank.is_active,
            notes: bank.notes || '',
        });
        setBankModalOpen(true);
    };

    const handleSaveBank = (e) => {
        e.preventDefault();
        setSavingBank(true);

        if (editingBank) {
            router.put(route('admin.settings.banks.update', editingBank.id), bankForm, {
                onFinish: () => {
                    setSavingBank(false);
                    setBankModalOpen(false);
                }
            });
        } else {
            router.post(route('admin.settings.banks.store'), bankForm, {
                onFinish: () => {
                    setSavingBank(false);
                    setBankModalOpen(false);
                }
            });
        }
    };

    const handleToggleBank = (bankId) => {
        router.post(route('admin.settings.banks.toggle', bankId), {}, { preserveScroll: true });
    };

    const confirmDeleteBank = (bank) => {
        setBankToDelete(bank);
        setDeleteModalOpen(true);
    };

    const handleExecuteDeleteBank = () => {
        if (!bankToDelete) return;
        router.delete(route('admin.settings.banks.delete', bankToDelete.id), {
            preserveScroll: true,
            onFinish: () => {
                setDeleteModalOpen(false);
                setBankToDelete(null);
            }
        });
    };

    const getGroupIcon = (groupKey) => {
        switch (groupKey) {
            case 'hyperpay': return CreditCard;
            case 'banks': return Landmark;
            case 'mail': return Mail;
            case 'financial': return DollarSign;
            case 'sms': return MessageSquare;
            case 'security': return ShieldCheck;
            case 'pdf_branding': return Printer;
            case 'maintenance': return Wrench;
            default: return Settings;
        }
    };

    const currentGroupObj = groups.find(g => g.key === currentGroup) || groups[0];

    // Filter settings for HyperPay into Checkout vs Payout
    const checkoutSettings = settings.filter(s => !s.key.includes('payout'));
    const payoutSettings = settings.filter(s => s.key.includes('payout'));

    return (
        <AuthenticatedLayout title={t('admin.settings.page_title')}>
            <Head title={t('admin.settings.page_title')} />

            <div className="space-y-6 pb-12 max-w-5xl mx-auto">
                {/* Unified Header */}
                <AdminPageHeader
                    title={t('admin.settings.header_title')}
                    subtitle={t('admin.settings.header_subtitle')}
                    breadcrumbs={[
                        { label: t('admin.nav.home'), url: route('admin.dashboard') },
                        { label: t('admin.nav.settings') }
                    ]}
                    icon={Settings}
                    iconColor="text-violet-400"
                    actions={
                        currentGroup === 'mail' ? [
                            {
                                label: t('admin.settings.btn_test_smtp'),
                                icon: Send,
                                onClick: () => setTestEmailModalOpen(true),
                                variant: 'primary',
                            }
                        ] : currentGroup === 'banks' ? [
                            {
                                label: 'إضافة بنك جديد',
                                icon: Plus,
                                onClick: openAddBankModal,
                                variant: 'primary',
                            }
                        ] : []
                    }
                    badge={{ text: t('admin.settings.badge_encrypted'), color: 'brand' }}
                />

                {/* Tabs Navigation */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
                    {groups.map((g) => {
                        const IconComp = getGroupIcon(g.key);
                        const isActive = currentGroup === g.key;
                        return (
                            <button
                                key={g.key}
                                type="button"
                                onClick={() => handleTabChange(g.key)}
                                className={`px-3 py-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#6320EE] text-white shadow-md shadow-violet-600/30'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                                }`}
                            >
                                <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                <span className="text-center line-clamp-1">{isAr ? g.label_ar : (g.label_en || g.label_ar || g.name)}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
                    {/* Active Tab Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                                {React.createElement(getGroupIcon(currentGroup), { className: 'w-5 h-5' })}
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm sm:text-base">
                                    {isAr ? currentGroupObj?.label_ar : (currentGroupObj?.label_en || currentGroupObj?.label_ar || currentGroupObj?.name)}
                                </h3>
                                <p className="text-xs text-slate-400">
                                    {isAr ? currentGroupObj?.desc : (currentGroupObj?.desc_en || currentGroupObj?.desc)}
                                </p>
                            </div>
                        </div>

                        {currentGroup === 'mail' && (
                            <button
                                type="button"
                                onClick={() => setTestEmailModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                            >
                                <Send className="w-3.5 h-3.5" />
                                <span>{t('admin.settings.btn_test_now')}</span>
                            </button>
                        )}

                        {currentGroup === 'banks' && (
                            <button
                                type="button"
                                onClick={openAddBankModal}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/20 flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
                            >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة بنك جديد</span>
                            </button>
                        )}
                    </div>

                    {/* HyperPay Environment Notice */}
                    {currentGroup === 'hyperpay' && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-amber-300 space-y-1">
                                <span className="font-bold block">{t('admin.settings.notice_hyperpay_title')}</span>
                                <p className="leading-relaxed">
                                    {t('admin.settings.notice_hyperpay_desc')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* ======================= BANKS MANAGEMENT TAB ======================= */}
                    {currentGroup === 'banks' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">إجمالي البنوك المسجلة</span>
                                    <span className="text-xl font-black text-white">{banks.length}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">البنوك النشطة المتاحة للتحويل</span>
                                    <span className="text-xl font-black text-emerald-400">{banks.filter(b => b.is_active).length}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                                    <span className="text-xs text-slate-400 block mb-1">البنوك المعطلة مؤقتاً</span>
                                    <span className="text-xl font-black text-amber-400">{banks.filter(b => !b.is_active).length}</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/50">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-[11px] font-bold">
                                        <tr>
                                            <th className="py-3 px-4">#</th>
                                            <th className="py-3 px-4">اسم البنك (عربي / English)</th>
                                            <th className="py-3 px-4">كود السويفت البنكي (BIC)</th>
                                            <th className="py-3 px-4 text-center">حالة الصرف والتحويل</th>
                                            <th className="py-3 px-4 text-center">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                                        {banks.map((b, idx) => (
                                            <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                                                <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                                                <td className="py-3 px-4">
                                                    <div className="font-bold text-white text-xs">{b.name}</div>
                                                    {b.name_en && <div className="text-[10px] text-slate-400 font-sans">{b.name_en}</div>}
                                                </td>
                                                <td className="py-3 px-4 font-mono">
                                                    <span className="px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 font-bold">
                                                        {b.code}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleBank(b.id)}
                                                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                                            b.is_active
                                                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                                : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                                        }`}
                                                    >
                                                        {b.is_active ? '✓ نشط ومتاح للتحويل' : '✕ معطّل مؤقتاً'}
                                                    </button>
                                                </td>
                                                <td className="py-3 px-4 text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditBankModal(b)}
                                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                                                            title="تعديل بيانات البنك"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDeleteBank(b)}
                                                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                                                            title="حذف البنك"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        /* ======================= REGULAR SETTINGS FORM ======================= */
                        <form onSubmit={submit} className="space-y-6">
                            {/* If HyperPay, group cleanly into Checkout vs Payout */}
                            {currentGroup === 'hyperpay' && (
                                <div className="space-y-6">
                                    {/* Sub-header for Checkout */}
                                    <div className="border-b border-slate-800 pb-2">
                                        <h4 className="text-sm font-bold text-violet-300 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />
                                            <span>بوابة إيداع وشحن المحفظة (Checkout Widgets)</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400">إعدادات البطاقات البنكية ومدى وApple Pay لشحن محافظ المستثمرين</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {checkoutSettings.map((s) => renderSettingField(s))}
                                    </div>

                                    {/* Sub-header for Instant Payout */}
                                    <div className="border-b border-slate-800 pb-2 pt-4">
                                        <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            <span>خدمة التحويلات البنكية الفورية (HyperPay Payout / سريع IPS)</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400">إعدادات تحويل الأرباح والمبالغ مباشرة من حساب المنصة لحسابات المستثمرين والشركات</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {payoutSettings.map((s) => renderSettingField(s))}
                                    </div>
                                </div>
                            )}

                            {/* Other Groups */}
                            {currentGroup !== 'hyperpay' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {settings.map((s) => renderSettingField(s))}
                                </div>
                            )}

                            {/* Save Button */}
                            <div className="flex items-center justify-end pt-4 border-t border-slate-800">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-3 bg-[#6320EE] hover:bg-[#5218cc] text-white rounded-xl text-xs font-bold transition-all shadow-xl shadow-violet-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>{t('admin.settings.btn_save_encrypted')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Bank Add/Edit Modal */}
            <Modal isOpen={bankModalOpen} onClose={() => setBankModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSaveBank} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-violet-400">
                            <Landmark className="w-5 h-5" />
                            <h3 className="font-bold text-white text-sm">
                                {editingBank ? 'تعديل بيانات البنك المعتمد' : 'إضافة بنك جديد للنظام'}
                            </h3>
                        </div>
                        <button type="button" onClick={() => setBankModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-3 text-right">
                        <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">اسم البنك (بالعربية) *</label>
                            <input
                                type="text"
                                required
                                value={bankForm.name}
                                onChange={(e) => setBankForm({ ...bankForm, name: e.target.value })}
                                placeholder="مثال: مصرف الراجحي"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">اسم البنك (بالإنجليزي)</label>
                            <input
                                type="text"
                                value={bankForm.name_en}
                                onChange={(e) => setBankForm({ ...bankForm, name_en: e.target.value })}
                                placeholder="e.g. Al Rajhi Bank"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-sans"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">كود السويفت/BIC البنكي المعتمد *</label>
                            <input
                                type="text"
                                required
                                value={bankForm.code}
                                onChange={(e) => setBankForm({ ...bankForm, code: e.target.value.toUpperCase() })}
                                placeholder="مثال: RJHISARI أو NCBKSAJE"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono tracking-wider uppercase"
                            />
                            <span className="text-[10px] text-slate-400 mt-1 block">يُستخدم هذا الكود للتحويل الفوري عبر نظام سريع IPS في بوابة HyperPay.</span>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-300 block mb-1">ملاحظات داخلية (اختياري)</label>
                            <input
                                type="text"
                                value={bankForm.notes}
                                onChange={(e) => setBankForm({ ...bankForm, notes: e.target.value })}
                                placeholder="أي ملاحظات حول البنك أو فروعه"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <input
                                type="checkbox"
                                id="is_active_bank"
                                checked={bankForm.is_active}
                                onChange={(e) => setBankForm({ ...bankForm, is_active: e.target.checked })}
                                className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 bg-slate-900 border-slate-700"
                            />
                            <label htmlFor="is_active_bank" className="text-xs font-medium text-slate-300 cursor-pointer">
                                تفعيل هذا البنك فوراً ليكون متاحاً لطلبات السحب من المستثمرين والشركات
                            </label>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setBankModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={savingBank}
                            className="flex-1 py-2.5 bg-[#6320EE] hover:bg-[#5218cc] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            {savingBank ? 'جاري الحفظ...' : (editingBank ? 'تحديث البنك' : 'حفظ وإضافة البنك')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Bank Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setBankToDelete(null);
                }}
                onConfirm={handleExecuteDeleteBank}
                title="تأكيد حذف البنك"
                message={`هل أنت متأكد من رغبتك في حذف البنك (${bankToDelete?.name || ''})؟ سيؤدي ذلك لإزالته من قائمة البنوك المتاحة للتحويلات الفورية.`}
                confirmText="نعم، حذف البنك"
                cancelText="إلغاء التراجع"
                type="danger"
            />

            {/* Test Email Modal */}
            <Modal isOpen={testEmailModalOpen} onClose={() => setTestEmailModalOpen(false)} maxWidth="md">
                <form onSubmit={handleSendTestEmail} className="p-6 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Send className="w-5 h-5" />
                            <h3 className="font-bold text-white text-sm">{t('admin.settings.test_smtp_title')}</h3>
                        </div>
                        <button type="button" onClick={() => setTestEmailModalOpen(false)} className="text-slate-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                        {t('admin.settings.test_smtp_desc')}
                    </p>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-400 block">{t('admin.settings.recipient_email')}</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="name@example.com"
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setTestEmailModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            type="submit"
                            disabled={sendingTest || !testEmail}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {sendingTest ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-3.5 h-3.5" />
                                    <span>{t('admin.settings.btn_send_test')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );

    // Helper renderer for a single setting field
    function renderSettingField(s) {
        const isPassword = s.is_encrypted && !visiblePasswords[s.key];
        const isSelectField = s.key === 'hyperpay_mode' || 
            s.key === 'hyperpay_enable_mada' ||
            s.key === 'hyperpay_enable_visa_master' ||
            s.key === 'hyperpay_enable_apple_pay' ||
            s.key === 'hyperpay_payout_enabled' ||
            s.key === 'hyperpay_payout_purpose' ||
            s.key === 'require_kyc_verification' || 
            s.key === 'enable_two_factor_auth' || 
            s.key === 'sms_provider' || 
            s.key === 'mail_encryption' ||
            s.key === 'is_under_development' ||
            s.key === 'under_development_speed';
        const isTextareaField = s.key === 'under_development_text' || s.key === 'pdf_footer_legal_text';

        return (
            <div 
                key={s.id} 
                className={`p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-2 transition-all hover:border-slate-700 ${
                    s.key.includes('token') || s.key.includes('url') || s.key.includes('host') || s.key.includes('password') || s.key === 'under_development_text' || s.key === 'pdf_footer_legal_text'
                        ? 'md:col-span-2'
                        : ''
                }`}
            >
                <div className="flex items-center justify-between gap-2">
                    <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>{s.label || s.key}</span>
                    </label>
                    <div className="flex items-center gap-2">
                        {s.is_encrypted && (
                            <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 flex items-center gap-1 font-mono">
                                <Lock className="w-2.5 h-2.5" /> AES-256
                            </span>
                        )}
                        <span className="text-[10px] text-slate-500 font-mono">
                            {s.key}
                        </span>
                    </div>
                </div>

                <div className="relative">
                    {isSelectField ? (
                        (() => {
                            let optionsList = [];
                            if (s.key === 'hyperpay_mode') {
                                optionsList = [
                                    { value: 'test', label: t('admin.settings.opt_hyperpay_test'), description: t('admin.settings.opt_hyperpay_test_desc') },
                                    { value: 'live', label: t('admin.settings.opt_hyperpay_live'), description: t('admin.settings.opt_hyperpay_live_desc') },
                                ];
                            } else if (s.key === 'hyperpay_enable_mada' || s.key === 'hyperpay_enable_visa_master' || s.key === 'hyperpay_enable_apple_pay') {
                                optionsList = [
                                    { value: 'yes', label: t('admin.settings.opt_method_enabled', 'مفعّل (نشط للمستثمرين)'), description: t('admin.settings.opt_method_enabled_desc', 'إظهار وسيلة الدفع في شحن المحفظة للمستثمرين') },
                                    { value: 'no', label: t('admin.settings.opt_method_disabled', 'معطّل (موقوف مؤقتاً)'), description: t('admin.settings.opt_method_disabled_desc', 'إخفاء وسيلة الدفع ومنع الشحن بها مؤقتاً') },
                                ];
                            } else if (s.key === 'hyperpay_payout_enabled') {
                                optionsList = [
                                    { value: 'yes', label: 'مفعّل (التحويلات البنكية الفورية نشطة)', description: 'إتاحة صرف وسحب الأموال فورياً لحسابات المستثمرين والشركات' },
                                    { value: 'no', label: 'معطّل مؤقتاً', description: 'إيقاف التحويلات البنكية الفورية عبر بوابة الدفع' },
                                ];
                            } else if (s.key === 'hyperpay_payout_purpose') {
                                optionsList = [
                                    { value: 'BA', label: 'BA - تحويل لحساب بنكي (Bank Account Transfer)', description: 'الرمز القياسي للبنوك السعودية لتحويلات الحسابات الفردية والتجارية' },
                                    { value: 'SALA', label: 'SALA - توزيع أرباح ورواتب (Salary / Dividends)', description: 'كود الغرض لتحويل الرواتب والأرباح الدورية' },
                                ];
                            } else if (s.key === 'require_kyc_verification') {
                                optionsList = [
                                    { value: 'yes', label: t('admin.settings.opt_kyc_yes'), description: t('admin.settings.opt_kyc_yes_desc') },
                                    { value: 'no', label: t('admin.settings.opt_kyc_no'), description: t('admin.settings.opt_kyc_no_desc') },
                                ];
                            } else if (s.key === 'enable_two_factor_auth') {
                                optionsList = [
                                    { value: 'optional', label: t('admin.settings.opt_2fa_optional'), description: t('admin.settings.opt_2fa_optional_desc') },
                                    { value: 'forced', label: t('admin.settings.opt_2fa_forced'), description: t('admin.settings.opt_2fa_forced_desc') },
                                ];
                            } else if (s.key === 'sms_provider') {
                                optionsList = [
                                    { value: 'unifonic', label: t('admin.settings.opt_sms_unifonic'), description: t('admin.settings.opt_sms_unifonic_desc') },
                                    { value: 'twilio', label: t('admin.settings.opt_sms_twilio'), description: t('admin.settings.opt_sms_twilio_desc') },
                                    { value: 'taqnyat', label: t('admin.settings.opt_sms_taqnyat'), description: t('admin.settings.opt_sms_taqnyat_desc') },
                                ];
                            } else if (s.key === 'mail_encryption') {
                                optionsList = [
                                    { value: 'tls', label: t('admin.settings.opt_mail_tls'), description: t('admin.settings.opt_mail_tls_desc') },
                                    { value: 'ssl', label: t('admin.settings.opt_mail_ssl'), description: t('admin.settings.opt_mail_ssl_desc') },
                                    { value: 'null', label: t('admin.settings.opt_mail_null'), description: t('admin.settings.opt_mail_null_desc') },
                                ];
                            } else if (s.key === 'is_under_development') {
                                optionsList = [
                                    { value: 'no', label: t('admin.settings.opt_maint_no'), description: t('admin.settings.opt_maint_no_desc') },
                                    { value: 'yes', label: t('admin.settings.opt_maint_yes'), description: t('admin.settings.opt_maint_yes_desc') },
                                ];
                            } else if (s.key === 'under_development_speed') {
                                optionsList = [
                                    { value: 'slow', label: t('admin.settings.opt_speed_slow'), description: t('admin.settings.opt_speed_slow_desc') },
                                    { value: 'normal', label: t('admin.settings.opt_speed_normal'), description: t('admin.settings.opt_speed_normal_desc') },
                                    { value: 'fast', label: t('admin.settings.opt_speed_fast'), description: t('admin.settings.opt_speed_fast_desc') },
                                ];
                            }

                            return (
                                <Select2
                                    value={data.settings[s.key] !== undefined ? data.settings[s.key] : (s.value || '')}
                                    onChange={(val) => handleSettingChange(s.key, val)}
                                    options={optionsList}
                                    placeholder={t('admin.settings.select_field', { label: s.label || s.key })}
                                    searchPlaceholder={t('admin.settings.search_options')}
                                />
                            );
                        })()
                    ) : isTextareaField ? (
                        <textarea
                            rows={3}
                            value={data.settings[s.key] !== undefined ? data.settings[s.key] : (s.value || '')}
                            onChange={(e) => handleSettingChange(s.key, e.target.value)}
                            placeholder={s.label || s.key}
                            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-sans leading-relaxed"
                        />
                    ) : (
                        <div className="relative">
                            <input
                                type={isPassword ? 'password' : 'text'}
                                value={data.settings[s.key] !== undefined ? data.settings[s.key] : (s.value || '')}
                                onChange={(e) => handleSettingChange(s.key, e.target.value)}
                                placeholder={s.label || s.key}
                                className={`w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 font-mono ${
                                    s.is_encrypted ? 'pr-10' : ''
                                }`}
                            />
                            {s.is_encrypted && (
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(s.key)}
                                    className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                    tabIndex="-1"
                                >
                                    {visiblePasswords[s.key] ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    }
}
