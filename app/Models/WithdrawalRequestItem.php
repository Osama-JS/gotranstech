<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WithdrawalRequestItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'withdrawal_request_id',
        'task_id',
        'task_funding_amount',
    ];

    protected function casts(): array
    {
        return [
            'task_funding_amount' => 'decimal:2',
        ];
    }

    public function withdrawalRequest(): BelongsTo
    {
        return $this->belongsTo(WithdrawalRequest::class);
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }
}
