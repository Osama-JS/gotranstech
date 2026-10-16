<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // General B2B API Rate Limiter (Tiered by Company ID / API Key / IP)
        RateLimiter::for('api', function (Request $request) {
            $key = $request->attributes->get('apiKey')?->id
                ?? $request->attributes->get('company')?->id
                ?? $request->ip();

            return Limit::perMinute(120)->by($key)->response(function () {
                return response()->json([
                    'success' => false,
                    'error_code' => 'RATE_LIMIT_EXCEEDED',
                    'message' => 'تم تجاوز الحد الأقصى المسموح به من الطلبات في الدقيقة (120 req/min). يرجى الانتظار قليلاً قبل إعادة المحاولة.',
                ], 429);
            });
        });

        // Heavy Operations Rate Limiter (Batch creation & Webhook tests: 15 req/min)
        RateLimiter::for('api-heavy', function (Request $request) {
            $key = $request->attributes->get('apiKey')?->id
                ?? $request->attributes->get('company')?->id
                ?? $request->ip();

            return Limit::perMinute(15)->by($key)->response(function () {
                return response()->json([
                    'success' => false,
                    'error_code' => 'HEAVY_RATE_LIMIT_EXCEEDED',
                    'message' => 'تم تجاوز الحد المسموح به للعمليات المجمعة واختبارات الـ Webhook (15 req/min).',
                ], 429);
            });
        });
    }
}
