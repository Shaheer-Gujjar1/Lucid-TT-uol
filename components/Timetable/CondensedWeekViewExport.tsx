
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
    // Flatten all entries across all days into a single table
    const rows: { day: string; time: string; course: string; instructor: string; room: string; classInfo: string; isLab: boolean; isClash: boolean }[] = [];

    data.forEach(dayData => {
        if (!dayData.slots) return;
        dayData.slots.forEach(slot => {
            if (!slot.entries || slot.entries.length === 0) return;
            slot.entries.forEach(entry => {
                rows.push({
                    day: dayData.day,
                    time: slot.time,
                    course: entry.course || 'Untitled',
                    instructor: entry.instructor || 'Staff',
                    room: entry.room || '-',
                    classInfo: entry.class || '-',
                    isLab: entry.isLab,
                    isClash: slot.entries.length > 1,
                });
            });
        });
    });

    // Selection info
    let selectionInfo = "";
    if (mode === 'student') {
        selectionInfo = `${filters.program || ''} ${filters.semester || ''} ${filters.section || ''}`.trim();
        if (filters.course) selectionInfo += ` (${filters.course})`;
    } else if (mode === 'teacher') {
        selectionInfo = filters.teacherName || "";
    } else if (mode === 'room') {
        selectionInfo = filters.roomNumber || "";
    }

    // Count classes per day for the summary
    const daySummary = data
        .filter(d => d.slots && d.slots.some(s => s.entries && s.entries.length > 0))
        .map(d => ({
            day: d.day,
            count: d.slots.reduce((acc, s) => acc + (s.entries?.length || 0), 0)
        }));

    const totalClasses = rows.length;
    const activeDays = daySummary.length;

    const s = {
        container: {
            width: '1220px',
            background: '#ffffff',
            padding: '40px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#1e293b',
        } as React.CSSProperties,
        headerBlock: {
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '24px',
            paddingBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
        } as React.CSSProperties,
        title: {
            fontSize: '32px',
            fontWeight: 800,
            color: '#334155',
            lineHeight: 1,
            marginBottom: '8px',
        } as React.CSSProperties,
        subtitle: {
            fontSize: '14px',
            color: '#64748b',
            fontWeight: 500,
        } as React.CSSProperties,
        filterTag: {
            background: '#f1f5f9',
            color: '#475569',
            fontWeight: 700,
            fontSize: '11px',
            padding: '6px 16px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginTop: '8px',
        } as React.CSSProperties,
        statsRow: {
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
        } as React.CSSProperties,
        statCard: {
            flex: 1,
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '14px 20px',
            borderTop: '1px solid #e2e8f0',
            borderRight: '1px solid #e2e8f0',
            borderBottom: '1px solid #e2e8f0',
            borderLeft: '1px solid #e2e8f0',
        } as React.CSSProperties,
        statLabel: {
            fontSize: '10px',
            fontWeight: 800,
            color: '#94a3b8',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            marginBottom: '2px',
        } as React.CSSProperties,
        statValue: {
            fontSize: '20px',
            fontWeight: 900,
            color: '#334155',
        } as React.CSSProperties,
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '12px',
        } as React.CSSProperties,
        th: {
            textAlign: 'left' as const,
            padding: '12px 16px',
            background: '#f8fafc',
            color: '#64748b',
            fontWeight: 800,
            textTransform: 'uppercase' as const,
            fontSize: '10px',
            letterSpacing: '0.5px',
            borderBottom: '2px solid #e2e8f0',
        } as React.CSSProperties,
        td: {
            padding: '10px 16px',
            borderBottom: '1px solid #f1f5f9',
            verticalAlign: 'middle' as const,
            color: '#334155',
            fontWeight: 600,
            fontSize: '12px',
        } as React.CSSProperties,
        dayBadge: (day: string) => {
            const colors: Record<string, { bg: string; color: string; border: string }> = {
                'Monday': { bg: '#eef2ff', color: '#4338ca', border: '#c7d2fe' },
                'Tuesday': { bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
                'Wednesday': { bg: '#fefce8', color: '#854d0e', border: '#fef08a' },
                'Thursday': { bg: '#fdf2f8', color: '#9d174d', border: '#fbcfe8' },
                'Friday': { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
                'Saturday': { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe' },
            };
            const c = colors[day] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
            return {
                background: c.bg,
                color: c.color,
                fontWeight: 900,
                fontSize: '10px',
                padding: '4px 12px',
                borderRadius: '9999px',
                borderTop: `1px solid ${c.border}`,
                borderRight: `1px solid ${c.border}`,
                borderBottom: `1px solid ${c.border}`,
                borderLeft: `1px solid ${c.border}`,
                display: 'inline-block',
                letterSpacing: '0.02em',
                textTransform: 'uppercase' as const,
            } as React.CSSProperties;
        },
        typeBadge: (isLab: boolean) => ({
            background: isLab ? '#fffbeb' : '#eef2ff',
            color: isLab ? '#92400e' : '#4338ca',
            fontWeight: 800,
            fontSize: '9px',
            padding: '3px 10px',
            borderRadius: '9999px',
            borderTop: `1px solid ${isLab ? '#fcd34d' : '#c7d2fe'}`,
            borderRight: `1px solid ${isLab ? '#fcd34d' : '#c7d2fe'}`,
            borderBottom: `1px solid ${isLab ? '#fcd34d' : '#c7d2fe'}`,
            borderLeft: `1px solid ${isLab ? '#fcd34d' : '#c7d2fe'}`,
            display: 'inline-block',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
        } as React.CSSProperties),
        footer: {
            marginTop: '40px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#94a3b8',
            fontWeight: 500,
        } as React.CSSProperties,
    };

    return (
        <div id="timetable-print-view" style={s.container}>
            {/* Header */}
            <div style={s.headerBlock}>
                <div>
                    <h1 style={s.title}>
                        Lucid <span style={{ color: '#7c3aed' }}>Chronicle</span>
                    </h1>
                    <p style={s.subtitle}>Generated via Lucid Aura∞ v6.13.6</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                        {selectionInfo || 'FULL SCHEDULE'}
                    </div>
                    <div style={s.filterTag}>
                        {mode.toUpperCase()} MODE • WEEK VIEW
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div style={s.statsRow}>
                <div style={s.statCard}>
                    <div style={s.statLabel}>Total Classes</div>
                    <div style={s.statValue}>{totalClasses}</div>
                </div>
                <div style={s.statCard}>
                    <div style={s.statLabel}>Active Days</div>
                    <div style={s.statValue}>{activeDays}</div>
                </div>
                {daySummary.map((ds, i) => (
                    <div key={i} style={s.statCard}>
                        <div style={s.statLabel}>{ds.day.slice(0, 3)}</div>
                        <div style={s.statValue}>{ds.count}</div>
                    </div>
                ))}
            </div>

            {/* Main Table */}
            <table style={s.table}>
                <thead>
                    <tr>
                        <th style={{ ...s.th, width: '12%' }}>Day</th>
                        <th style={{ ...s.th, width: '14%' }}>Time</th>
                        <th style={{ ...s.th, width: '30%' }}>Course</th>
                        <th style={{ ...s.th, width: '18%' }}>Instructor</th>
                        <th style={{ ...s.th, width: '8%' }}>Room</th>
                        <th style={{ ...s.th, width: '10%' }}>Class</th>
                        <th style={{ ...s.th, width: '8%', textAlign: 'right' }}>Type</th>
                        <th style={{ ...s.th, width: '6%', textAlign: 'center' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => {
                        // Show day badge only on the first entry of each day
                        const isFirstOfDay = i === 0 || rows[i - 1].day !== row.day;
                        const isLastOfDay = i === rows.length - 1 || rows[i + 1]?.day !== row.day;

                        return (
                            <tr key={i} style={{
                                borderBottom: isLastOfDay ? '2px solid #e2e8f0' : undefined,
                            }}>
                                <td style={s.td}>
                                    {isFirstOfDay && <span style={s.dayBadge(row.day)}>{row.day.slice(0, 3)}</span>}
                                </td>
                                <td style={s.td}>
                                    <span style={{ fontWeight: 700, color: '#64748b', fontSize: '11px' }}>{row.time}</span>
                                </td>
                                <td style={s.td}>
                                    <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '13px', display: 'block', lineHeight: '1.3' }}>{row.course}</span>
                                </td>
                                <td style={s.td}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>{row.instructor}</span>
                                </td>
                                <td style={s.td}>
                                    <span style={{ fontWeight: 800, color: '#1e293b' }}>{row.room}</span>
                                </td>
                                <td style={s.td}>
                                    <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, color: '#475569' }}>
                                        {row.classInfo}
                                    </span>
                                </td>
                                <td style={{ ...s.td, textAlign: 'right' }}>
                                    <span style={s.typeBadge(row.isLab)}>
                                        {row.isLab ? 'Lab' : 'Lec'}
                                    </span>
                                </td>
                                <td style={{ ...s.td, textAlign: 'center' }}>
                                    {row.isClash && (
                                        <span style={{ background: '#fef2f2', color: '#dc2626', fontWeight: 800, fontSize: '9px', padding: '3px 8px', borderRadius: '9999px', border: '1px solid #fecaca', display: 'inline-block', letterSpacing: '0.04em', textTransform: 'uppercase' as const }}>CLASH</span>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                No classes found for the current selection.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ ...s.footer, flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', lineHeight: '1.5', textAlign: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#6366f1' }}>🌟 Stay Synced!</span> Schedules evolve dynamically to enhance your experience. I highly encourage checking the live app regularly for real-time updates so you never miss a beat! Downloaded chronicles capture a single moment in time, so relying on the live platform ensures you always have the most accurate information (developer is not liable for misguided assumptions from outdated copies).
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div>https://luciduol.netlify.app</div>
                    <div>{generatedAt}</div>
                </div>
            </div>
        </div>
    );
}
