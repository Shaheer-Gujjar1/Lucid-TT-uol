
'use client';

import { ProcessedSlot } from '@/lib/parser';

interface ProcessSlotCardProps {
    slotData: ProcessedSlot;
}

export default function ProcessSlotCard({ slotData }: ProcessSlotCardProps) {
    const { time, entries } = slotData;

    if (!entries || entries.length === 0) {
        return (
            <div className="animate-fade-in-up mb-4 p-5 min-h-[90px] rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border-l-[6px] border-emerald-500 shadow-sm hover:shadow-md transition-all border border-emerald-100/30 dark:border-emerald-500">
                <div className="relative h-full flex flex-col">
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest self-start">{time}</div>
                    <div className="flex-1 flex items-center justify-center pt-2">
                        <div className="text-xl font-black text-emerald-500 dark:text-emerald-400 tracking-[0.2em] drop-shadow-sm">FREE</div>
                    </div>
                </div>
            </div>
        );
    }

    const isLab = slotData.entries.some(e => e.isLab);

    // Consistent borders for Dark Mode (Blue for Lecture, Amber for Lab)
    const gradientClass = isLab
        ? 'bg-gradient-to-br from-amber-50 via-amber-50/60 to-white border-amber-500 border-amber-100/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-amber-500 dark:border-t-amber-500/50 dark:border-r-amber-500/50 dark:border-b-amber-500/50'
        : 'bg-gradient-to-br from-blue-50 via-blue-50/60 to-white border-blue-500 border-blue-100/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-blue-500 dark:border-t-blue-500/50 dark:border-r-blue-500/50 dark:border-b-blue-500/50';

    return (
        <div className="mb-4 animate-fade-in-up">
            <div className={`relative p-5 rounded-2xl border-l-[6px] shadow-sm hover:shadow-md transition-all border ${gradientClass}`}>
                {entries.length > 1 && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl z-10 shadow-sm uppercase tracking-widest border-b border-l border-red-400/30">
                        CLASH
                    </div>
                )}

                {entries.map((s, idx) => {
                    const tagBg = s.isLab
                        ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-200/50 dark:from-amber-900/40 dark:to-amber-900/20 dark:text-amber-300 dark:border-amber-700/30'
                        : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-200/50 dark:from-indigo-900/40 dark:to-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700/30';

                    return (
                        <div key={idx}>
                            {idx > 0 && <hr className="my-5 border-slate-200/60 dark:border-slate-700/50" />}
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex flex-col flex-1">
                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <i className="far fa-clock text-indigo-400 dark:text-indigo-500"></i> {time}
                                    </div>
                                    <div className="font-black text-base text-slate-800 dark:text-slate-100 leading-tight mb-2 tracking-tight drop-shadow-sm">{s.course}</div>
                                    <div className="text-sm font-semibold text-slate-500/80 dark:text-slate-400 flex items-center gap-2">
                                        <i className="fas fa-chalkboard-teacher text-slate-400 dark:text-slate-500"></i> {s.instructor}
                                    </div>
                                </div>

                                <div className="flex flex-col items-end text-right">
                                    <span className={`inline-block text-[9px] font-black px-4 py-1.5 rounded-full mb-3 shadow-sm border ${tagBg} tracking-[0.05em]`}>
                                        {s.isLab ? 'LABORATORY' : 'LECTURE'}
                                    </span>
                                    <div className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-1 flex items-center justify-end gap-1">
                                        Room: <span className="text-slate-800 dark:text-slate-200 font-black">{s.room}</span> <i className="fas fa-map-marker-alt text-slate-300 dark:text-slate-600 text-[10px]"></i>
                                    </div>
                                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mt-1 flex items-center justify-end gap-1">
                                        {s.class} <i className="fas fa-user-graduate text-slate-300 text-[10px]"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
