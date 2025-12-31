
'use client';

interface ModeToggleProps {
    mode: 'student' | 'teacher' | 'room';
    setMode: (mode: 'student' | 'teacher' | 'room') => void;
}

export default function ModeToggle({ mode, setMode }: ModeToggleProps) {
    return (
        <div className="bg-white md:bg-white/80 dark:bg-slate-900 md:dark:bg-slate-900/80 backdrop-blur-none md:backdrop-blur-md rounded-full p-1.5 w-full max-w-2xl mx-auto shadow-sm md:shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-8 border border-white/40 dark:border-slate-800/50 relative isolate">

            {/* Sliding Pill */}
            <div
                className={`absolute top-1.5 bottom-1.5 w-[32%] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-md shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10
                ${mode === 'student' ? 'left-[1.33%]' : ''}
                ${mode === 'teacher' ? 'left-[34%]' : ''}
                ${mode === 'room' ? 'left-[66.66%]' : ''}
                `}
            />

            <div className="grid grid-cols-3 gap-0 relative">
                <button
                    onClick={() => setMode('student')}
                    className={`flex items-center justify-center gap-2 py-3 md:py-4 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors duration-300 ${mode === 'student' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                >
                    <i className={`fas fa-user-graduate text-sm md:text-base ${mode === 'student' ? 'animate-bounce-short' : ''}`}></i>
                    <span className="hidden md:inline">Student</span>
                    <span className="md:hidden">Std</span>
                </button>

                <button
                    onClick={() => setMode('teacher')}
                    className={`flex items-center justify-center gap-2 py-3 md:py-4 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors duration-300 ${mode === 'teacher' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                >
                    <i className={`fas fa-chalkboard-teacher text-sm md:text-base ${mode === 'teacher' ? 'animate-bounce-short' : ''}`}></i>
                    <span className="hidden md:inline">Teacher</span>
                    <span className="md:hidden">Tchr</span>
                </button>

                <button
                    onClick={() => setMode('room')}
                    className={`flex items-center justify-center gap-2 py-3 md:py-4 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors duration-300 ${mode === 'room' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'
                        }`}
                >
                    <i className={`fas fa-door-open text-sm md:text-base ${mode === 'room' ? 'animate-bounce-short' : ''}`}></i>
                    <span className="hidden md:inline">Room</span>
                    <span className="md:hidden">Room</span>
                </button>
            </div>
        </div>
    );
}
