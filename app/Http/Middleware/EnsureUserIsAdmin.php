<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Handle an incoming request.
     * Ensure only Admin/Staff users can access the Admin control panel.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Allow Admins and authorized Staff
        if ($user->isAdmin() || in_array($user->user_type, ['admin', 'staff'])) {
            return $next($request);
        }

        // If user is a company, redirect to company portal with error
        if ($user->isCompany()) {
            return redirect()->route('company.dashboard')->with(
                'error',
                'عذراً، لا تملك صلاحية الوصول إلى لوحة تحكم المسؤول.'
            );
        }

        // If user is an investor, redirect to investor portal with error
        if ($user->isInvestor()) {
            return redirect()->route('investor.dashboard')->with(
                'error',
                'عذراً، لا تملك صلاحية الوصول إلى لوحة تحكم المسؤول.'
            );
        }

        abort(403, 'غير مصرح لك بالوصول إلى لوحة تحكم المسؤول.');
    }
}
