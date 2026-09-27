<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyDebt;
use App\Models\CompanyProfile;
use App\Models\FormTemplate;
use App\Models\Task;
use App\Models\WithdrawalRequest;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompanyDashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $company = $user->companyProfile;

        if (!$company) {
            $company = CompanyProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $user->company_name ?: $user->name,
                    'cr_number' => 'CR-' . rand(1000000000, 9999999999),
                    'phone' => $user->phone,
                    'email' => $user->email,
                    'address' => 'المملكة العربية السعودية',
                    'platform_commission_rate' => 10.00,
                    'auto_settlement_enabled' => true,
                ]
            );
        }

        $fundingWallet = $user->company_funding_wallet;
        $debtWallet = $user->company_debt_wallet;

        $stats = [
            'funding_balance' => (float) ($fundingWallet?->balance ?? 0),
            'funding_available' => (float) ($fundingWallet?->available_balance ?? 0),
            'locked_in_withdrawals' => (float) ($fundingWallet?->locked_balance ?? 0),
            'total_debt_outstanding' => (float) CompanyDebt::where('company_id', $company->id)->where('status', '!=', 'paid')->sum('remaining_amount'),
            'total_tasks_count' => Task::where('company_id', $company->id)->count(),
            'funded_tasks_count' => Task::where('company_id', $company->id)->where('status', 'funded')->count(),
            'available_tasks_count' => Task::where('company_id', $company->id)->where('status', 'available')->where('expires_at', '>', now())->count(),
        ];

        $recentTasks = Task::where('company_id', $company->id)
            ->with('fundedByInvestor')
            ->latest()
            ->take(6)
            ->get();

        $recentWithdrawals = WithdrawalRequest::where('company_id', $company->id)
            ->latest()
            ->take(5)
            ->get();

        $formTemplate = FormTemplate::with('fields')
            ->where('applies_to', 'company')
            ->where('is_active', true)
            ->latest()
            ->first();

        return Inertia::render('Company/Dashboard', [
            'company' => $company,
            'stats' => $stats,
            'recentTasks' => $recentTasks,
            'recentWithdrawals' => $recentWithdrawals,
            'formTemplate' => $formTemplate,
        ]);
    }
}
