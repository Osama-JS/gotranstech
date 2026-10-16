<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\UrlSecurityValidator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class WebhookApiController extends BaseApiController
{
    /**
     * Dispatch a test ping event to the company's configured webhook URL.
     */
    public function test(Request $request): JsonResponse
    {
        $company = $this->requireCompany($request);

        if (empty($company->webhook_url)) {
            return $this->error(
                'لم يتم ضبط رابط الـ Webhook الخاص بشركتكم بعد. يرجى إدخال الرابط في لوحة تحكم الشركة.',
                422,
                ['webhook_url' => 'Missing webhook URL'],
                'MISSING_WEBHOOK_URL'
            );
        }

        // SSRF Defense: Check URL destination before firing
        [$isUrlValid, $errorMsg] = UrlSecurityValidator::validateWebhookUrl($company->webhook_url);
        if (!$isUrlValid) {
            return $this->error(
                "رابط الـ Webhook غير مسموح به أمنياً: {$errorMsg}",
                422,
                ['webhook_url' => $errorMsg],
                'INSECURE_WEBHOOK_URL'
            );
        }

        // Ensure strong cryptographic secret is assigned
        if (empty($company->webhook_secret)) {
            $company->webhook_secret = 'whsec_' . bin2hex(random_bytes(24));
            $company->saveQuietly();
        }

        $timestamp = now()->toIso8601String();
        $testPayload = [
            'event' => 'test.ping',
            'timestamp' => $timestamp,
            'attempt_id' => 'att_' . uniqid(),
            'data' => [
                'message' => 'هذا إشعار تجريبي لاختبار سلامة واستجابة خوادمكم لاستقبال إشعارات GoTech.',
                'company_id' => $company->id,
                'company_name' => $company->company_name,
                'environment' => config('app.env', 'production'),
            ],
        ];

        $payloadJson = json_encode($testPayload);
        $signature = hash_hmac('sha256', $timestamp . '.' . $payloadJson, $company->webhook_secret);

        $startTime = microtime(true);

        try {
            $response = Http::timeout(5)
                ->withoutRedirecting() // SSRF Mitigation: Block internal redirect chains
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-GoTech-Signature' => $signature,
                    'X-GoTech-Timestamp' => $timestamp,
                    'User-Agent' => 'GoTech-Webhook-Dispatcher/1.0',
                ])
                ->post($company->webhook_url, $testPayload);

            $durationMs = round((microtime(true) - $startTime) * 1000);

            return $this->success([
                'target_url' => $company->webhook_url,
                'status_code' => $response->status(),
                'response_time_ms' => $durationMs,
                'successful' => $response->successful(),
                'sent_signature' => $signature,
            ], $response->successful() ? 'تم استلام الإشعار بنجاح من قبل خادمكم' : "استجاب خادمكم بكود حالة ({$response->status()})");
        } catch (\Exception $e) {
            $durationMs = round((microtime(true) - $startTime) * 1000);
            return $this->error(
                'تعذر الاتصال بخادم الـ Webhook الخاص بكم: ' . $e->getMessage(),
                502,
                [
                    'target_url' => $company->webhook_url,
                    'duration_ms' => $durationMs,
                ],
                'WEBHOOK_CONNECTION_FAILED'
            );
        }
    }

    /**
     * List supported Webhook events and their payloads.
     */
    public function events(Request $request): JsonResponse
    {
        return $this->success([
            'signing_algorithm' => 'HMAC-SHA256',
            'signature_header' => 'X-GoTech-Signature',
            'timestamp_header' => 'X-GoTech-Timestamp',
            'signature_format' => 'hash_hmac("sha256", timestamp . "." . json_payload, secret)',
            'events' => [
                [
                    'event' => 'task.funded',
                    'description' => 'يُطلق فور قيام مستثمر بتمويل المهمة اللوجستية وإيداع المبلغ في رصيد التمويل.',
                    'sample_payload' => [
                        'event' => 'task.funded',
                        'timestamp' => now()->toIso8601String(),
                        'data' => [
                            'task_id' => 1024,
                            'task_number' => 'TSK-202610-001',
                            'external_task_id' => 'ORD-RYD-8821',
                            'funding_amount' => 4500.00,
                            'funded_at' => now()->toIso8601String(),
                            'status' => 'funded',
                        ],
                    ],
                ],
                [
                    'event' => 'task.expired',
                    'description' => 'يُطلق إذا انتهت صلاحية عرض المهمة دون أن يتم تمويلها من أي مستثمر.',
                    'sample_payload' => [
                        'event' => 'task.expired',
                        'timestamp' => now()->toIso8601String(),
                        'data' => [
                            'task_id' => 1024,
                            'task_number' => 'TSK-202610-001',
                            'external_task_id' => 'ORD-RYD-8821',
                            'status' => 'expired',
                        ],
                    ],
                ],
                [
                    'event' => 'withdrawal.approved',
                    'description' => 'يُطلق فور اعتماد وصرف طلب السحب المالي وتحويله لحساب الشركة البنكي.',
                    'sample_payload' => [
                        'event' => 'withdrawal.approved',
                        'timestamp' => now()->toIso8601String(),
                        'data' => [
                            'withdrawal_id' => 88,
                            'request_number' => 'WTH-20261006-1204',
                            'amount' => 12500.00,
                            'bank_name' => 'Al Rajhi Bank',
                            'status' => 'approved',
                        ],
                    ],
                ],
            ],
        ], 'قائمة أحداث الـ Webhooks المدعومة');
    }
}
