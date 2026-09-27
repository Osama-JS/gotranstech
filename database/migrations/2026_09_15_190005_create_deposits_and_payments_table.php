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
        Schema::create('bank_deposits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->string('deposit_number')->unique();
            $table->decimal('amount', 15, 2);
            $table->string('bank_name');
            $table->string('sender_name');
            $table->string('sender_account')->nullable();
            $table->string('reference_number')->nullable();
            $table->date('transfer_date')->nullable();
            $table->string('receipt_file_path');
            $table->string('status')->default('pending'); // pending, approved, rejected
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_notes')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('hyperpay_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->string('checkout_id')->unique();
            $table->string('payment_brand')->nullable(); // MADA, VISA, MASTER, APPLEPAY
            $table->decimal('amount', 15, 2);
            $table->string('currency', 10)->default('SAR');
            $table->string('status')->default('pending'); // pending, paid, failed
            $table->string('hyperpay_id')->nullable()->index();
            $table->string('result_code')->nullable();
            $table->string('result_description')->nullable();
            $table->json('raw_response')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hyperpay_transactions');
        Schema::dropIfExists('bank_deposits');
    }
};
