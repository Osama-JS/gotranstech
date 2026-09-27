import React, { useState } from 'react';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Modal from '../../../Components/Modal';
import Badge from '../../../Components/Badge';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import {
    Key,
    PlusCircle,
    Copy,
    Check,
    Webhook,
    Code,
    Trash2,
    ShieldCheck,
    ExternalLink,
    AlertTriangle,
    Truck,
    Globe,
    Server,
    Zap,
    Send,
    Radio,
    Clock,
    CheckCircle2,
    Lock,
    HelpCircle,
    Info,
    RefreshCw,
    Play,
    Terminal,
    Wallet,
} from 'lucide-react';

export default function CompanyApi({ company, apiKeys = [], apiBaseUrl, stats = {} }) {
    const { flash } = usePage().props;
    const [createKeyModal, setCreateKeyModal] = useState(false);
    const [revokeModalOpen, setRevokeModalOpen] = useState(false);
    const [selectedKeyToRevoke, setSelectedKeyToRevoke] = useState(null);
    const [revokeLoading, setRevokeLoading] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedBaseUrl, setCopiedBaseUrl] = useState(false);
    const [activeLangTab, setActiveLangTab] = useState('curl');
    const [testingWebhook, setTestingWebhook] = useState(false);

    // Create Key Form
    const {
        data: keyData,
        setData: setKeyData,
        post: postKey,
        processing: keyProcessing,
        reset: resetKey,
    } = useForm({
        key_name: 'Production Server Key',
    });

    // Webhook Form
    const {
        data: whData,
        setData: setWhData,
        post: postWh,
        processing: whProcessing,
    } = useForm({
        webhook_url: company.webhook_url || '',
        webhook_secret: company.webhook_secret || '',
    });

    const handleCreateKey = (e) => {
        e.preventDefault();
        postKey(route('company.api.generate'), {
            onSuccess: () => {
                setCreateKeyModal(false);
                resetKey();
            },
        });
    };

    const handleUpdateWebhook = (e) => {
        e.preventDefault();
        postWh(route('company.api.webhook'));
    };

    const handleTestWebhook = () => {
        setTestingWebhook(true);
        router.post(
            route('company.api.webhook.test'),
            {},
            {
                preserveScroll: true,
                onFinish: () => setTestingWebhook(false),
            }
        );
    };

    const handleOpenRevoke = (key) => {
        setSelectedKeyToRevoke(key);
        setRevokeModalOpen(true);
    };

    const handleConfirmRevoke = () => {
        if (!selectedKeyToRevoke) return;
        setRevokeLoading(true);
        router.delete(route('company.api.revoke', selectedKeyToRevoke.id), {
            preserveScroll: true,
            onFinish: () => {
                setRevokeLoading(false);
                setRevokeModalOpen(false);
                setSelectedKeyToRevoke(null);
            },
        });
    };

    const handleCopy = (text, type = 'key') => {
        navigator.clipboard.writeText(text);
        if (type === 'key') {
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        } else {
            setCopiedBaseUrl(true);
            setTimeout(() => setCopiedBaseUrl(false), 2000);
        }
    };

    // Code snippets generator
    const getCodeSnippet = (lang) => {
        const cleanBaseUrl = apiBaseUrl || 'https://api.gotranstech.com/api/v1';

        switch (lang) {
            case 'curl':
                return `# 1. إرسال مهمة لوجستية جديدة للتمويل
curl -X POST "${cleanBaseUrl}/tasks" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "external_task_id": "TRIP-8842",
    "title": "نقل أجهزة طبية مبردة",
    "funding_amount": 4200.00,
    "pickup_city": "الرياض",
    "pickup_address": "حي السلي، مستودعات التبريد",
    "dropoff_city": "الدمام",
    "dropoff_address": "حي الشاطئ، المستشفى التخصصي",
    "duration_minutes": 180
  }'

# 2. الاستعلام عن حالة تمويل مهمة
curl -X GET "${cleanBaseUrl}/tasks/TRIP-8842" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

            case 'javascript':
                return `// تثبيت حزمة axios أو استخدام fetch الافتراضي
import axios from 'axios';

const api = axios.create({
  baseURL: '${cleanBaseUrl}',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  }
});

// إرسال مهمة جديدة
async function submitTask() {
  try {
    const response = await api.post('/tasks', {
      external_task_id: 'TRIP-8842',
      title: 'نقل أجهزة طبية مبردة',
      funding_amount: 4200.00,
      pickup_city: 'الرياض',
      dropoff_city: 'الدمام'
    });
    console.log('Task submitted successfully:', response.data);
  } catch (error) {
    console.error('API Error:', error.response?.data);
  }
}`;

            case 'python':
                return `import requests

API_BASE_URL = "${cleanBaseUrl}"
API_KEY = "YOUR_API_KEY"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

payload = {
    "external_task_id": "TRIP-8842",
    "title": "نقل أجهزة طبية مبردة",
    "funding_amount": 4200.00,
    "pickup_city": "الرياض",
    "dropoff_city": "الدمام"
}

response = requests.post(f"{API_BASE_URL}/tasks", json=payload, headers=headers)
print("Status:", response.status_code)
print("Response:", response.json())`;

            case 'php':
                return `<?php
// استخدام cURL أو GuzzleHttp في أنظمة PHP / Laravel
$url = '${cleanBaseUrl}/tasks';
$apiKey = 'YOUR_API_KEY';

$data = [
    'external_task_id' => 'TRIP-8842',
    'title' => 'نقل أجهزة طبية مبردة',
    'funding_amount' => 4200.00,
    'pickup_city' => 'الرياض',
    'dropoff_city' => 'الدمام'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
curl_close($ch);
print_r(json_decode($response, true));`;

            default:
                return '';
        }
    };

    return (
        <AuthenticatedLayout title="إعدادات الربط البرمجي ومفاتيح الـ API">
            <Head title="إعدادات الربط البرمجي والـ API" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="إعدادات الربط البرمجي ومفاتيح الـ API"
                subtitle="إدارة مفاتيح الواجهات البرمجية (REST API) وإعدادات الـ Webhook لأتمتة إرسال المهام واستقبال التمويل اللحظي"
                icon={Key}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: 'الربط البرمجي والـ API' }]}
                badge={{
                    text: `${stats.active_keys || 0} مفتاح نشط`,
                    color: 'brand',
                }}
                actions={[
                    {
                        label: 'توليد مفتاح API جديد',
                        icon: PlusCircle,
                        onClick: () => setCreateKeyModal(true),
                        variant: 'primary',
                    },
                    {
                        label: 'إدارة المهام اللوجستية',
                        icon: Truck,
                        url: route('company.tasks.index'),
                    },
                    {
                        label: 'محفظة التمويل والمسحوبات',
                        icon: Wallet,
                        url: route('company.wallet.funding'),
                    },
                ]}
            />

            {/* Generated Key Alert Box (Shown only once after generation) */}
            {flash?.generated_key && (
                <div className="bg-[#6320EE]/10 border-2 border-[#6320EE] p-6 rounded-3xl shadow-xl mb-8 animate-fadeIn text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3 mb-2">
                        <Key className="w-6 h-6 text-[#6320EE]" />
                        <h4 className="font-bold text-base text-[#6320EE]">تم توليد مفتاح الـ API الجديد بنجاح!</h4>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                        ⚠️ <strong>تنبيه أمني هام:</strong> يرجى نسخ هذا المفتاح فوراً وتخزينه في ملف البيئة الخاص بخوادمكم (مثل <code>.env</code>)، فلن تتمكن من رؤيته مجدداً لأسباب أمنية وتشفيرية.
                    </p>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0A0E2A] p-4 rounded-2xl border border-[#6320EE]/40">
                        <span className="font-mono text-violet-700 dark:text-violet-300 font-bold text-sm select-all break-all">
                            {flash.generated_key}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleCopy(flash.generated_key, 'key')}
                            className="px-5 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
                        >
                            {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            <span>{copiedKey ? 'تم النسخ بنجاح!' : 'نسخ المفتاح'}</span>
                        </button>
                    </div>
                </div>
            )}

            {/* 4 Financial & Technical Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Active Keys */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">مفاتيح الـ API الفعالة</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                            <Key className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {stats.active_keys || 0}
                        <span className="text-xs font-sans font-bold text-slate-500">من أصل {stats.total_keys || 0}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        آخر نشاط: {stats.last_key_used_at || 'لم يُستخدم'}
                    </p>
                </div>

                {/* Webhook Status */}
                <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">إشعارات الـ Webhook</span>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                            <Webhook className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {company.webhook_url ? (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                                <span className="text-blue-600 dark:text-blue-400">مفعل ومتصل</span>
                            </>
                        ) : (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                <span className="text-amber-500">غير مضبوط</span>
                            </>
                        )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
                        {company.webhook_url ? company.webhook_url : 'قم بضبط الرابط لتلقي التمويل لحظياً'}
                    </p>
                </div>

                {/* API Ingested Tasks */}
                <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">المهام المرفوعة آلياً عبر API</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-orange-500 flex items-baseline gap-1">
                        {stats.api_tasks_count || 0}
                        <span className="text-xs font-sans font-bold text-slate-500">مهمة</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        من أصل {stats.total_tasks_count || 0} مهمة إجمالية مسجلة
                    </p>
                </div>

                {/* Base API Endpoint */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">رابط الواجهة البرمجية الأساسي</span>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                            <Server className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                            {apiBaseUrl}
                        </span>
                        <button
                            type="button"
                            onClick={() => handleCopy(apiBaseUrl, 'url')}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
                            title="نسخ الرابط الأساسي"
                        >
                            {copiedBaseUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        نسخة REST API v1 مع تفويض Bearer
                    </p>
                </div>
            </div>

            {/* How It Works Workflow (Clear explanation for clients) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 mb-8 shadow-sm dark:shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                        كيف يعمل التكامل البرمجي المؤتمت مع GoTech؟
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-[#6320EE] text-white flex items-center justify-center font-black text-xs mb-3">
                            1
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                            توليد مفتاح الربط والاعتماد
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            قم بتوليد مفتاح API آمن وضعه في خادم نظام إدارة النقل (TMS) الخاص بشركتكم لتفويض كافة الطلبات.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs mb-3">
                            2
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                            رفع المهام اللوجستية آلياً
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            يقوم نظامكم بإرسال بيانات الشحنات تلقائياً عبر نقطة <code>POST /tasks</code> لتُعرض فوراً في سوق التمويل للمستثمرين.
                        </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                        <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-black text-xs mb-3">
                            3
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                            استلام إشعار التمويل (Webhook)
                        </h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                            بمجرد قيام أي مستثمر بتمويل الشحنة، ترسل المنصة إشعاراً مشفراً لخادمكم، ويصبح الرصيد جاهزاً للصرف فوراً.
                        </p>
                    </div>
                </div>
            </div>

            {/* Split Grid: API Keys & Webhook Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* API Keys Management */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <Key className="w-5 h-5 text-violet-500" />
                                <span>مفاتيح الواجهات البرمجية (API Keys)</span>
                            </h3>
                            <button
                                type="button"
                                onClick={() => setCreateKeyModal(true)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-violet-600/20"
                            >
                                <PlusCircle className="w-4 h-4" />
                                <span>توليد مفتاح جديد</span>
                            </button>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                            استخدم هذه المفاتيح لتفويض طلبات خوادمكم. يُرجى إلغاء أي مفتاح قد تشك في تسريبه فوراً.
                        </p>

                        <div className="space-y-3">
                            {apiKeys.length > 0 ? (
                                apiKeys.map((key) => (
                                    <div
                                        key={key.id}
                                        className="bg-slate-50 dark:bg-slate-900/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                                    {key.key_name}
                                                </span>
                                                <Badge status={key.status} />
                                            </div>
                                            <span className="font-mono text-xs text-violet-600 dark:text-violet-400 font-bold block">
                                                {key.api_key_prefix}••••••••••••••••••••••••••••
                                            </span>
                                            <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1">
                                                <span>إنشاء: {new Date(key.created_at).toLocaleDateString('ar-SA')}</span>
                                                {key.last_used_at && (
                                                    <span>آخر استخدام: {new Date(key.last_used_at).toLocaleDateString('ar-SA')}</span>
                                                )}
                                            </div>
                                        </div>

                                        {key.status === 'active' && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenRevoke(key)}
                                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-500/20"
                                                title="إلغاء تنشيط المفتاح"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                                    لا توجد أي مفاتيح API مسجلة حالياً. اضغط على زر "توليد مفتاح جديد" أعلاه.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-violet-500 shrink-0" />
                        <span>يتم تخزين المفاتيح بتشفير SHA-256 أحادي الاتجاه لحماية قصوى لأنظمتكم.</span>
                    </div>
                </div>

                {/* Webhook Configuration & Tester */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                                <Webhook className="w-5 h-5 text-blue-500" />
                                <span>إعدادات الإشعارات الفورية (Webhooks)</span>
                            </h3>

                            {company.webhook_url && (
                                <button
                                    type="button"
                                    onClick={handleTestWebhook}
                                    disabled={testingWebhook}
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Radio className={`w-3.5 h-3.5 ${testingWebhook ? 'animate-spin' : ''}`} />
                                    <span>{testingWebhook ? 'جاري الفحص...' : 'فحص الاتصال (Ping)'}</span>
                                </button>
                            )}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                            عندما يقوم مستثمر بتمويل أي مهمة لوجستية تابعة لشركتكم، سنقوم فورياً بإرسال إشعار <code>HTTP POST</code> مشفر إلى الرابط المحدد أدناه مع توقيع <code>X-GoTech-Signature</code>.
                        </p>

                        <form onSubmit={handleUpdateWebhook} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    رابط استلام الإشعارات (Webhook URL)
                                </label>
                                <div className="relative">
                                    <Globe className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                                    <input
                                        type="url"
                                        value={whData.webhook_url}
                                        onChange={(e) => setWhData('webhook_url', e.target.value)}
                                        placeholder="https://your-domain.com/api/webhooks/gotech"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 font-mono"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                                    المفتاح السري للتحقق من التوقيع (Webhook Secret)
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                                    <input
                                        type="text"
                                        value={whData.webhook_secret}
                                        onChange={(e) => setWhData('webhook_secret', e.target.value)}
                                        placeholder="whsec_xxxxxxxxxxxxxxxxx"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500 font-mono"
                                    />
                                </div>
                                <p className="text-[11px] text-slate-500 mt-1">
                                    يُستخدم لحساب توقيع <code>HMAC-SHA256</code> للتأكد من أن الطلب صادر حصرياً من GoTech.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={whProcessing}
                                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm shadow-violet-600/20"
                            >
                                {whProcessing ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-3.5 h-3.5" />
                                        <span>حفظ إعدادات الـ Webhook</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>يجب أن يرد خادمكم بكود حالة <code>200 OK</code> خلال أقل من 5 ثوانٍ عند استلام الإشعار.</span>
                    </div>
                </div>
            </div>

            {/* Interactive API Documentation & Code Explorer */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#6320EE]/10 text-[#6320EE] flex items-center justify-center font-bold">
                            <Code className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">
                                التوثيق البرمجي ونماذج الأكواد التفاعلية
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                أمثلة حية بلغات متعددة للتكامل السريع مع نظام إدارة الشحن الخاص بكم
                            </p>
                        </div>
                    </div>

                    {/* Language Switcher Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        {[
                            { id: 'curl', label: 'cURL' },
                            { id: 'javascript', label: 'Node.js / JS' },
                            { id: 'python', label: 'Python' },
                            { id: 'php', label: 'PHP / Laravel' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveLangTab(tab.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    activeLangTab === tab.id
                                        ? 'bg-[#6320EE] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Window */}
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#070A1E] shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-3 bg-[#0c1130] border-b border-slate-800/80">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                            <span className="font-mono text-xs text-slate-400 ml-2">
                                integration-sample.{activeLangTab === 'python' ? 'py' : activeLangTab === 'php' ? 'php' : activeLangTab === 'javascript' ? 'js' : 'sh'}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleCopy(getCodeSnippet(activeLangTab), 'code')}
                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الكود</span>
                        </button>
                    </div>

                    <pre className="p-5 font-mono text-xs text-violet-200 overflow-x-auto leading-relaxed select-all">
                        {getCodeSnippet(activeLangTab)}
                    </pre>
                </div>

                {/* Field Dictionary Table */}
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-violet-500" />
                        <span>دليل حقول الطلب (Payload Parameters) لنقطة <code>POST /tasks</code>:</span>
                    </h4>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                                <tr>
                                    <th className="p-3">اسم الحقل البرمجي</th>
                                    <th className="p-3">النوع</th>
                                    <th className="p-3">إلزامي؟</th>
                                    <th className="p-3">الوصف والملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-sans">
                                <tr>
                                    <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">external_task_id</td>
                                    <td className="p-3 font-mono text-slate-500">string</td>
                                    <td className="p-3"><span className="text-amber-500 font-bold">نعم</span></td>
                                    <td className="p-3 text-slate-700 dark:text-slate-300">معرف الشحنة في نظامكم الخاص (مثل رقم البوليصة أو المعاملة).</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">title</td>
                                    <td className="p-3 font-mono text-slate-500">string</td>
                                    <td className="p-3"><span className="text-amber-500 font-bold">نعم</span></td>
                                    <td className="p-3 text-slate-700 dark:text-slate-300">عنوان مختصر ومفهوم لطبيعة الشحنة للمستثمرين.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">funding_amount</td>
                                    <td className="p-3 font-mono text-slate-500">number</td>
                                    <td className="p-3"><span className="text-amber-500 font-bold">نعم</span></td>
                                    <td className="p-3 text-slate-700 dark:text-slate-300">قيمة التمويل المطلوبة للشحنة بالريال السعودي (SAR).</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">pickup_city / dropoff_city</td>
                                    <td className="p-3 font-mono text-slate-500">string</td>
                                    <td className="p-3"><span className="text-slate-400">اختياري</span></td>
                                    <td className="p-3 text-slate-700 dark:text-slate-300">مدينة الاستلام والتسليم لتسهيل عرض المسار.</td>
                                </tr>
                                <tr>
                                    <td className="p-3 font-mono font-bold text-violet-600 dark:text-violet-400">duration_minutes</td>
                                    <td className="p-3 font-mono text-slate-500">integer</td>
                                    <td className="p-3"><span className="text-slate-400">اختياري</span></td>
                                    <td className="p-3 text-slate-700 dark:text-slate-300">المدة المتوقعة لتسليم الشحنة بالدقائق.</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create API Key Modal */}
            <Modal
                isOpen={createKeyModal}
                onClose={() => setCreateKeyModal(false)}
                title="توليد مفتاح API جديد"
                maxWidth="md"
            >
                <form onSubmit={handleCreateKey} className="space-y-4">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        حدد اسماً توضيحياً لمفتاح الـ API لتمييز الخادم أو البيئة التي ستستخدمه (مثلاً: خادم الإنتاج الأساسي، تطبيق السائقين، نظام المستودعات).
                    </p>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            اسم المفتاح التعريفي
                        </label>
                        <input
                            type="text"
                            value={keyData.key_name}
                            onChange={(e) => setKeyData('key_name', e.target.value)}
                            placeholder="مثال: TMS Production Server"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={keyProcessing}
                        className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-violet-600/30 flex items-center justify-center gap-2"
                    >
                        {keyProcessing ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <PlusCircle className="w-4 h-4" />
                                <span>توليد وحفظ المفتاح الآن</span>
                            </>
                        )}
                    </button>
                </form>
            </Modal>

            {/* Revoke Key Confirmation Dialog */}
            <ConfirmDialog
                isOpen={revokeModalOpen}
                onClose={() => setRevokeModalOpen(false)}
                onConfirm={handleConfirmRevoke}
                isLoading={revokeLoading}
                type="danger"
                title="إلغاء تنشيط مفتاح الـ API"
                message={`هل أنت متأكد من رغبتك في إلغاء تفعيل المفتاح "${selectedKeyToRevoke?.key_name}" (${selectedKeyToRevoke?.api_key_prefix}...)؟ ستتوقف أي خوادم أو أنظمة تستخدم هذا المفتاح عن الوصول إلى واجهة المنصة فوراً.`}
                confirmText="نعم، إلغاء تفعيل المفتاح"
                cancelText="تراجع"
            />
        </AuthenticatedLayout>
    );
}
