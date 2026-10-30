<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hyperpay_payouts', function (Blueprint $table) {
            $table->id();
            $table->string('reference_id')->unique(); // e.g. IPW-12-1730000000 or CWD-5-1730000000
            $table->string('payout_id')->nullable()->index();
            $table->string('bulk_id')->nullable();
            $table->string('payout_type')->default('investor_commission'); // investor_commission, company_funding
            
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->foreignId('bank_id')->nullable()->constrained('banks')->nullOnDelete();
            
            // If linked to a company withdrawal request
            $table->foreignId('source_withdrawal_id')->nullable()->constrained('withdrawal_requests')->nullOnDelete();
            
            // If linked to a specific wallet transaction
            $table->foreignId('wallet_transaction_id')->nullable()->constrained('wallet_transactions')->nullOnDelete();

            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('SAR');
            
            $table->json('beneficiary_details')->nullable(); // name, iban, bic, bank_name, city, etc.
            
            $table->string('status')->default('pending_approval'); // pending_approval, processing, completed, rejected, failed
            $table->text('failure_reason')->nullable();
            $table->json('webhook_payload')->nullable();

            // Approvals & Audit
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('rejected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('rejected_at')->nullable();
            $table->text('rejection_reason')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hyperpay_payouts');
    }
};
