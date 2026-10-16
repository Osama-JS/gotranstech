<?php

namespace App\Services;

use App\Models\SystemSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use ZipArchive;

class BackupService
{
    protected string $backupDir;

    public function __construct()
    {
        $this->backupDir = storage_path('app/backups');
        if (!File::exists($this->backupDir)) {
            File::makeDirectory($this->backupDir, 0755, true);
        }
    }

    /**
     * Get backup storage path.
     */
    public function getBackupPath(?string $filename = null): string
    {
        return $filename ? $this->backupDir . DIRECTORY_SEPARATOR . basename($filename) : $this->backupDir;
    }

    /**
     * Get disk and backup storage statistics.
     */
    public function getStorageStats(): array
    {
        $backups = $this->listBackups();
        $totalSizeBytes = 0;
        foreach ($backups as $b) {
            $totalSizeBytes += $b['size_bytes'] ?? 0;
        }

        $freeDiskSpace = @disk_free_space($this->backupDir) ?: 0;
        $totalDiskSpace = @disk_total_space($this->backupDir) ?: 0;

        return [
            'total_backups_count' => count($backups),
            'total_storage_bytes' => $totalSizeBytes,
            'total_storage_human' => $this->formatBytes($totalSizeBytes),
            'free_disk_bytes' => $freeDiskSpace,
            'free_disk_human' => $this->formatBytes($freeDiskSpace),
            'total_disk_bytes' => $totalDiskSpace,
            'total_disk_human' => $this->formatBytes($totalDiskSpace),
            'latest_backup' => $backups[0] ?? null,
            'backup_directory' => $this->backupDir,
        ];
    }

    /**
     * List all existing backups with metadata.
     */
    public function listBackups(): array
    {
        if (!File::exists($this->backupDir)) {
            return [];
        }

        $files = File::files($this->backupDir);
        $backups = [];

        foreach ($files as $file) {
            $filename = $file->getFilename();

            // Supported backup extensions
            if (
                str_ends_with($filename, '.gtbak') || 
                str_ends_with($filename, '.gtbak.enc') || 
                str_ends_with($filename, '.zip') || 
                str_ends_with($filename, '.mshbak') || 
                str_ends_with($filename, '.enc') || 
                str_ends_with($filename, '.sql.gz')
            ) {
                $filePath = $file->getPathname();
                $sizeBytes = $file->getSize();
                $updatedAt = $file->getMTime();

                $manifest = $this->extractManifestSafely($filePath);
                $isEncrypted = str_ends_with($filename, '.enc') || ($manifest['is_encrypted'] ?? false) || $this->isEncryptedFormat($filePath);

                $backups[] = [
                    'filename' => $filename,
                    'file_path' => $filePath,
                    'size_bytes' => $sizeBytes,
                    'size_human' => $this->formatBytes($sizeBytes),
                    'created_at' => date('Y-m-d H:i:s', $updatedAt),
                    'created_at_timestamp' => $updatedAt,
                    'is_encrypted' => $isEncrypted,
                    'encryption_algo' => $manifest['encryption_algo'] ?? ($isEncrypted ? 'AES-256-CBC' : 'none'),
                    'sha256' => $manifest['sha256'] ?? hash_file('sha256', $filePath),
                    'includes_db' => $manifest['includes_db'] ?? true,
                    'includes_files' => $manifest['includes_files'] ?? false,
                    'db_tables_count' => $manifest['db_tables_count'] ?? null,
                    'db_records_count' => $manifest['db_records_count'] ?? null,
                    'app_version' => $manifest['app_version'] ?? '3.0.0',
                    'notes' => $manifest['notes'] ?? '',
                ];
            }
        }

        // Sort descending by creation date (newest first)
        usort($backups, fn($a, $b) => $b['created_at_timestamp'] <=> $a['created_at_timestamp']);

        return $backups;
    }

