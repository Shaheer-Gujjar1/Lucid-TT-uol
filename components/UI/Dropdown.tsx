
'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
    label: string;
    value: string;
    options: { label: string; value: string }[];
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: string;
}

export default function Dropdown({ label, value, options, onChange, placeholder = "Select...", icon }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-2 w-full relative" ref={dropdownRef}>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1">{label}</label>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl text-slate-700 dark:text-slate-200 font-black text-sm transition-all duration-300 shadow-inner group ${isOpen ? 'ring-4 ring-indigo-500/10 border-indigo-500' : 'hover:border-indigo-400'} ${icon ? 'pl-12 relative' : ''}`}
            >
                {icon && (
                    <i className={`fas ${icon} absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500`}></i>
                )}
                <span className={!value ? 'text-slate-400' : ''}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <i className={`fas fa-chevron-down text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`}></i>
            </button>

            {/* Custom Dropdown List */}
            {isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-full z-[100] animate-fade-in-down origin-top">
                    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden">
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => { onChange(''); setIsOpen(false); }}
                                    className="w-full text-left px-5 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    {placeholder}
                                </button>
                                {options.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                        className={`w-full text-left px-5 py-3 rounded-xl text-sm font-black transition-all ${value === opt.value ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/20 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
