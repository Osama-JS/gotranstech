<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HyperpayPayout extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_id',
        'payout_id',
        'bulk_id',
        'payout_type',
        'user_id',
        'wallet_id',
        'bank_id',
        'source_withdrawal_id',
        'wallet_transaction_id',
        'amount',
        'currency',
        'beneficiary_details',
        'status',
        'failure_reason',
        'webhook_payload',
        'created_by',
        'approved_by',
        'approved_at',
        'rejected_by',
        'rejected_at',
        'rejection_reason',
    ];

    protected $casts = [
        'beneficiary_details' => 'array',
        'webhook_payload'     => 'array',
        'amount'              => 'decimal:2',
        'approved_at'         => 'datetime',
        'rejected_at'         => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }

    public function bank()
    {
        return $this->belongsTo(Bank::class);
    }

    public function withdrawalRequest()
    {
        return $this->belongsTo(WithdrawalRequest::class, 'source_withdrawal_id');
    }

    public function walletTransaction()
    {
        return $this->belongsTo(WalletTransaction::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function rejector()
    {
        return $this->belongsTo(User::class, 'rejected_by');
    }

    /**
     * Helper for status badges
     */
    public function getStatusBadgeAttribute(): array
    {
        return match ($this->status) {
            'pending_approval' => ['label' => 'بانتظار الاعتماد المالي', 'color' => 'amber'],
            'processing'       => ['label' => 'قيد المعالجة البنكية (سريع)', 'color' => 'blue'],
            'completed'        => ['label' => 'تم التحويل بنجاح', 'color' => 'emerald'],
            'rejected'         => ['label' => 'مرفوض إدارياً', 'color' => 'red'],
            'failed'           => ['label' => 'فشل التحويل البنكي', 'color' => 'rose'],
            default            => ['label' => $this->status, 'color' => 'gray'],
        };
    }
}

