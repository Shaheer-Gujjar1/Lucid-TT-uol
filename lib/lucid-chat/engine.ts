
import { INTENTS, DAYS, MODES, FEATURES, KeywordMatch, IntentType, RESPONSES, PROGRAMS_MAP, SECTIONS, SEMESTER_MAP, VIEWS } from './dictionary';

// --- LEVENSHTEIN DISTANCE (For Fuzzy Matching) ---
const levenshtein = (a: string, b: string): number => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1) // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

const isMatch = (input: string, target: string): boolean => {
    const cleanInput = input.toLowerCase().trim();
    const cleanTarget = target.toLowerCase().trim();
    if (cleanInput === cleanTarget) return true;
    if (cleanTarget.length <= 3) return cleanInput === cleanTarget;
    if (cleanInput.includes(cleanTarget) || (cleanTarget.length > 3 && cleanTarget.includes(cleanInput))) return true;
    const dist = levenshtein(cleanInput, cleanTarget);
    const maxLength = Math.max(cleanInput.length, cleanTarget.length);
    let tolerance = 0;
    if (maxLength > 6) tolerance = 2;
    else if (maxLength > 3) tolerance = 1;
    return dist <= tolerance;
};

// --- TYPES ---
export interface ParsedResult {
    intent: IntentType | 'set_profile' | 'change_view' | 'add_event' | 'set_identity';
    entities: {
        mode?: string; // student, teacher, room
        role?: string; // student, teacher
        day?: string; // monday, tuesday...
        feature?: string; // gpa, events...
        query?: string; // "Sir Asif", "Lab 5"
        program?: string;
        semester?: string;
        section?: string;
        view?: string; // day, week
        course?: string;
        time?: string;
        description?: string;
    };
    response: string;
    confidence: number;
}

