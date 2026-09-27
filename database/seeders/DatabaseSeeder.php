<?php

namespace Database\Seeders;

use App\Models\CompanyApiKey;
use App\Models\CompanyProfile;
use App\Models\Contract;
use App\Models\InvestorProfile;
use App\Models\LandingPageSection;
use App\Models\SystemSetting;
use App\Models\Task;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Services\EncryptedSettingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Permissions list
        $permissions = [
            'view_dashboard',
            'manage_users',
            'manage_investors',
            'manage_companies',
            'manage_tasks',
            'fund_tasks',
            'manage_wallets',
            'manage_deposits',
            'manage_withdrawals',
            'manage_contracts',
            'manage_settings',
            'manage_landing_page',
            'view_audit_logs',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Roles
        $adminRole = Role::findOrCreate('admin', 'web');
        $adminRole->syncPermissions(Permission::all());

        $investorRole = Role::findOrCreate('investor', 'web');
        $investorRole->syncPermissions([
            'view_dashboard',
            'fund_tasks',
            'manage_wallets',
        ]);

        $companyRole = Role::findOrCreate('company', 'web');
        $companyRole->syncPermissions([
            'view_dashboard',
            'manage_tasks',
            'manage_withdrawals',
        ]);

        // 2. Super Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@gotech.com'],
            [
                'name' => 'مدير المنصة الرئيسي',
                'phone' => '+966500000001',
                'user_type' => 'admin',
                'status' => 'active',
                'locale' => 'ar',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole($adminRole);

        // 3. Demo Investor User
        $investorUser = User::firstOrCreate(
            ['email' => 'investor@gotech.com'],
            [
                'name' => 'أحمد عبد العزيز (مستثمر)',
                'phone' => '+966555112233',
                'user_type' => 'investor',
                'status' => 'active',
                'locale' => 'ar',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $investorUser->assignRole($investorRole);

        $investorProfile = InvestorProfile::firstOrCreate(
            ['user_id' => $investorUser->id],
            [
                'national_id' => '1098765432',
                'investor_type' => 'individual',
                'bank_name' => 'مصرف الراجحي',
                'bank_iban' => 'SA4480000123456789012345',
                'bank_account_number' => '1234567890',
                'platform_commission_share_rate' => 70.00,
                'status' => 'active',
            ]
        );

        // Investor Wallets & Initial Balance
        $invWallet = Wallet::firstOrCreate(
            ['user_id' => $investorUser->id, 'wallet_type' => 'investor_investment'],
            ['currency' => 'SAR', 'balance' => 150000.00, 'locked_balance' => 0.00]
        );
        
        $commWallet = Wallet::firstOrCreate(
            ['user_id' => $investorUser->id, 'wallet_type' => 'investor_commission'],
            ['currency' => 'SAR', 'balance' => 12500.00, 'locked_balance' => 0.00]
        );

        // Investor Contract
        Contract::firstOrCreate(
            ['contract_number' => 'CNT-INV-2026-001'],
            [
                'party_type' => 'investor',
                'party_id' => $investorProfile->id,
                'user_id' => $investorUser->id,
                'contract_type' => 'investment_agreement',
                'title' => 'عقد استثمار وتمويل المهام اللوجستية',
                'terms_text' => 'تم الاتفاق بين منصة Go-Tech والمستثمر على حصول المستثمر على نسبة 70% من صافي عمولة المهام الممولة.',
                'commission_rate' => 70.00,
                'start_date' => now()->subMonths(3)->toDateString(),
                'end_date' => now()->addYear()->toDateString(),
                'status' => 'active',
                'signed_by_user_id' => $admin->id,
                'signed_at' => now()->subMonths(3),
            ]
        );

        // 4. Demo Logistics Company User
        $companyUser = User::firstOrCreate(
            ['email' => 'company@fastlogistics.com'],
            [
                'name' => 'شركة المسار السريع للخدمات اللوجستية',
                'phone' => '+966112233445',
                'user_type' => 'company',
                'status' => 'active',
                'locale' => 'ar',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $companyUser->assignRole($companyRole);

        $companyProfile = CompanyProfile::firstOrCreate(
            ['user_id' => $companyUser->id],
            [
                'company_name' => 'شركة المسار السريع اللوجستية',
                'cr_number' => '1010998877',
                'tax_number' => '300998877600003',
                'contact_person' => 'سعد المنصور',
                'contact_email' => 's.almansoor@fastlogistics.com',
                'contact_phone' => '+966501234567',
                'city' => 'الرياض',
                'address' => 'طريق الملك فهد، حي الصحافة',
                'website' => 'https://fastlogistics.com',
                'webhook_url' => 'https://webhook.site/demo-endpoint',
                'webhook_secret' => 'whsec_gotech_fastlogistics_9988',
                'platform_commission_rate' => 12.00,
                'status' => 'active',
            ]
        );

        // Company Funding & Debt Wallets
        $compFundingWallet = Wallet::firstOrCreate(
            ['user_id' => $companyUser->id, 'wallet_type' => 'company_funding'],
            ['currency' => 'SAR', 'balance' => 45000.00, 'locked_balance' => 0.00]
        );

        $compDebtWallet = Wallet::firstOrCreate(
            ['user_id' => $companyUser->id, 'wallet_type' => 'company_debt'],
            ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
        );

        // Company API Key
        $plainKey = 'gt_live_99887766554433221100aabbccddeeff';
        $prefix = substr($plainKey, 0, 8);
        $hash = hash('sha256', $plainKey);
        CompanyApiKey::firstOrCreate(
            ['api_key_hash' => $hash],
            [
                'company_id' => $companyProfile->id,
                'key_name' => 'المفتاح الإنتاجي الأساسي',
                'api_key_prefix' => $prefix,
                'permissions' => ['tasks:create', 'tasks:read', 'tasks:cancel'],
                'status' => 'active',
            ]
        );

        // Company Contract
        Contract::firstOrCreate(
            ['contract_number' => 'CNT-CMP-2026-001'],
            [
                'party_type' => 'company',
                'party_id' => $companyProfile->id,
                'user_id' => $companyUser->id,
                'contract_type' => 'logistics_service',
                'title' => 'عقد اتفاقية تزويد وتمويل المهام اللوجستية',
                'terms_text' => 'تم الاتفاق بين منصة Go-Tech وشركة المسار السريع على تقديم المنصة لخدمات التمويل للمهام بنسبة عمولة 12% للمنصة.',
                'commission_rate' => 12.00,
                'start_date' => now()->subMonths(2)->toDateString(),
                'end_date' => now()->addYear()->toDateString(),
                'status' => 'active',
                'signed_by_user_id' => $admin->id,
                'signed_at' => now()->subMonths(2),
            ]
        );

        // 5. Sample Logistics Tasks
        $sampleTasks = [
            [
                'external_task_id' => 'ORD-RYD-8821',
                'task_number' => 'TSK-202609-001',
                'title' => 'شحنة معدات تقنية وتجهيزات شبكات',
                'description' => 'نقل سريع لمعدات اتصالات وخوادم من مستودعات السلي إلى حي العليا',
                'pickup_city' => 'الرياض',
                'pickup_address' => 'مستودعات السلي المركزية، مخرج 16',
                'dropoff_city' => 'الرياض',
                'dropoff_address' => 'أبراج العليا، طريق الملك فهد',
                'funding_amount' => 4500.00,
                'company_commission_rate' => 12.00,
                'platform_commission_amount' => 540.00,
                'estimated_delivery_time' => '4 ساعات',
                'expires_at' => now()->addMinutes(45),
                'status' => 'available',
            ],
            [
                'external_task_id' => 'ORD-JED-9932',
                'task_number' => 'TSK-202609-002',
                'title' => 'شحنة أدوية ومستلزمات طبية مبردة',
                'description' => 'نقل مبرد عالي الدقة من ميناء جدة الإسلامي إلى مجمع الملك عبد الله الطبي',
                'pickup_city' => 'جدة',
                'pickup_address' => 'ميناء جدة الإسلامي، بوابة 3',
                'dropoff_city' => 'جدة',
                'dropoff_address' => 'مجمع الملك عبد الله الطبي، حي الشراع',
                'funding_amount' => 7800.00,
                'company_commission_rate' => 14.00,
                'platform_commission_amount' => 1092.00,
                'estimated_delivery_time' => '3 ساعات',
                'expires_at' => now()->addMinutes(30),
                'status' => 'available',
            ],
            [
                'external_task_id' => 'ORD-DMM-4412',
                'task_number' => 'TSK-202609-003',
                'title' => 'قطع غيار توربينات صناعية',
                'description' => 'نقل عاجل لقطع غيار ثقيلة من المدينة الصناعية الثانية بالدمام إلى الجبيل الصناعية',
                'pickup_city' => 'الدمام',
                'pickup_address' => 'المدينة الصناعية الثانية',
                'dropoff_city' => 'الجبيل',
                'dropoff_address' => 'الهيئة الملكية، الجبيل 2',
                'funding_amount' => 12500.00,
                'company_commission_rate' => 15.00,
                'platform_commission_amount' => 1875.00,
                'estimated_delivery_time' => '6 ساعات',
                'expires_at' => now()->addMinutes(60),
                'status' => 'available',
            ],
            [
                'external_task_id' => 'ORD-MKK-1109',
                'task_number' => 'TSK-202609-004',
                'title' => 'شحنة تموينات فندقية موسمية',
                'description' => 'توزيع مواد غذائية وإعاشة إلى فنادق المنطقة المركزية المحيطة بالحرم المكي',
                'pickup_city' => 'مكة المكرمة',
                'pickup_address' => 'منطقة المستودعات، الكعكية',
                'dropoff_city' => 'مكة المكرمة',
                'dropoff_address' => 'فنادق إبراهيم الخليل، المركزية',
                'funding_amount' => 6200.00,
                'company_commission_rate' => 11.00,
                'platform_commission_amount' => 682.00,
                'estimated_delivery_time' => '2 ساعات',
                'expires_at' => now()->addMinutes(20),
                'status' => 'available',
            ],
        ];

        foreach ($sampleTasks as $taskData) {
            Task::updateOrCreate(
                ['task_number' => $taskData['task_number']],
                array_merge($taskData, ['company_id' => $companyProfile->id])
            );
        }

        // 6. System Settings
        $defaultSettings = [
            ['key' => 'site_name_ar', 'value' => 'منصة جو تك للاستثمار اللوجستي', 'group' => 'general', 'label' => 'اسم المنصة بالعربية'],
            ['key' => 'site_name_en', 'value' => 'GoTech Logistics Investment', 'group' => 'general', 'label' => 'اسم المنصة بالإنجليزية'],
            ['key' => 'default_currency', 'value' => 'SAR', 'group' => 'general', 'label' => 'العملة الافتراضية'],
            ['key' => 'platform_default_commission_rate', 'value' => '10.00', 'group' => 'general', 'label' => 'نسبة عمولة المنصة الافتراضية للشركات (%)'],
            ['key' => 'investor_default_share_rate', 'value' => '70.00', 'group' => 'general', 'label' => 'نسبة أرباح المستثمر الافتراضية من صافي العمولة (%)'],
            
            // HyperPay Settings
            ['key' => 'hyperpay_environment', 'value' => 'test', 'group' => 'hyperpay', 'label' => 'بيئة التشغيل (test / live)'],
            ['key' => 'hyperpay_access_token', 'value' => 'OGFjZGE0Yzg4Yzg5Mjg5YTAxOGM4OTJhZjkwNzAwMTh8c2VjcmV0', 'group' => 'hyperpay', 'is_encrypted' => true, 'label' => 'مفتاح Access Token'],
            ['key' => 'hyperpay_entity_id_mada', 'value' => '8acda4c88c89289a018c892af9070019', 'group' => 'hyperpay', 'is_encrypted' => true, 'label' => 'Entity ID (MADA)'],
            ['key' => 'hyperpay_entity_id_visa_master', 'value' => '8acda4c88c89289a018c892af9070020', 'group' => 'hyperpay', 'is_encrypted' => true, 'label' => 'Entity ID (VISA / Mastercard)'],
            ['key' => 'hyperpay_entity_id_apple_pay', 'value' => '8acda4c88c89289a018c892af9070021', 'group' => 'hyperpay', 'is_encrypted' => true, 'label' => 'Entity ID (Apple Pay)'],

            // HyperSplit Settings
            ['key' => 'hypersplit_api_key', 'value' => 'hs_live_key_encrypted_demo', 'group' => 'hypersplit', 'is_encrypted' => true, 'label' => 'HyperSplit API Key'],
            ['key' => 'hypersplit_merchant_id', 'value' => 'HS-MCH-99201', 'group' => 'hypersplit', 'is_encrypted' => true, 'label' => 'HyperSplit Merchant ID'],

            // Bank Accounts
            ['key' => 'bank_name', 'value' => 'مصرف الراجحي', 'group' => 'general', 'label' => 'اسم بنك المنصة الرسمي للإيداعات'],
            ['key' => 'bank_iban', 'value' => 'SA0380000555555555555555', 'group' => 'general', 'label' => 'رقم الآيبان IBAN'],
            ['key' => 'bank_account_holder', 'value' => 'شركة جو تك لتقنية المعلومات والحلول المالية', 'group' => 'general', 'label' => 'اسم المستفيد'],
        ];

        foreach ($defaultSettings as $st) {
            EncryptedSettingService::set(
                $st['key'],
                $st['value'],
                $st['group'],
                $st['is_encrypted'] ?? false,
                $st['label'],
                null,
                $admin->id
            );
        }

        // 7. Landing Page Content
        LandingPageSection::updateOrCreate(
            ['section_key' => 'hero'],
            [
                'title_ar' => 'منصة التمويل والاستثمار في قطاع النقل والخدمات اللوجستية',
                'title_en' => 'Next-Gen Financial Investment Platform in Logistics',
                'subtitle_ar' => 'فرص استثمارية مباشرة وبعوائد مالية سريعة عبر تمويل مهام النقل والتوصيل اللحظية بالشراكة مع كبرى شركات الخدمات اللوجستية.',
                'subtitle_en' => 'Direct investment opportunities with fast financial returns by funding real-time logistics tasks.',
                'content' => [
                    'badge_ar' => '🚀 المنصة المالية الأولى بالمملكة لتمويل النقل اللوجستي',
                    'badge_en' => '🚀 #1 Financial Platform for Logistics Financing in KSA',
                    'cta_primary_text_ar' => 'ابدأ الاستثمار الآن',
                    'cta_primary_text_en' => 'Start Investing Now',
                    'cta_secondary_text_ar' => 'بوابة الشركات والـ API',
                    'cta_secondary_text_en' => 'Enterprise & API Integration',
                ],
                'order' => 1,
                'is_active' => true,
            ]
        );

        LandingPageSection::updateOrCreate(
            ['section_key' => 'stats'],
            [
                'title_ar' => 'أرقام وإحصائيات المنصة',
                'title_en' => 'Platform Key Metrics',
                'content' => [
                    'items' => [
                        ['number' => '+250,000', 'label_ar' => 'مهمة لوجستية ممولة', 'label_en' => 'Funded Tasks'],
                        ['number' => '+85M SAR', 'label_ar' => 'إجمالي المبالغ المستثمرة', 'label_en' => 'Total Invested Capital'],
                        ['number' => '14.8%', 'label_ar' => 'متوسط العائد السنوي', 'label_en' => 'Average Annual Return'],
                        ['number' => '100%', 'label_ar' => 'أمان محاسبي وضمان تعاقدي', 'label_en' => 'Contractual & Ledger Security'],
                    ]
                ],
                'order' => 2,
                'is_active' => true,
            ]
        );

        $this->call(DemoPlatformSeeder::class);
    }
}
