<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $query = AuditLog::with('user');

        if ($eventType = $request->input('event_type')) {
            $query->where('event_type', $eventType);
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('ip_address', 'like', "%{$search}%")
                  ->orWhere('auditable_type', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Date Range
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $logs = $query->latest('created_at')->paginate(20)->withQueryString();

        // Statistics
        $stats = [
            'total' => AuditLog::count(),
            'logins' => AuditLog::where('event_type', 'login')->count(),
            'financial' => AuditLog::whereIn('event_type', ['approved', 'rejected', 'funded'])->count(),
            'changes' => AuditLog::whereIn('event_type', ['created', 'updated', 'deleted', 'status_changed'])->count(),
            'settings' => AuditLog::where('event_type', 'setting_changed')->count(),
        ];

        $eventTypes = [
            'login' => 'تسجيل دخول',
            'created' => 'إنشاء سجل',
            'updated' => 'تعديل سجل',
            'deleted' => 'حذف سجل',
            'status_changed' => 'تغيير حالة',
            'approved' => 'موافقة واعتماد',
            'rejected' => 'رفض طلب',
            'funded' => 'تمويل مهمة',
            'setting_changed' => 'تعديل إعدادات',
            'password_reset' => 'إعادة تعيين كلمة المرور',
        ];

        return Inertia::render('Admin/Audit/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'eventTypes' => $eventTypes,
            'filters' => $request->only(['event_type', 'search', 'date_from', 'date_to']),
        ]);
    }
}
