<?php

namespace App\Services;

use App\Models\CompanyDebt;
use App\Models\CompanyProfile;
use App\Models\Task;
use App\Models\User;
use App\Models\WithdrawalRequest;
use App\Models\WithdrawalRequestItem;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class WithdrawalService
{
    public function __construct(
        protected WalletService $walletService,
        protected PdfGenerationService $pdfService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Create a new withdrawal request for a company selecting specific funded tasks.
     */
    public function createWithdrawalRequest(CompanyProfile $company, array $taskIds, ?string $companySignature = null): WithdrawalRequest
    {
        return DB::transaction(function () use ($company, $taskIds, $companySignature) {
            // Find valid funded tasks belonging to this company that haven't been claimed yet
            $tasks = Task::where('company_id', $company->id)
                ->where('status', 'funded')
                ->whereNull('withdrawal_request_id')
                ->whereIn('id', $taskIds)
                ->lockForUpdate()
                ->get();

            if ($tasks->isEmpty()) {
                throw new RuntimeException("لم يتم العثور على أي مهام ممولة صالحة للسحب من المهام المحددة.");
            }

            if ($tasks->count() !== count($taskIds)) {
                throw new RuntimeException("بعض المهام المحددة غير صالحة أو تم تقديم طلب سحب مسبق لها.");
            }

            $totalRequestedAmount = (float) $tasks->sum('funding_amount');

            // Check company funding wallet balance
            $companyUser = $company->user;
            $fundingWallet = $companyUser->company_funding_wallet;

            if ($fundingWallet->available_balance < $totalRequestedAmount) {
                throw new RuntimeException("رصيد محفظة التمويل غير كافٍ. المتاح: {$fundingWallet->available_balance} ر.س، المطلوب: {$totalRequestedAmount} ر.س.");
            }

            // Lock the balance in company funding wallet until approved/rejected
            $this->walletService->lockBalance($fundingWallet, $totalRequestedAmount);

            $withdrawalRequest = WithdrawalRequest::create([
                'company_id' => $company->id,
                'request_number' => WithdrawalRequest::generateRequestNumber(),
                'requested_amount' => $totalRequestedAmount,
                'number_of_tasks' => $tasks->count(),
                'status' => 'pending',
                'company_signature' => $companySignature,
                'company_signed_at' => $companySignature ? now() : null,
            ]);

            foreach ($tasks as $task) {
                WithdrawalRequestItem::create([
                    'withdrawal_request_id' => $withdrawalRequest->id,
                    'task_id' => $task->id,
                    'task_funding_amount' => $task->funding_amount,
                ]);

                // Link task to this withdrawal request
                $task->withdrawal_request_id = $withdrawalRequest->id;
                $task->save();
            }

            // Generate the PDF document
            $this->pdfService->generateWithdrawalPdf($withdrawalRequest);

            // Audit log
            $this->auditLogService->log(
                'created',
                $withdrawalRequest,
                [],
                ['request_number' => $withdrawalRequest->request_number, 'amount' => $totalRequestedAmount],
                "إنشاء طلب سحب رصيد جديد #{$withdrawalRequest->request_number} بمبلغ {$totalRequestedAmount} ر.س"
            );

            return $withdrawalRequest;
        });
    }

    /**
     * Admin approves the withdrawal request.
     */
    public function approveWithdrawalRequest(
        WithdrawalRequest $request,
        User $admin,
        ?string $dueDate = null,
        ?string $adminSignature = null,
        ?string $adminNotes = null
    ): WithdrawalRequest {
        return DB::transaction(function () use ($request, $admin, $dueDate, $adminSignature, $adminNotes) {
            /** @var WithdrawalRequest $lockedRequest */
            $lockedRequest = WithdrawalRequest::where('id', $request->id)->lockForUpdate()->firstOrFail();

            if ($lockedRequest->status !== 'pending') {
                throw new RuntimeException("هذا الطلب ليس في حالة قيد الانتظار (الحالة الحالية: {$lockedRequest->status}).");
            }

            $company = $lockedRequest->company;
            $companyUser = $company->user;
            $fundingWallet = $companyUser->company_funding_wallet;
            $debtWallet = $companyUser->company_debt_wallet;

            $amount = (float) $lockedRequest->requested_amount;

            // Unlock the locked balance from funding wallet
            $this->walletService->unlockBalance($fundingWallet, $amount);

            // Debit from funding wallet (recorded as negative balance / withdrawal)
            $this->walletService->debitWallet(
                $fundingWallet,
                $amount,
                'withdrawal',
                "سحب رصيد تمويل مهام معتمد برقم #{$lockedRequest->request_number}",
                $lockedRequest,
                ['withdrawal_request_id' => $lockedRequest->id]
            );

            // Calculate Due Date (defaults to 30 days if not provided)
            $finalDueDate = $dueDate ? Carbon::parse($dueDate) : now()->addDays(30);

            // Create Company Debt entry
            $companyDebt = CompanyDebt::create([
                'company_id' => $company->id,
                'withdrawal_request_id' => $lockedRequest->id,
                'principal_amount' => $amount,
                'paid_amount' => 0.00,
                'remaining_amount' => $amount,
                'due_date' => $finalDueDate->toDateString(),
                'status' => 'unpaid',
            ]);

            // Record debt issuance in company debt wallet
            $this->walletService->creditWallet(
                $debtWallet,
                $amount,
                'debt_issuance',
                "قيد مديونية مستحقة مقابل سحب تمويل #{$lockedRequest->request_number} (استحقاق: {$finalDueDate->toDateString()})",
                $companyDebt,
                ['due_date' => $finalDueDate->toDateString()]
            );

            // Update request
            $lockedRequest->status = 'approved';
            $lockedRequest->due_date = $finalDueDate->toDateString();
            $lockedRequest->reviewed_by_user_id = $admin->id;
            $lockedRequest->reviewed_at = now();
            $lockedRequest->admin_signature = $adminSignature;
            $lockedRequest->admin_signed_at = $adminSignature ? now() : null;
            $lockedRequest->admin_notes = $adminNotes;
            $lockedRequest->save();

            // Regenerate PDF with signatures
            $this->pdfService->generateWithdrawalPdf($lockedRequest);

            // Audit log
            $this->auditLogService->log(
                'approved',
                $lockedRequest,
                ['status' => 'pending'],
                ['status' => 'approved', 'due_date' => $finalDueDate->toDateString(), 'admin_id' => $admin->id],
                "الموافقة على طلب سحب الرصيد #{$lockedRequest->request_number} وتحديد تاريخ الاستحقاق: {$finalDueDate->toDateString()}"
            );

            return $lockedRequest;
        });
    }

    /**
     * Admin rejects the withdrawal request.
     */
    public function rejectWithdrawalRequest(WithdrawalRequest $request, User $admin, string $reason): WithdrawalRequest
    {
        return DB::transaction(function () use ($request, $admin, $reason) {
            /** @var WithdrawalRequest $lockedRequest */
            $lockedRequest = WithdrawalRequest::where('id', $request->id)->lockForUpdate()->firstOrFail();

            if ($lockedRequest->status !== 'pending') {
                throw new RuntimeException("هذا الطلب ليس في حالة قيد الانتظار.");
            }

            $amount = (float) $lockedRequest->requested_amount;
            $fundingWallet = $lockedRequest->company->user->company_funding_wallet;

            // Unlock locked funds in funding wallet
            $this->walletService->unlockBalance($fundingWallet, $amount);

            // Release tasks so they can be selected again
            Task::where('withdrawal_request_id', $lockedRequest->id)
                ->update(['withdrawal_request_id' => null]);

            $lockedRequest->status = 'rejected';
            $lockedRequest->rejection_reason = $reason;
            $lockedRequest->reviewed_by_user_id = $admin->id;
            $lockedRequest->reviewed_at = now();
            $lockedRequest->save();

            $this->auditLogService->log(
                'rejected',
                $lockedRequest,
                ['status' => 'pending'],
                ['status' => 'rejected', 'reason' => $reason],
                "رفض طلب سحب الرصيد #{$lockedRequest->request_number} للسبب: {$reason}"
            );

            return $lockedRequest;
        });
    }
}
