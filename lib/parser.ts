
export interface SlotEntry {
    course: string;
    room: string;
    instructor: string;
    isLab: boolean;
    isCSITLab?: boolean;
    class: string;
    cell: string;
    program?: string;
    semester?: string;
    section?: string;
}

export interface ProcessedSlot {
    time: string;
    entries: SlotEntry[];
}

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function timeToMinutes(timeStr: string): number {
    if (!timeStr) return 0;
    let time = timeStr.trim();
    let hours: number, minutes: number;
    const hasMeridiem = /(AM|PM|am|pm)/i.test(time);

    if (hasMeridiem) {
        const meridiemMatch = time.match(/(AM|PM|am|pm)/i);
        const meridiem = meridiemMatch ? meridiemMatch[0].toUpperCase() : '';
        time = time.replace(/(AM|PM|am|pm)/i, '').trim();
        const parts = time.split(/[:.]\s*/).map(Number);
        hours = parts[0];
        minutes = parts[1] || 0;

        if (meridiem === 'PM' && hours < 12) {
            hours += 12;
        } else if (meridiem === 'AM' && hours === 12) {
            hours = 0;
        }
    } else {
        const parts = time.split(/[:.]\s*/).map(Number);
        hours = parts[0];
        minutes = parts[1] || 0;
        // Heuristic for 12-hour format without meridiem used in original code
        if (hours >= 1 && hours <= 6) {
            hours += 12;
        } else if (hours === 12) {
            hours = 12;
        } else if (hours === 7) {
            hours = 7;
        }
    }
    return hours * 60 + minutes;
}

function findTimeSlotIndex(time: string, timeSlots: string[]): number {
    if (!time || !timeSlots) return -1;
    const targetMinutes = timeToMinutes(time);
    for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        if (!slot || slot === "—") continue;
        const [startTime] = slot.split('-');
        if (!startTime) continue;
        const startMinutes = timeToMinutes(startTime.trim());
        if (Math.abs(targetMinutes - startMinutes) <= 1) {
            return i;
        }
    }
    for (let i = 0; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        if (!slot || slot === "—") continue;
        const [startTime] = slot.split('-');
        if (!startTime) continue;
        const startMinutes = timeToMinutes(startTime.trim());
        if (Math.abs(targetMinutes - startMinutes) <= 15) {
            return i;
        }
    }
    return -1;
}

function calculateSlotDuration(startTime: string, endTime: string, timeSlots: string[]): number {
    if (!startTime || !endTime) return 1;
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    let durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) durationMinutes += 24 * 60;

    if (durationMinutes >= 165 && durationMinutes <= 195) {
        return 3;
    }

    if (endMinutes <= startMinutes) return 1;

    const startSlotIndex = findTimeSlotIndex(startTime, timeSlots);
    if (startSlotIndex === -1) return 1;

    let endSlotIndex = startSlotIndex;
    for (let i = startSlotIndex; i < timeSlots.length; i++) {
        const slot = timeSlots[i];
        if (!slot || slot === "—") break;
        const parts = slot.split('-');
        if (parts.length !== 2) continue;
        const slotEndMinutes = timeToMinutes(parts[1].trim());

        // Check if the slot starts before our end time
        if (endMinutes > timeToMinutes(parts[0].trim())) {
            endSlotIndex = i;
        } else {
            break;
        }
    }

    return Math.max(1, endSlotIndex - startSlotIndex + 1);
}

function normalizeCourseName(courseName: string): string {
    return courseName.toLowerCase().trim().replace(/\s+/g, ' ');
}

function calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;
    if (str1 === str2) return 100;
    if (str1.length === 0 || str2.length === 0) return 0;

    let longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    const longerLength = longer.length;

    let matchCount = 0;
    let longerCopy = longer;

    for (let i = 0; i < shorter.length; i++) {
        if (longerCopy.includes(shorter[i])) {
            matchCount++;
            longerCopy = longerCopy.replace(shorter[i], '');
        }
    }
    return (matchCount / longerLength) * 100;
}

