
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

                // Column Mapping: Array of X-Ranges -> Course Name & Row Info
                let columnMap: { startX: number, endX: number, course: string, row: string }[] = [];

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

                    // 2. Header Detection (Row & Course Mapping)
                    // Screenshot shows: "Row 1 - BSSE 1    Row 2 - BSCS 2 ..."
                    // Key identifiers: "Row", "Sr#" (on sub-header)
                    // If line contains "Row" and " - ", it's likely a header line.
                    if (lineText.includes('Row') || lineText.includes('Sr#')) {

                        // We need to parse distinct header blocks based on X distribution.
                        // "Row 1 - BSSE 1" might be one item or multiple text items.

                        const newMap: { startX: number, endX: number, course: string, row: string }[] = [];

                        // Group items that are close together?
                        // Or just analyze each item?
                        // "Row 1 - BSSE 1" might be split into "Row 1", "-", "BSSE 1" or be one string.
                        // Let's iterate items and try to form "Headers".

                        // Heuristic: If item contains "Row", start a new column definition.

                        row.items.forEach(item => {
                            let t = item.text.trim();

                            // Check for "Row X - Course" pattern
                            // Regex: Row \d+ - .games?
                            const rowMatch = t.match(/(?:Row|R)[\s]*(\d+)(.*)/i);

                            if (rowMatch) {
                                // It found a Row header!
                                const rowName = "Row " + rowMatch[1];
                                let restOfText = rowMatch[2];

                                // Clean up course name
                                if (restOfText.startsWith('-') || restOfText.startsWith(' -')) {
                                    restOfText = restOfText.replace(/^[\s-]*/, '');
                                }

                                const courseName = restOfText.trim() || "Exam";

                                newMap.push({
                                    startX: item.x - 20,  // More generous bounds
                                    endX: item.x + 50,    // Cover wide breakdown
                                    course: courseName,
                                    row: rowName
                                });
                            }
                            // Also handle "Sr#" sub-header to refine positions?
                            // If we see "Sr#", it confirms a column start.
                            else if (t === 'Sr#') {
                                // Optional: We could use this to anchor the left side of the column more precisely.
                            }
                        });


                        // If we found Row headers, update map.
                        if (newMap.length > 0) {
                            columnMap = newMap;
                        }
                    } // End Header Detection


                    // 3. Student Extraction
                    row.items.forEach((item, idx) => {
                        const part = item.text.trim();
                        // ID Regex
                        const isId = /^\d{6,}$/.test(part) || /^[A-Z]+-\d+-\d+$/.test(part) || (part.startsWith('70') && part.length >= 8);
                        if (part.startsWith('202') && part.length === 8) return;

                        if (isId) {
                            // Find Name (Look forward)
                            let nameParts: string[] = [];
                            for (let i = idx + 1; i < row.items.length; i++) {
                                const next = row.items[i];
                                const nextIsId = /^\d{6,}$/.test(next.text) || /^[A-Z]+-\d+-\d+$/.test(next.text);
                                if (nextIsId) break;
                                if (/^\d{1,3}$/.test(next.text)) continue; // Skip rough numbers in name area
                                nameParts.push(next.text);
                            }

                            const studentName = nameParts.join(' ').trim() || 'Unknown';

                            // Determine Course AND Row from X position
                            let course = "Exam";
                            let rowName = "";

                            if (columnMap.length > 0) {
                                let bestMatch = null;
                                let minDist = 1000;

                                columnMap.forEach(col => {
                                    if (item.x >= col.startX && item.x <= col.endX) {
                                        bestMatch = col;
                                    }
                                });

                                if (!bestMatch) {
                                    columnMap.forEach(col => {
                                        const dist = Math.abs(item.x - col.startX);
                                        if (dist < 25) { // Increased tolerance significantly
                                            if (dist < minDist) {
                                                minDist = dist;
                                                bestMatch = col;
                                            }
                                        }
                                    });
                                }

                                if (bestMatch) {
                                    course = (bestMatch as any).course;
                                    rowName = (bestMatch as any).row || "";
                                }
                            }

                            // Seat Number Detection (Sr#)
                            let seatNum = "";
                            // Look backwards up to 5 items to find the Sr# number to the left
                            for (let back = 1; back <= 5; back++) {
                                if (idx - back >= 0) {
                                    const prev = row.items[idx - back];
                                    const prevT = prev.text.trim();
                                    // Must be a number, short, and to the LEFT
                                    if (prev.x < item.x && /^\d+$/.test(prevT) && prevT.length < 4) {
                                        seatNum = prevT;
                                        break; // Found closest number to the left
                                    }
                                }
                            }


                            entries.push({
                                studentId: part,
                                studentName: studentName,
                                program: "Unknown",
                                semester: "",
                                section: "",
                                courseTitle: course,
                                room: currentRoom,
                                seatNumber: seatNum,
                                row: rowName,   // Use mapped row
                                column: "",
                                examDate: defaultDate || ""
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
