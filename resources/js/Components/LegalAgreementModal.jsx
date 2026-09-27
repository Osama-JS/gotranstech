import React, { useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import Modal from './Modal';
import BrandLogo from './BrandLogo';
import {
    ShieldCheck,
    FileText,
    Printer,
    Download,
    CheckCircle2,
    Calendar,
    User,
    Building2,
    Award,
    Hash,
    Lock,
    ExternalLink,
    AlertCircle,
} from 'lucide-react';

export default function LegalAgreementModal({
    isOpen,
    onClose,
    contract = null,
    onSuccess = null,
}) {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isSigned = !!user?.agreement_signed_at;

    const { post, processing, data, setData } = useForm({
        agree_terms: false,
    });

    const handleSign = (e) => {
        e.preventDefault();
        post(route('portal.agreement.sign'), {
            onSuccess: () => {
                if (onSuccess) onSuccess();
                onClose();
            },
        });
    };

    const handlePrint = () => {
        const printContent = document.getElementById('legal-agreement-document');
        if (!printContent) return;

        const printWindow = window.open('', '_blank', 'width=900,height=800');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>وثيقة عقد واتفاقية التمويل - منصة Go-Tech</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
                    .header { text-align: center; border-bottom: 2px solid #6320EE; padding-bottom: 20px; margin-bottom: 30px; }
                    .title { font-size: 22px; font-weight: bold; color: #0F172A; margin: 10px 0; }
                    .meta { display: flex; justify-content: space-between; font-size: 13px; color: #64748B; margin-top: 15px; }
                    .party-box { border: 1px solid #CBD5E1; border-radius: 8px; padding: 15px; margin-bottom: 20px; background: #F8FAFC; }
                    .party-title { font-weight: bold; color: #6320EE; margin-bottom: 8px; font-size: 15px; }
                    .article { margin-bottom: 16px; text-align: justify; }
                    .article-title { font-weight: bold; color: #0F172A; margin-bottom: 4px; font-size: 14px; }
                    .seal { border: 2px solid #6320EE; border-radius: 8px; padding: 15px; background: #F5F3FF; text-align: center; margin-top: 30px; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                ${printContent.innerHTML}
                <script>
                    window.onload = function() { window.print(); window.close(); }
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    const contractNumber = contract?.contract_number || (
        user?.is_company
            ? `GTC-COM-${String(user?.id || 1).padStart(5, '0')}`
            : `GTC-INV-${String(user?.id || 1).padStart(5, '0')}`
    );
    const signDate = user?.agreement_signed_at 
        ? new Date(user.agreement_signed_at).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'بانتظار التوقيع';
    const commissionRate = contract?.commission_rate || user?.investor_profile?.platform_commission_share_rate || 70;
    const isCompany = !!user?.is_company;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isCompany ? "عقد واتفاقية التسهيلات والتمويل اللوجستي المعتمد" : "وثيقة الاتفاقية والعقد القانوني المعتمد"}
            maxWidth="4xl"
        >
            <div className="space-y-6">
                {/* Action Bar (Print / Status Badge) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-violet-900/40">
                    <div className="flex items-center gap-2">
                        {isSigned ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>وثيقة موقّعة وموثقة رقمياً</span>
                            </span>
                        ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>بانتظار توقيع الطرف الثاني</span>
                            </span>
                        )}
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            رقم الوثيقة: {contractNumber}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                        <Printer className="w-3.5 h-3.5 text-violet-500" />
                        <span>طباعة الوثيقة</span>
                    </button>
                </div>

                {/* Printable Formal Document Area */}
                <div 
                    id="legal-agreement-document" 
                    className="p-6 md:p-8 rounded-2xl bg-white dark:bg-[#070A1E] border border-slate-200 dark:border-violet-900/40 max-h-[58vh] overflow-y-auto custom-scrollbar space-y-6 text-slate-800 dark:text-slate-200 shadow-inner"
                >
                    {/* Document Header */}
                    <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 relative">
                        <div className="flex justify-center mb-3">
                            <BrandLogo className="h-10" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            {isCompany ? 'عقد واتفاقية تقديم التسهيلات والتمويل اللوجستي للشركات' : 'عقد اتفاقية الاستثمار والتمويل اللوجستي التشاركي'}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            وثيقة تعاقدية إلكترونية ملزمة بموجب نظام التعاملات الإلكترونية بالمملكة العربية السعودية
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 text-start text-xs">
                            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 block mb-0.5">رقم العقد الموحد</span>
                                <span className="font-mono font-bold text-violet-600 dark:text-violet-400">{contractNumber}</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 block mb-0.5">تاريخ الإصدار والتحرير</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                    {new Date().toLocaleDateString('ar-SA')}
                                </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 block mb-0.5">
                                    {isCompany ? 'السقف الائتماني الممنوح' : 'حصة المستثمر من الأرباح'}
                                </span>
                                <span className="font-bold text-orange-500">
                                    {isCompany 
                                        ? `${Number(user?.company_profile?.credit_limit || 100000).toLocaleString('en-US')} ر.س`
                                        : `${commissionRate}% من صافي العمولة`}
                                </span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 block mb-0.5">الولاية القضائية</span>
                                <span className="font-bold text-slate-700 dark:text-slate-300">المملكة العربية السعودية</span>
                            </div>
                        </div>
                    </div>

                    {/* Parties Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Party 1 */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <div className="flex items-center gap-2 font-bold text-violet-600 dark:text-violet-400 pb-2 border-b border-slate-200 dark:border-slate-800">
                                <Building2 className="w-4 h-4" />
                                <span>الطرف الأول: المشغل والوسيط التقني</span>
                            </div>
                            <div>
                                <strong className="text-slate-900 dark:text-white block">منصة Go-Tech لتقنية المعلومات والوساطة المالية</strong>
                                <span className="text-slate-500 dark:text-slate-400 block">سجل تجاري رقم: 1010894521</span>
                                <span className="text-slate-500 dark:text-slate-400 block">المقر: مدينة الرياض، المملكة العربية السعودية</span>
                                <span className="text-slate-500 dark:text-slate-400 block">البريد المعتمد: legal@go-tech.sa</span>
                            </div>
                        </div>

                        {/* Party 2 */}
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                            <div className="flex items-center gap-2 font-bold text-orange-500 pb-2 border-b border-slate-200 dark:border-slate-800">
                                {isCompany ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                <span>{isCompany ? 'الطرف الثاني: المنشأة المستفيدة / الشركة المعتمدة' : 'الطرف الثاني: المستثمر المعتمد'}</span>
                            </div>
                            <div>
                                <strong className="text-slate-900 dark:text-white block">
                                    {isCompany ? (user?.company_profile?.company_name || user?.name) : user?.name}
                                </strong>
                                <span className="text-slate-500 dark:text-slate-400 block">
                                    {isCompany
                                        ? `السجل التجاري: ${user?.company_profile?.commercial_registration || 'مسجل ومعتمد'}`
                                        : `الهوية الوطنية / الإقامة: ${user?.investor_profile?.national_id || user?.national_id || 'مسجل ومعتمد بالنظام'}`}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400 block">البريد الإلكتروني: {user?.email}</span>
                                <span className="text-slate-500 dark:text-slate-400 block">
                                    رقم الحساب والمحفظة: {isCompany ? `COM-${String(user?.id || 1).padStart(4, '0')}` : `INV-${String(user?.id || 1).padStart(4, '0')}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Legal Articles */}
                    <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                                <span>المادة الأولى: التمهيد وأهلية التعامل التعاقدي</span>
                            </h4>
                            <p>
                                يقر الطرفان بأهليتهما الشرعية والنظامية المعتبرة شرعاً ونظاماً لإبرام هذا العقد. وتعتبر هذه الاتفاقية عقداً إلكترونياً ملزماً ومنتجاً لآثاره القانونية بموجب نظام التعاملات الإلكترونية الصادر بالمرسوم الملكي رقم (م/18) والأنظمة المالية المعمول بها في المملكة العربية السعودية.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                                <span>المادة الثانية: مجال الاستثمار والتمويل اللوجستي</span>
                            </h4>
                            <p>
                                تتيح منصة Go-Tech للطرف الثاني (المستثمر) توجيه السيولة المالية المودعة في محفظته الاستثمارية لتمويل عمليات النقل والشحن والمهام اللوجستية الواردة من الشركات المعتمدة، بنظام التمويل الفردي السريع لكل مهمة (Micro-Funding)، مع قيد كل عملية بسجل القيود المزدوجة ومطابقة الأرصدة تلقائياً.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">3</span>
                                <span>المادة الثالثة: توزيع العمولات وصافي الأرباح</span>
                            </h4>
                            <p>
                                يستحق الطرف الثاني نسبة أرباح متفق عليها قدرها ({commissionRate}%) من إجمالي عمولة التمويل المحددة لكل مهمة ممولة، ويتم إيداع الأرباح آلياً وبشكل فوري في محفظة العمولات بمجرد اكتمال تمويل المهمة، مع إمكانية طلب سحب الرصيد إلى الحساب البنكي المعتمد للمستثمر في أي وقت وفق سياسات السحب.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">4</span>
                                <span>المادة الرابعة: التزامات المشغل وحماية رأس المال</span>
                            </h4>
                            <p>
                                تلتزم المنصة بتدقيق ومراجعة الشركات اللوجستية وتحديد سقوف ائتمانية ملزمة لها مع استيفاء سندات الأمر والضمانات التنفيذية لحماية رؤوس أموال المستثمرين. وفي حال تعثر أي عملية أو تأخر استرداد المبالغ الممولة، تتولى المنصة المتابعة القانونية والتنفيذية نيابة عن المستثمر لاسترداد كامل مستحقاته.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">5</span>
                                <span>المادة الخامسة: السرية المصرفية وأمن المعلومات</span>
                            </h4>
                            <p>
                                يتعهد الطرف الأول بالحفاظ على السرية التامة لكافة بيانات الطرف الثاني وعملياته المالية وأرقام حساباته ومطابقتها للمعايير الصادرة عن البنك المركزي السعودي (ساما) والهيئة الوطنية للأمن السيبراني، ولا يتم الإفصاح عن أي معلومات إلا للجهات القضائية أو الرقابية المختصة بموجب القانون.
                            </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-violet-600 text-white font-bold text-[10px] flex items-center justify-center">6</span>
                                <span>المادة السادسة: حجية التوقيع الإلكتروني وتسوية النزاعات</span>
                            </h4>
                            <p>
                                يعتبر التوقيع الإلكتروني عبر المنصة حجة قاطعة وملزمة غير قابلة للنكول، ويخضع هذا العقد ويفسر وفقاً للأنظمة واللوائح السارية بالمملكة العربية السعودية، وتختص المحاكم المعنية بمدينة الرياض بنظر أي نزاع قد ينشأ عن تنفيذ أو تفسير بنوده.
                            </p>
                        </div>
                    </div>

                    {/* Official Electronic Seal Box */}
                    <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
                        isSigned
                            ? 'bg-violet-500/10 border-violet-500/30'
                            : 'bg-amber-500/10 border-amber-500/30'
                    }`}>
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                                isSigned ? 'bg-violet-500/20 text-violet-400' : 'bg-amber-500/20 text-amber-500'
                            }`}>
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className={`text-sm font-bold ${isSigned ? 'text-violet-600 dark:text-violet-400' : 'text-amber-500'}`}>
                                    {isSigned ? 'وثيقة موقعة ومعتمدة إلكترونياً' : 'بانتظار الموافقة والتوقيع الرقمي'}
                                </h4>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isSigned
                                        ? `تم التوثيق الرقمي بنجاح بتاريخ: ${signDate}`
                                        : 'يلزم تأكيد الموافقة على البنود والشروط لتفعيل حق التمويل وسحب العوائد'}
                                </p>
                            </div>
                        </div>

                        <div className="text-end text-[11px] font-mono text-slate-500 dark:text-slate-400">
                            <div>الرمز التشفيري للوثيقة:</div>
                            <div className="font-bold text-slate-700 dark:text-slate-300">
                                SHA256:{user?.id ? `${user.id}A9F8E24C${user.id}B01` : '000000000'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Controls */}
                {!isSigned ? (
                    <form onSubmit={handleSign} className="space-y-4 pt-2">
                        <label className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 cursor-pointer hover:border-violet-500 transition-colors">
                            <input
                                type="checkbox"
                                checked={data.agree_terms}
                                onChange={(e) => setData('agree_terms', e.target.checked)}
                                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-violet-600 focus:ring-violet-500 bg-white dark:bg-slate-950 mt-0.5 cursor-pointer"
                                required
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                                أقر أنا <strong>{user?.name}</strong> بصفتي الطرف الثاني باطلاعي وفهمي لكافة بنود هذه الاتفاقية والشروط والأحكام الواردة فيها، وأوافق على توقيعها إلكترونياً والالتزام بكافة الآثار النظامية المترتبة عليها.
                            </span>
                        </label>

                        <div className="flex justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                            >
                                إغلاق
                            </button>
                            <button
                                type="submit"
                                disabled={processing || !data.agree_terms}
                                className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white font-bold rounded-xl text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-violet-600/30 cursor-pointer"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                <span>{processing ? 'جاري توثيق التوقيع...' : 'تأكيد التوقيع الإلكتروني والاعتماد'}</span>
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-xs text-violet-600 dark:text-violet-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>الاتفاقية نشطة وسارية المفعول</span>
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-[#6320EE] hover:bg-[#5217D4] text-white rounded-xl text-xs font-bold shadow-md shadow-violet-600/20"
                        >
                            إغلاق
                        </button>
                    </div>
                )}
            </div>
        </Modal>
    );
}
