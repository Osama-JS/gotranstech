<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyApiKey;
use App\Models\Task;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class CompanyApiKeyController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Retrieve the active company profile safely for company users or administrators.
     * Strictly forbids investors from accessing company API settings.
     */
    protected function getTargetCompany(): \App\Models\CompanyProfile
    {
        $user = Auth::user();
        if (!$user) {
            abort(401);
        }

        // Strictly forbid investors
        if ($user->isInvestor()) {
            abort(403, 'عذراً، هذا القسم ومختبر الربط البرمجي مخصص حصراً لحسابات الشركات اللوجستية.');
        }

        // Clean up any company profile erroneously attached to an investor user
        \App\Models\CompanyProfile::whereHas('user', function ($q) {
            $q->where('user_type', 'investor');
        })->delete();

        $company = $user->companyProfile;

        if (!$company) {
            if ($user->isAdmin()) {
                $company = \App\Models\CompanyProfile::first();
            }

            if (!$company && $user->isCompany()) {
                $company = \App\Models\CompanyProfile::firstOrCreate(
                    ['user_id' => $user->id],
                    [
                        'company_name' => $user->name ?: 'الشركة اللوجستية',
                        'contact_person' => $user->name,
                        'contact_email' => $user->email,
                        'city' => 'الرياض',
                        'address' => 'طريق الملك فهد، الرياض',
                        'status' => 'active',
                        'platform_commission_rate' => 10.00,
                    ]
                );
            }
        }

        if (!$company) {
            abort(404, 'لم يتم العثور على سجل الشركة اللوجستية.');
        }

        return $company;
    }

    public function index(): Response
    {
        $company = $this->getTargetCompany();
        $apiKeys = CompanyApiKey::where('company_id', $company->id)
            ->latest()
            ->get();

        $stats = [
            'active_keys' => $apiKeys->where('status', 'active')->count(),
            'total_keys' => $apiKeys->count(),
            'api_tasks_count' => Task::where('company_id', $company->id)->whereNotNull('external_task_id')->count(),
            'total_tasks_count' => Task::where('company_id', $company->id)->count(),
            'webhook_configured' => !empty($company->webhook_url),
            'last_key_used_at' => $apiKeys->whereNotNull('last_used_at')->sortByDesc('last_used_at')->first()?->last_used_at?->diffForHumans() ?? 'لم يُستخدم بعد',
        ];

        $apiBaseUrl = $this->getApiBaseUrl();

        return Inertia::render('Company/Api/Index', [
            'company' => $company,
            'apiKeys' => $apiKeys,
            'apiBaseUrl' => $apiBaseUrl,
            'stats' => $stats,
        ]);
    }

    /**
     * Dedicated Interactive API Sandbox / Playground
     */
    public function sandbox(Request $request): Response
    {
        $company = $this->getTargetCompany();
        $isTestMode = $company->isTestMode();
        $apiKeys = CompanyApiKey::where('company_id', $company->id)
            ->where('status', 'active')
            ->latest()
            ->get();

        $recentTasks = $isTestMode
            ? \App\Models\TestTask::where('company_id', $company->id)
                ->latest()
                ->take(8)
                ->select('id', 'task_number', 'external_task_id', 'title', 'status', 'funding_amount', 'is_mock_funded')
                ->get()
            : Task::where('company_id', $company->id)
                ->latest()
                ->take(8)
                ->select('id', 'task_number', 'external_task_id', 'title', 'status', 'funding_amount')
                ->get();

        return Inertia::render('Company/Api/Sandbox', [
            'company' => $company,
            'apiKeys' => $apiKeys,
            'apiBaseUrl' => $this->getApiBaseUrl(),
            'recentTasks' => $recentTasks,
            'isTestMode' => $isTestMode,
            'environment' => $company->environment ?? 'test',
        ]);
    }

    /**
     * Retrieve the public API Base URL for external companies.
     * Uses EXTERNAL_API_BASE_URL if configured, otherwise falls back to local /api/v1.
     */
    protected function getApiBaseUrl(): string
    {
        $customUrl = config('services.external_api.base_url');
        if (!empty($customUrl)) {
            return rtrim($customUrl, '/');
        }

        return url('/api/v1');
    }

    public function generate(Request $request)
    {
        $request->validate([
            'key_name' => 'required|string|max:100',
        ]);

        $company = $this->getTargetCompany();
        $env = $company->environment ?? 'test';
        $result = CompanyApiKey::generateKey($company->id, $request->input('key_name'), $env);

        $this->auditLogService->log(
            'created',
            $result['model'],
            [],
            ['key_name' => $result['model']->key_name, 'environment' => $env],
            "توليد مفتاح API جديد ({$env}) بواسطة الشركة: {$result['model']->key_name}"
        );

        return back()->with([
            'success' => 'تم إنشاء مفتاح API بنجاح. يرجى نسخه الآن وحفظه في بيئة آمنة حيث لن يظهر كاملاً بعد الآن.',
            'generated_key' => $result['plainTextToken'],
        ]);
    }

    public function updateWebhook(Request $request)
    {
        $request->validate([
            'webhook_url' => 'nullable|url|max:255',
            'webhook_secret' => 'nullable|string|max:100',
        ]);

        $company = $this->getTargetCompany();
        $newUrl = $request->input('webhook_url');

        if (!empty($newUrl)) {
            [$isUrlValid, $errorMsg] = \App\Services\UrlSecurityValidator::validateWebhookUrl($newUrl);
            if (!$isUrlValid) {
                return back()->with('error', "رابط الـ Webhook غير مسموح به أمنياً: {$errorMsg}");
            }
        }

        $company->webhook_url = $newUrl;
        if ($secret = $request->input('webhook_secret')) {
            $company->webhook_secret = $secret;
        } elseif (empty($company->webhook_secret)) {
            $company->webhook_secret = 'whsec_' . bin2hex(random_bytes(24));
        }
        $company->save();

        return back()->with('success', 'تم حفظ إعدادات الـ Webhook بنجاح وتأمينه بتشفير التوقيع الرقمي.');
    }

    public function testWebhook(Request $request)
    {
        $company = $this->getTargetCompany();
        if (empty($company->webhook_url)) {
            return back()->with('error', 'يرجى إدخال رابط Webhook صالح وحفظه أولاً قبل إجراء الاختبار.');
        }

        [$isUrlValid, $errorMsg] = \App\Services\UrlSecurityValidator::validateWebhookUrl($company->webhook_url);
        if (!$isUrlValid) {
            return back()->with('error', "رابط الـ Webhook غير مسموح به أمنياً: {$errorMsg}");
        }

        if (empty($company->webhook_secret)) {
            $company->webhook_secret = 'whsec_' . bin2hex(random_bytes(24));
            $company->saveQuietly();
        }

        $timestamp = now()->toIso8601String();
        $testPayload = [
            'event' => 'test.ping',
            'timestamp' => $timestamp,
            'data' => [
                'message' => 'هذا إشعار تجريبي لاختبار سلامة الاتصال بين منصة GoTransTech وخوادم شركتكم.',
                'company_name' => $company->company_name,
                'company_id' => $company->id,
                'status' => 'connected',
            ],
        ];

        $payloadJson = json_encode($testPayload);
        $signature = hash_hmac('sha256', $timestamp . '.' . $payloadJson, $company->webhook_secret);

        try {
            $startTime = microtime(true);
            $response = Http::timeout(5)
                ->withoutRedirecting() // SSRF Mitigation: Disallow redirects to internal services
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-GoTech-Signature' => $signature,
                    'X-GoTech-Timestamp' => $timestamp,
                    'User-Agent' => 'GoTech-Webhook-Tester/1.0',
                ])
                ->post($company->webhook_url, $testPayload);

            $durationMs = round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                return back()->with('success', "تم إرسال الإشعار التجريبي بنجاح! استجاب خادمكم بحالة {$response->status()} OK خلال {$durationMs}ms.");
            } else {
                return back()->with('error', "استجاب خادمكم بكود استجابة: {$response->status()} (استغرق {$durationMs}ms). يرجى التأكد من جهوزية نقطة الاستلام ومعالجة الطلب.");
            }
        } catch (\Exception $e) {
            return back()->with('error', "تعذر الاتصال بالرابط المحدد: " . $e->getMessage());
        }
    }

    public function revoke(int $id)
    {
        $company = $this->getTargetCompany();
        $apiKey = CompanyApiKey::where('company_id', $company->id)->findOrFail($id);
        $apiKey->status = 'revoked';
        $apiKey->save();

        $this->auditLogService->log(
            'deleted',
            $apiKey,
            ['status' => 'active'],
            ['status' => 'revoked'],
            "إلغاء تنشيط مفتاح API #{$apiKey->id}"
        );

        // Security notification to company
        \App\Services\NotificationDispatcherService::dispatch(
            'company.api_key_regenerated',
            "تنبيه أمني: إلغاء تنشيط مفتاح API",
            "تم إلغاء تنشيط مفتاح الربط البرمجي ({$apiKey->key_name}) بنجاح. لن يتم قبول أي طلبات شحن برمجية باستخدام هذا المفتاح بعد الآن.",
            route('company.api.index', [], false),
            ['key_id' => $apiKey->id],
            Auth::user(),
            'warning'
        );

        return back()->with('success', 'تم إلغاء تفعيل المفتاح البرمجي.');
    }
}
