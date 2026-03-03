import React, { useState, useRef, useEffect } from 'react';
import { DatesheetEntry } from '@/lib/exam_utils';
import { toPng } from 'html-to-image';
import { useSettings } from '@/lib/settings';

interface DatesheetDownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: DatesheetEntry[];
    filters: any;
    onToast: (msg: string) => void;
}

// Inline Print View Component (Formerly DatesheetPrintView)
function InlineDatesheetPrintView({ data, filters, generatedAt }: { data: DatesheetEntry[], filters: any, generatedAt: string }) {
    // Group by Date for clean table layout
    const grouped: Record<string, DatesheetEntry[]> = {};
    data.forEach(entry => {
        const date = entry.date || 'TBA';
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(entry);
    });

    const styles = {
        container: {
            width: '1220px', // Wider canvas to prevent column cropping
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
        dateBlock: {
            marginBottom: '24px',
            breakInside: 'avoid' as const
        },
        dateHeader: {
            background: '#f8fafc',
            padding: '10px 16px',
            borderRadius: '8px',
            borderLeft: '4px solid #6366f1', // Indigo-500
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        dateText: {
            fontSize: '16px',
            fontWeight: 800,
            color: '#1e293b'
        },
        dayText: {
            fontSize: '12px',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase' as const,
            letterSpacing: '1px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse' as const,
            fontSize: '12px'
        },
        th: {
            textAlign: 'left' as const,
            padding: '8px 12px',
            color: '#94a3b8',
            fontWeight: 700,
            textTransform: 'uppercase' as const,
            fontSize: '10px',
            letterSpacing: '0.5px',
            borderBottom: '1px solid #e2e8f0'
        },
        td: {
            padding: '10px 12px',
            borderBottom: '1px solid #f1f5f9',
            verticalAlign: 'middle' as const, // Changed to middle for row alignment
            color: '#334155',
            fontWeight: 600
        },
        courseTitle: {
            fontWeight: 800,
            color: '#1e293b',
            display: 'block',
            fontSize: '13px',
            marginBottom: '2px'
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
        <div id="datesheet-print-view" style={styles.container}>
            <div style={styles.headerBlock}>
                <div>
                    <h1 style={styles.title}>
                        Lucid <span style={{ color: '#7c3aed' }}>Datesheet</span>
                    </h1>
                    <p style={styles.subtitle}>Generated via Lucid Aura∞ v6.12.6</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={styles.dateText}>{generatedAt.split(',')[0]}</div>
                    <div style={styles.filterTag}>
                        {filters.program || 'ALL PROGRAMS'} {filters.semester} {filters.section}
                    </div>
                </div>
            </div>

            <div>
                {Object.entries(grouped).map(([date, exams], idx) => (
                    <div key={idx} style={styles.dateBlock}>
                        <div style={styles.dateHeader}>
                            <span style={styles.dateText}>{date}</span>
                            <span style={{ color: '#cbd5e1' }}>|</span>
                            <span style={styles.dayText}>{exams[0].day}</span>
                        </div>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={{ ...styles.th, width: '15%' }}>Time</th>
                                    <th style={{ ...styles.th, width: '45%' }}>Course</th>
                                    <th style={{ ...styles.th, width: '25%' }}>Program</th>
                                    <th style={{ ...styles.th, width: '15%', textAlign: 'right' }}>Venue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exams.map((exam, i) => (
                                    <tr key={i}>
                                        <td style={styles.td}>
                                            <span style={{ color: '#4f46e5', fontWeight: 800 }}>{exam.time}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.courseTitle}>{exam.courseTitle}</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <span style={{
                                                    background: '#f1f5f9',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: 800,
                                                    color: '#334155'
                                                }}>
                                                    {exam.program}
                                                </span>
                                                <span style={{
                                                    background: '#eff6ff',
                                                    color: '#3b82f6',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '11px',
                                                    fontWeight: 800,
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {exam.semester}{exam.section}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: 800 }}>
                                            {exam.venue}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            <div style={styles.footer}>
                <div>https://luciduol.netlify.app</div>
                <div>{generatedAt}</div>
            </div>
        </div>
    );
}

export default function DatesheetDownloadModal({ isOpen, onClose, data, filters, onToast }: DatesheetDownloadModalProps) {
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
            // Wait for fonts/layout
            await new Promise(r => setTimeout(r, 500));

            // html-to-image is much more robust with modern CSS
            const dataUrl = await toPng(printRef.current, {
                backgroundColor: '#ffffff',
                cacheBust: true,
                pixelRatio: 2,
                skipFonts: true, // Prevent CORS errors from external stylesheets (Google Fonts, FontAwesome)
            });

            const link = document.createElement('a');
            link.download = `Datesheet-${filters.program || 'All'}-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();

            onToast(isClassic ? 'Datesheet Downloaded!' : 'Datesheet Chronicle Exported!');
            onClose();
        } catch (e) {
            console.error("Download failed", e);
            onToast(isClassic ? 'Download failed. Try again.' : 'Failed to generate image. Please try again.');
            onClose(); // Close on error too
        } finally {
            setIsGenerating(false);
        }
    };

    // Auto-trigger download when opened
    useEffect(() => {
        if (isOpen && !isGenerating) {
            handleDownload();
        }
    }, [isOpen, isGenerating]);

    if (!isOpen) return null;

    return (
        // Hidden Container for Capture
        <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
            <div ref={printRef}>
                <InlineDatesheetPrintView
                    data={data}
                    filters={filters}
                    generatedAt={clientGeneratedAt}
                />
            </div>
        </div>
    );
}
