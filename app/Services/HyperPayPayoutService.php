<?php

namespace App\Services;

use App\Models\Bank;
use App\Models\HyperpayPayout;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HyperPayPayoutService
{
    protected string $baseUrl;
    protected ?string $username;
    protected ?string $password;
    protected ?string $merchantId;
    protected ?string $sourceId;
    protected string $defaultPurpose;
    protected bool $enabled;

    public function __construct()
    {
        // Load dynamically from EncryptedSettingService or fallback to config
        $rawUrl = EncryptedSettingService::get('hyperpay_payout_url', config('services.hyperpay.payout_url', 'https://gateway.sandbox.hyperpay.com/payouts'));
        $rawUrl = rtrim((string) $rawUrl, '/');
        if (!str_ends_with($rawUrl, '/payouts') && !str_ends_with($rawUrl, '/payout')) {
            $rawUrl .= '/payouts';
        }

        $this->baseUrl = $rawUrl;
        $this->username = EncryptedSettingService::get('hyperpay_payout_username', config('services.hyperpay.payout_username'));
        $this->password = EncryptedSettingService::get('hyperpay_payout_password', config('services.hyperpay.payout_password'));
        $this->merchantId = EncryptedSettingService::get('hyperpay_payout_merchant_id', config('services.hyperpay.payout_merchant_id'));
        $this->sourceId = EncryptedSettingService::get('hyperpay_payout_source_id', config('services.hyperpay.payout_source_id'));
        $this->defaultPurpose = EncryptedSettingService::get('hyperpay_payout_purpose', 'BA') ?: 'BA';
        $this->enabled = (bool) EncryptedSettingService::get('hyperpay_payout_enabled', true);
    }

    public function isEnabled(): bool
    {
        return $this->enabled && !empty($this->username) && !empty($this->password) && !empty($this->sourceId);
    }

    /**
     * Map Response Codes to friendly Arabic Messages
     */
    public function getResponseMessage(string $code, string $default = 'خطأ غير معروف'): string
    {
        $codes = [
            '00000' => 'تمت المعالجة بنجاح عبر النظام البنكي',
            '00001' => 'تم استلام طلب التحويل البنكي بنجاح',
            '33000' => 'تمت جدولة عملية التحويل',
            '33333' => 'جاري معالجة التحويل البنكي الفوري حالياً',
            '13000' => 'خطأ في التحقق من بيانات التحويل',
            '13001' => 'رقم حساب المصدر (Source ID) غير صحيح',
            '13004' => 'البيانات المطلوبة غير مكتملة في الطلب',
            '13005' => 'القناة البنكية المستخدمة غير صحيحة',
            '13006' => 'رقم المرجع (Reference) مستخدم مسبقاً',
            '13008' => 'رمز الغرض من التحويل (Purpose Code) غير صالح',
            '63000' => 'تم رفض العملية من قبل النظام البنكي المستفيد',
            '90000' => 'العملية بانتظار تأكيد البنك المستلم',
            '88888' => 'خطأ تقني في شبكة بوابة HyperPay',
            '77000' => 'تم إلغاء العملية بنجاح',
        ];

        return $codes[$code] ?? $default;
    }

    /**
     * Validate IBAN format and MOD-97 Checksum (ISO 7064 / ISO 13616)
     */
    public static function validateIbanChecksum(?string $iban, string $entityType = 'المستفيد'): array
    {
        $cleanIban = strtoupper(str_replace([' ', '-', '.'], '', trim($iban ?? '')));

        if (empty($cleanIban)) {
            return [
                'valid'   => false,
                'message' => "رقم الآيبان فارغ. يرجى إدخال رقم الآيبان البنكي لـ {$entityType}.",
            ];
        }

        // Saudi IBAN must start with SA and be exactly 24 characters
        if (str_starts_with($cleanIban, 'SA')) {
            if (strlen($cleanIban) !== 24) {
                return [
                    'valid'   => false,
                    'message' => "طول رقم الآيبان السعودي غير صحيح (" . strlen($cleanIban) . " حرف). يجب أن يتكون من 24 خانة ويبدأ بـ SA.",
                ];
            }

            if (!preg_match('/^SA[0-9]{2}[0-9A-Z]{20}$/', $cleanIban)) {
                return [
                    'valid'   => false,
                    'message' => 'صيغة الآيبان السعودي غير صالحة. يجب أن يبدأ بـ SA متبوعاً برقمي التحقق ثم باقي رقم الحساب.',
                ];
            }
        } elseif (strlen($cleanIban) < 15 || strlen($cleanIban) > 34) {
            return [
                'valid'   => false,
                'message' => "طول رقم الآيبان الدولي غير صحيح (" . strlen($cleanIban) . " خانة).",
            ];
        }

        // Standard MOD-97 checksum calculation
        $rearranged = substr($cleanIban, 4) . substr($cleanIban, 0, 4);

        $numericString = '';
        foreach (str_split($rearranged) as $char) {
            if (ctype_alpha($char)) {
                $numericString .= (ord($char) - 55);
            } else {
                $numericString .= $char;
            }
        }

        $remainder = 0;
        $chunkSize = 7;
        for ($i = 0; $i < strlen($numericString); $i += $chunkSize) {
            $chunk = $remainder . substr($numericString, $i, $chunkSize);
            $remainder = intval($chunk) % 97;
        }

        if ($remainder !== 1) {
            return [
                'valid'   => false,
                'message' => "رقم الآيبان ({$cleanIban}) غير صحيح رياضياً أو به خطأ في أحد الأرقام (فشل في فحص التحقق للآيبان IBAN Checksum). يرجى التأكد من نسخه بدقة من تطبيق البنك.",
            ];
        }

        return [
            'valid' => true,
            'clean' => $cleanIban,
        ];
    }

    /**
     * Convert/sanitize beneficiary name to valid Latin alphanumeric format for banking networks
     */
    public static function formatBeneficiaryName(?string $name): string
    {
        $name = trim($name ?? '');
        if (empty($name)) {
            return 'Beneficiary';
        }

        if (preg_match('/[\x{0600}-\x{06FF}]/u', $name)) {
            if (function_exists('transliterator_transliterate')) {
                $latin = transliterator_transliterate('Any-Latin; Latin-ASCII;', $name);
            } else {
                $customMap = [
                    'عبد الله' => 'Abdullah', 'عبدالله' => 'Abdullah',
                    'عبد الرحمن' => 'Abdulrahman', 'عبدالرحمن' => 'Abdulrahman',
                    'عبد العزيز' => 'Abdulaziz', 'عبدالعزيز' => 'Abdulaziz',
                    'أ' => 'A', 'إ' => 'E', 'آ' => 'A', 'ا' => 'A',
                    'ب' => 'B', 'ت' => 'T', 'ث' => 'Th', 'ج' => 'J',
                    'ح' => 'H', 'خ' => 'Kh', 'د' => 'D', 'ذ' => 'Dh',
                    'ر' => 'R', 'ز' => 'Z', 'س' => 'S', 'ش' => 'Sh',
                    'ص' => 'S', 'ض' => 'Dh', 'ط' => 'T', 'ظ' => 'Dh',
                    'ع' => 'A', 'غ' => 'Gh', 'ف' => 'F', 'ق' => 'Q',
                    'ك' => 'K', 'ل' => 'L', 'م' => 'M', 'ن' => 'N',
                    'ه' => 'H', 'ة' => 'H', 'و' => 'W', 'ي' => 'Y',
                    'ى' => 'A', 'ئ' => 'Y', 'ء' => '', 'ؤ' => 'O'
                ];
                $latin = str_replace(array_keys($customMap), array_values($customMap), $name);
            }

            $cleaned = preg_replace('/[^a-zA-Z0-9\s\.\,\'-]/', '', $latin ?: '');
            $cleaned = trim(preg_replace('/\s+/', ' ', $cleaned ?: ''));

            if (!empty($cleaned)) {
                $name = ucwords(strtolower($cleaned));
            }
        }

        $name = preg_replace('/[^a-zA-Z0-9\s\.\'-]/', '', $name ?: '');
        $name = trim(preg_replace('/\s+/', ' ', $name ?: ''));

        if (empty($name) || strlen($name) < 2) {
            $name = 'Beneficiary Account';
        }

        return substr($name, 0, 70);
    }

    /**
     * Dispatch an instant payout via HyperPay
     */
    public function sendPayout(array $data): array
    {
        try {
            // 1. Verify Bank exists and is active in the system
            $bicCode = $data['bic'] ?? null;
            if (!empty($data['bank_id'])) {
                $bank = Bank::find($data['bank_id']);
                if (!$bank) {
                    return [
                        'status'  => false,
                        'code'    => 'BANK_NOT_FOUND',
                        'message' => 'البنك المحدد غير موجود في قاعدة بيانات النظام.',
                        'data'    => null,
                    ];
                }
                if (!$bank->is_active) {
                    return [
                        'status'  => false,
                        'code'    => 'BANK_INACTIVE',
                        'message' => "البنك المحدد ({$bank->name}) غير مفعل للتحويلات البنكية حالياً من قبل الإدارة.",
                        'data'    => null,
                    ];
                }
                $bicCode = $bank->code;
            }

            if (empty($bicCode)) {
                return [
                    'status'  => false,
                    'code'    => 'BIC_REQUIRED',
                    'message' => 'كود السويفت/BIC البنكي مطلوب وغير محدد للبنك.',
                    'data'    => null,
                ];
            }

            // 2. Pre-validate IBAN Checksum locally
            $rawIban = str_replace(' ', '', $data['iban'] ?? '');
            $ibanCheck = self::validateIbanChecksum($rawIban, $data['entity_type'] ?? 'المستفيد');
            if (!$ibanCheck['valid']) {
                return [
                    'status'  => false,
                    'code'    => '13000',
                    'message' => $ibanCheck['message'],
                    'data'    => null,
                ];
            }
            $cleanIban = $ibanCheck['clean'];

            // 3. Format beneficiary name
            $beneficiaryName = self::formatBeneficiaryName($data['beneficiary_name'] ?? '');

            // 4. Sanitize description (max 35 alphanumeric chars)
            $cleanDesc = trim(preg_replace('/[^A-Za-z0-9 ]/', ' ', $data['description'] ?? ''));
            $cleanDesc = preg_replace('/\s+/', ' ', $cleanDesc);
            if (empty($cleanDesc) || strlen($cleanDesc) < 4) {
                $cleanDesc = 'Payout ' . substr($beneficiaryName, 0, 20);
            }
            $description = substr($cleanDesc, 0, 35);

            // 5. Addresses & Purpose
            $address1 = trim(preg_replace('/[^A-Za-z0-9 ]/', ' ', $data['address1'] ?? 'Riyadh'));
            $address1 = preg_replace('/\s+/', ' ', $address1) ?: 'Riyadh';
            $address2 = trim(preg_replace('/[^A-Za-z0-9 ]/', ' ', $data['address2'] ?? 'Street'));
            $address2 = preg_replace('/\s+/', ' ', $address2) ?: 'Street';
            $purpose = !empty($data['purpose']) ? trim($data['purpose']) : $this->defaultPurpose;

            $payload = [
                'merchantReference' => 'REF-' . time(),
                'sourceId'          => trim((string) $this->sourceId),
                'payouts'           => [
                    [
                        'payoutReference' => $data['externalId'],
                        'amount'          => number_format((float) $data['amount'], 2, '.', ''),
                        'currency'        => $data['currency'] ?? 'SAR',
                        'transferMode'    => 'INSTANT',
                        'channel'         => $data['channel'] ?? 'IPS',
                        'purpose'         => (string) $purpose,
                        'description'     => $description,
                        'beneficiary'     => [
                            'name'     => $beneficiaryName,
                            'address1' => $address1,
                            'address2' => $address2,
                            'country'  => $data['country'] ?? 'SA',
                            'city'     => $data['city'] ?? 'Riyadh',
                            'iban'     => $cleanIban,
                            'bicCode'  => $bicCode,
                        ],
                    ]
                ]
            ];

            Log::info('HyperPay Payout Sending Request:', [
                'url'         => $this->baseUrl,
                'merchant_id' => $this->merchantId,
                'source_id'   => $this->sourceId,
                'payload'     => $payload
            ]);

            $response = Http::withBasicAuth((string) $this->username, (string) $this->password)
                ->withHeaders([
                    'X-Merchant-Id' => (string) $this->merchantId,
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/json',
                ])
                ->post($this->baseUrl, $payload);

            $result = $response->json();
            Log::info('HyperPay Payout Response:', ['result' => $result]);

            $rootResult = $result['result'] ?? $result;
            $responseCode = $rootResult['responseCode'] ?? ($result['responseCode'] ?? 'ERROR');
            $payoutDetails = $rootResult['payouts'][0] ?? ($result['payouts'][0] ?? $rootResult);
            $finalResponseCode = $payoutDetails['responseCode'] ?? $responseCode;
            $finalMessage = $payoutDetails['responseMessage'] ?? ($rootResult['responseMessage'] ?? ($result['responseMessage'] ?? 'Unknown Error'));

            $isSuccessCode = in_array($finalResponseCode, ['00000', '00001', '33000', '33333']);

            if (!$isSuccessCode) {
                $finalMessage = $this->parseErrors($result, $finalResponseCode, $finalMessage);
            } else {
                $finalMessage = $this->getResponseMessage($finalResponseCode, $finalMessage);
            }

            return [
                'status'  => $isSuccessCode,
                'code'    => $finalResponseCode,
                'message' => $finalMessage,
                'data'    => $payoutDetails,
            ];

        } catch (Exception $e) {
            Log::error('HyperPay Payout Exception:', ['message' => $e->getMessage()]);
            return [
                'status'  => false,
                'code'    => 'EXCEPTION',
                'message' => 'حدث استثناء غير متوقع: ' . $e->getMessage(),
                'data'    => null,
            ];
        }
    }

    /**
     * Check payout status by payoutReference
     */
    public function checkPayoutStatus(string $referenceId, ?string $payoutId = null): array
    {
        try {
            $url = str_replace('/payouts', '/payout', $this->baseUrl);

            $payload = [
                'merchantId'       => $this->merchantId,
                'entityId'         => $this->merchantId,
                'payout-reference' => $referenceId,
            ];

            if ($payoutId) {
                $payload['payout-id'] = $payoutId;
            }

            $response = Http::withBasicAuth((string) $this->username, (string) $this->password)
                ->withHeaders([
                    'X-Merchant-Id' => (string) $this->merchantId,
                    'Content-Type'  => 'application/json',
                    'Accept'        => 'application/json',
                ])
                ->send('GET', $url, [
                    'query' => $payload,
                    'json'  => $payload,
                ]);

            $result = $response->json();
            Log::info('HyperPay Check Status Response:', ['result' => $result]);

            $responseCode = $result['responseCode'] ?? 'ERROR';
            $message = $result['responseMessage'] ?? 'Unknown Error';
            $isSuccessCode = in_array($responseCode, ['00000', '00001', '33000', '33333']);

            return [
                'status'  => $isSuccessCode,
                'code'    => $responseCode,
                'message' => $this->getResponseMessage($responseCode, $message),
                'data'    => $result,
            ];

        } catch (Exception $e) {
            Log::error('HyperPay Check Status Exception:', ['message' => $e->getMessage()]);
            return [
                'status'  => false,
                'code'    => 'EXCEPTION',
                'message' => 'استثناء أثناء الاستعلام: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Parse errors returned from HyperPay
     */
    protected function parseErrors($result, ?string $finalResponseCode = null, ?string $defaultMessage = null): string
    {
        $rootResult = $result['result'] ?? $result;
        $errors = $rootResult['errors'] ?? ($result['errors'] ?? null);

        if (empty($errors) && !empty($rootResult['payouts'][0]['errors'])) {
            $errors = $rootResult['payouts'][0]['errors'];
        }

        $fieldNames = [
            'payouts.0.beneficiary.iban'    => 'الآيبان البنكي (IBAN)',
            'beneficiary.iban'              => 'الآيبان البنكي (IBAN)',
            'iban'                          => 'الآيبان البنكي (IBAN)',
            'payouts.0.beneficiary.bicCode' => 'كود السويفت/BIC للبنك',
            'beneficiary.bicCode'           => 'كود السويفت/BIC للبنك',
            'bicCode'                       => 'كود السويفت/BIC للبنك',
            'payouts.0.beneficiary.name'    => 'اسم المستفيد',
            'beneficiary.name'              => 'اسم المستفيد',
            'payouts.0.amount'              => 'مبلغ التحويل',
            'sourceId'                      => 'رقم حساب المصدر (Source ID)',
        ];

        $translatedList = [];
        if (!empty($errors) && is_array($errors)) {
            foreach ($errors as $field => $fieldErrors) {
                $friendlyField = $fieldNames[$field] ?? $field;
                $messages = is_array($fieldErrors) ? $fieldErrors : [$fieldErrors];
                foreach ($messages as $msg) {
                    $translatedList[] = "• {$friendlyField}: {$msg}";
                }
            }
        }

        if (!empty($translatedList)) {
            return "خطأ في بيانات التحويل البنكي:\n" . implode("\n", $translatedList);
        }

        return $this->getResponseMessage($finalResponseCode ?? '', $defaultMessage ?: 'خطأ في معالجة التحويل البنكي');
    }
}

