import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
    X, 
    ZoomIn, 
    ZoomOut, 
    RotateCw, 
    RotateCcw, 
    Download, 
    ExternalLink, 
    FileText, 
    Eye, 
    CheckCircle, 
    Clock, 
    Building2,
    DollarSign,
    RefreshCw
} from 'lucide-react';

export default function ReceiptViewerModal({ isOpen, onClose, deposit }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !deposit || !mounted || typeof document === 'undefined') return null;

    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);

    const receiptUrl = deposit.receipt_url || deposit.url || deposit.file_url || (
        (deposit.receipt_file_path || deposit.receipt_path || deposit.pdf_file_path || deposit.signed_pdf_file_path)
            ? `/storage/${deposit.receipt_file_path || deposit.receipt_path || deposit.pdf_file_path || deposit.signed_pdf_file_path}`
            : ''
    );
    const isPdf = deposit.is_pdf ?? (
        (receiptUrl || deposit.receipt_file_path || deposit.receipt_path || deposit.pdf_file_path || '').toLowerCase().includes('.pdf')
    );

    // Reset view state when modal opens with new deposit
    useEffect(() => {
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
        setLoading(true);
    }, [deposit?.id]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleRotate = () => setRotation(prev => (prev + 90) % 360);
    const handleReset = () => {
        setZoom(1);
        setRotation(0);
        setPan({ x: 0, y: 0 });
    };

    const handleMouseDown = (e) => {
        if (isPdf) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e) => {
        if (!isDragging || isPdf) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => setIsDragging(false);

    return createPortal(
        <div 
            className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/90 backdrop-blur-md animate-fadeIn"
            dir="rtl"
        >
            {/* Top Toolbar (WhatsApp Web Style) */}
            <div className="h-16 px-4 sm:px-6 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between text-white shrink-0 select-none shadow-lg">
                {/* File & Depositor Info */}
                <div className="flex items-center gap-3 truncate">
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                        {isPdf ? <FileText className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </div>
                    <div className="truncate">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-100 truncate">
                                {deposit.title || deposit.description || `إيصال: ${deposit.depositor_name || deposit.user?.name || deposit.sender_name || 'مستند مالي'}`}
                            </span>
                            {(deposit.deposit_number || deposit.request_number || deposit.number) && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-mono font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                    #{deposit.deposit_number || deposit.request_number || deposit.number}
                                </span>
                            )}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2">
                            {(deposit.amount !== undefined || deposit.requested_amount !== undefined) && (
                                <span>المبلغ: <strong className="text-orange-400 font-mono">{parseFloat(deposit.amount ?? deposit.requested_amount ?? 0).toLocaleString('en-US')} ر.س</strong></span>
                            )}
                            {deposit.bank_name && (
                                <>
                                    <span>•</span>
                                    <span>{deposit.bank_name}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-1 sm:gap-2">
                    {!isPdf && (
                        <>
                            <button
                                type="button"
                                onClick={handleZoomIn}
                                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="تكبير (+)"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleZoomOut}
                                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="تصغير (-)"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRotate}
                                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="تدوير (↻)"
                            >
                                <RotateCw className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                title="إعادة ضبط العرض"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <div className="w-[1px] h-6 bg-slate-800 mx-1" />
                        </>
                    )}

                    {/* Open in new tab */}
                    <a
                        href={receiptUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="فتح في علامة تبويب جديدة"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    {/* Direct Download */}
                    <a
                        href={receiptUrl}
                        download={`receipt_${deposit.deposit_number}.${isPdf ? 'pdf' : 'jpg'}`}
                        className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="تحميل الملف"
                    >
                        <Download className="w-4 h-4" />
                    </a>

                    <div className="w-[1px] h-6 bg-slate-800 mx-1" />

                    {/* Close button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="إغلاق المعاينة (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Viewer Content Viewport */}
            <div 
                className="flex-1 overflow-hidden relative flex items-center justify-center p-2 sm:p-6 select-none cursor-grab active:cursor-grabbing"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
            >
                {/* PDF Viewer */}
                {isPdf ? (
                    <div className="w-full h-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 flex flex-col">
                        <iframe
                            src={`${receiptUrl}#toolbar=1&navpanes=0`}
                            className="w-full h-full border-none"
                            title="معاينة إيصال الإيداع PDF"
                            onLoad={() => setLoading(false)}
                        />
                    </div>
                ) : (
                    /* Image Viewer with Zoom, Rotation & Pan */
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        <img
                            src={receiptUrl}
                            alt="إيصال الإيداع البنكي"
                            draggable={false}
                            onLoad={() => setLoading(false)}
                            style={{
                                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
                                maxHeight: '82vh',
                                maxWidth: '90vw',
                            }}
                            className="object-contain rounded-xl shadow-2xl pointer-events-auto cursor-pointer"
                        />
                    </div>
                )}
            </div>

            {/* Bottom Metadata Info Bar */}
            <div className="h-12 bg-slate-900/90 border-t border-slate-800 px-6 flex items-center justify-between text-xs text-slate-400 shrink-0 select-none">
                <div className="flex items-center gap-4">
                    <span>الرقم المرجعي: <strong className="font-mono text-slate-200">{deposit.bank_reference_number || 'غير متوفر'}</strong></span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">تاريخ الإيداع: <strong className="font-mono text-slate-200">{deposit.transfer_date || new Date(deposit.created_at).toLocaleDateString('ar-SA')}</strong></span>
                </div>
                <div>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                        deposit.status === 'approved' 
                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                            : deposit.status === 'pending'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}>
                        {deposit.status === 'approved' ? 'معتمد' : (deposit.status === 'pending' ? 'قيد المراجعة' : 'مرفوض')}
                    </span>
                </div>
            </div>
        </div>,
        document.body
    );
}
