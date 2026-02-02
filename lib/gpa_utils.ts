export type Grade = 'A' | 'A-' | 'B+' | 'B' | 'C+' | 'C' | 'D+' | 'D' | 'F';

export interface Subject {
    id: string;
    name: string;
    creditHours: number;
    grade: Grade;
}

export interface Semester {
    id: string;
    name: string;
    subjects: Subject[];
}

export interface GPAState {
    previousCGPA?: number;
    previousCredits?: number;
    semesters: Semester[];
}

// UOL Grading Scale
export const GRADE_POINTS: Record<Grade, number> = {
    'A': 4.00,
    'A-': 3.75,
    'B+': 3.50,
    'B': 3.00,
    'C+': 2.50,
    'C': 2.00,
    'D+': 1.50,
    'D': 1.00,
    'F': 0.00
};

export const GRADE_RANGES: Record<Grade, string> = {
    'A': '85-100',
    'A-': '80-84',
    'B+': '75-79',
    'B': '70-74',
    'C+': '65-69',
    'C': '60-64',
    'D+': '55-59',
    'D': '50-54',
    'F': 'Below 50'
};

export const calculateSemesterGPA = (subjects: Subject[]): { gpa: number; totalCredits: number; earnedPoints: number } => {
    if (subjects.length === 0) return { gpa: 0, totalCredits: 0, earnedPoints: 0 };

    let totalPoints = 0;
    let totalCredits = 0;

    subjects.forEach(sub => {
        const points = GRADE_POINTS[sub.grade];
        const credits = sub.creditHours;

        if (!isNaN(credits) && credits > 0) {
            totalPoints += points * credits;
            totalCredits += credits;
        }
    });

    return {
        gpa: totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2)),
        totalCredits,
        earnedPoints: totalPoints
    };
};

export const calculateCGPA = (
    semesters: Semester[],
    prevCGPA: number = 0,
    prevCredits: number = 0
): { cgpa: number; totalCredits: number } => {
    let totalPoints = prevCGPA * prevCredits;
    let totalCredits = prevCredits;

    semesters.forEach(sem => {
        const { earnedPoints, totalCredits: semCredits } = calculateSemesterGPA(sem.subjects);
        totalPoints += earnedPoints;
        totalCredits += semCredits;
    });

    return {
        cgpa: totalCredits === 0 ? 0 : Number((totalPoints / totalCredits).toFixed(2)),
        totalCredits
    };
};
