import React from 'react';
import { ProcessedSlot } from '@/lib/parser';

interface TimetablePrintViewProps {
    slots: ProcessedSlot[];
    day: string;
    room?: string;
    mode: 'student' | 'teacher' | 'room';
    date?: string;
    filters: any;
    generatedAt: string;
}

export default function TimetablePrintView({ slots, day, room, mode, date, filters, generatedAt }: TimetablePrintViewProps) {
    // Determine filter label text
    let filterInfo = "";
    if (mode === 'student') {
        filterInfo = `${filters.program || ''} ${filters.semester || ''} ${filters.section || ''}`.trim();
    } else if (mode === 'teacher') {
        filterInfo = filters.teacherName || "";
    } else if (mode === 'room') {
        filterInfo = filters.roomNumber || "";
    }

    const styles = {
        container: {
            position: 'fixed' as const,
            left: '-9999px',
            top: 0,
            width: '850px',
            background: '#ffffff', // Clean white for print
            padding: '40px',
            fontFamily: 'Inter, system-ui, sans-serif',
            color: '#1e293b',
        },
        headerBlock: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '2px solid #e2e8f0',
        },
        headerTitle: {
            fontSize: '28px',
            fontWeight: 900,
            color: '#334155',
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            gap: '0px', // No gap needed if no logo
        },
        headerGradientText: {
            color: '#7c3aed', // Purple-600 to match theme without gradient text clip issues
            display: 'inline-block',
        },
        metaInfo: {
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end',
        },
        pill: {
            background: '#f1f5f9',
            color: '#475569',
            fontWeight: 700,
            fontSize: '12px',
            padding: '6px 16px',
            borderRadius: '9999px',
            border: '1px solid #e2e8f0',
        },
        filterLabel: {
            fontSize: '16px',
            fontWeight: 800,
            color: '#334155',
            textAlign: 'right' as const,
            marginTop: '8px',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
        },
        slotCard: (isLab: boolean, isFree: boolean) => {
            // Precise Tailwind-match gradients
            // Lecture (Blue): from-blue-50 via-blue-50/60 to-white
            const bgBlue = 'linear-gradient(135deg, #eff6ff 0%, rgba(239, 246, 255, 0.6) 50%, #ffffff 100%)';
            // Lab (Amber): from-amber-50 via-amber-50/60 to-white
            const bgAmber = 'linear-gradient(135deg, #fffbeb 0%, rgba(255, 251, 235, 0.6) 50%, #ffffff 100%)';
            // Free (Emerald): from-emerald-50 via-emerald-50/60 to-white
            const bgEmerald = 'linear-gradient(135deg, #ecfdf5 0%, rgba(236, 253, 245, 0.6) 50%, #ffffff 100%)';

            const bg = isLab ? bgAmber : isFree ? bgEmerald : bgBlue;
            const borderColor = isLab ? 'rgba(245, 158, 11, 0.3)' : isFree ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)';
            const borderLeftColor = isLab ? '#f59e0b' : isFree ? '#10b981' : '#3b82f6';

            return {
                position: 'relative' as const,
                background: bg,
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '16px',
                border: `1px solid ${borderColor}`,
                borderLeft: `6px solid ${borderLeftColor}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                minHeight: isFree ? '80px' : 'auto',
            };
        },
        timeLabel: {
            fontSize: '11px',
            fontWeight: 900,
            color: '#94a3b8',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
        },
        clashBadge: {
            position: 'absolute' as const,
            top: '0',
            right: '0',
            background: 'linear-gradient(to right, #ef4444, #dc2626)',
            color: 'white',
            fontSize: '10px',
            fontWeight: 800,
            padding: '4px 12px',
            borderRadius: '0 16px 0 12px',
            letterSpacing: '1px',
        },
        typeBadge: (isLab: boolean) => ({
            background: isLab ? 'linear-gradient(to right, #fef3c7, #fffbeb)' : 'linear-gradient(to right, #dbeafe, #eff6ff)',
            color: isLab ? '#92400e' : '#1e40af',
            fontSize: '9px',
            fontWeight: 900,
            padding: '4px 12px',
            borderRadius: '9999px',
            display: 'inline-block',
            marginBottom: '8px',
            border: `1px solid ${isLab ? '#fcd34d' : '#93c5fd'}`,
            letterSpacing: '0.5px',
        }),
        courseTitle: {
            fontSize: '16px',
            fontWeight: 900,
            color: '#1e293b', // slate-800
            marginBottom: '4px',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
        },
        instructorLabel: {
            fontSize: '13px',
            fontWeight: 600,
            color: '#64748b', // slate-500
            marginBottom: '12px',
            display: 'block',
        },
        bottomRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginTop: '8px',
        },
        roomBox: {
            textAlign: 'right' as const,
        },
        roomLabel: {
            fontSize: '12px',
            color: '#94a3b8',
            fontWeight: 700,
        },
        roomValue: {
            color: '#334155',
            fontWeight: 900,
            fontSize: '13px',
        },
        classLabel: {
            fontSize: '11px',
            fontWeight: 900,
            textTransform: 'uppercase' as const,
            color: '#64748b',
            letterSpacing: '0.5px',
        },
        freeText: {
            color: '#10b981',
            fontSize: '20px',
            fontWeight: 900,
            letterSpacing: '4px',
            textTransform: 'uppercase' as const,
            textAlign: 'center' as const,
            width: '100%',
            marginTop: '4px',
        },
        footer: {
            marginTop: '40px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#94a3b8',
            fontWeight: 500,
        }
    };

    return (
        <div id="timetable-download-view" style={styles.container}>
            <div style={styles.headerBlock}>
                <div>
                    <div style={styles.headerTitle}>
                        <span>Lucid <span style={styles.headerGradientText}>Timetable</span></span> <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 500, marginLeft: '8px' }}>v5.7.3</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={styles.metaInfo}>
                        <span style={styles.pill}>{day}</span>
                        <span style={styles.pill}>{mode.toUpperCase()} MODE</span>
                    </div>
                    <div style={styles.filterLabel}>{filterInfo || 'ALL CLASSES'}</div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {slots.map((slot, idx) => {
                    const isFree = !slot.entries || slot.entries.length === 0;

                    if (isFree) {
                        return (
                            <div key={idx} style={{ ...styles.slotCard(false, true), borderLeft: 'none' }}>
                                <div style={styles.timeLabel}>{slot.time}</div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                    <div style={styles.freeText}>FREE</div>
                                </div>
                            </div>
                        );
                    }

                    const isClash = slot.entries.length > 1;
                    const isLab = slot.entries[0]?.isLab;
                    const accentColor = isLab ? '#f59e0b' : '#3b82f6';

                    return (
                        <div key={idx} style={{ ...styles.slotCard(isLab, false), borderLeft: 'none' }}>
                            {/* Accent Pill */}
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: '16px',
                                bottom: '16px',
                                width: '4px',
                                background: accentColor,
                                borderRadius: '0 4px 4px 0'
                            }}></div>

                            {isClash && <div style={styles.clashBadge}>CLASH</div>}

                            {slot.entries.map((entry, entryIdx) => (
                                <div key={entryIdx}>
                                    {entryIdx > 0 && <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '16px 0' }} />}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={styles.timeLabel}>
                                                <span>TIME:</span> {slot.time}
                                            </div>
                                            <div style={styles.courseTitle}>{entry.course}</div>
                                            <div style={styles.instructorLabel}>{entry.instructor}</div>
                                        </div>
                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                            <div style={styles.typeBadge(entry.isLab)}>
                                                {entry.isLab ? 'LABORATORY' : 'LECTURE'}
                                            </div>
                                            <div style={styles.roomLabel}>
                                                Room <span style={styles.roomValue}>{entry.room}</span>
                                            </div>
                                            <div style={{ ...styles.classLabel, marginTop: '4px' }}>{entry.class}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            <div style={styles.footer}>
                <div>https://www.luciduol.netlify.app</div>
                <div>{generatedAt}</div>
            </div>
        </div>
    );
}
