
import { DatesheetEntry } from '@/lib/exam_utils';

interface DatesheetProps {
    data: DatesheetEntry[];
    loading?: boolean;
}

export default function Datesheet({ data, loading }: DatesheetProps) {
    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-indigo-600 font-bold tracking-widest text-xs uppercase">Loading Datesheet...</p>
        </div>
    );

    if (!data || data.length === 0) {
        return (
            <div className="bg-white/5 md:bg-white/10 border-2 border-dashed border-slate-300 dark:border-slate-700/50 p-20 rounded-[3rem] text-center animate-fade-in flex flex-col items-center justify-center min-h-[40vh] backdrop-blur-sm">
                <div className="inline-block animate-bounce duration-[2000ms]">
                    <i className="fas fa-calendar-times text-6xl text-slate-300 dark:text-slate-600 mb-6"></i>
                </div>
                <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Exams Found</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Adjust your filters or check back later.</p>
            </div>
        );
    }

    // Group with clean dates
    const grouped: Record<string, DatesheetEntry[]> = {};
    data.forEach(entry => {
        const date = entry.date || 'TBA';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(entry);
    });

    return (
        <div className="space-y-12 pb-24">
            {Object.entries(grouped).map(([date, exams], idx) => {
                const day = exams[0].day || '';

                return (
                    <div key={idx} className="animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>

                        {/* Date Header - Sticky with adjusted top offset */}
                        <div className="sticky top-32 z-30 mb-8 ml-2 transition-all duration-300">
                            <div className="inline-flex items-center gap-4 bg-white/95 md:bg-white/90 dark:bg-slate-900/95 md:dark:bg-slate-900/90 backdrop-blur-none md:backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/50 dark:border-slate-700/50 ring-1 ring-black/5">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <i className="fas fa-calendar-day text-sm"></i>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-black text-slate-800 dark:text-white leading-none tracking-tight">{date}</h3>
                                        {day && <span className="text-sm font-bold text-indigo-500 uppercase tracking-wider border-l-2 border-slate-200 pl-2 dark:border-slate-700">{day}</span>}
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{exams.length} Exams Scheduled</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-2">
                            {exams.map((exam, i) => (
                                <div key={i} className="group relative">
                                    {/* Outer Gradient Border Wrapper matching ProcessSlotCard / SeatingPlan */}
                                    <div className="p-[1px] rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-900/20 dark:to-transparent border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm md:hover:shadow-lg md:hover:shadow-indigo-500/5 md:hover:scale-[1.01] transition-all duration-300 h-full">

                                        {/* Inner Card */}
                                        <div className="relative p-5 rounded-xl bg-gradient-to-br from-white/80 to-white/40 dark:from-slate-800/90 dark:to-slate-900/80 backdrop-blur-none md:backdrop-blur-md h-full overflow-hidden border border-blue-100/50 dark:border-slate-700/50">

                                            {/* Left Side Bar (Accent Pill) - Consistent */}
                                            <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity"></div>

                                            {/* Time Tag */}
                                            <div className="absolute top-4 right-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-black px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20 shadow-sm flex items-center gap-1.5">
                                                <i className="fas fa-clock text-[9px]"></i> {exam.time}
                                            </div>

                                            {/* Content */}
                                            <div className="pl-3 pr-20 pt-1">
                                                <span className="inline-block bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-[4px] mb-2 shadow-sm tracking-wide">
                                                    {exam.program} {exam.semester} {exam.section || ''}
                                                </span>
                                                <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight mb-4 min-h-[3rem] line-clamp-2">
                                                    {exam.courseTitle}
                                                </h4>
                                            </div>

                                            {/* Footer / Venue */}
                                            <div className="pl-3 mt-2 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 shadow-sm">
                                                    <i className="fas fa-map-marker-alt text-xs"></i>
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Venue</p>
                                                    <div className="text-xs font-bold text-slate-700 dark:text-slate-200 flex flex-wrap gap-1 items-center">
                                                        {(() => {
                                                            const raw = exam.venue || 'TBA';
                                                            const v = String(raw).trim();
                                                            if (v.length > 3 && /^\d+$/.test(v) && v.length % 3 === 0) {
                                                                const rooms = v.match(/.{1,3}/g) || [v];
                                                                return rooms.map((room, idx) => (
                                                                    <span key={idx} className="flex items-center">
                                                                        {idx > 0 && <span className="mx-1.5 text-slate-300 dark:text-slate-600 text-[10px]">|</span>}
                                                                        <span>{room}</span>
                                                                    </span>
                                                                ));
                                                            }
                                                            return v;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
