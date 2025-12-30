
'use client';

interface ModeToggleProps {
    mode: 'student' | 'teacher' | 'room';
    setMode: (mode: 'student' | 'teacher' | 'room') => void;
}

export default function ModeToggle({ mode, setMode }: ModeToggleProps) {
    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] p-3 flex flex-col md:flex-row justify-center gap-2 md:gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-8 border border-white/40 dark:border-slate-800/50">
            <button
                onClick={() => setMode('student')}
                className={`flex items-center gap-3 px-8 py-3 rounded-full font-black transition-all duration-300 ${mode === 'student' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <i className="fas fa-user-graduate"></i> Student
            </button>
            <button
                onClick={() => setMode('teacher')}
                className={`flex items-center gap-3 px-8 py-3 rounded-full font-black transition-all duration-300 ${mode === 'teacher' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <i className="fas fa-chalkboard-teacher"></i> Teacher
            </button>
            <button
                onClick={() => setMode('room')}
                className={`flex items-center gap-3 px-8 py-3 rounded-full font-black transition-all duration-300 ${mode === 'room' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <i className="fas fa-door-open"></i> Room
            </button>
        </div>
    );
}
