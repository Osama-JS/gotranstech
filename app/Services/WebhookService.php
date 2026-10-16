<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TestTask;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    /**
     * Dispatch webhook notification to logistics company system when task is funded.
     */
    public function dispatchTaskFunded(Task|TestTask $task): bool
    {
        $company = $task->company;
        if (!$company || empty($company->webhook_url)) {
            return false;
        }

        // SSRF Defense: Validate URL before dispatching
        [$isUrlValid, $errorMsg] = UrlSecurityValidator::validateWebhookUrl($company->webhook_url);
        if (!$isUrlValid) {
            Log::warning("Webhook dispatch blocked for task #{$task->task_number} due to insecure URL: {$errorMsg}");
            return false;
        }

        // Ensure strong cryptographic secret is assigned
        if (empty($company->webhook_secret)) {
            $company->webhook_secret = 'whsec_' . bin2hex(random_bytes(24));
            $company->saveQuietly();
        }

        $isTest = ($task instanceof TestTask);
        $timestamp = now()->toIso8601String();

        $payload = [
            'event' => 'task.funded',
            'environment' => $isTest ? 'test' : 'live',
            'sandbox' => $isTest,
            'timestamp' => $timestamp,
            'data' => [
                'task_number' => $task->task_number,
                'external_task_id' => $task->external_task_id,
                'status' => 'funded',
                'funding_amount' => (float) $task->funding_amount,
                'currency' => 'SAR',
                'funded_at' => ($isTest ? $task->mock_funded_at : $task->funded_at)?->toIso8601String() ?: $timestamp,
            ]
        ];

        $payloadJson = json_encode($payload);
        $signature = hash_hmac('sha256', $timestamp . '.' . $payloadJson, $company->webhook_secret);

        try {
            $response = Http::timeout(5)
                ->withoutRedirecting() // SSRF Mitigation: Block internal redirects
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-GoTech-Signature' => $signature,
                    'X-GoTech-Timestamp' => $timestamp,
                    'User-Agent' => 'GoTech-Webhook/1.0',
                ])
                ->post($company->webhook_url, $payload);

            Log::info("Webhook sent for task #{$task->task_number} with HTTP status: " . $response->status());
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Failed to send webhook for task #{$task->task_number}: " . $e->getMessage());
            return false;
        }
    }
}
