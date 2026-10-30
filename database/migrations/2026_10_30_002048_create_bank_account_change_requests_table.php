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
        Schema::create('bank_account_change_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('user_type', ['investor', 'company'])->index();
            
            // Current bank details at time of request
            $table->foreignId('current_bank_id')->nullable()->constrained('banks')->nullOnDelete();
            $table->string('current_bank_name')->nullable();
            $table->string('current_iban')->nullable();
            $table->string('current_account_holder')->nullable();

            // Requested new bank details
            $table->foreignId('new_bank_id')->constrained('banks')->cascadeOnDelete();
            $table->string('new_bank_name')->nullable();
            $table->string('new_iban');
            $table->string('new_account_holder');

            // Justification & attachments
            $table->text('reason')->nullable();
            $table->string('certificate_file')->nullable(); // IBAN letter or bank certificate

            // Review status
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bank_account_change_requests');
    }
};
