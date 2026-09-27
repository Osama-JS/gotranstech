<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Services\InvestmentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestorTaskMarketController extends Controller
{
    public function __construct(
        protected InvestmentService $investmentService
    ) {}

    public function index(Request $request): Response
    {
        $query = Task::with('company')
            ->where('status', 'available')
            ->where('expires_at', '>', now());

        if ($city = $request->input('city')) {
            $query->where(function ($q) use ($city) {
                $q->where('pickup_city', 'like', "%{$city}%")
                  ->orWhere('dropoff_city', 'like', "%{$city}%");
            });
        }

        if ($minAmount = $request->input('min_amount')) {
            $query->where('funding_amount', '>=', $minAmount);
        }

        if ($maxAmount = $request->input('max_amount')) {
            $query->where('funding_amount', '<=', $maxAmount);
        }

        $tasks = $query->orderBy('expires_at', 'asc')->paginate(12)->withQueryString();

        $user = Auth::user();
        $investmentWallet = $user->investment_wallet;
        $investorProfile = $user->investorProfile;

        return Inertia::render('Investor/Market/Index', [
            'tasks' => $tasks,
            'walletBalance' => (float) $investmentWallet->available_balance,
            'investorShareRate' => $investorProfile ? (float) $investorProfile->platform_commission_share_rate : 70.0,
            'filters' => $request->only(['city', 'min_amount', 'max_amount']),
        ]);
    }

    public function fund(Request $request, int $id)
    {
        $task = Task::findOrFail($id);
        $user = Auth::user();

        try {
            $investment = $this->investmentService->fundTask($task, $user);
            return back()->with('success', "تم تمويل المهمة #{$task->task_number} بنجاح! تم قيد أرباح العمولة وقدرها {$investment->investor_commission_amount} ر.س في محفظة العمولات.");
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }
}
