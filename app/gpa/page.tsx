'use client';

import { useState, useEffect } from 'react';
import GPACalculator from '@/components/GPA/GPACalculator';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import SettingsModal from '@/components/UI/SettingsModal';
import InfoModal from '@/components/UI/InfoModal';
import { useSettings } from '@/lib/settings';

export default function GPAPage() {
    const { settings } = useSettings();
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    // Online status detection
    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pb-10">
            <Navbar />

            <main className="container mx-auto px-4 pt-28 max-w-5xl">
                <GPACalculator />
                <div className="animate-fade-in-up">
                    <Footer />
                </div>
            </main>

            {/* Floating Action Buttons System */}
            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[100] animate-scale-in">

                {/* Menu Items */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${isFabExpanded ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-90 pointer-events-none absolute bottom-16'}`}>

                    {/* Status Pill */}
                    {settings.enableOnlineIndicator && (
                        <div className="px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-black/5 dark:shadow-indigo-500/20 flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 backdrop-blur-md">
                            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
                            {isOnline ? 'Online' : 'Offline'}
                        </div>
                    )}

                    {/* AI Chat Bot */}
                    {settings.enableAuraAI && (
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined') {
                                    if ((window as any).LucidChatToggle) {
                                        (window as any).LucidChatToggle();
                                    } else {
                                        window.dispatchEvent(new CustomEvent('lucid-chat-toggle'));
                                    }
                                }
                                setIsFabExpanded(false);
                            }}
                            className="w-12 h-12 bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 rounded-full shadow-lg shadow-fuchsia-500/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-fuchsia-100 dark:border-slate-700"
                            title="AI Assistant"
                        >
                            <i className="fas fa-robot"></i>
                        </button>
                    )}

                    {/* Info Button */}
                    {settings.enableAppInfo && (
                        <button
                            onClick={() => { setShowInfoModal(true); setIsFabExpanded(false); }}
                            className="w-12 h-12 bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-blue-100 dark:border-slate-700"
                            title="App Info"
                        >
                            <i className="fas fa-info"></i>
                        </button>
                    )}

                    {/* Settings Button */}
                    <button
                        onClick={() => { setShowSettingsModal(true); setIsFabExpanded(false); }}
                        className="w-12 h-12 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-full shadow-lg shadow-teal-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-teal-100 dark:border-slate-700"
                        title="Settings"
                    >
                        <i className="fas fa-cog"></i>
                    </button>
                </div>

                {/* Main Toggle Button */}
                <div className="relative">
                    <button
                        onClick={() => setIsFabExpanded(!isFabExpanded)}
                        className={`w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 pointer-events-auto relative z-50`}
                    >
                        <i className={`fas fa-chevron-up text-xl transition-transform duration-300 ${isFabExpanded ? 'rotate-180' : ''}`}></i>
                    </button>
                </div>
            </div>

            <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
            <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
        </div>
    );
}
