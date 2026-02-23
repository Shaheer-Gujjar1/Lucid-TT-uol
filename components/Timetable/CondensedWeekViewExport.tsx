
'use client';

import React from 'react';
import { ProcessedSlot } from '@/lib/parser';

interface CondensedWeekViewExportProps {
    data: { day: string; slots: ProcessedSlot[] }[];
    mode: 'student' | 'teacher' | 'room';
    filters: any;
    generatedAt: string;
}

export default function CondensedWeekViewExport({ data, mode, filters, generatedAt }: CondensedWeekViewExportProps) {
    // 1. Exclude days with 0 entries
    const activeDays = data.filter(dayData => {
        return dayData.slots && dayData.slots.some(slot => slot.entries && slot.entries.length > 0);
    });

    // Determine selection criteria text
    let selectionInfo = "";
    if (mode === 'student') {
        selectionInfo = `${filters.program || ''} ${filters.semester || ''} ${filters.section || ''}`.trim();
        if (filters.course) selectionInfo += ` (${filters.course})`;
    } else if (mode === 'teacher') {
        selectionInfo = filters.teacherName || "";
    } else if (mode === 'room') {
        selectionInfo = filters.roomNumber || "";
    }

    const styles = {
        container: {
            width: '1400px', // Wider for multi-column layout
            background: '#ffffff',
            padding: '30px',
            fontFamily: "'Inter', sans-serif",
            color: '#1e293b',
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '2px solid #f1f5f9',
        },
        dayColumn: {
            flex: 1,
            minWidth: '300px',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            padding: '12px',
            background: '#fcfcfd',
        },
        dayTitle: {
            fontSize: '14px',
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            color: '#4f46e5',
            textAlign: 'center' as const,
            paddingBottom: '8px',
            marginBottom: '10px',
            borderBottom: '1px solid #e2e8f0',
            letterSpacing: '1px',
        },
        slotCard: (isLab: boolean) => ({
            background: isLab ? '#fffbeb' : '#f8fafc',
            border: `1px solid ${isLab ? '#fcd34d' : '#e2e8f0'}`,
            borderRadius: '10px',
            padding: '8px 12px',
            marginBottom: '6px',
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '2px',
        }),
        time: {
            fontSize: '9px',
            fontWeight: 900,
            color: '#94a3b8',
            letterSpacing: '0.5px',
        },
        course: {
            fontSize: '11px',
            fontWeight: 800,
            color: '#1e293b',
            lineHeight: '1.2',
        },
        meta: {
            fontSize: '9px',
            fontWeight: 600,
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '4px',
        }
    };

    return (
        <div id="timetable-print-view" style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#1e293b', margin: 0 }}>
                        Lucid <span style={{ color: '#4f46e5' }}>Chronicle</span>
                    </h1>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}>Optimized Week View • High-Density Export</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', fontWeight: 900, color: '#334155' }}>{selectionInfo || 'OVERALL SCHEDULE'}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', marginTop: '4px' }}>{mode.toUpperCase()} PERSPECTIVE</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                {activeDays.map((dayData, dIdx) => (
                    <div key={dIdx} style={styles.dayColumn}>
                        <div style={styles.dayTitle}>{dayData.day}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {dayData.slots
                                .filter(s => s.entries && s.entries.length > 0)
                                .map((slot, sIdx) => (
                                    <div key={sIdx}>
                                        {slot.entries.map((entry, eIdx) => (
                                            <div key={eIdx} style={styles.slotCard(entry.isLab)}>
                                                <div style={styles.time}>{slot.time}</div>
                                                <div style={styles.course}>{entry.course}</div>
                                                <div style={styles.meta}>
                                                    <span>{entry.instructor.split(' ').slice(-1)[0]}</span>
                                                    <span>{entry.room} • {entry.class}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#cbd5e1', fontWeight: 600 }}>
                <span>luciduol.netlify.app</span>
                <span>Generated at {generatedAt}</span>
            </div>
        </div>
    );
}
