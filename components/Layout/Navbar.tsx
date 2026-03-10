
'use client';

import { useState, useEffect, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/lib/settings';

const Navbar = memo(function Navbar() {
    const [darkMode, setDarkMode] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { settings, mounted } = useSettings();

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
                    if (e.date === todayStr) return true;
                    const eventDate = new Date(`${e.date}T${e.time || '23:59'}`);
                    const diff = eventDate.getTime() - now.getTime();
                    return diff > 0 && diff <= 86400000;
                }).length;

                setUpcomingCount(count);
            } catch (e) {
                console.error("Failed to parse events for badge", e);
            }
        };

        checkEvents();
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

    const isClassic = mounted && settings.wordingPreference === 'classic';

    const navItems = [
        { href: '/', label: isClassic ? 'Timetable' : 'Chronicle', icon: 'fa-table' },
        ...(settings.enableGPA ? [{ href: '/gpa', label: isClassic ? 'GPA' : 'Performance', icon: 'fa-calculator' }] : []),
        ...(settings.enableEvents ? [{ href: '/events', label: isClassic ? 'Events' : 'Event Ledger', icon: 'fa-calendar-alt', badge: upcomingCount }] : [])
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] p-4 pointer-events-none animate-slide-down">
            <div className="max-w-7xl mx-auto bg-white/95 md:bg-white/90 dark:bg-slate-900/95 md:dark:bg-slate-900/90 backdrop-blur-none md:backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[3rem] px-4 py-3 md:px-8 md:py-4 border border-white/40 dark:border-slate-800/50 pointer-events-auto transition-all duration-500 flex justify-between items-center relative">

                {/* Left Side: Logo & Title */}
                <Link href="/" className="flex items-center gap-2 md:gap-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 py-2 px-3 md:py-3 md:px-8 rounded-full border border-slate-200/50 dark:border-slate-700/50 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] transform hover:scale-105 active:scale-95 transition-all duration-300 min-w-0 flex-shrink group/logo">
                    <img src="/logo-primary.png" className="w-6 h-6 md:w-8 md:h-8 object-contain flex-shrink-0 group-hover/logo:rotate-12 transition-transform" alt="Logo" />
                    <div className="flex items-baseline gap-2 min-w-0">
                        <span className="text-sm md:text-lg font-black text-slate-700 dark:text-slate-200 tracking-tighter whitespace-normal leading-none text-left">Lucid <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Aura</span><span className="bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient-flow animate-breathing inline-block ml-1 text-lg md:text-2xl align-middle -mb-1">∞</span></span>
                        <div className="flex items-center gap-2 px-2 py-0.5 md:px-3 md:py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 scale-[0.8] md:scale-100 origin-left flex-shrink-0">
                            <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-indigo-500"></span>
                            </span>
                            <span className="text-[10px] md:text-xs font-bold text-indigo-600 dark:text-indigo-300">v6.13.6</span>
                        </div>
                    </div>
                </Link>

                {/* Desktop Nav Items */}
                <div className="hidden md:flex items-center gap-3">
                    {navItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 border border-transparent ${pathname === item.href ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-inner' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-500 hover:border-slate-200 dark:hover:border-slate-700'}`}
                        >
                            <i className={`fas ${item.icon} mr-2`}></i>
                            {item.label}
                            {(item.badge || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                    <button onClick={toggleDarkMode} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:shadow-lg hover:shadow-amber-500/20 hover:scale-110 active:scale-95 transition-all duration-300">
                        <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
                    </button>
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm relative z-50 transition-transform active:scale-95"
                >
                    <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-sm transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}></i>
                </button>

                {/* Mobile Menu (FAB Style) */}
                <div className={`md:hidden absolute top-full right-4 mt-4 flex flex-col items-end gap-3 transition-all duration-300 origin-top-right ${isMobileMenuOpen ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 -translate-y-4 scale-90 pointer-events-none'}`}>
                    {navItems.map((item, idx) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl shadow-indigo-500/10 dark:shadow-black/50 text-slate-600 dark:text-slate-300 px-5 py-3 rounded-full font-bold text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
                            style={{ transitionDelay: `${idx * 50}ms` }}
                        >
                            <span>{item.label}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pathname === item.href ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                <i className={`fas ${item.icon} text-xs`}></i>
                            </div>
                            {(item.badge || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full shadow-md animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    ))}
                    <button
                        onClick={() => { toggleDarkMode(); setIsMobileMenuOpen(false); }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl px-5 py-3 rounded-full font-bold text-sm flex items-center gap-3 hover:scale-105 active:scale-95 transition-all text-slate-600 dark:text-slate-300"
                        style={{ transitionDelay: `${navItems.length * 50}ms` }}
                    >
                        <span>{darkMode ? (isClassic ? 'Light Mode' : 'Radiant Shift') : (isClassic ? 'Dark Mode' : 'Obscura Shift')}</span>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-500">
                            <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
                        </div>
                    </button>
                </div>

            </div>
        </nav>
    );
});

export default Navbar;
