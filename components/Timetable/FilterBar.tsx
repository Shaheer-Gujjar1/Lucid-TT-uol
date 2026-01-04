
'use client';

import { useState } from 'react';
import Dropdown from '@/components/UI/Dropdown';
import { PROGRAMS, SEMESTERS, SECTIONS, DAYS_OPTIONS, TEACHERS } from '@/lib/constants';

interface Filters {
    program: string;
    semester: string;
    section: string;
    day: string;
    teacherName: string;
    roomNumber: string;
}

interface FilterBarProps {
    mode: 'student' | 'teacher' | 'room';
    filters: Filters;
    setFilter: (key: keyof Filters, value: string) => void;
    onSave?: () => void;
    onClear?: () => void;
}

export default function FilterBar({ mode, filters, setFilter, onSave, onClear }: FilterBarProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative z-[100] bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-indigo-50/40 md:via-white md:to-white md:dark:from-slate-800/50 md:dark:via-slate-900 md:dark:to-slate-900 rounded-[2.5rem] p-5 md:p-8 shadow-sm md:shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-8 border border-indigo-100/50 dark:border-slate-800/80 backdrop-blur-none md:backdrop-blur-sm transition-all duration-500">

            {/* Mobile Toggle Header */}
            <div
                className="md:hidden flex justify-between items-center cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'}`}>
                        <i className="fas fa-filter"></i>
                    </div>
                    <span className="font-black text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">
                        {isExpanded ? 'Hide Filters' : 'Show Filters'}
                    </span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 bg-slate-100 dark:bg-slate-800 ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`}>
                    <i className="fas fa-chevron-down"></i>
                </div>
            </div>

            {/* Filter Content */}
            {/* Filter Content */}
            <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'} md:grid-rows-[1fr] md:opacity-100 md:mt-6`}>
                <div className={`overflow-hidden md:overflow-visible transition-all duration-300 ${isExpanded ? 'pb-48' : 'pb-0'} md:pb-0`}>
                    {mode === 'student' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-6 relative z-[105]">
                            <Dropdown label="Program" value={filters.program} options={PROGRAMS} onChange={(v) => setFilter('program', v)} icon="fa-graduation-cap" />
                            <Dropdown label="Semester" value={filters.semester} options={SEMESTERS} onChange={(v) => setFilter('semester', v)} icon="fa-layer-group" />
                            <Dropdown label="Section" value={filters.section} options={SECTIONS} onChange={(v) => setFilter('section', v)} icon="fa-users" />
                            <Dropdown label="Day" value={filters.day} options={DAYS_OPTIONS} onChange={(v) => setFilter('day', v)} icon="fa-calendar-day" />
                        </div>
                    )}

                    {/* Teacher & Room Modes with Z-Index fix */}
                    {mode === 'teacher' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-[105]">
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Teacher Name</label>
                                <div className="relative">
                                    <i className="fas fa-chalkboard-teacher absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                    <input
                                        type="text"
                                        value={filters.teacherName}
                                        onChange={(e) => setFilter('teacherName', e.target.value)}
                                        placeholder="e.g. Dr. Smith"
                                        className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <Dropdown label="Day" value={filters.day} options={DAYS_OPTIONS} onChange={(v) => setFilter('day', v)} icon="fa-calendar-day" />
                        </div>
                    )}

                    {mode === 'room' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 relative z-[105]">
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Room Number</label>
                                <div className="relative">
                                    <i className="fas fa-door-open absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                    <input
                                        type="text"
                                        value={filters.roomNumber}
                                        onChange={(e) => setFilter('roomNumber', e.target.value)}
                                        placeholder="e.g. 107"
                                        className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner"
                                    />
                                </div>
                            </div>
                            <Dropdown label="Day" value={filters.day} options={DAYS_OPTIONS} onChange={(v) => setFilter('day', v)} icon="fa-calendar-day" />
                        </div>
                    )}

                    {/* Global Actions (Tags + Save Buttons) */}
                    <div className="relative z-10">
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
                            {Object.entries(filters).map(([key, value]) => {
                                if (!value || key === 'day') return null;
                                const label = key.replace(/([A-Z])/g, ' $1').trim();
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key as any, '')}
                                        className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-all duration-300 animate-scale-in origin-center shadow-sm hover:shadow-md"
                                    >
                                        <span className="opacity-60 text-[10px] uppercase font-black">{label}:</span>
                                        <span>{value}</span>
                                        <i className="fas fa-times text-[10px] group-hover:rotate-90 transition-transform duration-200"></i>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Save Actions (Hidden for Room Mode) */}
                        {mode !== 'room' && (
                            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                <button onClick={onSave} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-8 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm shadow-md group border border-indigo-400/30">
                                    <i className="fas fa-save opacity-80 group-hover:animate-pulse"></i> Save as Preferences
                                </button>
                                <button onClick={onClear} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-8 py-3 rounded-full border-2 border-red-500/30 text-red-500 font-black hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 hover:scale-[1.02] active:scale-95 transition-all text-sm shadow-sm group">
                                    <i className="fas fa-trash-alt opacity-70 group-hover:animate-bounce"></i> Clear All
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
