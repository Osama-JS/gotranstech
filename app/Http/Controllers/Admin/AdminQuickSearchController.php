<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminQuickSearchController extends Controller
{
    /**
     * Handle global quick search query across the platform.
     */
    public function search(Request $request): JsonResponse
    {
        $query = trim($request->input('q', ''));
        $user = $request->user();

        if (empty($query) || mb_strlen($query) < 2) {
            return response()->json([
                'results' => [],
            ]);
        }

        $results = [];

        // 1. Pages / Navigation Shortcuts
        $navItems = [
            ['title' => 'لوحة التحكم الرئيسية', 'subtitle' => 'نظرة عامة على أداء المنصة والعمليات', 'url' => route('admin.dashboard'), 'category' => 'صفحات المنصة', 'icon' => 'LayoutDashboard', 'perm' => null],
            ['title' => 'إدارة المستثمرين', 'subtitle' => 'قائمة حسابات المستثمرين والمحافظ المالية', 'url' => route('admin.investors.index'), 'category' => 'صفحات المنصة', 'icon' => 'Users', 'perm' => 'manage_investors'],
            ['title' => 'إدارة شركات التوصيل', 'subtitle' => 'قائمة الشركات اللوجستية ومفاتيح الربط API', 'url' => route('admin.companies.index'), 'category' => 'صفحات المنصة', 'icon' => 'Building2', 'perm' => 'manage_companies'],
            ['title' => 'المهام اللوجستية', 'subtitle' => 'قائمة الشحنات والمهام الجاهزة للتمويل والمكتملة', 'url' => route('admin.tasks.index'), 'category' => 'صفحات المنصة', 'icon' => 'Package', 'perm' => 'manage_tasks'],
            ['title' => 'الإيداعات البنكية', 'subtitle' => 'مراجعة وتأكيد إيداعات المحافظ البنكية', 'url' => route('admin.deposits.index'), 'category' => 'صفحات المنصة', 'icon' => 'ArrowDownToLine', 'perm' => 'manage_deposits'],
            ['title' => 'طلبات سحب الرصيد', 'subtitle' => 'موافقة وصرف مستحقات الشركات وطباعة PDF', 'url' => route('admin.withdrawals.index'), 'category' => 'صفحات المنصة', 'icon' => 'ArrowUpFromLine', 'perm' => 'manage_withdrawals'],
            ['title' => 'العقود والاتفاقيات', 'subtitle' => 'إدارة العقود القانونية والاستثمارية الرقمية', 'url' => route('admin.contracts.index'), 'category' => 'صفحات المنصة', 'icon' => 'FileText', 'perm' => 'manage_contracts'],
            ['title' => 'قوالب الحقول الإضافية', 'subtitle' => 'تخصيص نماذج التسجيل والحقول الديناميكية للمستخدمين', 'url' => route('admin.form-templates.index'), 'category' => 'صفحات المنصة', 'icon' => 'FormInput', 'perm' => 'manage_settings'],
            ['title' => 'إدارة الأدوار والصلاحيات', 'subtitle' => 'صلاحيات المشرفين والموظفين', 'url' => route('admin.roles.index'), 'category' => 'صفحات المنصة', 'icon' => 'ShieldAlert', 'perm' => 'manage_roles'],
            ['title' => 'إدارة فريق العمل والمدراء', 'subtitle' => 'حسابات المشرفين وطاقم الإدارة', 'url' => route('admin.admins.index'), 'category' => 'صفحات المنصة', 'icon' => 'UserCheck', 'perm' => 'manage_admins'],
            ['title' => 'التقارير والتحليلات البيانية', 'subtitle' => 'مخططات الإيرادات وحجم التمويل وتدفق السيولة', 'url' => route('admin.analytics.index'), 'category' => 'صفحات المنصة', 'icon' => 'BarChart3', 'perm' => 'view_analytics'],
            ['title' => 'إدارة محتوى صفحة الهبوط (CMS)', 'subtitle' => 'تخصيص نصوص وأقسام الصفحة الرئيسية', 'url' => route('admin.cms.index'), 'category' => 'صفحات المنصة', 'icon' => 'Globe', 'perm' => 'manage_cms'],
            ['title' => 'سجلات التدقيق والأمان', 'subtitle' => 'متابعة كافة أنشطة وعمليات المستخدمين في النظام', 'url' => route('admin.audit.index'), 'category' => 'صفحات المنصة', 'icon' => 'FileCheck', 'perm' => 'view_audit_logs'],
            ['title' => 'صحة الخادم وقاعدة البيانات', 'subtitle' => 'مراقبة أداء PostgreSQL و Redis والاتصالات', 'url' => route('admin.system-health.index'), 'category' => 'صفحات المنصة', 'icon' => 'Activity', 'perm' => 'manage_settings'],
            ['title' => 'إعدادات النظام العامة', 'subtitle' => 'بوابات الدفع والبريد الإلكتروني والعمولات', 'url' => route('admin.settings.index'), 'category' => 'صفحات المنصة', 'icon' => 'Settings', 'perm' => 'manage_settings'],
        ];

        foreach ($navItems as $nav) {
            if ($nav['perm'] && !$user->isAdmin() && !$user->can($nav['perm'])) {
                continue;
            }
            if (mb_stripos($nav['title'], $query) !== false || mb_stripos($nav['subtitle'], $query) !== false) {
                $results[] = [
                    'title' => $nav['title'],
                    'subtitle' => $nav['subtitle'],
                    'url' => $nav['url'],
                    'category' => $nav['category'],
                    'icon' => $nav['icon'],
                ];
            }
        }

        // 2. Search Investors
        if ($user->isAdmin() || $user->can('manage_investors')) {
            $investors = User::where('user_type', 'investor')
                ->where(function ($q) use ($query) {
                    $q->where('name', 'ILIKE', "%{$query}%")
                      ->orWhere('email', 'ILIKE', "%{$query}%")
                      ->orWhere('phone', 'ILIKE', "%{$query}%");
                })
                ->limit(5)
                ->get();

            foreach ($investors as $inv) {
                $results[] = [
                    'title' => $inv->name,
                    'subtitle' => "مستثمر • {$inv->email} • هاتف: {$inv->phone}",
                    'url' => route('admin.investors.show', $inv->id),
                    'category' => 'المستثمرون',
                    'icon' => 'Users',
                ];
            }
        }

        // 3. Search Logistics Companies
        if ($user->isAdmin() || $user->can('manage_companies')) {
            $companies = User::where('user_type', 'company')
                ->with('companyProfile')
                ->where(function ($q) use ($query) {
                    $q->where('name', 'ILIKE', "%{$query}%")
                      ->orWhere('email', 'ILIKE', "%{$query}%")
                      ->orWhere('phone', 'ILIKE', "%{$query}%");
                })
                ->limit(5)
                ->get();

            foreach ($companies as $comp) {
                $results[] = [
                    'title' => $comp->companyProfile?->company_name ?: $comp->name,
                    'subtitle' => "شركة توصيل • {$comp->email} • هاتف: {$comp->phone}",
                    'url' => route('admin.companies.show', $comp->companyProfile?->id ?? $comp->id),
                    'category' => 'شركات التوصيل',
                    'icon' => 'Building2',
                ];
            }
        }

        // 4. Search Tasks
        if ($user->isAdmin() || $user->can('manage_tasks')) {
            $tasks = Task::where(function ($q) use ($query) {
                    $q->where('task_number', 'ILIKE', "%{$query}%")
                      ->orWhere('title', 'ILIKE', "%{$query}%")
                      ->orWhere('pickup_city', 'ILIKE', "%{$query}%")
                      ->orWhere('dropoff_city', 'ILIKE', "%{$query}%");
                })
                ->limit(5)
                ->get();

            foreach ($tasks as $task) {
                $results[] = [
                    'title' => "مهمة: {$task->task_number} - {$task->title}",
                    'subtitle' => "من {$task->pickup_city} إلى {$task->dropoff_city} • القيمة: " . number_format($task->funding_amount, 2) . " ر.س",
                    'url' => route('admin.tasks.show', $task->id),
                    'category' => 'المهام اللوجستية',
                    'icon' => 'Package',
                ];
            }
        }

        // 5. Search Contracts
        if ($user->isAdmin() || $user->can('manage_contracts')) {
            $contracts = Contract::where(function ($q) use ($query) {
                    $q->where('contract_number', 'ILIKE', "%{$query}%")
                      ->orWhere('title', 'ILIKE', "%{$query}%");
                })
                ->limit(5)
                ->get();

            foreach ($contracts as $contract) {
                $results[] = [
                    'title' => "عقد: " . ($contract->title ?: $contract->contract_number),
                    'subtitle' => "رقم العقد: {$contract->contract_number} • الحالة: {$contract->status}",
                    'url' => route('admin.contracts.show', $contract->id),
                    'category' => 'العقود والاتفاقيات',
                    'icon' => 'FileText',
                ];
            }
        }

        return response()->json([
            'results' => $results,
        ]);
    }
}
