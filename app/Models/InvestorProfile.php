<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InvestorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'national_id',
        'investor_type',
        'bank_name',
        'bank_iban',
        'bank_account_number',
        'platform_commission_share_rate',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'platform_commission_share_rate' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'party_id')->where('party_type', 'investor');
    }
}
