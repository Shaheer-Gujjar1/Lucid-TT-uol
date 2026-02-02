'use client';

import { Subject, GRADE_POINTS } from '@/lib/gpa_utils';
import { useState, useRef, useEffect } from 'react';

interface SubjectRowProps {
    subject: Subject;
    onChange: (id: string, field: keyof Subject, value: any) => void;
    onDelete: (id: string) => void;
}

const CustomDropdown = ({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: string[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-14" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500/20"
            >
                <span>{value}</span>
                <i className={`fas fa-chevron-down text-[8px] text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {isOpen && (
                <div className="absolute top-[calc(100%+4px)] left-0 w-full z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-32 overflow-y-auto custom-scrollbar">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            onClick={() => { onChange(opt); setIsOpen(false); }}
                            className={`w-full text-center py-1.5 text-[10px] sm:text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${value === opt ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const SubjectRow = ({ subject, onChange, onDelete }: SubjectRowProps) => {
    return (
        <div className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-500/30 transition-colors group relative">
            <div className="flex-1 min-w-0">
                <input
                    type="text"
                    value={subject.name}
                    onChange={(e) => onChange(subject.id, 'name', e.target.value)}
                    placeholder="Subject Name"
                    className="w-full bg-transparent border-none p-0 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none placeholder:text-slate-400 placeholder:font-normal truncate"
                />
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <div className="relative group/input">
                    <input
                        type="number"
                        value={subject.creditHours}
                        onChange={(e) => onChange(subject.id, 'creditHours', parseFloat(e.target.value) || 0)}
                        placeholder="CH"
                        min="0"
                        max="6"
                        className="w-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 text-center text-[10px] sm:text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-0.5 px-2 rounded opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Credits</div>
                </div>

                <div className="relative group/input">
                    <CustomDropdown
                        value={subject.grade}
                        onChange={(val) => onChange(subject.id, 'grade', val)}
                        options={Object.keys(GRADE_POINTS)}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-0.5 px-2 rounded opacity-0 group-hover/input:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">Grade</div>
                </div>

                <button
                    onClick={() => onDelete(subject.id)}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                    title="Remove Subject"
                >
                    <i className="fas fa-times text-[10px]"></i>
                </button>
            </div>
        </div>
    );
};

export default SubjectRow;