function areDuplicateEntries(entry1: SlotEntry, entry2: SlotEntry): boolean {
    const normalized1 = normalizeCourseName(entry1.course);
    const normalized2 = normalizeCourseName(entry2.course);

    const hasMergedKeyword = normalized1.includes('merged') || normalized2.includes('merged');
    const similarity = calculateSimilarity(normalized1, normalized2);

    const sameRoom = entry1.room === entry2.room && entry1.room !== "TBD" && entry1.room !== "Not Listed";

    const t1 = entry1.instructor.toLowerCase().replace(/^(mr\.?|ms\.?|mrs\.?|miss|dr\.?|prof\.?)\s*/, '').replace(/[^a-z]/g, '');
    const t2 = entry2.instructor.toLowerCase().replace(/^(mr\.?|ms\.?|mrs\.?|miss|dr\.?|prof\.?)\s*/, '').replace(/[^a-z]/g, '');

    const isInvalidTeacher = (t: string) => t.includes('newfaculty') || t.includes('newfaulty') || t === '' || t === 'notlisted';

    const teacherMatch = (t1 === t2) ||
        (t1.includes(t2) && t2.length > 3) ||
        (t2.includes(t1) && t1.length > 3) ||
        isInvalidTeacher(t1) ||
        isInvalidTeacher(t2);

    if (!teacherMatch && !sameRoom) {
        return false;
    }

    if (hasMergedKeyword && sameRoom) return true;
    if (sameRoom && similarity >= 50 && teacherMatch) return true;

    if ((normalized1.includes('numerical analysis') && normalized2.includes('numerical computing')) ||
        (normalized1.includes('numerical computing') && normalized2.includes('numerical analysis'))) {
        return true;
    }

    if (normalized1 === normalized2) return true;

    return similarity >= 80 && (sameRoom || teacherMatch);
}

function prioritizeCourse(courses: SlotEntry[]): SlotEntry {
    const validNamed = courses.filter(c => {
        const inst = c.instructor.toLowerCase();
        return inst !== "not listed" && !inst.includes("new faculty") && !inst.includes("new faulty");
    });

    const candidates = validNamed.length > 0 ? validNamed : courses;

    const merged = candidates.filter(c => c.course.toLowerCase().includes('merged'));
    if (merged.length > 0) {
        return merged.sort((a, b) => b.course.length - a.course.length)[0];
    }

    return candidates.sort((a, b) => b.course.length - a.course.length)[0];
}

function removeDuplicateCourses(courses: SlotEntry[]): SlotEntry[] {
    if (courses.length <= 1) return courses;

    const groups: SlotEntry[][] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < courses.length; i++) {
        if (usedIndices.has(i)) continue;

        const group = [courses[i]];
        usedIndices.add(i);

        for (let j = i + 1; j < courses.length; j++) {
            if (usedIndices.has(j)) continue;

            if (areDuplicateEntries(courses[i], courses[j])) {
                group.push(courses[j]);
                usedIndices.add(j);
            }
        }
        groups.push(group);
    }

    return groups.map(group => {
        const prioritized = prioritizeCourse(group);
        const uniqueClasses = Array.from(new Set(group.map(g => g.class).filter(c => c && c !== 'Unknown')));

        if (uniqueClasses.length > 1) {
            const mergedEntry = { ...prioritized };
            mergedEntry.class = uniqueClasses.join(', ');
            return mergedEntry;
        }

        return prioritized;
    });
}

