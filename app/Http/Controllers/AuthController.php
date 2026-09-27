<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\InvestorProfile;
use App\Models\CompanyProfile;
use App\Models\Wallet;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function showLogin(): Response
    {
        return Inertia::render('Auth/Login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'يرجى إدخال بريد إلكتروني صحيح',
            'password.required' => 'كلمة المرور مطلوبة',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $user = Auth::user();

            if (in_array($user->status, ['suspended', 'rejected', 'banned'])) {
                Auth::logout();
                return back()->withErrors(['email' => 'الحساب موقوف أو مرفوض، يرجى التواصل مع إدارة المنصة.']);
            }

            $this->auditLogService->log('login', $user, [], [], "تسجيل دخول ناجح للمستخدم {$user->name}");

            if ($user->isAdmin()) {
                return redirect()->intended(route('admin.dashboard'));
            } elseif ($user->isCompany()) {
                return redirect()->intended(route('company.dashboard'));
            } else {
                return redirect()->intended(route('investor.dashboard'));
            }
        }

        return back()->withErrors([
            'email' => 'بيانات الدخول غير صحيحة، يرجى التأكد من البريد وكلمة المرور.',
        ])->onlyInput('email');
    }

    public function showRegister(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'country_code' => 'required|string|max:10',
            'phone' => 'required|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            'user_type' => 'required|in:investor,company',
            
            // Company fields
            'company_name' => 'nullable|required_if:user_type,company|string|max:255',
            'cr_number' => 'nullable|string|max:50',
            'city' => 'nullable|string|max:100',
            
            // Investor fields
            'national_id' => 'nullable|string|max:50',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'] ?? '+966',
            'phone' => $validated['phone'],
            'user_type' => $validated['user_type'],
            'status' => 'pending_approval',
            'locale' => 'ar',
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        if ($validated['user_type'] === 'company') {
            $user->assignRole('company');
            CompanyProfile::create([
                'user_id' => $user->id,
                'company_name' => $validated['company_name'] ?? $user->name,
                'cr_number' => $validated['cr_number'] ?? null,
                'city' => $validated['city'] ?? 'الرياض',
                'platform_commission_rate' => 10.00,
                'status' => 'pending',
            ]);

            // Create Company Wallets
            Wallet::create(['user_id' => $user->id, 'wallet_type' => 'company_funding', 'balance' => 0.00]);
            Wallet::create(['user_id' => $user->id, 'wallet_type' => 'company_debt', 'balance' => 0.00]);
        } else {
            $user->assignRole('investor');
            InvestorProfile::create([
                'user_id' => $user->id,
                'national_id' => $validated['national_id'] ?? null,
                'platform_commission_share_rate' => 70.00,
                'status' => 'pending',
            ]);

            // Create Investor Wallets
            Wallet::create(['user_id' => $user->id, 'wallet_type' => 'investor_investment', 'balance' => 0.00]);
            Wallet::create(['user_id' => $user->id, 'wallet_type' => 'investor_commission', 'balance' => 0.00]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        $this->auditLogService->log('created', $user, [], ['user_type' => $user->user_type], "إرسال طلب تسجيل حساب جديد: {$user->name}");

        return redirect()->intended($user->isCompany() ? route('company.dashboard') : route('investor.dashboard'))
            ->with('success', 'تم إرسال طلب التسجيل بنجاح، يرجى استكمال توقيع الاتفاقية والبيانات لتفعيل الحساب.');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function switchLocale(Request $request)
    {
        $locale = $request->input('locale', 'ar');
        if (in_array($locale, ['ar', 'en'])) {
            Session::put('locale', $locale);
            if (Auth::check()) {
                $user = Auth::user();
                $user->locale = $locale;
                $user->save();
            }
        }
        return back();
    }
}
