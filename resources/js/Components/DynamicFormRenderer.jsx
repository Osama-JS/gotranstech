import React from 'react';
import { Calendar, FileText, CheckSquare, ListFilter, Hash, AlignLeft, UploadCloud } from 'lucide-react';
import DatePicker from './DatePicker';

export default function DynamicFormRenderer({
    fields = [],
    values = {},
    onChange,
    errors = {},
    disabled = false,
}) {
    if (!fields || fields.length === 0) {
        return (
            <div className="p-6 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                لا توجد حقول إضافية مخصصة لهذا القالب حالياً.
            </div>
        );
    }

    const handleFieldChange = (fieldName, value) => {
        if (onChange) {
            onChange(fieldName, value);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
                const val = values[field.name] ?? '';
                const error = errors[field.name] || errors[`additional_data.${field.name}`];
                const isFullWidth = field.type === 'textarea' || field.type === 'file';

                return (
                    <div
                        key={field.id || field.name}
                        className={`space-y-1.5 ${isFullWidth ? 'md:col-span-2' : ''}`}
                    >
                        <label className="block text-xs font-semibold text-slate-300">
                            {field.label}
                            {field.is_required && <span className="text-rose-400 mr-1">*</span>}
                        </label>

                        {/* Field Types */}
                        {field.type === 'text' && (
                            <input
                                type="text"
                                value={val}
                                disabled={disabled}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.placeholder || field.label}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                            />
                        )}

                        {field.type === 'number' && (
                            <input
                                type="number"
                                value={val}
                                disabled={disabled}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.placeholder || '0'}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500 disabled:opacity-50"
                            />
                        )}

                        {field.type === 'select' && (
                            <select
                                value={val}
                                disabled={disabled}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500 disabled:opacity-50"
                            >
                                <option value="">-- {field.placeholder || 'اختر قيمة'} --</option>
                                {Array.isArray(field.options) &&
                                    field.options.map((opt, i) => (
                                        <option key={i} value={typeof opt === 'object' ? opt.value : opt}>
                                            {typeof opt === 'object' ? opt.label : opt}
                                        </option>
                                    ))}
                            </select>
                        )}

                        {field.type === 'date' && (
                            <DatePicker
                                value={val}
                                onChange={(v) => handleFieldChange(field.name, v)}
                                placeholder={field.placeholder || 'اختر التاريخ'}
                                error={error}
                            />
                        )}

                        {field.type === 'textarea' && (
                            <textarea
                                rows={3}
                                value={val}
                                disabled={disabled}
                                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                placeholder={field.placeholder || 'أدخل التفاصيل هنا...'}
                                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 disabled:opacity-50"
                            />
                        )}

                        {field.type === 'checkbox' && (
                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input
                                    type="checkbox"
                                    checked={!!val}
                                    disabled={disabled}
                                    onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-700 text-violet-500 focus:ring-violet-500 bg-slate-950"
                                />
                                <span className="text-xs text-slate-300 font-medium">
                                    {field.placeholder || 'نعم، أوافق على هذا البند'}
                                </span>
                            </label>
                        )}

                        {field.type === 'file' && (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={val}
                                    disabled={disabled}
                                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                                    placeholder={field.placeholder || 'رابط أو مسار المستند المرفوع'}
                                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500 disabled:opacity-50"
                                />
                                <span className="text-[10px] text-slate-500 mt-1 block">
                                    * أدخل مسار أو رابط الوثيقة/المستند المطلوب
                                </span>
                            </div>
                        )}

                        {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
                    </div>
                );
            })}
        </div>
    );
}
