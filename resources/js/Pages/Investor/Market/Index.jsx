import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import TaskCard from '../../../Components/TaskCard';
import ConfirmDialog from '../../../Components/ConfirmDialog';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import { Zap, Search, Filter, MapPin, DollarSign, RefreshCw, Wallet } from 'lucide-react';

export default function InvestorMarket({ tasks, walletBalance, investorShareRate, filters }) {
    const [selectedCity, setSelectedCity] = useState(filters?.city || '');
    const [minAmount, setMinAmount] = useState(filters?.min_amount || '');
    const [maxAmount, setMaxAmount] = useState(filters?.max_amount || '');
    const [selectedTask, setSelectedTask] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [fundingLoading, setFundingLoading] = useState(false);
    const [estimatedProfit, setEstimatedProfit] = useState(0);

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('investor.market.index'), {
            city: selectedCity,
            min_amount: minAmount,
            max_amount: maxAmount,
        }, { preserveState: true });
    };

    const handleOpenFundModal = (task, profit) => {
        setSelectedTask(task);
        setEstimatedProfit(profit);
        setConfirmOpen(true);
    };

    const handleConfirmFunding = () => {
        if (!selectedTask) return;
        setFundingLoading(true);
        router.post(route('investor.tasks.fund', selectedTask.id), {}, {
            preserveScroll: true,
            onFinish: () => {
                setFundingLoading(false);
                setConfirmOpen(false);
                setSelectedTask(null);
            },
        });
    };

    return (
        <AuthenticatedLayout title="سوق المهام اللوجستية القابلة للتمويل">
            <Head title="سوق المهام اللوجستية" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="سوق المهام اللوجستية الحية"
                subtitle="استكشف مهام التوصيل والشحن المتاحة للتمويل المباشر مع حساب العمولات الفورية ومؤقت العد التنازلي"
                icon={Zap}
                iconColor="text-orange-400"
                iconBg="bg-orange-500/15 border-orange-500/30"
                breadcrumbs={[{ label: 'سوق المهام اللوجستية' }]}
                badge={{
                    text: `${tasks?.total || tasks?.data?.length || 0} مهمة متاحة`,
                    color: 'orange',
                }}
                actions={[
                    {
                        label: `الرصيد المتاح: ${Number(walletBalance || 0).toLocaleString('en-US')} ر.س`,
                        icon: Wallet,
                        url: route('investor.wallet.index'),
                        variant: 'primary',
                    },
                ]}
            />

            {/* Filter Bar */}
            <div className="glass-panel p-5 rounded-2xl border border-violet-900/30 mb-6 bg-[#0A0E2A]/80">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">المدينة (الاستلام أو التسليم)</label>
                        <div className="relative">
                            <MapPin className="w-4 h-4 text-violet-400 absolute right-3 top-3" />
                            <input
                                type="text"
                                value={selectedCity}
                                onChange={(e) => setSelectedCity(e.target.value)}
                                placeholder="مثال: الرياض، جدة..."
                                className="w-full bg-[#06081B] border border-violet-800/40 rounded-xl px-3.5 py-2 pr-9 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">الحد الأدنى للمبلغ (ر.س)</label>
                        <input
                            type="number"
                            value={minAmount}
                            onChange={(e) => setMinAmount(e.target.value)}
                            placeholder="مثال: 1000"
                            className="w-full bg-[#06081B] border border-violet-800/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">الحد الأقصى للمبلغ (ر.س)</label>
                        <input
                            type="number"
                            value={maxAmount}
                            onChange={(e) => setMaxAmount(e.target.value)}
                            placeholder="مثال: 20000"
                            className="w-full bg-[#06081B] border border-violet-800/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="flex-1 py-2 px-4 rounded-xl font-bold text-xs bg-[#6320EE] hover:bg-[#5217D4] text-white transition-all flex items-center justify-center gap-1.5 h-[38px] shadow-md shadow-violet-600/30 cursor-pointer"
                        >
                            <Filter className="w-3.5 h-3.5" />
                            <span>تطبيق الفلتر</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => router.get(route('investor.market.index'))}
                            className="p-2 rounded-xl bg-violet-950/40 hover:bg-violet-900/60 text-slate-300 hover:text-white transition-colors h-[38px] border border-violet-800/40 cursor-pointer"
                            title="إعادة التحديث"
                        >
                            <RefreshCw className="w-4 h-4 text-orange-400" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Task Grid */}
            {tasks.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {tasks.data.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onFund={handleOpenFundModal}
                            walletBalance={walletBalance}
                            investorShareRate={investorShareRate}
                        />
                    ))}
                </div>
            ) : (
                <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center">
                    <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <h3 className="font-bold text-white text-lg mb-1">لا توجد مهام مطابقة للبحث حالياً</h3>
                    <p className="text-xs text-slate-400">جرب تغيير معايير البحث أو تحقق مجدداً بعد قليل.</p>
                </div>
            )}

            {/* Custom Modal Confirmation */}
            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={handleConfirmFunding}
                isLoading={fundingLoading}
                type="success"
                title="تأكيد تمويل المهمة اللوجستية"
                message={`هل ترغب في تمويل المهمة #${selectedTask?.task_number} بمبلغ ${parseFloat(selectedTask?.funding_amount || 0).toLocaleString('en-US')} ر.س؟ ستتحصل على أرباح عمولة قدرها +${estimatedProfit.toFixed(2)} ر.س تودع في محفظة أرباحك فوراً.`}
                confirmText="تأكيد وتمويل الآن"
                cancelText="إلغاء التراجع"
            />
        </AuthenticatedLayout>
    );
}
