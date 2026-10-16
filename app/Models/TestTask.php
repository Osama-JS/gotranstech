<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TestTask extends Model
{
    use HasFactory;

    protected $table = 'test_tasks';

    protected $fillable = [
        'company_id',
        'external_task_id',
        'task_number',
        'title',
        'description',
        'pickup_city',
        'pickup_address',
        'pickup_lat',
        'pickup_lng',
        'dropoff_city',
        'dropoff_address',
        'dropoff_lat',
        'dropoff_lng',
        'funding_amount',
        'company_commission_rate',
        'platform_commission_amount',
        'estimated_delivery_time',
        'expires_at',
        'status',
        'is_mock_funded',
        'mock_funded_at',
        'mock_investor_name',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'funding_amount' => 'decimal:2',
            'company_commission_rate' => 'decimal:2',
            'platform_commission_amount' => 'decimal:2',
            'pickup_lat' => 'decimal:7',
            'pickup_lng' => 'decimal:7',
            'dropoff_lat' => 'decimal:7',
            'dropoff_lng' => 'decimal:7',
            'expires_at' => 'datetime',
            'mock_funded_at' => 'datetime',
            'is_mock_funded' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(CompanyProfile::class, 'company_id');
    }

    public static function generateTaskNumber(): string
    {
        return 'TEST-TK-' . date('Ymd') . '-' . rand(10000, 99999);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available' && ($this->expires_at ? $this->expires_at->isFuture() : true);
    }

    public function mockFund(?string $investorName = 'مستثمر تجريبي (Sandbox Investor)'): void
    {
        $this->update([
            'is_mock_funded' => true,
            'mock_funded_at' => now(),
            'mock_investor_name' => $investorName ?: 'مستثمر تجريبي (Sandbox Investor)',
            'status' => 'funded',
        ]);
    }
}