function cleanInstructorString(inst: string): string {
    let cleaned = inst.replace(/\b(room|lab|class).*/i, '').trim();
    cleaned = cleaned.split(/\s*[-–(]\s*/)[0].trim();
    cleaned = cleaned.replace(/\b\d{1,2}[:.]\d{2}.*/, '').trim();
    cleaned = cleaned.replace(/\s{2,}.*/, '').trim();
    cleaned = cleaned.replace(/[,;]\s*.*/, '').trim();
    return cleaned || "Not Listed";
}

function extractInstructor(text: string): string {
    const lines = text.split("\n");
    const pattern = /\b(Mr\.?|Ms\.?|Mrs\.?|Mister|Miss|Doctor|Dr\.?|Muhammad|Mufti|Hafiz|Prof\.?|New\s+Faculty|New\s+Faulty)\b/i;

    let fallbackInst: string | null = null;

    for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        const match = line.match(pattern);

        if (match && match.index !== undefined) {
            let inst = line.substring(match.index).trim();
            inst = cleanInstructorString(inst);

            if (!inst.toLowerCase().includes('new faculty') && !inst.toLowerCase().includes('new faulty')) {
                return inst;
            } else if (!fallbackInst) {
                fallbackInst = inst;
            }
        }
    }

    let bottomStr = lines[lines.length - 1]?.trim() || "Not Listed";
    if (bottomStr !== "Not Listed") {
        bottomStr = cleanInstructorString(bottomStr);
        if (!bottomStr.toLowerCase().includes('new faculty') && !bottomStr.toLowerCase().includes('new faulty')) {
            return bottomStr;
        }
    }

    return fallbackInst || bottomStr;
}

function extractRoomCSIT(roomFromColumn: string, cellContent: string): string {
    const roomPattern = /room\s*#?\s*(\d+[a-z]*\d*)/i;
    const match = roomPattern.exec(cellContent);
    if (match) {
        return match[1].trim();
    }
    if (!roomFromColumn) {
        return "TBD";
    }
    let firstOpen = roomFromColumn.indexOf('(');
    let secondOpen = firstOpen >= 0 ? roomFromColumn.indexOf('(', firstOpen + 1) : -1;

    if (secondOpen >= 0) {
        return roomFromColumn.substring(0, secondOpen).trim();
    } else if (firstOpen >= 0) {
        return roomFromColumn.substring(0, firstOpen).trim();
    } else {
        return roomFromColumn.trim();
    }
}

function extractRoomPharmD(roomFromColumn: string, cellContent: string): string {
    const roomPattern = /room\s*#?\s*(\d+[a-z]*\d*)/i;
    const match = roomPattern.exec(cellContent);
    if (match) {
        return match[1].trim();
    }
    const labRoomPattern = /Lab\s*#?\s*(\d+[a-z]*\d*)/i;
    const labMatch = labRoomPattern.exec(cellContent);
    if (labMatch) {
        return "Laboratory " + labMatch[1].trim();
    }
    if (!roomFromColumn) {
        return "TBD";
    }
    const numericMatch = roomFromColumn.match(/^\s*(\d+)/);
    if (numericMatch) {
        return numericMatch[1];
    }
    const parts = roomFromColumn.split(/\s+/);
    if (parts.length > 0 && /^\d+$/.test(parts[0])) {
        return parts[0];
    }
    const pharmDFormatMatch = roomFromColumn.match(/^(\d+)\s*([A-Za-z]*\s*[A-Za-z]*)?/);
    if (pharmDFormatMatch && pharmDFormatMatch[1]) {
        return pharmDFormatMatch[1];
    }
    return roomFromColumn.trim();
}

function extractRoomMLTHND(roomFromColumn: string, cellContent: string): string {
    const roomPattern = /room\s*#?\s*(\d+[a-z]*\d*)/i;
    const match = roomPattern.exec(cellContent);
    if (match) {
        return match[1].trim();
    }
    const labRoomPattern = /Lab\s*#?\s*(\d+[a-z]*\d*)/i;
    const labMatch = labRoomPattern.exec(cellContent);
    if (labMatch) {
        return "Laboratory " + labMatch[1].trim();
    }
    if (!roomFromColumn) {
        return "TBD";
    }
    const numericMatch = roomFromColumn.match(/^\s*(\d+)/);
    if (numericMatch) {
        return numericMatch[1];
    }
    return roomFromColumn.trim();
}

function extractRoom(roomFromColumn: string, cellContent: string, program: string | null): string {
    const businessPrograms = ["BBA", "BBA(2Y)", "BSAF", "BSAF(2Y)", "BSDM"];

    if (program && businessPrograms.includes(program)) {
        return extractRoomCSIT(roomFromColumn, cellContent);
    }
    else if (program === "MLT" || program === "HND") {
        return extractRoomMLTHND(roomFromColumn, cellContent);
    }
    else if (program === "PharmD" || program === "DPT" || program === "RIT" || program === "Nursing") {
        return extractRoomPharmD(roomFromColumn, cellContent);
    }
    else {
        return extractRoomCSIT(roomFromColumn, cellContent);
    }
}

