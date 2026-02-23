
import { SeatingPlanEntry } from '@/lib/exam_utils';
import { useState, useEffect } from 'react';

interface SeatingPlanProps {
    data: SeatingPlanEntry[];
    loading?: boolean;
}

export default function SeatingPlan({ data, loading }: SeatingPlanProps) {
    const [visibleLimit, setVisibleLimit] = useState(20);

    // Reset pagination when data changes
    useEffect(() => {
        setVisibleLimit(20);
    }, [data.length]);

    const handleLoadMore = () => {
        setVisibleLimit(prev => Math.min(prev + 40, data.length));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-600 font-bold tracking-widest text-xs uppercase">Loading Seating...</p>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="bg-white/5 md:bg-white/10 border-2 border-dashed border-slate-300 dark:border-slate-700/50 p-20 rounded-[3rem] text-center animate-fade-in flex flex-col items-center justify-center min-h-[40vh] backdrop-blur-sm">
                <div className="inline-block animate-bounce duration-[2000ms]">
                    <i className="fas fa-chair text-6xl text-slate-300 dark:text-slate-600 mb-6"></i>
                </div>
                <h3 className="text-xl font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">No Seats Found</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">Try searching by Name or Room Number.</p>
            </div>
        );
    }

    const visibleData = data.slice(0, visibleLimit);
    const hasMore = visibleLimit < data.length;

    return (
        <div className="pb-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {visibleData.map((seat, idx) => (
                    <div
                        key={`${seat.studentId}-${idx}`}
                        className="animate-fade-in-up group relative p-[1px] rounded-2xl bg-gradient-to-br from-indigo-500/10 to-transparent dark:from-indigo-900/20 dark:to-transparent border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm md:hover:shadow-lg md:hover:shadow-indigo-500/5 md:hover:scale-[1.01] transition-all duration-300"
                        style={{ animationDelay: `${Math.min(idx * 50, 500)}ms` }}
                    >
                        {/* Inner Card - Matching ProcessSlotCard "Occupied" Style */}
                        <div className="relative p-4 md:p-5 rounded-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-none md:backdrop-blur-md border border-blue-50/50 dark:border-slate-700/50 overflow-hidden h-full">

                            {/* Left Side Bar (Accent Pill) */}
                            <div className="absolute left-0 top-4 bottom-4 w-1 bg-indigo-500 rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity"></div>

                            {/* Decorative Icon */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity">
                                <i className="fas fa-chair text-7xl text-indigo-600 dark:text-indigo-400 transform rotate-12"></i>
                            </div>

                            <div className="relative z-10 pl-3"> {/* Added padding-left for accent bar */}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="max-w-[70%]">
                                        <h4 className="font-black text-lg text-slate-800 dark:text-slate-100 leading-tight">{seat.studentName}</h4>
                                        <div className="flex flex-col gap-1 mt-1">
                                            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                                <i className="fas fa-id-card opacity-50"></i> {seat.studentId}
                                            </p>
                                            {/* Date Display */}
                                            {seat.examDate && (
                                                <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full w-fit mt-1">
                                                    <i className="fas fa-calendar-day text-[9px]"></i> {seat.examDate}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right ml-4">
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-black shadow-lg shadow-indigo-500/30 flex flex-col items-center min-w-[3rem]">
                                            <span className="text-[9px] uppercase opacity-80 tracking-widest leading-none mb-0.5">Seat</span>
                                            <span className="leading-none text-base">{seat.seatNumber}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700/50">
                                        <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Room No.</p>
                                        <p className="font-black text-slate-700 dark:text-slate-200 text-sm flex items-center gap-1.5">
                                            <i className="fas fa-door-open text-indigo-400 text-xs"></i>
                                            {seat.room.replace('Room ', '')}
                                        </p>
                                    </div>
                                    {/* Class Info (New) */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700/50">
                                        <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Class</p>
                                        <p className="font-black text-slate-700 dark:text-slate-200 text-sm truncate" title={seat.studentClass}>
                                            {seat.studentClass || "Unknown"}
                                        </p>
                                    </div>

                                    <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 border border-slate-100 dark:border-slate-700/50">
                                        <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider mb-0.5">Course</p>
                                        <p className="font-black text-slate-700 dark:text-slate-200 text-sm truncate" title={seat.courseTitle}>
                                            {seat.courseTitle}
                                        </p>
                                    </div>

                                    {/* Row Display (Conditional) */}
                                    {seat.row && (
                                        <div className="col-span-2 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg p-2.5 border border-indigo-100/50 dark:border-indigo-500/10 flex items-center justify-between">
                                            <p className="font-bold text-indigo-400 uppercase text-[9px] tracking-wider">Row</p>
                                            <p className="font-black text-indigo-700 dark:text-indigo-300 text-sm">{seat.row}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="mt-10 flex justify-center animate-fade-in mb-8">
                    <button
                        onClick={handleLoadMore}
                        className="bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-8 py-3 rounded-full hover:bg-indigo-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-2 group"
                    >
                        <span>Show More Seats</span>
                        <i className="fas fa-arrow-down transform group-hover:translate-y-1 transition-transform"></i>
                    </button>
                    <p className="mt-3 text-center text-xs font-bold text-slate-400 block w-full">
                        Showing {visibleData.length} of {data.length}
                    </p>
                </div>
            )}
        </div>
    );
}
