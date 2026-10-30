<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankAccountChangeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'user_type',
        'current_bank_id',
        'current_bank_name',
        'current_iban',
        'current_account_holder',
        'current_bank_city',
        'current_bank_country',
        'new_bank_id',
        'new_bank_name',
        'new_iban',
        'new_account_holder',
        'new_bank_city',
        'new_bank_country',
        'reason',
        'certificate_file',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function currentBank(): BelongsTo
    {
        return $this->belongsTo(Bank::class, 'current_bank_id');
    }

    public function newBank(): BelongsTo
    {
        return $this->belongsTo(Bank::class, 'new_bank_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
}

