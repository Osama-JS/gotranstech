<?php

use App\Models\SystemSetting;
use App\Services\BackupService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('backup:run-automated {--force : Force backup even if automated setting is disabled}', function (BackupService $backupService) {
    $this->info('Starting GoTransTech automated system backup...');

    $enabled = (bool) SystemSetting::getVal('backup_auto_enabled', false);
    if (!$enabled && !$this->option('force')) {
        $this->warn('Automated backup is disabled in settings. Use --force to override.');
        return 0;
    }

    $destinations = [];
    if (SystemSetting::getVal('telegram_backup_enabled', false)) $destinations[] = 'telegram';
    if (SystemSetting::getVal('email_backup_enabled', false)) $destinations[] = 'email';
    if (SystemSetting::getVal('gdrive_backup_enabled', false)) $destinations[] = 'google_drive';

    try {
        $result = $backupService->createBackup([
            'type' => 'full',
            'encrypt' => (bool) SystemSetting::getVal('backup_default_encrypt', true),
            'destinations' => $destinations,
            'notes' => 'Automated Scheduled System Backup',
            'creator' => 'Scheduler Daemon',
        ]);

        $this->info("Backup successfully completed: {$result['filename']} ({$result['size_human']})");
        return 0;
    } catch (\Throwable $e) {
        $this->error("Backup failed: " . $e->getMessage());
        return 1;
    }
})->purpose('Execute automated system backup and cloud dispatch');

Schedule::command('backup:run-automated')->dailyAt('02:00');
