import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../../Layouts/AuthenticatedLayout';
import Badge from '../../../Components/Badge';
import AdminPageHeader from '../../../Components/AdminPageHeader';
import LegalAgreementModal from '../../../Components/LegalAgreementModal';
import { FileText, ShieldCheck, CheckCircle2, Calendar, Award, Eye, Printer } from 'lucide-react';

export default function InvestorContracts({ contracts }) {
    const [selectedContract, setSelectedContract] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleViewContract = (contract) => {
        setSelectedContract(contract);
        setModalOpen(true);
    };

    return (
        <AuthenticatedLayout title="عقود واتفاقيات الاستثمار">
            <Head title="عقود الاستثمار" />

            {/* Professional Page Header */}
            <AdminPageHeader
                title="عقود واتفاقيات الاستثمار المعتمدة"
                subtitle="استعراض العقود الإلكترونية المبرمة، ونسب تقاسم العمولات والوثائق القانونية الموثقة مع المنصة"
                icon={FileText}
                iconColor="text-violet-400"
                iconBg="bg-violet-500/15 border-violet-500/30"
                breadcrumbs={[{ label: 'عقود الاستثمار' }]}
                badge={{
                    text: `${contracts.length} عقود موثقة`,
                    color: 'brand',
                }}
            />

            <div className="space-y-6">
                {contracts.length > 0 ? (
                    contracts.map((contract) => (
                        <div key={contract.id} className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/30">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white">{contract.title}</h3>
                                        <span className="text-xs font-mono text-violet-400">رقم العقد: {contract.contract_number}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    <Badge status={contract.status} />
                                    <div className="bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl text-xs font-bold text-violet-400 flex items-center gap-1.5">
                                        <Award className="w-4 h-4" />
                                        <span>نسبة أرباحك: {contract.commission_rate}%</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleViewContract(contract)}
                                        className="px-3.5 py-1.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-violet-600/20 cursor-pointer"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>عرض وتوسيع الوثيقة</span>
                                    </button>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs leading-relaxed text-slate-300">
                                <h4 className="font-bold text-slate-200 mb-2">بنود وشروط الاتفاقية:</h4>
                                <p className="line-clamp-3">{contract.terms_text || contract.terms_and_conditions}</p>
                            </div>

                            {/* Footer dates & signature */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 pt-2">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                        <span>تاريخ البدء: {contract.start_date}</span>
                                    </span>
                                    {contract.end_date && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                            <span>تاريخ الانتهاء: {contract.end_date}</span>
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-violet-400 font-semibold">
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>عقد موثق وموقع إلكترونياً من قبل إدارة Go-Tech</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="glass-panel p-16 rounded-3xl border border-slate-800 text-center">
                        <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-white text-base mb-1">لا توجد عقود مسجلة حالياً</h4>
                        <p className="text-xs text-slate-400">يتم إبرام العقود وتوثيق نسب العمولات بالتنسيق مع إدارة المنصة.</p>
                    </div>
                )}
            </div>

            {/* Official Legal Agreement Modal */}
            <LegalAgreementModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                contract={selectedContract}
            />
        </AuthenticatedLayout>
    );
}
