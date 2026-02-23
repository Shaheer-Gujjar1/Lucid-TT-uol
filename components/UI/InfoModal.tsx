'use client';

import { useState } from 'react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
    const [activeTab, setActiveTab] = useState<'about' | 'features' | 'aura' | 'credits'>('about');

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
                        icon="fa-bolt"
                        label="Features"
                    />
                    <TabButton
                        active={activeTab === 'aura'}
                        onClick={() => setActiveTab('aura')}
                        icon="fa-robot"
                        label="Aura AI"
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
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">Lucid Aura∞ v6.7.0</span> is the premier academic utility for UOL students. It redefines your university experience by seamlessly integrating dynamic timetables, intelligent exam planning, and performance tracking into one unified, high-performance interface.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <StatCard label="Version" value="6.7.0" icon="fa-code-branch" />
                                <StatCard label="Release" value="Feb 2026" icon="fa-calendar-check" />
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
                            <FeatureRow
                                icon="fa-user-graduate"
                                color="text-indigo-500"
                                bg="bg-indigo-50 dark:bg-indigo-900/20"
                                title="Student Mode"
                                desc="Find your personal class schedule by Program, Semester & Section. Save 'Preferences' to load your timetable instantly."
                            />
                            <FeatureRow
                                icon="fa-chalkboard-teacher"
                                color="text-purple-500"
                                bg="bg-purple-50 dark:bg-purple-900/20"
                                title="Teacher Mode"
                                desc="Search for any instructor to view their complete weekly teaching schedule across all departments."
                            />
                            <FeatureRow
                                icon="fa-file-signature"
                                color="text-sky-500"
                                bg="bg-sky-50 dark:bg-sky-900/20"
                                title="Exam Suite"
                                desc="Access the official Datesheet & Seating Plan. Search by Name/ID or course to find your venue and time."
                            />
                            <FeatureRow
                                icon="fa-door-open"
                                color="text-pink-500"
                                bg="bg-pink-50 dark:bg-pink-900/20"
                                title="Room Mode"
                                desc="Check the availability of any room on campus to find a free slot for self-study or meetings."
                            />
                            <FeatureRow
                                icon="fa-arrows-alt-h"
                                color="text-orange-500"
                                bg="bg-orange-50 dark:bg-orange-900/20"
                                title="Smart Gestures"
                                desc="Swipe left or right on the Timetable to instantly switch between days."
                            />
                            <FeatureRow
                                icon="fa-chart-pie"
                                color="text-emerald-500"
                                bg="bg-emerald-50 dark:bg-emerald-900/20"
                                title="GPA Calculator"
                                desc="Track your academic progress with trends. Now featuring Undo/Redo to fix mistakes instantly."
                            />
                            <FeatureRow
                                icon="fa-cloud-download-alt"
                                color="text-amber-500"
                                bg="bg-amber-50 dark:bg-amber-900/20"
                                title="Universal Export"
                                desc="Download high-quality images of your Timetable, Datesheet, and Seating Plan with a single tap."
                            />
                            <FeatureRow
                                icon="fa-calendar-check"
                                color="text-rose-500"
                                bg="bg-rose-50 dark:bg-rose-900/20"
                                title="Events Hub"
                                desc="Manage your personal assignments, quizzes, and campus events with built-in reminders."
                            />
                            <FeatureRow
                                icon="fa-calendar-week"
                                color="text-teal-500"
                                bg="bg-teal-50 dark:bg-teal-900/20"
                                title="Week View"
                                desc="Visualize your entire week at a glance. Identify free slots and clashes instantly."
                            />
                            <FeatureRow
                                icon="fa-moon"
                                color="text-slate-600 dark:text-slate-300"
                                bg="bg-slate-100 dark:bg-slate-800"
                                title="Dark Mode"
                                desc="A complete dark theme redesign that is easy on the eyes and perfect for night owls."
                            />
                        </div>
                    )}

                    {activeTab === 'aura' && (
                        <div className="space-y-5 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-800/30">
                                <h4 className="text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400 mb-1 flex items-center gap-2">
                                    <i className="fas fa-sparkles text-xs"></i>
                                    Meet Aura AI
                                </h4>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Your intelligent academic companion. Aura isn't just a chatbot; it's a context-aware engine that understands your schedule and automates your tasks.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 pl-1">Try Asking</p>
                                <FeatureRow
                                    icon="fa-search"
                                    color="text-indigo-500"
                                    bg="bg-indigo-50 dark:bg-indigo-900/20"
                                    title="Teacher & Room Lookup"
                                    desc="'Where is Sir Asif right now?' or 'Find a free slot in Room 102'"
                                />
                                <FeatureRow
                                    icon="fa-calendar-plus"
                                    color="text-fuchsia-500"
                                    bg="bg-fuchsia-50 dark:bg-fuchsia-900/20"
                                    title="Instant Event Creation"
                                    desc="'Add a Quiz for DAAA after 2 hours' or 'Remind me about Assignment'"
                                />
                                <FeatureRow
                                    icon="fa-filter"
                                    color="text-emerald-500"
                                    bg="bg-emerald-50 dark:bg-emerald-900/20"
                                    title="Dynamic Navigation"
                                    desc="'Show me tomorrow's timetable' or 'Go to Seating Plan'"
                                />
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <h4 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-tighter mb-2">Power User Tips</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium lowercase leading-tight">
                                        <i className="fas fa-check-circle text-indigo-500 mt-0.5"></i>
                                        <span>Aura learns your name and class automatically when you search.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium lowercase leading-tight">
                                        <i className="fas fa-check-circle text-indigo-500 mt-0.5"></i>
                                        <span>Use relative time like "after 30 mins" for quick reminders.</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium lowercase leading-tight">
                                        <i className="fas fa-check-circle text-indigo-500 mt-0.5"></i>
                                        <span>Type "cancel" at any time to exit the event creation wizard.</span>
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
                        © 2026 Lucid Dynamics • All Rights Reserved
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
