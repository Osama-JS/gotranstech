<?php

namespace App\Http\Controllers\Company;

use App\Http\Controllers\Controller;
use App\Models\CompanyDebt;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CompanyDebtController extends Controller
{
    public function index(): Response
    {
        $company = Auth::user()->companyProfile;
        $debtWallet = Auth::user()->company_debt_wallet;

        $debts = CompanyDebt::where('company_id', $company->id)
            ->with('withdrawalRequest')
            ->orderBy('due_date', 'asc')
            ->paginate(10);

        $totalOutstanding = (float) CompanyDebt::where('company_id', $company->id)
            ->where('status', '!=', 'paid')
            ->sum('remaining_amount');

        $totalPaid = (float) CompanyDebt::where('company_id', $company->id)
            ->sum('paid_amount');

        return Inertia::render('Company/Debts/Index', [
            'debts' => $debts,
            'debtWallet' => $debtWallet,
            'totalOutstanding' => $totalOutstanding,
            'totalPaid' => $totalPaid,
        ]);
    }
}
