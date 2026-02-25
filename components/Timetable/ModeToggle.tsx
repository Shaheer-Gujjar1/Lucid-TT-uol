
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
                {enabledModes.map((m) => {
                    const isActive = mode === m;
                    const isClassic = mounted && settings.wordingPreference === 'classic';
                    const config = {
                        student: { icon: 'fa-user-graduate', label: isClassic ? 'Student' : 'Learner', short: isClassic ? 'Std' : 'Lrn', onClick: () => setMode('student') },
                        teacher: { icon: 'fa-chalkboard-teacher', label: isClassic ? 'Teacher' : 'Lecturer', short: isClassic ? 'Tch' : 'Lec', onClick: () => setMode('teacher') },
                        room: { icon: 'fa-door-open', label: isClassic ? 'Room' : 'Spatial', short: 'Room', onClick: () => setMode('room') },
                        exam: { icon: 'fa-file-invoice', label: isClassic ? 'Exams' : 'Crucible', short: isClassic ? 'Exam' : 'Crbl', onClick: () => setMode('exam') }
                    }[m];

                    return (
                        <button
                            key={m}
                            onClick={config.onClick}
                            className={`flex ${colCount <= 3 ? 'flex-row' : 'flex-col md:flex-row'} items-center justify-center gap-1.5 md:gap-3 px-1 md:px-6 py-2.5 md:py-3.5 rounded-full font-black tracking-tighter uppercase transition-all duration-300 z-10 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                        >
                            <i className={`fas ${config.icon} text-xs md:text-sm transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}></i>
                            <span className="text-[9px] md:text-sm opacity-90">
                                <span className={`${colCount <= 3 ? 'inline' : 'hidden md:inline'}`}>{config.label}</span>
                                <span className={`${colCount <= 3 ? 'hidden' : 'md:hidden'}`}>{config.short}</span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
