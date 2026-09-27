import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

export default function SearchableSelect({
    options = [],
    value = '',
    onChange,
    placeholder = 'اختر من القائمة...',
    label = '',
    error = null,
    required = false,
    isClearable = true,
    disabled = false,
    className = '',
    searchPlaceholder = 'ابحث...',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    // Selected Option
    const selectedOption = useMemo(() => {
        return options.find((opt) => String(opt.value) === String(value)) || null;
    }, [options, value]);

    // Filtered Options
    const filteredOptions = useMemo(() => {
        if (!searchQuery.trim()) return options;
        const q = searchQuery.trim().toLowerCase();
        return options.filter((opt) => {
            const labelMatch = opt.label?.toLowerCase().includes(q);
            const subMatch = opt.sublabel?.toLowerCase().includes(q);
            const valueMatch = String(opt.value).toLowerCase().includes(q);
            return labelMatch || subMatch || valueMatch;
        });
    }, [options, searchQuery]);

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

    // Focus search input when open
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    const handleSelect = (option) => {
        if (onChange) {
            onChange(option.value);
        }
        setIsOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        if (onChange) {
            onChange('');
        }
        setSearchQuery('');
    };

    return (
        <div className={`space-y-1.5 relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={containerRef}>
            {label && (
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}

            <div className="relative">
                {/* Trigger Container */}
                <div
                    onClick={() => {
                        if (!disabled) setIsOpen(!isOpen);
                    }}
                    className={`w-full min-h-[42px] px-3.5 py-2 flex items-center justify-between gap-2 border rounded-2xl text-xs text-start transition-all select-none bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 ${
                        error
                            ? 'border-rose-500 ring-2 ring-rose-500/20'
                            : isOpen
                            ? 'border-violet-500 ring-2 ring-violet-500/20'
                            : 'border-slate-300 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    role="combobox"
                    aria-expanded={isOpen}
                    tabIndex={disabled ? -1 : 0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (!disabled) setIsOpen(!isOpen);
                        } else if (e.key === 'Escape') {
                            setIsOpen(false);
                        }
                    }}
                >
                    <div className="flex items-center gap-2 overflow-hidden flex-1">
                        {selectedOption?.icon && (
                            <span className="shrink-0 text-slate-400">{selectedOption.icon}</span>
                        )}
                        {selectedOption ? (
                            <div className="truncate">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">{selectedOption.label}</span>
                                {selectedOption.sublabel && (
                                    <span className="text-[10px] text-slate-500 ms-2 font-normal">
                                        ({selectedOption.sublabel})
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {isClearable && selectedOption && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                title="إلغاء التحديد"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-500' : ''}`} />
                    </div>
                </div>

                {/* Dropdown Menu */}
                {isOpen && (
                    <div className="absolute top-full start-0 end-0 mt-1.5 bg-white dark:bg-slate-900/98 backdrop-blur-2xl border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 max-h-72">
                        {/* Search Bar */}
                        <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 sticky top-0 z-10">
                            <div className="relative">
                                <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-2.5" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={searchPlaceholder}
                                    className="w-full ps-8 pe-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        {/* Options List */}
                        <div className="overflow-y-auto max-h-56 divide-y divide-slate-100 dark:divide-slate-800/30 p-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => {
                                    const isSelected = String(opt.value) === String(value);
                                    return (
                                        <button
                                            key={String(opt.value)}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(opt);
                                            }}
                                            className={`w-full px-3 py-2 flex items-center justify-between rounded-xl text-start text-xs transition-colors group cursor-pointer ${
                                                isSelected
                                                    ? 'bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-300 font-semibold'
                                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                                <div className="truncate">
                                                    <span className="block truncate">{opt.label}</span>
                                                    {opt.sublabel && (
                                                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate">{opt.sublabel}</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0 ps-2">
                                                {opt.badge && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        {opt.badge}
                                                    </span>
                                                )}
                                                {isSelected && <Check className="w-3.5 h-3.5 text-violet-500" />}
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                                    لا توجد نتائج مطابقة
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {error && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{error}</p>}
        </div>
    );
}
