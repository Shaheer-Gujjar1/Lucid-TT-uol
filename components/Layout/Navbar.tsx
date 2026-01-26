
'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';

const Navbar = memo(function Navbar() {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const isDark = localStorage.getItem('darkMode') === 'true';
        setDarkMode(isDark);
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    }, []);

    const [upcomingCount, setUpcomingCount] = useState(0);

    useEffect(() => {
        const checkEvents = () => {
            const stored = localStorage.getItem('lucid_timetable_events');
            if (!stored) {
                setUpcomingCount(0);
                return;
            }
            try {
                const events: any[] = JSON.parse(stored);
                const now = new Date();
                const todayStr = now.toISOString().split('T')[0];

                const count = events.filter(e => {
                    if (e.completed) return false;

                    // Check if it's today
                    if (e.date === todayStr) return true;

                    // Check if within 24 hours from now
                    const eventDate = new Date(`${e.date}T${e.time || '23:59'}`);
                    const diff = eventDate.getTime() - now.getTime();
                    return diff > 0 && diff <= 86400000; // 24 hours in ms
                }).length;

                setUpcomingCount(count);
            } catch (e) {
                console.error("Failed to parse events for badge", e);
            }
        };

        checkEvents();
        // Re-check when window gets focus (user comes back)
        window.addEventListener('focus', checkEvents);
        return () => window.removeEventListener('focus', checkEvents);
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
            <div className="max-w-7xl mx-auto flex justify-between items-center bg-white/95 md:bg-white/90 dark:bg-slate-900/95 md:dark:bg-slate-900/90 backdrop-blur-none md:backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[3rem] px-3 py-2 md:px-8 md:py-4 border border-white/40 dark:border-slate-800/50 pointer-events-auto transition-all duration-500">

                {/* Left Side: Logo & Title - Allowed to shrink */}
                <div className="flex items-center gap-2 md:gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 py-2 px-3 md:py-3 md:px-8 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] transform hover:scale-105 active:scale-95 transition-all duration-300 min-w-0 flex-shrink">
                    <img src="/logo-primary.png" className="w-6 h-6 md:w-8 md:h-8 object-contain flex-shrink-0" alt="Logo" />
                    <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-sm md:text-lg font-black text-slate-700 dark:text-slate-200 tracking-tighter whitespace-normal leading-none text-left">Lucid <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Aura∞</span></span>
                        <div className="flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 scale-[0.8] md:scale-100 origin-left flex-shrink-0">
                            <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-indigo-500"></span>
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-indigo-600 dark:text-indigo-300">v6.3.6</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Buttons - Prevent shrinking and use compact mobile size */}
                <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 pl-2 pointer-events-auto relative z-50">
                    <Link href="/events" className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-100 dark:border-slate-700" title="Events Catalog">
                        <i className="fas fa-calendar-alt text-sm md:text-lg"></i>
                        {upcomingCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md animate-pulse">
                                {upcomingCount}
                            </span>
                        )}
                    </Link>
                    <button onClick={toggleDarkMode} className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all duration-300 border border-slate-100 dark:border-slate-700" title="Toggle Appearance">
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-sm md:text-lg`}></i>
                    </button>
                </div>

            </div>
        </nav>
    );
});

export default Navbar;
