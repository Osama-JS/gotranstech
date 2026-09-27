<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'is_encrypted',
        'group',
        'label',
        'description',
        'updated_by_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_encrypted' => 'boolean',
        ];
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by_user_id');
    }

    public function getDecryptedValueAttribute(): ?string
    {
        if (empty($this->value)) {
            return null;
        }

        if ($this->is_encrypted) {
            try {
                return Crypt::decryptString($this->value);
            } catch (\Exception $e) {
                return null;
            }
        }

        return $this->value;
    }

    public function setEncryptedValue(string $val): void
    {
        if ($this->is_encrypted) {
            $this->value = Crypt::encryptString($val);
        } else {
            $this->value = $val;
        }
    }
}
