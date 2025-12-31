'use client';

interface ViewToggleProps {
    view: 'day' | 'week';
    setView: (view: 'day' | 'week') => void;
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
    return (
        <div className="bg-white md:bg-white/80 dark:bg-slate-900 md:dark:bg-slate-900/80 backdrop-blur-none md:backdrop-blur-md rounded-full p-1.5 flex shadow-sm md:shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-8 border border-white/40 dark:border-slate-800/50 max-w-sm mx-auto relative z-10 w-full md:w-auto">
            <div className="grid grid-cols-2 w-full relative">
                {/* Sliding Pill */}
                <div
                    className={`absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-md shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10
                    ${view === 'day' ? 'left-0' : 'left-[50%]'}
                    `}
                />

                <button
                    onClick={() => setView('day')}
                    className={`py-3 px-8 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${view === 'day' ? 'text-white' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                    <i className="fas fa-calendar-day"></i> <span className="hidden sm:inline">Day View</span><span className="sm:hidden">Day</span>
                </button>
                <button
                    onClick={() => setView('week')}
                    className={`py-3 px-8 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${view === 'week' ? 'text-white' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                >
                    <i className="fas fa-calendar-week"></i> <span className="hidden sm:inline">Week View</span><span className="sm:hidden">Week</span>
                </button>
            </div>
        </div>
    );
}
