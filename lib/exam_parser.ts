import * as XLSX from 'xlsx';
import { SeatingPlanEntry, DatesheetEntry } from './exam_utils';

function excelDateToJSDate(serial: number): string {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const fractional_day = serial - Math.floor(serial) + 0.0000001;

    let total_seconds = Math.floor(86400 * fractional_day);

    const seconds = total_seconds % 60;
    total_seconds -= seconds;

    const hours = Math.floor(total_seconds / (60 * 60));
    const minutes = Math.floor(total_seconds / 60) % 60;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const d = date_info.getDate();
    const m = months[date_info.getMonth()];
    const y = date_info.getFullYear();
    return `${d}-${m}-${y}`; // 16-Jan-2026
}

export const parseSeatingPlan = (fileBuffer: ArrayBuffer): SeatingPlanEntry[] => {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const entries: SeatingPlanEntry[] = [];

    workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        let currentRoom = "Unknown Room";

        for (let r = 0; r < data.length; r++) {
            const row = data[r];
            if (!row || row.length === 0) continue;

            const rowStr = row.join(' ').toLowerCase();

            // 1. Detect Room Header (Relaxed & Robust)
            // Matches "Room 202", "Room: 202 / 206", "Room 302"
            // Ignore length check as rowStr can be long in merged rows
            if (rowStr.includes('room')) {
                const match = rowStr.match(/room[\s:-]*([0-9a-z\/\s\-\(\)]+)/i);
                if (match) {
                    let rm = match[1];
                    // Stop at (
                    if (rm.includes('(')) rm = rm.split('(')[0];

                    rm = rm.trim().toUpperCase();

                    // Ensure it captures numbers (e.g. "202")
                    // Reject if it's just "Room" or text like "Room Allocation" without numbers?
                    // But "Room 202 / 206" has numbers.
                    if (/\d/.test(rm)) {
                        currentRoom = 'Room ' + rm;
                    }
                }
            }

            // 2. Scan Cells for Student IDs
            for (let c = 0; c < row.length; c++) {
                const cell = row[c];
                if (!cell) continue;

                const val = cell.toString().trim().toUpperCase();

                // VALIDATION: Is this a Student ID?
                // Numeric (6+ digits) OR Alphanumeric (F20XX-...)
                const isNumericId = /^\d{6,}$/.test(val);
                const isAlphaId = /^[A-Z]+-\d+-\d+/.test(val) || /^[A-Z]+\d{3,}/.test(val);

                // Avoid Dates (starts with 202 and length 8 e.g. 20260116)
                const isDate = val.startsWith('202') && val.length === 8;

                if ((isNumericId || isAlphaId) && !isDate) {

                    let name = 'Unknown';
                    let seat = '';

                    // Name (Right)
                    if (c < row.length - 1 && row[c + 1]) {
                        name = row[c + 1].toString().trim();
                    }

                    // Seat (Left)
                    if (c > 0 && row[c - 1]) {
                        seat = row[c - 1].toString().trim();
                    }

                    // Filter out garbage
                    if (/^\d+$/.test(name)) name = 'Unknown'; // Name shouldn't be number

                    entries.push({
                        studentId: val,
                        studentName: name,
                        program: "Unknown",
                        semester: "",
                        section: "",
                        courseTitle: "Exam",
                        room: currentRoom,
                        seatNumber: seat.length < 5 ? seat : '',
                        row: "",
                        column: ""
                    });
                }
            }
        }
    });

    console.log(`[Parser] Parsed ${entries.length} students from ${workbook.SheetNames.length} sheets.`);
    return entries;
};

export const parseDatesheet = (fileBuffer: ArrayBuffer): DatesheetEntry[] => {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Find Header Row
    let headerRowIndex = -1;
    let colMap: Record<string, number> = {};

    // Scan first 10 rows
    for (let r = 0; r < 10; r++) {
        const row = data[r]?.map((c: any) => c?.toString().toUpperCase().trim()) || [];
        if (row.includes('DATE') && (row.includes('SUBJECT') || row.includes('COURSE'))) {
            headerRowIndex = r;
            row.forEach((cell, idx) => {
                if (cell) colMap[cell] = idx;
            });
            break;
        }
    }

    if (headerRowIndex === -1) return [];

    const entries: DatesheetEntry[] = [];

    // Iterate Data
    for (let r = headerRowIndex + 1; r < data.length; r++) {
        const row = data[r];
        if (!row || row.length === 0) continue;

        // Mappings based on user image
        let dateVal = row[colMap['DATE']] || '';
        if (typeof dateVal === 'number') {
            try {
                dateVal = excelDateToJSDate(dateVal);
            } catch (e) {
                dateVal = String(dateVal);
            }
        }
        const dateStr = dateVal;

        const dayStr = row[colMap['DAY']] || '';

        const programRaw = row[colMap['PROGRAM']] || '';

        let program = 'Unknown';
        let semester = '';
        let section = '';

        // Parsing "BSCS-3C" or "BSSE 5"
        if (programRaw) {
            const upper = programRaw.toUpperCase();
            if (upper.includes('BSCS')) program = 'BSCS';
            else if (upper.includes('BSAI')) program = 'BSAI';
            else if (upper.includes('BSSE')) program = 'BSSE';
            else program = upper.split('-')[0].trim();

            const semMatch = upper.match(/(\d+)/);
            if (semMatch) semester = semMatch[1];

            const sectionMatch = upper.match(/[0-9]([A-Z])/); // digit followed by Char e.g. 3C
            if (sectionMatch) section = sectionMatch[1];
        }

        const subjectStr = row[colMap['SUBJECT']] || '';
        const timingStr = row[colMap['TIMING']] || '';
        const roomStr = row[colMap['ROOM NO.']] || row[colMap['ROOM NO']] || '';
        const venueStr = roomStr;

        if (!subjectStr) continue;

        entries.push({
            program: program, // Normalized to "BSCS" etc.
            semester: semester,
            section: section,
            courseCode: '',
            courseTitle: subjectStr,
            date: dateStr,
            day: dayStr,
            time: timingStr,
            venue: venueStr
        });
    }
    return entries;
};
