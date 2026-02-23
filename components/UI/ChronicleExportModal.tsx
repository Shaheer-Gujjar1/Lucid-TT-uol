
'use client';

import React from 'react';

interface ChronicleExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: () => void;
    dayCount: number;
}

export default function ChronicleExportModal({ isOpen, onClose, onExport, dayCount }: ChronicleExportModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
            <div className="relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/5 animate-slide-up transform transition-all">

                {/* Visual Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

                <div className="p-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm border border-indigo-100 dark:border-indigo-500/20">
                            <i className="fas fa-file-export text-2xl"></i>
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight italic">Optimized Export</h3>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-black mt-2">Week View Chronicle Ready</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 w-full">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed italic">
                                We've analyzed your schedule. <span className="text-indigo-600 dark:text-indigo-400 font-black">{dayCount} active days</span> identified for the high-density export. All temporal highlights will be normalized for the chronicle.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 w-full">
                            <button
                                onClick={onExport}
                                className="w-full py-4 px-6 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 transition-all shadow-lg"
                            >
                                Initiate High-Density Export
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 px-6 rounded-2xl border border-slate-200 dark:border-white/5 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                            >
                                Re-verify Selection
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
