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
        // 1. Add environment & promotion fields to company_profiles
        Schema::table('company_profiles', function (Blueprint $table) {
            $table->string('environment', 20)->default('test')->after('status')->comment('test (Sandbox) or live (Production)');
            $table->timestamp('test_mode_approved_at')->nullable()->after('environment');
            $table->foreignId('approved_by_admin_id')->nullable()->after('test_mode_approved_at')->constrained('users')->nullOnDelete();
            $table->text('test_notes')->nullable()->after('approved_by_admin_id');
        });

        // 2. Add environment to company_api_keys
        Schema::table('company_api_keys', function (Blueprint $table) {
            $table->string('environment', 20)->default('test')->after('status')->comment('test or live');
        });

        // 3. Create isolated test_tasks table
        Schema::create('test_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->string('external_task_id')->index()->comment('Task ID from external company system (Test)');
            $table->string('task_number')->unique();
            $table->string('title');
            $table->text('description')->nullable();

            // Pickup details
            $table->string('pickup_city');
            $table->string('pickup_address');
            $table->decimal('pickup_lat', 10, 7)->nullable();
            $table->decimal('pickup_lng', 10, 7)->nullable();

            // Dropoff details
            $table->string('dropoff_city');
            $table->string('dropoff_address');
            $table->decimal('dropoff_lat', 10, 7)->nullable();
            $table->decimal('dropoff_lng', 10, 7)->nullable();

            // Financial calculations (Simulated)
            $table->decimal('funding_amount', 15, 2);
            $table->decimal('company_commission_rate', 5, 2)->default(10.00);
            $table->decimal('platform_commission_amount', 15, 2)->default(0.00);

            // Lifecycle
            $table->string('estimated_delivery_time')->nullable();
            $table->timestamp('expires_at')->index();
            $table->string('status')->default('available'); // available, funded, completed, cancelled_by_company, expired

            // Mock simulation fields (for sandbox testing)
            $table->boolean('is_mock_funded')->default(false);
            $table->timestamp('mock_funded_at')->nullable();
            $table->string('mock_investor_name')->nullable();

            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'external_task_id']);
            $table->index(['company_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('test_tasks');

        Schema::table('company_api_keys', function (Blueprint $table) {
            $table->dropColumn('environment');
        });

        Schema::table('company_profiles', function (Blueprint $table) {
            $table->dropForeign(['approved_by_admin_id']);
            $table->dropColumn(['environment', 'test_mode_approved_at', 'approved_by_admin_id', 'test_notes']);
        });
    }
};
