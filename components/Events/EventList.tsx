
'use client';

import { useState } from 'react';
import { AgendaEvent } from './types';

interface EventListProps {
    events: AgendaEvent[];
    onDelete: (id: string) => void;
    onToggleComplete: (id: string) => void;
}

export default function EventList({ events, onDelete, onToggleComplete }: EventListProps) {
    const [filter, setFilter] = useState<'all' | 'today' | 'overdue'>('today');

    const todayStr = new Date().toISOString().split('T')[0];

    const filteredEvents = events.filter(e => {
        if (filter === 'today') return e.date === todayStr;
        if (filter === 'overdue') return e.date < todayStr && !e.completed;
        return true;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'High': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
            case 'Medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
            case 'Low': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div>
            <div className="flex gap-4 mb-6 pb-2 overflow-x-auto no-scrollbar">
                <button onClick={() => setFilter('today')} className={`px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${filter === 'today' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg scale-105' : 'glass hover:bg-white/50 hover:scale-105 dark:text-slate-200'}`}>
                    Today
                </button>
                <button onClick={() => setFilter('all')} className={`px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${filter === 'all' ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg scale-105' : 'glass hover:bg-white/50 hover:scale-105 dark:text-slate-200'}`}>
                    All Events
                </button>
                <button onClick={() => setFilter('overdue')} className={`px-5 py-2.5 rounded-2xl font-bold whitespace-nowrap transition-all ${filter === 'overdue' ? 'bg-red-500 text-white shadow-lg scale-105' : 'glass hover:bg-white/50 text-red-500 dark:text-red-400 hover:scale-105'}`}>
                    Overdue
                </button>
            </div>

            <div className="space-y-4">
                {filteredEvents.length === 0 ? (
                    <div className="text-center py-10 opacity-60">
                        <i className="fas fa-calendar-check text-4xl mb-2 text-[var(--accent-color)]"></i>
                        <p className="text-[var(--text-secondary)]">No events found for this filter.</p>
                    </div>
                ) : (
                    filteredEvents.map(event => {
                        const isUrgent = event.priority === 'High' && !event.completed;
                        const isToday = event.date === todayStr && !event.completed;
                        const urgencyClass = isUrgent ? 'event-card-urgent' : isToday ? 'event-card-today' : '';

                        return (
                            <div key={event.id} className={`glass p-6 rounded-[2rem] transition-all hover:-translate-y-1 hover:shadow-2xl border-l-[8px] ${urgencyClass} ${event.completed ? 'border-green-500 opacity-60 grayscale-[0.5]' : 'border-[var(--accent-color)] shadow-xl'}`}>
                                <div className="flex justify-between items-start flex-wrap md:flex-nowrap gap-4">
                                    <div className="flex-1 pr-4 min-w-[250px]">
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <span className={`text-[10px] md:text-xs uppercase tracking-widest px-3 py-1 rounded-xl font-bold shadow-sm ${getPriorityColor(event.priority)}`}>{event.priority}</span>
                                            <span className="text-xs text-[var(--text-tertiary)] font-bold bg-[var(--card-bg)] px-3 py-1 rounded-xl border border-[var(--glass-border)] shadow-sm">
                                                <i className="far fa-calendar-alt mr-2 text-[var(--accent-color)]"></i>{event.date} {event.time ? `• ${event.time}` : ''}
                                            </span>
                                            <span className="text-xs text-[var(--text-tertiary)] font-bold bg-[var(--card-bg)] px-3 py-1 rounded-xl border border-[var(--glass-border)] uppercase shadow-sm">{event.type}</span>
                                        </div>
                                        <h3 className={`font-extrabold text-xl md:text-2xl text-[var(--text-primary)] mb-2 tracking-tight ${event.completed ? 'line-through decoration-4 decoration-green-500/50' : ''}`}>{event.title}</h3>
                                        {event.course && <p className="text-base text-[var(--accent-color)] font-bold mb-2 flex items-center"><i className="fas fa-book-open mr-2"></i>{event.course}</p>}
                                        {event.description && <p className="text-sm md:text-base text-[var(--text-secondary)] mt-3 whitespace-pre-wrap leading-relaxed opacity-90">{event.description}</p>}
                                    </div>
                                    <div className="flex flex-row md:flex-col gap-3 ml-auto md:ml-0">
                                        <button onClick={() => onToggleComplete(event.id)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md ${event.completed ? 'bg-green-500 text-white hover:bg-green-600 scale-110' : 'glass text-gray-400 hover:bg-green-500 hover:text-white hover:scale-110'}`} title={event.completed ? "Mark as Incomplete" : "Mark as Complete"}>
                                            <i className="fas fa-check text-lg"></i>
                                        </button>
                                        <button onClick={() => onDelete(event.id)} className="w-12 h-12 rounded-2xl glass text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 transition-all shadow-md" title="Delete">
                                            <i className="fas fa-trash-alt text-lg"></i>
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
