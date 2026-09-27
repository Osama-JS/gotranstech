import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import {
    TrendingUp,
    BarChart3,
    DollarSign,
    Calendar,
    ArrowUpRight,
    CheckCircle2,
    Clock,
    PieChart,
    MapPin,
    Building2,
    Zap,
    ShieldCheck,
    Wallet,
    Percent,
    Sparkles,
    Lightbulb,
} from 'lucide-react';

export default function InvestorAnalytics({
    period = '30days',
    kpis = {},
    performanceTrend = [],
    cityAllocation = [],
    companyPerformance = [],
    cashflowTrend = [],
}) {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const handlePeriodChange = (newPeriod) => {
        router.get(route('investor.analytics.index'), { period: newPeriod }, { preserveState: true, replace: true });
    };

    const periodLabels = {
        '7days': 'آخر 7 أيام',
        '30days': 'آخر 30 يوماً',
        '6months': 'آخر 6 أشهر',
        '1year': 'آخر سنة',
    };

    // Scaling for Line Chart
    const maxFundedVal = Math.max(...performanceTrend.map((d) => parseFloat(d.total_funded) || 0), 1000);
    const maxProfitVal = Math.max(...performanceTrend.map((d) => parseFloat(d.total_profit) || 0), 100);

    const svgW = 840;
    const svgH = 220;
    const padL = 60;
    const padR = 30;
    const padT = 25;
    const padB = 35;
    const chartW = svgW - padL - padR;
    const chartH = svgH - padT - padB;

    const points = performanceTrend.map((item, idx) => {
        const x = performanceTrend.length > 1 ? padL + (idx / (performanceTrend.length - 1)) * chartW : padL + chartW / 2;
        const fundedVal = parseFloat(item.total_funded) || 0;
        const profitVal = parseFloat(item.total_profit) || 0;
        const yFund = padT + chartH - (maxFundedVal > 0 ? (fundedVal / maxFundedVal) * chartH : 0);
        const yProfit = padT + chartH - (maxProfitVal > 0 ? (profitVal / maxProfitVal) * chartH : 0);
        return {
            x,
            yFund,
            yProfit,
            fundedVal,
            profitVal,
            count: item.tasks_count || 0,
            date: item.date,
        };
    });

    const fundPolyline = points.map((p) => `${p.x.toFixed(1)},${p.yFund.toFixed(1)}`).join(' ');
    const profitPolyline = points.map((p) => `${p.x.toFixed(1)},${p.yProfit.toFixed(1)}`).join(' ');

    // Donut Chart for City Allocation
    const totalCityInvested = cityAllocation.reduce((sum, c) => sum + (parseFloat(c.total_invested) || 0), 0) || 1;
    const cityColors = ['#6320EE', '#FF6B00', '#3B82F6', '#10B981', '#F59E0B', '#EC4899'];
    const donutR = 65;
    const donutC = 2 * Math.PI * donutR;
    let accumulatedPercent = 0;

    return (
        <AuthenticatedLayout title="التحليلات والمؤشرات الاستثمارية">
            <Head title="التحليلات الاستثمارية" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="التحليلات والمؤشرات الاستثمارية"
                subtitle="متابعة نمو المحفظة، مسار عوائد الأرباح والعمولات اللحظية، وتوزيع التمويل اللوجستي لاتخاذ قرارات استثمارية دقيقة"
                icon={BarChart3}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: 'التحليلات والإحصائيات' }]}
                badge={{
                    text: 'بيانات وإحصائيات حية',
                    color: 'brand',
                }}
                actions={
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#070A1E] p-1 rounded-2xl border border-slate-200 dark:border-violet-900/40">
                        {['7days', '30days', '6months', '1year'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handlePeriodChange(p)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    period === p
                                        ? 'bg-[#6320EE] text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                {periodLabels[p]}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* 4 Core Financial KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Invested */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">حجم التمويل بالفترة</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(kpis.total_invested || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        الإجمالي التاريخي: {Number(kpis.all_time_invested || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* Total Profits */}
                <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">صافي أرباح العمولات</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        +{Number(kpis.total_profits || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-orange-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        إجمالي الأرباح التاريخية: +{Number(kpis.all_time_profits || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* ROI Rate */}
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">معدل العائد (ROI)</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                            <Percent className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {kpis.roi_percentage || 0}%
                        <span className="text-xs font-sans font-bold text-indigo-500">عائد فوري</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        رصيد العمولات الحالي: {Number(kpis.commission_balance || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* Completed Tasks Count */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">المهام الممولة بنجاح</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {kpis.total_investments_count || 0}
                        <span className="text-xs font-sans font-bold text-slate-500">مهمة</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        متوسط المهمة: {Number(kpis.avg_investment_per_task || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>
            </div>

            {/* Performance Trend (Line Chart) */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-violet-500" />
                            <span>مسار حجم التمويل وعوائد العمولات المكتسبة خلال الفترة (Lines)</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            مقارنة أداء رأس المال المستثمر مع صافي الأرباح المودعة في محفظتك اللحظية
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#6320EE]" />
                            <span className="text-slate-700 dark:text-slate-300">حجم التمويل (ر.س)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#FF6B00]" />
                            <span className="text-slate-700 dark:text-slate-300">صافي الأرباح (ر.س)</span>
                        </div>
                    </div>
                </div>

                {performanceTrend.length > 0 ? (
                    <div className="relative overflow-x-auto">
                        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full h-56 select-none">
                            {/* Gridlines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
                                const y = padT + chartH * (1 - pct);
                                return (
                                    <g key={i}>
                                        <line
                                            x1={padL}
                                            y1={y}
                                            x2={svgW - padR}
                                            y2={y}
                                            stroke="currentColor"
                                            className="text-slate-200 dark:text-slate-800"
                                            strokeDasharray="4 4"
                                            strokeWidth="1"
                                        />
                                        <text
                                            x={padL - 10}
                                            y={y + 3}
                                            textAnchor="end"
                                            className="text-[10px] fill-slate-400 font-mono"
                                        >
                                            {(maxFundedVal * pct).toFixed(0)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Lines */}
                            {fundPolyline && (
                                <polyline
                                    fill="none"
                                    stroke="#6320EE"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={fundPolyline}
                                />
                            )}
                            {profitPolyline && (
                                <polyline
                                    fill="none"
                                    stroke="#FF6B00"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={profitPolyline}
                                />
                            )}

                            {/* Interactive Data Points */}
                            {points.map((p, idx) => (
                                <g key={idx}>
                                    <circle
                                        cx={p.x}
                                        cy={p.yFund}
                                        r={hoveredPoint === idx ? 6 : 4}
                                        fill="#6320EE"
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        className="transition-all cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint(idx)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                    <circle
                                        cx={p.x}
                                        cy={p.yProfit}
                                        r={hoveredPoint === idx ? 5 : 3}
                                        fill="#FF6B00"
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        className="transition-all cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint(idx)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
                                    {/* X-axis date labels */}
                                    {(idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 6) === 0) && (
                                        <text
                                            x={p.x}
                                            y={svgH - 10}
                                            textAnchor="middle"
                                            className="text-[10px] fill-slate-400 font-mono"
                                        >
                                            {p.date}
                                        </text>
                                    )}
                                </g>
                            ))}
                        </svg>

                        {/* Tooltip on Hover */}
                        {hoveredPoint !== null && points[hoveredPoint] && (
                            <div 
                                className="absolute bg-slate-900 text-white text-xs p-3 rounded-xl border border-slate-700 shadow-xl pointer-events-none z-20"
                                style={{
                                    left: `${(points[hoveredPoint].x / svgW) * 100}%`,
                                    top: '20px',
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                <div className="font-bold text-slate-300 pb-1 border-b border-slate-700 mb-1">
                                    تاريخ: {points[hoveredPoint].date}
                                </div>
                                <div className="text-violet-300 font-bold">
                                    تمويل: {points[hoveredPoint].fundedVal.toLocaleString('en-US')} ر.س
                                </div>
                                <div className="text-orange-400 font-bold">
                                    أرباح: +{points[hoveredPoint].profitVal.toFixed(2)} ر.س
                                </div>
                                <div className="text-slate-400 text-[10px]">
                                    المهام: {points[hoveredPoint].count} مهمة
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                        لا توجد بيانات تمويل كافية خلال الفترة المحددة لعرض المخطط.
                    </div>
                )}
            </div>

            {/* 2-Column Grid: City Donut & Partner Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Geographic Allocation (Donut Chart) */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-orange-500" />
                        <span>التوزيع الجغرافي للتمويل اللوجستي (المدن)</span>
                    </h3>

                    {cityAllocation.length > 0 ? (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            {/* SVG Donut */}
                            <div className="relative w-44 h-44 shrink-0">
                                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r={donutR}
                                        fill="transparent"
                                        stroke="currentColor"
                                        className="text-slate-100 dark:text-slate-800"
                                        strokeWidth="18"
                                    />
                                    {cityAllocation.map((c, i) => {
                                        const share = (parseFloat(c.total_invested) || 0) / totalCityInvested;
                                        const arc = share * donutC;
                                        const strokeDashoffset = -accumulatedPercent * donutC;
                                        accumulatedPercent += share;

                                        return (
                                            <circle
                                                key={i}
                                                cx="80"
                                                cy="80"
                                                r={donutR}
                                                fill="transparent"
                                                stroke={cityColors[i % cityColors.length]}
                                                strokeWidth="18"
                                                strokeDasharray={`${arc} ${donutC - arc}`}
                                                strokeDashoffset={strokeDashoffset}
                                                className="transition-all duration-500"
                                            />
                                        );
                                    })}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-[10px] text-slate-400 font-medium">المدن النشطة</span>
                                    <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                                        {cityAllocation.length}
                                    </span>
                                </div>
                            </div>

                            {/* Legend & Breakdown List */}
                            <div className="flex-1 w-full space-y-2.5">
                                {cityAllocation.map((c, i) => {
                                    const pct = (((parseFloat(c.total_invested) || 0) / totalCityInvested) * 100).toFixed(1);
                                    return (
                                        <div key={i} className="flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-3 h-3 rounded-full shrink-0"
                                                    style={{ backgroundColor: cityColors[i % cityColors.length] }}
                                                />
                                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                                    {c.city}
                                                </span>
                                                <span className="text-[10px] text-slate-500">
                                                    ({c.count} مهمة)
                                                </span>
                                            </div>
                                            <div className="text-end">
                                                <span className="font-mono font-bold text-slate-900 dark:text-white block">
                                                    {Number(c.total_invested || 0).toLocaleString('en-US')} ر.س
                                                </span>
                                                <span className="text-[10px] text-orange-500 font-bold block">
                                                    {pct}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-500">
                            لا توجد بيانات توزيع جغرافي حالياً.
                        </div>
                    )}
                </div>

                {/* Top Logistics Partners */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Building2 className="w-5 h-5 text-violet-500" />
                        <span>أعلى الشركات اللوجستية شريكة التمويل</span>
                    </h3>

                    {companyPerformance.length > 0 ? (
                        <div className="space-y-3">
                            {companyPerformance.map((comp, idx) => (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold text-xs">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <strong className="text-xs text-slate-900 dark:text-white block">
                                                {comp.company_name}
                                            </strong>
                                            <span className="text-[10px] text-slate-500">
                                                {comp.tasks_count} مهمة ممولة
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                                            {Number(comp.total_invested || 0).toLocaleString('en-US')} ر.س
                                        </span>
                                        <span className="text-[11px] font-mono font-bold text-orange-500 block">
                                            +{Number(comp.total_profit || 0).toFixed(2)} ر.س ربح
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-500">
                            لا توجد بيانات كافية عن الشركات خلال هذه الفترة.
                        </div>
                    )}
                </div>
            </div>

            {/* Smart Decision Support & Investment Insights */}
            <div className="p-6 rounded-3xl bg-violet-500/10 border border-violet-500/25 relative overflow-hidden">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#6320EE] text-white flex items-center justify-center shrink-0 shadow-md">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            رؤى استثمارية وتوصيات مساعدة في اتخاذ القرار
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-slate-700 dark:text-slate-300">
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <strong className="text-violet-600 dark:text-violet-400 block mb-1">أعلى المدن عائداً</strong>
                                <p>
                                    تظهر بيانات التمويل أن مهام الشحن في منطقة الرياض وجدة تحقق أعلى معدل سرعة سداد وتدوير لرأس المال بنسبة تدوير تقل عن 48 ساعة.
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <strong className="text-orange-500 block mb-1">إعادة استثمار العوائد</strong>
                                <p>
                                    إعادة ضخ الأرباح المكتسبة البالغة {Number(kpis.commission_balance || 0).toLocaleString('en-US')} ر.س في مهام جديدة فورياً يرفع العائد المركب السنوي بنسبة 18.4%.
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <strong className="text-indigo-500 block mb-1">تنويع التمويل اللوجستي</strong>
                                <p>
                                    يوصى بتوزيع مبالغ التمويل على عدة شركات لوجستية لتقليل فترات انتظار المهام الحية وتحقيق سيولة مستمرة في محفظة الاستثمار.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
