
// The "Fine-Tuned" Dictionary for Lucid Aura NLP
// This file acts as the training data for our local fuzzy logic engine.

export type IntentType =
    | 'filter_mode'
    | 'filter_day'
    | 'search'
    | 'navigation'
    | 'action'
    | 'help'
    | 'greeting'
    | 'identity'
    | 'explanation'
    | 'add_event'
    | 'unknown';

export interface KeywordMatch {
    file: string; // The canonical value (e.g., "monday", "teacher")
    variations: string[];
    weight: number; // Importance of this keyword (1-10)
}

// 1. MODES & FILTERS
export const MODES: KeywordMatch[] = [
    { file: 'student', variations: ['student', 'std', 'batch', 'section', 'stu', 'study'], weight: 10 },
    { file: 'teacher', variations: ['teacher', 'tchr', 'sir', 'mam', 'professor', 'faculty', 'lecturer', 'lec', 'instructor', 'schedule', 'timetable'], weight: 10 },
    { file: 'room', variations: ['room', 'hall', 'lab', 'class room', 'venue', 'location', 'place', 'where'], weight: 10 },
];

// 2. DAYS
export const DAYS: KeywordMatch[] = [
    { file: 'monday', variations: ['monday', 'mon', 'mnday', 'monty', '1st day'], weight: 8 },
    { file: 'tuesday', variations: ['tuesday', 'tue', 'tues', 'tusday', '2nd day'], weight: 8 },
    { file: 'wednesday', variations: ['wednesday', 'wed', 'wednes', 'wdnesday', 'mid week'], weight: 8 },
    { file: 'thursday', variations: ['thursday', 'thu', 'thurs', 'thr', 'thrusday'], weight: 8 },
    { file: 'friday', variations: ['friday', 'fri', 'fryday', 'jumma', 'weekend'], weight: 8 },
    { file: 'saturday', variations: ['saturday', 'sat', 'satur', 'weekend'], weight: 8 },
    { file: 'sunday', variations: ['sunday', 'sun', 'funday', 'holiday'], weight: 8 },
    { file: 'today', variations: ['today', 'tod', 'now', 'current'], weight: 9 },
    { file: 'tomorrow', variations: ['tomorrow', 'tmrw', 'tomo', 'next day', 'kal'], weight: 9 },
    { file: 'yesterday', variations: ['yesterday', 'yday', 'pichly din', 'previous day'], weight: 9 },
];

// 3. INTENT TRIGGERS (Actions)
export const INTENTS: Record<IntentType, string[]> = {
    filter_mode: ['switch', 'change', 'mode', 'goto', 'show', 'view', 'open', 'select'],
    filter_day: ['day', 'on', 'schedule for', 'timetable for', 'when is'],
    search: ['find', 'search', 'look for', 'where is', 'track', 'locate', 'whose'],
    navigation: ['go to', 'navigate', 'visit', 'open page'],
    action: ['export', 'save', 'download', 'print', 'pdf', 'image', 'screenshot', 'clear', 'reset', 'remove'],
    help: ['help', 'how to', 'guide', 'tutorial', 'what is', 'support', 'contact', 'what can you do', 'features', 'assist'],
    greeting: ['hi', 'hello', 'hey', 'salam', 'lucid', 'bot', 'aura'],
    identity: ['who are you', 'your name', 'are you a bot', 'what are you', 'real person', 'ai'],
    explanation: ['why', 'reason', 'what for', 'why do you need'],
    add_event: ['add', 'create', 'new', 'track', 'reminder', 'quiz', 'assignment', 'presentation', 'exam', 'lab', 'project', 'midterm', 'final'],
    unknown: []
};

// 4. APP FEATURES (Navigation Targets)
export const FEATURES: KeywordMatch[] = [
    { file: 'events', variations: ['event', 'events', 'todo', 'task', 'deadline', 'assignment'], weight: 7 }, // Removed 'exam'
    { file: 'gpa', variations: ['gpa', 'cgpa', 'calculator', 'grade', 'marks', 'calc'], weight: 7 },
    { file: 'datesheet', variations: ['datesheet', 'date sheet', 'exam schedule', 'midterm', 'final', 'paper', 'exam'], weight: 7 },
    { file: 'seating', variations: ['seat', 'seating', 'hall', 'exam room', 'sitting', 'my seat', 'seat number', 'hall', 'sitting plan'], weight: 9 }, // New Seating Feature
    { file: 'about', variations: ['about', 'info', 'developer', 'who made this', 'version'], weight: 5 },
    { file: 'settings', variations: ['setting', 'config', 'preference', 'theme', 'dark mode', 'light mode'], weight: 5 },
];