function isCSITLab(course: string, cellContent: string): boolean {
    const csitKeywords = [
        'programming', 'computer', 'software', 'data structure', 'algorithm',
        'database', 'network', 'artificial intelligence', 'machine learning',
        'web', 'mobile application', 'computer organization', 'assembly language',
        'operating systems', 'information security', 'digital logic', 'compiler',
        'computer graphics', 'human computer interaction', 'formal methods'
    ];
    const lowerCourse = course.toLowerCase();

    if (csitKeywords.some(keyword => lowerCourse.includes(keyword))) {
        return true;
    }
    if (/(BSCS|BSSE|BSAI)/i.test(cellContent)) {
        return true;
    }
    if (/CS\d+/i.test(cellContent)) {
        return true;
    }
    return false;
}

function extractTimeFromCell(cell: string): { start: string; end?: string; isRange?: boolean } | null {
    if (!cell) return null;
    const cellStr = cell.toString().replace(/\s+/g, ' ').trim();
    const rangePatterns = [
        /Time[:.]?\s*(\d{1,2}[.:]\d{2})\s*[-–]\s*(\d{1,2}[.:]\d{2})/i,
        /(\d{1,2}[.:]\d{2})\s*[-–]\s*(\d{1,2}[.:]\d{2})\s*(?:AM|PM|am|pm)?/i,
        /(\d{1,2}[.:]\d{2})\s*[-–]\s*(\d{1,2}[.:]\d{2})/i,
        /at\s+(\d{1,2}[.:]\d{2})\s*(?:to|till|until|-|–)\s*(\d{1,1,2}[.:]\d{2})/i,
        /(\d{1,2}\s*:\s*\d{2})\s*-\s*(\d{1,2}\s*:\s*\d{2})/i
    ];
    for (const pattern of rangePatterns) {
        const match = pattern.exec(cellStr);
        if (match && match[1] && match[2]) {
            return {
                start: match[1].replace(/\s+/g, '').replace('.', ':'),
                end: match[2].replace(/\s+/g, '').replace('.', ':'),
                isRange: true
            };
        }
    }
    const singleTimePatterns = [
        /Time[:.]?\s*(\d{1,2}[.:]\d{2})/i,
        /at\s+(\d{1,2}[.:]\d{2})/i,
        /(\d{1,2}[.:]\d{2})\s+(?:Room|Lab|Class|room|lab|class)/i,
        /\b(\d{1,2}[.:]\d{2})\b/i
    ];
    for (const pattern of singleTimePatterns) {
        const match = pattern.exec(cellStr);
        if (match && match[1]) {
            return {
                start: match[1].replace('.', ':')
            };
        }
    }
    return null;
}

interface ClassMatch {
    program: string;
    semester: string;
    section: string;
}

