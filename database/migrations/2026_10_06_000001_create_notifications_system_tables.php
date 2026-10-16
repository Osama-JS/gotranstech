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
        // 1. Notification Settings Table (Controls events, channels, and targeted roles/users)
        Schema::create('notification_settings', function (Blueprint $table) {
            $table->id();
            $table->string('event_key')->unique();
            $table->string('target_group'); // admin, investor, company
            $table->string('category')->default('general'); // tasks, finance, compliance, security, system
            $table->string('title_ar');
            $table->text('description_ar')->nullable();
            $table->enum('severity', ['info', 'success', 'warning', 'urgent'])->default('info');
            $table->boolean('is_active')->default(true);
            $table->boolean('channels_in_app')->default(true);
            $table->boolean('channels_browser')->default(false);
            $table->boolean('channels_email')->default(false);
            $table->json('target_roles')->nullable(); // For admin: ["Super Admin", "Financial Officer"]
            $table->json('target_user_ids')->nullable(); // For admin: [1, 2]
            $table->timestamps();
        });

        // 2. User App Notifications Table (Real-time and persistent notification logs)
        Schema::create('app_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('event_key');
            $table->string('title');
            $table->text('message');
            $table->string('action_url')->nullable();
            $table->enum('severity', ['info', 'success', 'warning', 'urgent'])->default('info');
            $table->json('data')->nullable(); // Extra metadata (amount, task_id, etc.)
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->boolean('is_browser_delivered')->default(false);
            $table->boolean('is_email_sent')->default(false);
            $table->timestamps();

            $table->index(['user_id', 'is_read']);
            $table->index('severity');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_notifications');
        Schema::dropIfExists('notification_settings');
    }
};
