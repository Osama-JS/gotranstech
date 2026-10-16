<?php

use App\Models\SystemSetting;
use App\Services\EncryptedSettingService;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Cache;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Dedicate the currently uploaded logo to Dark Mode (platform_logo_dark)
     * so that the existing logo is preserved for dark mode, while platform_logo
     * becomes designated for Light Mode.
     */
    public function up(): void
    {
        $existingLogo = SystemSetting::where('key', 'platform_logo')->first();
        $existingDarkLogo = SystemSetting::where('key', 'platform_logo_dark')->first();

        if ($existingLogo && !empty($existingLogo->value)) {
            if (!$existingDarkLogo || empty($existingDarkLogo->value)) {
                SystemSetting::updateOrCreate(
                    ['key' => 'platform_logo_dark'],
                    [
                        'value' => $existingLogo->value,
                        'group' => 'branding',
                        'label' => 'شعار المنصة للوضع الليلي',
                        'description' => 'الشعار المخصص للوضع الليلي الداكن',
                        'is_encrypted' => false,
                    ]
                );

                Cache::forget(EncryptedSettingService::CACHE_KEY_PREFIX . 'platform_logo_dark');
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Keep data intact
    }
};
