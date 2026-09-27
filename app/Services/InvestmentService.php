<?php

namespace App\Services;

use App\Models\Task;
use App\Models\TaskInvestment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class InvestmentService
{
    public function __construct(
        protected WalletService $walletService,
        protected WebhookService $webhookService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Fund an available logistics task atomically.
     */
    public function fundTask(Task $task, User $investor): TaskInvestment
    {
        return DB::transaction(function () use ($task, $investor) {
            /** @var Task $lockedTask */
            $lockedTask = Task::where('id', $task->id)->lockForUpdate()->firstOrFail();

            if ($lockedTask->status !== 'available') {
                throw new RuntimeException("هذه المهمة لم تعد متاحة للتمويل (الحالة الحالية: {$lockedTask->status}).");
            }

            if ($lockedTask->expires_at && $lockedTask->expires_at->isPast()) {
                $lockedTask->status = 'expired';
                $lockedTask->save();
                throw new RuntimeException("انتهت صلاحية عرض هذه المهمة للتمويل.");
            }

            $fundingAmount = (float) $lockedTask->funding_amount;
            $investorInvestmentWallet = $investor->investment_wallet;

            if ($investorInvestmentWallet->available_balance < $fundingAmount) {
                throw new RuntimeException("رصيد محفظة الاستثمار غير كافٍ. الرصيد المتاح: {$investorInvestmentWallet->available_balance} ر.س، المطلوب: {$fundingAmount} ر.س.");
            }

            // Commission Calculations
            $companyCommissionRate = (float) $lockedTask->company_commission_rate;
            $platformGrossCommission = round(($fundingAmount * $companyCommissionRate) / 100, 2);

            // Investor Share Rate
            $investorProfile = $investor->investorProfile;
            $investorShareRate = $investorProfile ? (float) $investorProfile->platform_commission_share_rate : 70.00;
            
            $investorCommissionEarned = round(($platformGrossCommission * $investorShareRate) / 100, 2);
            $platformNetCommission = round($platformGrossCommission - $investorCommissionEarned, 2);

            // 1. Debit Investor Investment Wallet
            $this->walletService->debitWallet(
                $investorInvestmentWallet,
                $fundingAmount,
                'task_funding_debit',
                "تمويل المهمة اللوجستية رقم #{$lockedTask->task_number}",
                $lockedTask,
                ['task_id' => $lockedTask->id, 'external_task_id' => $lockedTask->external_task_id]
            );

            // 2. Credit Investor Commission Wallet with earnings
            $investorCommissionWallet = $investor->commission_wallet;
            $this->walletService->creditWallet(
                $investorCommissionWallet,
                $investorCommissionEarned,
                'commission_earning',
                "أرباح عمولة تمويل المهمة #{$lockedTask->task_number} (حصة {$investorShareRate}%)",
                $lockedTask,
                ['task_id' => $lockedTask->id, 'gross_commission' => $platformGrossCommission]
            );

            // 3. Credit Company Funding Wallet
            $companyUser = $lockedTask->company->user;
            if ($companyUser) {
                $companyFundingWallet = $companyUser->company_funding_wallet;
                $this->walletService->creditWallet(
                    $companyFundingWallet,
                    $fundingAmount,
                    'task_funding_credit',
                    "إضافة رصيد تمويل للمهمة رقم #{$lockedTask->task_number}",
                    $lockedTask,
                    ['task_id' => $lockedTask->id, 'funded_by_investor_id' => $investor->id]
                );
            }

            // 4. Update Task Record
            $lockedTask->status = 'funded';
            $lockedTask->funded_by_investor_id = $investor->id;
            $lockedTask->funded_at = now();
            $lockedTask->platform_commission_amount = $platformGrossCommission;
            $lockedTask->save();

            // 5. Create Task Investment Record
            $investment = TaskInvestment::create([
                'task_id' => $lockedTask->id,
                'investor_id' => $investor->id,
                'investment_amount' => $fundingAmount,
                'platform_gross_commission' => $platformGrossCommission,
                'investor_share_rate' => $investorShareRate,
                'investor_commission_amount' => $investorCommissionEarned,
                'platform_net_commission' => $platformNetCommission,
                'status' => 'active',
            ]);

            // 6. Record Audit Log
            $this->auditLogService->log(
                'funded',
                $lockedTask,
                ['status' => 'available'],
                ['status' => 'funded', 'investor_id' => $investor->id, 'amount' => $fundingAmount],
                "تم تمويل المهمة #{$lockedTask->task_number} بنجاح بواسطة المستثمر {$investor->name}"
            );

            // 7. Dispatch Webhook to Logistics Company
            $this->webhookService->dispatchTaskFunded($lockedTask);

            return $investment;
        });
    }
}
