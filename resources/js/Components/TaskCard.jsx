import React, { useState, useEffect } from 'react';
import { MapPin, Clock, ArrowLeft, ArrowRight, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import Badge from './Badge';

export default function TaskCard({ task, onFund, walletBalance = 0, investorShareRate = 70 }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const updateTimer = () => {
            if (!task.expires_at) return;
            const diff = new Date(task.expires_at).getTime() - new Date().getTime();
            
            if (diff <= 0) {
                setTimeLeft('انتهت الصلاحية');
                setIsExpired(true);
            } else {
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${minutes}د ${seconds}ث`);
                setIsExpired(false);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [task.expires_at]);

    const fundingAmount = parseFloat(task.funding_amount);
    const companyRate = parseFloat(task.company_commission_rate || 10);
    const grossCommission = (fundingAmount * companyRate) / 100;
    const investorCommission = (grossCommission * investorShareRate) / 100;

    const canFund = walletBalance >= fundingAmount && !isExpired && task.status === 'available';

    return (
        <div className="rounded-2xl p-5 border border-slate-200 dark:border-violet-900/30 hover:border-violet-500/50 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden bg-white dark:bg-[#0A0E2A]/80 shadow-sm dark:shadow-none">
            {/* Top accent line with GoTransTech brand solid violet */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#6320EE] opacity-90 transition-opacity" />

            <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-violet-700 dark:text-violet-300 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/25">
                        {task.task_number}
                    </span>
                    <div className="flex items-center gap-2">
                        {task.status === 'available' && !isExpired && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/25 animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                {timeLeft}
                            </span>
                        )}
                        <Badge status={isExpired && task.status === 'available' ? 'expired' : task.status} />
                    </div>
                </div>

                {/* Title & Company */}
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-1">
                    {task.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                    <span>{task.company?.company_name || 'شركة لوجستية معتمدة'}</span>
                </p>

                {/* Route Box */}
                <div className="bg-slate-50 dark:bg-[#06081B]/70 rounded-xl p-3 border border-slate-200 dark:border-violet-900/30 mb-4 space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">نقطة الاستلام:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{task.pickup_city} - {task.pickup_address}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">نقطة التسليم:</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{task.dropoff_city} - {task.dropoff_address}</span>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-50 dark:bg-[#080B26]/60 p-3 rounded-xl border border-slate-200 dark:border-violet-900/30">
                    <div>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-0.5">مبلغ التمويل المطلوب:</span>
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 font-mono">
                            {fundingAmount.toLocaleString('en-US')} <span className="text-xs font-sans text-violet-600 dark:text-violet-300">ر.س</span>
                        </span>
                    </div>
                    <div className="border-r border-slate-200 dark:border-violet-900/40 pr-2">
                        <span className="text-[11px] text-orange-600 dark:text-orange-400 block mb-0.5 font-medium flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> ربح المستثمر:
                        </span>
                        <span className="text-lg font-black text-orange-600 dark:text-orange-400 font-mono">
                            +{investorCommission.toFixed(2)} <span className="text-xs font-sans">ر.س</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer action button */}
            {task.status === 'available' && !isExpired ? (
                <button
                    type="button"
                    onClick={() => onFund(task, investorCommission)}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        canFund
                            ? 'bg-[#6320EE] hover:bg-[#5217D4] text-white shadow-violet-600/30'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'
                    }`}
                >
                    <Zap className="w-4 h-4 text-orange-300" />
                    {canFund ? 'تمويل المهمة فوريًا' : 'رصيدك غير كافٍ للشحن'}
                </button>
            ) : (
                <div className="w-full py-2.5 px-4 bg-slate-100 dark:bg-[#070A1E]/80 rounded-xl text-center text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-violet-900/30">
                    {task.status === 'funded' ? 'تم تمويل هذه المهمة' : 'غير متاحة للتمويل'}
                </div>
            )}
        </div>
    );
}
