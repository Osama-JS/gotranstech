<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\CompanyDebt;
use App\Models\Task;
use App\Models\WithdrawalRequest;
use App\Services\AuditLogService;
use App\Services\NotificationDispatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CompanyApiController extends BaseApiController
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Health check and ping endpoint.
     */
    public function ping(Request $request): JsonResponse
    {
        return $this->success([
            'status' => 'healthy',
            'api_version' => 'v1.0.0',
            'timestamp' => now()->toIso8601String(),
            'server_time' => now()->format('Y-m-d H:i:s T'),
            'service' => 'GoTransTech Logistics B2B Engine',
        ], 'API service is active and operational');
    }

    /**
     * Get authenticated company profile and operational overview.
     */
    public function me(Request $request): JsonResponse
    {
        $company = $this->getCompany($request);
        if (!$company) {
            return $this->error('لم يتم تحديد هوية الشركة المصرح لها.', 401, null, 'UNAUTHORIZED_COMPANY');
        }
        $user = $company->user;

        $fundingWallet = $user?->companyFundingWallet;
        $debtWallet = $user?->companyDebtWallet;

        $stats = [
            'total_tasks' => Task::where('company_id', $company->id)->count(),
            'available_tasks' => Task::where('company_id', $company->id)->where('status', 'available')->count(),
            'funded_tasks' => Task::where('company_id', $company->id)->where('status', 'funded')->count(),
            'completed_tasks' => Task::where('company_id', $company->id)->where('status', 'completed')->count(),
            'active_api_keys' => $company->apiKeys()->where('status', 'active')->count(),
        ];

        return $this->success([
            'company' => [
                'id' => $company->id,
                'company_name' => $company->company_name,
                'cr_number' => $company->cr_number,
                'tax_number' => $company->tax_number,
                'contact_person' => $company->contact_person,
                'contact_email' => $company->contact_email,
                'contact_phone' => $company->contact_phone,
                'city' => $company->city,
                'address' => $company->address,
                'platform_commission_rate' => (float) $company->platform_commission_rate,
                'status' => $company->status,
            ],
            'webhook' => [
                'is_configured' => !empty($company->webhook_url),
                'url' => $company->webhook_url,
            ],
            'statistics' => $stats,
        ], 'تم استرجاع بيانات الشركة بنجاح');
    }

}
