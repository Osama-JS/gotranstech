<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsInvestor
{
    /**
     * Handle an incoming request.
     * Ensure only Investor users (and Admins) can access Investor portal routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Allow Admins to oversee investor portal
        if ($user->isAdmin() || $user->isInvestor()) {
            return $next($request);
        }

        // If user is a company, redirect them to company dashboard
        if ($user->isCompany()) {
            return redirect()->route('company.dashboard')->with(
                'error',
                'عذراً، بوابة الاستثمار وسوق التمويل مخصصة للمستثمرين المسجلين.'
            );
        }

        abort(403, 'غير مصرح لك بالوصول إلى بوابة المستثمرين.');
    }
}
