
// Aggressive Polyfills for PDF.js execution in Node environment
const globalAny = global as any;

if (typeof Promise.withResolvers === 'undefined') {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
        return { promise, resolve, reject };
    };
}

if (!globalAny.DOMMatrix) {
    globalAny.DOMMatrix = class DOMMatrix {
        constructor() { return this; }
        translate() { return this; }
        scale() { return this; }
        multiply() { return this; }
        toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
    };
}

if (!globalAny.ImageData) {
    globalAny.ImageData = class ImageData { constructor() { return this; } };
}

if (!globalAny.Path2D) {
    globalAny.Path2D = class Path2D { constructor() { return this; } };
}

if (!globalAny.requestAnimationFrame) {
    globalAny.requestAnimationFrame = (cb: any) => setTimeout(cb, 1);
}

// @ts-ignore
import PDFParser from 'pdf2json';
import { SeatingPlanEntry } from './exam_utils';

interface PDFItem {
    x: number;
    y: number;
    text: string;
}

// Extract Pages with Index for Isolation
const extractPagesFromPDFJSON = (pdfData: any): { pageIndex: number, rows: { y: number, items: PDFItem[] }[], minX: number, maxX: number }[] => {
    const pages: { pageIndex: number, rows: { y: number, items: PDFItem[] }[], minX: number, maxX: number }[] = [];

    if (!pdfData || !pdfData.Pages) return [];

    pdfData.Pages.forEach((page: any, pIdx: number) => {
        const rowMap = new Map<number, PDFItem[]>();
        let pMinX = 10000;
        let pMaxX = 0;

        if (page.Texts) {
            page.Texts.forEach((item: any) => {
                const y = Math.round(item.y * 10) / 10;
                const textRaw = item.R?.[0]?.T;
                if (!textRaw) return;

                const text = decodeURIComponent(textRaw);
                const x = item.x;

                // Track Page Bounds
                if (x < pMinX) pMinX = x;
                if (x > pMaxX) pMaxX = x;

                if (!rowMap.has(y)) rowMap.set(y, []);
                rowMap.get(y)?.push({ x, y, text });
            });
        }

        const sortedYs = Array.from(rowMap.keys()).sort((a, b) => a - b);
        const pageRows: { y: number, items: PDFItem[] }[] = [];
        sortedYs.forEach(y => {
            const items = rowMap.get(y) || [];
            items.sort((a, b) => a.x - b.x);
            pageRows.push({ y, items });
        });

        pages.push({ pageIndex: pIdx, rows: pageRows, minX: pMinX, maxX: pMaxX });
    });

    return pages;
};

export const getRawPDFText = (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                const pages = extractPagesFromPDFJSON(pdfData);
                const text = pages.map(p => p.rows.map(r => r.items.map(i => i.text).join(' ')).join('\n')).join('\n\n--- PAGE BREAK ---\n\n');
                resolve(text);
            } catch (e) {
                reject(e);
            }
        });
        pdfParser.parseBuffer(buffer);
    });
};

