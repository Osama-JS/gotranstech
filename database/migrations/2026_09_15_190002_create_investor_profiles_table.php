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
        Schema::create('investor_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('national_id')->nullable();
            $table->string('investor_type')->default('individual'); // individual, corporate
            $table->string('bank_name')->nullable();
            $table->string('bank_iban')->nullable();
            $table->string('bank_account_number')->nullable();
            $table->decimal('platform_commission_share_rate', 5, 2)->default(70.00)->comment('Default % of Net Commission given to Investor');
            $table->string('status')->default('active'); // pending, active, suspended
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('investor_profiles');
    }
};