// --- ENGINE ---
export const processQuery = (input: string): ParsedResult => {
    // Strip punctuation for cleaner matching
    const cleanInput = input.replace(/[?!.,]/g, '');
    const words = cleanInput.toLowerCase().split(/\s+/);

    const result: ParsedResult = {
        intent: 'unknown',
        entities: {},
        response: '',
        confidence: 0
    };

    // 0. CHECK IDENTITY / ROLE SETTING
    if (input.match(/i am a (student|teacher)/i) || input.match(/remember (that )?i am a (student|teacher)/i)) {
        const match = input.match(/(student|teacher)/i);
        if (match) {
            result.intent = 'set_identity' as any;
            result.entities.role = match[0].toLowerCase();
            result.response = `Got it. I'll remember that you are a ${match[0].toLowerCase()}.`;
            result.confidence = 10;
            return result;
        }
    }

    // 1. QUICK PHRASES
    // Next/Current Class Logic
    if (input.match(/(next|upcoming|current|my) class/i) || input.match(/where is my class/i)) {
        result.intent = 'filter_mode';
        result.entities.mode = 'student';
        result.entities.day = 'today'; // Will trigger current slot highlight in UI
        result.response = "Here is your schedule for today.";
        result.confidence = 9;
        return result;
    }

    // 1. Detect Greeting
    if (INTENTS.greeting.some(g => isMatch(input, g))) {
        result.intent = 'greeting';
        result.response = RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)];
        return result;
    }

    // 1b. Detect Identity
    if (INTENTS.identity.some(i => isMatch(input, i))) {
        result.intent = 'identity';
        result.response = RESPONSES.identity[Math.floor(Math.random() * RESPONSES.identity.length)];
        return result;
    }

    // 1c. Detect Help
    if (INTENTS.help.some(h => isMatch(input, h))) {
        result.intent = 'help';
        result.response = RESPONSES.help[Math.floor(Math.random() * RESPONSES.help.length)];
        return result;
    }

    // 2. DETECT STUDENT PROFILE (Program, Sem, Section) - HIGHEST PRIORITY
    let foundProgram: string | null = null;
    let foundSem: string | null = null;
    let foundSec: string | null = null;

    PROGRAMS_MAP.forEach(p => {
        p.variations.forEach(v => {
            if (new RegExp(`\\b${v.replace(/\s/g, '\\s*')}\\b`, 'i').test(input)) {
                foundProgram = p.file;
            }
        });
    });

    SECTIONS.forEach(s => {
        if (foundProgram && new RegExp(`\\b${s}\\b`, 'i').test(input)) foundSec = s;
    });

    Object.entries(SEMESTER_MAP).forEach(([key, val]) => {
        if (new RegExp(`\\b${key}\\b`, 'i').test(input)) foundSem = val;
    });

    if (foundProgram && foundSem) {
        result.intent = 'set_profile' as any;
        result.entities.mode = 'student';
        result.entities.program = foundProgram;
        result.entities.semester = foundSem;
        result.entities.section = foundSec || 'All Sections';
        result.confidence = 10;
        result.response = `Target class: ${foundProgram} ${foundSem} ${result.entities.section}`;
        return result;
    }

    // Helper to find best match in a list
    const findBestMatch = (candidates: KeywordMatch[], categoryName: string): { file: string, val: string, dist: number } | null => {
        let bestMatch: { file: string, val: string, dist: number } | null = null;
        candidates.forEach(cand => {
            cand.variations.forEach(v => {
                const cleanV = v.toLowerCase().trim();
                words.forEach(w => {
                    const cleanW = w.toLowerCase().trim();
                    if (cleanW === cleanV) {
                        if (!bestMatch || bestMatch.dist > 0) bestMatch = { file: cand.file, val: v, dist: 0 };
                        return;
                    }
                    const dist = levenshtein(cleanW, cleanV);
                    const maxLength = Math.max(cleanW.length, cleanV.length);
                    const tolerance = maxLength > 5 ? 2 : 1;
                    if (dist <= tolerance) {
                        if (!bestMatch || dist < bestMatch.dist) {
                            bestMatch = { file: cand.file, val: v, dist };
                        }
                    }
                });
            });
        });
        return bestMatch;
    };

    // CHECK VIEWS (Week vs Day)
    const bestView = findBestMatch(VIEWS, 'view');
    if (bestView) {
        result.entities.view = bestView.file;
        result.intent = 'change_view';
        result.confidence += 5;
    }

    // CHECK MODES
    const bestMode = findBestMatch(MODES, 'mode');
    if (bestMode) {
        result.entities.mode = bestMode.file;
        result.intent = 'filter_mode';
        result.confidence += 3;
    }

    // CHECK DAYS (Only if NOT a view change)
    // If we detected a view change (week/day view), we shouldn't force a specific day default
    let bestDay = null;
    if (result.intent !== 'change_view') {
        bestDay = findBestMatch(DAYS, 'day');
        if (bestDay) {
            let foundDay = bestDay.file;
            if (foundDay === 'today') foundDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            if (foundDay === 'tomorrow') {
                const d = new Date(); d.setDate(d.getDate() + 1);
                foundDay = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            }
            if (foundDay === 'yesterday') {
                const d = new Date(); d.setDate(d.getDate() - 1);
                foundDay = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            }
            result.entities.day = foundDay;
            if (result.intent === 'unknown') result.intent = 'filter_day';
            result.confidence += 3;
        }
    }

    // CHECK FEATURES
    const bestFeat = findBestMatch(FEATURES, 'feature');
    if (bestFeat) {
        // Priority Fix: Don't let weak features (like 'about') override a strong Day intent
        const isDayIntent = result.entities.day && bestDay;
        const isWeakFeature = bestFeat.val === 'about'; // add others if needed

        if (!isDayIntent || !isWeakFeature || bestFeat.dist === 0) {
            result.entities.feature = bestFeat.file;
            // If we already have a day, keep filter_day unless feature is strong
            if (!isDayIntent) {
                result.intent = 'navigation';
            } else if (!isWeakFeature) {
                result.intent = 'navigation'; // navigated feature usually overrides day view
            }

            result.confidence += 4;
            if (bestFeat.file === 'seating') {
                result.response = "Opening Seating Plan in Exam Mode. To find your seat, I need your name. What is your name?";
            }
        }
    }

    // CHECK ADD EVENT (STRICT WHOLE-WORD MATCHING)
    const eventKeywords = ['quiz', 'assignment', 'presentation', 'exam', 'lab', 'project', 'midterm', 'final', 'task', 'todo', 'deadline'];
    const actionVerbs = ['add', 'create', 'new', 'track', 'reminder'];
    const hasActionVerb = actionVerbs.some(v => new RegExp(`\\b${v}\\b`, 'i').test(input));
    const mentionedEventType = eventKeywords.find(k => new RegExp(`\\b${k}\\b`, 'i').test(input));

    if (mentionedEventType || hasActionVerb) {
        const looksLikeSearch = ['where', 'find', 'seat', 'my', 'search'].some(s => input.toLowerCase().includes(s));
        if (hasActionVerb || (mentionedEventType && !bestFeat && !looksLikeSearch)) {
            result.intent = 'add_event';
            result.confidence = hasActionVerb ? 10 : 8;
            if (mentionedEventType) {
                result.entities.query = mentionedEventType;
                result.response = `Sure, I can help you add a ${mentionedEventType}. What is the title?`;
            } else {
                result.response = "Sure, I can help you add an event. What is the title?";
            }
            return result;
        }
    }

    // CHECK ACTIONS
    if (INTENTS.action.some(act => new RegExp(`\\b${act}\\b`, 'i').test(input))) {
        result.intent = 'action';
        if (words.some(w => isMatch(w, 'clear') || isMatch(w, 'reset'))) {
            result.entities.query = 'CLEAR_ALL';
        }
    }

    // SMART ENTITY EXTRACTION
    if (result.intent === 'filter_mode' || result.intent === 'search' || result.intent === 'add_event' || result.intent === 'unknown') {
        const timeMatch = input.match(/\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)|(?:[01]\d|2[0-3]):[0-5]\d)\b/i);
        if (timeMatch) result.entities.time = timeMatch[0];
        const courseMatch = input.match(/\b([A-Z]{2,6}\s?\d{0,4})\b/);
        const exclusions = [...MODES, ...DAYS, ...FEATURES].flatMap(c => c.variations.map(v => v.toUpperCase()));
        if (courseMatch && !exclusions.includes(courseMatch[0])) {
            result.entities.course = courseMatch[0];
        }

        let cleanText = input.toLowerCase();
        [...MODES, ...DAYS, ...FEATURES].forEach(cat => cat.variations.forEach(v => cleanText = cleanText.replace(new RegExp(`\\b${v}\\b`, 'gi'), '')));
        Object.values(INTENTS).flat().forEach(v => cleanText = cleanText.replace(new RegExp(`\\b${v}\\b`, 'gi'), ''));
        const stopWords = ['my', 'name', 'is', 'i', 'am', 'find', 'search', 'looking', 'for', 'show', 'me', 'the', 'seat', 'on', 'at', 'in', 'how', 'many', 'do', 'does', 'free', 'by', 'now', 'is', 'are', 'remember', 'a', 'an'];
        stopWords.forEach(sw => cleanText = cleanText.replace(new RegExp(`\\b${sw}\\b`, 'gi'), ''));

        const potentialQuery = cleanText.trim().replace(/\s+/g, ' ');
        if (potentialQuery.length > 2) {
            result.entities.query = potentialQuery;
            if (result.intent === 'unknown') result.intent = 'search';

            // Determine mode/feature first if not already set, then generate specific response
            if (!result.entities.mode && result.intent === 'search') {
                const honorifics = ['sir', 'mam', 'maam', 'dr', 'mr', 'ms', 'prof', 'teacher', 'instructor'];
                // Teacher Heuristic: Multi-word alphabetic query + context words
                const isMultiWordName = potentialQuery.split(' ').length >= 2 && /^[a-zA-Z\s]+$/.test(potentialQuery);
                const hasClassContext = ['class', 'classes', 'free', 'lecture'].some(k => input.toLowerCase().includes(k));

                if (honorifics.some(h => input.toLowerCase().includes(h))) result.entities.mode = 'teacher';
                else if (isMultiWordName && hasClassContext) result.entities.mode = 'teacher';
                else if (/\b\d{3}\b/.test(potentialQuery) || /nb-|ob-|room|lab/i.test(potentialQuery)) result.entities.mode = 'room';
                else if (/\b(sec|section|batch)\b/i.test(input)) result.entities.mode = 'student';
            }

            if (result.entities.feature === 'datesheet') {
                result.response = `Searching Datesheet for: ${potentialQuery}...`;
            } else if (result.entities.mode === 'exam' || result.entities.feature === 'seating') {
                result.response = `Searching Seating Plan for: ${potentialQuery}...`;
            } else if (result.entities.mode === 'teacher') {
                result.response = `Searching Teacher: ${potentialQuery}...`;
            } else if (result.entities.mode === 'room') {
                result.response = `Searching Room: ${potentialQuery}...`;
            } else {
                result.response = `Searching for "${potentialQuery}"...`;
            }
            return result; // Return immediately if a specific search response is generated
        }
    }

    // 3. Generate Response
    if (result.intent === 'unknown') {
        result.response = RESPONSES.unknown[Math.floor(Math.random() * RESPONSES.unknown.length)];
    } else if (!result.response) {
        result.response = RESPONSES.confirmation[Math.floor(Math.random() * RESPONSES.confirmation.length)];
        if (result.entities.mode) result.response += ` Switching to ${result.entities.mode} view.`;
        if (result.entities.view) result.response += ` Switching to ${result.entities.view} view.`;
        if (result.entities.day) result.response += ` Showing ${result.entities.day}.`;
        if (result.entities.feature) result.response += ` Opening ${result.entities.feature}.`;
        if (result.entities.query && result.entities.query !== 'CLEAR_ALL') result.response = `Searching for "${result.entities.query}"...`;
    }

    return result;
};
