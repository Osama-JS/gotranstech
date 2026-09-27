import React from 'react';
import Modal from './Modal';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title = 'تأكيد العملية',
    message = 'هل أنت متأكد من رغبتك في متابعة هذا الإجراء؟',
    confirmText = 'تأكيد ومتابعة',
    cancelText = 'إلغاء التراجع',
    type = 'danger', // danger, warning, primary, success
    isLoading = false,
}) {
    const typeConfig = {
        danger: {
            icon: <AlertTriangle className="w-10 h-10 text-rose-500" />,
            btnClass: 'bg-rose-600 hover:bg-rose-500 text-white',
            borderClass: 'border-rose-500/20 bg-rose-50 dark:bg-rose-950/30',
        },
        warning: {
            icon: <AlertTriangle className="w-10 h-10 text-amber-500" />,
            btnClass: 'bg-amber-600 hover:bg-amber-500 text-white',
            borderClass: 'border-amber-500/20 bg-amber-50 dark:bg-amber-950/30',
        },
        success: {
            icon: <CheckCircle className="w-10 h-10 text-violet-500" />,
            btnClass: 'bg-[#6320EE] hover:bg-[#5217D4] text-white',
            borderClass: 'border-violet-500/20 bg-violet-50 dark:bg-violet-950/30',
        },
        primary: {
            icon: <HelpCircle className="w-10 h-10 text-blue-500" />,
            btnClass: 'bg-blue-600 hover:bg-blue-500 text-white',
            borderClass: 'border-blue-500/20 bg-blue-50 dark:bg-blue-950/30',
        },
    }[type] || typeConfig.danger;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
            <div className="flex flex-col items-center text-center p-2">
                <div className={`p-4 rounded-2xl border mb-4 ${typeConfig.borderClass}`}>
                    {typeConfig.icon}
                </div>

                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {message}
                </p>

                <div className="flex items-center gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold rounded-xl text-sm transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                        }}
                        disabled={isLoading}
                        className={`flex-1 py-2.5 px-4 font-semibold rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${typeConfig.btnClass} ${
                            isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : null}
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
