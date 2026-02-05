
'use client';

import { useState, useEffect, useRef } from 'react';
import { processQuery, ParsedResult } from '@/lib/lucid-chat/engine';
import { useRouter, usePathname } from 'next/navigation';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'system';
    timestamp: Date;
}

interface LucidChatProps {
    onAction?: (result: ParsedResult) => void;
}

interface WizardState {
    active: boolean;
    step: 'title' | 'course' | 'date' | 'time' | 'priority' | 'type' | 'description' | 'confirm';
    data: {
        title?: string;
        course?: string;
        date?: string;
        time?: string;
        priority?: 'High' | 'Medium' | 'Low';
        type?: string;
        description?: string;
    };
}

// 0. Static Global Reference for early access
let globalToggleRef: (() => void) | null = null;
let hasQueuedToggle = false;

if (typeof window !== 'undefined') {
    (window as any).LucidChatToggle = () => {
        if (globalToggleRef) {
            console.log("LucidChat: Global Toggle Triggered");
            globalToggleRef();
        } else {
            console.warn("LucidChat: Component not ready, queuing toggle...");
            hasQueuedToggle = true;
            // Also dispatch event as a backup for other listeners
            window.dispatchEvent(new CustomEvent('lucid-chat-toggle'));
        }
    };
}

export default function LucidChat({ onAction }: LucidChatProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Smart Memory
    const [memory, setMemory] = useState<string[]>([]);

    // Context State for Multi-turn conversation
    const [context, setContext] = useState<{
        type: 'name_search' | 'confirm_slot_switch' | 'name_conflict' | 'confirm_profile_identity' | null,
        data?: any
    }>({ type: null });

    // Event Wizard State
    const [wizard, setWizard] = useState<WizardState>({
        active: false,
        step: 'title',
        data: {}
    });
    // 0.5. Register this instance's toggle function immediately on every render
    const handleToggle = () => {
        console.log("LucidChat: Toggle Signal Received");
        setIsOpen(prev => !prev);
    };

    if (typeof window !== 'undefined') {
        globalToggleRef = handleToggle;
        // If a toggle was requested before we were ready, handle it now
        if (hasQueuedToggle) {
            console.log("LucidChat: Handling queued toggle");
            hasQueuedToggle = false;
            setIsOpen(true);
        }
    }

    // 1. Load Memory & Messages on Mount
    useEffect(() => {
        // Load Facts
        const savedMem = localStorage.getItem('lucid_aura_memory');
        let initialMemory: string[] = [];
        if (savedMem) {
            try {
                initialMemory = JSON.parse(savedMem);
                setMemory(initialMemory);
            } catch (e) { console.error(e); }
        }

        // Load Session Messages (To survive remounts)
        const savedSession = sessionStorage.getItem('lucid_chat_session');
        if (savedSession) {
            try {
                const parsedMsgs = JSON.parse(savedSession);
                // Hydrate dates
                const hydrated = parsedMsgs.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
                setMessages(hydrated);
                return; // Don't overwrite with welcome if session exists
            } catch (e) { console.error("Session load failed", e); }
        }

        // Default Welcome (Only if no session)
        let welcomeText = "Hi! I'm Lucid Aura. Ask me anything! (e.g., 'Where is Sir Asif?', 'Add Assignment')";
        if (initialMemory.length > 0) {
            welcomeText = `Welcome back! I remember:\n${initialMemory.map(m => `• ${m}`).join('\n')}\n\nHow can I help you today?`;
        }
        setMessages([{ id: 1, text: welcomeText, sender: 'system', timestamp: new Date() }]);
    }, []);

    // 2. Save Memory
    useEffect(() => {
        if (memory.length > 0) localStorage.setItem('lucid_aura_memory', JSON.stringify(memory));
    }, [memory]);

    // 3. Save Session Messages
    useEffect(() => {
        if (messages.length > 0) {
            sessionStorage.setItem('lucid_chat_session', JSON.stringify(messages.slice(-20))); // Keep last 20
        }
    }, [messages]);

    const handleClearChat = () => {
        const welcomeText = memory.length > 0
            ? `Memory preserved. Welcome back! I remember:\n${memory.map(m => `• ${m}`).join('\n')}\n\nHow can I help?`
            : "Chat cleared. I'm Lucid Aura. Ask me anything!";

        setMessages([{ id: Date.now(), text: welcomeText, sender: 'system', timestamp: new Date() }]);
        sessionStorage.removeItem('lucid_chat_session');
        setWizard({ active: false, step: 'title', data: {} });
        setContext({ type: null });
    };

    const updateMemory = (result: ParsedResult) => {
        // Profile Facts
        if (result.intent === 'set_profile' || (result.entities.program && result.entities.semester && result.entities.section)) {
            const fact = `User is in ${result.entities.program} ${result.entities.semester} ${result.entities.section}`;
            setMemory(prev => {
                const clean = prev.filter(m => !m.startsWith('User is in'));
                return [...clean, fact];
            });
        }
        // Name Fact (from Seating Search)
        if (result.intent === 'search' && result.entities.mode === 'exam' && result.entities.query) {
            const fact = `User name is ${result.entities.query}`;
            // Only save if it looks like a name (not a generic term)
            if (result.entities.query.length > 2) {
                setMemory(prev => {
                    const clean = prev.filter(m => !m.startsWith('User name is'));
                    return [...clean, fact];
                });
            }
        }
        // Identity Fact
        if (result.intent === 'set_identity' && result.entities.role) {
            const fact = `User role is ${result.entities.role}`;
            setMemory(prev => {
                const clean = prev.filter(m => !m.startsWith('User role is'));
                return [...clean, fact];
            });
            localStorage.setItem('lucid_user_role', result.entities.role);
        }
    };

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    useEffect(() => scrollToBottom(), [messages, isOpen]);

    // --- GLOBAL ACTIONS ---
    const handleGlobalAction = (result: ParsedResult) => {
        const { intent, entities } = result;

        // 1. NAVIGATION
        if (intent === 'navigation' && entities.feature) {
            if (entities.feature === 'events') router.push('/events');
            if (entities.feature === 'gpa') router.push('/gpa');
            if (entities.feature === 'about') router.push('/?action=about'); // Handle in page.tsx if needed
            if (entities.feature === 'datesheet' || entities.feature === 'seating') {
                // We need to set Exam Mode. 
                // We use Custom Event for "Current Page" interaction.
                if (pathname === '/') {
                    window.dispatchEvent(new CustomEvent('lucid-chat-action', { detail: result }));
                } else {
                    router.push('/');
                    // Wait for nav then dispatch (might be racey, prefer localStorage param or simpler handling)
                    setTimeout(() => window.dispatchEvent(new CustomEvent('lucid-chat-action', { detail: result })), 800);
                }
            }
        }

        // 2. TIMETABLE FILTERS (Home Page)
        if (intent === 'filter_mode' || intent === 'filter_day' || intent === 'search' || intent === 'set_profile' || intent === 'change_view') {
            // Save to LocalStorage so Page picks it up on load
            if (entities.mode === 'student') {
                // If set_profile, update student prefs
                if (intent === 'set_profile') {
                    const prefs = {
                        program: entities.program || '',
                        semester: entities.semester || '',
                        section: entities.section || ''
                    };
                    localStorage.setItem('lucid_student_prefs', JSON.stringify(prefs));
                }
            }

            // Dispatch Event for live update if on Home Page
            if (pathname === '/') {
                // Use a custom event that page.tsx listens to (we will implement listener next)
                // Or we can rely on onAction prop if it's passed (backward compat)
                if (onAction) onAction(result);
                // Also dispatch for safety if onAction is missing (Global Mode)
                if (!onAction) window.dispatchEvent(new CustomEvent('lucid-chat-action', { detail: result }));
            } else {
                // If not on Home, Redirect to Home. Home will read LS or default.
                // Problem: "Show Monday" isn't saved in LS prefs usually (only filters).
                // "Day" is transient.
                // We can pass it as query param? router.push('/?day=Monday')
                if (entities.day) {
                    // Page.tsx needs to be updated to read query params? 
                    // Or we assume user goes to home and resets?
                    // Let's force it via localStorage hack for transient state or query param.
                    // Let's use Query Param for robustness.
                    // But current page.tsx doesn't read query params for 'day'.
                    // I will leave this as a limitation for now: Navigation works, Profile setting works. 
                    // "Show Monday" from /events might just go to Home (Default Day).
                    router.push('/');
                    setTimeout(() => window.dispatchEvent(new CustomEvent('lucid-chat-action', { detail: result })), 500);
                } else {
                    router.push('/');
                }
            }
        }
    };

    const formatTo24h = (text: string) => {
        const lower = text.toLowerCase().trim();
        const ampmMatch = lower.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
        if (ampmMatch) {
            let hours = parseInt(ampmMatch[1]);
            const minutes = ampmMatch[2] || "00";
            const ampm = ampmMatch[3].toLowerCase();
            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;
            return `${hours.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
        }
        const standardMatch = lower.match(/^([01]\d|2[0-3]):?([0-5]\d)$/);
        if (standardMatch) {
            return `${standardMatch[1]}:${standardMatch[2]}`;
        }
        return text;
    };

    const parseRelativeTime = (text: string) => {
        const lower = text.toLowerCase();
        if (lower.includes('after') || lower.includes('in')) {
            const hMatch = lower.match(/(\d+)\s*h/i) || lower.match(/(\d+)\s*hour/i);
            const mMatch = lower.match(/(\d+)\s*m/i) || lower.match(/(\d+)\s*min/i);

            if (hMatch || mMatch) {
                const now = new Date();
                if (hMatch) now.setHours(now.getHours() + parseInt(hMatch[1]));
                if (mMatch) now.setMinutes(now.getMinutes() + parseInt(mMatch[1]));

                return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            }
        }
        if (lower.includes('right now') || lower.includes('current time')) {
            const now = new Date();
            return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        }
        return formatTo24h(text);
    };


    // --- WIZARD LOGIC ---
    const processWizardStep = (text: string) => {
        const currentStep = wizard.step;
        const newData = { ...wizard.data };

        if (currentStep === 'title') {
            newData.title = text;
            if (newData.course) {
                setWizard({ ...wizard, step: 'date', data: newData });
                return `Got it, "${newData.title}" for ${newData.course}. When is it due? (e.g., 2024-02-10 or Tomorrow)`;
            }
            setWizard({ ...wizard, step: 'course', data: newData });
            return "Got it. What is the course name? (e.g., CS101 or DAAA)";
        }
        if (currentStep === 'course') {
            newData.course = text;
            setWizard({ ...wizard, step: 'date', data: newData });
            return `Noted. When is it due? (e.g., 2024-02-10 or Tomorrow)`;
        }
        if (currentStep === 'date') {
            // Basic date handling
            let dateStr = text;
            if (text.toLowerCase().includes('tomorrow')) {
                const d = new Date(); d.setDate(d.getDate() + 1);
                dateStr = d.toISOString().split('T')[0];
            } else if (text.toLowerCase().includes('today')) {
                dateStr = new Date().toISOString().split('T')[0];
            }
            newData.date = dateStr;
            if (newData.time) {
                setWizard({ ...wizard, step: 'priority', data: newData });
                return `Set for ${newData.date} at ${newData.time}. What is the priority? (High, Medium, Low)`;
            }
            setWizard({ ...wizard, step: 'time', data: newData });
            return "Set. What time? (e.g., 10am or 2:30pm)";
        }
        if (currentStep === 'time') {
            newData.time = parseRelativeTime(text);
            setWizard({ ...wizard, step: 'priority', data: newData });

            let displayTime = newData.time;
            if (newData.time && newData.time.includes(':')) {
                const [h, m] = newData.time.split(':');
                const hh = parseInt(h);
                displayTime = `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`;
            }
            return `Caught it (${displayTime}). What is the priority? (High, Medium, Low)`;
        }

        if (currentStep === 'priority') {
            let prio: 'High' | 'Medium' | 'Low' = 'Medium';
            if (text.toLowerCase().includes('high')) prio = 'High';
            if (text.toLowerCase().includes('low')) prio = 'Low';
            newData.priority = prio;

            if (newData.type) {
                setWizard({ ...wizard, step: 'description', data: newData });
                return `Okay. Any additional notes or description? (or type 'none')`;
            }

            setWizard({ ...wizard, step: 'type', data: newData });
            return "Okay. Is this an Assignment, Quiz, Exam, or Task?";
        }
        if (currentStep === 'type') {
            newData.type = text;
            setWizard({ ...wizard, step: 'description', data: newData });
            return `Got it. Any additional notes or description? (or type 'none')`;
        }
        if (currentStep === 'description') {
            newData.description = text.toLowerCase() === 'none' ? '' : text;
            setWizard({ ...wizard, step: 'confirm', data: newData });

            let displayTime = newData.time || 'N/A';
            if (newData.time && newData.time.includes(':')) {
                const [h, m] = newData.time.split(':');
                const hh = parseInt(h);
                displayTime = `${hh % 12 || 12}:${m} ${hh >= 12 ? 'PM' : 'AM'}`;
            }

            return `Summary: Add "${newData.title}" (${newData.type}) for ${newData.course || 'N/A'} on ${newData.date} at ${displayTime}. Confirm? (Yes/No)`;
        }

        if (currentStep === 'confirm') {
            const isAffirmative = /\b(yes|yeah|ok|okay|sure|confirm|do it)\b/i.test(text);

            if (isAffirmative) {
                // SAVE EVENT
                try {
                    const newItem = {
                        id: Date.now().toString(),
                        title: newData.title || 'Untitled',
                        date: newData.date || new Date().toISOString().split('T')[0],
                        type: newData.type || 'Task',
                        priority: newData.priority || 'Medium',
                        completed: false,
                        time: newData.time || '',
                        description: newData.description || '',
                        course: newData.course || '',
                        reminder: false
                    };

                    // Load existing
                    const existingStr = localStorage.getItem('lucid_timetable_events') || '[]';
                    const existing = JSON.parse(existingStr);
                    const updated = [...existing, newItem];
                    localStorage.setItem('lucid_timetable_events', JSON.stringify(updated));

                    // Dispatch Update for live listeners
                    window.dispatchEvent(new CustomEvent('lucid-events-updated'));

                    setWizard({ active: false, step: 'title', data: {} });

                    // Navigate to Events Page after a brief delay to show message
                    setTimeout(() => router.push('/events'), 1000);

                    return "Event added successfully! 🚀 Opening events...";
                } catch (error) {
                    console.error("Failed to save event:", error);
                    return "Sorry, I couldn't save the event. Please try again.";
                }
            } else {
                setWizard({ active: false, step: 'title', data: {} });
                return "Cancelled.";
            }
        }
        return "I didn't catch that.";
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            let responseText = '';
            let rawResult: ParsedResult | null = null;

            // 1. WIZARD HANDLING (With Smart Escape)
            if (wizard.active) {
                // Ignore "none" for escape logic as it's a valid data input for optional fields
                const isNone = userMsg.text.toLowerCase().trim() === 'none';
                const isEscape = !isNone && /\b(cancel|abort|stop|exit|never mind)\b/i.test(userMsg.text);

                const tentativeResult = processQuery(userMsg.text);
                const isStrongIntent = (
                    tentativeResult.intent === 'navigation' ||
                    tentativeResult.intent === 'search' ||
                    tentativeResult.intent === 'set_profile'
                ) && tentativeResult.entities.feature !== 'events';

                if (isEscape || (isStrongIntent && tentativeResult.confidence > 0.8)) {
                    setWizard({ active: false, step: 'title', data: {} });
                    if (isEscape) {
                        responseText = "Cancelled event creation.";
                    } else {
                        rawResult = tentativeResult;
                        responseText = rawResult.response;
                    }
                } else {
                    responseText = processWizardStep(userMsg.text);
                }
            }

            // 2. CONTEXT HANDLING (If not handled by Wizard)
            if (!responseText) {
                if (context.type === 'name_search') {
                    const nameQuery = userMsg.text.replace(/(my name is|i am|search for|find)/gi, '').trim();
                    const knownName = memory.find(m => m.startsWith('User name is'))?.replace('User name is ', '');

                    if (knownName && nameQuery.toLowerCase() !== knownName.toLowerCase() && nameQuery.length > 2) {
                        responseText = `I have "${knownName}" saved as your name. Is "${nameQuery}" your new name, or are you searching for a friend? I ask so I can remember your name for future searches.`;
                        setContext({ type: 'name_conflict', data: { newName: nameQuery, oldName: knownName } });
                    } else {
                        responseText = `Searching for "${nameQuery}" in Seating Plan...`;
                        rawResult = {
                            intent: 'search',
                            entities: { query: nameQuery, mode: 'exam' },
                            confidence: 1,
                            response: responseText
                        };
                        setContext({ type: null });
                    }
                }
                else if (context.type === 'confirm_slot_switch') {
                    const text = userMsg.text.toLowerCase();
                    const affirmations = ['yes', 'yeah', 'sure', 'ok', 'okay', 'go for it', 'do it'];

                    if (affirmations.some(a => text.includes(a))) {
                        responseText = `Checking ${context.data.nextSlotName}...`;
                        window.dispatchEvent(new CustomEvent('lucid-exam-action', {
                            detail: { type: 'switch_file', fileId: context.data.nextSlotId }
                        }));
                        setContext({ type: null });
                    } else {
                        responseText = "Okay, staying on current slot.";
                        setContext({ type: null });
                    }
                }
                else if (context.type === 'confirm_profile_identity') {
                    const text = userMsg.text.toLowerCase();
                    const isStudent = ['student', 'std', 'stu', 'i am', 'yes'].some(k => text.includes(k));
                    const isTeacher = ['teacher', 'sir', 'mam', 'prof', 'lec'].some(k => text.includes(k));

                    if (isStudent) {
                        responseText = `Got it! Saved "${context.data.program} ${context.data.semester} ${context.data.section}" as your profile. Showing your timetable...`;
                        rawResult = {
                            intent: 'set_profile' as any,
                            entities: context.data,
                            confidence: 1,
                            response: responseText
                        };
                    } else if (isTeacher) {
                        responseText = `Showing timetable for ${context.data.program} ${context.data.semester} ${context.data.section}. (Not saved as profile)`;
                        rawResult = {
                            intent: 'filter_mode',
                            entities: { ...context.data, mode: 'student' }, // We still show student view of that class
                            confidence: 1,
                            response: responseText
                        };
                    } else {
                        responseText = "I didn't catch that. Are you a student or a teacher?";
                        return; // Keep context
                    }
                    setContext({ type: null });
                }
                // 3. DEFAULT QUERY HANDLING
                else {
                    rawResult = processQuery(userMsg.text);
                    responseText = rawResult.response;

                    if (rawResult.intent === 'set_profile') {
                        const isExplicitStudent = ['student', 'i am', 'my class'].some(k => userMsg.text.toLowerCase().includes(k));

                        if (!isExplicitStudent) {
                            responseText = `I noticed you mentioned a class. Are you a student or a teacher? I can save this as your default profile if you are a student.`;
                            setContext({ type: 'confirm_profile_identity', data: rawResult.entities });
                            rawResult = null; // Wait for confirmation
                        } else {
                            responseText = rawResult.response;
                        }
                    }

                    if (rawResult && rawResult.intent === 'add_event') {
                        setWizard({
                            active: true,
                            step: 'title',
                            data: {
                                type: rawResult.entities.query,
                                course: rawResult.entities.course,
                                time: rawResult.entities.time,
                                date: rawResult.entities.day
                            }
                        });
                        responseText = rawResult.response;
                    }

                    if (rawResult && rawResult.intent === 'navigation' && rawResult.entities.feature === 'seating') {
                        const knownName = memory.find(m => m.startsWith('User name is'))?.replace('User name is ', '');
                        if (knownName) {
                            responseText = `Opening Seating Plan. Searching for "${knownName}"...`;
                            rawResult = {
                                intent: 'search',
                                entities: { query: knownName, mode: 'exam' },
                                confidence: 1,
                                response: responseText
                            };
                        } else {
                            responseText = "Opening Seating Plan in Exam Mode. To find your seat, I need your name. What is your name?";
                            setContext({ type: 'name_search' });
                        }
                    }
                }
            }

            const sysMsg: Message = {
                id: Date.now() + 1,
                text: responseText,
                sender: 'system',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, sysMsg]);
            setIsTyping(false);

            if (rawResult) {
                handleGlobalAction(rawResult);
                updateMemory(rawResult);
            }

        }, 600);
    };

    // LISTEN FOR APP FEEDBACK (e.g., Search Results)
    useEffect(() => {
        const handleFeedback = (e: CustomEvent) => {
            const { type, currentSlot, nextSlotId, nextSlotName } = e.detail;

            if (type === 'search_empty_slot') {
                // Check if we are already in confirmation or just asked
                // Prevent duplicate prompts using a ref or checking last message? 
                // Simple check: don't overwrite if wizard active
                setContext({
                    type: 'confirm_slot_switch',
                    data: { nextSlotId, nextSlotName }
                });

                setMessages(prev => {
                    // Avoid duplicate "Not Found" messages
                    if (prev[prev.length - 1]?.text.includes("No result found")) return prev;
                    return [...prev, {
                        id: Date.now(),
                        text: `No result found in ${currentSlot}. Do you want me to look in ${nextSlotName}?` +
                            (nextSlotName.includes('/') || currentSlot.includes('/') ? " (Creating complex queries? Try searching for a single room number.)" : ""),
                        sender: 'system',
                        timestamp: new Date()
                    }];
                });
            }
        };
        window.addEventListener('lucid-chat-feedback', handleFeedback as EventListener);

        window.addEventListener('lucid-chat-toggle', handleToggle);

        return () => {
            window.removeEventListener('lucid-chat-feedback', handleFeedback as EventListener);
            window.removeEventListener('lucid-chat-toggle', handleToggle);
            if (globalToggleRef === handleToggle) globalToggleRef = null;
        };
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    // ... (Render Logic same as before) ...
    return (
        <>

            <div className={`fixed bottom-24 right-4 md:right-24 w-[90vw] md:w-[440px] h-[480px] max-h-[calc(100vh-150px)] z-[999] transition-all duration-300 origin-bottom-right
                ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-20 pointer-events-none'}
            `}>
                <div className="w-full h-full glass bg-white dark:bg-slate-900 md:bg-white/90 md:dark:bg-slate-900/90 md:backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-800/50 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-fuchsia-100 to-purple-100 dark:from-fuchsia-900/40 dark:to-purple-900/40 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400 text-xs shadow-sm border border-fuchsia-200/50 dark:border-fuchsia-800/50">
                                <i className="fas fa-robot"></i>
                            </div>
                            <div>
                                <h3 className="font-black text-slate-800 dark:text-white text-sm">Lucid Aura</h3>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">AI Assistant • Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClearChat}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                title="Clear Chat"
                            >
                                <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3.5 rounded-[1.5rem] text-sm font-semibold leading-relaxed shadow-sm
                                    ${msg.sender === 'user'
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none shadow-indigo-500/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-none'}
                                `}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-100 dark:border-slate-700 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a command..."
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 transition-all shadow-inner"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-md"
                            >
                                <i className="fas fa-paper-plane text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
