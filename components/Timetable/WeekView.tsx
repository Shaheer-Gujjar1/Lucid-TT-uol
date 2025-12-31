
'use client';

import ProcessSlotCard from './ProcessSlotCard';

interface WeekViewProps {
    data: { day: string; slots: ProcessedSlot[] }[];
    loading?: boolean;
    error?: string | null;
}

export default function WeekView({ data, loading, error }: WeekViewProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-[var(--accent-color)] font-bold">Loading week view...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">Failed to load week view</h3>
                <p className="text-[var(--text-secondary)] mt-2">{error}</p>
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-20">
                <p className="text-[var(--text-tertiary)]">No data for the selected filters.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {data.map((dayData, idx) => (
                <div key={`${dayData.day}-${idx}`} className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="text-center mb-4 pb-2 border-b-2 border-indigo-500">
                        <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{dayData.day}</h3>
                    </div>
                    <div className="space-y-4">
                        {(!dayData.slots || dayData.slots.length === 0) ? (
                            <div className="p-6 text-center opacity-50">
                                <p className="text-xs font-bold text-slate-400">No Classes</p>
                            </div>
                        ) : (
                            dayData.slots.map((slot, slotIdx) => (
                                <ProcessSlotCard
                                    key={`${dayData.day}-${slotIdx}`}
                                    slotData={slot}
                                    index={slotIdx}
                                    day={dayData.day}
                                />
                            ))
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