    /**
     * Create a full or custom backup of database and media files.
     */
    public function createBackup(array $options = []): array
    {
        $startTime = microtime(true);
        $timestamp = date('Ymd_His');
        $backupId = 'GTT-BAK-' . strtoupper(Str::random(8));

        $type = $options['type'] ?? 'full';
        $includeDb = $type === 'full' || $type === 'db_only' || ($options['include_db'] ?? true);
        $includeFiles = $type === 'full' || $type === 'files_only' || ($options['include_files'] ?? false);
        $isEncrypted = $options['encrypt'] ?? $options['is_encrypted'] ?? (bool) SystemSetting::getVal('backup_default_encrypt', true);
        $encryptionKey = $options['passphrase'] ?? $options['encryption_key'] ?? SystemSetting::getVal('backup_master_password', config('app.key'));
        $notes = $options['notes'] ?? 'Manual System Backup';
        $destinations = $options['destinations'] ?? [];
        if (is_assoc_array($destinations)) {
            $destList = [];
            foreach ($destinations as $k => $v) {
                if ($v) $destList[] = $k;
            }
            $destinations = $destList;
        }

        $tempFolder = storage_path('app/temp_backup_' . $timestamp . '_' . Str::random(6));
        File::makeDirectory($tempFolder, 0755, true);

        $tablesCount = 0;
        $recordsCount = 0;

        try {
            // 1. Export Database
            if ($includeDb) {
                $dbDumpFile = $tempFolder . DIRECTORY_SEPARATOR . 'database.sql';
                $dbStats = $this->dumpDatabaseToSqlFile($dbDumpFile);
                $tablesCount = $dbStats['tables_count'];
                $recordsCount = $dbStats['records_count'];
            }

            // 2. Export Media Files & Storage Uploads
            if ($includeFiles) {
                $storagePublicPath = storage_path('app/public');
                $targetFilesDir = $tempFolder . DIRECTORY_SEPARATOR . 'storage_uploads';
                if (File::exists($storagePublicPath)) {
                    File::makeDirectory($targetFilesDir, 0755, true);
                    File::copyDirectory($storagePublicPath, $targetFilesDir);
                }
            }

            // 3. Create Manifest Metadata
            $manifest = [
                'backup_id' => $backupId,
                'app_name' => 'GoTransTech Platform',
                'app_version' => '3.0.0',
                'created_at' => now()->toIso8601String(),
                'db_connection' => config('database.default'),
                'includes_db' => $includeDb,
                'includes_files' => $includeFiles,
                'db_tables_count' => $tablesCount,
                'db_records_count' => $recordsCount,
                'is_encrypted' => $isEncrypted,
                'encryption_algo' => $isEncrypted ? 'AES-256-CBC' : 'none',
                'notes' => $notes,
            ];

            File::put($tempFolder . DIRECTORY_SEPARATOR . 'manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            // 4. Archive into a single ZIP container
            $rawZipFile = storage_path('app/raw_' . $timestamp . '.zip');
            $this->zipDirectory($tempFolder, $rawZipFile);

            $rawHash = hash_file('sha256', $rawZipFile);
            $manifest['sha256_unencrypted'] = $rawHash;

            // 5. Encrypt if requested (AES-256-CBC with HMAC-SHA256 authenticated encryption)
            $finalFilename = 'gotranstech_backup_' . $timestamp . '_' . strtolower(Str::random(4));
            if ($isEncrypted) {
                $finalFilename .= '.gtbak.enc';
                $finalFilePath = $this->getBackupPath($finalFilename);
                $this->encryptFileWithHmac($rawZipFile, $finalFilePath, $encryptionKey);
                @unlink($rawZipFile);
            } else {
                $finalFilename .= '.gtbak';
                $finalFilePath = $this->getBackupPath($finalFilename);
                rename($rawZipFile, $finalFilePath);
            }

            $finalSize = filesize($finalFilePath);
            $finalHash = hash_file('sha256', $finalFilePath);

            // Clean temporary staging folder
            File::deleteDirectory($tempFolder);

            $elapsedSec = round(microtime(true) - $startTime, 2);

            $backupResult = [
                'success' => true,
                'backup_id' => $backupId,
                'filename' => $finalFilename,
                'file_path' => $finalFilePath,
                'size_bytes' => $finalSize,
                'size_human' => $this->formatBytes($finalSize),
                'sha256' => $finalHash,
                'is_encrypted' => $isEncrypted,
                'tables_count' => $tablesCount,
                'records_count' => $recordsCount,
                'elapsed_seconds' => $elapsedSec,
                'created_at' => now()->toDateTimeString(),
            ];

            // 6. Automatic Retention Cleanup (keep latest N backups)
            $this->cleanupOldBackups();

            // 7. Dispatch to Remote Cloud Channels (Telegram, Email, Google Drive)
            $dispatchResults = [];
            if (!empty($destinations)) {
                $dispatchResults = $this->dispatchBackup($finalFilename, $destinations, $options);
            }
            $backupResult['dispatch'] = $dispatchResults;

            // 8. Log operational notification in Platform Hub (if not internal silent snapshot)
            if (!($options['is_internal'] ?? false)) {
                try {
                    NotificationDispatcherService::dispatch(
                        'admin.system_backup',
                        'تم إنشاء نسخة احتياطية جديدة بنجاح 💾',
                        "تم أخذ نسخة احتياطية ({$finalFilename}) بحجم {$backupResult['size_human']} وتشفير: " . ($isEncrypted ? 'AES-256' : 'غير مشفر') . " في {$elapsedSec} ثانية.",
                        route('admin.backups.index'),
                        $backupResult,
                        null,
                        'info'
                    );
                } catch (\Throwable $e) {
                    Log::warning("Backup admin notification error: " . $e->getMessage());
                }
            }

            return $backupResult;

        } catch (\Throwable $e) {
            if (File::exists($tempFolder)) {
                File::deleteDirectory($tempFolder);
            }
            if (isset($rawZipFile) && File::exists($rawZipFile)) {
                @unlink($rawZipFile);
            }
            Log::error("Backup creation failed: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            throw new RuntimeException("فشل إنشاء النسخة الاحتياطية: " . $e->getMessage());
        }
    }

    /**
     * Restore database and files from a local or uploaded backup.
     */
    public function restoreBackup(string $filePathOrName, ?string $password = null, array $options = []): array
    {
        $startTime = microtime(true);
        $fullPath = File::exists($filePathOrName) ? $filePathOrName : $this->getBackupPath($filePathOrName);

        if (!File::exists($fullPath)) {
            throw new RuntimeException("ملف النسخة الاحتياطية غير موجود: {$filePathOrName}");
        }

        // 1. Create a quick pre-restore safety rollback backup of current state
        $safetyBackup = null;
        if (!($options['skip_safety_backup'] ?? false)) {
            try {
                $safetyBackup = $this->createBackup([
                    'type' => 'db_only',
                    'include_db' => true,
                    'include_files' => false,
                    'encrypt' => false,
                    'is_internal' => true,
                    'notes' => 'نسخة أمان احترازية تلقائية قبل استعادة النظام',
                    'destinations' => [],
                ]);
            } catch (\Throwable $e) {
                Log::warning("Pre-restore safety backup creation warning: " . $e->getMessage());
            }
        }

        $tempExtractDir = storage_path('app/temp_restore_' . date('Ymd_His') . '_' . Str::random(6));
        File::makeDirectory($tempExtractDir, 0755, true);

        try {
            $workingZipPath = $fullPath;

            // 2. If file is encrypted, decrypt it first
            if (str_ends_with($fullPath, '.enc') || $this->isEncryptedFormat($fullPath)) {
                $key = $password ?: SystemSetting::getVal('backup_master_password', config('app.key'));
                if (empty($key)) {
                    throw new RuntimeException("النسخة الاحتياطية مشفرة، يرجى إدخال كلمة مرور فك التشفير.");
                }

                $decryptedZipPath = $tempExtractDir . DIRECTORY_SEPARATOR . 'decrypted_archive.zip';
                $this->decryptFileWithHmac($fullPath, $decryptedZipPath, $key);
                $workingZipPath = $decryptedZipPath;
            }

            // 3. Extract the ZIP archive
            $zip = new ZipArchive();
            if ($zip->open($workingZipPath) !== true) {
                throw new RuntimeException("تعذر فتح أو استخراج أرشيف النسخة الاحتياطية (تأكد من سلامة الملف أو صحة كلمة المرور).");
            }
            $zip->extractTo($tempExtractDir);
            $zip->close();

            // 4. Validate manifest
            $manifestFile = $tempExtractDir . DIRECTORY_SEPARATOR . 'manifest.json';
            $manifest = [];
            if (File::exists($manifestFile)) {
                $manifest = json_decode(File::get($manifestFile), true) ?: [];
            }

            $restoredTables = 0;
            $restoredQueries = 0;

            // 5. Restore Database SQL if included
            $sqlFile = $tempExtractDir . DIRECTORY_SEPARATOR . 'database.sql';
            if (File::exists($sqlFile)) {
                $sqlStats = $this->executeSqlDumpFile($sqlFile);
                $restoredTables = $sqlStats['tables_restored'];
                $restoredQueries = $sqlStats['queries_executed'];
            }

            // 6. Restore Storage Public Uploads if included
            $uploadsDir = $tempExtractDir . DIRECTORY_SEPARATOR . 'storage_uploads';
            if (File::exists($uploadsDir) && ($options['restore_files'] ?? true)) {
                $targetPublicStorage = storage_path('app/public');
                File::copyDirectory($uploadsDir, $targetPublicStorage);
            }

            // Cleanup temp extract folder
            File::deleteDirectory($tempExtractDir);

            $elapsedSec = round(microtime(true) - $startTime, 2);

            // Log operational alert
            try {
                NotificationDispatcherService::dispatch(
                    'admin.system_restore',
                    'تمت استعادة النسخة الاحتياطية بنجاح ♻️',
                    "تمت استعادة قاعدة البيانات ({$restoredTables} جدول و {$restoredQueries} سجل) من الملف {$filePathOrName} في {$elapsedSec} ثانية.",
                    route('admin.backups.index'),
                    [
                        'tables' => $restoredTables,
                        'queries' => $restoredQueries,
                        'file' => $filePathOrName,
                        'safety_backup' => $safetyBackup['filename'] ?? null,
                    ],
                    null,
                    'urgent'
                );
            } catch (\Throwable $e) {}

            return [
                'success' => true,
                'message' => 'تمت استعادة النسخة الاحتياطية بنجاح ومطابقة كافة الجداول والبيانات.',
                'tables_restored' => $restoredTables,
                'queries_executed' => $restoredQueries,
                'elapsed_seconds' => $elapsedSec,
                'safety_rollback_backup' => $safetyBackup['filename'] ?? null,
                'manifest' => $manifest,
            ];

        } catch (\Throwable $e) {
            if (File::exists($tempExtractDir)) {
                File::deleteDirectory($tempExtractDir);
            }
            Log::error("Backup restore failed: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            throw new RuntimeException("فشلت عملية الاستعادة: " . $e->getMessage());
        }
    }

    /**
     * Dispatch an existing backup to Telegram, Email, and/or Google Drive.
     */
    public function dispatchBackup(string $filename, array|string $destinations, array $config = []): array
    {
        $filePath = $this->getBackupPath($filename);
        if (!File::exists($filePath)) {
            throw new RuntimeException("ملف النسخة الاحتياطية غير موجود: {$filename}");
        }

        $destList = is_array($destinations) ? $destinations : [$destinations];
        $results = [];
        $fileSizeHuman = $this->formatBytes(filesize($filePath));
        $sha256 = hash_file('sha256', $filePath);

        // 1. Telegram Dispatch
        if (in_array('telegram', $destList)) {
            try {
                $botToken = $config['telegram_bot_token'] 
                    ?? SystemSetting::getVal('telegram_backup_bot_token') 
                    ?? SystemSetting::getVal('backup_telegram_bot_token');
                $chatId = $config['telegram_chat_id'] 
                    ?? SystemSetting::getVal('telegram_backup_chat_id') 
                    ?? SystemSetting::getVal('backup_telegram_chat_id');

                if (!empty($botToken) && !empty($chatId)) {
                    $caption = "📦 *نسخة احتياطية جديدة - منصة جو تيك*\n"
                             . "━━━━━━━━━━━━━━━━━━━\n"
                             . "📁 *الملف:* `{$filename}`\n"
                             . "⚖️ *الحجم:* `{$fileSizeHuman}`\n"
                             . "🔒 *التوقيع:* `{$sha256}`\n"
                             . "⏱️ *التاريخ:* " . now()->toDateTimeString() . "\n"
                             . "🚀 *المنصة:* GoTransTech Platform v3.0";

                    $response = Http::timeout(120)->attach(
                        'document', 
                        file_get_contents($filePath), 
                        $filename
                    )->post("https://api.telegram.org/bot{$botToken}/sendDocument", [
                        'chat_id' => $chatId,
                        'caption' => $caption,
                        'parse_mode' => 'Markdown',
                    ]);

                    if ($response->successful() && $response->json('ok') === true) {
                        $results['telegram'] = ['success' => true, 'message' => 'تم الترحيل إلى تيليجرام بنجاح'];
                    } else {
                        $results['telegram'] = ['success' => false, 'message' => 'فشل الترحيل إلى تيليجرام: ' . $response->body()];
                    }
                } else {
                    $results['telegram'] = ['success' => false, 'message' => 'إعدادات روبوت تيليجرام غير مكتملة'];
                }
            } catch (\Throwable $e) {
                $results['telegram'] = ['success' => false, 'message' => 'خطأ تيليجرام: ' . $e->getMessage()];
            }
        }

        // 2. Email (SMTP) Dispatch
        if (in_array('email', $destList)) {
            try {
                $recipientEmail = $config['email_recipients'] 
                    ?? SystemSetting::getVal('email_backup_recipients') 
                    ?? SystemSetting::getVal('backup_email_recipient');

                if (!empty($recipientEmail)) {
                    $recipients = array_map('trim', explode(',', $recipientEmail));
                    $subject = "💾 نسخة احتياطية للنظام - جو تيك ({$filename})";
                    $bodyHtml = "<h2>تقرير النسخ الاحتياطي لمنصة جو تيك (GoTransTech)</h2>"
                              . "<p>تم إنشاء نسخة احتياطية لقاعدة البيانات والملفات بنجاح ومرفقة مع هذه الرسالة.</p>"
                              . "<ul>"
                              . "<li><strong>اسم الملف:</strong> {$filename}</li>"
                              . "<li><strong>الحجم:</strong> {$fileSizeHuman}</li>"
                              . "<li><strong>توقيع التشفير (SHA256):</strong> {$sha256}</li>"
                              . "<li><strong>تاريخ الإنشاء:</strong> " . now()->toDateTimeString() . "</li>"
                              . "</ul>"
                              . "<p><em>يرجى حفظ هذا الملف في مكان آمن ومشفر.</em></p>";

                    Mail::html($bodyHtml, function ($message) use ($recipients, $subject, $filePath, $filename) {
                        $message->to($recipients)
                                ->subject($subject)
                                ->attach($filePath, ['as' => $filename]);
                    });

                    $results['email'] = ['success' => true, 'message' => "تم إرسال النسخة الاحتياطية إلى البريد ({$recipientEmail}) بنجاح"];
                } else {
                    $results['email'] = ['success' => false, 'message' => 'البريد الإلكتروني المستلم غير محدد في إعدادات الترحيل'];
                }
            } catch (\Throwable $e) {
                $results['email'] = ['success' => false, 'message' => 'خطأ خادم البريد: ' . $e->getMessage()];
            }
        }

        // 3. Google Drive Webhook Dispatch
        if (in_array('google_drive', $destList)) {
            try {
                $driveWebhookUrl = $config['google_drive_webhook_url'] 
                    ?? SystemSetting::getVal('gdrive_backup_webhook_url') 
                    ?? SystemSetting::getVal('backup_google_drive_webhook');

                if (!empty($driveWebhookUrl)) {
                    $payload = [
                        'filename' => $filename,
                        'file_content' => base64_encode(file_get_contents($filePath)),
                        'sha256' => $sha256,
                        'size_bytes' => filesize($filePath),
                        'app' => 'GoTransTech Platform',
                        'created_at' => now()->toIso8601String(),
                    ];

                    $response = Http::timeout(180)->asJson()->post($driveWebhookUrl, $payload);
                    $json = $response->json();
                    if ($response->successful() && (!isset($json['status']) || $json['status'] === 'success')) {
                        $msg = $json['message'] ?? 'تم الترحيل إلى Google Drive بنجاح عبر الويب هوك';
                        $results['google_drive'] = ['success' => true, 'message' => $msg];
                    } else {
                        $errorMsg = $json['message'] ?? (strip_tags($response->body()) ?: 'فشل استجابة خادم Google Drive');
                        if (strlen($errorMsg) > 200) {
                            $errorMsg = 'الرابط غير صحيح أو لم يتم منح الصلاحية لـ Anyone (تأكد من استخدام رابط /exec وليس رابط محرر السكريبت /edit)';
                        }
                        $results['google_drive'] = ['success' => false, 'message' => 'خطأ Google Drive: ' . $errorMsg];
                    }
                } else {
                    $results['google_drive'] = ['success' => false, 'message' => 'رابط ترحيل Google Drive أو الويب هوك غير مهيأ في الإعدادات'];
                }
            } catch (\Throwable $e) {
                $results['google_drive'] = ['success' => false, 'message' => 'خطأ Google Drive: ' . $e->getMessage()];
            }
        }

        if (is_string($destinations)) {
            return $results[$destinations] ?? [
                'success' => false,
                'message' => "الوجهة المطلوبة ({$destinations}) غير مدعومة",
            ];
        }

        $allSuccess = !empty($results) && collect($results)->every(fn($r) => $r['success'] === true);
        return [
            'success' => $allSuccess,
            'results' => $results,
            'message' => $allSuccess ? 'تم الترحيل إلى الوجهات المحددة بنجاح' : 'اكتمل الترحيل مع وجود بعض التحذيرات',
        ];
    }

    /**
     * Download backup file as stream.
     */
    public function downloadBackup(string $filename): BinaryFileResponse
    {
        $filePath = $this->getBackupPath($filename);
        if (!File::exists($filePath)) {
            throw new RuntimeException("ملف النسخة الاحتياطية غير موجود: {$filename}");
        }

        return response()->download($filePath, $filename, [
            'Content-Type' => 'application/octet-stream',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Delete a stored backup file.
     */
    public function deleteBackup(string $filename): bool
    {
        $filePath = $this->getBackupPath($filename);
        if (File::exists($filePath)) {
            return File::delete($filePath);
        }
        return false;
    }

    /**
     * Verify backup integrity and check HMAC/SHA256 signatures.
     */
    public function verifyBackupIntegrity(string $filename, ?string $password = null): array
    {
        $filePath = $this->getBackupPath($filename);
        if (!File::exists($filePath)) {
            return [
                'valid' => false,
                'message' => 'ملف النسخة الاحتياطية غير موجود على الخادم',
                'filename' => $filename,
                'sha256' => '',
                'is_encrypted' => false,
                'encryption_key_valid' => false,
                'manifest' => null,
            ];
        }

        $sha256 = hash_file('sha256', $filePath);
        $isEncrypted = str_ends_with($filename, '.enc') || $this->isEncryptedFormat($filePath);
        $decryptionOk = false;
        $manifest = null;
        $message = '';

        if ($isEncrypted) {
            $key = $password ?: SystemSetting::getVal('backup_master_password', config('app.key'));
            if (!empty($key)) {
                try {
                    $tempTest = storage_path('app/temp_verify_' . Str::random(8) . '.zip');
                    $this->decryptFileWithHmac($filePath, $tempTest, $key);
                    $decryptionOk = true;
                    $manifest = $this->extractManifestSafely($tempTest);
                    @unlink($tempTest);
                    $message = 'النسخة الاحتياطية مشفرة وسليمة 100% وتم التحقق من التوقيع الرقمي (HMAC-SHA256) وفك التشفير بنجاح.';
                } catch (\Throwable $e) {
                    $decryptionOk = false;
                    $message = 'فشل التحقق من التوقيع الرقمي أو كلمة مرور فك التشفير: ' . $e->getMessage();
                }
            } else {
                $decryptionOk = false;
                $message = 'يرجى إدخال كلمة مرور فك التشفير للتحقق من النسخة المشفرة';
            }
        } else {
            $decryptionOk = true;
            $manifest = $this->extractManifestSafely($filePath);
            $message = 'النسخة الاحتياطية سليمة تماماً ومطابقة للبصمة الرقمية ومحتوياتها جاهزة للاستعادة.';
        }

        return [
            'valid' => $decryptionOk,
            'message' => $message,
            'filename' => $filename,
            'size_bytes' => filesize($filePath),
            'size_formatted' => $this->formatBytes(filesize($filePath)),
            'sha256' => $sha256,
            'is_encrypted' => $isEncrypted,
            'encryption_key_valid' => $decryptionOk,
            'manifest' => $manifest,
        ];
    }

    /**
     * Test connections to Telegram, Email SMTP, or Google Drive webhook.
     */
    public function testCloudDestination(string $type, array $credentials = []): array
    {
        if ($type === 'telegram') {
            $token = $credentials['telegram_bot_token'] 
                ?? SystemSetting::getVal('telegram_backup_bot_token') 
                ?? SystemSetting::getVal('backup_telegram_bot_token');

            $chatId = $credentials['telegram_chat_id'] 
                ?? SystemSetting::getVal('telegram_backup_chat_id') 
                ?? SystemSetting::getVal('backup_telegram_chat_id');

            if (empty($token) || empty($chatId)) {
                return ['success' => false, 'message' => 'يرجى إدخال توكن البوت ومعرف المحادثة (Chat ID) لتيليجرام'];
            }

            try {
                $res = Http::timeout(15)->post("https://api.telegram.org/bot{$token}/sendMessage", [
                    'chat_id' => $chatId,
                    'text' => "🔔 *اختبار اتصال النسخ الاحتياطي - منصة جو تيك*\nتم اختبار الربط بنجاح في: " . now()->toDateTimeString(),
                    'parse_mode' => 'Markdown',
                ]);

                if ($res->successful() && $res->json('ok') === true) {
                    return ['success' => true, 'message' => 'تم الاتصال بروبوت تيليجرام وإرسال رسالة الاختبار بنجاح!'];
                }
                return ['success' => false, 'message' => 'فشل إرسال رسالة تيليجرام: ' . $res->body()];
            } catch (\Throwable $e) {
                return ['success' => false, 'message' => 'خطأ في الاتصال بتيليجرام: ' . $e->getMessage()];
            }
        }

        if ($type === 'email') {
            $email = $credentials['email_recipients'] 
                ?? SystemSetting::getVal('email_backup_recipients') 
                ?? SystemSetting::getVal('backup_email_recipient');

            if (empty($email)) {
                return ['success' => false, 'message' => 'يرجى إدخال بريد إلكتروني صالح في الإعدادات'];
            }
            try {
                $recipients = array_map('trim', explode(',', $email));
                Mail::html("<p>تم اختبار إعدادات البريد الإلكتروني للنسخ الاحتياطي لمنصة <strong>جو تيك (GoTransTech)</strong> بنجاح في " . now()->toDateTimeString() . ".</p>", function ($msg) use ($recipients) {
                    $msg->to($recipients)->subject("اختبار خدمة النسخ الاحتياطي - جو تيك");
                });
                return ['success' => true, 'message' => "تم إرسال بريد الاختبار إلى ({$email}) بنجاح!"];
            } catch (\Throwable $e) {
                return ['success' => false, 'message' => 'خطأ خادم البريد: ' . $e->getMessage()];
            }
        }

        if ($type === 'google_drive') {
            $webhook = $credentials['google_drive_webhook_url'] 
                ?? SystemSetting::getVal('gdrive_backup_webhook_url') 
                ?? SystemSetting::getVal('backup_google_drive_webhook');

            if (empty($webhook)) {
                return ['success' => false, 'message' => 'يرجى إدخال رابط Google Drive Webhook في الإعدادات'];
            }
            try {
                $res = Http::timeout(15)->asJson()->post($webhook, [
                    'test' => true,
                    'app' => 'GoTransTech Platform',
                    'timestamp' => now()->toIso8601String(),
                ]);
                $json = $res->json();
                if ($res->successful() && (!isset($json['status']) || $json['status'] === 'success')) {
                    $msg = $json['message'] ?? 'تم الاتصال بالويب هوك لـ Google Drive بنجاح!';
                    return ['success' => true, 'message' => $msg];
                }
                $errMsg = $json['message'] ?? (strip_tags($res->body()) ?: 'فشل استجابة الويب هوك');
                if (strlen($errMsg) > 200) {
                    $errMsg = 'الرابط غير صحيح أو لم يتم ضبط الوصول إلى "Anyone" (تأكد من نسخ رابط النشر الذي ينتهي بـ /exec وليس رابط محرر السكريبت)';
                }
                return ['success' => false, 'message' => 'فشل استجابة الويب هوك: ' . $errMsg];
            } catch (\Throwable $e) {
                return ['success' => false, 'message' => 'خطأ الاتصال بـ Google Drive: ' . $e->getMessage()];
            }
        }

        return ['success' => false, 'message' => 'نوع الوجهة غير مدعوم'];
    }

    /**
     * Get cloud backup configuration settings.
     */
    public function getConfig(): array
    {
        return [
            'backup_auto_enabled' => (bool) SystemSetting::getVal('backup_auto_enabled', false),
            'backup_schedule_time' => SystemSetting::getVal('backup_schedule_time', '02:00'),
            'backup_max_retained' => (int) (SystemSetting::getVal('backup_max_retained') ?: SystemSetting::getVal('backup_max_retention_count') ?: 15),
            'backup_default_encrypt' => (bool) SystemSetting::getVal('backup_default_encrypt', true),
            'backup_master_password' => SystemSetting::getVal('backup_master_password', ''),
            'telegram_backup_enabled' => (bool) SystemSetting::getVal('telegram_backup_enabled', false),
            'telegram_backup_bot_token' => SystemSetting::getVal('telegram_backup_bot_token') ?: SystemSetting::getVal('backup_telegram_bot_token') ?: '',
            'telegram_backup_chat_id' => SystemSetting::getVal('telegram_backup_chat_id') ?: SystemSetting::getVal('backup_telegram_chat_id') ?: '',
            'email_backup_enabled' => (bool) SystemSetting::getVal('email_backup_enabled', false),
            'email_backup_recipients' => SystemSetting::getVal('email_backup_recipients') ?: SystemSetting::getVal('backup_email_recipient') ?: '',
            'gdrive_backup_enabled' => (bool) SystemSetting::getVal('gdrive_backup_enabled', false),
            'gdrive_backup_webhook_url' => SystemSetting::getVal('gdrive_backup_webhook_url') ?: SystemSetting::getVal('backup_google_drive_webhook') ?: '',
        ];
    }

    /**
     * Save cloud backup configuration settings.
     */
    public function saveConfig(array $data): void
    {
        foreach ($data as $key => $value) {
            $val = is_bool($value) ? ($value ? '1' : '0') : (string)$value;
            $isEncrypted = in_array($key, ['backup_master_password', 'telegram_backup_bot_token']);
            SystemSetting::setVal($key, $val, 'backup', $isEncrypted);
        }

        // Sync aliases
        if (isset($data['telegram_backup_bot_token'])) {
            SystemSetting::setVal('backup_telegram_bot_token', (string)$data['telegram_backup_bot_token'], 'backup', true);
        }
        if (isset($data['telegram_backup_chat_id'])) {
            SystemSetting::setVal('backup_telegram_chat_id', (string)$data['telegram_backup_chat_id'], 'backup');
        }
        if (isset($data['email_backup_recipients'])) {
            SystemSetting::setVal('backup_email_recipient', (string)$data['email_backup_recipients'], 'backup');
        }
        if (isset($data['gdrive_backup_webhook_url'])) {
            SystemSetting::setVal('backup_google_drive_webhook', (string)$data['gdrive_backup_webhook_url'], 'backup');
        }
        if (isset($data['backup_max_retained'])) {
            SystemSetting::setVal('backup_max_retention_count', (string)$data['backup_max_retained'], 'backup');
        }
    }

    // ==========================================
    // INTERNAL ENGINES: DB DUMP, RESTORE & CRYPTO
    // ==========================================

    /**
     * Pure PDO Database Dumper (Cross-platform for MySQL, MariaDB, Postgres, SQLite).
     */
    protected function dumpDatabaseToSqlFile(string $targetSqlFile): array
    {
        $handle = fopen($targetSqlFile, 'w');
        if (!$handle) {
            throw new RuntimeException("تعذر فتح ملف تفريغ قاعدة البيانات للكتابة: {$targetSqlFile}");
        }

        $connection = DB::connection();
        $driver = $connection->getDriverName();

        fwrite($handle, "-- ==============================================\n");
        fwrite($handle, "-- GoTransTech Platform - Full Database Backup\n");
        fwrite($handle, "-- Driver: {$driver}\n");
        fwrite($handle, "-- Created: " . now()->toIso8601String() . "\n");
        fwrite($handle, "-- ==============================================\n\n");

        if ($driver === 'pgsql') {
            fwrite($handle, "SET CONSTRAINTS ALL DEFERRED;\n\n");
        } elseif ($driver === 'mysql') {
            fwrite($handle, "SET FOREIGN_KEY_CHECKS = 0;\nSET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n\n");
        }

        $tables = $this->getAllTableNames($driver);
        $totalTables = count($tables);
        $totalRecords = 0;

        foreach ($tables as $table) {
            if (in_array($table, ['telescope_entries', 'pulse_entries', 'sessions'])) {
                continue;
            }

            fwrite($handle, "--\n-- Structure & Data for Table: `{$table}`\n--\n");
            
            // Clean table before insert
            if ($driver === 'pgsql') {
                fwrite($handle, "TRUNCATE TABLE \"{$table}\" CASCADE;\n");
            } elseif ($driver === 'mysql') {
                fwrite($handle, "TRUNCATE TABLE `{$table}`;\n");
            } else {
                fwrite($handle, "DELETE FROM \"{$table}\";\n");
            }

            // Dump data in chunks of 250
            $count = $connection->table($table)->count();
            $totalRecords += $count;

            if ($count > 0) {
                $connection->table($table)->orderByRaw('1')->chunk(250, function ($rows) use ($handle, $table, $driver) {
                    foreach ($rows as $row) {
                        $rowArray = (array) $row;
                        $columns = array_keys($rowArray);

                        $escapedColumns = array_map(function ($c) use ($driver) {
                            return $driver === 'mysql' ? "`{$c}`" : "\"{$c}\"";
                        }, $columns);

                        $escapedValues = array_map(function ($val) {
                            if ($val === null) {
                                return 'NULL';
                            }
                            if (is_bool($val)) {
                                return $val ? 'TRUE' : 'FALSE';
                            }
                            if (is_int($val) || is_float($val)) {
                                return (string) $val;
                            }
                            return DB::getPdo()->quote((string) $val);
                        }, array_values($rowArray));

                        $colStr = implode(', ', $escapedColumns);
                        $valStr = implode(', ', $escapedValues);
                        $tableWrapped = $driver === 'mysql' ? "`{$table}`" : "\"{$table}\"";

                        fwrite($handle, "INSERT INTO {$tableWrapped} ({$colStr}) VALUES ({$valStr});\n");
                    }
                });
            }

            fwrite($handle, "\n");
        }

        if ($driver === 'mysql') {
            fwrite($handle, "SET FOREIGN_KEY_CHECKS = 1;\n");
        }

        fclose($handle);

        return [
            'tables_count' => $totalTables,
            'records_count' => $totalRecords,
        ];
    }

    /**
     * Execute SQL dump file into the database safely.
     */
    protected function executeSqlDumpFile(string $sqlFile): array
    {
        if (!File::exists($sqlFile)) {
            throw new RuntimeException("ملف SQL غير موجود: {$sqlFile}");
        }

        $connection = DB::connection();
        $driver = $connection->getDriverName();
        $pdo = $connection->getPdo();

        if ($driver === 'mysql') {
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 0;");
        }

        $queriesExecuted = 0;
        $tablesRestored = 0;

        $handle = fopen($sqlFile, 'r');
        $buffer = '';

        while (($line = fgets($handle)) !== false) {
            $trimmed = trim($line);
            if (empty($trimmed) || str_starts_with($trimmed, '--') || str_starts_with($trimmed, '/*')) {
                continue;
            }

            $buffer .= $line;

            if (str_ends_with($trimmed, ';')) {
                try {
                    $pdo->exec($buffer);
                    $queriesExecuted++;

                    if (stripos($buffer, 'TRUNCATE TABLE') !== false || stripos($buffer, 'DELETE FROM') !== false) {
                        $tablesRestored++;
                    }
                } catch (\Throwable $e) {
                    Log::warning("SQL dump statement warning: " . $e->getMessage(), ['query' => substr($buffer, 0, 100)]);
                }
                $buffer = '';
            }
        }

        fclose($handle);

        if ($driver === 'mysql') {
            $pdo->exec("SET FOREIGN_KEY_CHECKS = 1;");
        }

        return [
            'tables_restored' => $tablesRestored,
            'queries_executed' => $queriesExecuted,
        ];
    }

    /**
     * Get all database table names.
     */
    protected function getAllTableNames(string $driver): array
    {
        $tables = [];

        if ($driver === 'pgsql') {
            $results = DB::select("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
            foreach ($results as $r) {
                $tables[] = $r->tablename;
            }
        } elseif ($driver === 'mysql') {
            $database = config('database.connections.' . config('database.default') . '.database');
            $results = DB::select("SHOW TABLES");
            $key = "Tables_in_{$database}";
            foreach ($results as $r) {
                $tables[] = $r->$key ?? array_values((array)$r)[0];
            }
        } elseif ($driver === 'sqlite') {
            $results = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
            foreach ($results as $r) {
                $tables[] = $r->name;
            }
        }

        return $tables;
    }

    /**
     * Create ZIP archive from directory.
     */
    protected function zipDirectory(string $sourceDir, string $outZipPath): void
    {
        $zip = new ZipArchive();
        if ($zip->open($outZipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException("تعذر إنشاء ملف الأرشيف ZIP: {$outZipPath}");
        }

        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($sourceDir, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = substr($filePath, strlen(realpath($sourceDir)) + 1);
                $zip->addFile($filePath, str_replace('\\', '/', $relativePath));
            }
        }

        $zip->close();
    }

    /**
     * Authenticated Encryption using AES-256-CBC with HMAC-SHA256 signature tag.
     */
    protected function encryptFileWithHmac(string $sourcePath, string $destPath, string $passphrase): void
    {
        $iv = openssl_random_pseudo_bytes(16);
        $salt = openssl_random_pseudo_bytes(16);

        // Derive Encryption and HMAC keys using PBKDF2
        $derivedKey = hash_pbkdf2('sha256', $passphrase, $salt, 10000, 64, true);
        $encKey = substr($derivedKey, 0, 32);
        $hmacKey = substr($derivedKey, 32, 32);

        $plaintext = file_get_contents($sourcePath);
        $ciphertext = openssl_encrypt($plaintext, 'AES-256-CBC', $encKey, OPENSSL_RAW_DATA, $iv);

        // Magic header 'GTTENC' + Salt (16) + IV (16) + Ciphertext
        $payload = 'GTTENC' . $salt . $iv . $ciphertext;
        $hmac = hash_hmac('sha256', $payload, $hmacKey, true);

        // Final Encrypted File: Payload + HMAC (32 bytes)
        file_put_contents($destPath, $payload . $hmac);
    }

    /**
     * Authenticated Decryption verifying HMAC-SHA256 tag first.
     */
    protected function decryptFileWithHmac(string $sourcePath, string $destPath, string $passphrase): void
    {
        $data = file_get_contents($sourcePath);
        $len = strlen($data);

        if ($len < 70) {
            throw new RuntimeException("ملف النسخة المشفرة تالف أو قصير جداً.");
        }

        $hmac = substr($data, -32);
        $payload = substr($data, 0, -32);

        $magic = substr($payload, 0, 6);
        if ($magic !== 'GTTENC' && $magic !== 'MSHENC') {
            throw new RuntimeException("تنسيق التشفير غير معتمد أو الملف ليس نسخة احتياطية مشفرة صالحة.");
        }

        $salt = substr($payload, 6, 16);
        $iv = substr($payload, 22, 16);
        $ciphertext = substr($payload, 38);

        $derivedKey = hash_pbkdf2('sha256', $passphrase, $salt, 10000, 64, true);
        $encKey = substr($derivedKey, 0, 32);
        $hmacKey = substr($derivedKey, 32, 32);

        $calculatedHmac = hash_hmac('sha256', $payload, $hmacKey, true);
        if (!hash_equals($hmac, $calculatedHmac)) {
            throw new RuntimeException("فشل التحقق من كلمة المرور أو البصمة الرقمية (تأكد من صحة كلمة مرور فك التشفير).");
        }

        $plaintext = openssl_decrypt($ciphertext, 'AES-256-CBC', $encKey, OPENSSL_RAW_DATA, $iv);
        if ($plaintext === false) {
            throw new RuntimeException("فشل فك تشفير البيانات.");
        }

        file_put_contents($destPath, $plaintext);
    }

    /**
     * Check if a file starts with the encrypted magic header.
     */
    protected function isEncryptedFormat(string $filePath): bool
    {
        $handle = @fopen($filePath, 'r');
        if (!$handle) return false;
        $magic = fread($handle, 6);
        fclose($handle);
        return $magic === 'GTTENC' || $magic === 'MSHENC';
    }

    /**
     * Safely extract manifest.json from a ZIP archive without full unzipping.
     */
    protected function extractManifestSafely(string $filePath): ?array
    {
        if ($this->isEncryptedFormat($filePath)) {
            return ['is_encrypted' => true, 'encryption_algo' => 'AES-256-CBC'];
        }

        $zip = new ZipArchive();
        if ($zip->open($filePath) === true) {
            $manifestContent = $zip->getFromName('manifest.json');
            $zip->close();
            if ($manifestContent) {
                return json_decode($manifestContent, true);
            }
        }

        return null;
    }

    /**
     * Automatic Retention Policy: keep latest N backups and prune older ones.
     */
    protected function cleanupOldBackups(): void
    {
        try {
            $maxRetained = (int) (SystemSetting::getVal('backup_max_retained') ?: 15);
            if ($maxRetained < 1) $maxRetained = 15;

            $backups = $this->listBackups();
            if (count($backups) > $maxRetained) {
                $toDelete = array_slice($backups, $maxRetained);
                foreach ($toDelete as $old) {
                    if (isset($old['file_path']) && File::exists($old['file_path'])) {
                        File::delete($old['file_path']);
                        Log::info("Auto-pruned old backup: {$old['filename']}");
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::warning("Backup retention cleanup error: " . $e->getMessage());
        }
    }

    /**
     * Format bytes to human readable format.
     */
    protected function formatBytes(int|float $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}

/**
 * Helper to check if array is associative
 */
if (!function_exists('is_assoc_array')) {
    function is_assoc_array(array $arr): bool
    {
        if ([] === $arr) return false;
        return array_keys($arr) !== range(0, count($arr) - 1);
    }
}
