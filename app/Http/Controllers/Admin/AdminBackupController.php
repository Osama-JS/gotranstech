<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use App\Services\BackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AdminBackupController extends Controller
{
    public function __construct(
        protected BackupService $backupService,
        protected AuditLogService $auditLogService
    ) {}

    /**
     * Display the Backup & Disaster Recovery Hub
     */
    public function index(Request $request): Response
    {
        $backups = $this->backupService->listBackups();
        $storageStats = $this->backupService->getStorageStats();
        $config = $this->backupService->getConfig();

        return Inertia::render('Admin/Backups/Index', [
            'backups' => $backups,
            'storageStats' => $storageStats,
            'config' => $config,
        ]);
    }

    /**
     * Get backups and storage stats as JSON (for live polling/refresh)
     */
    public function getBackupsJson(): JsonResponse
    {
        try {
            $backups = $this->backupService->listBackups();
            $storageStats = $this->backupService->getStorageStats();

            return response()->json([
                'success' => true,
                'backups' => $backups,
                'storage' => $storageStats,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل استرجاع قائمة النسخ الاحتياطية: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new backup archive
     */
    public function createBackup(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'nullable|string|in:full,db_only,files_only',
            'encrypt' => 'nullable|boolean',
            'passphrase' => 'nullable|string|min:6',
            'destinations' => 'nullable',
            'notes' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'بيانات غير صالحة',
                    'errors' => $validator->errors()
                ], 422);
            }
            return back()->withErrors($validator);
        }

        try {
            $options = [
                'type' => $request->input('type', 'full'),
                'encrypt' => $request->boolean('encrypt', true),
                'passphrase' => $request->input('passphrase'),
                'destinations' => $request->input('destinations', []),
                'notes' => $request->input('notes', 'Manual Admin Backup'),
                'creator' => $request->user()?->name ?? 'Admin',
            ];

            $result = $this->backupService->createBackup($options);

            $this->auditLogService->log(
                'created',
                null,
                [],
                ['filename' => $result['filename'], 'size' => $result['size_human']],
                "إنشاء نسخة احتياطية جديدة ({$result['filename']})"
            );

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'تم إنشاء النسخة الاحتياطية بنجاح وحفظها بأعلى معايير الأمان 💾',
                    'data' => $result,
                ]);
            }

            return back()->with('success', 'تم إنشاء النسخة الاحتياطية بنجاح.');
        } catch (\Throwable $e) {
            Log::error('Backup create controller error: ' . $e->getMessage());

            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'فشل إنشاء النسخة الاحتياطية: ' . $e->getMessage(),
                ], 500);
            }

            return back()->with('error', 'فشل إنشاء النسخة الاحتياطية: ' . $e->getMessage());
        }
    }

    /**
     * Stream download backup file
     */
    public function downloadBackup(string $filename): BinaryFileResponse
    {
        return $this->backupService->downloadBackup($filename);
    }

    /**
     * Dispatch an existing backup to Telegram, Email, or Google Drive
     */
    public function dispatchBackup(Request $request, string $filename): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'destination' => 'required|string|in:telegram,email,google_drive',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'وجهة الترحيل غير صالحة',
            ], 422);
        }

        try {
            $dest = $request->input('destination');
            $res = $this->backupService->dispatchBackup($filename, $dest);

            $isSuccess = (bool)($res['success'] ?? false);
            $message = $res['message'] ?? ($isSuccess ? 'تم ترحيل النسخة بنجاح' : 'فشل ترحيل النسخة');

            return response()->json([
                'success' => $isSuccess,
                'message' => $message,
                'data' => $res,
            ], $isSuccess ? 200 : 400);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل ترحيل النسخة الاحتياطية: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Verify backup integrity and HMAC signature
     */
    public function verifyBackup(Request $request, string $filename): JsonResponse
    {
        try {
            $passphrase = $request->input('passphrase');
            $result = $this->backupService->verifyBackupIntegrity($filename, $passphrase);

            $isValid = (bool)($result['valid'] ?? false);
            $message = $result['message'] ?? ($isValid ? 'تم التحقق من سلامة النسخة بنجاح' : 'فشل التحقق من سلامة النسخة');

            return response()->json([
                'success' => $isValid,
                'message' => $message,
                'data' => $result,
            ], $isValid ? 200 : 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل فحص النسخة الاحتياطية: ' . $e->getMessage(),
                'data' => [
                    'valid' => false,
                    'message' => $e->getMessage(),
                ]
            ], 422);
        }
    }

    /**
     * Restore database and uploads from an existing backup
     */
    public function restoreBackup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'filename' => 'required|string',
            'passphrase' => 'nullable|string',
            'confirm' => 'required|accepted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'يرجى تأكيد الاستعادة وتوفير اسم الملف بشكل صحيح',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $filename = $request->input('filename');
            $passphrase = $request->input('passphrase');

            $result = $this->backupService->restoreBackup($filename, $passphrase);

            $this->auditLogService->log(
                'restored',
                null,
                [],
                ['filename' => $filename, 'tables' => $result['tables_restored']],
                "استعادة النظام من النسخة الاحتياطية ({$filename})"
            );

            return response()->json([
                'success' => true,
                'message' => 'تمت استعادة النظام والبيانات بنجاح وتوثيق نقطة الاسترجاع الاحترازية ♻️',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشل استعادة النسخة الاحتياطية: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload an external backup file from PC and restore immediately
     */
    public function uploadAndRestore(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'backup_file' => [
                'required',
                'file',
                'max:512000',
                function ($attribute, $value, $fail) {
                    $ext = strtolower($value->getClientOriginalExtension());
                    if (!in_array($ext, ['zip', 'sql', 'gz', 'enc', 'tar'])) {
                        $fail('نوع الملف المرفوع غير مسموح به. يُسمح فقط بملفات النسخ الاحتياطية (.zip, .sql, .gz, .enc).');
                    }
                },
            ],
            'passphrase' => 'nullable|string',
            'confirm' => 'required|accepted',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'يرجى إرفاق ملف النسخة الاحتياطية وتأكيد رغبتك بالاستعادة',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('backup_file');
            $originalName = $file->getClientOriginalName();
            $filename = 'uploaded_' . time() . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $originalName);

            $targetDir = storage_path('app/backups');
            if (!is_dir($targetDir)) {
                mkdir($targetDir, 0755, true);
            }

            $file->move($targetDir, $filename);
            $fullPath = $targetDir . DIRECTORY_SEPARATOR . $filename;

            $passphrase = $request->input('passphrase');
            $result = $this->backupService->restoreBackup($fullPath, $passphrase);

            $this->auditLogService->log(
                'restored',
                null,
                [],
                ['uploaded_file' => $originalName, 'tables' => $result['tables_restored']],
                "رفع واستعادة نسخة احتياطية خارجية ({$originalName})"
            );

            return response()->json([
                'success' => true,
                'message' => 'تم رفع النسخة الاحتياطية واستعادة النظام بنجاح ♻️',
                'data' => $result,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'فشلت معالجة الملف واستعادة النسخة: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an existing backup
     */
    public function destroy(string $filename): RedirectResponse
    {
        $deleted = $this->backupService->deleteBackup($filename);

        if ($deleted) {
            $this->auditLogService->log(
                'deleted',
                null,
                [],
                ['filename' => $filename],
                "حذف النسخة الاحتياطية ({$filename})"
            );

            return back()->with('success', 'تم حذف النسخة الاحتياطية بنجاح.');
        }

        return back()->with('error', 'تعذر العثور على الملف أو حذفه.');
    }

    /**
     * Save cloud backup & automation configuration
     */
    public function saveConfig(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'backup_auto_enabled' => 'nullable|boolean',
            'backup_schedule_time' => 'nullable|string',
            'backup_max_retained' => 'nullable|numeric|min:1|max:100',
            'backup_default_encrypt' => 'nullable|boolean',
            'backup_master_password' => 'nullable|string',
            'telegram_backup_enabled' => 'nullable|boolean',
            'telegram_backup_bot_token' => 'nullable|string',
            'telegram_backup_chat_id' => 'nullable|string',
            'email_backup_enabled' => 'nullable|boolean',
            'email_backup_recipients' => 'nullable|string',
            'gdrive_backup_enabled' => 'nullable|boolean',
            'gdrive_backup_webhook_url' => 'nullable|string',
        ]);

        $this->backupService->saveConfig($validated);

        $this->auditLogService->log(
            'updated',
            null,
            [],
            [],
            'تحديث إعدادات النسخ الاحتياطي والترحيل السحابي'
        );

        return back()->with('success', 'تم حفظ إعدادات النسخ الاحتياطي والترحيل السحابي بنجاح.');
    }

    /**
     * Test connection to a remote cloud destination (Telegram, Email, Google Drive)
     */
    public function testDestination(Request $request): JsonResponse
    {
        $type = $request->input('type');
        $credentials = $request->input('credentials', []);

        $res = $this->backupService->testCloudDestination($type, $credentials);

        return response()->json($res, ($res['success'] ?? false) ? 200 : 400);
    }
}
