<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCompany
{
    /**
     * Handle an incoming request.
     * Ensure only Logistics Company users (and Admins) can access Company portal routes.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Allow Admins to access or oversee company portal
        if ($user->isAdmin() || $user->isCompany()) {
            return $next($request);
        }

        // If user is an investor, redirect them to their investor dashboard
        if ($user->isInvestor()) {
            return redirect()->route('investor.dashboard')->with(
                'error',
                'عذراً، هذا القسم ومختبر الربط البرمجي مخصص حصراً لحسابات الشركات اللوجستية المرخصة.'
            );
        }

        abort(403, 'غير مصرح لك بالوصول إلى لوحة تحكم الشركات اللوجستية.');
    }
}
