<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Bank;

class BankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banks = [
            ['name' => 'البنك الأهلي السعودي (SNB)', 'name_en' => 'Saudi National Bank', 'code' => 'NCBKSAJE'],
            ['name' => 'مصرف الراجحي (Al Rajhi Bank)', 'name_en' => 'Al Rajhi Bank', 'code' => 'RJHISARI'],
            ['name' => 'بنك الرياض (Riyad Bank)', 'name_en' => 'Riyad Bank', 'code' => 'RIBLSARI'],
            ['name' => 'مصرف الإنماء (Alinma Bank)', 'name_en' => 'Alinma Bank', 'code' => 'INMASARI'],
            ['name' => 'البنك السعودي الأول (SAB)', 'name_en' => 'Saudi Awwal Bank', 'code' => 'SABBSARI'],
            ['name' => 'البنك العربي الوطني (ANB)', 'name_en' => 'Arab National Bank', 'code' => 'ARNBSARI'],
            ['name' => 'بنك البلاد (Bank Albilad)', 'name_en' => 'Bank Albilad', 'code' => 'ALBISARI'],
            ['name' => 'البنك السعودي الفرنسي (BSF)', 'name_en' => 'Banque Saudi Fransi', 'code' => 'BSFRSARI'],
            ['name' => 'البنك السعودي للاستثمار (SAIB)', 'name_en' => 'Saudi Investment Bank', 'code' => 'SIBCSARI'],
            ['name' => 'بنك الجزيرة (Bank AlJazira)', 'name_en' => 'Bank AlJazira', 'code' => 'BJAZSAJE'],
            ['name' => 'بنك الخليج الدولي - ميم (meem by GIB)', 'name_en' => 'Gulf International Bank (meem)', 'code' => 'GIBSSARI'],
            ['name' => 'بنك D360 الرقمي', 'name_en' => 'D360 Bank', 'code' => 'DTHRSAJE'],
            ['name' => 'بنك stc bank (STCPay)', 'name_en' => 'STC Bank', 'code' => 'STCPSAJE'],
        ];

        foreach ($banks as $bank) {
            Bank::firstOrCreate(['code' => $bank['code']], [
                'name'      => $bank['name'],
                'name_en'   => $bank['name_en'],
                'is_active' => true,
            ]);
        }
    }
}