// 6. STUDENT PROFILE ENTITIES
export const PROGRAMS_MAP: KeywordMatch[] = [
    { file: 'BSCS', variations: ['BSCS', 'CS', 'Computer Science'], weight: 10 },
    { file: 'BSIT', variations: ['BSIT', 'IT', 'Information Technology'], weight: 10 },
    { file: 'BSSE', variations: ['BSSE', 'SE', 'Software Engineering'], weight: 10 },
    { file: 'BSAI', variations: ['BSAI', 'AI', 'Artificial Intelligence'], weight: 10 },
    { file: 'MCS', variations: ['MCS', 'Masters CS'], weight: 10 },
    { file: 'ADP', variations: ['ADP', 'Associate'], weight: 10 },
    { file: 'PharmD', variations: ['PharmD', 'Pharm D', 'Pharmacy', 'Doctor of Pharmacy'], weight: 10 },
    { file: 'DPT', variations: ['DPT', 'Physiotherapy', 'Physical Therapy', 'Doctor of Physical Therapy'], weight: 10 },
    { file: 'MLT', variations: ['MLT', 'Medical Lab', 'Medical Laboratory Technology'], weight: 10 },
    { file: 'HND', variations: ['HND', 'Higher National Diploma'], weight: 10 },
    { file: 'RIT', variations: ['RIT', 'Radiology', 'Imaging Technology', 'Radiology Imaging'], weight: 10 },
    { file: 'Nursing', variations: ['Nursing', 'BSN', 'BS Nursing', 'Nurse'], weight: 10 },
    { file: 'BBA', variations: ['BBA', 'Business Administration', 'Business'], weight: 10 },
    { file: 'BBA(2Y)', variations: ['BBA 2Y', 'BBA 2 Year', 'BBA Two Year'], weight: 10 },
    { file: 'BSAF', variations: ['BSAF', 'Accounting', 'Accounting Finance', 'Accounting and Finance'], weight: 10 },
    { file: 'BSAF(2Y)', variations: ['BSAF 2Y', 'BSAF 2 Year', 'BSAF Two Year'], weight: 10 },
    { file: 'BSDM', variations: ['BSDM', 'Digital Marketing', 'Marketing'], weight: 10 },
    { file: 'BS Math', variations: ['BS Math', 'BSMath', 'Mathematics', 'Maths'], weight: 10 },
    { file: 'BSMDS', variations: ['BSMDS', 'Data Science', 'BS Data Science', 'MDS'], weight: 10 },
];


export const PROGRAMS: string[] = PROGRAMS_MAP.map(p => p.file);

export const SECTIONS: string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'M1', 'M2', 'E1', 'E2'];

export const SEMESTER_MAP: Record<string, string> = {
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
    '1st': '1', '2nd': '2', '3rd': '3', '4th': '4', '5th': '5', '6th': '6', '7th': '7', '8th': '8', '9th': '9', '10th': '10',
    'first': '1', 'second': '2', 'third': '3', 'fourth': '4', 'fifth': '5', 'sixth': '6', 'seventh': '7', 'eighth': '8', 'ninth': '9', 'tenth': '10',
    'zero': '0'
};

export const SEMESTERS: string[] = Object.keys(SEMESTER_MAP);

// 7. VIEWS (Day vs Week)
export const VIEWS: KeywordMatch[] = [
    { file: 'week', variations: ['week', 'whole week', 'full week', 'weekly', 'all days'], weight: 10 },
    { file: 'day', variations: ['day', 'daily', 'single day', 'today view'], weight: 10 },
];

// 5. COMMON RESPONSES (For "Chat" feel)
export const RESPONSES = {
    greeting: [
        "Hello! I'm Aura AI. How can I help with your timetable?",
        "Hey there! Need to find a class or teacher?",
        "Hi! Ask me anything like 'Where is Sir Asif?' or 'Show me Monday'."
    ],
    identity: [
        "I am Aura AI, your personal AI assistant for the Lucid Aura ∞ Application designed for UOL SGD. I can help you find classes, teachers, rooms, datesheet, exam seat and add events instantly! 🤖",
        "I'm Aura AI, a smart assistant built to make navigating your schedule easier. Ask me to find a teacher or show your class timing.",
    ],
    help: [
        "I can help you filter the timetable! Try asking:\n• 'Show me BSCS 5 A'\n• 'Where is Sir Ali Tariq?'\n• 'Find Room 202'\n• 'Schedule for Friday'\n• 'Open GPA Calculator'",
        "Here's what I can do:\n• Set your profile: 'I am from BSCS 5 A'\n• specific searches: 'Search Sir Asif'\n• Navigation: 'Go to Events'\n• View switching: 'Show full week'",
    ],
    explanation: [ // Specifically for name request
        "I need your name to filter the seating plan list and find your specific seat. Don't worry, it stays on your device!",
        "To find your specific seat in the Exam Hall, I need to know who to look for in the list.",
    ],
    unknown: [
        // ...
        "I'm not sure I understood that. Try 'Show Monday' or 'Search Teacher'.",
        "Hmm, I missed that. You can ask me to find teachers, rooms, or change days.",
        "Could you rephrase? I'm good at finding free slots and classes!"
    ],
    confirmation: [
        "On it! ⚡",
        "Done.",
        "Here you go.",
        "Updating schedule..."
    ]
};
