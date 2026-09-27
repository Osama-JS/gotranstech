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
        Schema::create('company_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('cr_number')->nullable()->comment('Commercial Registration Number');
            $table->string('tax_number')->nullable()->comment('VAT/Tax Number');
            $table->string('contact_person')->nullable();
            $table->string('contact_email')->nullable();
            $table->string('contact_phone')->nullable();
            $table->string('city')->nullable();
            $table->text('address')->nullable();
            $table->string('website')->nullable();
            $table->string('webhook_url')->nullable();
            $table->string('webhook_secret', 100)->nullable();
            $table->decimal('platform_commission_rate', 5, 2)->default(10.00)->comment('Default % Platform takes from company tasks');
            $table->string('status')->default('active'); // pending, active, suspended, rejected
            $table->timestamps();
        });

        Schema::create('company_api_keys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->string('key_name')->default('Production Key');
            $table->string('api_key_prefix', 16);
            $table->string('api_key_hash', 128)->unique();
            $table->json('permissions')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->string('status')->default('active'); // active, revoked
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('company_api_keys');
        Schema::dropIfExists('company_profiles');
    }
};
