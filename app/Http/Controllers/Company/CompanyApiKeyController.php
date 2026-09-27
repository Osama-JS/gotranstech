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

    public function index(): Response
    {
        $company = Auth::user()->companyProfile;
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

        $apiBaseUrl = url('/api/v1');

        return Inertia::render('Company/Api/Index', [
            'company' => $company,
            'apiKeys' => $apiKeys,
            'apiBaseUrl' => $apiBaseUrl,
            'stats' => $stats,
        ]);
    }

    public function generate(Request $request)
    {
        $request->validate([
            'key_name' => 'required|string|max:100',
        ]);

        $company = Auth::user()->companyProfile;
        $result = CompanyApiKey::generateKey($company->id, $request->input('key_name'));

        $this->auditLogService->log(
            'created',
            $result['model'],
            [],
            ['key_name' => $result['model']->key_name],
            "توليد مفتاح API جديد بواسطة الشركة: {$result['model']->key_name}"
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

        $company = Auth::user()->companyProfile;
        $company->webhook_url = $request->input('webhook_url');
        if ($secret = $request->input('webhook_secret')) {
            $company->webhook_secret = $secret;
        }
        $company->save();

        return back()->with('success', 'تم حفظ إعدادات الـ Webhook بنجاح.');
    }

    public function testWebhook(Request $request)
    {
        $company = Auth::user()->companyProfile;
        if (empty($company->webhook_url)) {
            return back()->with('error', 'يرجى إدخال رابط Webhook صالح وحفظه أولاً قبل إجراء الاختبار.');
        }

        $testPayload = [
            'event' => 'test.ping',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'message' => 'هذا إشعار تجريبي لاختبار سلامة الاتصال بين منصة GoTransTech وخوادم شركتكم.',
                'company_name' => $company->company_name,
                'company_id' => $company->id,
                'status' => 'connected',
            ],
        ];

        $payloadJson = json_encode($testPayload);
        $secret = $company->webhook_secret ?? 'gotech_secret';
        $signature = hash_hmac('sha256', $payloadJson, $secret);

        try {
            $startTime = microtime(true);
            $response = Http::timeout(5)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-GoTech-Signature' => $signature,
                    'User-Agent' => 'GoTech-Webhook-Tester/1.0',
                ])
                ->post($company->webhook_url, $testPayload);

            $durationMs = round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                return back()->with('success', "تم إرسال الإشعار التجريبي بنجاح! استجاب خادمكم بحالة {$response->status()} OK خلال {$durationMs}ms.");
            } else {
                return back()->with('error', "استجاب خادمكم بكود استجابة: {$response->status()} {$response->reason()} (استغرق {$durationMs}ms). يرجى التأكد من جهوزية نقطة الاستلام ومعالجة الطلب.");
            }
        } catch (\Exception $e) {
            return back()->with('error', "تعذر الاتصال بالرابط المحدد: " . $e->getMessage());
        }
    }

    public function revoke(int $id)
    {
        $company = Auth::user()->companyProfile;
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

        return back()->with('success', 'تم إلغاء تفعيل المفتاح البرمجي.');
    }
}
