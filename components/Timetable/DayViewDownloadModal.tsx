import React, { useState, useRef, useEffect } from 'react';
import { ProcessedSlot } from '@/lib/parser';
import { toPng } from 'html-to-image';
import { useSettings } from '@/lib/settings';

interface DayViewDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    day: string;
    slots: ProcessedSlot[];
    mode: 'student' | 'teacher' | 'room';
    filters: any;
    onToast: (msg: string) => void;
}

// Inline Print View — Sleek, High-End Card-Based Layout for Single Day
function InlineDayPrintView({ day, slots, mode, filters, generatedAt }: { day: string; slots: ProcessedSlot[], mode: string, filters: any, generatedAt: string }) {
    // Flatten all entries for the single day
    const rows: { time: string; course: string; instructor: string; room: string; classInfo: string; isLab: boolean; isClash: boolean }[] = [];
    slots.forEach(slot => {
        if (!slot.entries || slot.entries.length === 0) return;
        slot.entries.forEach(entry => {
            rows.push({
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

    let selectionInfo = "";
    if (mode === 'student') {
        selectionInfo = `${filters.program || ''} ${filters.semester || ''} ${filters.section || ''}`.trim();
        if (filters.course) selectionInfo += ` (${filters.course})`;
    } else if (mode === 'teacher') {
        selectionInfo = filters.teacherName || "";
    } else if (mode === 'room') {
        selectionInfo = filters.roomNumber || "";
    }

    const totalClasses = rows.length;
    const labClasses = rows.filter(r => r.isLab).length;
    const lectureClasses = totalClasses - labClasses;

    const s = {
        container: { width: '1280px', background: '#f8fafc', padding: '50px', fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a' } as React.CSSProperties,
        headerBlock: { background: '#ffffff', borderRadius: '24px', padding: '32px 40px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', border: '1px solid rgba(226, 232, 240, 0.8)' } as React.CSSProperties,
        titleBox: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
        title: { fontSize: '38px', fontWeight: 900, color: '#1e293b', letterSpacing: '-1px', margin: 0, lineHeight: 1, whiteSpace: 'nowrap' as const } as React.CSSProperties,
        titleHighlight: { background: 'linear-gradient(135deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', paddingRight: '4px' },
        subtitle: { fontSize: '13px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' as const } as React.CSSProperties,
        infoBox: { textAlign: 'right' as const, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: '8px' },
        selectionBig: { fontSize: '20px', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase' as const, letterSpacing: '0.02em' } as React.CSSProperties,
        badgesRow: { display: 'flex', gap: '8px' },
        modeBadge: { background: 'linear-gradient(to right, #f1f5f9, #ffffff)', color: '#475569', fontWeight: 800, fontSize: '11px', padding: '6px 16px', borderRadius: '9999px', border: '1px solid #e2e8f0', letterSpacing: '0.05em' } as React.CSSProperties,

        statsGrid: { display: 'grid', gridTemplateColumns: `repeat(3, 1fr)`, gap: '16px', marginBottom: '40px' } as React.CSSProperties,
        statCardMain: { background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', borderRadius: '20px', padding: '20px 24px', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)', position: 'relative' as const, overflow: 'hidden' as const } as React.CSSProperties,
        statCard: { background: '#ffffff', borderRadius: '20px', padding: '20px 24px', boxShadow: '0 4px 20px -5px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center' } as React.CSSProperties,
        statLabelMain: { fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px' } as React.CSSProperties,
        statValueMain: { fontSize: '32px', fontWeight: 900, color: '#ffffff', lineHeight: 1 } as React.CSSProperties,
        statLabel: { fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: '8px' } as React.CSSProperties,
        statValue: { fontSize: '28px', fontWeight: 900, color: '#1e293b', lineHeight: 1 } as React.CSSProperties,

        listContainer: { display: 'flex', flexDirection: 'column' as const, gap: '24px' },
        dayGroup: { background: '#ffffff', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.03)', border: '1px solid rgba(226, 232, 240, 0.6)' },
        dayHeader: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid #f1f5f9' },
        dayTitle: { fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' } as React.CSSProperties,
        dayBadge: { background: '#f8fafc', color: '#64748b', fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' },

        rowCard: { display: 'grid', gridTemplateColumns: '120px 1fr 200px 140px', gap: '20px', alignItems: 'center', padding: '20px', borderRadius: '16px', background: '#f8fafc', marginBottom: '12px', border: '1px solid #f1f5f9', position: 'relative' as const, overflow: 'hidden' as const } as React.CSSProperties,

        timeCol: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
        timeLabel: { fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' } as React.CSSProperties,
        timeValue: { fontSize: '14px', fontWeight: 800, color: '#334155' } as React.CSSProperties,

        courseCol: { display: 'flex', flexDirection: 'column' as const, gap: '6px' },
        courseName: { fontSize: '18px', fontWeight: 900, color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.01em' } as React.CSSProperties,
        courseTypeBadgeLab: { alignSelf: 'flex-start' as const, background: 'linear-gradient(to right, #fffbeb, #fef3c7)', color: '#92400e', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', border: '1px solid #fcd34d', textTransform: 'uppercase' as const, letterSpacing: '0.05em' } as React.CSSProperties,
        courseTypeBadgeLec: { alignSelf: 'flex-start' as const, background: 'linear-gradient(to right, #eef2ff, #e0e7ff)', color: '#3730a3', fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', border: '1px solid #c7d2fe', textTransform: 'uppercase' as const, letterSpacing: '0.05em' } as React.CSSProperties,

        instructorCol: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
        instructorLabel: { fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' } as React.CSSProperties,
        instructorValue: { fontSize: '14px', fontWeight: 700, color: '#475569' } as React.CSSProperties,

        roomCol: { display: 'flex', flexDirection: 'column' as const, gap: '4px' },
        roomLabel: { fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.05em' } as React.CSSProperties,
        roomValue: { fontSize: '16px', fontWeight: 900, color: '#1e293b' } as React.CSSProperties,

        footer: { marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' },
        footerText: { fontSize: '12px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.02em' } as React.CSSProperties,
        footerBrand: { fontSize: '14px', fontWeight: 800, color: '#cbd5e1' } as React.CSSProperties,
    };

    return (
        <div id="day-print-view" style={s.container}>
            {/* Header Block */}
            <div style={s.headerBlock}>
                <div style={s.titleBox}>
                    <h1 style={s.title}>Lucid <span style={s.titleHighlight}>Chronicle</span></h1>
                    <div style={s.subtitle}>Generated via Lucid Aura∞ v6.12.6</div>
                </div>
                <div style={s.infoBox}>
                    <div style={s.selectionBig}>{selectionInfo || 'FULL SCHEDULE'}</div>
                    <div style={s.badgesRow}>
                        <div style={s.modeBadge}>{mode.toUpperCase()} MODE</div>
                        <div style={{ ...s.modeBadge, background: '#f8fafc' }}>DAY VIEW</div>
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div style={s.statsGrid}>
                <div style={s.statCardMain}>
                    {/* Decorative Background Element */}
                    <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '100px', height: '100px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(10px)' }}></div>
                    <div style={s.statLabelMain}>Total Classes</div>
                    <div style={s.statValueMain}>{totalClasses}</div>
                </div>
                <div style={s.statCard}>
                    <div style={s.statLabel}>Lectures</div>
                    <div style={s.statValue}>{lectureClasses}</div>
                </div>
                <div style={s.statCard}>
                    <div style={s.statLabel}>Laboratories</div>
                    <div style={s.statValue}>{labClasses}</div>
                </div>
            </div>

            {/* List Layout */}
            <div style={s.listContainer}>
                <div style={s.dayGroup}>
                    <div style={s.dayHeader}>
                        <div style={s.dayTitle}>{day}</div>
                        <div style={s.dayBadge}>{totalClasses} Classes</div>
                    </div>

                    <div>
                        {rows.map((row, i) => (
                            <div key={i} style={s.rowCard}>
                                {/* Status Line Indicator */}
                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: row.isLab ? '#f59e0b' : '#6366f1' }}></div>

                                <div style={s.timeCol}>
                                    <div style={s.timeLabel}>Time</div>
                                    <div style={s.timeValue}>{row.time}</div>
                                </div>

                                <div style={s.courseCol}>
                                    <div style={s.courseName}>{row.course}</div>
                                    <div style={row.isLab ? s.courseTypeBadgeLab : s.courseTypeBadgeLec}>
                                        {row.isLab ? 'Laboratory' : 'Lecture'}
                                    </div>
                                </div>

                                <div style={s.instructorCol}>
                                    <div style={s.instructorLabel}>Instructor</div>
                                    <div style={s.instructorValue}>{row.instructor}</div>
                                </div>

                                <div style={s.roomCol}>
                                    <div style={s.roomLabel}>Room</div>
                                    <div style={s.roomValue}>{row.room}</div>
                                </div>

                                {row.isClash && (
                                    <div style={{ position: 'absolute', top: '8px', right: '12px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, boxShadow: '0 2px 8px rgba(220, 38, 38, 0.3)' }}>CLASH</div>
                                )}
                            </div>
                        ))}
                        {rows.length === 0 && (
                            <div style={{ padding: '60px', textAlign: 'center', background: '#ffffff', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                                <div style={{ fontSize: '20px', fontWeight: 800, color: '#94a3b8' }}>No classes scheduled for this selection.</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={s.footer}>
                <div style={s.footerText}>https://luciduol.netlify.app</div>
                <div style={s.footerBrand}>BY: SHAHEER AHMED</div>
                <div style={s.footerText}>{generatedAt}</div>
            </div>
        </div>
    );
}

export default function DayViewDownloadModal({ isOpen, onClose, day, slots, mode, filters, onToast }: DayViewDownloadModalProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [clientGeneratedAt, setClientGeneratedAt] = useState('');
    const printRef = useRef<HTMLDivElement>(null);
    const { settings, mounted } = useSettings();
    const isClassic = mounted && settings.wordingPreference === 'classic';

    useEffect(() => {
        if (isOpen) {
            setClientGeneratedAt(new Date().toLocaleString());
        }
    }, [isOpen]);

    const handleDownload = async () => {
        if (!printRef.current) return;
        setIsGenerating(true);

        try {
            await new Promise(r => setTimeout(r, 500));

            const dataUrl = await toPng(printRef.current, {
                backgroundColor: '#ffffff',
                cacheBust: true,
                pixelRatio: 2,
                skipFonts: true,
            });

            const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
            let filename = `Chronicle-DayView`;
            if (mode === 'student') {
                filename = `Chronicle-${filters.program || 'Schedule'}-${filters.semester || ''}${filters.section || ''}-${day}-${dateStr}`;
            } else if (mode === 'teacher') {
                filename = `Chronicle-${filters.teacherName || 'Teacher'}-${day}-${dateStr}`;
            } else if (mode === 'room') {
                filename = `Chronicle-${filters.roomNumber || 'Room'}-${day}-${dateStr}`;
            }
            filename = filename.replace(/--+/g, '-').replace(/-$/, '');

            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataUrl;
            link.click();

            onToast(isClassic ? 'Day view downloaded!' : 'Chronicle Export Completed!');
            onClose();
        } catch (e) {
            console.error("Day view download failed", e);
            onToast(isClassic ? 'Download failed. Try again.' : 'Export process encountered an interference.');
            onClose();
        } finally {
            setIsGenerating(false);
        }
    };

    useEffect(() => {
        if (isOpen && !isGenerating) {
            handleDownload();
        }
    }, [isOpen, isGenerating]);

    if (!isOpen) return null;

    return (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
            <div ref={printRef}>
                <InlineDayPrintView
                    day={day}
                    slots={slots}
                    mode={mode}
                    filters={filters}
                    generatedAt={clientGeneratedAt}
                />
            </div>
        </div>
    );
}
