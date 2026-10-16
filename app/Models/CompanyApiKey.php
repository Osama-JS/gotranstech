<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CompanyApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'key_name',
        'api_key_prefix',
        'api_key_hash',
        'permissions',
        'last_used_at',
        'expires_at',
        'status',
        'environment',
    ];

    protected function casts(): array
    {
        return [
            'permissions' => 'array',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function isTestKey(): bool
    {
        return ($this->environment ?? 'test') === 'test';
    }

    public function isLiveKey(): bool
    {
        return ($this->environment ?? 'test') === 'live';
    }

    public static function generateKey(int $companyId, string $keyName = 'API Key', string $environment = 'test'): array
    {
        $prefixHeader = ($environment === 'live') ? 'gt_live_' : 'gt_test_';
        $rawKey = $prefixHeader . Str::random(40);
        $prefix = substr($rawKey, 0, 16);
        $hash = hash('sha256', $rawKey);

        $apiKey = self::create([
            'company_id' => $companyId,
            'key_name' => $keyName,
            'api_key_prefix' => $prefix,
            'api_key_hash' => $hash,
            'environment' => $environment,
            'status' => 'active',
        ]);

        return [
            'model' => $apiKey,
            'plainTextToken' => $rawKey,
        ];
    }

    public static function verifyKey(string $plainTextKey): ?self
    {
        $clean = trim($plainTextKey);
        if (empty($clean) || strlen($clean) < 20) {
            return null;
        }

        // Strict SHA-256 Hash Match (Production standard Bearer token gt_...)
        $hash = hash('sha256', $clean);
        return self::where('api_key_hash', $hash)
            ->where('status', 'active')
            ->where(function ($query) {
                $query->whereNull('expires_at')
                      ->orWhere('expires_at', '>', now());
            })
            ->first();
    }
}
