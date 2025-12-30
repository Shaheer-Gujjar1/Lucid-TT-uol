
'use client';

import { ProcessedSlot } from '@/lib/parser';

interface WeekViewProps {
    data: { day: string; slots: ProcessedSlot[] }[];
    loading?: boolean;
    error?: string | null;
}

export default function WeekView({ data, loading, error }: WeekViewProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[var(--accent-color)] font-bold">Loading week view...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Failed to load week view</h3>
                <p className="text-[var(--text-secondary)] mt-2">{error}</p>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-[var(--text-tertiary)]">No data for the selected filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {data.map((dayData, idx) => (
                <div key={`${dayData.day}-${idx}`} className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="text-center mb-4 pb-2 border-b-2 border-indigo-500">
                        <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{dayData.day}</h3>
                    </div>
                    <div className="space-y-4">
                        {(!dayData.slots || dayData.slots.length === 0) ? (
                            <div className="p-6 text-center opacity-50">
                                <p className="text-xs font-bold text-slate-400">No Classes</p>
                            </div>
                        ) : (
                            dayData.slots.map((slot, idx) => {
                                const isLab = slot.entries.some(e => e.isLab);
                                const slotClasses = isLab
                                    ? 'bg-gradient-to-br from-amber-50 via-amber-50/60 to-white border-amber-500 border-amber-100/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-amber-500 dark:border-t-amber-500/50 dark:border-r-amber-500/50 dark:border-b-amber-500/50'
                                    : 'bg-gradient-to-br from-blue-50 via-blue-50/60 to-white border-blue-500 border-blue-100/30 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-blue-500 dark:border-t-blue-500/50 dark:border-r-blue-500/50 dark:border-b-blue-500/50';

                                return (
                                    <div key={idx} className="relative group">
                                        {slot.entries.length === 0 ? (
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-emerald-50/60 to-white dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 border-l-[6px] border-emerald-500 shadow-sm hover:shadow-md transition-all border border-emerald-100/30 dark:border-emerald-500 min-h-[90px]">
                                                <div className="relative h-full flex flex-col">
                                                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest self-start">{slot.time}</div>
                                                    <div className="flex-1 flex items-center justify-center pt-2">
                                                        <div className="text-lg font-black text-emerald-500 dark:text-emerald-400 tracking-[0.2em] drop-shadow-sm">FREE</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`relative p-5 rounded-2xl border-l-[6px] shadow-sm hover:shadow-md transition-all border ${slotClasses}`}>

                                                {slot.entries.length > 1 && (
                                                    <div className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-[9px] font-black px-3 py-1.5 rounded-bl-2xl rounded-tr-2xl z-10 shadow-sm uppercase tracking-widest border-b border-l border-red-400/30">
                                                        CLASH
                                                    </div>
                                                )}

                                                {slot.entries.map((s, entryIdx) => (
                                                    <div key={entryIdx}>
                                                        {entryIdx > 0 && <hr className="my-5 border-slate-200/60 dark:border-slate-700/50" />}
                                                        <div className="flex flex-col">
                                                            <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{slot.time}</div>
                                                            <div className="font-black text-sm text-slate-800 dark:text-slate-100 leading-tight mb-2 tracking-tight drop-shadow-sm">{s.course}</div>
                                                            <div className="text-[11px] font-semibold text-slate-500/80 dark:text-slate-400 mb-3">{s.instructor}</div>

                                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                                <span className={`inline-block text-[8px] font-black px-3 py-1 rounded-full shadow-sm border ${s.isLab
                                                                    ? 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800 border-amber-200/50 dark:from-amber-900/40 dark:to-amber-900/20 dark:text-amber-300 dark:border-amber-700/30'
                                                                    : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-200/50 dark:from-indigo-900/40 dark:to-indigo-900/20 dark:text-indigo-300 dark:border-indigo-700/30'}`}>
                                                                    {s.isLab ? 'LABORATORY' : 'LECTURE'}
                                                                </span>
                                                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                                                                    Room: <span className="text-slate-700 dark:text-slate-200 font-black">{s.room}</span>
                                                                </div>
                                                            </div>
                                                            <div className="text-[10px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-wider mt-2">{s.class}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