function parseAllClasses(cell: string): ClassMatch[] {
    const matches: ClassMatch[] = [];
    // Enhanced Regex to capture:
    // 1. Standard Programs: BSCS, BSSE, etc.
    // 2. BS Math variants: BS Math, BS Maths, BS-Math, Math-III, Maths-III (case insensitive via flag)
    // 3. BSMDS variants: BSMDS, BS Mathematics for Data Science
    // 4. Semesters: Roman (I-X), Decimal (1-10), "3rd+0" combo
    // 5. Section: Optional [A-C]

    // Main patterns joined by |
    // Pattern 1: BSMDS / Data Science long form
    // Pattern 2: BS Math / Maths / Mathematics
    // Pattern 3: Standard codes (BSCS etc)
    const regex = /(?:(BSMDS|BS\s*Mathematics\s*for\s*Data\s*Science)|(BS\s*Math(?:s|ematics)?|Math(?:s|ematics)?)|(BSCS|BSSE|BSAI|BBA(?:\s*\(?\s*2Y\s*\)?)?|BSAF(?:\s*\(?\s*2Y\s*\)?)?|BSDM|BS\w+|BS\s\w+|BS\s\d+|BBA\s\w+|BSAF\s\w+|BSDM\s\w+|\bPharmD\b|\bDPT\b|\bMLT\b|\bHND\b|(?:^|[\s/])RIT\b|\bNursing\b|BS\sUrdu|BS\sBiotech|BS\sZoology|BS\sChemistry|BS\sPhysics|BS\sEnglish|BS\sPsychology|BS\sCriminology|BS\sIR|BS\sNursing|Post\s*RN\s*Nursing|BS\sSISS|BS\sEducation|BS\sIslamic\sStudies|BS\sNutrition|BS\sMedical\sPhysics))[-\s]*(?:Sem(?:ester)?\.?\s*)?(\d+(?:rd|th|st|nd)?(?:\+\d+)?|[IVX]+)(?:[-\s]*([ABC]))?/gi;

    let m;
    while ((m = regex.exec(cell)) !== null) {
        let rawProgram = (m[1] || m[2] || m[3] || "").trim();
        let rawSemester = m[4]; // Can be "3", "III", "3rd", "3rd+0"
        let section = m[5] || "";

        // Normalization
        let program = rawProgram.replace(/\s+/g, ''); // Default strip spaces

        // BS Math Normalization
        if (/Math/i.test(rawProgram)) {
            program = "BS Math";
        }

        // BSMDS Normalization
        if (/BSMDS/i.test(rawProgram) || /Data\s*Science/i.test(rawProgram)) {
            program = "BSMDS";
        }

        // Nursing Normalization
        if (/Nursing/i.test(program)) {
            program = "Nursing";
        }

        // Existing BBA/BSAF 2Y normalization
        if (/BBA\(2Y\)/i.test(program) || /BBA2Y/i.test(program) || /BBA\s*2Y/i.test(program)) {
            program = "BBA(2Y)";
        } else if (/BSAF\(2Y\)/i.test(program) || /BSAF2Y/i.test(program) || /BSAF\s*2Y/i.test(program)) {
            program = "BSAF(2Y)";
        }

        // Handle "3rd+0" or simple semesters
        const semProcess = (sem: string) => {
            const romanToDecimal: Record<string, number> = {
                'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
                'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
                'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5,
                'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9, 'x': 10
            };

            // Remove ordinals (3rd -> 3)
            let cleanSem = sem.replace(/(rd|th|st|nd)/gi, '');

            if (romanToDecimal[cleanSem.toUpperCase()]) {
                return romanToDecimal[cleanSem.toUpperCase()].toString();
            }
            return cleanSem;
        };

        // Split "3+0" into ["3", "0"]
        const semesters = rawSemester.split('+').map(s => semProcess(s.trim()));

        semesters.forEach(s => {
            matches.push({
                program: program,
                semester: s,
                section: section
            });
        });
    }

    const semesterMatch = cell.match(/\(Semester\s+(\d+)\)/i);
    const hasBHND = /BHND\d+/i.test(cell);
    if (semesterMatch && hasBHND) {
        matches.push({
            program: "HND",
            semester: semesterMatch[1],
            section: ""
        });
    }

    return matches;
}

function isBiologyCourse(fullCellContent: string, isStudentMode: boolean, selectedProgram: string): boolean {
    if (!isStudentMode) return false;
    const csPrograms = ["BSCS", "BSSE", "BSAI"];
    if (!selectedProgram || !csPrograms.includes(selectedProgram.toUpperCase())) {
        return false;
    }
    const biologyKeywords = [
        'biology', 'botany', 'zoology', 'microbiology', 'biotechnology', 'biochemistry',
        'genetics', 'ecology', 'physiology', 'anatomy', 'taxonomy', 'biodiversity',
        'cell', 'molecular', 'organic chemistry', 'inorganic chemistry',
        'bio', 'plant', 'animal', 'species', 'organism', 'pharmacognosy', 'pharmacology'
    ];
    const lowerCellContent = fullCellContent.toLowerCase();
    return biologyKeywords.some(keyword => lowerCellContent.includes(keyword));
}

