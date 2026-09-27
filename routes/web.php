<?php

use App\Http\Controllers\Admin\AdminAnalyticsController;
use App\Http\Controllers\Admin\AdminAuditLogController;
use App\Http\Controllers\Admin\AdminCompanyController;
use App\Http\Controllers\Admin\AdminContractController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminDepositController;
use App\Http\Controllers\Admin\AdminFormTemplateController;
use App\Http\Controllers\Admin\AdminInvestorController;
use App\Http\Controllers\Admin\AdminLandingCmsController;
use App\Http\Controllers\Admin\AdminQuickSearchController;
use App\Http\Controllers\Admin\AdminSettingsController;
use App\Http\Controllers\Admin\AdminSystemHealthController;
use App\Http\Controllers\Admin\AdminTaskController;
use App\Http\Controllers\Admin\AdminWithdrawalController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Company\CompanyAnalyticsController;
use App\Http\Controllers\Company\CompanyApiKeyController;
use App\Http\Controllers\Company\CompanyDashboardController;
use App\Http\Controllers\Company\CompanyDebtController;
use App\Http\Controllers\Company\CompanyTaskController;
use App\Http\Controllers\Company\CompanyWalletController;
use App\Http\Controllers\Company\CompanyWithdrawalController;
use App\Http\Controllers\Investor\InvestorAnalyticsController;
use App\Http\Controllers\Investor\InvestorContractController;
use App\Http\Controllers\Investor\InvestorDashboardController;
use App\Http\Controllers\Investor\InvestorTaskMarketController;
use App\Http\Controllers\Investor\InvestorWalletController;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserOnboardingController;
use Illuminate\Support\Facades\Route;

// Public Landing Page
Route::get('/', [LandingPageController::class, 'index'])->name('landing');
Route::post('/locale/switch', [AuthController::class, 'switchLocale'])->name('locale.switch');

// Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
    Route::post('/register', [AuthController::class, 'register']);
});

Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth')->name('logout');

// User Profile Routes (Accessible to Admin, Investor, Company)
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password.update');
});

// Shared User Onboarding Routes (Investors & Companies)
Route::middleware(['auth'])->prefix('portal')->name('portal.')->group(function () {
    Route::post('/agreement/sign', [UserOnboardingController::class, 'signAgreement'])->name('agreement.sign');
    Route::post('/additional-data/submit', [UserOnboardingController::class, 'submitAdditionalData'])->name('additional-data.submit');
});

// HyperPay Callback (Public / Protected)
Route::match(['get', 'post'], '/payments/hyperpay/callback', [InvestorWalletController::class, 'hyperPayCallback'])->name('payments.hyperpay.callback');

