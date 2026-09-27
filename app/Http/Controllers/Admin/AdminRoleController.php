<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminRoleController extends Controller
{
    public function __construct(
        protected AuditLogService $auditLogService
    ) {}

    public function index(): Response
    {
        $roles = Role::with('permissions')
            ->withCount('users')
            ->get()
            ->map(function ($role) {
                return [
                    'id' => $role->id,
                    'name' => $role->name,
                    'guard_name' => $role->guard_name,
                    'users_count' => $role->users_count,
                    'permissions' => $role->permissions->pluck('name')->toArray(),
                    'created_at' => $role->created_at->format('Y-m-d H:i'),
                ];
            });

        // Group permissions by module for clean UI matrix
        $permissions = Permission::all()->map(function ($perm) {
            $group = 'general';
            if (str_contains($perm->name, 'user') || str_contains($perm->name, 'investor') || str_contains($perm->name, 'compan') || str_contains($perm->name, 'admin')) {
                $group = 'users';
            } elseif (str_contains($perm->name, 'task') || str_contains($perm->name, 'market')) {
                $group = 'logistics';
            } elseif (str_contains($perm->name, 'wallet') || str_contains($perm->name, 'deposit') || str_contains($perm->name, 'withdrawal') || str_contains($perm->name, 'contract')) {
                $group = 'finance';
            } elseif (str_contains($perm->name, 'setting') || str_contains($perm->name, 'cms') || str_contains($perm->name, 'audit') || str_contains($perm->name, 'landing')) {
                $group = 'system';
            }

            return [
                'id' => $perm->id,
                'name' => $perm->name,
                'group' => $group,
            ];
        });

        $stats = [
            'total_roles' => Role::count(),
            'total_permissions' => Permission::count(),
            'custom_roles' => Role::whereNotIn('name', ['admin', 'investor', 'company'])->count(),
        ];

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'stats' => $stats,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        $role = Role::create(['name' => $validated['name'], 'guard_name' => 'web']);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        $this->auditLogService->log(
            'created',
            $role,
            [],
            $role->toArray(),
            "إنشاء دور وصلاحيات جديدة: {$role->name}"
        );

        return back()->with('success', 'تم إنشاء الدور وتعيين الصلاحيات بنجاح.');
    }

    public function update(Request $request, int $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'name' => "required|string|max:50|unique:roles,name,{$id}",
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,name',
        ]);

        // Prevent renaming core system roles
        if (!in_array($role->name, ['admin', 'investor', 'company'])) {
            $role->name = $validated['name'];
            $role->save();
        }

        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        $this->auditLogService->log(
            'updated',
            $role,
            [],
            ['permissions' => $validated['permissions'] ?? []],
            "تحديث صلاحيات الدور: {$role->name}"
        );

        return back()->with('success', 'تم تحديث الدور والصلاحيات بنجاح.');
    }

    public function destroy(int $id)
    {
        $role = Role::findOrFail($id);

        if (in_array($role->name, ['admin', 'investor', 'company'])) {
            return back()->with('error', 'لا يمكن حذف الأدوار الأساسية للنظام.');
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', 'لا يمكن حذف دور مرتبط بمستخدمين حاليين.');
        }

        $roleName = $role->name;
        $role->delete();

        $this->auditLogService->log(
            'deleted',
            $role,
            ['name' => $roleName],
            [],
            "حذف الدور: {$roleName}"
        );

        return back()->with('success', 'تم حذف الدور بنجاح.');
    }
}
