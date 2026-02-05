'use client';

import { useState } from 'react';
import { Semester, Subject, calculateSemesterGPA } from '@/lib/gpa_utils';
import SubjectRow from './SubjectRow';

interface SemesterCardProps {
    semester: Semester;
    onUpdate: (id: string, updatedSemester: Semester) => void;
    onDelete: (id: string) => void;
    index?: number;
}

const SemesterCard = ({ semester, onUpdate, onDelete, index = 0 }: SemesterCardProps) => {
    const { gpa, totalCredits } = calculateSemesterGPA(semester.subjects);

    // Stagger delay
    const delay = Math.min(index * 150, 1500); // 150ms stagger
    const style = { animationDelay: `${delay}ms` };

    const handleAddSubject = () => {
        const newSubject: Subject = {
            id: crypto.randomUUID(),
            name: '',
            creditHours: 3,
            grade: 'B'
        };
        onUpdate(semester.id, {
            ...semester,
            subjects: [...semester.subjects, newSubject]
        });
    };

    const handleSubjectChange = (subjectId: string, field: keyof Subject, value: any) => {
        const updatedSubjects = semester.subjects.map(sub =>
            sub.id === subjectId ? { ...sub, [field]: value } : sub
        );
        onUpdate(semester.id, { ...semester, subjects: updatedSubjects });
    };

    const handleSubjectDelete = (subjectId: string) => {
        const updatedSubjects = semester.subjects.filter(sub => sub.id !== subjectId);
        onUpdate(semester.id, { ...semester, subjects: updatedSubjects });
    };

    return (
        <div className="relative group transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={style}>
            {/* Slot Border Gradient Pill - Refined */}
            <div className="absolute top-4 bottom-4 left-0 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-full flex flex-col pl-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_40px_-10px_rgba(99,102,241,0.15)] transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 border-dashed">
                    <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs group-hover:scale-105 transition-transform duration-300">
                                <i className="fas fa-graduation-cap"></i>
                            </span>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={semester.name}
                                    onChange={(e) => onUpdate(semester.id, { ...semester, name: e.target.value })}
                                    className="text-base sm:text-lg font-black text-slate-800 dark:text-white bg-transparent outline-none placeholder:text-slate-300 w-full truncate tracking-tight"
                                    placeholder="Semester Name"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pl-11">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <i className="fas fa-chart-line text-indigo-500"></i>
                                <span>{gpa.toFixed(2)} GPA</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                <i className="fas fa-star text-amber-500"></i>
                                <span>{totalCredits} Cr</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onDelete(semester.id)}
                        className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        title="Remove Semester"
                    >
                        <i className="fas fa-trash-can text-sm"></i>
                    </button>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                    {semester.subjects.map(subject => (
                        <SubjectRow
                            key={subject.id}
                            subject={subject}
                            onChange={handleSubjectChange}
                            onDelete={handleSubjectDelete}
                        />
                    ))}

                    {semester.subjects.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/30 flex flex-col items-center gap-2 group/empty">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 group-hover/empty:text-indigo-400 transition-colors">
                                <i className="fas fa-book-open text-sm"></i>
                            </div>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">No subjects</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleAddSubject}
                    className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 text-slate-500 hover:text-indigo-600 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800/50 rounded-xl transition-all text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
                >
                    <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center text-[8px] group-hover/btn:rotate-180 transition-all duration-300">
                        <i className="fas fa-plus"></i>
                    </div>
                    <span>Add Subject</span>
                </button>
            </div>
        </div>
    );
};

export default SemesterCard;
