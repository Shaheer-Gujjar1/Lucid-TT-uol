
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

// Extract Rows with X-Coordinates
const extractRowsFromPDFJSON = (pdfData: any): { y: number, items: PDFItem[] }[] => {
    const rows: { y: number, items: PDFItem[] }[] = [];

    if (!pdfData || !pdfData.Pages) return [];

    pdfData.Pages.forEach((page: any) => {
        const rowMap = new Map<number, PDFItem[]>();

        if (page.Texts) {
            page.Texts.forEach((item: any) => {
                const y = Math.round(item.y * 10) / 10; // Round Y
                const textRaw = item.R?.[0]?.T;
                if (!textRaw) return;

                const text = decodeURIComponent(textRaw);
                const x = item.x;

                if (!rowMap.has(y)) rowMap.set(y, []);
                rowMap.get(y)?.push({ x, y, text });
            });
        }

        const sortedYs = Array.from(rowMap.keys()).sort((a, b) => a - b);
        sortedYs.forEach(y => {
            const items = rowMap.get(y) || [];
            items.sort((a, b) => a.x - b.x);
            rows.push({ y, items });
        });
    });

    return rows;
};

export const getRawPDFText = (buffer: Buffer): Promise<string> => {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser();
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                const rows = extractRowsFromPDFJSON(pdfData);
                const text = rows.map(r => r.items.map(i => i.text).join(' ')).join('\n');
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
                const rows = extractRowsFromPDFJSON(pdfData);
                const entries: SeatingPlanEntry[] = [];
                let currentRoom = "Unknown Room";

                // Column Mapping: Array of X-Ranges -> Course Name
                let columnMap: { startX: number, endX: number, course: string }[] = [];

                rows.forEach(row => {
                    const lineText = row.items.map(i => i.text).join(' ').trim();
                    if (!lineText) return;

                    // 1. Room Detection
                    if (lineText.toLowerCase().includes('room')) {
                        const match = lineText.match(/room[\s:-]*([0-9a-z\/\s\-\(\)]+)/i);
                        if (match) {
                            let rm = match[1];
                            if (rm.includes('(')) rm = rm.split('(')[0];
                            rm = rm.trim();
                            if (/\d/.test(rm)) currentRoom = 'Room ' + rm;
                        }
                    }

                    // 2. Header Detection (Course Mapping)
                    if (lineText.includes('Sr#') || lineText.toLowerCase().includes('computer') || lineText.toLowerCase().includes('islamic')) {
                        // Check if this line is strictly a header line (contains Sr#)
                        const isHeaderLine = lineText.includes('Sr#');

                        if (isHeaderLine) {
                            // Reset Map Strategy: Only reset if we find VALID headers.
                            const newMap: { startX: number, endX: number, course: string }[] = [];

                            row.items.forEach(item => {
                                const t = item.text.trim();
                                if (t === 'Sr#' || /^\d+$/.test(t)) return; // Skip Sr# and numbers
                                if (t.length < 3) return; // Skip garbage

                                // Course Found!
                                // Expand X-range significantly to catch students below
                                newMap.push({
                                    startX: item.x - 5, // Widen left
                                    endX: item.x + 20,  // Widen right (Course titles can be long)
                                    course: t
                                });
                            });

                            if (newMap.length > 0) {
                                columnMap = newMap;
                            }
                        }
                    }

                    // 3. Student Extraction
                    row.items.forEach((item, idx) => {
                        const part = item.text.trim();
                        // Detailed ID regex
                        const isId = /^\d{6,}$/.test(part) || /^[A-Z]+-\d+-\d+$/.test(part) || (part.startsWith('70') && part.length >= 8);
                        if (part.startsWith('202') && part.length === 8) return;

                        if (isId) {
                            // Find Name
                            let nameParts: string[] = [];
                            for (let i = idx + 1; i < row.items.length; i++) {
                                const next = row.items[i];
                                const nextIsId = /^\d{6,}$/.test(next.text) || /^[A-Z]+-\d+-\d+$/.test(next.text);
                                if (nextIsId) break;
                                if (/^\d{1,3}$/.test(next.text)) continue;
                                nameParts.push(next.text);
                            }

                            const studentName = nameParts.join(' ').trim() || 'Unknown';

                            // Determine Course from X position (Sticky Logic)
                            let course = "Exam";

                            // Find closest column center instead of strict bounds?
                            // Or stick with bounds. Let's try finding the "Best Fit" column.
                            // Students align with the `Sr#` column usually, which is to the LEFT of Course Name?
                            // Actually, in screenshot: `Sr#` is Left. `Course Name` is Right of Sr#.
                            // Student ID is under `Sr#` usually? No, `1` is under Sr#. ID is next to it.
                            // So Student ID is roughly where "Course Name" starts?
                            // Let's use distance minimization.

                            if (columnMap.length > 0) {
                                let bestMatch = null;
                                let minDist = 1000;

                                columnMap.forEach(col => {
                                    // Distance from StudentID X to Column Start X
                                    // Or does the header center align?
                                    // Let's check overlap.
                                    // If part.x is within [startX, endX]
                                    if (item.x >= col.startX && item.x <= col.endX) {
                                        bestMatch = col;
                                    }
                                });

                                // Fallback: Closest column if within reason
                                if (!bestMatch) {
                                    columnMap.forEach(col => {
                                        const dist = Math.abs(item.x - col.startX); // Compare Starts
                                        if (dist < 10) { // Tolerance of 10 units
                                            if (dist < minDist) {
                                                minDist = dist;
                                                bestMatch = col;
                                            }
                                        }
                                    });
                                }

                                if (bestMatch) course = (bestMatch as any).course;
                            }

                            entries.push({
                                studentId: part,
                                studentName: studentName,
                                program: "Unknown",
                                semester: "",
                                section: "",
                                courseTitle: course,
                                room: currentRoom,
                                seatNumber: "",
                                row: "",
                                column: "",
                                examDate: defaultDate // Inject Date
                            });
                        }
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
