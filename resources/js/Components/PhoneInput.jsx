import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Phone, ChevronDown, Search, Check, Globe } from 'lucide-react';

export const COUNTRIES = [
    // GCC & Arab Countries (Prioritized)
    { code: '+966', iso: 'SA', nameAr: 'المملكة العربية السعودية', nameEn: 'Saudi Arabia', flag: '🇸🇦', placeholder: '50 123 4567' },
    { code: '+971', iso: 'AE', nameAr: 'الإمارات العربية المتحدة', nameEn: 'United Arab Emirates', flag: '🇦🇪', placeholder: '50 123 4567' },
    { code: '+965', iso: 'KW', nameAr: 'الكويت', nameEn: 'Kuwait', flag: '🇰🇼', placeholder: '5012 3456' },
    { code: '+974', iso: 'QA', nameAr: 'قطر', nameEn: 'Qatar', flag: '🇶🇦', placeholder: '3312 3456' },
    { code: '+973', iso: 'BH', nameAr: 'البحرين', nameEn: 'Bahrain', flag: '🇧🇭', placeholder: '3612 3456' },
    { code: '+968', iso: 'OM', nameAr: 'عُمان', nameEn: 'Oman', flag: '🇴🇲', placeholder: '9123 4567' },
    { code: '+20',  iso: 'EG', nameAr: 'مصر', nameEn: 'Egypt', flag: '🇪🇬', placeholder: '10 1234 5678' },
    { code: '+962', iso: 'JO', nameAr: 'الأردن', nameEn: 'Jordan', flag: '🇯🇴', placeholder: '7 9123 4567' },
    { code: '+964', iso: 'IQ', nameAr: 'العراق', nameEn: 'Iraq', flag: '🇮🇶', placeholder: '770 123 4567' },
    { code: '+967', iso: 'YE', nameAr: 'اليمن', nameEn: 'Yemen', flag: '🇾🇪', placeholder: '77 123 4567' },
    { code: '+961', iso: 'LB', nameAr: 'لبنان', nameEn: 'Lebanon', flag: '🇱🇧', placeholder: '70 123 456' },
    { code: '+963', iso: 'SY', nameAr: 'سوريا', nameEn: 'Syria', flag: '🇸🇾', placeholder: '944 123 456' },
    { code: '+970', iso: 'PS', nameAr: 'فلسطين', nameEn: 'Palestine', flag: '🇵🇸', placeholder: '59 123 4567' },
    { code: '+212', iso: 'MA', nameAr: 'المغرب', nameEn: 'Morocco', flag: '🇲🇦', placeholder: '6 12 34 56 78' },
    { code: '+213', iso: 'DZ', nameAr: 'الجزائر', nameEn: 'Algeria', flag: '🇩🇿', placeholder: '550 12 34 56' },
    { code: '+216', iso: 'TN', nameAr: 'تونس', nameEn: 'Tunisia', flag: '🇹🇳', placeholder: '20 123 456' },
    { code: '+218', iso: 'LY', nameAr: 'ليبيا', nameEn: 'Libya', flag: '🇱🇾', placeholder: '91 123 4567' },
    { code: '+249', iso: 'SD', nameAr: 'السودان', nameEn: 'Sudan', flag: '🇸🇩', placeholder: '91 123 4567' },

    // International
    { code: '+90',  iso: 'TR', nameAr: 'تركيا', nameEn: 'Turkey', flag: '🇹🇷', placeholder: '501 234 56 78' },
    { code: '+1',   iso: 'US', nameAr: 'الولايات المتحدة الأمريكية', nameEn: 'United States', flag: '🇺🇸', placeholder: '(555) 123-4567' },
    { code: '+44',  iso: 'GB', nameAr: 'المملكة المتحدة', nameEn: 'United Kingdom', flag: '🇬🇧', placeholder: '7911 123456' },
    { code: '+49',  iso: 'DE', nameAr: 'ألمانيا', nameEn: 'Germany', flag: '🇩🇪', placeholder: '151 12345678' },
    { code: '+33',  iso: 'FR', nameAr: 'فرنسا', nameEn: 'France', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
    { code: '+39',  iso: 'IT', nameAr: 'إيطاليا', nameEn: 'Italy', flag: '🇮🇹', placeholder: '312 345 6789' },
    { code: '+34',  iso: 'ES', nameAr: 'إسبانيا', nameEn: 'Spain', flag: '🇪🇸', placeholder: '612 34 56 78' },
    { code: '+1',   iso: 'CA', nameAr: 'كندا', nameEn: 'Canada', flag: '🇨🇦', placeholder: '(555) 123-4567' },
    { code: '+61',  iso: 'AU', nameAr: 'أستراليا', nameEn: 'Australia', flag: '🇦🇺', placeholder: '412 345 678' },
    { code: '+86',  iso: 'CN', nameAr: 'الصين', nameEn: 'China', flag: '🇨🇳', placeholder: '131 1234 5678' },
    { code: '+91',  iso: 'IN', nameAr: 'الهند', nameEn: 'India', flag: '🇮🇳', placeholder: '98123 45678' },
    { code: '+92',  iso: 'PK', nameAr: 'باكستان', nameEn: 'Pakistan', flag: '🇵🇰', placeholder: '300 1234567' },
    { code: '+880', iso: 'BD', nameAr: 'بنغلاديش', nameEn: 'Bangladesh', flag: '🇧🇩', placeholder: '1712 345678' },
    { code: '+60',  iso: 'MY', nameAr: 'ماليزيا', nameEn: 'Malaysia', flag: '🇲🇾', placeholder: '12 345 6789' },
    { code: '+65',  iso: 'SG', nameAr: 'سنغافورة', nameEn: 'Singapore', flag: '🇸🇬', placeholder: '8123 4567' },
    { code: '+62',  iso: 'ID', nameAr: 'إندونيسيا', nameEn: 'Indonesia', flag: '🇮🇩', placeholder: '812 3456 7890' },
    { code: '+81',  iso: 'JP', nameAr: 'اليابان', nameEn: 'Japan', flag: '🇯🇵', placeholder: '90 1234 5678' },
    { code: '+82',  iso: 'KR', nameAr: 'كوريا الجنوبية', nameEn: 'South Korea', flag: '🇰🇷', placeholder: '10 1234 5678' },
    { code: '+55',  iso: 'BR', nameAr: 'البرازيل', nameEn: 'Brazil', flag: '🇧🇷', placeholder: '(11) 91234-5678' },
    { code: '+7',   iso: 'RU', nameAr: 'روسيا', nameEn: 'Russia', flag: '🇷🇺', placeholder: '912 345-67-89' },
    { code: '+27',  iso: 'ZA', nameAr: 'جنوب أفريقيا', nameEn: 'South Africa', flag: '🇿🇦', placeholder: '71 123 4567' },
    { code: '+41',  iso: 'CH', nameAr: 'سويسرا', nameEn: 'Switzerland', flag: '🇨🇭', placeholder: '78 123 45 67' },
    { code: '+46',  iso: 'SE', nameAr: 'السويد', nameEn: 'Sweden', flag: '🇸🇪', placeholder: '70 123 45 67' },
    { code: '+31',  iso: 'NL', nameAr: 'هولندا', nameEn: 'Netherlands', flag: '🇳🇱', placeholder: '6 12345678' },
    { code: '+32',  iso: 'BE', nameAr: 'بلجيكا', nameEn: 'Belgium', flag: '🇧🇪', placeholder: '470 12 34 56' },
    { code: '+43',  iso: 'AT', nameAr: 'النمسا', nameEn: 'Austria', flag: '🇦🇹', placeholder: '664 1234567' },
    { code: '+47',  iso: 'NO', nameAr: 'النرويج', nameEn: 'Norway', flag: '🇳🇴', placeholder: '412 34 567' },
];

export default function PhoneInput({
    countryCode = '+966',
    onCountryCodeChange,
    value = '',
    onChange,
    label = 'رقم الهاتف الجوال',
    error = null,
    required = false,
    placeholder,
    className = '',
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Find current selected country
    const selectedCountry = useMemo(() => {
        return COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
    }, [countryCode]);

    // Filter countries based on search
    const filteredCountries = useMemo(() => {
        if (!searchQuery.trim()) return COUNTRIES;
        const q = searchQuery.trim().toLowerCase().replace('+', '');
        return COUNTRIES.filter((c) => {
            const cleanCode = c.code.replace('+', '').toLowerCase();
            return (
                c.nameAr.toLowerCase().includes(q) ||
                c.nameEn.toLowerCase().includes(q) ||
                cleanCode.includes(q) ||
                c.iso.toLowerCase().includes(q)
            );
        });
    }, [searchQuery]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    const handleSelectCountry = (country) => {
        if (onCountryCodeChange) {
            onCountryCodeChange(country.code);
        }
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            {label && (
                <label className="block text-xs font-semibold text-slate-300">
                    {label} {required && <span className="text-rose-400">*</span>}
                </label>
            )}

            <div className="relative flex items-stretch rounded-2xl border border-slate-700 bg-slate-900/90 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all shadow-inner group">
                {/* Country Code Selector (Select2 Searchable Dropdown) */}
                <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-full px-3.5 py-3 flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 rounded-s-2xl border-e border-slate-700/80 transition-colors text-xs font-medium cursor-pointer select-none"
                        title="اختر كود الدولة"
                    >
                        <span className="text-lg leading-none">{selectedCountry.flag}</span>
                        <span className="font-mono font-bold text-slate-100 text-xs dir-ltr" dir="ltr">
                            {selectedCountry.code}
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-violet-400' : ''}`} />
                    </button>

                    {/* Dropdown Popup */}
                    {isOpen && (
                        <div className="absolute top-full start-0 mt-1.5 w-72 max-h-80 bg-slate-900/95 backdrop-blur-xl border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
                            {/* Search Header */}
                            <div className="p-2.5 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-10">
                                <div className="relative">
                                    <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ابحث بالدولة أو كود الهاتف..."
                                        className="w-full ps-9 pe-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Countries List */}
                            <div className="overflow-y-auto max-h-60 divide-y divide-slate-800/40 p-1 custom-scrollbar">
                                {filteredCountries.length > 0 ? (
                                    filteredCountries.map((c, index) => {
                                        const isSelected = c.code === selectedCountry.code && c.iso === selectedCountry.iso;
                                        return (
                                            <button
                                                key={`${c.iso}-${c.code}-${index}`}
                                                type="button"
                                                onClick={() => handleSelectCountry(c)}
                                                className={`w-full px-3 py-2.5 flex items-center justify-between rounded-xl text-start text-xs transition-colors group/item ${
                                                    isSelected
                                                        ? 'bg-violet-500/15 text-violet-300 font-semibold'
                                                        : 'hover:bg-slate-800 text-slate-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 overflow-hidden">
                                                    <span className="text-lg shrink-0">{c.flag}</span>
                                                    <div className="truncate">
                                                        <span className="block truncate text-slate-200">{c.nameAr}</span>
                                                        <span className="block text-[10px] text-slate-500 truncate">{c.nameEn} ({c.iso})</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0 ps-2">
                                                    <span className="font-mono text-xs font-bold text-slate-400 group-hover/item:text-violet-400 dir-ltr" dir="ltr">
                                                        {c.code}
                                                    </span>
                                                    {isSelected && <Check className="w-3.5 h-3.5 text-violet-400" />}
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="p-4 text-center text-xs text-slate-500">
                                        لا توجد دولة مطابقة لـ "{searchQuery}"
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Phone Number Input */}
                <div className="relative flex-1">
                    <input
                        type="tel"
                        dir="ltr"
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder || selectedCountry.placeholder}
                        required={required}
                        className="w-full h-full px-3.5 py-3 bg-transparent text-slate-100 text-sm font-mono placeholder:text-slate-600 focus:outline-none text-start rounded-e-2xl"
                    />
                </div>
            </div>

            {error && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>
            )}
        </div>
    );
}
