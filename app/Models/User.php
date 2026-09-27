<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'country_code',
        'phone',
        'user_type',
        'status',
        'avatar',
        'locale',
        'two_factor_enabled',
        'additional_data',
        'form_template_id',
        'agreement_signed_at',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'agreement_signed_at' => 'datetime',
            'two_factor_enabled' => 'boolean',
            'additional_data' => 'array',
            'password' => 'hashed',
        ];
    }

    public function formTemplate(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(FormTemplate::class);
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin' || $this->hasRole('admin');
    }

    public function isInvestor(): bool
    {
        return $this->user_type === 'investor';
    }

    public function isCompany(): bool
    {
        return $this->user_type === 'company';
    }

    public function investorProfile(): HasOne
    {
        return $this->hasOne(InvestorProfile::class);
    }

    public function companyProfile(): HasOne
    {
        return $this->hasOne(CompanyProfile::class);
    }

    public function wallets(): HasMany
    {
        return $this->hasMany(Wallet::class);
    }

    public function getInvestmentWalletAttribute(): ?Wallet
    {
        return $this->wallets()->firstOrCreate(
            ['wallet_type' => 'investor_investment'],
            ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
        );
    }

    public function getCommissionWalletAttribute(): ?Wallet
    {
        return $this->wallets()->firstOrCreate(
            ['wallet_type' => 'investor_commission'],
            ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
        );
    }

    public function getCompanyFundingWalletAttribute(): ?Wallet
    {
        return $this->wallets()->firstOrCreate(
            ['wallet_type' => 'company_funding'],
            ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
        );
    }

    public function getCompanyDebtWalletAttribute(): ?Wallet
    {
        return $this->wallets()->firstOrCreate(
            ['wallet_type' => 'company_debt'],
            ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
        );
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }

    public function bankDeposits(): HasMany
    {
        return $this->hasMany(BankDeposit::class);
    }

    public function fundedTasks(): HasMany
    {
        return $this->hasMany(Task::class, 'funded_by_investor_id');
    }

    public function investments(): HasMany
    {
        return $this->hasMany(TaskInvestment::class, 'investor_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function getFullPhoneAttribute(): ?string
    {
        if (!$this->phone) {
            return null;
        }
        $code = $this->country_code ?: '+966';
        return "{$code} {$this->phone}";
    }
}
