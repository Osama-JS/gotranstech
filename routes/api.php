<?php

use App\Http\Controllers\Api\V1\CompanyApiController;
use App\Http\Controllers\Api\V1\TaskApiController;
use App\Http\Controllers\Api\V1\WebhookApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Logistics Companies B2B API v1
|--------------------------------------------------------------------------
*/
Route::prefix('v1')->group(function () {
    // Public Health Check with general rate limiter (60/min)
    Route::get('/ping', [CompanyApiController::class, 'ping'])
        ->middleware('throttle:60,1')
        ->name('api.v1.ping');

    // Authenticated Logistics Routes (Protected via Bearer API Key or Company Session + Rate Limiter)
    Route::middleware([
        \Illuminate\Cookie\Middleware\EncryptCookies::class,
        \Illuminate\Session\Middleware\StartSession::class,
        'company.api.auth',
        'throttle:api',
    ])->group(function () {
        // Tasks Operations (Single & Batch Dispatch, Query, Cancel, Complete, Tracking)
        Route::get('/tasks', [TaskApiController::class, 'index'])->name('api.v1.tasks.index');
        Route::post('/tasks', [TaskApiController::class, 'store'])->name('api.v1.tasks.store');
        Route::post('/tasks/batch', [TaskApiController::class, 'storeBatch'])
            ->middleware('throttle:api-heavy')
            ->name('api.v1.tasks.batch');
        Route::get('/tasks/{id}', [TaskApiController::class, 'show'])->name('api.v1.tasks.show');
        Route::post('/tasks/{id}/cancel', [TaskApiController::class, 'cancel'])->name('api.v1.tasks.cancel');
        Route::post('/tasks/{id}/complete', [TaskApiController::class, 'complete'])->name('api.v1.tasks.complete');
        Route::post('/tasks/{id}/update-status', [TaskApiController::class, 'updateStatus'])->name('api.v1.tasks.update-status');
        Route::post('/tasks/{id}/mock-fund', [TaskApiController::class, 'mockFund'])->name('api.v1.tasks.mock-fund');

        // Webhook Integrations & Testing (Protected with strict rate limiter)
        Route::post('/webhooks/test', [WebhookApiController::class, 'test'])
            ->middleware('throttle:api-heavy')
            ->name('api.v1.webhooks.test');
        Route::get('/webhooks/events', [WebhookApiController::class, 'events'])->name('api.v1.webhooks.events');
    });
});
