
'use client';

import { useState, useEffect } from 'react';
import Dropdown from '@/components/UI/Dropdown';
import { PROGRAMS, EXAM_PROGRAMS, SEMESTERS, SECTIONS, DAYS_OPTIONS, TEACHERS } from '@/lib/constants';
import { useSettings } from '@/lib/settings';

interface Filters {
    program: string;
    semester: string;
    section: string;
    day: string;
    teacherName: string;
    roomNumber: string;
    date?: string;
    studentSearch?: string;
    course?: string; // NEW
}

interface FilterBarProps {
    mode: 'student' | 'teacher' | 'room' | 'exam';
    examView?: 'datesheet' | 'seating';
    filters: Filters;
    setFilter: (key: keyof Filters, value: string) => void;
    onSave?: () => void;
    onClear?: () => void;
    availableDates?: string[];
}

// ...



export default function FilterBar({ mode, examView, filters, setFilter, onSave, onClear, availableDates }: FilterBarProps) {
    const { settings, mounted } = useSettings();
    const isClassic = mounted && settings.wordingPreference === 'classic';
    const [isExpanded, setIsExpanded] = useState(false);
    const [allowOverflow, setAllowOverflow] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    useEffect(() => {
        if (!isExpanded) setActiveDropdown(null); // Reset when collapsed

        let timeout: NodeJS.Timeout;
        if (isExpanded) {
            timeout = setTimeout(() => setAllowOverflow(true), 500);
        } else {
            setAllowOverflow(false);
        }
        return () => clearTimeout(timeout);
    }, [isExpanded]);

    return (
        <div className={`relative z-[100] bg-white dark:bg-slate-900 md:bg-gradient-to-br md:from-indigo-50/40 md:via-white md:to-white md:dark:from-slate-800/50 md:dark:via-slate-900 md:dark:to-slate-900 rounded-[2.5rem] shadow-sm md:shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-indigo-100/50 dark:border-slate-800/80 backdrop-blur-none md:backdrop-blur-sm transition-all duration-500 ${isExpanded ? 'p-5 md:p-8 mb-8' : 'p-3 md:p-3 mb-2'}`}>

            {/* Header - Always Visible */}
            <div className="flex justify-between items-center cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 transition-transform duration-500 ${isExpanded ? 'scale-110' : 'group-hover:scale-105'}`}>
                        <i className={`fas fa-filter text-xl transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                            {isExpanded ? (isClassic ? 'Condense Filter' : 'Condense Selection') : (isClassic ? 'Filter Selection' : 'Refine Selection')}
                        </h2>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                            {mode === 'student' ? (isClassic ? 'Student Mode' : 'Learner Perspective') : mode === 'teacher' ? (isClassic ? 'Teacher Mode' : 'Lecturer Perspective') : mode === 'room' ? (isClassic ? 'Room Mode' : 'Spatial Dashboard') : (isClassic ? 'Exam Mode' : 'Crucible')}
                        </p>
                    </div>
                </div>
                <div className={`w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-slate-100 dark:bg-slate-800 rotate-180' : 'bg-white dark:bg-slate-900'}`}>
                    <i className="fas fa-chevron-down text-indigo-500"></i>
                </div>
            </div>

            {/* Refined Selection Criteria */}
            {/* Refined Selection Criteria */}
            <div className={`grid transition-all duration-500 ease-in-out ${isExpanded ? 'grid-rows-[1fr] mt-6' : 'grid-rows-[0fr] mt-0'} ${isExpanded && allowOverflow ? 'overflow-visible' : 'overflow-hidden'}`}>
                <div className={`overflow-hidden ${isExpanded ? 'md:overflow-visible' : 'md:overflow-hidden'} transition-all duration-300 ${activeDropdown ? (mode === 'student' ? 'pb-32' : mode === 'exam' ? (activeDropdown === 'semester' ? 'pb-60' : 'pb-27') : mode === 'room' ? 'pb-66' : mode === 'teacher' ? 'pb-39' : 'pb-60') : 'pb-1'} md:pb-1 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
                    <div key={mode} className="animate-fade-in-up"> {/* Added Animation Wrapper */}
                        {mode === 'student' && (
                            <div className="flex flex-col gap-4 mb-6 relative z-[105]">
                                {/* Row 1: Dropdowns / Buttons */}
                                <div className={settings.filterStyle === 'buttons' ? "space-y-6" : "grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6"}>
                                    <FilterWrapper
                                        label={isClassic ? "Program" : "Faculty Discipline"}
                                        value={filters.program}
                                        options={PROGRAMS}
                                        onChange={(v) => setFilter('program', v)}
                                        icon="fa-graduation-cap"
                                        isOpen={activeDropdown === 'program'}
                                        onToggle={(v) => setActiveDropdown(v ? 'program' : null)}
                                        style={settings.filterStyle}
                                    />
                                    <FilterWrapper
                                        label={isClassic ? "Semester" : "Academic Term"}
                                        value={filters.semester}
                                        options={SEMESTERS}
                                        onChange={(v) => setFilter('semester', v)}
                                        icon="fa-layer-group"
                                        isOpen={activeDropdown === 'semester'}
                                        onToggle={(v) => setActiveDropdown(v ? 'semester' : null)}
                                        style={settings.filterStyle}
                                    />
                                    <FilterWrapper
                                        label={isClassic ? "Section" : "Cohort"}
                                        value={filters.section}
                                        options={SECTIONS}
                                        onChange={(v) => setFilter('section', v)}
                                        icon="fa-users"
                                        isOpen={activeDropdown === 'section'}
                                        onToggle={(v) => setActiveDropdown(v ? 'section' : null)}
                                        style={settings.filterStyle}
                                    />
                                    <FilterWrapper
                                        label={isClassic ? "Day" : "Temporal Frame"}
                                        value={filters.day}
                                        options={DAYS_OPTIONS}
                                        onChange={(v) => setFilter('day', v)}
                                        icon="fa-calendar-day"
                                        isOpen={activeDropdown === 'day'}
                                        onToggle={(v) => setActiveDropdown(v ? 'day' : null)}
                                        style={settings.filterStyle}
                                    />
                                </div>
                                {/* Row 2: Subject Search (Optional) */}
                                {settings.enableCourseSearch && (
                                    <div className="flex flex-col gap-2 relative">
                                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">{isClassic ? 'Subject Search (Optional)' : 'Subject Discovery (Optional)'}</label>
                                        <div className="relative">
                                            <i className="fas fa-book-open absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                            <input
                                                type="text"
                                                value={filters.course || ''}
                                                onChange={(e) => setFilter('course', e.target.value)}
                                                placeholder={isClassic ? "Search Course..." : "Strict Search (e.g. 'Calculus')"}
                                                className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner placeholder:font-medium"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Teacher & Room Modes with Z-Index fix */}
                        {mode === 'teacher' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 relative z-[105]">
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">{isClassic ? 'Teacher Name' : 'Lecturer Identity'}</label>
                                    <div className="relative">
                                        <i className="fas fa-chalkboard-teacher absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                        <input
                                            type="text"
                                            value={filters.teacherName}
                                            onChange={(e) => setFilter('teacherName', e.target.value)}
                                            placeholder={isClassic ? "e.g. Mr. Smith" : "e.g. Ms. Alishba"}
                                            className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner"
                                        />
                                    </div>
                                    {settings.enableCourseSearch && (
                                        <div className="flex flex-col gap-2 relative mt-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">{isClassic ? 'Course (Optional)' : 'Subject / Course (Optional)'}</label>
                                            <div className="relative">
                                                <i className="fas fa-book-open absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                                <input
                                                    type="text"
                                                    value={filters.course || ''}
                                                    onChange={(e) => setFilter('course', e.target.value)}
                                                    placeholder={isClassic ? "Search subject..." : "Strict Search (e.g. 'Calculus')"}
                                                    className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner placeholder:font-medium"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <FilterWrapper
                                    label={isClassic ? "Day" : "Temporal Frame"}
                                    value={filters.day}
                                    options={DAYS_OPTIONS}
                                    onChange={(v) => setFilter('day', v)}
                                    icon="fa-calendar-day"
                                    isOpen={activeDropdown === 'day'}
                                    onToggle={(v) => setActiveDropdown(v ? 'day' : null)}
                                    style={settings.filterStyle}
                                />
                            </div>
                        )}
                        {/* Room Mode */}
                        {mode === 'room' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 relative z-[105]">
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">{isClassic ? 'Room Number' : 'Spatial Designation'}</label>
                                    <div className="relative">
                                        <i className="fas fa-door-open absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                        <input
                                            type="text"
                                            value={filters.roomNumber}
                                            onChange={(e) => setFilter('roomNumber', e.target.value)}
                                            placeholder={isClassic ? "e.g. 107" : "Discovery Spatial..."}
                                            className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner"
                                        />
                                    </div>
                                </div>
                                <FilterWrapper
                                    label={isClassic ? "Day" : "Temporal Frame"}
                                    value={filters.day}
                                    options={DAYS_OPTIONS}
                                    onChange={(v) => setFilter('day', v)}
                                    icon="fa-calendar-day"
                                    isOpen={activeDropdown === 'day'}
                                    onToggle={(v) => setActiveDropdown(v ? 'day' : null)}
                                    style={settings.filterStyle}
                                />
                            </div>
                        )}

                        {/* Exam Mode */}
                        {mode === 'exam' && (
                            <div className="mb-6 relative z-[105]">
                                {examView === 'seating' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Seating Plan Guidance Tip */}
                                        <div className="col-span-1 md:col-span-2 bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl p-3 flex items-start gap-3 mb-2">
                                            <i className="fas fa-lightbulb text-indigo-500 mt-0.5 animate-pulse"></i>
                                            <div>
                                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Smart Search Tip</p>
                                                <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 leading-tight">
                                                    You can find your seat by searching your <strong>Name / ID</strong> directly.
                                                    <span className="block mt-1 text-indigo-500 font-bold">Note: You do NOT need to set every class filter. Use them only if you want to browse a specific section.</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Student Search */}
                                        <div className="flex flex-col gap-2 relative">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Student Name / ID</label>
                                            <div className="relative">
                                                <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                                <input
                                                    type="text"
                                                    value={filters.studentSearch || ''}
                                                    onChange={(e) => setFilter('studentSearch', e.target.value)}
                                                    placeholder="Enter Name or Registration ID..."
                                                    className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        {/* Course Search */}
                                        <div className="flex flex-col gap-2 relative">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Course</label>
                                            <div className="relative">
                                                <i className="fas fa-book absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                                <input
                                                    type="text"
                                                    value={filters.course || ''}
                                                    onChange={(e) => setFilter('course', e.target.value)}
                                                    placeholder="Discovery Search (e.g. 'Calculus')"
                                                    className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        {/* Room Search */}
                                        <div className="flex flex-col gap-2 relative">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">Room Number</label>
                                            <div className="relative">
                                                <i className="fas fa-door-open absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"></i>
                                                <input
                                                    type="text"
                                                    value={filters.roomNumber || ''}
                                                    onChange={(e) => setFilter('roomNumber', e.target.value)}
                                                    placeholder="Discovery Spatial..."
                                                    className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 pl-12 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 font-black text-sm transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        {/* Class Filters (Program, Semester, Section) */}
                                        <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Dropdown label={isClassic ? "Program" : "Faculty Discipline"} value={filters.program} options={EXAM_PROGRAMS} onChange={(v) => setFilter('program', v)} icon="fa-graduation-cap" isOpen={activeDropdown === 'program'} onToggle={(v) => setActiveDropdown(v ? 'program' : null)} />
                                            <Dropdown label={isClassic ? "Semester" : "Academic Term"} value={filters.semester} options={SEMESTERS} onChange={(v) => setFilter('semester', v)} icon="fa-layer-group" isOpen={activeDropdown === 'semester'} onToggle={(v) => setActiveDropdown(v ? 'semester' : null)} />
                                            <Dropdown label={isClassic ? "Section" : "Cohort"} value={filters.section} options={SECTIONS} onChange={(v) => setFilter('section', v)} icon="fa-users" isOpen={activeDropdown === 'section'} onToggle={(v) => setActiveDropdown(v ? 'section' : null)} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                                        <Dropdown
                                            label={isClassic ? "Date" : "Temporal Index"}
                                            value={filters.date || ''}
                                            options={[
                                                { label: isClassic ? 'All Dates' : 'Complete Index', value: '' },
                                                ...(availableDates || []).map(d => ({ label: d, value: d }))
                                            ]}
                                            onChange={(v) => setFilter('date', v)}
                                            icon="fa-calendar-alt"
                                            isOpen={activeDropdown === 'date'}
                                            onToggle={(v) => setActiveDropdown(v ? 'date' : null)}
                                        />
                                        <Dropdown label={isClassic ? "Program" : "Faculty Discipline"} value={filters.program} options={EXAM_PROGRAMS} onChange={(v) => setFilter('program', v)} icon="fa-graduation-cap" isOpen={activeDropdown === 'program'} onToggle={(v) => setActiveDropdown(v ? 'program' : null)} />
                                        <Dropdown label={isClassic ? "Semester" : "Academic Term"} value={filters.semester} options={SEMESTERS} onChange={(v) => setFilter('semester', v)} icon="fa-layer-group" isOpen={activeDropdown === 'semester'} onToggle={(v) => setActiveDropdown(v ? 'semester' : null)} />
                                        <Dropdown label={isClassic ? "Section" : "Cohort"} value={filters.section} options={SECTIONS} onChange={(v) => setFilter('section', v)} icon="fa-users" isOpen={activeDropdown === 'section'} onToggle={(v) => setActiveDropdown(v ? 'section' : null)} />
                                    </div>
                                )}
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
                                        <i className="fas fa-save opacity-80 group-hover:animate-pulse"></i> {isClassic ? 'Save Settings' : 'Save as Preferences'}
                                    </button>
                                    <button onClick={onClear} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-6 md:px-8 py-3 rounded-full border-2 border-red-500/30 text-red-500 font-black hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 hover:scale-[1.02] active:scale-95 transition-all text-sm shadow-sm group">
                                        <i className="fas fa-trash-alt opacity-70 group-hover:animate-bounce"></i> {isClassic ? 'Reset All' : 'Clear All'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-components
function FilterWrapper({ label, value, options, onChange, icon, isOpen, onToggle, style }: {
    label: string,
    value: string,
    options: { label: string, value: string }[],
    onChange: (v: string) => void,
    icon: string,
    isOpen: boolean,
    onToggle: (v: boolean) => void,
    style?: string
}) {
    if (style === 'buttons') {
        return (
            <ButtonGroup
                label={label}
                value={value}
                options={options}
                onChange={onChange}
                icon={icon}
            />
        );
    }
    return (
        <Dropdown
            label={label}
            value={value}
            options={options}
            onChange={onChange}
            icon={icon}
            isOpen={isOpen}
            onToggle={onToggle}
        />
    );
}

function ButtonGroup({ label, value, options, onChange, icon }: {
    label: string,
    value: string,
    options: { label: string, value: string }[],
    onChange: (v: string) => void,
    icon: string
}) {
    return (
        <div className="flex flex-col gap-3 group animate-scale-in">
            <div className="flex items-center gap-2 px-1">
                <i className={`fas ${icon} text-indigo-500 text-[10px]`}></i>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                    {label}
                </label>
                {value && (
                    <div className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse"></div>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                    const isActive = value === option.value;
                    return (
                        <button
                            key={option.value}
                            onClick={() => onChange(isActive ? '' : option.value)}
                            className={`px-4 py-2.5 rounded-2xl text-[11px] font-black transition-all duration-300 transform active:scale-95 border-2 ${isActive
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-[1.05]'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-500/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5'
                                }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
