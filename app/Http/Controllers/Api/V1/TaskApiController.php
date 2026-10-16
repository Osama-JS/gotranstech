<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Task;
use App\Models\TestTask;
use App\Services\AuditLogService;
use App\Services\NotificationDispatcherService;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TaskApiController extends BaseApiController
{
    public function __construct(
        protected AuditLogService $auditLogService,
        protected WebhookService $webhookService
    ) {}

    /**
     * Check if the incoming request is in Test/Sandbox mode.
     */
    protected function isTestMode(Request $request): bool
    {
        return (bool) $request->attributes->get('is_test_mode', false);
    }

    /**
     * List company tasks with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $company = $this->requireCompany($request);
        $isTest = $this->isTestMode($request);

        if ($isTest) {
            $query = TestTask::where('company_id', $company->id);
        } else {
            $query = Task::where('company_id', $company->id)
                ->with(['fundedByInvestor:id,name', 'withdrawalRequest:id,request_number,status']);
        }

        // Filter by status
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Search in task_number, external_task_id, title
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('task_number', 'like', "%{$search}%")
                  ->orWhere('external_task_id', 'like', "%{$search}%")
                  ->orWhere('title', 'like', "%{$search}%");
            });
        }

        // Date range filter
        if ($dateFrom = $request->input('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }
        if ($dateTo = $request->input('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = min((int) $request->input('per_page', 15), 100);
        $tasks = $query->latest()->paginate($perPage);

        $formattedItems = array_map(fn($t) => $this->formatTaskResponse($t), $tasks->items());

        return $this->success(
            $formattedItems,
            $isTest ? 'تم استرجاع قائمة المهام التجريبية (Sandbox) بنجاح' : 'تم استرجاع قائمة المهام بنجاح',
            200,
            [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
                'environment' => $isTest ? 'test' : 'live',
            ]
        );
    }

    /**
     * Dispatch / Create a single task for funding.
     */
    public function store(Request $request): JsonResponse
    {
        $company = $this->requireCompany($request);
        $isTest = $this->isTestMode($request);

        $validator = Validator::make($request->all(), [
            'external_task_id' => 'required|string|max:100',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'pickup_city' => 'required|string|max:100',
            'pickup_address' => 'required|string|max:255',
            'pickup_lat' => 'nullable|numeric|between:-90,90',
            'pickup_lng' => 'nullable|numeric|between:-180,180',
            'dropoff_city' => 'required|string|max:100',
            'dropoff_address' => 'required|string|max:255',
            'dropoff_lat' => 'nullable|numeric|between:-90,90',
            'dropoff_lng' => 'nullable|numeric|between:-180,180',
            'funding_amount' => 'required|numeric|min:50|max:500000',
            'company_commission_rate' => 'nullable|numeric|min:1|max:50',
            'estimated_delivery_time' => 'nullable|string|max:100',
            'duration_minutes' => 'nullable|integer|min:10|max:14400',
            'expires_in_minutes' => 'nullable|integer|min:5|max:1440',
            'metadata' => 'nullable|array',
        ], [
            'external_task_id.required' => 'حقل معرف الشحنة الخارجي (external_task_id) إلزامي.',
            'title.required' => 'حقل عنوان المهمة (title) إلزامي.',
            'pickup_city.required' => 'حقل مدينة الاستلام (pickup_city) إلزامي.',
            'pickup_address.required' => 'حقل عنوان الاستلام (pickup_address) إلزامي.',
            'dropoff_city.required' => 'حقل مدينة التسليم (dropoff_city) إلزامي.',
            'dropoff_address.required' => 'حقل عنوان التسليم (dropoff_address) إلزامي.',
            'funding_amount.required' => 'حقل مبلغ التمويل المطلوب (funding_amount) إلزامي.',
            'funding_amount.min' => 'الحد الأدنى لقيمة التمويل هو 50 ريال سعودي.',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات الطلب غير صالحة', 422, $validator->errors(), 'VALIDATION_FAILED');
        }

        $fundingAmount = (float) $request->input('funding_amount');
        $commissionRate = (float) ($request->input('company_commission_rate') ?? $company->platform_commission_rate ?? 12.00);
        $platformCommissionAmount = round($fundingAmount * ($commissionRate / 100), 2);
        $expiresInMinutes = (int) ($request->input('expires_in_minutes') ?? 60);
        $expiresAt = now()->addMinutes($expiresInMinutes);
        $deliveryTime = $request->input('estimated_delivery_time') ?? ($request->input('duration_minutes') ? $request->input('duration_minutes') . ' دقيقة' : '4 ساعات');

        // ==========================================
        // 1. Sandbox / Test Mode Handler
        // ==========================================
        if ($isTest) {
            $existing = TestTask::where('company_id', $company->id)
                ->where('external_task_id', $request->input('external_task_id'))
                ->first();

            if ($existing) {
                return $this->error(
                    "معرف الشحنة التجريبي ({$request->input('external_task_id')}) مسجل مسبقاً في بيئة الاختبار برقم #{$existing->task_number}.",
                    409,
                    ['external_task_id' => 'Already exists in Sandbox'],
                    'DUPLICATE_EXTERNAL_TASK_ID'
                );
            }

            $testTask = TestTask::create([
                'company_id' => $company->id,
                'external_task_id' => $request->input('external_task_id'),
                'task_number' => TestTask::generateTaskNumber(),
                'title' => $request->input('title'),
                'description' => $request->input('description'),
                'pickup_city' => $request->input('pickup_city'),
                'pickup_address' => $request->input('pickup_address'),
                'pickup_lat' => $request->input('pickup_lat'),
                'pickup_lng' => $request->input('pickup_lng'),
                'dropoff_city' => $request->input('dropoff_city'),
                'dropoff_address' => $request->input('dropoff_address'),
                'dropoff_lat' => $request->input('dropoff_lat'),
                'dropoff_lng' => $request->input('dropoff_lng'),
                'funding_amount' => $fundingAmount,
                'company_commission_rate' => $commissionRate,
                'platform_commission_amount' => $platformCommissionAmount,
                'estimated_delivery_time' => $deliveryTime,
                'expires_at' => $expiresAt,
                'status' => 'available',
                'is_mock_funded' => false,
                'metadata' => array_merge(
                    $request->input('metadata', []),
                    [
                        'environment' => 'test',
                        'sandbox' => true,
                        'ingested_via' => 'api_v1_sandbox',
                        'api_key_id' => $request->attributes->get('apiKey')?->id,
                        'created_ip' => $request->ip(),
                    ]
                ),
            ]);

            return $this->success(
                $this->formatTaskResponse($testTask),
                'تم إرسال ونشر المهمة التجريبية بنجاح في بيئة الاختبار (Sandbox). لن تظهر هذه المهمة في سوق المستثمرين.',
                201
            );
        }

        // ==========================================
        // 2. Production / Live Mode Handler
        // ==========================================
        $existing = Task::where('company_id', $company->id)
            ->where('external_task_id', $request->input('external_task_id'))
            ->first();

        if ($existing) {
            return $this->error(
                "معرف الشحنة الخارجي ({$request->input('external_task_id')}) مسجل مسبقاً في النظام برقم مهمة #{$existing->task_number}.",
                409,
                ['external_task_id' => 'Already exists'],
                'DUPLICATE_EXTERNAL_TASK_ID'
            );
        }

        $task = Task::create([
            'company_id' => $company->id,
            'external_task_id' => $request->input('external_task_id'),
            'task_number' => Task::generateTaskNumber(),
            'title' => $request->input('title'),
            'description' => $request->input('description'),
            'pickup_city' => $request->input('pickup_city'),
            'pickup_address' => $request->input('pickup_address'),
            'pickup_lat' => $request->input('pickup_lat'),
            'pickup_lng' => $request->input('pickup_lng'),
            'dropoff_city' => $request->input('dropoff_city'),
            'dropoff_address' => $request->input('dropoff_address'),
            'dropoff_lat' => $request->input('dropoff_lat'),
            'dropoff_lng' => $request->input('dropoff_lng'),
            'funding_amount' => $fundingAmount,
            'company_commission_rate' => $commissionRate,
            'platform_commission_amount' => $platformCommissionAmount,
            'estimated_delivery_time' => $deliveryTime,
            'expires_at' => $expiresAt,
            'status' => 'available',
            'metadata' => array_merge(
                $request->input('metadata', []),
                [
                    'environment' => 'live',
                    'ingested_via' => 'api_v1',
                    'api_key_id' => $request->attributes->get('apiKey')?->id,
                    'created_ip' => $request->ip(),
                ]
            ),
        ]);

        // Audit Log
        $this->auditLogService->log(
            'created',
            $task,
            [],
            $task->toArray(),
            "رفع مهمة جديدة برمجياً عبر API: {$task->task_number} (الخارجي: {$task->external_task_id})"
        );

        // Notify Admins
        NotificationDispatcherService::dispatch(
            'admin.task_cancelled',
            "مهمة لوجستية جديدة عبر API: #{$task->task_number}",
            "قامت الشركة اللوجستية ({$company->company_name}) برفع مهمة جديدة للتمويل بقيمة {$fundingAmount} ر.س.",
            route('admin.tasks.index', [], false),
            ['task_id' => $task->id, 'company_id' => $company->id]
        );

        return $this->success(
            $this->formatTaskResponse($task),
            'تم إرسال ونشر المهمة بنجاح في سوق التمويل',
            201
        );
    }

    /**
     * Dispatch multiple tasks in a single batch request.
     */
    public function storeBatch(Request $request): JsonResponse
    {
        $company = $this->requireCompany($request);
        $isTest = $this->isTestMode($request);

        $validator = Validator::make($request->all(), [
            'tasks' => 'required|array|min:1|max:50',
            'tasks.*.external_task_id' => 'required|string|max:100',
            'tasks.*.title' => 'required|string|max:255',
            'tasks.*.description' => 'nullable|string',
            'tasks.*.pickup_city' => 'required|string|max:100',
            'tasks.*.pickup_address' => 'required|string|max:255',
            'tasks.*.dropoff_city' => 'required|string|max:100',
            'tasks.*.dropoff_address' => 'required|string|max:255',
            'tasks.*.funding_amount' => 'required|numeric|min:50|max:500000',
            'tasks.*.company_commission_rate' => 'nullable|numeric|min:1|max:50',
            'tasks.*.estimated_delivery_time' => 'nullable|string|max:100',
            'tasks.*.expires_in_minutes' => 'nullable|integer|min:5|max:1440',
            'tasks.*.metadata' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات حزمة المهام غير صالحة', 422, $validator->errors(), 'VALIDATION_FAILED');
        }

        $items = $request->input('tasks');
        $createdTasks = [];
        $failedItems = [];

        DB::beginTransaction();
        try {
            foreach ($items as $index => $item) {
                $fundingAmount = (float) $item['funding_amount'];
                $commissionRate = (float) ($item['company_commission_rate'] ?? $company->platform_commission_rate ?? 12.00);
                $platformCommissionAmount = round($fundingAmount * ($commissionRate / 100), 2);
                $expiresInMinutes = (int) ($item['expires_in_minutes'] ?? 60);

                if ($isTest) {
                    $existing = TestTask::where('company_id', $company->id)
                        ->where('external_task_id', $item['external_task_id'])
                        ->first();

                    if ($existing) {
                        $failedItems[] = [
                            'index' => $index,
                            'external_task_id' => $item['external_task_id'],
                            'error' => 'معرف الشحنة مسجل مسبقاً في بيئة الاختبار',
                        ];
                        continue;
                    }

                    $task = TestTask::create([
                        'company_id' => $company->id,
                        'external_task_id' => $item['external_task_id'],
                        'task_number' => TestTask::generateTaskNumber(),
                        'title' => $item['title'],
                        'description' => $item['description'] ?? null,
                        'pickup_city' => $item['pickup_city'],
                        'pickup_address' => $item['pickup_address'],
                        'pickup_lat' => $item['pickup_lat'] ?? null,
                        'pickup_lng' => $item['pickup_lng'] ?? null,
                        'dropoff_city' => $item['dropoff_city'],
                        'dropoff_address' => $item['dropoff_address'],
                        'dropoff_lat' => $item['dropoff_lat'] ?? null,
                        'dropoff_lng' => $item['dropoff_lng'] ?? null,
                        'funding_amount' => $fundingAmount,
                        'company_commission_rate' => $commissionRate,
                        'platform_commission_amount' => $platformCommissionAmount,
                        'estimated_delivery_time' => $item['estimated_delivery_time'] ?? '4 ساعات',
                        'expires_at' => now()->addMinutes($expiresInMinutes),
                        'status' => 'available',
                        'is_mock_funded' => false,
                        'metadata' => array_merge(
                            $item['metadata'] ?? [],
                            ['batch_created' => true, 'environment' => 'test', 'sandbox' => true]
                        ),
                    ]);
                } else {
                    $existing = Task::where('company_id', $company->id)
                        ->where('external_task_id', $item['external_task_id'])
                        ->first();

                    if ($existing) {
                        $failedItems[] = [
                            'index' => $index,
                            'external_task_id' => $item['external_task_id'],
                            'error' => 'معرف الشحنة مسجل مسبقاً في النظام',
                        ];
                        continue;
                    }

                    $task = Task::create([
                        'company_id' => $company->id,
                        'external_task_id' => $item['external_task_id'],
                        'task_number' => Task::generateTaskNumber(),
                        'title' => $item['title'],
                        'description' => $item['description'] ?? null,
                        'pickup_city' => $item['pickup_city'],
                        'pickup_address' => $item['pickup_address'],
                        'pickup_lat' => $item['pickup_lat'] ?? null,
                        'pickup_lng' => $item['pickup_lng'] ?? null,
                        'dropoff_city' => $item['dropoff_city'],
                        'dropoff_address' => $item['dropoff_address'],
                        'dropoff_lat' => $item['dropoff_lat'] ?? null,
                        'dropoff_lng' => $item['dropoff_lng'] ?? null,
                        'funding_amount' => $fundingAmount,
                        'company_commission_rate' => $commissionRate,
                        'platform_commission_amount' => $platformCommissionAmount,
                        'estimated_delivery_time' => $item['estimated_delivery_time'] ?? '4 ساعات',
                        'expires_at' => now()->addMinutes($expiresInMinutes),
                        'status' => 'available',
                        'metadata' => array_merge(
                            $item['metadata'] ?? [],
                            ['batch_created' => true, 'ingested_via' => 'api_v1_batch']
                        ),
                    ]);
                }

                $createdTasks[] = $this->formatTaskResponse($task);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('حدث خطأ أثناء معالجة حزمة المهام: ' . $e->getMessage(), 500);
        }

        return $this->success(
            [
                'environment' => $isTest ? 'test' : 'live',
                'total_submitted' => count($items),
                'successful_count' => count($createdTasks),
                'failed_count' => count($failedItems),
                'tasks' => $createdTasks,
                'failures' => $failedItems,
            ],
            "تمت معالجة حزمة المهام بنجاح (" . count($createdTasks) . " تم إنشاؤها بنجاح)",
            201
        );
    }

    /**
     * Get single task details by ID, external_task_id, or task_number.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $company = $this->requireCompany($request);
        $isTest = $this->isTestMode($request);

        $task = $this->findCompanyTask($company->id, $id, $isTest);

        if (!$task) {
            return $this->error('المهمة المطلوبة غير موجودة أو لا تتبع لشركتكم.', 404, null, 'TASK_NOT_FOUND');
        }

        return $this->success(
            $this->formatTaskResponse($task),
            'تم استرجاع تفاصيل المهمة بنجاح'
        );
    }

    /**
     * Cancel a task before funding.
     */
    public function cancel(Request $request, string $id): JsonResponse
    {
        $company = $this->requireCompany($request);
        $isTest = $this->isTestMode($request);

        $task = $this->findCompanyTask($company->id, $id, $isTest);

        if (!$task) {
            return $this->error('المهمة المطلوبة غير موجودة.', 404, null, 'TASK_NOT_FOUND');
        }

        if ($task->status !== 'available') {
            return $this->error(
                "لا يمكن إلغاء هذه المهمة لأن حالتها الحالية هي ({$task->status}). يُسمح بالإلغاء فقط عندما تكون المهمة متاحة (available) ولم يتم تمويلها بعد.",
                400,
                ['current_status' => $task->status],
                'TASK_CANNOT_BE_CANCELLED'
            );
        }

        $task->status = 'cancelled_by_company';
        $task->save();

        if (!$isTest) {
            $this->auditLogService->log(
                'status_changed',
                $task,
                ['status' => 'available'],
                ['status' => 'cancelled_by_company'],
                "إلغاء المهمة عبر API: #{$task->task_number}"
            );
        }

        return $this->success(
            $this->formatTaskResponse($task),
            "تم إلغاء المهمة #{$task->task_number} بنجاح وسحبها من سوق التمويل."
        );
    }

    /**
     * Mark a funded task as completed/delivered.
     */
    public function complete(Request $request, string $id): JsonResponse
    {
        $company = $this->requireCompany($request);
        $isTest = $this->isTestMode($request);

        $task = $this->findCompanyTask($company->id, $id, $isTest);

        if (!$task) {
            return $this->error('المهمة المطلوبة غير موجودة.', 404, null, 'TASK_NOT_FOUND');
        }

        if ($task->status !== 'funded') {
            return $this->error(
                "لا يمكن تأكيد اكتمال المهمة إلا بعد أن تكون ممولة بالكامل (funded). الحالة الحالية: ({$task->status}).",
                400,
                ['current_status' => $task->status],
                'INVALID_TASK_STATUS'
            );
        }

        $task->status = 'completed';
        $task->save();

        if (!$isTest) {
            $this->auditLogService->log(
                'status_changed',
                $task,
                ['status' => 'funded'],
                ['status' => 'completed'],
                "تأكيد إكمال وتسليم المهمة عبر API: #{$task->task_number}"
            );
        }

        return $this->success(
            $this->formatTaskResponse($task),
            "تم تأكيد اكتمال وتسليم الشحنة بنجاح للمهمة #{$task->task_number}."
        );
    }

    /**
     * Update tracking or shipment status.
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $company = $this->requireCompany($request);
        $isTest = $this->isTestMode($request);

        $task = $this->findCompanyTask($company->id, $id, $isTest);

        if (!$task) {
            return $this->error('المهمة المطلوبة غير موجودة.', 404, null, 'TASK_NOT_FOUND');
        }

        $validator = Validator::make($request->all(), [
            'tracking_status' => 'required|in:dispatched,in_transit,out_for_delivery,delivered,failed_delivery',
            'notes' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return $this->error('بيانات التتبع غير صالحة', 422, $validator->errors());
        }

        $meta = $task->metadata ?? [];
        $history = $meta['tracking_history'] ?? [];

        $history[] = [
            'status' => $request->input('tracking_status'),
            'notes' => $request->input('notes'),
            'lat' => $request->input('latitude'),
            'lng' => $request->input('longitude'),
            'timestamp' => now()->toIso8601String(),
        ];

        $meta['tracking_history'] = $history;
        $meta['last_tracking_status'] = $request->input('tracking_status');
        $task->metadata = $meta;
        $task->save();

        return $this->success(
            $this->formatTaskResponse($task),
            'تم تحديث بيانات التتبع والشحن بنجاح'
        );
    }

    /**
     * Simulate/Mock funding for a test task in Sandbox mode.
     * Triggers the Webhook 'task.funded' to company system.
     */
    public function mockFund(Request $request, string $id): JsonResponse
    {
        if (!$this->isTestMode($request)) {
            return $this->error(
                'محاكاة التمويل متاحة حصرياً في بيئة الاختبار (Sandbox Mode). في بيئة الإنتاج المباشرة، التمويل يتم من خلال المستثمرين الحقيقيين فقط.',
                403,
                null,
                'MOCK_FUND_NOT_ALLOWED_IN_LIVE'
            );
        }

        $company = $this->requireCompany($request);
        /** @var TestTask|null $testTask */
        $testTask = $this->findCompanyTask($company->id, $id, true);

        if (!$testTask) {
            return $this->error('المهمة التجريبية غير موجودة.', 404, null, 'TEST_TASK_NOT_FOUND');
        }

        if ($testTask->status !== 'available') {
            return $this->error(
                "لا يمكن محاكاة تمويل المهمة لأن حالتها الحالية هي ({$testTask->status}). التمويل متاح فقط للمهام المتاحة (available).",
                400,
                ['current_status' => $testTask->status],
                'INVALID_TEST_TASK_STATUS'
            );
        }

        $investorName = $request->input('investor_name', 'مستثمر تجريبي (Sandbox Investor)');

        $testTask->status = 'funded';
        $testTask->is_mock_funded = true;
        $testTask->mock_funded_at = now();
        $testTask->mock_investor_name = $investorName;
        $testTask->save();

        // Dispatch simulated Webhook to company webhook URL if configured
        $webhookSent = false;
        if (!empty($company->webhook_url)) {
            $webhookSent = $this->webhookService->dispatchTaskFunded($testTask);
        }

        return $this->success(
            array_merge(
                $this->formatTaskResponse($testTask),
                [
                    'webhook_simulation' => [
                        'dispatched' => !empty($company->webhook_url),
                        'webhook_url' => $company->webhook_url,
                        'success' => $webhookSent,
                    ]
                ]
            ),
            "تمت محاكاة تمويل المهمة بنجاح بنمط الـ Sandbox" . ($webhookSent ? " وإرسال إشعار الـ Webhook إلى نظامكم." : ".")
        );
    }

    /**
     * Helper to find task by database id, external_task_id, or task_number.
     */
    protected function findCompanyTask(int $companyId, string $identifier, bool $isTest = false): Task|TestTask|null
    {
        $modelClass = $isTest ? TestTask::class : Task::class;

        return $modelClass::where('company_id', $companyId)
            ->where(function ($q) use ($identifier) {
                if (is_numeric($identifier)) {
                    $q->where('id', (int) $identifier);
                }
                $q->orWhere('external_task_id', $identifier)
                  ->orWhere('task_number', $identifier);
            })
            ->first();
    }

    /**
     * Format task model into clean API response array.
     */
    protected function formatTaskResponse(Task|TestTask $task): array
    {
        $isTest = ($task instanceof TestTask);

        $investorData = [
            'funded' => false,
        ];

        if ($isTest && $task->is_mock_funded) {
            $investorData = [
                'funded' => true,
                'funded_at' => $task->mock_funded_at?->toIso8601String(),
                'investor_name' => $task->mock_investor_name,
                'is_mock' => true,
            ];
        } elseif (!$isTest && $task->funded_by_investor_id) {
            $investorData = [
                'funded' => true,
                'funded_at' => $task->funded_at?->toIso8601String(),
                'investor_id' => $task->funded_by_investor_id,
                'is_mock' => false,
            ];
        }

        return [
            'id' => $task->id,
            'task_number' => $task->task_number,
            'external_task_id' => $task->external_task_id,
            'environment' => $isTest ? 'test' : 'live',
            'sandbox' => $isTest,
            'title' => $task->title,
            'description' => $task->description,
            'status' => $task->status,
            'funding' => [
                'amount' => (float) $task->funding_amount,
                'currency' => 'SAR',
                'commission_rate' => (float) $task->company_commission_rate,
                'platform_commission_amount' => (float) $task->platform_commission_amount,
                'net_amount' => (float) ($task->funding_amount - $task->platform_commission_amount),
            ],
            'locations' => [
                'pickup' => [
                    'city' => $task->pickup_city,
                    'address' => $task->pickup_address,
                    'lat' => $task->pickup_lat ? (float) $task->pickup_lat : null,
                    'lng' => $task->pickup_lng ? (float) $task->pickup_lng : null,
                ],
                'dropoff' => [
                    'city' => $task->dropoff_city,
                    'address' => $task->dropoff_address,
                    'lat' => $task->dropoff_lat ? (float) $task->dropoff_lat : null,
                    'lng' => $task->dropoff_lng ? (float) $task->dropoff_lng : null,
                ],
            ],
            'timestamps' => [
                'created_at' => $task->created_at?->toIso8601String(),
                'expires_at' => $task->expires_at?->toIso8601String(),
                'is_expired' => $task->expires_at ? $task->expires_at->isPast() : false,
                'funded_at' => $isTest ? $task->mock_funded_at?->toIso8601String() : $task->funded_at?->toIso8601String(),
                'estimated_delivery_time' => $task->estimated_delivery_time,
            ],
            'investor' => $investorData,
            'metadata' => $task->metadata,
        ];
    }
}
