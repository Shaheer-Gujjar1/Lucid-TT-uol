
export interface DatesheetEntry {
    program: string;
    semester: string;
    section: string;
    courseCode: string;
    courseTitle: string;
    date: string;
    day?: string;
    time: string;
    venue: string;
}

export interface SeatingPlanEntry {
    studentId: string;
    studentName: string;
    program: string;
    semester: string;
    section: string;
    courseTitle: string;
    room: string;
    seatNumber: string;
    row: string;
    column: string;
    studentClass?: string; // New field for Class info (e.g., BSCS 5 B)
    examDate?: string; // Extracted from filename
}

// Mock Data for Verification
export const MOCK_DATESHEET: DatesheetEntry[] = [
    { program: 'BSCS', semester: '1', section: 'A', courseCode: 'CS101', courseTitle: 'Intro to Computing', date: '2025-06-10', time: '09:00 AM', venue: 'Hall A' },
    { program: 'BSCS', semester: '1', section: 'A', courseCode: 'MT100', courseTitle: 'Calculus I', date: '2025-06-12', time: '09:00 AM', venue: 'Room 101' },
];

export const MOCK_SEATING: SeatingPlanEntry[] = [
    { studentId: 'CS-001', studentName: 'John Doe', program: 'BSCS', semester: '1', section: 'A', courseTitle: 'Intro to Computing', room: 'Hall A', seatNumber: 'A-1', row: '1', column: '1' },
];
