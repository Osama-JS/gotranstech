<?php

namespace App\Services;

use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class WalletService
{
    /**
     * Credit funds to a wallet with atomic locking.
     */
    public function creditWallet(
        Wallet $wallet,
        float $amount,
        string $type,
        string $description,
        ?Model $reference = null,
        array $metadata = []
    ): WalletTransaction {
        if ($amount <= 0) {
            throw new InvalidArgumentException("Credit amount must be greater than zero.");
        }

        return DB::transaction(function () use ($wallet, $amount, $type, $description, $reference, $metadata) {
            /** @var Wallet $lockedWallet */
            $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->firstOrFail();

            $balanceBefore = (float) $lockedWallet->balance;
            $balanceAfter = $balanceBefore + $amount;

            $lockedWallet->balance = $balanceAfter;
            $lockedWallet->save();

            $transaction = WalletTransaction::create([
                'wallet_id' => $lockedWallet->id,
                'user_id' => $lockedWallet->user_id,
                'transaction_type' => $type,
                'amount' => $amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference ? $reference->getKey() : null,
                'description' => $description,
                'status' => 'completed',
                'metadata' => $metadata,
            ]);

            return $transaction;
        });
    }

    /**
     * Debit funds from a wallet with atomic balance check.
     */
    public function debitWallet(
        Wallet $wallet,
        float $amount,
        string $type,
        string $description,
        ?Model $reference = null,
        array $metadata = []
    ): WalletTransaction {
        if ($amount <= 0) {
            throw new InvalidArgumentException("Debit amount must be greater than zero.");
        }

        return DB::transaction(function () use ($wallet, $amount, $type, $description, $reference, $metadata) {
            /** @var Wallet $lockedWallet */
            $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->firstOrFail();

            $availableBalance = (float) ($lockedWallet->balance - $lockedWallet->locked_balance);

            if ($availableBalance < $amount) {
                throw new RuntimeException("Insufficient available balance. Available: {$availableBalance}, Requested: {$amount}");
            }

            $balanceBefore = (float) $lockedWallet->balance;
            $balanceAfter = $balanceBefore - $amount;

            $lockedWallet->balance = $balanceAfter;
            $lockedWallet->save();

            $transaction = WalletTransaction::create([
                'wallet_id' => $lockedWallet->id,
                'user_id' => $lockedWallet->user_id,
                'transaction_type' => $type,
                'amount' => -$amount,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'reference_type' => $reference ? get_class($reference) : null,
                'reference_id' => $reference ? $reference->getKey() : null,
                'description' => $description,
                'status' => 'completed',
                'metadata' => $metadata,
            ]);

            return $transaction;
        });
    }

    /**
     * Lock funds inside a wallet (for pending actions).
     */
    public function lockBalance(Wallet $wallet, float $amount): void
    {
        DB::transaction(function () use ($wallet, $amount) {
            $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->firstOrFail();
            $available = (float) ($lockedWallet->balance - $lockedWallet->locked_balance);

            if ($available < $amount) {
                throw new RuntimeException("Insufficient balance to lock.");
            }

            $lockedWallet->locked_balance = (float) $lockedWallet->locked_balance + $amount;
            $lockedWallet->save();
        });
    }

    /**
     * Unlock locked funds inside a wallet.
     */
    public function unlockBalance(Wallet $wallet, float $amount): void
    {
        DB::transaction(function () use ($wallet, $amount) {
            $lockedWallet = Wallet::where('id', $wallet->id)->lockForUpdate()->firstOrFail();
            $lockedWallet->locked_balance = max(0, (float) $lockedWallet->locked_balance - $amount);
            $lockedWallet->save();
        });
    }
}
