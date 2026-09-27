<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_number',
        'party_type',
        'party_id',
        'user_id',
        'contract_type',
        'title',
        'terms_text',
        'commission_rate',
        'start_date',
        'end_date',
        'file_path',
        'status',
        'signed_by_user_id',
        'signed_at',
    ];

    protected function casts(): array
    {
        return [
            'commission_rate' => 'decimal:2',
            'start_date' => 'date',
            'end_date' => 'date',
            'signed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function signer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'signed_by_user_id');
    }

    public static function generateContractNumber(string $partyType): string
    {
        $prefix = strtoupper(substr($partyType, 0, 3));
        return 'CNT-' . $prefix . '-' . date('Ymd') . '-' . rand(1000, 9999);
    }
}