export const parseSeatingPlanPDF = async (buffer: Buffer, defaultDate?: string): Promise<SeatingPlanEntry[]> => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();

        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                const pages = extractPagesFromPDFJSON(pdfData);
                const entries: SeatingPlanEntry[] = [];
                let currentRoomGlobal = "Unknown Room";

                pages.forEach(page => {
                    const rows = page.rows;

                    // --- Strategy: Fixed 3-Column Grid ---
                    // 1. Calculate Page Width and Column Widths
                    // 2. Bin Headers into Columns
                    // 3. Bin Students into Columns and match to latest Header

                    const totalWidth = page.maxX - page.minX;
                    const colWidth = totalWidth / 3;

                    // Boundaries
                    const col1End = page.minX + colWidth;
                    const col2End = page.minX + (colWidth * 2);

                    // Headers Store per Column
                    const colHeaders: { [key: number]: { y: number, rowLabel: string, className: string, courseName: string }[] } = {
                        0: [], // Left
                        1: [], // Middle
                        2: []  // Right
                    };

                    // Pass 1: Extract Headers and Bin them
                    rows.forEach(row => {
                        const lineText = row.items.map(i => i.text).join(' ').trim();
                        if (!lineText) return;

                        // Room Update (Global, but checked per page)
                        if (lineText.toLowerCase().includes('room')) {
                            const match = lineText.match(/room[\s:-]*([0-9a-z\/\s\-\(\)]+)/i);
                            if (match) {
                                let rm = match[1];
                                if (rm.includes('(')) rm = rm.split('(')[0];
                                rm = rm.trim();
                                if (/\d/.test(rm)) currentRoomGlobal = 'Room ' + rm;
                            }
                        }

                        // Row Header Detection
                        if (lineText.includes('Row') && !lineText.includes('Sr#')) {
                            row.items.forEach((item, idx) => {
                                let t = item.text.trim();
                                const rowMatch = t.match(/(?:Row|R)[\s]*(\d+)(.*)/i);
                                if (rowMatch) {
                                    const rowLabel = "Row " + rowMatch[1];
                                    let restOfText = rowMatch[2];

                                    // Lookahead Merge for Class Name
                                    const nextItem = row.items[idx + 1];
                                    if (nextItem && (nextItem.x - item.x < 150)) {
                                        if (!restOfText || restOfText.trim().length < 3 || restOfText.trim() === '-') {
                                            restOfText += " " + nextItem.text;
                                        }
                                    }
                                    if (restOfText.startsWith('-') || restOfText.startsWith(' -')) {
                                        restOfText = restOfText.replace(/^[\s-]*/, '');
                                    }
                                    const cls = restOfText.trim();

                                    // SAFE RESTORATION Strategy:
                                    // 1. Always treat start of text as Class Name (prevents "Unknown Class")
                                    // 2. Check for Dash separator - if present, split Class vs Course

                                    let finalClass = cls;
                                    let finalCourse = "Exam";

                                    if (cls.includes('-')) {
                                        const parts = cls.split('-').map(s => s.trim()).filter(s => s.length > 0);
                                        if (parts.length > 1) {
                                            finalClass = parts[0];
                                            finalCourse = parts.slice(1).join(' - ');
                                        } else if (parts.length === 1) {
                                            finalClass = parts[0];
                                        }
                                    }

                                    // Determine Column (0, 1, 2)
                                    let colIdx = 0;
                                    if (item.x > col2End) colIdx = 2;
                                    else if (item.x > col1End) colIdx = 1;
                                    else colIdx = 0;

                                    colHeaders[colIdx].push({
                                        y: row.y,
                                        rowLabel: rowLabel,
                                        className: finalClass || "Unknown Class",
                                        courseName: finalCourse
                                    });
                                }
                            });
                        }

                        // Subject Detection (Associate with nearest Header ABOVE in SAME COLUMN)
                        if (lineText.includes('Sr#')) {
                            row.items.forEach(item => {
                                if (item.text.trim() === 'Sr#' || item.text.length < 3) return;

                                // Determine Column
                                let colIdx = 0;
                                if (item.x > col2End) colIdx = 2;
                                else if (item.x > col1End) colIdx = 1;
                                else colIdx = 0;

                                // Find last header in this column
                                const headers = colHeaders[colIdx];
                                if (headers.length > 0) {
                                    const relevant = headers.filter(h => h.y < row.y);
                                    if (relevant.length > 0) {
                                        const last = relevant[relevant.length - 1];
                                        last.courseName = item.text.trim(); // Updates Course
                                    }
                                }
                            });
                        }
                    });

                    // Pass 2: Assign Students (Column Matching)
                    rows.forEach(row => {
                        const lineText = row.items.map(i => i.text).join(' ').trim();
                        if (lineText.includes('Row ') || lineText.trim().startsWith('Sr#')) return;

                        row.items.forEach((item, idx) => {
                            const part = item.text.trim();
                            const isId = /^\d{6,}$/.test(part) || /^[A-Z]+-\d+-\d+$/.test(part) || (part.startsWith('70') && part.length >= 8);
                            if (part.startsWith('202') && part.length === 8) return;

                            if (isId) {
                                // Determine Student Column
                                let colIdx = 0;
                                if (item.x > col2End) colIdx = 2;
                                else if (item.x > col1End) colIdx = 1;
                                else colIdx = 0;

                                // Upscan in that Column
                                const headers = colHeaders[colIdx];
                                const relevant = headers.filter(h => h.y < row.y);

                                if (relevant.length > 0) {
                                    const match = relevant[relevant.length - 1];

                                    // Extract Name
                                    let nameParts: string[] = [];
                                    for (let i = idx + 1; i < row.items.length; i++) {
                                        const next = row.items[i];
                                        const nextIsId = /^\d{6,}$/.test(next.text) || /^[A-Z]+-\d+-\d+$/.test(next.text);
                                        if (nextIsId) break;
                                        if (/^\d{1,3}$/.test(next.text)) continue;
                                        nameParts.push(next.text);
                                    }
                                    const studentName = nameParts.join(' ').trim() || 'Unknown';

                                    // Seat Number
                                    let seatNum = "";
                                    for (let back = 1; back <= 5; back++) {
                                        if (idx - back >= 0) {
                                            const prev = row.items[idx - back];
                                            if (prev.x < item.x && (item.x - prev.x) < 200) {
                                                if (/^\d+$/.test(prev.text.trim()) && prev.text.trim().length < 4) {
                                                    seatNum = prev.text.trim();
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                    entries.push({
                                        studentId: part,
                                        studentName: studentName,
                                        program: "Unknown",
                                        semester: "",
                                        section: "",
                                        courseTitle: match.courseName,
                                        studentClass: match.className,
                                        room: currentRoomGlobal,
                                        seatNumber: seatNum,
                                        row: match.rowLabel,
                                        column: "",
                                        examDate: defaultDate || ""
                                    });
                                }
                            }
                        });
                    });

                });

                resolve(entries);

            } catch (e) {
                console.error("PDF Logic Error", e);
                resolve([]);
            }
        });

        pdfParser.parseBuffer(buffer);
    });
};
