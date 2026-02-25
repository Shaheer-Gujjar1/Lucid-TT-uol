
'use client';

import { useState, useEffect } from 'react';
import { AgendaEvent } from './types';

interface EventListProps {
    events: AgendaEvent[];
    onDelete: (id: string) => void;
    onToggleComplete: (id: string) => void;
    onEdit: (event: AgendaEvent) => void;
}

export default function EventList({ events, onDelete, onToggleComplete, onEdit }: EventListProps) {
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'overdue'>('today');
    const [priorityFilter, setPriorityFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all');
    const [todayStr, setTodayStr] = useState<string>('');

    useEffect(() => {
        setTodayStr(new Date().toISOString().split('T')[0]);
    }, []);

    const filteredEvents = events.filter(e => {
        // 1. Date Check
        let matchesDate = true;
        if (dateFilter === 'today') matchesDate = e.date === todayStr;
        if (dateFilter === 'overdue') matchesDate = e.date < todayStr && !e.completed;

        // 2. Priority Check
        let matchesPriority = true;
        if (priorityFilter !== 'all') matchesPriority = e.priority === priorityFilter;

        return matchesDate && matchesPriority;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const togglePriority = (p: 'High' | 'Medium' | 'Low') => {
        setPriorityFilter(prev => prev === p ? 'all' : p);
    };

    return (
        <div>
            {/* Filter Buttons Container */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6 p-1">

                {/* Row 1: Main Filters */}
                <div className="flex items-center justify-between md:justify-start gap-2">
                    <button onClick={() => setDateFilter('today')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm md:text-base ${dateFilter === 'today' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'glass hover:bg-white/50 dark:text-slate-200'}`}>
                        Today
                    </button>
                    <button onClick={() => setDateFilter('all')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm md:text-base ${dateFilter === 'all' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30' : 'glass hover:bg-white/50 dark:text-slate-200'}`}>
                        All
                    </button>
                    <button onClick={() => setDateFilter('overdue')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm md:text-base ${dateFilter === 'overdue' ? 'bg-red-500 text-white shadow-lg' : 'glass hover:bg-white/50 text-red-500 dark:text-red-400'}`}>
                        Overdue
                    </button>
                </div>

                {/* Mobile Separator */}
                <hr className="md:hidden border-slate-200 dark:border-slate-700/50 my-1" />

                {/* Desktop Divider (Vertical) */}
                <div className="hidden md:block w-[1px] h-8 bg-slate-300 dark:bg-slate-700 mx-1 self-center"></div>

                {/* Row 2: Priority Filters */}
                <div className="flex items-center justify-between md:justify-start gap-2">
                    <button onClick={() => togglePriority('High')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm md:text-base ${priorityFilter === 'High' ? 'bg-red-100 text-red-600 ring-2 ring-red-500 shadow-lg' : 'glass hover:bg-red-50 text-red-500 dark:text-red-400'}`}>
                        High
                    </button>
                    <button onClick={() => togglePriority('Medium')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm md:text-base ${priorityFilter === 'Medium' ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500 shadow-lg' : 'glass hover:bg-amber-50 text-amber-500 dark:text-amber-400'}`}>
                        Medium
                    </button>
                    <button onClick={() => togglePriority('Low')} className={`flex-1 md:flex-none px-4 md:px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all text-sm md:text-base ${priorityFilter === 'Low' ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500 shadow-lg' : 'glass hover:bg-emerald-50 text-emerald-500 dark:text-emerald-400'}`}>
                        Low
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-10 opacity-60">
                        <i className="fas fa-calendar-check text-4xl mb-2 text-[var(--accent-color)]"></i>
                        <p className="text-[var(--text-secondary)]">No events found for this filter.</p>
                    </div>
                ) : (
                    filteredEvents.map((event, index) => {
                        const isUrgent = event.priority === 'High' && !event.completed;
                        const isToday = event.date === todayStr && !event.completed;

                        // --------------------------------------------------------------------------
                        // DYNAMIC THEMING
                        // --------------------------------------------------------------------------
                        let cardBg = 'bg-gradient-to-br from-slate-50/90 to-white/60 dark:from-slate-800/90 dark:to-slate-900/60';
                        let borderGradient = 'from-slate-200 to-white dark:from-slate-700 dark:to-slate-800';
                        let accentColor = 'bg-slate-400';
                        let shadowClass = 'shadow-sm hover:shadow-lg hover:shadow-slate-500/10';
                        let decorativeBlur = 'bg-slate-400/5';
                        let priorityBadgeInfo = { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', border: 'border-slate-200 dark:border-slate-700' };

                        if (event.priority === 'High') {
                            cardBg = 'bg-gradient-to-br from-red-50/90 to-white/60 dark:from-slate-800/90 dark:to-slate-900/60';
                            borderGradient = 'from-red-200/60 to-rose-100/40 dark:from-red-900/40 dark:to-slate-800';
                            accentColor = 'bg-gradient-to-b from-red-500 to-rose-600';
                            shadowClass = 'shadow-sm hover:shadow-xl hover:shadow-red-500/10';
                            decorativeBlur = 'bg-red-500/5 group-hover:bg-red-500/10';
                            priorityBadgeInfo = { bg: 'bg-red-50 text-red-700', text: 'text-red-700', border: 'border-red-100' };
                        } else if (event.priority === 'Medium') {
                            cardBg = 'bg-gradient-to-br from-amber-50/90 to-white/60 dark:from-slate-800/90 dark:to-slate-900/60';
                            borderGradient = 'from-amber-200/60 to-orange-100/40 dark:from-amber-900/40 dark:to-slate-800';
                            accentColor = 'bg-gradient-to-b from-amber-400 to-orange-500';
                            shadowClass = 'shadow-sm hover:shadow-xl hover:shadow-amber-500/10';
                            decorativeBlur = 'bg-amber-500/5 group-hover:bg-amber-500/10';
                            priorityBadgeInfo = { bg: 'bg-amber-50 text-amber-700', text: 'text-amber-700', border: 'border-amber-100' };
                        } else if (event.priority === 'Low') {
                            cardBg = 'bg-gradient-to-br from-emerald-50/90 to-white/60 dark:from-slate-800/90 dark:to-slate-900/60';
                            borderGradient = 'from-emerald-200/60 to-teal-100/40 dark:from-emerald-900/40 dark:to-slate-800';
                            accentColor = 'bg-gradient-to-b from-emerald-400 to-teal-500';
                            shadowClass = 'shadow-sm hover:shadow-xl hover:shadow-emerald-500/10';
                            decorativeBlur = 'bg-emerald-500/5 group-hover:bg-emerald-500/10';
                            priorityBadgeInfo = { bg: 'bg-emerald-50 text-emerald-700', text: 'text-emerald-700', border: 'border-emerald-100' };
                        }

                        // Completed Override
                        if (event.completed) {
                            cardBg = 'bg-slate-50/50 dark:bg-slate-900/30';
                            borderGradient = 'from-slate-200/50 to-transparent dark:from-slate-800/50';
                            accentColor = 'bg-slate-300 dark:bg-slate-700';
                            shadowClass = 'shadow-none';
                            decorativeBlur = 'hidden';
                            priorityBadgeInfo = { bg: 'bg-slate-100 text-slate-400', text: 'text-slate-400', border: 'border-slate-100' };
                        }

                        // Stagger delay
                        const delay = Math.min(index * 100, 1000);
                        const style = { animationDelay: `${delay}ms` };

                        return (
                            <div
                                key={event.id}
                                className={`relative group animate-fade-in-up p-[1px] rounded-2xl bg-gradient-to-br ${borderGradient} ${event.completed ? 'opacity-50 grayscale-[0.5]' : shadowClass} transition-all duration-300`}
                                style={style}
                            >
                                <div className={`relative p-3 md:p-4 rounded-[15px] h-full ${cardBg} backdrop-blur-xl flex justify-between items-center gap-3 overflow-hidden transition-colors`}>

                                    {/* Decorative Blur Circle */}
                                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl transition-all duration-500 ${decorativeBlur}`}></div>

                                    {/* Left Accent Bar */}
                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${accentColor} shadow-sm`}></div>

                                    {/* Content Section */}
                                    <div className="flex-1 pl-3 min-w-0 z-10">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border shadow-sm ${priorityBadgeInfo.bg} ${priorityBadgeInfo.text} ${priorityBadgeInfo.border}`}>
                                                {event.priority}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                                <i className="far fa-clock text-[9px]"></i>
                                                {event.time || 'All Day'}
                                            </span>
                                            {isToday && <span className="text-[8px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full shadow-lg shadow-indigo-500/30 animate-pulse tracking-wide">TODAY</span>}
                                        </div>

                                        <h3 className={`font-extrabold text-base md:text-lg leading-tight truncate tracking-tight mb-1 ${event.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {event.title}
                                        </h3>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] md:text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[150px] md:max-w-none flex items-center gap-1.5">
                                                {event.course && <i className="fas fa-book-open text-[9px] opacity-70"></i>}
                                                {event.course || event.type}
                                            </span>
                                            {event.date && <span className="text-[10px] font-medium text-slate-400 dark:text-slate-600">• {event.date}</span>}
                                        </div>
                                    </div>

                                    {/* Actions Section */}
                                    <div className="flex items-center gap-1 md:gap-2 shrink-0 z-10">
                                        {!event.completed && (
                                            <button
                                                onClick={() => onToggleComplete(event.id)}
                                                className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:scale-110 md:hover:scale-105 active:scale-95 transition-all"
                                                title="Complete"
                                            >
                                                <i className="fas fa-check text-sm md:text-base"></i>
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onEdit(event)}
                                            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:scale-110 md:hover:scale-105 active:scale-95 transition-all"
                                            title="Edit"
                                        >
                                            <i className="fas fa-pen text-xs md:text-sm"></i>
                                        </button>

                                        <button
                                            onClick={() => onDelete(event.id)}
                                            className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-110 md:hover:scale-105 active:scale-95 transition-all"
                                            title="Delete"
                                        >
                                            <i className="fas fa-trash-alt text-xs md:text-sm"></i>
                                        </button>
                                    </div>

                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    );
}
