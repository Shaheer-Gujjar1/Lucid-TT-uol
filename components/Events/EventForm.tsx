
'use client';

import { useState } from 'react';
import { AgendaEvent } from './types';
import Dropdown from '@/components/UI/Dropdown';

interface EventFormProps {
    onAdd: (event: Omit<AgendaEvent, 'id' | 'completed'>) => void;
}

export default function EventForm({ onAdd }: EventFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        type: 'Assignment',
        course: '',
        date: '',
        time: '',
        description: '',
        priority: 'Medium' as 'High' | 'Medium' | 'Low',
        reminder: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd(formData);
        setFormData({
            title: '',
            type: 'Assignment',
            course: '',
            date: '',
            time: '',
            description: '',
            priority: 'Medium',
            reminder: false
        });
    };

    const TYPES = [
        { label: 'Assignment', value: 'Assignment' },
        { label: 'Quiz', value: 'Quiz' },
        { label: 'Project', value: 'Project' },
        { label: 'Exam', value: 'Exam' },
        { label: 'Other', value: 'Other' }
    ];

    const PRIORITIES = [
        { label: 'High', value: 'High' },
        { label: 'Medium', value: 'Medium' },
        { label: 'Low', value: 'Low' }
    ];

    const inputClasses = "w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold placeholder-slate-400 text-sm";
    const labelClasses = "block mb-2 font-black text-slate-400 dark:text-slate-500 text-xs uppercase tracking-widest pl-1";

    return (
        <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-white/50 dark:border-slate-700/50 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-80 rounded-t-[2.5rem]"></div>

            <h2 className="text-2xl font-black mb-8 text-slate-700 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shadow-sm">
                    <i className="fas fa-plus"></i>
                </span>
                New Event Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="group">
                    <label className={labelClasses}>Title</label>
                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClasses} placeholder="e.g. Calculus Midterm" />
                </div>
                <Dropdown label="Type" value={formData.type} options={TYPES} onChange={v => setFormData({ ...formData, type: v })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="group">
                    <label className={labelClasses}>Course</label>
                    <input type="text" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} className={inputClasses} placeholder="Course Name (Optional)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClasses}>Date</label>
                        <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className={inputClasses} />
                    </div>
                    <div>
                        <label className={labelClasses}>Time</label>
                        <input type="time" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className={inputClasses} />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <label className={labelClasses}>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={`${inputClasses} h-32 resize-none`} placeholder="Add any extra details, links, or notes..." />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="w-full md:w-auto flex-1">
                    <label className={labelClasses}>Priority</label>
                    <div className="relative grid grid-cols-3 gap-0 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700 isolate">
                        {/* Sliding Pill */}
                        <div className={`absolute top-1.5 bottom-1.5 w-[32%] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-lg shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10
                            ${formData.priority === 'High' ? 'left-[1.5%]' : ''}
                            ${formData.priority === 'Medium' ? 'left-[34%]' : ''}
                            ${formData.priority === 'Low' ? 'left-[66.5%]' : ''}
                        `}></div>

                        {PRIORITIES.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, priority: option.value as any })}
                                className={`py-3 md:py-4 rounded-full font-black text-xs uppercase tracking-wider transition-colors duration-300 z-10 
                                    ${formData.priority === option.value ? 'text-white' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="submit" className="w-full md:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-4 rounded-full font-black hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-3">
                    <i className="fas fa-check"></i> Save Event
                </button>
            </div>
        </form>
    );
}