// -----------------------------------------------------------------------------
// Admin Portal (Protected by Auth + Role/Permission)
// -----------------------------------------------------------------------------
Route::middleware(['auth'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('/quick-search', [AdminQuickSearchController::class, 'search'])->name('quick-search');

    // Investors Management
    Route::get('/investors', [AdminInvestorController::class, 'index'])->name('investors.index');
    Route::post('/investors', [AdminInvestorController::class, 'store'])->name('investors.store');
    Route::get('/investors/{id}', [AdminInvestorController::class, 'show'])->name('investors.show');
    Route::put('/investors/{id}', [AdminInvestorController::class, 'update'])->name('investors.update');
    Route::post('/investors/{id}/reset-password', [AdminInvestorController::class, 'resetPassword'])->name('investors.reset-password');
    Route::post('/investors/{id}/commission-rate', [AdminInvestorController::class, 'updateCommissionRate'])->name('investors.commission');
    Route::post('/investors/{id}/toggle-status', [AdminInvestorController::class, 'toggleStatus'])->name('investors.status');

    // Companies Management
    Route::get('/companies', [AdminCompanyController::class, 'index'])->name('companies.index');
    Route::post('/companies', [AdminCompanyController::class, 'store'])->name('companies.store');
    Route::get('/companies/{id}', [AdminCompanyController::class, 'show'])->name('companies.show');
    Route::put('/companies/{id}', [AdminCompanyController::class, 'update'])->name('companies.update');
    Route::post('/companies/{id}/reset-password', [AdminCompanyController::class, 'resetPassword'])->name('companies.reset-password');
    Route::post('/companies/{id}/toggle-status', [AdminCompanyController::class, 'toggleStatus'])->name('companies.status');
    Route::post('/companies/{id}/api-key', [AdminCompanyController::class, 'generateApiKey'])->name('companies.api-key');
    Route::post('/companies/{id}/commission-rate', [AdminCompanyController::class, 'updateCommissionRate'])->name('companies.commission');

    // Logistics Tasks
    Route::get('/tasks', [AdminTaskController::class, 'index'])->name('tasks.index');
    Route::get('/tasks/{id}', [AdminTaskController::class, 'show'])->name('tasks.show');

    // Bank Deposits
    Route::get('/deposits', [AdminDepositController::class, 'index'])->name('deposits.index');
    Route::get('/deposits/{id}/receipt', [AdminDepositController::class, 'viewReceipt'])->name('deposits.receipt');
    Route::post('/deposits/{id}/approve', [AdminDepositController::class, 'approve'])->name('deposits.approve');
    Route::post('/deposits/{id}/reject', [AdminDepositController::class, 'reject'])->name('deposits.reject');

    // Withdrawal Requests & Debts
    Route::get('/withdrawals', [AdminWithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::get('/withdrawals/{id}', [AdminWithdrawalController::class, 'show'])->name('withdrawals.show');
    Route::post('/withdrawals/{id}/approve', [AdminWithdrawalController::class, 'approve'])->name('withdrawals.approve');
    Route::post('/withdrawals/{id}/reject', [AdminWithdrawalController::class, 'reject'])->name('withdrawals.reject');
    Route::get('/withdrawals/{id}/pdf', [AdminWithdrawalController::class, 'downloadPdf'])->name('withdrawals.pdf');

    // Contracts
    Route::get('/contracts', [AdminContractController::class, 'index'])->name('contracts.index');
    Route::get('/contracts/create', [AdminContractController::class, 'create'])->name('contracts.create');
    Route::post('/contracts', [AdminContractController::class, 'store'])->name('contracts.store');
    Route::get('/contracts/{id}', [AdminContractController::class, 'show'])->name('contracts.show');
    Route::get('/contracts/{id}/pdf', [AdminContractController::class, 'downloadPdf'])->name('contracts.pdf');
    Route::get('/contracts/{id}/view-pdf', [AdminContractController::class, 'viewPdf'])->name('contracts.view-pdf');

    // Dynamic Form Templates (الحقول الإضافية)
    Route::get('/form-templates', [AdminFormTemplateController::class, 'index'])->name('form-templates.index');
    Route::post('/form-templates', [AdminFormTemplateController::class, 'store'])->name('form-templates.store');
    Route::put('/form-templates/{id}', [AdminFormTemplateController::class, 'update'])->name('form-templates.update');
    Route::delete('/form-templates/{id}', [AdminFormTemplateController::class, 'destroy'])->name('form-templates.destroy');
    Route::post('/form-templates/{id}/fields', [AdminFormTemplateController::class, 'saveFields'])->name('form-templates.fields');

    // Roles & Permissions Management
    Route::get('/roles', [\App\Http\Controllers\Admin\AdminRoleController::class, 'index'])->name('roles.index');
    Route::post('/roles', [\App\Http\Controllers\Admin\AdminRoleController::class, 'store'])->name('roles.store');
    Route::put('/roles/{id}', [\App\Http\Controllers\Admin\AdminRoleController::class, 'update'])->name('roles.update');
    Route::delete('/roles/{id}', [\App\Http\Controllers\Admin\AdminRoleController::class, 'destroy'])->name('roles.destroy');

    // Admins & Staff Management
    Route::get('/admins', [\App\Http\Controllers\Admin\AdminAdminController::class, 'index'])->name('admins.index');
    Route::post('/admins', [\App\Http\Controllers\Admin\AdminAdminController::class, 'store'])->name('admins.store');
    Route::put('/admins/{id}', [\App\Http\Controllers\Admin\AdminAdminController::class, 'update'])->name('admins.update');
    Route::post('/admins/{id}/reset-password', [\App\Http\Controllers\Admin\AdminAdminController::class, 'resetPassword'])->name('admins.reset-password');
    Route::post('/admins/{id}/toggle-status', [\App\Http\Controllers\Admin\AdminAdminController::class, 'toggleStatus'])->name('admins.status');

    // Settings (Encrypted)
    Route::get('/settings', [AdminSettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [AdminSettingsController::class, 'update'])->name('settings.update');
    Route::post('/settings/test-email', [AdminSettingsController::class, 'testEmail'])->name('settings.test-email');

    // Landing Page CMS & Platform Branding
    Route::get('/cms', [AdminLandingCmsController::class, 'index'])->name('cms.index');
    Route::post('/cms/branding', [AdminLandingCmsController::class, 'updateBranding'])->name('cms.branding.update');
    Route::delete('/cms/branding/{type}', [AdminLandingCmsController::class, 'deleteBranding'])->name('cms.branding.delete');
    Route::put('/cms/{id}', [AdminLandingCmsController::class, 'update'])->name('cms.update');

    // Platform Analytics & Reports
    Route::get('/analytics', [AdminAnalyticsController::class, 'index'])->name('analytics.index');

    // Audit Logs
    Route::get('/audit-logs', [AdminAuditLogController::class, 'index'])->name('audit.index');

    // Server & Database Health Monitoring
    Route::get('/system-health', [AdminSystemHealthController::class, 'index'])->name('system-health.index');
    Route::post('/system-health/action', [AdminSystemHealthController::class, 'handleAction'])->name('system-health.action');
});

// -----------------------------------------------------------------------------
// Investor Portal
// -----------------------------------------------------------------------------
Route::middleware(['auth'])->prefix('investor')->name('investor.')->group(function () {
    Route::get('/dashboard', [InvestorDashboardController::class, 'index'])->name('dashboard');

    // Live Task Market & Funding
    Route::get('/market', [InvestorTaskMarketController::class, 'index'])->name('market.index');
    Route::post('/tasks/{id}/fund', [InvestorTaskMarketController::class, 'fund'])->name('tasks.fund');

    // Wallets (Separated: Investment Capital vs Commission Profits)
    Route::get('/wallets/investment', [InvestorWalletController::class, 'investmentWallet'])->name('wallet.investment');
    Route::get('/wallets/commission', [InvestorWalletController::class, 'commissionWallet'])->name('wallet.commission');
    Route::get('/wallet', [InvestorWalletController::class, 'index'])->name('wallet.index');
    Route::post('/wallet/deposit-bank', [InvestorWalletController::class, 'submitBankDeposit'])->name('wallet.deposit.bank');
    Route::get('/wallet/deposits/{id}/receipt', [InvestorWalletController::class, 'viewReceipt'])->name('wallet.deposits.receipt');
    Route::post('/wallet/hyperpay/checkout', [InvestorWalletController::class, 'prepareHyperPay'])->name('wallet.hyperpay.checkout');
    Route::post('/wallet/commission/withdraw', [InvestorWalletController::class, 'requestCommissionWithdrawal'])->name('wallet.commission.withdraw');

    // Contracts
    Route::get('/contracts', [InvestorContractController::class, 'index'])->name('contracts.index');
    Route::get('/contracts/{id}', [InvestorContractController::class, 'show'])->name('contracts.show');

    // Portfolio Analytics & Charts
    Route::get('/analytics', [InvestorAnalyticsController::class, 'index'])->name('analytics.index');
});

// -----------------------------------------------------------------------------
// Company Portal
// -----------------------------------------------------------------------------
Route::middleware(['auth'])->prefix('company')->name('company.')->group(function () {
    Route::get('/dashboard', [CompanyDashboardController::class, 'index'])->name('dashboard');

    // Operational Analytics & Charts
    Route::get('/analytics', [CompanyAnalyticsController::class, 'index'])->name('analytics.index');

    // Tasks Management
    Route::get('/tasks', [CompanyTaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks/{id}/cancel', [CompanyTaskController::class, 'cancel'])->name('tasks.cancel');

    // API & Webhooks
    Route::get('/api-settings', [CompanyApiKeyController::class, 'index'])->name('api.index');
    Route::post('/api-settings/generate', [CompanyApiKeyController::class, 'generate'])->name('api.generate');
    Route::post('/api-settings/webhook', [CompanyApiKeyController::class, 'updateWebhook'])->name('api.webhook');
    Route::post('/api-settings/webhook/test', [CompanyApiKeyController::class, 'testWebhook'])->name('api.webhook.test');
    Route::delete('/api-settings/{id}', [CompanyApiKeyController::class, 'revoke'])->name('api.revoke');

    // Wallets (Separated: Funding Disbursal vs Debt Obligations)
    Route::get('/wallets/funding', [CompanyWalletController::class, 'fundingWallet'])->name('wallet.funding');
    Route::get('/wallets/debt', [CompanyWalletController::class, 'debtWallet'])->name('wallet.debt');
    Route::post('/wallets/debt/repay', [CompanyWalletController::class, 'submitRepayment'])->name('wallet.debt.repay');

    // Withdrawals & PDF
    Route::get('/withdrawals', [CompanyWithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::post('/withdrawals', [CompanyWithdrawalController::class, 'store'])->name('withdrawals.store');
    Route::get('/withdrawals/{id}', [CompanyWithdrawalController::class, 'show'])->name('withdrawals.show');
    Route::get('/withdrawals/{id}/pdf', [CompanyWithdrawalController::class, 'downloadPdf'])->name('withdrawals.pdf');
    Route::get('/withdrawals/{id}/view-pdf', [CompanyWithdrawalController::class, 'viewPdf'])->name('withdrawals.view-pdf');

    // Debts & Repayments
    Route::get('/debts', [CompanyDebtController::class, 'index'])->name('debts.index');
});
