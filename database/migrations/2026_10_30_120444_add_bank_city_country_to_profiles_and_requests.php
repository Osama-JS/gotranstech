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
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->string('bank_city')->default('Riyadh')->after('account_holder_name');
            $table->string('bank_country')->default('SA')->after('bank_city');
        });

        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('bank_city')->default('Riyadh')->after('account_holder_name');
            $table->string('bank_country')->default('SA')->after('bank_city');
        });

        Schema::table('bank_account_change_requests', function (Blueprint $table) {
            $table->string('current_bank_city')->nullable()->after('current_account_holder');
            $table->string('current_bank_country')->nullable()->after('current_bank_city');
            $table->string('new_bank_city')->default('Riyadh')->after('new_account_holder');
            $table->string('new_bank_country')->default('SA')->after('new_bank_city');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->dropColumn(['bank_city', 'bank_country']);
        });

        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropColumn(['bank_city', 'bank_country']);
        });

        Schema::table('bank_account_change_requests', function (Blueprint $table) {
            $table->dropColumn(['current_bank_city', 'current_bank_country', 'new_bank_city', 'new_bank_country']);
        });
    }
};
