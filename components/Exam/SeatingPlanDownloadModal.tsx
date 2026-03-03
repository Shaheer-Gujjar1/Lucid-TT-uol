import React, { useState, useRef, useEffect } from 'react';
import { SeatingPlanEntry } from '@/lib/exam_utils';
import { toPng } from 'html-to-image';
import { useSettings } from '@/lib/settings';

interface SeatingPlanDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: SeatingPlanEntry[];
    filters: any;
    onToast: (msg: string) => void;
}

// Inline Print View for Seating Plan
function InlineSeatingPrintView({ data, filters, generatedAt }: { data: SeatingPlanEntry[], filters: any, generatedAt: string }) {
    // Group by Room if filtered by room, or just list them?
    // If list is huge (e.g. 500 students), this image will be massive.
    // We should probably just list them in a dense grid or table.
    // Let's use a table for clarity.

    // If searching by student, it might be just 1 result.
    // If filtering by class, it might be ~50 students.

    const styles = {
        container: {
            width: '1220px',
            background: '#ffffff',
            padding: '40px',
            fontFamily: 'var(--font-manrope), sans-serif',
            color: '#1e293b',
        },
        headerBlock: {
            borderBottom: '2px solid #e2e8f0',
            marginBottom: '30px',
            paddingBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end'
        },
        title: {
            fontSize: '32px',
            fontFamily: 'var(--font-space), sans-serif',
            fontWeight: 800,
            color: '#334155',
            lineHeight: 1,
            marginBottom: '8px'
        },
        subtitle: {
            fontSize: '14px',
            color: '#64748b',
            fontWeight: 600
        },
        filterTag: {
            background: '#eff6ff',
            color: '#3b82f6',
            padding: '6px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'inline-block',
            marginTop: '8px',
            whiteSpace: 'nowrap'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '12px'
        },
        th: {
            textAlign: 'left' as const,
            padding: '12px 16px',
            background: '#f8fafc',
            color: '#64748b',
            fontWeight: 800,
            textTransform: 'uppercase' as const,
            fontSize: '11px',
            letterSpacing: '0.5px',
            borderBottom: '2px solid #e2e8f0'
        },
        td: {
            padding: '12px 16px',
            borderBottom: '1px solid #f1f5f9',
            verticalAlign: 'middle' as const,
            color: '#334155',
            fontWeight: 600
        },
        studentName: {
            fontWeight: 800,
            color: '#1e293b',
            fontSize: '14px',
            display: 'block'
        },
        seatBadge: {
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '6px',
            fontWeight: 800,
            fontSize: '12px',
            display: 'inline-block',
            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
        },
        footer: {
            marginTop: '40px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: '#94a3b8',
            fontWeight: 500
        }
    };

    return (
        <div id="seating-print-view" style={styles.container}>
            <div style={styles.headerBlock}>
                <div>
                    <h1 style={styles.title}>
                        Lucid <span style={{ color: '#7c3aed' }}>Seating Plan</span>
                    </h1>
                    <p style={styles.subtitle}>Generated via Lucid Aura∞ v6.12.6</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                        {generatedAt.split(',')[0]}
                    </div>
                    <div style={styles.filterTag}>
                        {filters.studentSearch ? `Student: ${filters.studentSearch}` : filters.program ? `${filters.program} ${filters.semester}${filters.section}` : 'ALL SEATS'}
                    </div>
                </div>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={{ ...styles.th, width: '10%' }}>Seat No</th>
                        <th style={{ ...styles.th, width: '30%' }}>Student</th>
                        <th style={{ ...styles.th, width: '30%' }}>Course</th>
                        <th style={{ ...styles.th, width: '20%' }}>Class</th>
                        <th style={{ ...styles.th, width: '10%', textAlign: 'right' }}>Room</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((seat, i) => (
                        <tr key={i}>
                            <td style={styles.td}>
                                <span style={styles.seatBadge}>{seat.seatNumber}</span>
                                {seat.row && <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', textAlign: 'center', fontWeight: 'bold' }}>Row {seat.row.replace(/Row/i, '').trim()}</div>}
                            </td>
                            <td style={styles.td}>
                                <span style={styles.studentName}>{seat.studentName}</span>
                                <span style={{ fontSize: '11px', color: '#64748b' }}>{seat.studentId}</span>
                            </td>
                            <td style={styles.td}>
                                <span style={{ fontWeight: 700, fontSize: '12px' }}>{seat.courseTitle}</span>
                            </td>
                            <td style={styles.td}>
                                <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                                    {seat.studentClass}
                                </span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                                <span style={{ fontWeight: 800, color: '#1e293b' }}>{seat.room.replace('Room ', '')}</span>
                            </td>
                        </tr>
                    ))}
                    {data.length === 0 && (
                        <tr>
                            <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                No seats found for the current filter.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={styles.footer}>
                <div>https://luciduol.netlify.app</div>
                <div>{generatedAt}</div>
            </div>
        </div>
    );
}

export default function SeatingPlanDownloadModal({ isOpen, onClose, data, filters, onToast }: SeatingPlanDownloadModalProps) {
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

            const link = document.createElement('a');
            link.download = `SeatingPlan-${filters.program || 'Custom'}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            onToast(isClassic ? 'Seating Plan Downloaded!' : 'Seating Plan Chronicle Exported!');
            onClose();
        } catch (e) {
            console.error("Download failed", e);
            onToast(isClassic ? 'Download failed.' : 'Failed to generate image.');
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
                <InlineSeatingPrintView
                    data={data}
                    filters={filters}
                    generatedAt={clientGeneratedAt}
                />
            </div>
        </div>
    );
}
