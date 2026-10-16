<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CompanyProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BaseApiController extends Controller
{
    /**
     * Retrieve authenticated company profile from request attributes or fallback safely.
     */
    protected function getCompany(Request $request): ?CompanyProfile
    {
        $company = $request->attributes->get('company');

        if (!$company) {
            $user = $request->user();
            if ($user) {
                $company = $user->companyProfile;
                if (!$company && $user->user_type === 'admin') {
                    $companyId = $request->header('X-Company-Id') ?? $request->query('company_id');
                    $company = $companyId ? CompanyProfile::find($companyId) : null;
                }
            }
        }

        return $company;
    }

    /**
     * Retrieve authenticated company profile or abort with 401.
     */
    protected function requireCompany(Request $request): CompanyProfile
    {
        $company = $this->getCompany($request);

        if (!$company) {
            abort(response()->json([
                'success' => false,
                'error_code' => 'UNAUTHORIZED_COMPANY',
                'message' => 'لم يتم تحديد هوية الشركة المصرح لها أو تعذر استخراج ملف تعريف الشركة.',
            ], 401));
        }

        return $company;
    }

    /**
     * Standard JSON success response.
     */
    protected function success(mixed $data = null, string $message = 'تمت العملية بنجاح', int $statusCode = 200, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $statusCode);
    }

    /**
     * Standard JSON error response.
     */
    protected function error(string $message, int $statusCode = 400, mixed $errors = null, ?string $errorCode = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if ($errorCode) {
            $response['error_code'] = $errorCode;
        }

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $statusCode);
    }
}
