
'use client';

import { ProcessedSlot } from '@/lib/parser';
import { isSlotActive } from '@/lib/time_utils';
import ProcessSlotCard from './ProcessSlotCard';
import { useState, useEffect } from 'react';
import { useSettings } from '@/lib/settings';

interface DayViewProps {
    slots: ProcessedSlot[];
    loading?: boolean;
    error?: string | null;
    day?: string;
}

export default function DayView({ slots, loading, error, day }: DayViewProps) {
    const { settings, mounted } = useSettings();
    const isClassic = mounted && settings.wordingPreference === 'classic';

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-indigo-600 font-bold tracking-widest text-xs uppercase">{isClassic ? 'Loading...' : 'Updating Schedule...'}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 p-8 rounded-[2rem] text-center">
                <i className="fas fa-exclamation-triangle text-3xl text-red-500 mb-4"></i>
                <h3 className="text-lg font-bold text-red-800">Connection Error</h3>
                <p className="text-red-600/70 text-sm mt-1">{error}</p>
            </div>
        )
    }

    if (!slots || slots.length === 0) {
        return (
            <div className="bg-white/50 border-2 border-dashed border-slate-200 p-20 rounded-[3rem] text-center animate-fade-in">
                <div className="inline-block animate-bounce duration-[2000ms]">
                    <i className="fas fa-calendar-alt text-5xl text-slate-200 mb-4"></i>
                </div>
                <h3 className="text-xl font-black text-slate-300 uppercase tracking-widest">No classes found</h3>
                <p className="text-slate-400 text-sm mt-2">Adjust your filters or select a different day.</p>
            </div>
        );
    }

    return (
        <div key={day} className="space-y-4 pb-24">
            {slots.map((slot, index) => (
                <ProcessSlotCard
                    key={`${slot.time}-${index}`}
                    slotData={slot}
                    index={index}
                    day={day}
                    isActive={day ? isSlotActive(day, slot.time) : false}
                />
            ))}
        </div>
    );
}
