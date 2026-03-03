'use client';

import { useState } from 'react';
import { useSettings } from '@/lib/settings';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
    const { settings, mounted } = useSettings();
    const [activeTab, setActiveTab] = useState<'about' | 'features' | 'aura' | 'credits'>('about');
    const isClassic = mounted && settings.wordingPreference === 'classic';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white/90 dark:bg-slate-900/90 w-full max-w-lg rounded-[2rem] shadow-2xl animate-scale-in border border-white/20 dark:border-slate-700 overflow-hidden max-h-[85vh] flex flex-col backdrop-blur-xl">

                {/* Header */}
                <div className="relative p-8 bg-gradient-to-br from-indigo-600 to-purple-700 overflow-hidden shrink-0 text-center text-white">
                    {/* Abstract Shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-sm transform rotate-3 overflow-hidden p-2">
                            <img src="/logo-primary.png" alt="Lucid Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight mb-1">Lucid Aura∞</h2>
                            <p className="text-indigo-100 text-sm font-medium opacity-90">Timetable & Academic Suite</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all backdrop-blur-md z-50"
                    >
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex p-2 gap-2 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-200/50 dark:border-slate-700/50">
                    <TabButton
                        active={activeTab === 'about'}
                        onClick={() => setActiveTab('about')}
                        icon="fa-star"
                        label="About"
                    />
                    <TabButton
                        active={activeTab === 'features'}
                        onClick={() => setActiveTab('features')}
                        icon="fa-compass"
                        label={isClassic ? "Guide" : "Intelligence Hub"}
                    />
                    <TabButton
                        active={activeTab === 'aura'}
                        onClick={() => setActiveTab('aura')}
                        icon="fa-sync"
                        label={isClassic ? "Sync" : "Protocols"}
                    />
                    <TabButton
                        active={activeTab === 'credits'}
                        onClick={() => setActiveTab('credits')}
                        icon="fa-code"
                        label="Credits"
                    />
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 relative">

                    {activeTab === 'about' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 text-center">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Lucid Aura∞ v6.12.5</span> is the premier academic utility for UOL. It integrates dynamic timetables, intelligent planning, and performance analytics into one high-performance interface.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <StatCard label="Version" value="6.12.5" icon="fa-code-branch" />
                                <StatCard label="Release" value="SEPT 2025" icon="fa-calendar-check" />
                            </div>

                            <div className="text-center pt-2">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Developer Portfolio</p>
                                <div className="flex justify-center">
                                    <a
                                        href="https://quantam-bio.netlify.app"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-6 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-sm hover:shadow-md"
                                    >
                                        <i className="fas fa-globe"></i>
                                        quantam-bio.netlify.app
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'features' && (
                        <div className="space-y-4 animate-fade-in">
                            <div className="p-1 mb-2">
                                <h4 className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 italic">Operational Guide</h4>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Master the workflow in seconds</p>
                            </div>

                            <FeatureRow
                                icon="fa-user-graduate"
                                color="text-indigo-500"
                                bg="bg-indigo-50 dark:bg-indigo-900/20"
                                title={isClassic ? "Student Mode" : "Learner Perspective"}
                                desc="Search Class → Refine Filters → Save as Preference."
                            />
                            <FeatureRow
                                icon="fa-chalkboard-teacher"
                                color="text-purple-500"
                                bg="bg-purple-50 dark:bg-purple-900/20"
                                title={isClassic ? "Teacher Mode" : "Lecturer Rotations"}
                                desc="Search Faculty Name → View Weekly Schedule instantly."
                            />
                            <FeatureRow
                                icon="fa-door-open"
                                color="text-pink-500"
                                bg="bg-pink-50 dark:bg-pink-900/20"
                                title={isClassic ? "Room Mode" : "Spatial Occupancy"}
                                desc="Enter Room Number → Determine current availability."
                            />
                            <FeatureRow
                                icon="fa-file-signature"
                                color="text-sky-500"
                                bg="bg-sky-50 dark:bg-sky-900/20"
                                title={isClassic ? "Exam Mode" : "Crucible Protocol"}
                                desc="Search ID/Name → Locate Seat Allocation & Venue."
                            />
                            <FeatureRow
                                icon="fa-chart-pie"
                                color="text-emerald-500"
                                bg="bg-emerald-50 dark:bg-emerald-900/20"
                                title={isClassic ? "GPA Calculator" : "Performance Analytics"}
                                desc="Input Grades → Analyze Trends → Track GPA Progress."
                            />
                        </div>
                    )}

                    {activeTab === 'aura' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="p-5 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <i className="fas fa-satellite-dish animate-pulse"></i>
                                    {isClassic ? "Seamless Connectivity" : "Adaptive Protocols"}
                                </h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <i className="fas fa-check text-[10px]"></i>
                                        </div>
                                        <p className="text-[11px] font-bold leading-relaxed opacity-90 italic">
                                            {isClassic ? "Real-time Refresh: The app checks for changes automatically to keep you updated." : "Autonomous Sync: Adaptive checks maintain data integrity with zero manual effort."}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <i className="fas fa-check text-[10px]"></i>
                                        </div>
                                        <p className="text-[11px] font-bold leading-relaxed opacity-90 italic">
                                            {isClassic ? "Offline Capability: Continue viewing your schedule even without an active internet connection." : "Spatial Persistent: Full dashboard availability during network absence."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/30">
                                <h4 className="text-[10px] uppercase font-black text-fuchsia-600 dark:text-fuchsia-400 mb-2 flex items-center gap-2">
                                    <i className="fas fa-sparkles"></i>
                                    Aura Context Intelligence
                                </h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold lowercase leading-tight">
                                        <i className="fas fa-caret-right text-indigo-500 mt-1"></i>
                                        <span>Aura remembers your identity & class context automatically.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-bold lowercase leading-tight">
                                        <i className="fas fa-caret-right text-indigo-500 mt-1"></i>
                                        <span>Swipe Gesture: Instantly switch between dates on mobile.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {activeTab === 'credits' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-col items-center text-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 p-[2px] mb-4 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">SA</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Shaheer Ahmed</h3>
                                <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 mb-1">Sole Developer & Designer</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">BSCS • University of Lahore</p>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-slate-400 italic">
                                    "Crafting digital experiences that feel magical."
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-center shrink-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        © 2025 Lucid Dynamics • All Rights Reserved
                    </p>
                </div>
            </div>
        </div>
    );
}

// Sub-components

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: string, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${active
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700'
                : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/50'
                }`}
        >
            <i className={`fas ${icon}`}></i>
            {label}
        </button>
    );
}

function StatCard({ label, value, icon }: { label: string, value: string, icon: string }) {
    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 shadow-sm flex items-center justify-center text-slate-400">
                <i className={`fas ${icon} text-xs`}></i>
            </div>
            <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                <div className="text-sm font-black text-slate-700 dark:text-slate-200">{value}</div>
            </div>
        </div>
    );
}

function SocialButton({ href, icon, color }: { href: string, icon: string, color: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg hover:scale-110 active:scale-95 transition-all shadow-sm hover:shadow-md"
        >
            <i className={`fab ${icon} ${color}`}></i>
        </a>
    );
}

function FeatureRow({ icon, color, bg, title, desc }: { icon: string, color: string, bg: string, title: string, desc: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
            <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform`}>
                <i className={`fas ${icon}`}></i>
            </div>
            <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-200 text-sm">{title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight mt-1">{desc}</p>
            </div>
        </div>
    );
}
