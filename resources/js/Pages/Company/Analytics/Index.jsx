import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import AdminPageHeader from '@/Components/AdminPageHeader';
import {
    TrendingUp,
    BarChart3,
    Truck,
    DollarSign,
    CheckCircle2,
    Clock,
    Percent,
    ArrowUpRight,
    ArrowDownRight,
    MapPin,
    AlertCircle,
    ShieldCheck,
    CreditCard,
    Lightbulb,
    Navigation,
} from 'lucide-react';

export default function CompanyAnalytics({
    period = '30days',
    kpis = {},
    tasksTrend = [],
    statusDistribution = {},
    routeDistribution = [],
    cashflowTrend = [],
}) {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    const handlePeriodChange = (newPeriod) => {
        router.get(route('company.analytics.index'), { period: newPeriod }, { preserveState: true, replace: true });
    };

    const periodLabels = {
        '7days': 'آخر 7 أيام',
        '30days': 'آخر 30 يوماً',
        '6months': 'آخر 6 أشهر',
        '1year': 'آخر سنة',
    };

    // Scaling for Cashflow Line Chart (Withdrawn vs Repaid)
    const maxWithdrawnVal = Math.max(...cashflowTrend.map((d) => parseFloat(d.withdrawn) || 0), 1000);
    const maxRepaidVal = Math.max(...cashflowTrend.map((d) => parseFloat(d.repaid) || 0), 1000);
    const maxCashVal = Math.max(maxWithdrawnVal, maxRepaidVal);

    const svgW = 840;
    const svgH = 220;
    const padL = 60;
    const padR = 30;
    const padT = 25;
    const padB = 35;
    const chartW = svgW - padL - padR;
    const chartH = svgH - padT - padB;

    const points = cashflowTrend.map((item, idx) => {
        const x = cashflowTrend.length > 1 ? padL + (idx / (cashflowTrend.length - 1)) * chartW : padL + chartW / 2;
        const withVal = parseFloat(item.withdrawn) || 0;
        const repVal = parseFloat(item.repaid) || 0;
        const yWith = padT + chartH - (maxCashVal > 0 ? (withVal / maxCashVal) * chartH : 0);
        const yRep = padT + chartH - (maxCashVal > 0 ? (repVal / maxCashVal) * chartH : 0);
        return {
            x,
            yWith,
            yRep,
            withVal,
            repVal,
            date: item.date,
        };
    });

    const withPolyline = points.map((p) => `${p.x.toFixed(1)},${p.yWith.toFixed(1)}`).join(' ');
    const repPolyline = points.map((p) => `${p.x.toFixed(1)},${p.yRep.toFixed(1)}`).join(' ');

    // Task status counts
    const statusCounts = {
        funded: statusDistribution.funded?.count || 0,
        completed: statusDistribution.completed?.count || 0,
        available: statusDistribution.available?.count || 0,
        cancelled: statusDistribution.cancelled?.count || 0,
    };
    const totalStatuses = Object.values(statusCounts).reduce((a, b) => a + b, 0) || 1;

    const donutR = 65;
    const donutC = 2 * Math.PI * donutR;
    const statusList = [
        { label: 'تمويل مكتمل', key: 'funded', count: statusCounts.funded, color: '#6320EE' },
        { label: 'تم التسليم بنجاح', key: 'completed', count: statusCounts.completed, color: '#10B981' },
        { label: 'بانتظار التمويل', key: 'available', count: statusCounts.available, color: '#FF6B00' },
        { label: 'ملغاة', key: 'cancelled', count: statusCounts.cancelled, color: '#EF4444' },
    ];
    let accumulatedPercent = 0;

    return (
        <AuthenticatedLayout title="التحليلات والمؤشرات التشغيلية والمالية">
            <Head title="التحليلات التشغيلية والمالية" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="التحليلات والمؤشرات التشغيلية والمالية"
                subtitle="متابعة حجم التمويل اللوجستي المستغل، كفاءة إنجاز المهام، ومسار سداد الالتزامات والسيولة النقدية"
                icon={BarChart3}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: 'التحليلات والإحصائيات' }]}
                badge={{
                    text: 'مؤشرات الأداء التشغيلي',
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

            {/* 4 Financial & Operational KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Funding Requested */}
                <div className="glass-panel p-5 rounded-2xl border border-violet-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">حجم التمويل المطلوب</span>
                        <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(kpis.total_funding_requested || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-violet-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        إجمالي عدد المهام: {kpis.total_tasks_count || 0} مهمة
                    </p>
                </div>

                {/* Fulfillment Rate */}
                <div className="glass-panel p-5 rounded-2xl border border-orange-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">نسبة التمويل والإنجاز</span>
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
                            <Percent className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {kpis.task_fulfillment_rate || 0}%
                        <span className="text-xs font-sans font-bold text-orange-500">معدل الإنجاز</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        {kpis.completed_tasks_count || 0} مهمة تم تمويلها بالكامل
                    </p>
                </div>

                {/* Credit Limit & Utilization */}
                <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">سقف الائتمان المستغل</span>
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {kpis.credit_utilization_rate || 0}%
                        <span className="text-xs font-sans font-bold text-indigo-500">من السقف</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        المتبقي من السقف: {(Number(kpis.credit_limit || 0) - Number(kpis.total_outstanding_debt || 0)).toLocaleString('en-US')} ر.س
                    </p>
                </div>

                {/* Outstanding Debts & Repaid */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0A0E2A]/85 relative overflow-hidden shadow-sm dark:shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">الالتزامات القائمة</span>
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-baseline gap-1">
                        {Number(kpis.total_outstanding_debt || 0).toLocaleString('en-US')}
                        <span className="text-xs font-sans font-bold text-amber-500">ر.س</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                        إجمالي ما تم سداده: {Number(kpis.total_debts_paid || 0).toLocaleString('en-US')} ر.س
                    </p>
                </div>
            </div>

            {/* Cash Flow Line Chart: Funding Received vs Repaid */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-violet-500" />
                            <span>مسار السيولة التمويلية: المبالغ المسحوبة مقابل المسددة (Lines)</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            مقارنة مبالغ التمويل المنصرفة للشركة مع دفعات سداد الالتزامات والديون
                        </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#6320EE]" />
                            <span className="text-slate-700 dark:text-slate-300">تمويل منصرف (ر.س)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#FF6B00]" />
                            <span className="text-slate-700 dark:text-slate-300">سداد التزامات (ر.س)</span>
                        </div>
                    </div>
                </div>

                {cashflowTrend.length > 0 ? (
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
                                            {(maxCashVal * pct).toFixed(0)}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Lines */}
                            {withPolyline && (
                                <polyline
                                    fill="none"
                                    stroke="#6320EE"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={withPolyline}
                                />
                            )}
                            {repPolyline && (
                                <polyline
                                    fill="none"
                                    stroke="#FF6B00"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    points={repPolyline}
                                />
                            )}

                            {/* Data points */}
                            {points.map((p, idx) => (
                                <g key={idx}>
                                    <circle
                                        cx={p.x}
                                        cy={p.yWith}
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
                                        cy={p.yRep}
                                        r={hoveredPoint === idx ? 5 : 3}
                                        fill="#FF6B00"
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        className="transition-all cursor-pointer"
                                        onMouseEnter={() => setHoveredPoint(idx)}
                                        onMouseLeave={() => setHoveredPoint(null)}
                                    />
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
                                    تمويل منصرف: {points[hoveredPoint].withVal.toLocaleString('en-US')} ر.س
                                </div>
                                <div className="text-orange-400 font-bold">
                                    سداد: {points[hoveredPoint].repVal.toLocaleString('en-US')} ر.س
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-12 text-center text-xs text-slate-500">
                        لا توجد حركات سيولة مسجلة خلال الفترة المحددة.
                    </div>
                )}
            </div>

            {/* 2-Column Grid: Task Status Donut & Top Routes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Task Status Distribution (Donut Chart) */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Truck className="w-5 h-5 text-violet-500" />
                        <span>توزيع حالات المهام اللوجستية (دائرة)</span>
                    </h3>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
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
                                {statusList.map((st, i) => {
                                    const share = st.count / totalStatuses;
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
                                            stroke={st.color}
                                            strokeWidth="18"
                                            strokeDasharray={`${arc} ${donutC - arc}`}
                                            strokeDashoffset={strokeDashoffset}
                                            className="transition-all duration-500"
                                        />
                                    );
                                })}
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] text-slate-400 font-medium">إجمالي المهام</span>
                                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                                    {totalStatuses}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-3">
                            {statusList.map((st, i) => {
                                const pct = ((st.count / totalStatuses) * 100).toFixed(1);
                                return (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: st.color }}
                                            />
                                            <span className="font-bold text-slate-800 dark:text-slate-200">
                                                {st.label}
                                            </span>
                                        </div>
                                        <div className="text-end">
                                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                                                {st.count} مهمة
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-mono block">
                                                {pct}%
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Top Logistics Routes */}
                <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-violet-900/35 bg-white dark:bg-[#0A0E2A]/85 shadow-sm dark:shadow-xl">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                        <Navigation className="w-5 h-5 text-orange-500" />
                        <span>أكثر مسارات الشحن والتوصيل كثافة</span>
                    </h3>

                    {routeDistribution.length > 0 ? (
                        <div className="space-y-3">
                            {routeDistribution.map((rt, idx) => (
                                <div
                                    key={idx}
                                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold text-xs">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                                                <span>{rt.pickup_city}</span>
                                                <span className="text-slate-400">←</span>
                                                <span>{rt.dropoff_city || 'نفس المنطقة'}</span>
                                            </div>
                                            <span className="text-[10px] text-slate-500">
                                                {rt.count} شحنة منفذة
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-end">
                                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-white block">
                                            {Number(rt.total_amount || 0).toLocaleString('en-US')} ر.س
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-xs text-slate-500">
                            لا توجد مسارات شحن مسجلة خلال الفترة.
                        </div>
                    )}
                </div>
            </div>

            {/* Operational Decision Support & Liquidity Advisory */}
            <div className="p-6 rounded-3xl bg-violet-500/10 border border-violet-500/25 relative overflow-hidden">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#6320EE] text-white flex items-center justify-center shrink-0 shadow-md">
                        <Lightbulb className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                            مؤشرات الكفاءة التشغيلية والسيولة النقدية للشركة
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs text-slate-700 dark:text-slate-300">
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <strong className="text-violet-600 dark:text-violet-400 block mb-1">معدل استغلال الائتمان</strong>
                                <p>
                                    نسبة استغلال السقف الائتماني الحالية {kpis.credit_utilization_rate || 0}%. يتيح لك السقف المتبقي تمويل شحنات إضافية فورياً دون أي تأخير بنكي.
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <strong className="text-orange-500 block mb-1">تسريع وتيرة التمويل</strong>
                                <p>
                                    السداد المبكر للديون المستحقة يرفع من التصنيف الائتماني للشركة لدى المنصة ويمنح الأولوية لبث مهامك للمستثمرين بمعدلات قبول فورية.
                                </p>
                            </div>
                            <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                                <strong className="text-indigo-500 block mb-1">كفاءة مسارات التوصيل</strong>
                                <p>
                                    تركيز ضخ المهام على المسارات الأكثر طلباً يقلل تكاليف التشغيل بنسبة تصل إلى 14% ويزيد من سرعة التسليم وإغلاق المهام الممولة.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
