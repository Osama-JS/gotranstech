<?php

namespace App\Http\Middleware;

use App\Models\CompanyApiKey;
use App\Models\CompanyProfile;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyCompanyApiKey
{
    /**
     * Handle an incoming request for Logistics Company B2B API.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Allow authenticated session if coming from web dashboard/sandbox
        if ($user = $request->user()) {
            if ($user->companyProfile) {
                $company = $user->companyProfile;
                $isTest = $company->isTestMode();
                $request->attributes->set('company', $company);
                $request->attributes->set('is_test_mode', $isTest);
                $request->attributes->set('environment', $isTest ? 'test' : 'live');
                return $next($request);
            }

            if ($user->user_type === 'admin') {
                $companyId = $request->header('X-Company-Id') ?? $request->query('company_id');
                $company = $companyId ? CompanyProfile::find($companyId) : null;
                if ($company) {
                    $isTest = $company->isTestMode();
                    $request->attributes->set('company', $company);
                    $request->attributes->set('is_test_mode', $isTest);
                    $request->attributes->set('environment', $isTest ? 'test' : 'live');
                    return $next($request);
                }
            }
        }

        // 2. Extract Bearer token or X-Api-Key header
        $token = $request->bearerToken() ?: $request->header('X-Api-Key');

        if (!$token) {
            return response()->json([
                'success' => false,
                'error_code' => 'MISSING_API_KEY',
                'message' => 'مفتاح الـ API مفقود. يرجى تمرير المفتاح في ترويسة الطلب: Authorization: Bearer <YOUR_API_KEY> أو X-Api-Key.',
            ], 401);
        }

        $apiKey = CompanyApiKey::verifyKey($token);

        if (!$apiKey || !$apiKey->company) {
            return response()->json([
                'success' => false,
                'error_code' => 'INVALID_API_KEY',
                'message' => 'مفتاح الـ API غير صالح، منتهي الصلاحية، أو تم إلغاء تنشيطه.',
            ], 401);
        }

        $company = $apiKey->company;

        if ($company->status === 'suspended') {
            return response()->json([
                'success' => false,
                'error_code' => 'COMPANY_SUSPENDED',
                'message' => 'حساب الشركة موقوف حالياً. يرجى التواصل مع إدارة منصة GoTech.',
            ], 403);
        }

        // Security Guardrail: Prevent using live keys if the company has not been approved to Live mode yet
        if ($apiKey->isLiveKey() && $company->isTestMode()) {
            return response()->json([
                'success' => false,
                'error_code' => 'COMPANY_NOT_LIVE_APPROVED',
                'message' => 'حساب الشركة ما زال في بيئة الاختبار (Sandbox). لا يمكن استخدام مفاتيح الإنتاج حتى يتم اعتماد الربط وترقية الحساب من قبل إدارة المنصة.',
            ], 403);
        }

        // Determine if request is operating in test mode:
        // Either the API key itself is a test key, or the company environment is currently in test mode.
        $isTestMode = $apiKey->isTestKey() || $company->isTestMode();

        // Update last used timestamp quietly
        $apiKey->updateQuietly(['last_used_at' => now()]);

        // Attach company, apiKey, and environment context to request attributes
        $request->attributes->set('company', $company);
        $request->attributes->set('apiKey', $apiKey);
        $request->attributes->set('is_test_mode', $isTestMode);
        $request->attributes->set('environment', $isTestMode ? 'test' : 'live');

        return $next($request);
    }
}
