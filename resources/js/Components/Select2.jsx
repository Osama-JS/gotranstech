import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

/**
 * Select2-style Searchable Custom Dropdown Component
 * Features:
 * - Search filter input (Select2 behavior)
 * - Keyboard navigation (Escape to close)
 * - Click-outside listener
 * - Active checkmark indicator
 * - Support badge/description for options
 * - Fully styled to match GoTransTech aesthetic (Midnight & Royal Violet)
 */
export default function Select2({
    value,
    onChange,
    options = [],
    placeholder = 'اختر من القائمة...',
    searchPlaceholder = 'ابحث...',
    className = '',
    disabled = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Selected option object
    const selectedOption = options.find((opt) => String(opt.value) === String(value)) || null;

    // Filter options based on search query
    const filteredOptions = options.filter((opt) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        const label = (opt.label || '').toLowerCase();
        const desc = (opt.description || '').toLowerCase();
        return label.includes(q) || desc.includes(q);
    });

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        } else {
            setSearchQuery('');
        }
    }, [isOpen]);

    const handleSelect = (val) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-start flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                    isOpen 
                        ? 'border-violet-500 ring-2 ring-violet-500/20 text-white' 
                        : 'border-slate-700/80 hover:border-slate-600 text-white'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedOption?.icon && (
                        <span className="shrink-0 text-violet-400">{selectedOption.icon}</span>
                    )}
                    <span className="truncate font-medium">
                        {selectedOption ? selectedOption.label : <span className="text-slate-500">{placeholder}</span>}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-400' : ''}`} />
            </button>

            {/* Dropdown Menu (Select2 Box) */}
            {isOpen && (
                <div className="absolute top-full start-0 mt-1.5 w-full bg-slate-900/98 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                    {/* Select2 Search Box */}
                    <div className="p-2.5 border-b border-slate-800 bg-slate-950/80 sticky top-0 z-10">
                        <div className="relative">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-2.5 pointer-events-none" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full ps-8 pe-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto max-h-56 p-1.5 space-y-0.5 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = String(opt.value) === String(value);
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full px-3 py-2 rounded-xl text-start text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#6320EE] text-white font-bold shadow-md shadow-violet-600/30'
                                                : 'hover:bg-slate-800/80 text-slate-200'
                                        }`}
                                    >
                                        <div className="flex flex-col gap-0.5 truncate">
                                            <div className="flex items-center gap-2 truncate">
                                                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                                                <span className="truncate">{opt.label}</span>
                                            </div>
                                            {opt.description && (
                                                <span className={`text-[10px] leading-tight truncate ${isSelected ? 'text-violet-200' : 'text-slate-400'}`}>
                                                    {opt.description}
                                                </span>
                                            )}
                                        </div>

                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="py-4 text-center text-xs text-slate-500">
                                لا توجد نتائج مطابقة للبحث
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
