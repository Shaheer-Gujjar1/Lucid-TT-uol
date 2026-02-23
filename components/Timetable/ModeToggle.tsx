
'use client';

import { useSettings } from '@/lib/settings';

interface ModeToggleProps {
    mode: 'student' | 'teacher' | 'room' | 'exam';
    setMode: (mode: 'student' | 'teacher' | 'room' | 'exam') => void;
}

export default function ModeToggle({ mode, setMode }: ModeToggleProps) {
    const { settings, mounted } = useSettings();
    if (!mounted) return null; // Wait for settings to mount to avoid layout jumps

    const enabledModes: ('student' | 'teacher' | 'room' | 'exam')[] = ['student', 'teacher'];
    if (settings.enableRoomMode) enabledModes.push('room');
    if (settings.enableCrucible) enabledModes.push('exam');

    const colCount = enabledModes.length;
    const modeIndex = enabledModes.indexOf(mode);

    // Dynamic left percentage logic for the sliding pill
    const getLeftPos = () => {
        if (modeIndex === -1) return '0%';
        return `${(modeIndex / colCount) * 100 + 0.5}%`;
    };

    const pillWidth = `${(100 / colCount) - 1}%`;

    return (
        <div className="bg-white md:bg-white/80 dark:bg-slate-900 md:dark:bg-slate-900/80 backdrop-blur-none md:backdrop-blur-md rounded-full p-1.5 w-full max-w-3xl mx-auto shadow-sm md:shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-8 border border-white/40 dark:border-slate-800/50 relative isolate">

            {/* Sliding Pill */}
            <div
                className="absolute top-1.5 bottom-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-md shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10"
                style={{
                    left: getLeftPos(),
                    width: pillWidth
                }}
            />

            <div
                className="grid gap-0 relative"
                style={{ gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))` }}
            >
                <button onClick={() => setMode('student')} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-1 md:px-6 py-2.5 md:py-3.5 rounded-full font-black tracking-tighter uppercase transition-all duration-300 z-10 ${mode === 'student' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                    <i className={`fas fa-user-graduate text-xs md:text-sm transition-transform duration-300 ${mode === 'student' ? 'scale-110' : 'group-hover:scale-110'}`}></i>
                    <span className="text-[9px] md:text-sm opacity-90">
                        <span className="hidden md:inline">Learner</span>
                        <span className="md:hidden">Std</span>
                    </span>
                </button>
                <button onClick={() => setMode('teacher')} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-1 md:px-6 py-2.5 md:py-3.5 rounded-full font-black tracking-tighter uppercase transition-all duration-300 z-10 ${mode === 'teacher' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                    <i className={`fas fa-chalkboard-teacher text-xs md:text-sm transition-transform duration-300 ${mode === 'teacher' ? 'scale-110' : 'group-hover:scale-110'}`}></i>
                    <span className="text-[9px] md:text-sm opacity-90">
                        <span className="hidden md:inline">Lecturer</span>
                        <span className="md:hidden">Lec</span>
                    </span>
                </button>
                {settings.enableRoomMode && (
                    <button onClick={() => setMode('room')} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-1 md:px-6 py-2.5 md:py-3.5 rounded-full font-black tracking-tighter uppercase transition-all duration-300 z-10 ${mode === 'room' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                        <i className={`fas fa-door-open text-xs md:text-sm transition-transform duration-300 ${mode === 'room' ? 'scale-110' : 'group-hover:scale-110'}`}></i>
                        <span className="text-[9px] md:text-sm opacity-90">
                            <span className="hidden md:inline">Spatial</span>
                            <span className="md:hidden">Room</span>
                        </span>
                    </button>
                )}
                {settings.enableCrucible && (
                    <button onClick={() => setMode('exam')} className={`flex flex-col md:flex-row items-center justify-center gap-1 md:gap-3 px-1 md:px-6 py-2.5 md:py-3.5 rounded-full font-black tracking-tighter uppercase transition-all duration-300 z-10 ${mode === 'exam' ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                        <i className={`fas fa-file-invoice text-xs md:text-sm transition-transform duration-300 ${mode === 'exam' ? 'scale-110' : 'group-hover:scale-110'}`}></i>
                        <span className="text-[9px] md:text-sm opacity-90">
                            <span className="hidden md:inline">Crucible</span>
                            <span className="md:hidden">Exam</span>
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
