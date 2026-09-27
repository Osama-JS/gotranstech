<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class AdminAdminController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(Request $request): Response
    {
        $query = User::whereIn('user_type', ['admin', 'staff'])->with('roles');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->role($role);
        }

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        $admins = $query->latest()->paginate(15)->withQueryString();

        $roles = Role::whereNotIn('name', ['investor', 'company'])->get();

        $stats = [
            'total_admins' => User::whereIn('user_type', ['admin', 'staff'])->count(),
            'active_admins' => User::whereIn('user_type', ['admin', 'staff'])->where('status', 'active')->count(),
            'super_admins' => User::role('admin')->count(),
        ];

        return Inertia::render('Admin/Admins/Index', [
            'admins' => $admins,
            'roles' => $roles,
            'stats' => $stats,
            'filters' => $request->only(['search', 'role', 'status']),
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
            'role' => 'required|exists:roles,name',
            'status' => 'required|in:active,suspended',
        ]);

        $userType = $validated['role'] === 'admin' ? 'admin' : 'staff';

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'],
            'phone' => $validated['phone'],
            'user_type' => $userType,
            'status' => $validated['status'],
            'locale' => 'ar',
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $user->assignRole($validated['role']);

        $this->auditLogService->log(
            'created',
            $user,
            [],
            $user->toArray(),
            "إضافة مدير / موظف جديد: {$user->name} برتبة {$validated['role']}"
        );

        return back()->with('success', 'تمت إضافة المدير بنجاح.');
    }

    public function update(Request $request, int $id)
    {
        $user = User::whereIn('user_type', ['admin', 'staff'])->findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => "required|string|email|max:255|unique:users,email,{$id}",
            'country_code' => 'required|string|max:10',
            'phone' => "required|string|max:20|unique:users,phone,{$id}",
            'role' => 'required|exists:roles,name',
            'status' => 'required|in:active,suspended',
        ]);

        $userType = $validated['role'] === 'admin' ? 'admin' : 'staff';

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'country_code' => $validated['country_code'],
            'phone' => $validated['phone'],
            'user_type' => $userType,
            'status' => $validated['status'],
        ]);

        $user->syncRoles([$validated['role']]);

        $this->auditLogService->log(
            'updated',
            $user,
            [],
            ['role' => $validated['role'], 'status' => $validated['status']],
            "تحديث بيانات المدير: {$user->name}"
        );

        return back()->with('success', 'تم تحديث بيانات المدير بنجاح.');
    }

    public function resetPassword(Request $request, int $id)
    {
        $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::whereIn('user_type', ['admin', 'staff'])->findOrFail($id);
        $user->password = Hash::make($request->input('password'));
        $user->save();

        $this->auditLogService->log(
            'password_reset',
            $user,
            [],
            [],
            "إعادة تعيين كلمة المرور للمدير: {$user->name}"
        );

        return back()->with('success', 'تم إعادة تعيين كلمة المرور بنجاح.');
    }

    public function toggleStatus(int $id)
    {
        if (Auth::id() === $id) {
            return back()->with('error', 'لا يمكنك إيقاف حسابك الحالي.');
        }

        $user = User::whereIn('user_type', ['admin', 'staff'])->findOrFail($id);
        $user->status = $user->status === 'active' ? 'suspended' : 'active';
        $user->save();

        $this->auditLogService->log(
            'status_changed',
            $user,
            [],
            ['status' => $user->status],
            "تغيير حالة حساب المدير {$user->name} إلى {$user->status}"
        );

        return back()->with('success', 'تم تعديل حالة الحساب بنجاح.');
    }
}
