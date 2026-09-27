<?php

namespace App\Http\Middleware;

use App\Services\EncryptedSettingService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Session;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $userData = null;

        if ($user) {
            $user->loadMissing(['roles', 'investorProfile', 'companyProfile', 'wallets']);
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'user_type' => $user->user_type,
                'status' => $user->status,
                'avatar' => $user->avatar,
                'locale' => $user->locale ?? 'ar',
                'roles' => $user->roles->pluck('name'),
                'is_admin' => $user->isAdmin(),
                'is_investor' => $user->isInvestor(),
                'is_company' => $user->isCompany(),
                'company' => $user->companyProfile,
                'investor' => $user->investorProfile,
                'wallets' => $user->wallets->mapWithKeys(function ($w) {
                    return [$w->wallet_type => [
                        'id' => $w->id,
                        'balance' => (float) $w->balance,
                        'locked_balance' => (float) $w->locked_balance,
                        'available_balance' => (float) $w->available_balance,
                        'currency' => $w->currency,
                    ]];
                }),
            ];
        }

        $currentLocale = Session::get('locale', $user->locale ?? App::getLocale() ?? 'ar');
        App::setLocale($currentLocale);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $userData,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info' => fn () => $request->session()->get('info'),
                'generated_key' => fn () => $request->session()->get('generated_key'),
            ],
            'locale' => $currentLocale,
            'appName' => EncryptedSettingService::get('site_name_ar', config('app.name', 'GoTransTech')),
            'appNameEn' => EncryptedSettingService::get('site_name_en', 'GoTransTech Platform'),
            'landingUrl' => url('/'),
            'branding' => [
                'logo' => ($pLogo = EncryptedSettingService::get('platform_logo')) ? (str_starts_with($pLogo, 'http') ? $pLogo : asset(ltrim($pLogo, '/'))) : null,
                'logo_dark' => ($pLogoDark = EncryptedSettingService::get('platform_logo_dark')) ? (str_starts_with($pLogoDark, 'http') ? $pLogoDark : asset(ltrim($pLogoDark, '/'))) : null,
                'favicon' => ($pFavicon = EncryptedSettingService::get('platform_favicon')) ? (str_starts_with($pFavicon, 'http') ? $pFavicon : asset(ltrim($pFavicon, '/'))) : null,
                'site_name_ar' => EncryptedSettingService::get('site_name_ar', 'GoTransTech'),
                'site_name_en' => EncryptedSettingService::get('site_name_en', 'GoTransTech Platform'),
                'site_slogan_ar' => EncryptedSettingService::get('site_slogan_ar', 'نمول حركة الغد'),
                'site_slogan_en' => EncryptedSettingService::get('site_slogan_en', 'FINANCING WHAT MOVES TOMORROW'),
                'navbar_brand_display' => EncryptedSettingService::get('navbar_brand_display', 'both'),
            ],
        ];
    }
}
