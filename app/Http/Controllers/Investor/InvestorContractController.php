<?php

namespace App\Http\Controllers\Investor;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class InvestorContractController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $contracts = Contract::where('user_id', $user->id)
            ->latest()
            ->get();

        return Inertia::render('Investor/Contracts/Index', [
            'contracts' => $contracts,
        ]);
    }

    public function show(int $id): Response
    {
        $user = Auth::user();
        $contract = Contract::where('user_id', $user->id)
            ->findOrFail($id);

        return Inertia::render('Investor/Contracts/Show', [
            'contract' => $contract,
        ]);
    }
}
