import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('gotech_theme') || 'dark';
        setTheme(savedTheme);
        applyTheme(savedTheme);
    }, []);

    const applyTheme = (newTheme) => {
        if (newTheme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        } else {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
        }
        localStorage.setItem('gotech_theme', newTheme);
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        applyTheme(newTheme);
    };

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`flex items-center justify-center p-2 rounded-xl transition-all duration-300 border cursor-pointer ${
                theme === 'dark'
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700 hover:text-amber-300 shadow-md'
                    : 'bg-white hover:bg-slate-100 text-indigo-600 border-slate-200 hover:text-indigo-700 shadow-sm'
            } ${className}`}
            title={theme === 'dark' ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Dark Mode)'}
            aria-label="تبديل مظهر العرض"
        >
            {theme === 'dark' ? (
                <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
            ) : (
                <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12" />
            )}
        </button>
    );
}
