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
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_number')->unique();
            $table->string('party_type'); // company, investor
            $table->unsignedBigInteger('party_id'); // company_profile_id or investor_profile_id
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('contract_type'); // logistics_service, investment_agreement
            $table->string('title');
            $table->longText('terms_text');
            $table->decimal('commission_rate', 5, 2)->comment('Agreed % commission');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->string('file_path')->nullable();
            $table->string('status')->default('active'); // draft, active, expired, terminated
            $table->foreignId('signed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('signed_at')->nullable();
            $table->timestamps();

            $table->index(['party_type', 'party_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
