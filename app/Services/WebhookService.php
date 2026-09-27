<?php

namespace App\Services;

use App\Models\Task;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    /**
     * Dispatch webhook notification to logistics company system when task is funded.
     */
    public function dispatchTaskFunded(Task $task): bool
    {
        $company = $task->company;
        if (!$company || empty($company->webhook_url)) {
            return false;
        }

        $payload = [
            'event' => 'task.funded',
            'timestamp' => now()->toIso8601String(),
            'data' => [
                'task_number' => $task->task_number,
                'external_task_id' => $task->external_task_id,
                'status' => 'funded',
                'funding_amount' => (float) $task->funding_amount,
                'currency' => 'SAR',
                'funded_at' => $task->funded_at ? $task->funded_at->toIso8601String() : now()->toIso8601String(),
            ]
        ];

        $payloadJson = json_encode($payload);
        $secret = $company->webhook_secret ?? 'gotech_secret';
        $signature = hash_hmac('sha256', $payloadJson, $secret);

        try {
            $response = Http::timeout(5)
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-GoTech-Signature' => $signature,
                    'User-Agent' => 'GoTech-Webhook/1.0',
                ])
                ->post($company->webhook_url, $payload);

            Log::info("Webhook sent for task #{$task->task_number} to {$company->webhook_url} with status: " . $response->status());
            return $response->successful();
        } catch (\Exception $e) {
            Log::error("Failed to send webhook to {$company->webhook_url}: " . $e->getMessage());
            return false;
        }
    }
}
