<?php

namespace App\Services;

use App\Models\HyperpayTransaction;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class HyperPayService
{
    public function __construct(
        protected WalletService $walletService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Map payment brand to HyperPay widget brands string.
     */
    public function getBrandsForWidget(string $paymentBrand): string
    {
        return match (strtoupper(trim($paymentBrand))) {
            'MADA' => 'MADA',
            'APPLEPAY' => 'APPLEPAY',
            default => 'VISA MASTER',
        };
    }

    /**
     * Prepare a HyperPay checkout session.
     */
    public function prepareCheckout(User $user, float $amount, string $paymentBrand = 'VISA'): array
    {
        $config = EncryptedSettingService::getHyperPayConfig();
        $brandUpper = strtoupper(trim($paymentBrand));

        $entityId = match ($brandUpper) {
            'MADA' => $config['entity_id_mada'],
            'APPLEPAY' => $config['entity_id_apple_pay'],
            default => $config['entity_id_visa_master'],
        };

        // If credentials are not configured or are set to placeholder values, fallback gracefully to Mock Mode
        $isMissingCredentials = empty($config['access_token']) || empty($entityId) ||
            str_contains($config['access_token'], 'EXAMPLE') ||
            str_contains($entityId, 'EXAMPLE');

        if ($isMissingCredentials) {
            $mockCheckoutId = 'MOCK_' . md5(uniqid((string) mt_rand(), true));

            HyperpayTransaction::create([
                'user_id' => $user->id,
                'wallet_id' => $user->investment_wallet->id,
                'checkout_id' => $mockCheckoutId,
                'payment_brand' => $brandUpper,
                'amount' => $amount,
                'currency' => 'SAR',
                'status' => 'pending',
                'raw_response' => ['mode' => 'simulation_mock'],
            ]);

            return [
                'checkout_id' => $mockCheckoutId,
                'is_mock' => true,
                'script_url' => '',
                'brand' => $brandUpper,
                'brands' => $this->getBrandsForWidget($brandUpper),
                'redirect_url' => route('investor.wallet.hyperpay.checkout.show', ['checkoutId' => $mockCheckoutId]),
            ];
        }

        $cleanBase = rtrim($config['base_url'], '/');
        $url = $cleanBase . '/v1/checkouts';
        $formattedAmount = number_format($amount, 2, '.', '');

        // Extract customer names and transliterate Arabic to Latin for 3DS2 compliance
        $fullName = trim($user->name ?: 'Investor');
        $nameParts = explode(' ', $fullName, 2);
        $givenName = $this->transliterateArabic($nameParts[0] ?? 'Investor', 'Investor');
        $surname = $this->transliterateArabic($nameParts[1] ?? 'User', 'User');

        $merchantTxId = 'INV-DEP-' . $user->id . '-' . time();

        $data = [
            'entityId' => $entityId,
            'amount' => $formattedAmount,
            'currency' => $config['currency'] ?? 'SAR',
            'paymentType' => 'DB',
            'merchantTransactionId' => $merchantTxId,
            'customer.email' => $user->email ?: 'investor@example.com',
            'customer.givenName' => $givenName,
            'customer.surname' => $surname,
            'billing.street1' => 'King Fahd Road',
            'billing.city' => 'Riyadh',
            'billing.state' => 'Riyadh',
            'billing.country' => 'SA',
            'billing.postcode' => '12345',
            'customParameters[3DS2_enrolled]' => 'true',
            'merchant.url' => config('app.url'),
        ];

        // Include test mode parameters when using sandbox/test server
        $isTestMode = ($config['mode'] === 'test') || str_contains($config['base_url'], 'test');
        if ($isTestMode) {
            $data['testMode'] = 'EXTERNAL';
            $data['integrity'] = 'true';
        }

        Log::info('HyperPay Outgoing Checkout Request', [
            'url' => $url,
            'user_id' => $user->id,
            'amount' => $formattedAmount,
            'brand' => $brandUpper,
            'merchantTransactionId' => $merchantTxId,
            'test_mode' => $isTestMode,
        ]);

        $client = Http::timeout(30);
        if (app()->isLocal()) {
            $client = $client->withoutVerifying();
        }

        $response = $client->withToken($config['access_token'])
            ->asForm()
            ->post($url, $data);

        if (!$response->successful()) {
            $errorDesc = $response->json('result.description', $response->body());
            Log::error("HyperPay checkout creation failed: {$errorDesc}", [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
            throw new RuntimeException("فشل إنشاء جلسة الدفع في HyperPay: " . $errorDesc);
        }

        $responseData = $response->json();
        $checkoutId = $responseData['id'] ?? null;

        if (!$checkoutId) {
            throw new RuntimeException("لم يتم استلام معرّف جلسة الدفع (Checkout ID) من HyperPay.");
        }

        HyperpayTransaction::create([
            'user_id' => $user->id,
            'wallet_id' => $user->investment_wallet->id,
            'checkout_id' => $checkoutId,
            'payment_brand' => $brandUpper,
            'amount' => $amount,
            'currency' => $config['currency'] ?? 'SAR',
            'status' => 'pending',
            'raw_response' => $responseData,
        ]);

        $scriptUrl = $cleanBase . "/v1/paymentWidgets.js?checkoutId={$checkoutId}";

        return [
            'checkout_id' => $checkoutId,
            'is_mock' => false,
            'script_url' => $scriptUrl,
            'brand' => $brandUpper,
            'brands' => $this->getBrandsForWidget($brandUpper),
            'redirect_url' => route('investor.wallet.hyperpay.checkout.show', ['checkoutId' => $checkoutId]),
        ];
    }

    /**
     * Verify payment status with HyperPay.
     */
    public function verifyPayment(string $checkoutId, ?string $resourcePath = null): array
    {
        $transaction = HyperpayTransaction::where('checkout_id', $checkoutId)->firstOrFail();

        if ($transaction->status === 'paid') {
            return [
                'status' => 'success',
                'message' => 'تم الدفع والشحن مسبقاً لهذه المعاملة.',
                'transaction' => $transaction,
            ];
        }

        // Mock verification if in mock mode
        if (str_starts_with($checkoutId, 'MOCK_')) {
            $transaction->status = 'paid';
            $transaction->hyperpay_id = 'HP_SIM_' . rand(100000, 999999);
            $transaction->result_code = '000.100.110';
            $transaction->result_description = 'Transaction succeeded (Mock Mode)';
            $transaction->save();

            // Credit Investor Investment Wallet
            $brandLabel = match(strtoupper(trim($transaction->payment_brand))) {
                'MADA' => 'مدى (Mada)',
                'APPLEPAY' => 'Apple Pay',
                'VISA' => 'فيزا (Visa)',
                'MASTER' => 'ماستركارد (MasterCard)',
                default => 'بطاقة دفع إلكترونية',
            };
            $this->walletService->creditWallet(
                $transaction->wallet,
                (float) $transaction->amount,
                'deposit',
                "إيداع وشحن إلكتروني لمحفظة الاستثمار - {$brandLabel} (#{$transaction->id})",
                $transaction
            );

            // Audit log
            $this->auditLogService->log(
                'approved',
                $transaction,
                ['status' => 'pending'],
                ['status' => 'paid', 'amount' => $transaction->amount, 'mode' => 'mock'],
                "شحن تجريبي لمحفظة الاستثمار بمبلغ {$transaction->amount} ر.س عبر HyperPay"
            );

            // Notify Admin
            NotificationDispatcherService::dispatch(
                'admin.deposit_completed',
                "شحن إلكتروني ناجح: {$transaction->user->name}",
                "تم شحن محفظة المستثمر ({$transaction->user->name}) بمبلغ " . number_format($transaction->amount, 2) . " ر.س بنجاح عبر بوابة HyperPay (تجريبي).",
                route('admin.deposits.index', [], false),
                ['transaction_id' => $transaction->id, 'amount' => $transaction->amount]
            );

            // Notify Investor
            NotificationDispatcherService::dispatch(
                'investor.deposit_credited',
                "تم شحن محفظتك الاستثمارية",
                "تمت عملية الدفع بنجاح وإيداع مبلغ " . number_format($transaction->amount, 2) . " ر.س في محفظة الاستثمار الخاصة بك وهو متاح الآن للاستثمار.",
                route('investor.wallet.investment', [], false),
                ['transaction_id' => $transaction->id, 'amount' => $transaction->amount],
                $transaction->user,
                'success'
            );

            return [
                'status' => 'success',
                'message' => 'تمت عملية الدفع بنجاح وإيداع الرصيد في محفظتك الاستثمارية.',
                'transaction' => $transaction,
            ];
        }

        $config = EncryptedSettingService::getHyperPayConfig();
        $brandUpper = strtoupper(trim($transaction->payment_brand));

        $entityId = match ($brandUpper) {
            'MADA' => $config['entity_id_mada'],
            'APPLEPAY' => $config['entity_id_apple_pay'],
            default => $config['entity_id_visa_master'],
        };

        $cleanBase = rtrim($config['base_url'], '/');
        if ($resourcePath) {
            $formattedPath = str_starts_with($resourcePath, '/') ? $resourcePath : '/' . $resourcePath;
            $url = (str_starts_with($resourcePath, 'http') ? $resourcePath : $cleanBase . $formattedPath)
                . (str_contains($resourcePath, '?') ? '&' : '?') . "entityId={$entityId}";
        } else {
            $url = $cleanBase . "/v1/checkouts/{$checkoutId}/payment?entityId={$entityId}";
        }

        $client = Http::timeout(30);
        if (app()->isLocal()) {
            $client = $client->withoutVerifying();
        }

        $response = $client->withToken($config['access_token'])
            ->get($url);

        $resData = $response->json();
        $resultCode = $resData['result']['code'] ?? '';
        $isSuccess = (bool) preg_match('/^(000\.000\.|000\.100\.1|000\.[36])/', $resultCode);

        $transaction->result_code = $resultCode;
        $transaction->result_description = $resData['result']['description'] ?? '';
        $transaction->hyperpay_id = $resData['id'] ?? null;
        $transaction->raw_response = $resData;

        if ($isSuccess) {
            $transaction->status = 'paid';
            $transaction->save();

            // Credit Investor Investment Wallet
            $brandLabel = match(strtoupper(trim($transaction->payment_brand))) {
                'MADA' => 'مدى (Mada)',
                'APPLEPAY' => 'Apple Pay',
                'VISA' => 'فيزا (Visa)',
                'MASTER' => 'ماستركارد (MasterCard)',
                default => 'بطاقة دفع إلكترونية',
            };
            $this->walletService->creditWallet(
                $transaction->wallet,
                (float) $transaction->amount,
                'deposit',
                "إيداع وشحن إلكتروني لمحفظة الاستثمار - {$brandLabel} (#{$transaction->id})",
                $transaction
            );

            $this->auditLogService->log(
                'approved',
                $transaction,
                ['status' => 'pending'],
                ['status' => 'paid', 'amount' => $transaction->amount],
                "شحن ناجح لمحفظة الاستثمار بمبلغ {$transaction->amount} ر.س عبر HyperPay ({$brandUpper})"
            );

            // Notify Admin of electronic deposit
            NotificationDispatcherService::dispatch(
                'admin.deposit_completed',
                "شحن إلكتروني ناجح: {$transaction->user->name}",
                "تم شحن محفظة المستثمر ({$transaction->user->name}) بمبلغ " . number_format($transaction->amount, 2) . " ر.س بنجاح عبر بوابة HyperPay ({$brandUpper}).",
                route('admin.deposits.index', [], false),
                ['transaction_id' => $transaction->id, 'amount' => $transaction->amount]
            );

            // Notify Investor
            NotificationDispatcherService::dispatch(
                'investor.deposit_credited',
                "تم شحن محفظتك الاستثمارية",
                "تمت عملية الدفع بنجاح وإيداع مبلغ " . number_format($transaction->amount, 2) . " ر.س في محفظة الاستثمار الخاصة بك وهو متاح الآن للاستثمار.",
                route('investor.wallet.investment', [], false),
                ['transaction_id' => $transaction->id, 'amount' => $transaction->amount],
                $transaction->user,
                'success'
            );

            return [
                'status' => 'success',
                'message' => 'تمت عملية الدفع بنجاح وإيداع الرصيد في محفظتك الاستثمارية.',
                'transaction' => $transaction,
            ];
        } else {
            $transaction->status = 'failed';
            $transaction->save();

            $friendlyMessage = $this->getUserFriendlyMessage($resultCode, $resData['result']['description'] ?? null);

            // Notify Admin of deposit failure
            NotificationDispatcherService::dispatch(
                'admin.deposit_failed',
                "فشل عملية دفع إلكتروني: {$transaction->user->name}",
                "فشلت محاولة شحن محفظة بقيمة " . number_format($transaction->amount, 2) . " ر.س للمستثمر ({$transaction->user->name}). السبب: {$friendlyMessage}",
                route('admin.deposits.index', [], false),
                ['transaction_id' => $transaction->id, 'reason' => $friendlyMessage],
                null,
                'warning'
            );

            return [
                'status' => 'failed',
                'message' => $friendlyMessage,
                'transaction' => $transaction,
            ];
        }
    }

    /**
     * Map HyperPay technical response code to user-friendly Arabic explanation.
     */
    public function getUserFriendlyMessage(string $resultCode, ?string $defaultDescription = null): string
    {
        $codeMap = [
            // Card / Account Issues
            '100.100.303' => 'رصيد البطاقة غير كافٍ لإتمام عملية الشحن.',
            '100.100.304' => 'تم تجاوز الحد الائتماني المسموح به للبطاقة.',
            '800.100.151' => 'تم رفض البطاقة من قبل البنك المصدر. يرجى مراجعة البنك.',
            '800.100.152' => 'تم رفض المعاملة من البنك المصدر.',
            '800.100.153' => 'رمز التحقق الأمني (CVV) غير صحيح.',
            '800.100.154' => 'البطاقة منتهية الصلاحية.',
            '800.100.155' => 'اسم حامل البطاقة غير متطابق مع بيانات البطاقة.',
            '800.100.157' => 'تم حظر البطاقة أو الإبلاغ عنها كمفقودة.',
            '800.100.159' => 'اشتباه في عملية غير مصرح بها أو احتيالية.',
            '800.100.160' => 'تم تجاوز الحد الأقصى للمحاولات غير الصحيحة للبطاقة.',
            '800.100.161' => 'البطاقة غير مفعلة للشراء عبر الإنترنت.',
            '800.100.162' => 'البطاقة مقيدة بحدود يومية أو شهرية محددة.',
            '800.100.168' => 'تم تقييد البطاقة من قبل البنك.',
            '800.100.170' => 'تم رفض عملية الدفع من نظام الحماية المصرفي.',
            '800.100.172' => 'لم يتم إكمال التحقق الثنائي (OTP / 3D Secure).',
            '800.100.178' => 'البلد الصادر منه البطاقة غير مدعوم لهذه العملية.',

            // System / Timeout Issues
            '900.100.100' => 'انتهت مهلة الاتصال بالبنك المصدر. يرجى المحاولة لاحقاً.',
            '900.100.200' => 'حدث خطأ غير متوقع في بوابة الدفع. يرجى المحاولة لاحقاً.',
            '900.100.300' => 'البنك المصدر غير متاح حالياً.',
            '900.200.100' => 'جلسة الدفع منتهية الصلاحية. يرجى إعادة محاولة الشحن من جديد.',
        ];

        if (isset($codeMap[$resultCode])) {
            return $codeMap[$resultCode];
        }

        foreach ($codeMap as $codePrefix => $message) {
            if (str_starts_with($resultCode, $codePrefix)) {
                return $message;
            }
        }

        return $defaultDescription ? "فشلت عملية الدفع: {$defaultDescription}" : 'فشلت عملية الدفع. يرجى التأكد من بيانات البطاقة أو المحاولة ببطاقة أخرى.';
    }

    /**
     * Transliterate Arabic characters to English for HyperPay protocol compliance.
     */
    public function transliterateArabic(?string $string, string $default = 'Customer'): string
    {
        if (empty($string)) {
            return $default;
        }

        $arabicMap = [
            'أ' => 'a', 'إ' => 'e', 'آ' => 'a', 'ا' => 'a', 'ب' => 'b', 'ت' => 't', 'ث' => 'th', 'ج' => 'j',
            'ح' => 'h', 'خ' => 'kh', 'د' => 'd', 'ذ' => 'th', 'ر' => 'r', 'ز' => 'z', 'س' => 's', 'ش' => 'sh',
            'ص' => 's', 'ض' => 'd', 'ط' => 't', 'ظ' => 'th', 'ع' => 'a', 'غ' => 'gh', 'ف' => 'f', 'ق' => 'q',
            'ك' => 'k', 'ل' => 'l', 'م' => 'm', 'ن' => 'n', 'ه' => 'h', 'و' => 'w', 'ي' => 'y', 'ى' => 'a',
            'ة' => 'h', 'ئ' => 'e', 'ء' => 'a', 'ؤ' => 'o', 'ٲ' => 'a',
        ];

        $transliterated = strtr($string, $arabicMap);
        $cleaned = preg_replace('/[^a-zA-Z0-9\s-]/', '', $transliterated);
        $cleaned = trim((string) $cleaned);

        return empty($cleaned) ? $default : $cleaned;
    }
}
