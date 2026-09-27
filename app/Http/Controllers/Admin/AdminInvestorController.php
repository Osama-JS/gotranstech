<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\InvestorProfile;
use App\Models\User;
use App\Models\Wallet;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class AdminInvestorController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(Request $request): Response
    {
        $query = User::where('user_type', 'investor')
            ->with(['investorProfile', 'wallets'])
            ->withCount(['fundedTasks', 'investments']);

        // Search Filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhereHas('investorProfile', function ($p) use ($search) {
                      $p->where('national_id', 'like', "%{$search}%")
                        ->orWhere('bank_iban', 'like', "%{$search}%");
                  });
            });
        }

        // Status Filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Date Range Filters
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $investors = $query->latest()->paginate(15)->withQueryString();

        // Statistics Aggregation
        $stats = [
            'total' => User::where('user_type', 'investor')->count(),
            'active' => User::where('user_type', 'investor')->where('status', 'active')->count(),
            'suspended' => User::where('user_type', 'investor')->where('status', 'suspended')->count(),
            'total_investment_balance' => Wallet::where('wallet_type', 'investor_investment')
                ->whereHas('user', fn($q) => $q->where('user_type', 'investor'))
                ->sum('balance'),
            'total_commission_balance' => Wallet::where('wallet_type', 'investor_commission')
                ->whereHas('user', fn($q) => $q->where('user_type', 'investor'))
                ->sum('balance'),
        ];

        return Inertia::render('Admin/Investors/Index', [
            'investors' => $investors,
            'stats' => $stats,
            'filters' => $request->only(['search', 'status', 'date_from', 'date_to']),
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
            'national_id' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:100',
            'bank_iban' => 'nullable|string|max:50',
            'platform_commission_share_rate' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,pending,suspended,inactive',
        ]);

        DB::transaction(function () use ($validated, &$user) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'country_code' => $validated['country_code'],
                'phone' => $validated['phone'],
                'user_type' => 'investor',
                'status' => $validated['status'],
                'locale' => 'ar',
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);

            $user->assignRole('investor');

            InvestorProfile::create([
                'user_id' => $user->id,
                'national_id' => $validated['national_id'] ?? null,
                'bank_name' => $validated['bank_name'] ?? 'مصرف الراجحي',
                'bank_iban' => $validated['bank_iban'] ?? null,
                'platform_commission_share_rate' => $validated['platform_commission_share_rate'],
                'status' => $validated['status'],
            ]);

            // Create Investor Wallets
            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'investor_investment'],
                ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
            );
            Wallet::firstOrCreate(
                ['user_id' => $user->id, 'wallet_type' => 'investor_commission'],
                ['currency' => 'SAR', 'balance' => 0.00, 'locked_balance' => 0.00]
            );
        });

        $this->auditLogService->log(
            'created',
            $user,
            [],
            $user->toArray(),
            "إنشاء حساب مستثمر جديد بواسطة الإدارة: {$user->name}"
        );

        return back()->with('success', 'تم إنشاء حساب المستثمر بنجاح.');
    }

    public function update(Request $request, int $id)
    {
        $user = User::where('user_type', 'investor')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|string|email|max:255|unique:users,email,{$id}",
            'country_code' => 'required|string|max:10',
            'phone' => "required|string|max:20|unique:users,phone,{$id}",
            'national_id' => 'nullable|string|max:50',
            'bank_name' => 'nullable|string|max:100',
            'bank_iban' => 'nullable|string|max:50',
            'platform_commission_share_rate' => 'required|numeric|min:0|max:100',
            'status' => 'required|in:active,pending,suspended,inactive',
        ]);

        $oldUserData = $user->only(['name', 'email', 'country_code', 'phone', 'status']);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        $profile = $user->investorProfile()->firstOrCreate(['user_id' => $user->id]);
        $profile->update([
            'national_id' => $validated['national_id'] ?? $profile->national_id,
            'bank_name' => $validated['bank_name'] ?? $profile->bank_name,
            'bank_iban' => $validated['bank_iban'] ?? $profile->bank_iban,
            'platform_commission_share_rate' => $validated['platform_commission_share_rate'],
            'status' => $validated['status'],
        ]);

        $this->auditLogService->log(
            'updated',
            $user,
            $oldUserData,
            $user->only(['name', 'email', 'country_code', 'phone', 'status']),
            "تعديل بيانات المستثمر: {$user->name}"
        );

        return back()->with('success', 'تم تحديث بيانات المستثمر بنجاح.');
    }

    public function resetPassword(Request $request, int $id)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('user_type', 'investor')->findOrFail($id);
        $user->password = Hash::make($request->input('password'));
        $user->save();

        $this->auditLogService->log(
            'password_reset',
            $user,
            [],
            [],
            "إعادة تعيين كلمة المرور للمستثمر: {$user->name}"
        );

        return back()->with('success', 'تم إعادة تعيين كلمة المرور بنجاح.');
    }

    public function show(int $id): Response
    {
        $investor = User::where('user_type', 'investor')
            ->with([
                'investorProfile',
                'wallets.transactions' => function ($q) {
                    $q->latest()->take(30);
                },
                'investments.task.company',
                'contracts',
                'bankDeposits' => function ($q) {
                    $q->latest()->take(10);
                },
            ])
            ->withCount(['fundedTasks', 'investments', 'bankDeposits'])
            ->findOrFail($id);

        $investmentWallet = $investor->wallets->firstWhere('wallet_type', 'investor_investment');
        $commissionWallet = $investor->wallets->firstWhere('wallet_type', 'investor_commission');

        $profileStats = [
            'total_invested' => $investor->investments->sum('invested_amount'),
            'total_profits' => $investor->investments->sum('investor_profit_amount'),
            'investment_balance' => $investmentWallet ? $investmentWallet->balance : 0,
            'commission_balance' => $commissionWallet ? $commissionWallet->balance : 0,
            'funded_tasks_count' => $investor->funded_tasks_count,
            'total_deposits' => $investor->bankDeposits->where('status', 'approved')->sum('amount'),
        ];

        return Inertia::render('Admin/Investors/Show', [
            'investor' => $investor,
            'profileStats' => $profileStats,
        ]);
    }

    public function updateCommissionRate(Request $request, int $id)
    {
        $request->validate([
            'platform_commission_share_rate' => 'required|numeric|min:0|max:100',
        ]);

        $investorProfile = InvestorProfile::where('user_id', $id)->firstOrFail();
        $oldRate = $investorProfile->platform_commission_share_rate;
        $investorProfile->platform_commission_share_rate = $request->input('platform_commission_share_rate');
        $investorProfile->save();

        $this->auditLogService->log(
            'updated',
            $investorProfile,
            ['platform_commission_share_rate' => $oldRate],
            ['platform_commission_share_rate' => $investorProfile->platform_commission_share_rate],
            "تحديث نسبة أرباح المستثمر للمستخدم معرف #{$id} إلى {$investorProfile->platform_commission_share_rate}%"
        );

        return back()->with('success', 'تم تحديث نسبة الأرباح بنجاح.');
    }

    public function toggleStatus(int $id)
    {
        $user = User::findOrFail($id);
        $oldStatus = $user->status;
        $user->status = $user->status === 'active' ? 'suspended' : 'active';
        $user->save();

        $this->auditLogService->log(
            'status_changed',
            $user,
            ['status' => $oldStatus],
            ['status' => $user->status],
            "تغيير حالة حساب المستثمر {$user->name} إلى {$user->status}"
        );

        return back()->with('success', 'تم تعديل حالة الحساب بنجاح.');
    }
}
