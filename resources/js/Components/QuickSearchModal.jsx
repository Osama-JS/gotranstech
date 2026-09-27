import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { router } from '@inertiajs/react';
import {
    Search,
    X,
    Loader2,
    LayoutDashboard,
    Users,
    Building2,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    FileText,
    FormInput,
    ShieldAlert,
    UserCheck,
    BarChart3,
    Globe,
    FileCheck,
    Activity,
    Settings,
    CornerDownLeft,
    Sparkles,
    Clock,
    History,
    Trash2,
    ArrowLeft,
    Compass,
} from 'lucide-react';
import axios from 'axios';

const ICON_MAP = {
    LayoutDashboard,
    Users,
    Building2,
    Package,
    ArrowDownToLine,
    ArrowUpFromLine,
    FileText,
    FormInput,
    ShieldAlert,
    UserCheck,
    BarChart3,
    Globe,
    FileCheck,
    Activity,
    Settings,
    Clock,
    History,
};

const STORAGE_KEY = 'gotrans_quick_search_history';

export default function QuickSearchModal({ isOpen, onClose }) {
    const [mounted, setMounted] = useState(false);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    // Load recent search history from localStorage on open
    useEffect(() => {
        if (isOpen) {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (Array.isArray(parsed)) {
                        setRecentSearches(parsed);
                    }
                }
            } catch (err) {
                console.error('Failed to load recent searches:', err);
            }

            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Handle global Ctrl+K / Cmd+K listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                if (isOpen) {
                    onClose();
                } else {
                    const evt = new CustomEvent('open-quick-search');
                    window.dispatchEvent(evt);
                }
            } else if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Debounced search
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            setLoading(false);
            setSelectedIndex(0);
            return;
        }

        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const response = await axios.get(route('admin.quick-search'), {
                    params: { q: query },
                });
                setResults(response.data.results || []);
                setSelectedIndex(0);
            } catch (err) {
                console.error('Quick search error:', err);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query]);

    // Determine current active item list for keyboard navigation
    const activeList = query.trim().length >= 2 ? results : recentSearches;

    // Handle Keyboard navigation
    const handleKeyDown = (e) => {
        if (activeList.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev < activeList.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && activeList[selectedIndex]) {
            e.preventDefault();
            handleSelect(activeList[selectedIndex]);
        }
    };

    // Save item to recent searches and navigate
    const handleSelect = (item) => {
        try {
            // Remove duplicates by URL or title
            const filtered = recentSearches.filter(
                (r) => r.url !== item.url || r.title !== item.title
            );

            // Prepend new item and keep up to 8 items
            const updated = [
                {
                    title: item.title,
                    subtitle: item.subtitle,
                    url: item.url,
                    category: item.category,
                    icon: item.icon,
                    visitedAt: new Date().toISOString(),
                },
                ...filtered,
            ].slice(0, 8);

            setRecentSearches(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (err) {
            console.error('Failed to save to recent searches:', err);
        }

        onClose();
        router.visit(item.url);
    };

    // Remove single recent item
    const handleRemoveRecent = (e, index) => {
        e.stopPropagation();
        try {
            const updated = recentSearches.filter((_, i) => i !== index);
            setRecentSearches(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            if (selectedIndex >= updated.length) {
                setSelectedIndex(Math.max(0, updated.length - 1));
            }
        } catch (err) {
            console.error('Failed to delete recent item:', err);
        }
    };

    // Clear all recent history
    const handleClearAllRecent = (e) => {
        e.stopPropagation();
        try {
            setRecentSearches([]);
            localStorage.removeItem(STORAGE_KEY);
            setSelectedIndex(0);
        } catch (err) {
            console.error('Failed to clear recent searches:', err);
        }
    };

    if (!isOpen || !mounted || typeof document === 'undefined') return null;

    // Group active results by category (when searching)
    const groupedResults = results.reduce((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
            {/* Click outside backdrop */}
            <div className="fixed inset-0" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-[#0B0F2A] border border-slate-200 dark:border-violet-800/40 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[80vh] transition-colors">
                {/* Search Header Bar */}
                <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-violet-900/40 bg-slate-50 dark:bg-violet-950/30 gap-3">
                    <Search className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ابحث عن صفحة، مستثمر، شركة، مهمة، أو رقم عقد... (Ctrl + K)"
                        className="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 text-sm focus:outline-none focus:ring-0 font-sans"
                    />
                    {loading && <Loader2 className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-spin shrink-0" />}
                    {query && !loading && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-violet-900/50 transition-colors"
                            title="مسح حقل البحث"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-violet-900/50 text-slate-700 dark:text-violet-200 border border-slate-300 dark:border-violet-700/50 hover:bg-slate-300 dark:hover:text-white transition-colors"
                    >
                        ESC
                    </button>
                </div>

                {/* Results Body */}
                <div className="overflow-y-auto p-3 space-y-4 flex-1">
                    {/* Prompt for min characters */}
                    {query.length > 0 && query.length < 2 && (
                        <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                            يرجى كتابة حرفين على الأقل للبحث السريع...
                        </div>
                    )}

                    {/* No Results Found */}
                    {!loading && query.length >= 2 && results.length === 0 && (
                        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                            <Search className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">لم يتم العثور على نتائج</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">جرب كلمات بحث أخرى مثل اسم مستثمر أو كود شحنة أو رقم عقد.</p>
                        </div>
                    )}

                    {/* Empty Query: Display Recent Saved Searches */}
                    {!query.trim() && (
                        <div className="space-y-4">
                            {recentSearches.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="px-3 py-1.5 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5 text-violet-700 dark:text-violet-300 font-bold">
                                            <History className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                                            <span>عمليات الوصول السريع الأخيرة</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 font-mono">
                                                {recentSearches.length}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleClearAllRecent}
                                            className="text-[11px] text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-1 cursor-pointer"
                                            title="مسح سجل عمليات الوصول السريع"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>مسح السجل</span>
                                        </button>
                                    </div>

                                    <div className="space-y-1 pt-1">
                                        {recentSearches.map((item, index) => {
                                            const isSelected = index === selectedIndex;
                                            const IconComponent = ICON_MAP[item.icon] || Package;

                                            return (
                                                <div
                                                    key={item.url + index}
                                                    onClick={() => handleSelect(item)}
                                                    onMouseEnter={() => setSelectedIndex(index)}
                                                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                                                        isSelected
                                                            ? 'bg-violet-50 dark:bg-violet-600/25 text-violet-900 dark:text-violet-200 border border-violet-300 dark:border-violet-500/40 shadow-sm'
                                                            : 'hover:bg-slate-100 dark:hover:bg-violet-950/30 text-slate-700 dark:text-slate-300 border border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div
                                                            className={`p-2 rounded-xl shrink-0 ${
                                                                isSelected
                                                                    ? 'bg-violet-200 dark:bg-violet-500/30 text-[#6320EE] dark:text-orange-400'
                                                                    : 'bg-slate-100 dark:bg-[#0E1338] text-slate-500 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-300'
                                                            }`}
                                                        >
                                                            <IconComponent className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <p className={`text-xs font-bold truncate ${isSelected ? 'text-violet-950 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                                                                    {item.title}
                                                                </p>
                                                                {item.category && (
                                                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-violet-950/60 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-violet-800/40 shrink-0 font-medium">
                                                                        {item.category}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                                {item.subtitle}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        {isSelected && (
                                                            <div className="flex items-center gap-1 text-[10px] text-orange-500 dark:text-orange-400 font-mono pr-2">
                                                                <span>انتقال سريع</span>
                                                                <CornerDownLeft className="w-3.5 h-3.5" />
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={(e) => handleRemoveRecent(e, index)}
                                                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="حذف من السجل"
                                                        >
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-10 text-center text-slate-400 dark:text-slate-500">
                                    <Compass className="w-8 h-8 mx-auto mb-2 text-violet-500/50 dark:text-violet-400/40" />
                                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">البحث الشامل في GoTransTech</p>
                                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                                        اكتب اسم مستثمر، شركة، كود مهمة، أو صفحة من صفحات النظام للوصول الفوري. سيتم حفظ نتائجك التي تختارها هنا لسهولة الرجوع إليها.
                                    </p>
                                </div>
                            )}

                            {/* Quick Navigation Suggestions */}
                            <div className="pt-2 border-t border-slate-200 dark:border-violet-900/30">
                                <div className="px-3 py-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                                    <Sparkles className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                                    <span>روابط واختصارات مقترحة</span>
                                </div>
                                <div className="flex flex-wrap gap-2 px-3">
                                    {[
                                        { label: 'المستثمرون', query: 'المستثمر' },
                                        { label: 'الشركات اللوجستية', query: 'الشركات' },
                                        { label: 'المهام والشحنات', query: 'المهام' },
                                        { label: 'طلبات السحب', query: 'السحب' },
                                        { label: 'العقود الرسمية', query: 'العقود' },
                                        { label: 'الإعدادات العامة', query: 'الإعدادات' },
                                    ].map((sug) => (
                                        <button
                                            key={sug.label}
                                            type="button"
                                            onClick={() => setQuery(sug.query)}
                                            className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-violet-950/40 hover:bg-violet-100 dark:hover:bg-violet-900/50 text-slate-700 dark:text-violet-200 border border-slate-200 dark:border-violet-800/40 transition-colors cursor-pointer"
                                        >
                                            {sug.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active Grouped Search Results */}
                    {query.trim().length >= 2 && Object.entries(groupedResults).map(([category, items]) => (
                        <div key={category} className="space-y-1">
                            <div className="px-3 py-1 text-[11px] font-bold text-violet-700 dark:text-violet-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                                <span>{category}</span>
                            </div>
                            <div className="space-y-1">
                                {items.map((item) => {
                                    const overallIndex = results.indexOf(item);
                                    const isSelected = overallIndex === selectedIndex;
                                    const IconComponent = ICON_MAP[item.icon] || Package;

                                    return (
                                        <div
                                            key={item.url + item.title}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(overallIndex)}
                                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                                                isSelected
                                                    ? 'bg-violet-50 dark:bg-violet-600/25 text-violet-900 dark:text-violet-200 border border-violet-300 dark:border-violet-500/40 shadow-sm'
                                                    : 'hover:bg-slate-100 dark:hover:bg-violet-950/30 text-slate-700 dark:text-slate-300 border border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div
                                                    className={`p-2 rounded-xl shrink-0 ${
                                                        isSelected
                                                            ? 'bg-violet-200 dark:bg-violet-500/30 text-[#6320EE] dark:text-orange-400'
                                                            : 'bg-slate-100 dark:bg-[#0E1338] text-slate-500 dark:text-slate-400'
                                                    }`}
                                                >
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-violet-950 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                                                        {item.title}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                        {item.subtitle}
                                                    </p>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="flex items-center gap-1 text-[10px] text-orange-500 dark:text-orange-400 font-mono shrink-0 pr-2">
                                                    <span>انتقال</span>
                                                    <CornerDownLeft className="w-3.5 h-3.5" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer hints */}
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-[#06081B]/90 border-t border-slate-200 dark:border-violet-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-violet-950/60 border border-slate-300 dark:border-violet-800/50 text-slate-700 dark:text-violet-200 font-mono text-[10px]">↑</kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-violet-950/60 border border-slate-300 dark:border-violet-800/50 text-slate-700 dark:text-violet-200 font-mono text-[10px]">↓</kbd>
                            <span>للتنقل</span>
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-violet-950/60 border border-slate-300 dark:border-violet-800/50 text-slate-700 dark:text-violet-200 font-mono text-[10px]">Enter</kbd>
                            <span>للاختيار</span>
                        </span>
                    </div>
                    <span className="text-violet-700 dark:text-violet-300 font-medium">منصة GoTransTech - البحث الشامل</span>
                </div>
            </div>
        </div>,
        document.body
    );
}
