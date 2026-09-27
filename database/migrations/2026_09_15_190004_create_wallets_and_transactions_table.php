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
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('wallet_type'); // investor_investment, investor_commission, company_funding, company_debt, platform_revenue
            $table->string('currency', 10)->default('SAR');
            $table->decimal('balance', 15, 2)->default(0.00);
            $table->decimal('locked_balance', 15, 2)->default(0.00);
            $table->string('status')->default('active'); // active, frozen
            $table->timestamps();

            $table->unique(['user_id', 'wallet_type']);
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('transaction_type'); // deposit, withdrawal, task_funding_lock, task_funding_debit, task_funding_credit, commission_earning, platform_commission, debt_issuance, debt_repayment
            $table->decimal('amount', 15, 2);
            $table->decimal('balance_before', 15, 2);
            $table->decimal('balance_after', 15, 2);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('description');
            $table->string('status')->default('completed'); // completed, pending, failed, reversed
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['wallet_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
