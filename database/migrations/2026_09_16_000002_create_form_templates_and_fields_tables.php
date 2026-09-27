<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('applies_to')->default('investor'); // investor, company, all
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_template_id')->constrained('form_templates')->onDelete('cascade');
            $table->string('name');
            $table->string('label');
            $table->string('type')->default('text'); // text, number, select, date, file, textarea, checkbox
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->string('placeholder')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('additional_data')->nullable()->after('locale');
            $table->foreignId('form_template_id')->nullable()->constrained('form_templates')->nullOnDelete()->after('additional_data');
            $table->dateTime('agreement_signed_at')->nullable()->after('form_template_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['form_template_id']);
            $table->dropColumn(['additional_data', 'form_template_id', 'agreement_signed_at']);
        });

        Schema::dropIfExists('form_fields');
        Schema::dropIfExists('form_templates');
    }
};
