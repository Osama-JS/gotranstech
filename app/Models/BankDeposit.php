<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BankDeposit extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'deposit_number',
        'amount',
        'bank_name',
        'sender_name',
        'sender_account',
        'reference_number',
        'transfer_date',
        'receipt_file_path',
        'status',
        'reviewed_by_user_id',
        'review_notes',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'transfer_date' => 'date',
            'reviewed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public static function generateDepositNumber(): string
    {
        return 'DEP-' . date('Ymd') . '-' . rand(1000, 9999);
    }
}
