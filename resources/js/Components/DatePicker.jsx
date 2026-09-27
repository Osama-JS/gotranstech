import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, RotateCcw } from 'lucide-react';

const MONTH_NAMES_AR = [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
];

const DAY_NAMES_AR = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

export default function DatePicker({
    value = '',
    onChange,
    label = '',
    placeholder = 'اختر التاريخ...',
    error = null,
    disabled = false,
    className = '',
    minDate = '',
    maxDate = '',
    isClearable = true,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Parse current value or fallback to today
    const parsedDate = value ? new Date(value + 'T00:00:00') : null;
    const isValidDate = parsedDate && !isNaN(parsedDate.getTime());

    const [viewYear, setViewYear] = useState(
        isValidDate ? parsedDate.getFullYear() : new Date().getFullYear()
    );
    const [viewMonth, setViewMonth] = useState(
        isValidDate ? parsedDate.getMonth() : new Date().getMonth()
    );

    // Sync view year/month when value changes
    useEffect(() => {
        if (isValidDate) {
            setViewYear(parsedDate.getFullYear());
            setViewMonth(parsedDate.getMonth());
        }
    }, [value]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calendar Calculations
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const formatDateString = (year, month, day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const handleSelectDay = (day) => {
        const formatted = formatDateString(viewYear, viewMonth, day);
        if (onChange) {
            onChange(formatted);
        }
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange) {
            onChange('');
        }
    };

    const handleSetToday = (e) => {
        e.stopPropagation();
        const today = new Date();
        const formatted = formatDateString(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        if (onChange) {
            onChange(formatted);
        }
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setIsOpen(false);
    };

    // Generate year range for quick selector
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 25 }, (_, i) => currentYear - 15 + i);

    return (
        <div className={`space-y-1.5 relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}

            <div className="relative">
                {/* Trigger Button */}
                <div
                    onClick={() => {
                        if (!disabled) setIsOpen(!isOpen);
                    }}
                    role="button"
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!disabled) setIsOpen(!isOpen);
                        } else if (e.key === 'Escape') {
                            setIsOpen(false);
                        }
                    }}
                    className={`w-full min-h-[42px] px-3.5 py-2 flex items-center justify-between gap-2 rounded-2xl text-xs transition-all select-none border ${
                        error
                            ? 'border-rose-500 ring-2 ring-rose-500/20'
                            : isOpen
                            ? 'border-violet-500 ring-2 ring-violet-500/20'
                            : 'border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
                    } bg-white dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                        <CalendarIcon className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-violet-500' : 'text-slate-400'}`} />
                        {value ? (
                            <span className="font-medium font-mono text-slate-900 dark:text-slate-100" dir="ltr">
                                {value}
                            </span>
                        ) : (
                            <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {isClearable && value && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="مسح التاريخ"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Calendar Dropdown Popover */}
                {isOpen && (
                    <div
                        className="absolute top-full start-0 mt-1.5 w-72 bg-white dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl z-[100] overflow-hidden p-3.5 animate-in fade-in zoom-in-95 duration-150"
                        dir="rtl"
                    >
                        {/* Month / Year Header */}
                        <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <button
                                type="button"
                                onClick={prevMonth}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                title="الشهر السابق"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1.5">
                                <select
                                    value={viewMonth}
                                    onChange={(e) => setViewMonth(Number(e.target.value))}
                                    className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 px-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none cursor-pointer"
                                >
                                    {MONTH_NAMES_AR.map((mName, idx) => (
                                        <option key={idx} value={idx}>
                                            {mName}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={viewYear}
                                    onChange={(e) => setViewYear(Number(e.target.value))}
                                    className="bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold py-1 px-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none font-mono cursor-pointer"
                                >
                                    {years.map((y) => (
                                        <option key={y} value={y}>
                                            {y}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="button"
                                onClick={nextMonth}
                                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                                title="الشهر التالي"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Day of Week Labels */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
                            {DAY_NAMES_AR.map((dName, idx) => (
                                <div
                                    key={idx}
                                    className="text-[10px] font-bold text-slate-400 dark:text-slate-500 py-0.5"
                                >
                                    {dName}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {/* Previous Month Padding */}
                            {Array.from({ length: firstDayOfMonth }).map((_, idx) => {
                                const dayNum = daysInPrevMonth - firstDayOfMonth + idx + 1;
                                return (
                                    <div
                                        key={`prev-${idx}`}
                                        className="h-7 flex items-center justify-center text-[11px] text-slate-300 dark:text-slate-600 select-none"
                                    >
                                        {dayNum}
                                    </div>
                                );
                            })}

                            {/* Current Month Days */}
                            {Array.from({ length: daysInMonth }).map((_, idx) => {
                                const dayNum = idx + 1;
                                const dateStr = formatDateString(viewYear, viewMonth, dayNum);
                                const isSelected = value === dateStr;

                                const todayStr = formatDateString(
                                    new Date().getFullYear(),
                                    new Date().getMonth(),
                                    new Date().getDate()
                                );
                                const isToday = dateStr === todayStr;

                                return (
                                    <button
                                        key={`day-${dayNum}`}
                                        type="button"
                                        onClick={() => handleSelectDay(dayNum)}
                                        className={`h-7 w-full flex items-center justify-center rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#6320EE] text-white font-bold shadow-md shadow-violet-600/30'
                                                : isToday
                                                ? 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-300 dark:border-violet-500/30'
                                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                    >
                                        {dayNum}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Quick Action Footer */}
                        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs">
                            <button
                                type="button"
                                onClick={handleSetToday}
                                className="px-2.5 py-1 text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                            >
                                <RotateCcw className="w-3 h-3" />
                                <span>اليوم</span>
                            </button>

                            {value && (
                                <button
                                    type="button"
                                    onClick={handleClear}
                                    className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                >
                                    مسح التحديد
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{error}</p>}
        </div>
    );
}
