<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Crypt;

class EncryptedSettingService
{
    const CACHE_KEY_PREFIX = 'system_setting_';
    const CACHE_TTL = 3600; // 1 hour

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember(self::CACHE_KEY_PREFIX . $key, self::CACHE_TTL, function () use ($key, $default) {
            $setting = SystemSetting::where('key', $key)->first();
            if (!$setting || $setting->value === null) {
                return $default;
            }

            if ($setting->is_encrypted) {
                try {
                    return Crypt::decryptString($setting->value);
                } catch (\Exception $e) {
                    return $default;
                }
            }

            return $setting->value;
        });
    }

    public static function set(string $key, mixed $value, string $group = 'general', bool $isEncrypted = false, ?string $label = null, ?string $description = null, ?int $userId = null): SystemSetting
    {
        $storedValue = $value;
        if ($isEncrypted && !empty($value)) {
            $storedValue = Crypt::encryptString((string) $value);
        }

        $setting = SystemSetting::updateOrCreate(
            ['key' => $key],
            [
                'value' => $storedValue,
                'group' => $group,
                'is_encrypted' => $isEncrypted,
                'label' => $label ?? $key,
                'description' => $description,
                'updated_by_user_id' => $userId,
            ]
        );

        Cache::forget(self::CACHE_KEY_PREFIX . $key);

        return $setting;
    }

    public static function getGroup(string $group): array
    {
        $settings = SystemSetting::where('group', $group)->get();
        $result = [];

        foreach ($settings as $setting) {
            $result[$setting->key] = [
                'id' => $setting->id,
                'key' => $setting->key,
                'value' => $setting->is_encrypted ? '••••••••' : $setting->value,
                'decrypted_value' => $setting->decrypted_value,
                'is_encrypted' => $setting->is_encrypted,
                'label' => $setting->label,
                'description' => $setting->description,
            ];
        }

        return $result;
    }

    public static function getHyperPayConfig(): array
    {
        return [
            'entity_id_mada' => self::get('hyperpay_entity_id_mada', ''),
            'entity_id_visa_master' => self::get('hyperpay_entity_id_visa_master', ''),
            'entity_id_apple_pay' => self::get('hyperpay_entity_id_apple_pay', ''),
            'access_token' => self::get('hyperpay_access_token', ''),
            'base_url' => self::get('hyperpay_environment', 'test') === 'live' 
                ? 'https://oppwa.com' 
                : 'https://test.oppwa.com',
            'currency' => self::get('hyperpay_currency', 'SAR'),
        ];
    }

    public static function getHyperSplitConfig(): array
    {
        return [
            'api_key' => self::get('hypersplit_api_key', ''),
            'merchant_id' => self::get('hypersplit_merchant_id', ''),
            'base_url' => self::get('hypersplit_environment', 'test') === 'live'
                ? 'https://api.hypersplit.com'
                : 'https://test-api.hypersplit.com',
        ];
    }
}
