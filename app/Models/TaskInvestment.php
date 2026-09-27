<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TaskInvestment extends Model
{
    use HasFactory;

    protected $fillable = [
        'task_id',
        'investor_id',
        'investment_amount',
        'platform_gross_commission',
        'investor_share_rate',
        'investor_commission_amount',
        'platform_net_commission',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'investment_amount' => 'decimal:2',
            'platform_gross_commission' => 'decimal:2',
            'investor_share_rate' => 'decimal:2',
            'investor_commission_amount' => 'decimal:2',
            'platform_net_commission' => 'decimal:2',
        ];
    }

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function investor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'investor_id');
    }
}
