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
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('company_profiles')->cascadeOnDelete();
            $table->string('external_task_id')->index()->comment('Task ID from external company system');
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

            // Financials
            $table->decimal('funding_amount', 15, 2);
            $table->decimal('company_commission_rate', 5, 2)->default(10.00);
            $table->decimal('platform_commission_amount', 15, 2)->default(0.00);

            // Lifecycle
            $table->string('estimated_delivery_time')->nullable();
            $table->timestamp('expires_at')->index();
            $table->string('status')->default('available'); // available, funded, completed, cancelled_by_company, expired
            
            $table->foreignId('funded_by_investor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('funded_at')->nullable();
            $table->unsignedBigInteger('withdrawal_request_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'external_task_id']);
            $table->index(['status', 'expires_at']);
        });

        Schema::create('task_investments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('task_id')->constrained('tasks')->cascadeOnDelete();
            $table->foreignId('investor_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('investment_amount', 15, 2);
            $table->decimal('platform_gross_commission', 15, 2);
            $table->decimal('investor_share_rate', 5, 2);
            $table->decimal('investor_commission_amount', 15, 2);
            $table->decimal('platform_net_commission', 15, 2);
            $table->string('status')->default('active'); // active, settled, refunded
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('task_investments');
        Schema::dropIfExists('tasks');
    }
};
