import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import Select2 from '../../../Components/Select2';
import { useTranslation } from '../../../Utils/i18n';
import axios from 'axios';
import {
    Terminal,
    Play,
    Copy,
    Check,
    RefreshCw,
    ExternalLink,
    Key,
    Server,
    ShieldAlert,
    Send,
    Truck,
    Wallet,
    Webhook,
    Clock,
    FileJson,
    CheckCircle2,
    XCircle,
    Info,
    Sparkles,
    Sliders,
    Layers,
    RotateCcw
} from 'lucide-react';

export default function CompanyApiSandbox({ company, apiKeys = [], apiBaseUrl, recentTasks = [] }) {
    const { t, locale } = useTranslation();

    // API Key State
    const [selectedKeyPrefix, setSelectedKeyPrefix] = useState(
        apiKeys.length > 0 ? apiKeys[0].api_key_prefix : 'custom'
    );
    const [customToken, setCustomToken] = useState('');
    const [tokenToUse, setTokenToUse] = useState('');

    // Active Operation State
    const [activeOperationId, setActiveOperationId] = useState('post_task');

    // Request Configuration
    const [httpMethod, setHttpMethod] = useState('POST');
    const [endpointPath, setEndpointPath] = useState('/tasks');
    const [pathParams, setPathParams] = useState({ id: recentTasks[0]?.id || recentTasks[0]?.external_task_id || 'ORD-RYD-8821' });
    const [requestBodyText, setRequestBodyText] = useState('');
    const [jsonParseError, setJsonParseError] = useState(null);

    // Active Tab in Request Panel: 'body' | 'headers' | 'curl'
    const [activeRequestTab, setActiveRequestTab] = useState('body');

    // Execution & Response State
    const [isExecuting, setIsExecuting] = useState(false);
    const [responseStatus, setResponseStatus] = useState(null);
    const [responseDuration, setResponseDuration] = useState(null);
    const [responseData, setResponseData] = useState(null);
    const [responseHeaders, setResponseHeaders] = useState(null);
    const [responseError, setResponseError] = useState(null);

    // Clipboard Copy State
    const [copiedCurl, setCopiedCurl] = useState(false);
    const [copiedResponse, setCopiedResponse] = useState(false);

    // History Log
    const [requestHistory, setRequestHistory] = useState([]);

    // Select2 Options for API Keys
    const apiKeyOptions = useMemo(() => [
        ...apiKeys.map((k) => ({
            value: k.api_key_prefix,
            label: `${k.key_name} (${k.api_key_prefix}••••)`,
            description: t('company.sandbox.key_option_desc', {
                prefix: k.api_key_prefix,
                status: t('status.' + k.status),
                date: new Date(k.created_at).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')
            }),
        })),
        {
            value: 'custom',
            label: t('company.sandbox.custom_token_option'),
            description: t('company.sandbox.custom_token_desc'),
        }
    ], [apiKeys, t, locale]);

    // Compute effective token
    useEffect(() => {
        if (selectedKeyPrefix === 'custom') {
            setTokenToUse(customToken.trim());
        } else {
            setTokenToUse('');
        }
    }, [selectedKeyPrefix, customToken]);

    // Available API Operations Catalog
    const operationsCatalog = useMemo(() => [
        {
            category: t('company.sandbox.cat_shipments'),
            items: [
                {
                    id: 'post_task',
                    title: t('company.sandbox.op_post_task_title'),
                    method: 'POST',
                    path: '/tasks',
                    description: t('company.sandbox.op_post_task_desc'),
                    defaultBody: {
                        external_task_id: `ORD-SA-${Math.floor(1000 + Math.random() * 9000)}`,
                        title: 'نقل أجهزة طبية مبردة',
                        description: 'نقل سريع ومبرد من مستودعات السلي بالرياض إلى مجمع الملك عبد الله الطبي بجدة',
                        pickup_city: 'الرياض',
                        pickup_address: 'مستودعات السلي، مخرج 16',
                        pickup_lat: 24.6312,
                        pickup_lng: 46.8123,
                        dropoff_city: 'جدة',
                        dropoff_address: 'حي الشراع، المستشفى التخصصي',
                        dropoff_lat: 21.5433,
                        dropoff_lng: 39.1728,
                        funding_amount: 4500.00,
                        company_commission_rate: 12.00,
                        estimated_delivery_time: '5 ساعات',
                        expires_in_minutes: 60,
                        metadata: {
                            cargo_type: 'Medical Devices & Vaccines',
                            temperature_celsius: 4,
                            vehicle_type: 'Refrigerated Van 3.5T'
                        }
                    }
                },
                {
                    id: 'post_tasks_batch',
                    title: t('company.sandbox.op_post_tasks_batch_title'),
                    method: 'POST',
                    path: '/tasks/batch',
                    description: t('company.sandbox.op_post_tasks_batch_desc'),
                    defaultBody: {
                        tasks: [
                            {
                                external_task_id: `BATCH-A-${Math.floor(1000 + Math.random() * 9000)}`,
                                title: 'شحنة قطع غيار سيارات عاجلة',
                                pickup_city: 'الرياض',
                                pickup_address: 'الصناعية القديمة',
                                dropoff_city: 'الدمام',
                                dropoff_address: 'حي الخالدية، مجمع الورش',
                                funding_amount: 3200.00,
                                estimated_delivery_time: '4 ساعات',
                                expires_in_minutes: 45
                            },
                            {
                                external_task_id: `BATCH-B-${Math.floor(1000 + Math.random() * 9000)}`,
                                title: 'شحنة طرود تجارة إلكترونية سريعة',
                                pickup_city: 'جدة',
                                pickup_address: 'مستودع الميناء',
                                dropoff_city: 'مكة المكرمة',
                                dropoff_address: 'حي العوالي، مركز التوزيع',
                                funding_amount: 1850.00,
                                estimated_delivery_time: '2 ساعات',
                                expires_in_minutes: 30
                            }
                        ]
                    }
                },
                {
                    id: 'get_tasks',
                    title: t('company.sandbox.op_get_tasks_title'),
                    method: 'GET',
                    path: '/tasks',
                    description: t('company.sandbox.op_get_tasks_desc'),
                    defaultBody: null,
                    queryParams: { status: 'available', per_page: 10 }
                },
                {
                    id: 'get_task_details',
                    title: t('company.sandbox.op_get_task_details_title'),
                    method: 'GET',
                    path: '/tasks/{id}',
                    description: t('company.sandbox.op_get_task_details_desc'),
                    hasPathParam: true,
                    defaultBody: null
                },
                {
                    id: 'cancel_task',
                    title: t('company.sandbox.op_cancel_task_title'),
                    method: 'POST',
                    path: '/tasks/{id}/cancel',
                    description: t('company.sandbox.op_cancel_task_desc'),
                    hasPathParam: true,
                    defaultBody: {}
                },
                {
                    id: 'complete_task',
                    title: t('company.sandbox.op_complete_task_title'),
                    method: 'POST',
                    path: '/tasks/{id}/complete',
                    description: t('company.sandbox.op_complete_task_desc'),
                    hasPathParam: true,
                    defaultBody: {}
                },
                {
                    id: 'mock_fund_task',
                    title: t('company.sandbox.op_mock_fund_title'),
                    method: 'POST',
                    path: '/tasks/{id}/mock-fund',
                    description: t('company.sandbox.op_mock_fund_desc'),
                    hasPathParam: true,
                    defaultBody: {
                        investor_name: 'مستثمر تجريبي (Sandbox Investor)'
                    }
                },
                {
                    id: 'update_task_tracking',
                    title: t('company.sandbox.op_update_task_tracking_title'),
                    method: 'POST',
                    path: '/tasks/{id}/update-status',
                    description: t('company.sandbox.op_update_task_tracking_desc'),
                    hasPathParam: true,
                    defaultBody: {
                        tracking_status: 'in_transit',
                        notes: 'الشاحنة عبرت نقطة التفتيش بطريق الرياض-الدمام السريع',
                        latitude: 25.1234,
                        longitude: 48.5678
                    }
                }
            ]
        },
        {
            category: t('company.sandbox.cat_webhooks'),
            items: [
                {
                    id: 'post_webhook_test',
                    title: t('company.sandbox.op_post_webhook_test_title'),
                    method: 'POST',
                    path: '/webhooks/test',
                    description: t('company.sandbox.op_post_webhook_test_desc'),
                    defaultBody: {}
                },
                {
                    id: 'get_webhook_events',
                    title: t('company.sandbox.op_get_webhook_events_title'),
                    method: 'GET',
                    path: '/webhooks/events',
                    description: t('company.sandbox.op_get_webhook_events_desc'),
                    defaultBody: null
                },
                {
                    id: 'get_ping',
                    title: t('company.sandbox.op_get_ping_title'),
                    method: 'GET',
                    path: '/ping',
                    description: t('company.sandbox.op_get_ping_desc'),
                    defaultBody: null
                }
            ]
        }
    ], [recentTasks, t]);

    // Select operation and load its defaults
    const handleSelectOperation = (op) => {
        setActiveOperationId(op.id);
        setHttpMethod(op.method);
        setEndpointPath(op.path);
        setJsonParseError(null);

        if (op.defaultBody) {
            setRequestBodyText(JSON.stringify(op.defaultBody, null, 2));
            setActiveRequestTab('body');
        } else {
            setRequestBodyText('');
            setActiveRequestTab('headers');
        }
    };

    // Initialize with first operation
    useEffect(() => {
        const firstOp = operationsCatalog[0].items[0];
        handleSelectOperation(firstOp);
    }, []);

    // Resolve dynamic path (e.g. replace {id} with input value)
    const resolvedPath = useMemo(() => {
        let path = endpointPath;
        if (path.includes('{id}')) {
            path = path.replace('{id}', pathParams.id || '1');
        }
        return path;
    }, [endpointPath, pathParams]);

    const fullRequestUrl = useMemo(() => {
        const base = apiBaseUrl || '/api/v1';
        return `${base}${resolvedPath}`;
    }, [apiBaseUrl, resolvedPath]);

    // Generate cURL command
    const generatedCurl = useMemo(() => {
        const tokenDisplay = tokenToUse || 'YOUR_API_KEY';
        let cmd = `curl -X ${httpMethod} "${fullRequestUrl}" \\\n  -H "Authorization: Bearer ${tokenDisplay}" \\\n  -H "Content-Type: application/json" \\\n  -H "Accept: application/json"`;

        if (httpMethod !== 'GET' && requestBodyText && requestBodyText.trim() !== '{}' && requestBodyText.trim() !== '') {
            cmd += ` \\\n  -d '${requestBodyText.replace(/\n/g, '')}'`;
        }
        return cmd;
    }, [httpMethod, fullRequestUrl, tokenToUse, requestBodyText]);

    // Execute Request
    const handleExecuteRequest = async () => {
        setIsExecuting(true);
        setResponseStatus(null);
        setResponseDuration(null);
        setResponseData(null);
        setResponseHeaders(null);
        setResponseError(null);

        let parsedBody = null;
        if (httpMethod !== 'GET' && requestBodyText.trim() !== '') {
            try {
                parsedBody = JSON.parse(requestBodyText);
                setJsonParseError(null);
            } catch (err) {
                setJsonParseError(t('company.sandbox.json_error_invalid'));
                setIsExecuting(false);
                return;
            }
        }

        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        if (tokenToUse) {
            headers['Authorization'] = `Bearer ${tokenToUse}`;
            headers['X-Api-Key'] = tokenToUse;
        }

        const startTime = performance.now();

        try {
            const response = await axios({
                method: httpMethod.toLowerCase(),
                url: fullRequestUrl,
                data: parsedBody,
                headers: headers,
                validateStatus: () => true, // accept all HTTP status codes so we can display them!
            });

            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            setResponseStatus(response.status);
            setResponseDuration(duration);
            setResponseData(response.data);
            setResponseHeaders(response.headers);

            // Add to history
            setRequestHistory((prev) => [
                {
                    id: Date.now(),
                    method: httpMethod,
                    path: resolvedPath,
                    status: response.status,
                    duration: duration,
                    timestamp: new Date().toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US'),
                },
                ...prev.slice(0, 9),
            ]);
        } catch (err) {
            const endTime = performance.now();
            const duration = Math.round(endTime - startTime);

            setResponseStatus(err.response?.status || 500);
            setResponseDuration(duration);
            setResponseData(err.response?.data || { message: err.message });
            setResponseHeaders(err.response?.headers || {});
            setResponseError(err.message);
        } finally {
            setIsExecuting(false);
        }
    };

    // Format JSON in editor
    const handleFormatJson = () => {
        try {
            if (!requestBodyText.trim()) return;
            const parsed = JSON.parse(requestBodyText);
            setRequestBodyText(JSON.stringify(parsed, null, 2));
            setJsonParseError(null);
        } catch (e) {
            setJsonParseError(t('company.sandbox.json_error_format'));
        }
    };

    // Reset current template
    const handleResetCurrentTemplate = () => {
        for (const cat of operationsCatalog) {
            const found = cat.items.find((i) => i.id === activeOperationId);
            if (found) {
                handleSelectOperation(found);
                break;
            }
        }
    };

    const handleCopy = (text, type = 'curl') => {
        navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
        if (type === 'curl') {
            setCopiedCurl(true);
            setTimeout(() => setCopiedCurl(false), 2000);
        } else {
            setCopiedResponse(true);
            setTimeout(() => setCopiedResponse(false), 2000);
        }
    };

    return (
        <AuthenticatedLayout title={t('company.sandbox.title')}>
            <Head title={t('company.sandbox.page_title')} />

            <div className="space-y-6 pb-16">
                {/* Header Banner */}
                <div className="bg-white dark:bg-[#0E1338] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-violet-900/40 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#6320EE] text-white flex items-center justify-center shadow-lg shadow-violet-600/30">
                                    <Terminal className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                        <span>{t('company.sandbox.title')}</span>
                                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-[#6320EE] dark:text-violet-300 border border-violet-500/20 font-mono">
                                            {t('company.sandbox.badge')}
                                        </span>
                                    </h1>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {t('company.sandbox.subtitle')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Top Action Buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <Link
                                href={route('company.api.index')}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 dark:hover:bg-violet-900/40 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-violet-800/40 text-xs font-bold transition-all shadow-sm"
                            >
                                <Key className="w-4 h-4 text-violet-500" />
                                <span>{t('company.sandbox.btn_api_keys')}</span>
                            </Link>
                        </div>
                    </div>

                    {/* Authentication Selector & Server Bar */}
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-violet-900/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                <Key className="w-4 h-4 text-[#6320EE]" />
                                <span>{t('company.sandbox.auth_label')}</span>
                            </div>

                            <div className="w-full sm:w-80">
                                <Select2
                                    value={selectedKeyPrefix}
                                    onChange={(val) => setSelectedKeyPrefix(val)}
                                    options={apiKeyOptions}
                                    placeholder={t('company.sandbox.auth_placeholder')}
                                    searchPlaceholder={t('company.sandbox.auth_search_placeholder')}
                                />
                            </div>

                            {selectedKeyPrefix === 'custom' && (
                                <input
                                    type="text"
                                    value={customToken}
                                    onChange={(e) => setCustomToken(e.target.value)}
                                    placeholder={t('company.sandbox.custom_token_placeholder')}
                                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-violet-900/40 bg-slate-50 dark:bg-[#070A1E] text-slate-800 dark:text-slate-200 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                                />
                            )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-[#070A1E] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-violet-900/30 shrink-0">
                            <Server className="w-3.5 h-3.5 text-blue-500" />
                            <span>{t('company.sandbox.active_server', { url: apiBaseUrl || '/api/v1' })}</span>
                        </div>
                    </div>
                </div>

                {/* Main Interactive Playground Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left/Sidebar Column: Operations Catalog (4 Cols) */}
                    <div className="lg:col-span-4 bg-white dark:bg-[#0E1338] rounded-3xl p-5 border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-violet-900/30">
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#6320EE]" />
                                <span>{t('company.sandbox.operations_title')}</span>
                            </h3>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-violet-950/60 text-slate-600 dark:text-slate-300">
                                {t('company.sandbox.operations_count', { count: operationsCatalog.reduce((acc, cat) => acc + cat.items.length, 0) })}
                            </span>
                        </div>

                        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-1 custom-scrollbar">
                            {operationsCatalog.map((category, catIdx) => (
                                <div key={catIdx} className="space-y-2">
                                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                                        {category.category}
                                    </h4>
                                    <div className="space-y-1.5">
                                        {category.items.map((op) => {
                                            const isSelected = activeOperationId === op.id;
                                            return (
                                                <button
                                                    key={op.id}
                                                    type="button"
                                                    onClick={() => handleSelectOperation(op)}
                                                    className={`w-full text-right p-3 rounded-2xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-violet-500/10 border-violet-500/50 shadow-sm ring-1 ring-violet-500/30'
                                                            : 'bg-slate-50/60 dark:bg-[#070A1E]/60 border-slate-200/80 dark:border-violet-900/20 hover:bg-slate-100 dark:hover:bg-[#0B0F2A] hover:border-slate-300 dark:hover:border-violet-800/40'
                                                    }`}
                                                >
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-black shrink-0 ${
                                                        op.method === 'POST'
                                                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                                            : op.method === 'GET'
                                                            ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20'
                                                            : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                                    }`}>
                                                        {op.method}
                                                    </span>

                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-xs truncate ${isSelected ? 'font-black text-[#6320EE] dark:text-violet-300' : 'font-bold text-slate-800 dark:text-slate-200'}`}>
                                                            {op.title}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 font-mono truncate dir-ltr text-right mt-0.5">
                                                            {op.path}
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Executions History Mini Log */}
                        {requestHistory.length > 0 && (
                            <div className="pt-4 border-t border-slate-100 dark:border-violet-900/30 space-y-2">
                                <h4 className="text-[11px] font-bold text-slate-400 px-2 flex items-center justify-between">
                                    <span>{t('company.sandbox.recent_executions')}</span>
                                    <Clock className="w-3 h-3 text-slate-400" />
                                </h4>
                                <div className="space-y-1">
                                    {requestHistory.map((item) => (
                                        <div
                                            key={item.id}
                                            className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/30 flex items-center justify-between text-[10px] font-mono"
                                        >
                                            <div className="flex items-center gap-1.5 truncate">
                                                <span className={item.status < 300 ? 'text-[#6320EE] font-bold' : 'text-rose-500 font-bold'}>
                                                    {item.status}
                                                </span>
                                                <span className="text-slate-500">{item.method}</span>
                                                <span className="text-slate-700 dark:text-slate-300 truncate">{item.path}</span>
                                            </div>
                                            <span className="text-slate-400 shrink-0">{item.duration}ms</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right/Main Column: Console Workspace & Response (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Request Builder Console */}
                        <div className="bg-white dark:bg-[#0E1338] rounded-3xl p-6 border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-5">
                            {/* URL and Execution Bar */}
                            <div className="space-y-3">
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                    {/* Method Badge */}
                                    <span className={`px-4 py-2.5 rounded-xl text-xs font-mono font-black flex items-center justify-center shrink-0 ${
                                        httpMethod === 'POST'
                                            ? 'bg-blue-600 text-white'
                                            : httpMethod === 'GET'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-rose-600 text-white'
                                    }`}>
                                        {httpMethod}
                                    </span>

                                    {/* URL Input */}
                                    <div className="flex-1 relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={fullRequestUrl}
                                            className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none select-all"
                                        />
                                    </div>

                                    {/* Execute Button */}
                                    <button
                                        type="button"
                                        onClick={handleExecuteRequest}
                                        disabled={isExecuting}
                                        className="px-6 py-2.5 rounded-xl bg-[#6320EE] hover:bg-[#5219cf] text-white text-xs font-bold transition-all shadow-md shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                                    >
                                        {isExecuting ? (
                                            <>
                                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>{t('company.sandbox.executing')}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Play className="w-3.5 h-3.5 fill-current" />
                                                <span>{t('company.sandbox.btn_execute')}</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Dynamic Path Parameter if endpoint has {id} */}
                                {endpointPath.includes('{id}') && (
                                    <div className="p-3 bg-violet-50/50 dark:bg-violet-950/20 rounded-2xl border border-violet-500/20 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                            <Sliders className="w-3.5 h-3.5 text-[#6320EE]" />
                                            <span>{t('company.sandbox.param_task_id_label')}</span>
                                        </div>

                                        <input
                                            type="text"
                                            value={pathParams.id}
                                            onChange={(e) => setPathParams({ ...pathParams, id: e.target.value })}
                                            placeholder={t('company.sandbox.param_task_id_placeholder')}
                                            className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                                        />

                                        {/* Quick Select2 for selecting from recent tasks */}
                                        {recentTasks.length > 0 && (
                                            <div className="w-full sm:w-64 shrink-0">
                                                <Select2
                                                    value={pathParams.id}
                                                    onChange={(val) => setPathParams({ ...pathParams, id: val })}
                                                    options={recentTasks.map((t) => ({
                                                        value: t.task_number || t.external_task_id || String(t.id),
                                                        label: `${t.task_number || t.external_task_id || t.id}`,
                                                        description: `${t.title || 'شحنة'} | ${t.status}`,
                                                    }))}
                                                    placeholder={t('company.sandbox.param_task_select_placeholder')}
                                                    searchPlaceholder={t('company.sandbox.param_task_search_placeholder')}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Request Tabs Navigation */}
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-violet-900/30">
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setActiveRequestTab('body')}
                                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                                            activeRequestTab === 'body'
                                                ? 'border-[#6320EE] text-[#6320EE] dark:text-violet-300'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                        }`}
                                    >
                                        <FileJson className="w-3.5 h-3.5" />
                                        <span>{t('company.sandbox.tab_body')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveRequestTab('headers')}
                                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                                            activeRequestTab === 'headers'
                                                ? 'border-[#6320EE] text-[#6320EE] dark:text-violet-300'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                        }`}
                                    >
                                        <Key className="w-3.5 h-3.5" />
                                        <span>{t('company.sandbox.tab_headers')}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setActiveRequestTab('curl')}
                                        className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                                            activeRequestTab === 'curl'
                                                ? 'border-[#6320EE] text-[#6320EE] dark:text-violet-300'
                                                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                        }`}
                                    >
                                        <Terminal className="w-3.5 h-3.5" />
                                        <span>{t('company.sandbox.tab_curl')}</span>
                                    </button>
                                </div>

                                {/* Editor Action Buttons */}
                                {activeRequestTab === 'body' && httpMethod !== 'GET' && (
                                    <div className="flex items-center gap-2 pb-1">
                                        <button
                                            type="button"
                                            onClick={handleFormatJson}
                                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 text-slate-600 dark:text-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                                            title={t('company.sandbox.tooltip_format_json')}
                                        >
                                            {t('company.sandbox.btn_format_json')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResetCurrentTemplate}
                                            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
                                            title={t('company.sandbox.tooltip_reset_template')}
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Tab Content 1: Body Editor */}
                            {activeRequestTab === 'body' && (
                                <div className="space-y-2">
                                    {httpMethod === 'GET' ? (
                                        <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-violet-900/40 rounded-2xl">
                                            {t('company.sandbox.get_no_body_hint')}
                                        </div>
                                    ) : (
                                        <>
                                            <textarea
                                                rows={11}
                                                value={requestBodyText}
                                                onChange={(e) => {
                                                    setRequestBodyText(e.target.value);
                                                    setJsonParseError(null);
                                                }}
                                                className="w-full p-4 rounded-2xl bg-[#070A1E] text-violet-200 font-mono text-xs border border-slate-800 focus:outline-none focus:border-violet-500 leading-relaxed custom-scrollbar dir-ltr"
                                                placeholder="{ ... }"
                                            />
                                            {jsonParseError && (
                                                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-500 text-xs flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 shrink-0" />
                                                    <span>{jsonParseError}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Tab Content 2: Headers Inspector */}
                            {activeRequestTab === 'headers' && (
                                <div className="space-y-2 font-mono text-xs">
                                    <div className="p-3 bg-slate-50 dark:bg-[#070A1E] rounded-xl border border-slate-200 dark:border-violet-900/30 flex items-center justify-between">
                                        <span className="text-slate-500">Authorization:</span>
                                        <span className="text-[#6320EE] dark:text-violet-300 font-bold truncate max-w-md select-all">
                                            Bearer {tokenToUse || 'YOUR_API_KEY'}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-[#070A1E] rounded-xl border border-slate-200 dark:border-violet-900/30 flex items-center justify-between">
                                        <span className="text-slate-500">Content-Type:</span>
                                        <span className="text-slate-800 dark:text-slate-200">application/json</span>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-[#070A1E] rounded-xl border border-slate-200 dark:border-violet-900/30 flex items-center justify-between">
                                        <span className="text-slate-500">Accept:</span>
                                        <span className="text-slate-800 dark:text-slate-200">application/json</span>
                                    </div>
                                </div>
                            )}

                            {/* Tab Content 3: cURL Command */}
                            {activeRequestTab === 'curl' && (
                                <div className="relative rounded-2xl bg-[#070A1E] p-4 border border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(generatedCurl, 'curl')}
                                        className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        {copiedCurl ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Copy className="w-3.5 h-3.5" />}
                                        <span>{copiedCurl ? t('company.sandbox.copied_curl') : t('company.sandbox.btn_copy_curl')}</span>
                                    </button>
                                    <pre className="text-xs text-violet-200 font-mono overflow-x-auto leading-relaxed pt-8 dir-ltr select-all">
                                        {generatedCurl}
                                    </pre>
                                </div>
                            )}
                        </div>

                        {/* Live Response Panel */}
                        <div className="bg-white dark:bg-[#0E1338] rounded-3xl p-6 border border-slate-200 dark:border-violet-900/40 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-[#6320EE]" />
                                    <span>{t('company.sandbox.response_title')}</span>
                                </h3>

                                {responseStatus && (
                                    <div className="flex items-center gap-2">
                                        {/* Status Badge */}
                                        <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-black border ${
                                            responseStatus >= 200 && responseStatus < 300
                                                ? 'bg-[#6320EE]/10 text-[#6320EE] dark:text-violet-300 border-violet-500/30'
                                                : responseStatus >= 400 && responseStatus < 500
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                        }`}>
                                            HTTP {responseStatus}
                                        </span>

                                        {/* Latency */}
                                        {responseDuration !== null && (
                                            <span className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-100 dark:bg-[#070A1E] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-violet-900/30">
                                                {responseDuration} ms
                                            </span>
                                        )}

                                        {/* Copy Response Button */}
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(responseData, 'response')}
                                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-violet-950/40 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                            title={t('company.sandbox.tooltip_copy_response')}
                                        >
                                            {copiedResponse ? <Check className="w-4 h-4 text-orange-400" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Response Body Box */}
                            {isExecuting ? (
                                <div className="py-16 text-center text-slate-400 space-y-3">
                                    <div className="w-8 h-8 border-3 border-[#6320EE] border-t-transparent rounded-full animate-spin mx-auto" />
                                    <p className="text-xs font-bold">{t('company.sandbox.response_executing')}</p>
                                </div>
                            ) : responseData ? (
                                <div className="rounded-2xl bg-[#070A1E] p-4 border border-slate-800 overflow-hidden">
                                    <pre className="text-xs text-violet-200 font-mono overflow-x-auto max-h-[420px] leading-relaxed custom-scrollbar dir-ltr select-all">
                                        {JSON.stringify(responseData, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <div className="py-16 px-4 text-center border border-dashed border-slate-200 dark:border-violet-900/30 rounded-2xl">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-[#070A1E] text-slate-400 flex items-center justify-center mx-auto mb-3">
                                        <Send className="w-5 h-5" />
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                        {t('company.sandbox.response_waiting_title')}
                                    </h4>
                                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                                        {t('company.sandbox.response_waiting_desc')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
