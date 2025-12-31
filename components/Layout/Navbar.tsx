
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const next = !darkMode;
        setDarkMode(next);
        localStorage.setItem('darkMode', String(next));
        if (next) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.removeAttribute('data-theme');
        }
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] p-4 pointer-events-none animate-slide-down">
            <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[3rem] px-4 py-3 md:px-8 md:py-4 border border-white/40 dark:border-slate-800/50 pointer-events-auto transition-all duration-500">
                <div className="flex items-center gap-2 md:gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 py-2 px-4 md:py-3 md:px-8 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] transform hover:scale-105 active:scale-95 transition-all duration-300">
                    <img src="/logo-primary.png" className="w-6 h-6 md:w-8 md:h-8 object-contain" alt="Logo" />
                    <div className="flex items-baseline gap-2">
                        <span className="text-sm md:text-lg font-black text-slate-700 dark:text-slate-200 tracking-tighter">Lucid <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Timetable</span></span>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">v5.6.4</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/events" className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-100 dark:border-slate-700" title="Events Catalog">
                        <i className="fas fa-calendar-alt text-lg"></i>
                    </Link>
                    <button onClick={toggleDarkMode} className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-100 dark:border-slate-700" title="Toggle Appearance">
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
                    </button>
                </div>
            </div>
        </nav>
    );
}
