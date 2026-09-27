<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CompanyApiKey;
use App\Models\CompanyProfile;
use App\Models\Task;
use App\Models\User;
use App\Models\Wallet;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminCompanyController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(Request $request): Response
    {
        $query = CompanyProfile::with(['user.wallets', 'apiKeys'])
            ->withCount(['tasks', 'withdrawalRequests', 'debts']);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', "%{$search}%")
                  ->orWhere('cr_number', 'like', "%{$search}%")
                  ->orWhere('contact_person', 'like', "%{$search}%")
                  ->orWhere('contact_email', 'like', "%{$search}%")
                  ->orWhere('contact_phone', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // City Filter
        if ($city = $request->input('city')) {
            $query->where('city', $city);
        }

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $companies = $query->latest()->paginate(15)->withQueryString();

        // Statistics Aggregation
        $stats = [
            'total' => CompanyProfile::count(),
            'active' => CompanyProfile::where('status', 'active')->count(),
            'suspended' => CompanyProfile::where('status', 'suspended')->count(),
            'total_funding_balance' => Wallet::where('wallet_type', 'company_funding')->sum('balance'),
            'total_debt_balance' => Wallet::where('wallet_type', 'company_debt')->sum('balance'),
            'total_tasks_count' => Task::count(),
        ];

        // Unique Cities List for Filter Dropdown
        $cities = CompanyProfile::whereNotNull('city')->distinct()->pluck('city')->values();

        return Inertia::render('Admin/Companies/Index', [
            'companies' => $companies,
            'stats' => $stats,
            'cities' => $cities,
            'filters' => $request->only(['search', 'status', 'city', 'date_from', 'date_to']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'country_code' => 'required|string|max:10',
            'phone' => 'required|string|max:20|unique:users',
            'password' => 'required|string|min:8',
            'company_name' => 'required|string|max:255',
            'cr_number' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'platform_commission_rate' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,pending,suspended,inactive',
        ]);

        DB::transaction(function () use ($validated, &$company) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'country_code' => $validated['country_code'],
                'phone' => $validated['phone'],
                'user_type' => 'company',
                'status' => $validated['status'],
                'locale' => 'ar',
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);

            $user->assignRole('company');

            $company = CompanyProfile::create([
                'user_id' => $user->id,
                'company_name' => $validated['company_name'],
                'cr_number' => $validated['cr_number'] ?? null,
                'city' => $validated['city'] ?? 'الرياض',
                'contact_person' => $validated['name'],
                'contact_email' => $validated['email'],
                'contact_phone' => $validated['phone'],
                'platform_commission_rate' => $validated['platform_commission_rate'],
                'status' => $validated['status'],
            ]);

            // Create Company Wallets
            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'company_funding'],
                ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
            );
            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'company_debt'],
                ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
            );
        });

        $this->auditLogService->log(
            'created',
            $company,
            [],
            $company->toArray(),
            "إنشاء شركة لوجستية جديدة بواسطة الإدارة: {$company->company_name}"
        );

        return back()->with('success', 'تم إنشاء حساب الشركة اللوجستية بنجاح.');
    }

    public function update(Request $request, int $id)
    {
        $company = CompanyProfile::with('user')->findOrFail($id);
        $user = $company->user;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|string|email|max:255|unique:users,email,{$user->id}",
            'country_code' => 'required|string|max:10',
            'phone' => "required|string|max:20|unique:users,phone,{$user->id}",
            'company_name' => 'required|string|max:255',
            'cr_number' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            'platform_commission_rate' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,pending,suspended,inactive',
        ]);

        $oldData = $company->toArray();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        $company->update([
            'company_name' => $validated['company_name'],
            'cr_number' => $validated['cr_number'] ?? $company->cr_number,
            'city' => $validated['city'] ?? $company->city,
            'contact_person' => $validated['name'],
            'contact_email' => $validated['email'],
            'contact_phone' => $validated['phone'],
            'platform_commission_rate' => $validated['platform_commission_rate'],
            'status' => $validated['status'],
        ]);

        $this->auditLogService->log(
            'updated',
            $company,
            $oldData,
            $company->toArray(),
            "تعديل بيانات الشركة اللوجستية: {$company->company_name}"
        );

        return back()->with('success', 'تم تحديث بيانات الشركة اللوجستية بنجاح.');
    }

    public function resetPassword(Request $request, int $id)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $company = CompanyProfile::with('user')->findOrFail($id);
        $company->user->password = Hash::make($request->input('password'));
        $company->user->save();

        $this->auditLogService->log(
            'password_reset',
            $company->user,
            [],
            [],
            "إعادة تعيين كلمة المرور لحساب الشركة: {$company->company_name}"
        );

        return back()->with('success', 'تم إعادة تعيين كلمة المرور بنجاح.');
    }

    public function toggleStatus(int $id)
    {
        $company = CompanyProfile::with('user')->findOrFail($id);
        $oldStatus = $company->status;
        $newStatus = $company->status === 'active' ? 'suspended' : 'active';

        $company->status = $newStatus;
        $company->save();

        $company->user->status = $newStatus;
        $company->user->save();

        $this->auditLogService->log(
            'status_changed',
            $company,
            ['status' => $oldStatus],
            ['status' => $newStatus],
            "تغيير حالة الشركة {$company->company_name} إلى {$newStatus}"
        );

        return back()->with('success', 'تم تعديل حالة الشركة بنجاح.');
    }

    public function show(int $id): Response
    {
        $company = CompanyProfile::with([
            'user.wallets.transactions' => function ($q) {
                $q->latest()->take(30);
            },
            'apiKeys',
            'tasks' => function ($q) {
                $q->latest()->take(20);
            },
            'withdrawalRequests' => function ($q) {
                $q->latest()->take(10);
            },
            'debts',
            'contracts',
        ])
        ->withCount(['tasks', 'withdrawalRequests', 'debts'])
        ->findOrFail($id);

        $fundingWallet = $company->user->wallets->firstWhere('wallet_type', 'company_funding');
        $debtWallet = $company->user->wallets->firstWhere('wallet_type', 'company_debt');

        $profileStats = [
            'total_tasks_volume' => $company->tasks->sum('funding_amount'),
            'total_funded_tasks_volume' => $company->tasks->where('status', 'funded')->sum('funding_amount'),
            'funding_balance' => $fundingWallet ? $fundingWallet->balance : 0,
            'debt_balance' => $debtWallet ? $debtWallet->balance : 0,
            'total_withdrawals' => $company->withdrawalRequests->where('status', 'approved')->sum('requested_amount'),
            'active_api_keys_count' => $company->apiKeys->where('status', 'active')->count(),
        ];

        return Inertia::render('Admin/Companies/Show', [
            'company' => $company,
            'profileStats' => $profileStats,
        ]);
    }

    public function generateApiKey(Request $request, int $id)
    {
        $request->validate([
            'key_name' => 'required|string|max:100',
        ]);

        $company = CompanyProfile::findOrFail($id);
        $result = CompanyApiKey::generateKey($company->id, $request->input('key_name'));

        $this->auditLogService->log(
            'created',
            $result['model'],
            [],
            ['key_name' => $result['model']->key_name, 'company_id' => $company->id],
            "توليد مفتاح API جديد للشركة {$company->company_name}"
        );

        return back()->with([
            'success' => 'تم توليد مفتاح API بنجاح. يرجى نسخه وحفظه الآن حيث لن يظهر مجدداً.',
            'generated_key' => $result['plainTextToken'],
        ]);
    }

    public function updateCommissionRate(Request $request, int $id)
    {
        $request->validate([
            'platform_commission_rate' => 'required|numeric|min:0|max:100',
        ]);

        $company = CompanyProfile::findOrFail($id);
        $oldRate = $company->platform_commission_rate;
        $company->platform_commission_rate = $request->input('platform_commission_rate');
        $company->save();

        $this->auditLogService->log(
            'updated',
            $company,
            ['platform_commission_rate' => $oldRate],
            ['platform_commission_rate' => $company->platform_commission_rate],
            "تحديث نسبة عمولة المنصة للشركة {$company->company_name} إلى {$company->platform_commission_rate}%"
        );

        return back()->with('success', 'تم تحديث نسبة العمولة بنجاح.');
    }
}
