<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminSystemHealthController extends Controller
{
    public function index(): Response
    {
        // 1. PHP & Environment Info
        $phpInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'os' => PHP_OS . ' (' . php_uname('m') . ')',
            'server_software' => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP CLI / Built-in',
            'memory_limit' => ini_get('memory_limit'),
            'memory_current_usage' => $this->formatBytes(memory_get_usage(true)),
            'memory_peak_usage' => $this->formatBytes(memory_get_peak_usage(true)),
            'max_execution_time' => ini_get('max_execution_time') . 's',
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size'),
            'timezone' => config('app.timezone'),
            'environment' => config('app.env'),
            'debug_mode' => config('app.debug') ? 'مفعل (True)' : 'معطل (False)',
        ];

        // 2. Storage & Disk
        $diskPath = base_path();
        $totalDiskSpace = @disk_total_space($diskPath);
        $freeDiskSpace = @disk_free_space($diskPath);
        $usedDiskSpace = $totalDiskSpace && $freeDiskSpace ? $totalDiskSpace - $freeDiskSpace : 0;
        $diskUsagePercent = $totalDiskSpace > 0 ? round(($usedDiskSpace / $totalDiskSpace) * 100, 1) : 0;

        $storageInfo = [
            'total_space' => $totalDiskSpace ? $this->formatBytes($totalDiskSpace) : 'N/A',
            'free_space' => $freeDiskSpace ? $this->formatBytes($freeDiskSpace) : 'N/A',
            'used_space' => $this->formatBytes($usedDiskSpace),
            'usage_percentage' => $diskUsagePercent,
        ];

        // 3. Database Info & Latency
        $dbDriver = DB::getDriverName();
        $dbName = config('database.connections.' . config('database.default') . '.database');
        $dbHost = config('database.connections.' . config('database.default') . '.host');
        $dbPort = config('database.connections.' . config('database.default') . '.port');

        $dbStartTime = microtime(true);
        $dbConnected = false;
        $dbVersion = 'N/A';
        $dbSize = 'N/A';
        $tables = [];

        try {
            DB::connection()->getPdo();
            $dbLatency = round((microtime(true) - $dbStartTime) * 1000, 2);
            $dbConnected = true;

            if ($dbDriver === 'pgsql') {
                $versionQuery = DB::select("SELECT version() as ver");
                $dbVersion = $versionQuery[0]->ver ?? 'PostgreSQL';

                $sizeQuery = DB::select("SELECT pg_size_pretty(pg_database_size(current_database())) as size");
                $dbSize = $sizeQuery[0]->size ?? 'N/A';

                // Table counts
                $tableList = [
                    'users', 'tasks', 'task_investments', 'deposits', 'withdrawals',
                    'contracts', 'audit_logs', 'wallets', 'ledger_entries', 'landing_page_sections',
                ];

                foreach ($tableList as $tbl) {
                    try {
                        $rowCount = DB::table($tbl)->count();
                        $tables[] = [
                            'name' => $tbl,
                            'row_count' => $rowCount,
                            'status' => 'سليم',
                        ];
                    } catch (\Exception $e) {
                        // table may not exist
                    }
                }
            } else {
                $dbVersion = 'MySQL/MariaDB ' . DB::connection()->getPdo()->getAttribute(\PDO::ATTR_SERVER_VERSION);
                $tables = [
                    ['name' => 'users', 'row_count' => DB::table('users')->count(), 'status' => 'سليم'],
                    ['name' => 'tasks', 'row_count' => DB::table('tasks')->count(), 'status' => 'سليم'],
                ];
            }
        } catch (\Exception $e) {
            $dbLatency = -1;
            $dbConnected = false;
        }

        $dbInfo = [
            'connected' => $dbConnected,
            'driver' => $dbDriver,
            'database' => $dbName,
            'host' => $dbHost . ':' . $dbPort,
            'latency_ms' => $dbLatency,
            'version' => $dbVersion,
            'database_size' => $dbSize,
            'tables' => $tables,
        ];

        // 4. Cache & Drivers Configuration
        $servicesInfo = [
            'cache_driver' => config('cache.default'),
            'session_driver' => config('session.driver'),
            'queue_driver' => config('queue.default'),
            'mail_mailer' => config('mail.default'),
            'log_channel' => config('logging.default'),
        ];

        return Inertia::render('Admin/SystemHealth/Index', [
            'phpInfo' => $phpInfo,
            'storageInfo' => $storageInfo,
            'dbInfo' => $dbInfo,
            'servicesInfo' => $servicesInfo,
        ]);
    }

    public function handleAction(Request $request): RedirectResponse
    {
        $action = $request->input('action');

        try {
            match ($action) {
                'clear_cache' => Artisan::call('cache:clear'),
                'clear_config' => Artisan::call('config:clear'),
                'clear_route' => Artisan::call('route:clear'),
                'clear_view' => Artisan::call('view:clear'),
                'optimize' => Artisan::call('optimize:clear'),
                default => null,
            };

            return back()->with('success', 'تم تنفيذ إجراء صيانة النظام بنجاح.');
        } catch (\Exception $e) {
            return back()->with('error', 'تعذر تنفيذ الإجراء: ' . $e->getMessage());
        }
    }

    private function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);

        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}
