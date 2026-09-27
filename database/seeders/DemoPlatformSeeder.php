<?php

namespace Database\Seeders;

use App\Models\BankDeposit;
use App\Models\CompanyApiKey;
use App\Models\CompanyDebt;
use App\Models\CompanyProfile;
use App\Models\Contract;
use App\Models\FormField;
use App\Models\FormTemplate;
use App\Models\InvestorProfile;
use App\Models\Task;
use App\Models\TaskInvestment;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\WithdrawalRequest;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoPlatformSeeder extends Seeder
{
    /**
     * Run the comprehensive demo platform seeder.
     */
    public function run(): void
    {
        $adminRole = Role::findOrCreate('admin', 'web');
        $investorRole = Role::findOrCreate('investor', 'web');
        $companyRole = Role::findOrCreate('company', 'web');

        $superAdmin = User::where('user_type', 'admin')->first();

        // 1. Create Default Form Templates (الحقول الإضافية)
        $investorTemplate = FormTemplate::firstOrCreate(
            ['applies_to' => 'investor', 'name' => 'نموذج تسجيل المستثمر الأفراد والشركات'],
            [
                'description' => 'البيانات الاستثمارية والمالية الإضافية المطلوبة لتفعيل حساب المستثمر وبدء التمويل',
                'is_active' => true,
            ]
        );

        $investorFields = [
            ['name' => 'national_id', 'label' => 'رقم الهوية الوطنية / الإقامة', 'type' => 'number', 'is_required' => true, 'placeholder' => '10XXXXXXXX', 'order' => 1],
            ['name' => 'investor_experience', 'label' => 'الخبرة الاستثمارية السابقة', 'type' => 'select', 'is_required' => true, 'options' => ['مبتدئ', 'متوسط (1 - 3 سنوات)', 'محترف (+3 سنوات)'], 'order' => 2],
            ['name' => 'monthly_investment_budget', 'label' => 'الميزانية الشهرية المتوقعة للتمويل (ر.س)', 'type' => 'number', 'is_required' => true, 'placeholder' => '50000', 'order' => 3],
            ['name' => 'preferred_city', 'label' => 'المنطقة الجغرافية المفضلة للتمويل', 'type' => 'select', 'is_required' => false, 'options' => ['كافة مناطق المملكة', 'منطقة الرياض', 'منطقة مكة وجدة', 'المنطقة الشرقية'], 'order' => 4],
            ['name' => 'notes', 'label' => 'ملاحظات أو اشتراطات خاصة', 'type' => 'textarea', 'is_required' => false, 'placeholder' => 'أي تفاصيل إضافية تود إعلام الإدارة بها...', 'order' => 5],
        ];

        foreach ($investorFields as $f) {
            FormField::firstOrCreate(
                ['form_template_id' => $investorTemplate->id, 'name' => $f['name']],
                $f
            );
        }

        $companyTemplate = FormTemplate::firstOrCreate(
            ['applies_to' => 'company', 'name' => 'نموذج بيانات الشركة اللوجستية والربط التقني'],
            [
                'description' => 'بيانات الأسطول والربط التقني API لتفعيل حسابات شركات التوصيل المعتمدة',
                'is_active' => true,
            ]
        );

        $companyFields = [
            ['name' => 'cr_number', 'label' => 'رقم السجل التجاري (CR Number)', 'type' => 'number', 'is_required' => true, 'placeholder' => '1010XXXXXX', 'order' => 1],
            ['name' => 'fleet_size', 'label' => 'حجم أسطول الشاحنات والمركبات', 'type' => 'select', 'is_required' => true, 'options' => ['10 - 50 مركبة', '51 - 200 مركبة', '+200 مركبة ثقيلة'], 'order' => 2],
            ['name' => 'main_operations_city', 'label' => 'المدينة الرئيسية للمستودعات', 'type' => 'select', 'is_required' => true, 'options' => ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'المدينة المنورة'], 'order' => 3],
            ['name' => 'daily_tasks_volume', 'label' => 'متوسط عدد الشحنات اليومية الجاهزة للتمويل', 'type' => 'number', 'is_required' => true, 'placeholder' => '150', 'order' => 4],
            ['name' => 'tech_contact_person', 'label' => 'اسم المسؤول التقني للربط البرمجي API', 'type' => 'text', 'is_required' => false, 'placeholder' => 'المهندس المسؤول', 'order' => 5],
        ];

        foreach ($companyFields as $f) {
            FormField::firstOrCreate(
                ['form_template_id' => $companyTemplate->id, 'name' => $f['name']],
                $f
            );
        }

        // 2. Demo Logistics Companies
        $companiesData = [
            [
                'name' => 'شركة أسطول الخليج للنقل',
                'company_name' => 'أسطول الخليج اللوجستية',
                'email' => 'contact@gulf-fleet.com',
                'phone' => '+966504433221',
                'cr_number' => '1010443322',
                'city' => 'الرياض',
                'commission_rate' => 11.00,
                'additional_data' => [
                    'cr_number' => '1010443322',
                    'fleet_size' => '51 - 200 مركبة',
                    'main_operations_city' => 'الرياض',
                    'daily_tasks_volume' => '220',
                    'tech_contact_person' => 'م. طارق العسيري',
                ]
            ],
            [
                'name' => 'شركة ناقل إكسبريس اللوجستية',
                'company_name' => 'ناقل إكسبريس للتوزيع السريع',
                'email' => 'ops@naqel-express-demo.com',
                'phone' => '+966505566778',
                'cr_number' => '2050556677',
                'city' => 'الدمام',
                'commission_rate' => 13.50,
                'additional_data' => [
                    'cr_number' => '2050556677',
                    'fleet_size' => '+200 مركبة ثقيلة',
                    'main_operations_city' => 'الدمام',
                    'daily_tasks_volume' => '450',
                    'tech_contact_person' => 'م. حسام الدين',
                ]
            ],
            [
                'name' => 'شركة سهم الغربية للشحن المبرد',
                'company_name' => 'سهم الغربية للشحن والتوزيع',
                'email' => 'info@sahm-west.com',
                'phone' => '+966509988112',
                'cr_number' => '4030998811',
                'city' => 'جدة',
                'commission_rate' => 14.00,
                'additional_data' => [
                    'cr_number' => '4030998811',
                    'fleet_size' => '51 - 200 مركبة',
                    'main_operations_city' => 'جدة',
                    'daily_tasks_volume' => '180',
                    'tech_contact_person' => 'م. فيصل الغامدي',
                ]
            ],
        ];

        $createdCompanies = [];

        foreach ($companiesData as $cData) {
            $user = User::firstOrCreate(
                ['email' => $cData['email']],
                [
                    'name' => $cData['name'],
                    'phone' => $cData['phone'],
                    'user_type' => 'company',
                    'status' => 'active',
                    'locale' => 'ar',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'form_template_id' => $companyTemplate->id,
                    'agreement_signed_at' => now()->subDays(rand(10, 60)),
                    'additional_data' => $cData['additional_data'],
                ]
            );
            $user->assignRole($companyRole);

            $profile = CompanyProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $cData['company_name'],
                    'cr_number' => $cData['cr_number'],
                    'contact_person' => $cData['name'],
                    'contact_email' => $cData['email'],
                    'contact_phone' => $cData['phone'],
                    'city' => $cData['city'],
                    'platform_commission_rate' => $cData['commission_rate'],
                    'status' => 'active',
                ]
            );

            // Wallets
            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'company_funding'],
                ['currency' => 'SAR', 'balance' => rand(25000, 85000), 'locked_balance' => 0.00]
            );

            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'company_debt'],
                ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
            );

            // API Key
            $keyPlain = 'gt_live_' . bin2hex(random_bytes(16));
            CompanyApiKey::firstOrCreate(
                ['company_id' => $profile->id],
                [
                    'key_name' => 'مفتاح الإنتاج - ' . $profile->company_name,
                    'api_key_prefix' => substr($keyPlain, 0, 8),
                    'api_key_hash' => hash('sha256', $keyPlain),
                    'permissions' => ['tasks:create', 'tasks:read', 'tasks:cancel'],
                    'status' => 'active',
                    'last_used_at' => now()->subHours(rand(1, 24)),
                ]
            );

            // Contract
            Contract::firstOrCreate(
                ['contract_number' => 'CNT-CMP-' . rand(1000, 9999)],
                [
                    'party_type' => 'company',
                    'party_id' => $profile->id,
                    'user_id' => $user->id,
                    'contract_type' => 'company_service',
                    'title' => 'اتفاقية تقديم خدمات وربط لوجستي - ' . $profile->company_name,
                    'terms_text' => 'تم الاتفاق بين منصة Go-Tech والشركة اللوجستية على تقديم خدمات التمويل الفوري وتوفير السيولة اللازمة.',
                    'commission_rate' => $cData['commission_rate'],
                    'start_date' => now()->subMonths(2)->toDateString(),
                    'end_date' => now()->addYear()->toDateString(),
                    'status' => 'active',
                    'signed_at' => now()->subMonths(2),
                ]
            );

            $createdCompanies[] = $profile;
        }

        // 3. Demo Investors
        $investorsData = [
            [
                'name' => 'سلطان بن فهد التميمي',
                'email' => 'sultan.investor@gotech-demo.com',
                'phone' => '+966551239988',
                'share_rate' => 75.00,
                'balance' => 280000.00,
                'comm_balance' => 24500.00,
                'additional_data' => [
                    'national_id' => '1088776655',
                    'investor_experience' => 'محترف (+3 سنوات)',
                    'monthly_investment_budget' => '300000',
                    'preferred_city' => 'كافة مناطق المملكة',
                ]
            ],
            [
                'name' => 'سارة بنت عبد الله القحطاني',
                'email' => 'sara.investor@gotech-demo.com',
                'phone' => '+966559988776',
                'share_rate' => 70.00,
                'balance' => 120000.00,
                'comm_balance' => 9800.00,
                'additional_data' => [
                    'national_id' => '1077665544',
                    'investor_experience' => 'متوسط (1 - 3 سنوات)',
                    'monthly_investment_budget' => '150000',
                    'preferred_city' => 'منطقة الرياض',
                ]
            ],
            [
                'name' => 'خالد بن ناصر العتيبي',
                'email' => 'khaled.investor@gotech-demo.com',
                'phone' => '+966554433112',
                'share_rate' => 70.00,
                'balance' => 95000.00,
                'comm_balance' => 6400.00,
                'additional_data' => [
                    'national_id' => '1066554433',
                    'investor_experience' => 'متوسط (1 - 3 سنوات)',
                    'monthly_investment_budget' => '100000',
                    'preferred_city' => 'المنطقة الشرقية',
                ]
            ],
        ];

        $createdInvestors = [];

        foreach ($investorsData as $iData) {
            $user = User::firstOrCreate(
                ['email' => $iData['email']],
                [
                    'name' => $iData['name'],
                    'phone' => $iData['phone'],
                    'user_type' => 'investor',
                    'status' => 'active',
                    'locale' => 'ar',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'form_template_id' => $investorTemplate->id,
                    'agreement_signed_at' => now()->subDays(rand(10, 45)),
                    'additional_data' => $iData['additional_data'],
                ]
            );
            $user->assignRole($investorRole);

            $profile = InvestorProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'national_id' => $iData['additional_data']['national_id'],
                    'investor_type' => 'individual',
                    'bank_name' => 'مصرف الراجحي',
                    'bank_iban' => 'SA4480000' . rand(100000000000000, 999999999999999),
                    'platform_commission_share_rate' => $iData['share_rate'],
                    'status' => 'active',
                ]
            );

            $invWallet = Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'investor_investment'],
                ['currency' => 'SAR', 'balance' => $iData['balance'], 'locked_balance' => 0.00]
            );

            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'investor_commission'],
                ['currency' => 'SAR', 'balance' => $iData['comm_balance'], 'locked_balance' => 0.00]
            );

            // Bank Deposit Record
            BankDeposit::firstOrCreate(
                ['reference_number' => 'DEP-2026-' . rand(1000, 9999)],
                [
                    'user_id' => $user->id,
                    'wallet_id' => $invWallet->id,
                    'deposit_number' => 'DEP-' . rand(10000, 99999),
                    'amount' => rand(50000, 150000),
                    'bank_name' => 'مصرف الراجحي',
                    'sender_name' => $user->name,
                    'receipt_file_path' => 'deposits/demo_receipt.pdf',
                    'status' => 'approved',
                    'reviewed_at' => now()->subDays(rand(2, 20)),
                    'reviewed_by_user_id' => $superAdmin?->id,
                ]
            );

            $createdInvestors[] = $user;
        }

        // 4. Sample Tasks with live & funded statuses
        $tasksSample = [
            ['title' => 'شحنة توريد مواد تموينية مركزية', 'pickup' => 'الرياض', 'drop' => 'الخرج', 'amount' => 5400.00, 'rate' => 12.00, 'status' => 'available'],
            ['title' => 'نقل قطع غيار سيارات أصلية', 'pickup' => 'جدة', 'drop' => 'مكة المكرمة', 'amount' => 8200.00, 'rate' => 14.00, 'status' => 'available'],
            ['title' => 'شحنة أجهزة إلكترونية ذكية', 'pickup' => 'الدمام', 'drop' => 'الخبر', 'amount' => 14500.00, 'rate' => 10.00, 'status' => 'available'],
            ['title' => 'نقل عاجل لمستلزمات صيدلانية', 'pickup' => 'المدينة المنورة', 'drop' => 'ينبع', 'amount' => 6900.00, 'rate' => 15.00, 'status' => 'available'],
            ['title' => 'شحنة مواد بناء وتجهيزات فندقية', 'pickup' => 'أبها', 'drop' => 'خميس مشيط', 'amount' => 11000.00, 'rate' => 11.50, 'status' => 'available'],
            ['title' => 'توزيع شحنات طرود بريدية سريعة', 'pickup' => 'الرياض', 'drop' => 'القصيم', 'amount' => 7600.00, 'rate' => 13.00, 'status' => 'funded'],
            ['title' => 'نقل حاوية بضائع من الميناء الجاف', 'pickup' => 'الرياض', 'drop' => 'الدمام', 'amount' => 18000.00, 'rate' => 12.50, 'status' => 'funded'],
        ];

        foreach ($tasksSample as $idx => $t) {
            $comp = $createdCompanies[$idx % count($createdCompanies)];
            $platformComm = ($t['amount'] * $t['rate']) / 100;

            $task = Task::firstOrCreate(
                ['task_number' => 'TSK-202609-0' . (10 + $idx)],
                [
                    'company_id' => $comp->id,
                    'external_task_id' => 'EXT-ORD-' . (5000 + $idx),
                    'title' => $t['title'],
                    'description' => 'مهمة نقل وشحن لوجستي موثقة ومعتمدة بالمسار السريع',
                    'pickup_city' => $t['pickup'],
                    'pickup_address' => 'المستودع الرئيسي - ' . $t['pickup'],
                    'dropoff_city' => $t['drop'],
                    'dropoff_address' => 'نقطة التسليم - ' . $t['drop'],
                    'funding_amount' => $t['amount'],
                    'company_commission_rate' => $t['rate'],
                    'platform_commission_amount' => $platformComm,
                    'status' => $t['status'],
                    'expires_at' => now()->addMinutes(rand(30, 90)),
                ]
            );

            if ($t['status'] === 'funded' && !empty($createdInvestors)) {
                $investor = $createdInvestors[$idx % count($createdInvestors)];
                $investorShareRate = 70.00;
                $investorProfit = ($platformComm * $investorShareRate) / 100;
                $netPlatform = $platformComm - $investorProfit;

                TaskInvestment::firstOrCreate(
                    ['task_id' => $task->id],
                    [
                        'investor_id' => $investor->id,
                        'investment_amount' => $t['amount'],
                        'platform_gross_commission' => $platformComm,
                        'investor_share_rate' => $investorShareRate,
                        'investor_commission_amount' => $investorProfit,
                        'platform_net_commission' => $netPlatform,
                        'status' => 'completed',
                    ]
                );
            }
        }
    }
}
