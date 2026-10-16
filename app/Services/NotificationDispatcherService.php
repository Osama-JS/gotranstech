<?php

namespace App\Services;

use App\Models\AppNotification;
use App\Models\NotificationSetting;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class NotificationDispatcherService
{
    /**
     * Dispatch an event-based notification to users or roles according to notification settings.
     */
    public static function dispatch(
        string $eventKey,
        ?string $title = null,
        ?string $message = null,
        ?string $actionUrl = null,
        array $data = [],
        ?User $targetUser = null, // Used if notification is directly targeted (like investor/company)
        ?string $overrideSeverity = null
    ): void {
        try {
            self::ensureDefaultSettingsExist();

            /** @var NotificationSetting|null $setting */
            $setting = NotificationSetting::where('event_key', $eventKey)->first();

            // If the setting exists and is disabled globally, cancel dispatch
            if ($setting && !$setting->is_active) {
                return;
            }

            $severity = $overrideSeverity ?? ($setting ? $setting->severity : 'info');
            $finalTitle = $title ?? ($setting ? $setting->title_ar : 'تنبيه من المنصة');
            $finalMessage = $message ?? ($setting ? $setting->description_ar : '');

            // 1. Resolve recipients
            $recipients = collect();

            if ($targetUser) {
                $recipients->push($targetUser);
            } elseif ($setting && $setting->target_group === 'admin') {
                $query = User::where('user_type', 'admin');

                // Filter by specific user IDs if defined
                if (!empty($setting->target_user_ids) && is_array($setting->target_user_ids)) {
                    $query->whereIn('id', $setting->target_user_ids);
                }

                $admins = $query->get();

                // If target_roles is defined, filter admins by their spatie roles
                if (!empty($setting->target_roles) && is_array($setting->target_roles)) {
                    $admins = $admins->filter(function (User $admin) use ($setting) {
                        return $admin->hasAnyRole($setting->target_roles) || $admin->hasRole('Super Admin');
                    });
                }

                $recipients = $admins;
            }

            if ($recipients->isEmpty()) {
                // Fallback: If no recipients found for admin event, notify all active Super Admins
                if ($setting && $setting->target_group === 'admin') {
                    $recipients = User::where('user_type', 'admin')->get();
                }
            }

            // Channels from setting (or defaults)
            $channelsInApp = $setting ? $setting->channels_in_app : true;
            $channelsBrowser = $setting ? $setting->channels_browser : false;
            $channelsEmail = $setting ? $setting->channels_email : false;

            // 2. Deliver to each recipient
            foreach ($recipients as $recipient) {
                if ($channelsInApp) {
                    AppNotification::create([
                        'user_id' => $recipient->id,
                        'event_key' => $eventKey,
                        'title' => $finalTitle,
                        'message' => $finalMessage,
                        'action_url' => $actionUrl,
                        'severity' => $severity,
                        'data' => $data,
                        'is_read' => false,
                        'is_browser_delivered' => $channelsBrowser,
                        'is_email_sent' => false,
                    ]);
                }

                // If Email channel enabled
                if ($channelsEmail && !empty($recipient->email)) {
                    self::sendEmailNotification($recipient, $finalTitle, $finalMessage, $actionUrl);
                }
            }
        } catch (\Throwable $e) {
            Log::error("NotificationDispatcherService error on event [{$eventKey}]: " . $e->getMessage());
        }
    }

    /**
     * Send email notification in background safely
     */
    protected static function sendEmailNotification(User $user, string $title, string $message, ?string $actionUrl): void
    {
        try {
            $siteName = EncryptedSettingService::get('site_name_ar', config('app.name', 'GoTransTech'));
            $url = $actionUrl ? url($actionUrl) : url('/');

            Mail::send([], [], function ($mail) use ($user, $title, $message, $siteName, $url) {
                $htmlBody = "
                <div style='font-family: Arial, Tahoma, sans-serif; direction: rtl; text-align: right; background-color: #f8fafc; padding: 25px;'>
                    <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);'>
                        <div style='background-color: #6320EE; padding: 20px 24px; color: #ffffff;'>
                            <h2 style='margin: 0; font-size: 18px; font-weight: bold;'>{$siteName} - تنبيه جديد</h2>
                        </div>
                        <div style='padding: 24px; color: #1e293b;'>
                            <h3 style='margin-top: 0; color: #0f172a; font-size: 16px;'>{$title}</h3>
                            <p style='color: #475569; font-size: 14px; line-height: 1.6;'>{$message}</p>
                            <div style='margin-top: 25px; text-align: center;'>
                                <a href='{$url}' style='display: inline-block; background-color: #FF6B00; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 13px; padding: 12px 28px; border-radius: 8px;'>عرض التفاصيل في المنصة</a>
                            </div>
                        </div>
                        <div style='background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;'>
                            جميع الحقوق محفوظة © {$siteName}
                        </div>
                    </div>
                </div>";

                $mail->to($user->email)
                     ->subject("{$siteName} | {$title}")
                     ->html($htmlBody);
            });
        } catch (\Throwable $e) {
            Log::warning("Failed sending email notification to {$user->email}: " . $e->getMessage());
        }
    }

    /**
     * Seeds the comprehensive matrix of notification events into DB if not present
     */
    public static function ensureDefaultSettingsExist(): void
    {
        if (!Schema::hasTable('notification_settings')) {
            return;
        }

        $events = [
            // -------------------------------------------------------------
            // 1. ADMIN EVENTS: Tasks & Operations
            // -------------------------------------------------------------
            [
                'event_key' => 'admin.task_created',
                'target_group' => 'admin',
                'category' => 'tasks',
                'title_ar' => 'إنشاء مهمة لوجستية جديدة',
                'description_ar' => 'قامت إحدى الشركات اللوجستية بطرح مهمة شحن جديدة بانتظار التمويل في المنصة.',
                'severity' => 'info',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Operation Manager'],
            ],
            [
                'event_key' => 'admin.task_funded',
                'target_group' => 'admin',
                'category' => 'tasks',
                'title_ar' => 'تمويل مهمة بواسطة مستثمر',
                'description_ar' => 'قام مستثمر بتمويل مهمة شحن متاحة بنجاح، وتم حجز رأس المال واحتساب العمولات.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Financial Officer', 'Operation Manager'],
            ],
            [
                'event_key' => 'admin.task_cancelled',
                'target_group' => 'admin',
                'category' => 'tasks',
                'title_ar' => 'إلغاء مهمة شحن',
                'description_ar' => 'تم إلغاء مهمة شحن من قبل شركة النقل أو الإدارة قبل اكتمال تمويلها.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Operation Manager'],
            ],
            [
                'event_key' => 'admin.task_expired',
                'target_group' => 'admin',
                'category' => 'tasks',
                'title_ar' => 'انتهاء صلاحية عرض المهمة',
                'description_ar' => 'انتهت المهلة المحددة للمهمة في سوق المهام دون أن يمولها أي مستثمر.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => false,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Operation Manager'],
            ],
            [
                'event_key' => 'admin.task_repayment_confirmed',
                'target_group' => 'admin',
                'category' => 'finance',
                'title_ar' => 'سداد مستحقات المهمة من الشركة',
                'description_ar' => 'قامت الشركة اللوجستية بسداد قيمة المهمة الممولة بالكامل وإغلاق التزام الدين وتوزيع الأرباح.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
                'target_roles' => ['Super Admin', 'Financial Officer'],
            ],
            [
                'event_key' => 'admin.task_overdue',
                'target_group' => 'admin',
                'category' => 'finance',
                'title_ar' => 'تعثر وتأخر سداد مهمة عن موعدها',
                'description_ar' => 'تأخرت إحدى شركات النقل عن موعد سداد التزامات مهمة ممولة وتجاوزت فترة الاستحقاق.',
                'severity' => 'urgent', // Modal for Admin
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
                'target_roles' => ['Super Admin', 'Financial Officer', 'Risk Manager'],
            ],

            // -------------------------------------------------------------
            // 2. ADMIN EVENTS: Deposits, Withdrawals & Finance
            // -------------------------------------------------------------
            [
                'event_key' => 'admin.deposit_completed',
                'target_group' => 'admin',
                'category' => 'finance',
                'title_ar' => 'إيداع مالي جديد ناجح',
                'description_ar' => 'تم شحن محفظة مستثمر بنجاح عبر بوابة الدفع الإلكتروني أو الإيداع البنكي المعتمد.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Financial Officer'],
            ],
            [
                'event_key' => 'admin.deposit_failed',
                'target_group' => 'admin',
                'category' => 'finance',
                'title_ar' => 'فشل عملية إيداع مالي',
                'description_ar' => 'فشلت عملية دفع إلكتروني أو تم رفضها من مزود بوابة الدفع.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => false,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Financial Officer'],
            ],
            [
                'event_key' => 'admin.company_withdrawal_requested',
                'target_group' => 'admin',
                'category' => 'finance',
                'title_ar' => 'طلب سحب تمويل من شركة لوجستية',
                'description_ar' => 'تقدمت شركة لوجستية بطلب سحب رصيد تمويل المهمة إلى حسابها البنكي التجاري ويتطلب الاعتماد.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
                'target_roles' => ['Super Admin', 'Financial Officer'],
            ],
            [
                'event_key' => 'admin.investor_withdrawal_requested',
                'target_group' => 'admin',
                'category' => 'finance',
                'title_ar' => 'طلب سحب أرباح من مستثمر',
                'description_ar' => 'تقدم مستثمر بطلب سحب مالي من محفظة أرباحه أو رصيده المتاح ويتطلب المراجعة.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
                'target_roles' => ['Super Admin', 'Financial Officer'],
            ],
            [
                'event_key' => 'admin.large_amount_withdrawal_requested',
                'target_group' => 'admin',
                'category' => 'finance',
                'title_ar' => 'طلب سحب مالي بمبلغ كبير',
                'description_ar' => 'تم تقديم طلب سحب مالي يتجاوز الحد المعتاد ويتطلب موافقة الإدارة العليا.',
                'severity' => 'urgent', // Modal for Admin
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
                'target_roles' => ['Super Admin'],
            ],

            // -------------------------------------------------------------
            // 3. ADMIN EVENTS: Users, Compliance & Contracts
            // -------------------------------------------------------------
            [
                'event_key' => 'admin.new_investor_registered',
                'target_group' => 'admin',
                'category' => 'compliance',
                'title_ar' => 'تسجيل مستثمر جديد',
                'description_ar' => 'انضم مستثمر جديد للمنصة وقام بإنشاء حسابه الأولي.',
                'severity' => 'info',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => false,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Compliance Officer'],
            ],
            [
                'event_key' => 'admin.new_company_registered',
                'target_group' => 'admin',
                'category' => 'compliance',
                'title_ar' => 'تسجيل شركة لوجستية جديدة',
                'description_ar' => 'سجلت شركة شحن ولوجستيات جديدة في المنصة بانتظار التحقق من التراخيص والسجل.',
                'severity' => 'info',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Compliance Officer'],
            ],
            [
                'event_key' => 'admin.kyc_documents_submitted',
                'target_group' => 'admin',
                'category' => 'compliance',
                'title_ar' => 'رفع وثائق التحقق والسجل التجاري',
                'description_ar' => 'قام مستخدم برفع وثائق التحقق الرسمية (سجل تجاري / هوية) وهي جاهزة للاعتماد.',
                'severity' => 'info',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Compliance Officer'],
            ],
            [
                'event_key' => 'admin.contract_signed',
                'target_group' => 'admin',
                'category' => 'compliance',
                'title_ar' => 'توقيع اتفاقية استثمار إلكترونية',
                'description_ar' => 'تم توقيع عقد واستكمال الشروط وتوليد وثيقة العقد الرقمية المعتمدة.',
                'severity' => 'info',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => false,
                'channels_email' => false,
                'target_roles' => ['Super Admin', 'Legal Officer'],
            ],

            // -------------------------------------------------------------
            // 4. ADMIN EVENTS: Security & System Health
            // -------------------------------------------------------------
            [
                'event_key' => 'admin.security_alert',
                'target_group' => 'admin',
                'category' => 'security',
                'title_ar' => 'تنبيه أمني عاجل بنشاط مشبوه',
                'description_ar' => 'تم رصد محاولات تسجيل دخول غير مصرح بها أو تجاوز معدل الطلبات المسموح.',
                'severity' => 'urgent', // Modal for Admin
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
                'target_roles' => ['Super Admin'],
            ],
            [
                'event_key' => 'admin.system_service_outage',
                'target_group' => 'admin',
                'category' => 'system',
                'title_ar' => 'انقطاع أو خطأ في خدمات النظام',
                'description_ar' => 'حدث تعطل في الاتصال بخادم البريد SMTP أو بوابة الدفع أو قاعدة البيانات.',
                'severity' => 'urgent', // Modal for Admin
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
                'target_roles' => ['Super Admin'],
            ],

            // -------------------------------------------------------------
            // 5. INVESTOR EVENTS (Managed by Admin)
            // -------------------------------------------------------------
            [
                'event_key' => 'investor.deposit_credited',
                'target_group' => 'investor',
                'category' => 'finance',
                'title_ar' => 'تأكيد شحن المحفظة الاستثمارية',
                'description_ar' => 'تم تأكيد إيداع الرصيد بنجاح في محفظتك الاستثمارية وهو متاح الآن للاستثمار.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'investor.task_invested',
                'target_group' => 'investor',
                'category' => 'tasks',
                'title_ar' => 'تأكيد الاستثمار في مهمة لوجستية',
                'description_ar' => 'تم تأكيد استثمارك في المهمة بنجاح، وتوليد عقد الاستثمار المعتمد.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'investor.profit_collected',
                'target_group' => 'investor',
                'category' => 'finance',
                'title_ar' => 'استلام أرباح وعوائد المهمة',
                'description_ar' => 'تم تحصيل مستحقات المهمة من الشركة اللوجستية وإيداع حصة الأرباح في محفظتك.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'investor.withdrawal_approved',
                'target_group' => 'investor',
                'category' => 'finance',
                'title_ar' => 'الموافقة على طلب سحب الرصيد',
                'description_ar' => 'تمت الموافقة على طلب سحب أرباحك وجاري التحويل لحسابك البنكي المعتمد.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'investor.withdrawal_rejected',
                'target_group' => 'investor',
                'category' => 'finance',
                'title_ar' => 'رفض طلب السحب المالي',
                'description_ar' => 'تم رفض طلب السحب المالي مع إعادة الرصيد لمحفظتك، يرجى مراجعة السبب.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => false,
                'channels_email' => true,
            ],
            [
                'event_key' => 'investor.new_tasks_market',
                'target_group' => 'investor',
                'category' => 'tasks',
                'title_ar' => 'فرص استثمارية جديدة في سوق المهام',
                'description_ar' => 'تم إدراج مهام شحن جديدة جاهزة للتمويل بعوائد مجزية في سوق المهام.',
                'severity' => 'info',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => false,
            ],
            [
                'event_key' => 'investor.account_verified',
                'target_group' => 'investor',
                'category' => 'compliance',
                'title_ar' => 'توثيق الحساب الاستثماري',
                'description_ar' => 'تم التحقق من هويتك واعتماد حسابك الاستثماري رسمياً.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],

            // -------------------------------------------------------------
            // 6. COMPANY EVENTS (Managed by Admin)
            // -------------------------------------------------------------
            [
                'event_key' => 'company.task_created',
                'target_group' => 'company',
                'category' => 'tasks',
                'title_ar' => 'تأكيد إنشاء مهمة الشحن',
                'description_ar' => 'تم طرح مهمة الشحن في المنصة بنجاح وهي بانتظار التمويل.',
                'severity' => 'info',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => false,
                'channels_email' => false,
            ],
            [
                'event_key' => 'company.task_funded',
                'target_group' => 'company',
                'category' => 'tasks',
                'title_ar' => 'اكتمال تمويل مهمة الشحن',
                'description_ar' => 'تم تمويل شحنتكم بالكامل، وأصبح رصيد التمويل متاحاً في محفظتكم للسحب الفوري.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'company.withdrawal_disbursed',
                'target_group' => 'company',
                'category' => 'finance',
                'title_ar' => 'تحويل رصيد تمويل الشحنة',
                'description_ar' => 'تم تحويل مبلغ التمويل لحساب شركتكم البنكي مع إصدار سند السحب الرسمي (PDF).',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'company.repayment_due_soon',
                'target_group' => 'company',
                'category' => 'finance',
                'title_ar' => 'تذكير باقتراب موعد سداد المهمة',
                'description_ar' => 'تذكير باقتراب موعد سداد مستحقات المهمة الممولة لتفادي أي غرامات تأخير.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'company.repayment_confirmed',
                'target_group' => 'company',
                'category' => 'finance',
                'title_ar' => 'تأكيد استلام سداد المهمة',
                'description_ar' => 'تم تأكيد استلام سداد المهمة وإغلاق ذمة الدين المالية بنجاح. شكراً لالتزامكم.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
            [
                'event_key' => 'company.api_key_regenerated',
                'target_group' => 'company',
                'category' => 'security',
                'title_ar' => 'تجديد مفتاح الربط والـ API',
                'description_ar' => 'تم تجديد مفتاح الـ API الخاص بشركتكم بنجاح. تأكد من تحديثه في نظامكم اللوجستي.',
                'severity' => 'warning',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => false,
                'channels_email' => true,
            ],
            [
                'event_key' => 'company.account_approved',
                'target_group' => 'company',
                'category' => 'compliance',
                'title_ar' => 'اعتماد وتفعيل حساب الشركة',
                'description_ar' => 'تمت الموافقة على السجل التجاري ورخصة النقل وتفعيل حساب شركتكم بكامل الصلاحيات.',
                'severity' => 'success',
                'is_active' => true,
                'channels_in_app' => true,
                'channels_browser' => true,
                'channels_email' => true,
            ],
        ];

        foreach ($events as $event) {
            NotificationSetting::firstOrCreate(
                ['event_key' => $event['event_key']],
                $event
            );
        }
    }
}
