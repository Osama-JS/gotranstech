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
            $table->foreignId('bank_id')->nullable()->after('investor_type')->constrained('banks')->nullOnDelete();
            $table->string('account_holder_name')->nullable()->after('bank_iban');
        });

        Schema::table('company_profiles', function (Blueprint $table) {
            $table->foreignId('bank_id')->nullable()->after('address')->constrained('banks')->nullOnDelete();
            $table->string('bank_name')->nullable()->after('bank_id');
            $table->string('bank_iban')->nullable()->after('bank_name');
            $table->string('account_holder_name')->nullable()->after('bank_iban');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('investor_profiles', function (Blueprint $table) {
            $table->dropForeign(['bank_id']);
            $table->dropColumn(['bank_id', 'account_holder_name']);
        });

        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropForeign(['bank_id']);
            $table->dropColumn(['bank_id', 'bank_name', 'bank_iban', 'account_holder_name']);
        });
    }
};
