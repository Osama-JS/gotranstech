import React, { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast() {
    const { flash } = usePage().props;
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState('success'); // success, error, warning, info

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setVisible(true);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setVisible(true);
        } else if (flash?.warning) {
            setMessage(flash.warning);
            setType('warning');
            setVisible(true);
        } else if (flash?.info) {
            setMessage(flash.info);
            setType('info');
            setVisible(true);
        }
    }, [flash]);

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                setVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible || !message) return null;

    const styles = {
        success: {
            border: 'border-violet-500/30',
            bg: 'bg-violet-950/90 text-violet-100',
            icon: <CheckCircle2 className="w-5 h-5 text-violet-400 shrink-0" />,
        },
        error: {
            border: 'border-rose-500/30',
            bg: 'bg-rose-950/90 text-rose-100',
            icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
        },
        warning: {
            border: 'border-amber-500/30',
            bg: 'bg-amber-950/90 text-amber-100',
            icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
        },
        info: {
            border: 'border-blue-500/30',
            bg: 'bg-blue-950/90 text-blue-100',
            icon: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
        },
    }[type] || styles.success;

    return (
        <div className="fixed bottom-6 left-6 z-50 max-w-md w-full animate-bounce-short">
            <div className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl ${styles.bg} ${styles.border}`}>
                {styles.icon}
                <div className="flex-1 text-sm font-medium leading-relaxed">
                    {message}
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="text-slate-400 hover:text-slate-200 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
