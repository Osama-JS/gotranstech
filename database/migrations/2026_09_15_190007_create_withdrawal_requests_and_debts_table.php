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
        Schema::create('withdrawal_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->string('request_number')->unique();
            $table->decimal('requested_amount', 15, 2);
            $table->integer('number_of_tasks')->default(0);
            $table->string('pdf_file_path')->nullable();
            $table->string('signed_pdf_file_path')->nullable();
            $table->string('status')->default('pending'); // pending, approved, rejected, settled
            $table->date('due_date')->nullable();
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('admin_notes')->nullable();
            $table->text('company_signature')->nullable();
            $table->timestamp('company_signed_at')->nullable();
            $table->text('admin_signature')->nullable();
            $table->timestamp('admin_signed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('withdrawal_request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('withdrawal_request_id')->constrained('withdrawal_requests')->cascadeOnDelete();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->decimal('task_funding_amount', 15, 2);
            $table->timestamps();
        });

        Schema::create('company_debts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->foreignId('withdrawal_request_id')->constrained('withdrawal_requests')->cascadeOnDelete();
            $table->decimal('principal_amount', 15, 2);
            $table->decimal('paid_amount', 15, 2)->default(0.00);
            $table->decimal('remaining_amount', 15, 2);
            $table->date('due_date');
            $table->string('status')->default('unpaid'); // unpaid, partially_paid, paid, overdue
            $table->timestamp('settled_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_debts');
        Schema::dropIfExists('withdrawal_request_items');
        Schema::dropIfExists('withdrawal_requests');
    }
};
