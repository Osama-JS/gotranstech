import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import {
    TrendingUp,
    BarChart3,
    DollarSign,
    Users,
    Building2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    CheckCircle2,
    Clock,
    Activity,
    Layers,
    PieChart,
    MapPin,
    ArrowDownToLine,
    ArrowUpFromLine,
    Percent,
} from 'lucide-react';

export default function AdminAnalytics({
    period = '30days',
    kpis = {},
    fundingTrend = [],
    cityDistribution = [],
    cashflowTrend = [],
    userGrowthTrend = [],
    taskStatusCounts = {},
    topInvestors = [],
    topCompanies = [],
}) {
    const [hoveredFundingPoint, setHoveredFundingPoint] = useState(null);

    const handlePeriodChange = (newPeriod) => {
        router.get(route('admin.analytics.index'), { period: newPeriod }, { preserveState: true, replace: true });
    };

    // Scaling & Metrics
    const maxFundingVal = Math.max(...fundingTrend.map((d) => parseFloat(d.total_funded) || 0), 1000);
    const maxCommissionVal = Math.max(...fundingTrend.map((d) => parseFloat(d.commission_earned) || 0), 100);
    const maxCityCount = Math.max(...cityDistribution.map((c) => parseInt(c.tasks_count) || 0), 1);

    const totalTaskCount = Object.values(taskStatusCounts).reduce((acc, curr) => acc + parseInt(curr.count || 0), 0);

    const totalProfitsGenerated = (parseFloat(kpis.total_platform_commission) || 0) + (parseFloat(kpis.total_investor_profits) || 0);
    const platformSharePercent = totalProfitsGenerated > 0 ? (((parseFloat(kpis.total_platform_commission) || 0) / totalProfitsGenerated) * 100).toFixed(1) : '30.0';
    const investorSharePercent = totalProfitsGenerated > 0 ? (((parseFloat(kpis.total_investor_profits) || 0) / totalProfitsGenerated) * 100).toFixed(1) : '70.0';

    // Liquidity Comparison (Deposits vs Withdrawals) Calculations
    const totalInflow = cashflowTrend.reduce((sum, item) => sum + (parseFloat(item.inflow) || 0), 0) || parseFloat(kpis.total_approved_deposits) || 0;
    const totalOutflow = cashflowTrend.reduce((sum, item) => sum + (parseFloat(item.outflow) || 0), 0) || parseFloat(kpis.total_approved_withdrawals) || 0;
    const totalLiquidityFlow = totalInflow + totalOutflow;
    const depositPercent = totalLiquidityFlow > 0 ? ((totalInflow / totalLiquidityFlow) * 100).toFixed(1) : '50.0';
    const withdrawalPercent = totalLiquidityFlow > 0 ? ((totalOutflow / totalLiquidityFlow) * 100).toFixed(1) : '50.0';
    const netLiquidity = totalInflow - totalOutflow;

    const donutR = 70;
    const donutC = 2 * Math.PI * donutR;
    const depositArc = (parseFloat(depositPercent) / 100) * donutC;
    const withdrawalArc = (parseFloat(withdrawalPercent) / 100) * donutC;

    // SVG Line Chart coordinates for Funding & Commission Trends
    const svgW = 840;
    const svgH = 220;
    const padL = 60;
    const padR = 30;
    const padT = 25;
    const padB = 35;
    const chartW = svgW - padL - padR;
    const chartH = svgH - padT - padB;

    const fundingPoints = fundingTrend.map((item, idx) => {
        const x = fundingTrend.length > 1 ? padL + (idx / (fundingTrend.length - 1)) * chartW : padL + chartW / 2;
        const fundedVal = parseFloat(item.total_funded) || 0;
        const commVal = parseFloat(item.commission_earned) || 0;
        const yFund = padT + chartH - (maxFundingVal > 0 ? (fundedVal / maxFundingVal) * chartH : 0);
        const yComm = padT + chartH - (maxCommissionVal > 0 ? (commVal / maxCommissionVal) * chartH : 0);
        return {
            x,
            yFund,
            yComm,
            fundedVal,
            commVal,
            count: item.count || 0,
            date: item.date,
        };
    });

    const fundingPolyline = fundingPoints.map((p) => `${p.x.toFixed(1)},${p.yFund.toFixed(1)}`).join(' ');
    const commPolyline = fundingPoints.map((p) => `${p.x.toFixed(1)},${p.yComm.toFixed(1)}`).join(' ');

    const periodLabels = {
        '7days': 'آخر 7 أيام',
        '30days': 'آخر 30 يوماً',
        '6months': 'آخر 6 أشهر',
        '1year': 'آخر سنة',
    };

    return (
        <AuthenticatedLayout title="إحصائيات وتحليلات المنصة">
            <Head title="الإحصائيات والتحليلات المتقدمة" />

            <div className="space-y-6">
                {/* Header & Period Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <AdminPageHeader
                        title="لوحة الإحصائيات والتحليلات المتقدمة"
                        subtitle="تحليل متكامل لحجم التمويل اللوجستي، إيرادات العمولات، تدفقات السيولة، والتوزيع الجغرافي للمدن"
                        icon={BarChart3}
                        badge={`الفترة: ${periodLabels[period] || periodLabels['30days']}`}
                    />

                    {/* Period Switcher */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 self-start sm:self-center shadow-inner">
                        {['7days', '30days', '6months', '1year'].map((p) => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => handlePeriodChange(p)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    period === p
                                        ? 'bg-[#6320EE] text-white shadow-md font-extrabold shadow-violet-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800'
                                }`}
                            >
                                {periodLabels[p]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 4 Primary KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-violet-900/30 relative overflow-hidden group hover:border-violet-500/40 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي حجم التمويل</span>
                            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                <DollarSign className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black font-mono text-violet-700 dark:text-violet-400 tracking-tight mb-1">
                            {(parseFloat(kpis.total_funding_volume) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">ر.س</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">إجمالي المبالغ الممولة للمهام اللوجستية</span>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-orange-900/30 relative overflow-hidden group hover:border-orange-500/40 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">صافي عمولات المنصة</span>
                            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black font-mono text-orange-600 dark:text-orange-400 tracking-tight mb-1">
                            {(parseFloat(kpis.total_platform_commission) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">ر.س</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">أرباح منصة GoTransTech المحققة</span>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-violet-900/30 relative overflow-hidden group hover:border-violet-500/40 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">أرباح المستثمرين الموزعة</span>
                            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-300 tracking-tight mb-1">
                            {(parseFloat(kpis.total_investor_profits) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">ر.س</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">عوائد موزعة لمحفظة المستثمرين فورياً</span>
                    </div>

                    <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-orange-900/30 relative overflow-hidden group hover:border-orange-500/40 transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">المهام الممولة بنجاح</span>
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 tracking-tight mb-1">
                            {(parseInt(kpis.total_completed_tasks) || 0).toLocaleString('en-US')}{' '}
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">مهمة</span>
                        </div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            بمتوسط {(parseFloat(kpis.avg_task_value) || 0).toFixed(1)} ر.س للمهمة
                        </span>
                    </div>
                </div>

                {/* Section 1: Funding & Commission Trend Line Chart */}
                <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                <span>مسار حجم التمويل وعوائد العمولات خلال الفترة</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                تطور حجم المبالغ الممولة وإيرادات المنصة عبر الزمن (مخطط خطي)
                            </p>
                        </div>

                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-1 rounded bg-[#6320EE] block" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">حجم التمويل (ر.س)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-4 h-1 rounded bg-[#FF6B00] block" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">عمولة المنصة (ر.س)</span>
                            </div>
                        </div>
                    </div>

                    {fundingTrend.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            <BarChart3 className="w-8 h-8 mb-2 opacity-40" />
                            <p className="text-sm">لا توجد عمليات تمويل مسجلة خلال هذه الفترة</p>
                        </div>
                    ) : (
                        <div className="relative w-full">
                            {/* Hover Tooltip Box */}
                            {hoveredFundingPoint !== null && fundingPoints[hoveredFundingPoint] && (
                                <div
                                    className="absolute z-20 pointer-events-none transition-all duration-150 bg-slate-900 text-white dark:bg-slate-950 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs"
                                    style={{
                                        left: `${(fundingPoints[hoveredFundingPoint].x / svgW) * 100}%`,
                                        top: '-10px',
                                        transform: 'translate(-50%, -100%)',
                                    }}
                                >
                                    <div className="font-bold text-slate-100 border-b border-slate-800 pb-1 mb-1.5 flex items-center justify-between gap-3">
                                        <span>{fundingPoints[hoveredFundingPoint].date}</span>
                                        <span className="text-[10px] text-slate-400">{fundingPoints[hoveredFundingPoint].count} مهمة</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-violet-300">
                                        <span className="w-2 h-2 rounded-full bg-[#6320EE]" />
                                        <span>التمويل:</span>
                                        <span className="font-mono font-bold">
                                            {fundingPoints[hoveredFundingPoint].fundedVal.toLocaleString('en-US')} ر.س
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-orange-300 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-[#FF6B00]" />
                                        <span>العمولة:</span>
                                        <span className="font-mono font-bold">
                                            {fundingPoints[hoveredFundingPoint].commVal.toLocaleString('en-US')} ر.س
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* SVG Dual Lines */}
                            <div className="w-full overflow-x-auto no-scrollbar">
                                <svg
                                    viewBox={`0 0 ${svgW} ${svgH}`}
                                    className="w-full h-64 min-w-[620px] select-none"
                                >
                                    {/* Grid Lines */}
                                    <line
                                        x1={padL}
                                        y1={padT}
                                        x2={svgW - padR}
                                        y2={padT}
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-slate-800"
                                        strokeDasharray="4 4"
                                        strokeWidth="1"
                                    />
                                    <line
                                        x1={padL}
                                        y1={padT + chartH / 2}
                                        x2={svgW - padR}
                                        y2={padT + chartH / 2}
                                        stroke="currentColor"
                                        className="text-slate-200 dark:text-slate-800"
                                        strokeDasharray="4 4"
                                        strokeWidth="1"
                                    />
                                    <line
                                        x1={padL}
                                        y1={padT + chartH}
                                        x2={svgW - padR}
                                        y2={padT + chartH}
                                        stroke="currentColor"
                                        className="text-slate-300 dark:text-slate-700"
                                        strokeWidth="1.5"
                                    />

                                    {/* Y-Axis Value Labels */}
                                    <text
                                        x={padL - 10}
                                        y={padT + 4}
                                        textAnchor="end"
                                        className="text-[10px] fill-slate-400 font-mono"
                                    >
                                        {(maxFundingVal / 1000).toFixed(0)}k
                                    </text>
                                    <text
                                        x={padL - 10}
                                        y={padT + chartH / 2 + 4}
                                        textAnchor="end"
                                        className="text-[10px] fill-slate-400 font-mono"
                                    >
                                        {(maxFundingVal / 2000).toFixed(0)}k
                                    </text>
                                    <text
                                        x={padL - 10}
                                        y={padT + chartH + 4}
                                        textAnchor="end"
                                        className="text-[10px] fill-slate-400 font-mono"
                                    >
                                        0
                                    </text>

                                    {/* Hover Vertical Guide Line */}
                                    {hoveredFundingPoint !== null && fundingPoints[hoveredFundingPoint] && (
                                        <line
                                            x1={fundingPoints[hoveredFundingPoint].x}
                                            y1={padT}
                                            x2={fundingPoints[hoveredFundingPoint].x}
                                            y2={padT + chartH}
                                            stroke="#6320EE"
                                            strokeDasharray="3 3"
                                            strokeWidth="1.5"
                                        />
                                    )}

                                    {/* Line 1: Funding Volume (Solid Brand Violet) */}
                                    {fundingPoints.length > 1 ? (
                                        <polyline
                                            fill="none"
                                            stroke="#6320EE"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={fundingPolyline}
                                        />
                                    ) : fundingPoints.length === 1 ? (
                                        <circle
                                            cx={fundingPoints[0].x}
                                            cy={fundingPoints[0].yFund}
                                            r="6"
                                            fill="#6320EE"
                                        />
                                    ) : null}

                                    {/* Line 2: Commission Earned (Solid Brand Orange) */}
                                    {fundingPoints.length > 1 ? (
                                        <polyline
                                            fill="none"
                                            stroke="#FF6B00"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            points={commPolyline}
                                        />
                                    ) : fundingPoints.length === 1 ? (
                                        <circle
                                            cx={fundingPoints[0].x}
                                            cy={fundingPoints[0].yComm}
                                            r="5"
                                            fill="#FF6B00"
                                        />
                                    ) : null}

                                    {/* Data Points and Hover Target Zones */}
                                    {fundingPoints.map((p, idx) => (
                                        <g key={idx}>
                                            {/* Funding Dot */}
                                            <circle
                                                cx={p.x}
                                                cy={p.yFund}
                                                r={hoveredFundingPoint === idx ? '6' : '4'}
                                                fill="#6320EE"
                                                stroke="#FFFFFF"
                                                strokeWidth="2"
                                                className="transition-all duration-150"
                                            />
                                            {/* Commission Dot */}
                                            <circle
                                                cx={p.x}
                                                cy={p.yComm}
                                                r={hoveredFundingPoint === idx ? '5' : '3.5'}
                                                fill="#FF6B00"
                                                stroke="#FFFFFF"
                                                strokeWidth="1.5"
                                                className="transition-all duration-150"
                                            />
                                            {/* X-axis Date Text */}
                                            <text
                                                x={p.x}
                                                y={padT + chartH + 20}
                                                textAnchor="middle"
                                                className="text-[10px] fill-slate-500 dark:fill-slate-400 font-mono"
                                            >
                                                {p.date.substring(5)}
                                            </text>
                                            {/* Transparent Overlay Slice for easy touch/mouse hover */}
                                            <rect
                                                x={p.x - chartW / (fundingPoints.length * 2 || 2)}
                                                y={padT}
                                                width={chartW / (fundingPoints.length || 1)}
                                                height={chartH + 25}
                                                fill="transparent"
                                                className="cursor-pointer"
                                                onMouseEnter={() => setHoveredFundingPoint(idx)}
                                                onMouseLeave={() => setHoveredFundingPoint(null)}
                                            />
                                        </g>
                                    ))}
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Second Row: City Distribution & Liquidity Comparison Donut Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Geographic / City Distribution Chart */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-rose-500" />
                                <span>التوزيع الجغرافي للمهام والمدن</span>
                            </h3>
                            <span className="text-xs text-slate-500 dark:text-slate-400">أكثر المدن نشاطاً</span>
                        </div>

                        {cityDistribution.length === 0 ? (
                            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                                لا توجد بيانات جغرافية للمهام في هذه الفترة.
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {cityDistribution.map((item, idx) => {
                                    const percentage = maxCityCount > 0 ? ((item.tasks_count / maxCityCount) * 100).toFixed(0) : 0;
                                    return (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                                    <span>{item.city || 'غير محدد'}</span>
                                                </span>
                                                <div className="font-mono text-slate-500 dark:text-slate-400 text-xs">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{item.tasks_count}</span> مهمة •{' '}
                                                    <span className="text-violet-600 dark:text-violet-400 font-bold">
                                                        {parseFloat(item.total_amount).toLocaleString('en-US')} ر.س
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                                <div
                                                    style={{ width: `${percentage}%` }}
                                                    className="h-full rounded-full bg-rose-500 transition-all duration-500"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Section 2: Liquidity Comparison (Deposits vs Withdrawals) CIRCULAR / DONUT CHART */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                        <span>مقارنة السيولة (الإيداعات مقابل السحوبات)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        توزيع التدفقات النقدية الداخلة والخارجة (مخطط دائري)
                                    </p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20">
                                    دائرة السيولة
                                </span>
                            </div>

                            {totalLiquidityFlow === 0 ? (
                                <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
                                    لا توجد حركات تدفق نقدي مسجلة في هذه الفترة.
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                                    {/* Donut Circle SVG */}
                                    <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                                        <svg viewBox="0 0 180 180" className="w-full h-full transform -rotate-90">
                                            {/* Background circle track */}
                                            <circle
                                                cx="90"
                                                cy="90"
                                                r={donutR}
                                                fill="transparent"
                                                stroke="currentColor"
                                                className="text-slate-100 dark:text-slate-800"
                                                strokeWidth="20"
                                            />
                                            {/* Deposits Arc (Solid Brand Violet) */}
                                            <circle
                                                cx="90"
                                                cy="90"
                                                r={donutR}
                                                fill="transparent"
                                                stroke="#6320EE"
                                                strokeWidth="20"
                                                strokeDasharray={`${depositArc} ${donutC}`}
                                                strokeDashoffset="0"
                                                strokeLinecap="round"
                                                className="transition-all duration-700"
                                            />
                                            {/* Withdrawals Arc (Solid Red-Rose) */}
                                            <circle
                                                cx="90"
                                                cy="90"
                                                r={donutR}
                                                fill="transparent"
                                                stroke="#F43F5E"
                                                strokeWidth="20"
                                                strokeDasharray={`${withdrawalArc} ${donutC}`}
                                                strokeDashoffset={`${-depositArc}`}
                                                strokeLinecap="round"
                                                className="transition-all duration-700"
                                            />
                                        </svg>

                                        {/* Center Content */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mb-0.5">
                                                صافي السيولة
                                            </span>
                                            <span className="text-base font-black font-mono text-slate-900 dark:text-white leading-tight">
                                                {netLiquidity >= 0 ? '+' : ''}
                                                {Math.round(netLiquidity).toLocaleString('en-US')}
                                            </span>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
                                                ر.س
                                            </span>
                                        </div>
                                    </div>

                                    {/* Breakdown Legend Cards */}
                                    <div className="flex-1 w-full space-y-3">
                                        {/* Deposits Legend Card */}
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-[#6320EE]" />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">الإيداعات البنكية</span>
                                                </div>
                                                <span className="font-mono font-bold text-violet-700 dark:text-violet-400 text-sm">
                                                    {depositPercent}%
                                                </span>
                                            </div>
                                            <div className="text-base font-black font-mono text-violet-700 dark:text-violet-300">
                                                {totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">ر.س</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                                إجمالي تدفقات الشحن والاستثمار
                                            </span>
                                        </div>

                                        {/* Withdrawals Legend Card */}
                                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">طلبات السحب المصروفة</span>
                                                </div>
                                                <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                                                    {withdrawalPercent}%
                                                </span>
                                            </div>
                                            <div className="text-base font-black font-mono text-rose-600 dark:text-rose-300">
                                                {totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">ر.س</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                                المصروفات النقدية للحسابات البنكية
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Footer */}
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                            <span>إجمالي حجم التداول النقدي:</span>
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                                {totalLiquidityFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })} ر.س
                            </span>
                        </div>
                    </div>
                </div>

                {/* Third Row: Profit Sharing Ratio & Task Statuses & Liquidity Balance */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profit Sharing Split */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                                <Percent className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                <span>توزيع الأرباح والعمولات</span>
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-slate-700 dark:text-slate-300 font-bold">
                                            أرباح المستثمرين ({investorSharePercent}%)
                                        </span>
                                        <span className="font-mono text-violet-700 dark:text-violet-400 font-bold">
                                            {(parseFloat(kpis.total_investor_profits) || 0).toLocaleString('en-US')} ر.س
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            style={{ width: `${investorSharePercent}%` }}
                                            className="h-full rounded-full bg-[#6320EE]"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                    <div className="flex items-center justify-between text-xs mb-2">
                                        <span className="text-slate-700 dark:text-slate-300 font-bold">
                                            عمولة المنصة ({platformSharePercent}%)
                                        </span>
                                        <span className="font-mono text-orange-600 dark:text-orange-400 font-bold">
                                            {(parseFloat(kpis.total_platform_commission) || 0).toLocaleString('en-US')} ر.س
                                        </span>
                                    </div>
                                    <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                        <div
                                            style={{ width: `${platformSharePercent}%` }}
                                            className="h-full rounded-full bg-[#FF6B00]"
                                        />
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-100 dark:bg-slate-950/60 rounded-xl text-center text-xs text-slate-600 dark:text-slate-400">
                                    إجمالي الأرباح المشتركة المولدة:{' '}
                                    <strong className="text-slate-900 dark:text-white font-mono">
                                        {totalProfitsGenerated.toLocaleString('en-US')} ر.س
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Task Status Breakdown */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                                <PieChart className="w-5 h-5 text-orange-500" />
                                <span>توزيع حالات المهام اللوجستية</span>
                            </h3>

                            <div className="space-y-3">
                                {[
                                    { key: 'funded', label: 'ممولة بنجاح', color: 'bg-violet-600', text: 'text-violet-600 dark:text-violet-400' },
                                    { key: 'available', label: 'متاحة للتمويل', color: 'bg-[#FF6B00]', text: 'text-orange-600 dark:text-orange-400' },
                                    { key: 'completed', label: 'مكتملة التوصيل', color: 'bg-indigo-600', text: 'text-indigo-600 dark:text-indigo-400' },
                                    { key: 'cancelled', label: 'ملغاة', color: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
                                ].map((item) => {
                                    const count = parseInt(taskStatusCounts[item.key]?.count || 0);
                                    const amount = parseFloat(taskStatusCounts[item.key]?.total_amount || 0);
                                    const percentage = totalTaskCount > 0 ? ((count / totalTaskCount) * 100).toFixed(1) : 0;

                                    return (
                                        <div key={item.key} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                                    <span className="font-bold text-slate-800 dark:text-slate-200">{item.label}</span>
                                                </div>
                                                <div className="font-mono">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100">{count}</span>
                                                    <span className="text-slate-500 dark:text-slate-400 text-[10px] ml-1">({percentage}%)</span>
                                                </div>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mb-1">
                                                <div style={{ width: `${percentage}%` }} className={`h-full rounded-full ${item.color}`} />
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                المبلغ: {amount.toLocaleString('en-US')} ر.س
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Operational Liquidity Balance */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                                <Layers className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                                <span>مؤشرات السيولة والتشغيل</span>
                            </h3>

                            <div className="space-y-3.5 text-xs">
                                <div className="p-3.5 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-between">
                                    <span className="text-slate-700 dark:text-slate-300">صافي السيولة النقدية:</span>
                                    <span className="font-bold font-mono text-violet-700 dark:text-violet-400 text-sm">
                                        {(parseFloat(kpis.net_platform_liquidity) || 0).toLocaleString('en-US')} ر.س
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">متوسط قيمة المهمة:</span>
                                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                                        {(parseFloat(kpis.avg_task_value) || 0).toFixed(2)} ر.س
                                    </span>
                                </div>

                                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                    <span className="text-slate-600 dark:text-slate-400">حالة المطابقة المحاسبية:</span>
                                    <span className="inline-flex items-center gap-1 font-bold text-violet-700 dark:text-violet-400">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>100% متطابق</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Active Partners & Investors */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Investors */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                            <span>أعلى المستثمرين تمويلاً خلال الفترة</span>
                        </h3>

                        {topInvestors.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">لا توجد سجلات استثمارية في هذه الفترة</p>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {topInvestors.map((inv, idx) => (
                                    <div key={inv.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-400 font-mono font-bold text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{inv.name}</div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                                    {inv.phone_country_code || '+966'} {inv.phone || inv.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="font-mono font-bold text-violet-700 dark:text-violet-400 text-sm">
                                                {(parseFloat(inv.total_invested_amount) || 0).toLocaleString('en-US')} ر.س
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{inv.total_investments_count || 0} مهمة ممولة</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Top Logistics Companies */}
                    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
                            <Building2 className="w-5 h-5 text-orange-500" />
                            <span>أكثر الشركات اللوجستية طلباً للتمويل</span>
                        </h3>

                        {topCompanies.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">لا توجد مهام مسجلة للشركات في هذه الفترة</p>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                {topCompanies.map((comp, idx) => (
                                    <div key={comp.id} className="py-3 flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono font-bold text-xs flex items-center justify-center">
                                                {idx + 1}
                                            </span>
                                            <div>
                                                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                    {comp.company_name || comp.user?.name || 'شركة لوجستية'}
                                                </div>
                                                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                                                    {comp.contact_phone || comp.user?.phone || comp.contact_email || comp.user?.email || 'N/A'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <div className="font-mono font-bold text-orange-600 dark:text-orange-400 text-sm">
                                                {(parseFloat(comp.total_tasks_amount) || 0).toLocaleString('en-US')} ر.س
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{comp.total_tasks_count || 0} مهمة</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
