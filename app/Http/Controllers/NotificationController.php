<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use App\Models\NotificationSetting;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\NotificationDispatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class NotificationController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Admin: Notification Management Page (Settings, Channels & Logs)
     */
    public function settingsIndex(Request $request): Response
    {
        NotificationDispatcherService::ensureDefaultSettingsExist();

        $settings = NotificationSetting::orderBy('target_group')->orderBy('category')->get();
        
        $roles = Role::pluck('name');
        $admins = User::where('user_type', 'admin')->select('id', 'name', 'email')->get();

        return Inertia::render('Admin/Notifications/Settings', [
            'settings' => $settings,
            'roles' => $roles,
            'admins' => $admins,
        ]);
    }

    /**
     * Admin: Update an individual notification setting
     */
    public function updateSetting(Request $request, int $id)
    {
        $setting = NotificationSetting::findOrFail($id);

        $validated = $request->validate([
            'is_active' => 'boolean',
            'channels_in_app' => 'boolean',
            'channels_browser' => 'boolean',
            'channels_email' => 'boolean',
            'target_roles' => 'nullable|array',
            'target_user_ids' => 'nullable|array',
            'severity' => 'nullable|in:info,success,warning,urgent',
        ]);

        $setting->update($validated);

        $this->auditLogService->log(
            'updated',
            $setting,
            [],
            $validated,
            "تحديث إعدادات الإشعار ({$setting->title_ar})"
        );

        return back()->with('success', 'تم حفظ وتحديث إعدادات الإشعار بنجاح.');
    }

    /**
     * Admin: Send a broadcast/manual notification to users
     */
    public function sendBroadcast(Request $request)
    {
        $validated = $request->validate([
            'target_audience' => 'required|in:all_admins,all_investors,all_companies,everyone',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'severity' => 'required|in:info,success,warning,urgent',
            'action_url' => 'nullable|string|max:255',
            'channels_in_app' => 'boolean',
            'channels_browser' => 'boolean',
            'channels_email' => 'boolean',
        ]);

        $usersQuery = User::query();
        if ($validated['target_audience'] === 'all_admins') {
            $usersQuery->where('user_type', 'admin');
        } elseif ($validated['target_audience'] === 'all_investors') {
            $usersQuery->where('user_type', 'investor');
        } elseif ($validated['target_audience'] === 'all_companies') {
            $usersQuery->where('user_type', 'company');
        }

        $users = $usersQuery->get();

        foreach ($users as $user) {
            NotificationDispatcherService::dispatch(
                'admin.manual_broadcast',
                $validated['title'],
                $validated['message'],
                $validated['action_url'],
                ['sender_id' => Auth::id()],
                $user,
                $validated['severity']
            );
        }

        $this->auditLogService->log(
            'broadcast_sent',
            null,
            [],
            $validated,
            "إرسال إشعار عام ({$validated['title']}) للجمهور: {$validated['target_audience']}"
        );

        return back()->with('success', "تم إرسال الإشعار بنجاح إلى {$users->count()} مستخدم.");
    }

    /**
     * Feed/Polling API for real-time notifications for the authenticated user
     */
    public function feed(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['notifications' => [], 'unread_count' => 0]);
        }

        $unreadCount = $user->unreadNotificationsCount();

        $notifications = $user->appNotifications()
            ->latest()
            ->take(15)
            ->get();

        // Get unread urgent notifications to display urgent modal if present
        $urgentUnread = $user->appNotifications()
            ->where('is_read', false)
            ->where('severity', 'urgent')
            ->latest()
            ->first();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
            'urgent_notification' => $urgentUnread,
        ]);
    }

    /**
     * Dedicated Full Page for All Notifications
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = Auth::user();

        $query = $user->appNotifications()->latest();

        // Filter by read status
        $status = $request->input('status', 'all');
        if ($status === 'unread') {
            $query->where('is_read', false);
        } elseif ($status === 'read') {
            $query->where('is_read', true);
        }

        // Filter by severity
        $severity = $request->input('severity');
        if ($severity && in_array($severity, ['urgent', 'warning', 'info', 'success'])) {
            $query->where('severity', $severity);
        }

        // Search in title or message
        $search = $request->input('search');
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('message', 'like', "%{$search}%");
            });
        }

        $notifications = $query->paginate(15)->withQueryString();

        $stats = [
            'total' => $user->appNotifications()->count(),
            'unread' => $user->unreadNotificationsCount(),
            'urgent' => $user->appNotifications()->where('severity', 'urgent')->where('is_read', false)->count(),
            'read' => $user->appNotifications()->where('is_read', true)->count(),
        ];

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'filters' => [
                'status' => $status,
                'severity' => $severity,
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Mark single notification as read
     */
    public function markAsRead(int $id)
    {
        $notification = AppNotification::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $notification->update([
            'is_read' => true,
            'read_at' => now(),
        ]);

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'تم تحديد الإشعار كمقروء.');
    }

    /**
     * Mark all notifications as read for current user
     */
    public function markAllAsRead()
    {
        AppNotification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'تم تحديد كافة الإشعارات كمقروءة.');
    }

    /**
     * Delete an individual notification
     */
    public function destroy(int $id)
    {
        $notification = AppNotification::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $notification->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'تم حذف الإشعار بنجاح.');
    }

    /**
     * Clear all read notifications for current user
     */
    public function clearRead()
    {
        AppNotification::where('user_id', Auth::id())
            ->where('is_read', true)
            ->delete();

        if (request()->wantsJson()) {
            return response()->json(['success' => true]);
        }

        return back()->with('success', 'تم مسح كافة الإشعارات المقروءة بنجاح.');
    }
}