export function processDayData(dayData: string[][], mode: 'student' | 'teacher' | 'room' | 'exam', filters: any): ProcessedSlot[] {
    const timeRow = dayData.find(r => r.some(c => c && /\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/i.test(c)));
    if (!timeRow) {
        console.warn("Parser: No time row found for this day!", dayData.length > 0 ? dayData[0] : "Empty dayData");
        return [];
    }

    const TIMES_DAY = timeRow.slice(1).filter(t => t && /\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}/i.test(t));
    console.log(`Parser: Found time row. Times detected: ${TIMES_DAY.length}`);
    const processedSlots: ProcessedSlot[] = Array.from({ length: TIMES_DAY.length }, () => ({ time: "", entries: [] }));

    for (let i = 0; i < TIMES_DAY.length; i++) {
        processedSlots[i].time = TIMES_DAY[i] || "—";

        for (let r = 0; r < dayData.length; r++) {
            if (dayData[r] === timeRow) continue;

            const cell = (dayData[r][i + 1] || "").toString().trim();
            if (!cell || cell === "" || cell === "—") continue;

            let matches: ClassMatch[] = [];

            if (mode === "student") {
                const { program, semester, section, course } = filters;
                const allMatches = parseAllClasses(cell);

                // ... (roman conversion logic unchanged)
                const convertToComparable = (val: string) => {
                    if (!val) return val;
                    const romanMap: Record<string, string> = {
                        'I': '1', 'II': '2', 'III': '3', 'IV': '4', 'V': '5',
                        'VI': '6', 'VII': '7', 'VIII': '8', 'IX': '9', 'X': '10',
                        'i': '1', 'ii': '2', 'iii': '3', 'iv': '4', 'v': '5',
                        'vi': '6', 'vii': '7', 'viii': '8', 'ix': '9', 'x': '10'
                    }
                    const normalized = val.toString().trim();
                    return romanMap[normalized] || normalized;
                };

                matches = allMatches.filter(c => {
                    const filterProg = (program || '').replace(/\s+/g, '').toUpperCase();
                    const matchProg = (c.program || '').replace(/\s+/g, '').toUpperCase();

                    const filterSec = (section || '').toUpperCase();
                    const matchSec = (c.section || '').toUpperCase();

                    const programMatch = !filterProg || matchProg === filterProg;
                    const semesterMatch = !semester || convertToComparable(c.semester) === convertToComparable(semester);
                    const sectionMatch = !filterSec || matchSec === filterSec || (matchSec === "" && !filterSec);

                    return programMatch && semesterMatch && sectionMatch;
                });

                // COURSE FILTER (Refinement)
                if (course) {
                    const courseLower = course.trim().toLowerCase();
                    const cellLower = cell.toLowerCase();
                    const extractedCourse = cell.split("\n")[0].replace(/^\d+\.\s*/, "").trim().toLowerCase();
                    if (!cellLower.includes(courseLower) && !extractedCourse.includes(courseLower)) {
                        matches = [];
                    }
                }
            }
            else if (mode === "teacher") {
                const { teacherName, course } = filters;
                if (!teacherName) continue;
                const instructor = extractInstructor(cell);
                if (instructor.toLowerCase().includes(teacherName.toLowerCase())) {
                    matches = parseAllClasses(cell);
                    if (matches.length === 0) matches = [{ program: '', semester: '', section: '' }];

                    // COURSE FILTER (Refinement)
                    if (course) {
                        const courseLower = course.trim().toLowerCase();
                        const cellLower = cell.toLowerCase();
                        if (!cellLower.includes(courseLower)) {
                            matches = [];
                        }
                    }
                }
            }
            else if (mode === "room") {
                const { roomNumber } = filters;
                if (!roomNumber) continue;
                // Basic room matching logic for now
                const roomFromColumn = (dayData[r][0] || "").toString();
                const extracted = extractRoom(roomFromColumn, cell, null);
                if (extracted.toLowerCase().includes(roomNumber.toLowerCase())) {
                    matches = parseAllClasses(cell);
                    if (matches.length === 0) matches = [{ program: '', semester: '', section: '' }];
                }
            }

            for (const match of matches) {
                if (mode === 'student' && !match.program) continue;

                let courseTitle = cell.split("\n")[0].replace(/^\d+\.\s*/, "").trim();
                const instructorPattern = /\b(Mr\.?|Ms\.?|Mrs\.?|Mister|Miss|Doctor|Dr\.?|Muhammad|Mufti|Hafiz|Prof\.?|New\s+Faculty|New\s+Faulty)\b/i;
                const matchPos = courseTitle.search(instructorPattern);
                if (matchPos > 0) {
                    const instNameFull = extractInstructor(courseTitle);
                    if (instNameFull !== "Not Listed") {
                        courseTitle = courseTitle.replace(instNameFull, "").replace(/\s{2,}/g, " ").trim();
                        courseTitle = courseTitle.replace(/[-–,]$/, "").trim();
                    } else {
                        courseTitle = courseTitle.substring(0, matchPos).trim();
                    }
                }
                // Biology filter check
                const prog = filters.program || "";
                if (mode === "student" && isBiologyCourse(cell, true, prog)) continue;

                const roomFromColumn = (dayData[r][0] || "").toString();
                const programToUse = mode === "student" ? prog : (match.program || prog);
                const room = extractRoom(roomFromColumn, cell, programToUse);
                const instructor = extractInstructor(cell);

                let isLab = false;
                if (programToUse === "MLT" || programToUse === "HND") {
                    isLab = false;
                } else {
                    isLab = /lab/i.test(courseTitle.toLowerCase()) || /lab/i.test(cell.toLowerCase());
                }

                const isCSITLabCourse = isCSITLab(courseTitle, cell);

                let classStr = 'Unknown';
                if (match.program) {
                    classStr = `${match.program}-${match.semester}${match.section || ''}`;
                } else {
                    // Fallback for teacher/room/subject mode if no strict parse
                    const classMatch = cell.match(/(BSCS|BSSE|BSAI|BS\w+|BBA\w*|BSAF\w*|BSDM\w*|BS\w*|PharmD|DPT|MLT|HND|RIT|Nursing|BS\s\w+|BS\s\d+|BBA\s\w+|BSAF\s\w+|BSDM\s\w+)[-\s]*(\d+|[IVX]+)([ABC])?/gi);
                    if (classMatch) classStr = classMatch[0];
                }

                const cellTimeInfo = extractTimeFromCell(cell);
                let startSlotIndex = i;
                let numSlots = 1;

                if (cellTimeInfo) {
                    if (cellTimeInfo.start && cellTimeInfo.end) {
                        const foundIndex = findTimeSlotIndex(cellTimeInfo.start, TIMES_DAY);
                        if (foundIndex !== -1) startSlotIndex = foundIndex;
                        numSlots = calculateSlotDuration(cellTimeInfo.start, cellTimeInfo.end, TIMES_DAY);

                        if (isLab && isCSITLabCourse) numSlots = 3;
                    } else if (cellTimeInfo.start) {
                        const foundIndex = findTimeSlotIndex(cellTimeInfo.start, TIMES_DAY);
                        if (foundIndex !== -1) startSlotIndex = foundIndex;
                        if (isLab) {
                            numSlots = isCSITLabCourse ? 3 : 1;
                        }
                    }
                } else {
                    if (isLab && isCSITLabCourse) numSlots = 3;
                }

                numSlots = Math.min(numSlots, TIMES_DAY.length - startSlotIndex);

                for (let slotIdx = startSlotIndex; slotIdx < startSlotIndex + numSlots; slotIdx++) {
                    if (slotIdx >= 0 && slotIdx < processedSlots.length) {
                        processedSlots[slotIdx].entries.push({
                            course: courseTitle,
                            room,
                            instructor,
                            isLab,
                            isCSITLab: isCSITLabCourse,
                            class: classStr,
                            cell,
                            program: match.program,
                            semester: match.semester,
                            section: match.section
                        });
                    }
                }
            }
        }

        if (processedSlots[i].entries.length > 1) {
            processedSlots[i].entries = removeDuplicateCourses(processedSlots[i].entries);
        }
    }

    return processedSlots;
}
