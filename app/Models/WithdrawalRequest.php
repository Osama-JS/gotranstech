<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class WithdrawalRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_id',
        'request_number',
        'requested_amount',
        'number_of_tasks',
        'pdf_file_path',
        'signed_pdf_file_path',
        'status',
        'due_date',
        'reviewed_by_user_id',
        'reviewed_at',
        'rejection_reason',
        'admin_notes',
        'company_signature',
        'company_signed_at',
        'admin_signature',
        'admin_signed_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_amount' => 'decimal:2',
            'due_date' => 'date',
            'reviewed_at' => 'datetime',
            'company_signed_at' => 'datetime',
            'admin_signed_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(WithdrawalRequestItem::class);
    }

    public function debt(): HasOne
    {
        return $this->hasOne(CompanyDebt::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_user_id');
    }

    public static function generateRequestNumber(): string
    {
        return 'WDR-' . date('Ymd') . '-' . rand(1000, 9999);
    }
}
