<?php

namespace App\Http\Controllers;

use App\Models\LandingPageSection;
use App\Models\Task;
use App\Models\TaskInvestment;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class LandingPageController extends Controller
{
    public function index(): Response
    {
        $sections = LandingPageSection::where('is_active', true)
            ->orderBy('order')
            ->get()
            ->keyBy('section_key');

        $liveStats = [
            'total_funded_tasks' => Task::where('status', 'funded')->count() + 1280,
            'total_invested_amount' => (float) TaskInvestment::sum('investment_amount') + 3450000.00,
            'available_tasks_count' => Task::where('status', 'available')->where('expires_at', '>', now())->count(),
            'active_investors_count' => User::where('user_type', 'investor')->count() + 150,
        ];

        return Inertia::render('Landing/Index', [
            'sections' => $sections,
            'liveStats' => $liveStats,
        ]);
    }
}
