'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import LucidChat from '@/components/Chat/LucidChat';
import Footer from '@/components/Layout/Footer';
import ModeToggle from '@/components/Timetable/ModeToggle';
import FilterBar from '@/components/Timetable/FilterBar';
import DayView from '@/components/Timetable/DayView';
import WeekView from '@/components/Timetable/WeekView';
import TimetablePrintView from '@/components/Timetable/TimetablePrintView';
import ViewToggle from '@/components/Timetable/ViewToggle';
import ExamView from '@/components/Exam/ExamView';
import DatesheetDownloadModal from '@/components/Exam/DatesheetDownloadModal';
import SeatingPlanDownloadModal from '@/components/Exam/SeatingPlanDownloadModal';
import DeveloperDownloadModal from '@/components/UI/DeveloperDownloadModal';
import ChronicleExportModal from '@/components/UI/ChronicleExportModal';
import Toast from '@/components/UI/Toast';
import InfoModal from '@/components/UI/InfoModal';
import SettingsModal from '@/components/UI/SettingsModal';
import { useSettings } from '@/lib/settings';
import { ProcessedSlot, DAYS, processDayData } from '@/lib/parser';
import { checkAndSync, detectSheetChanges } from '@/lib/sync_service';
import CondensedWeekViewExport from '@/components/Timetable/CondensedWeekViewExport';



export default function Home() {
    const router = useRouter();
    const { settings, mounted } = useSettings();
    const [mode, setMode] = useState<'student' | 'teacher' | 'room' | 'exam'>('student');
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const [examView, setExamView] = useState<'datesheet' | 'seating'>('datesheet');
    const [view, setView] = useState<'day' | 'week'>('day');
    const [filters, setFilters] = useState({
        program: '',
        semester: '',
        section: '',
        day: '',
        teacherName: '',
        roomNumber: '',
        date: '',
        studentSearch: '',
        course: '' // Used for Exam Course Search AND Subject Mode
    });

    const [availableExamDates, setAvailableExamDates] = useState<string[]>([]);
    const [datesheetData, setDatesheetData] = useState<any[]>([]);
    const [seatingData, setSeatingData] = useState<any[]>([]);
    const [showDatesheetDownloadModal, setShowDatesheetDownloadModal] = useState(false);
    const [showSeatingPlanDownloadModal, setShowSeatingPlanDownloadModal] = useState(false);
    const handleDatesAvailable = useCallback((dates: string[]) => {
        setAvailableExamDates(dates);
    }, []);

    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [generatedAt, setGeneratedAt] = useState<string>('');

    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showDeveloperDownloadModal, setShowDeveloperDownloadModal] = useState(false);
    const [showChronicleExportModal, setShowChronicleExportModal] = useState(false);
    const [examRefreshTrigger, setExamRefreshTrigger] = useState(0);

    useEffect(() => {
        if (mounted && isInitialLoad) {
            setMode(settings.defaultMode as any);
            setIsInitialLoad(false);
        }
    }, [mounted, settings.defaultMode, isInitialLoad]);

    useEffect(() => {
        setGeneratedAt(new Date().toLocaleString());

        // Auto-open Info Modal for first-time users
        const hasSeenIntro = localStorage.getItem('lucid_intro_seen');
        if (!hasSeenIntro) {
            // Small delay to let the UI load and settle
            const timer = setTimeout(() => {
                setShowInfoModal(true);
                localStorage.setItem('lucid_intro_seen', 'true');
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    // Client-side cache to prevent refetching
    const responseCache = useRef<{ [key: string]: any }>({});

    const [isOnline, setIsOnline] = useState(true);

    // Online status detection
    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        const dayIndex = (new Date().getDay() + 6) % 7;
        setFilters(f => ({ ...f, day: DAYS[dayIndex] }));
    }, []);

    useEffect(() => {
        // Reset filters and restore preferences based on mode to PREVENT CLASHES
        setFilters(prev => {
            const resetFilters = {
                program: '',
                semester: '',
                section: '',
                day: prev.day || DAYS[(new Date().getDay() + 6) % 7],
                teacherName: '',
                roomNumber: '',
                date: '',
                studentSearch: '',
                course: ''
            };

            if (mode === 'student') {
                const stored = localStorage.getItem('lucid_student_prefs') || localStorage.getItem('lucid_timetable_preferences');
                if (stored) {
                    try {
                        const prefs = JSON.parse(stored);
                        return {
                            ...resetFilters,
                            program: prefs.program || '',
                            semester: prefs.semester || '',
                            section: prefs.section || ''
                        };
                    } catch (e) { console.error(e); }
                }
                return resetFilters;
            }

            else if (mode === 'teacher') {
                const stored = localStorage.getItem('lucid_teacher_prefs');
                if (stored) {
                    try {
                        const prefs = JSON.parse(stored);
                        return {
                            ...resetFilters,
                            teacherName: prefs.teacherName || ''
                        };
                    } catch (e) { console.error(e); }
                }
                return resetFilters;
            }

            else if (mode === 'room') {
                // Room prefs if any (currently none explicitly saved in savePreferences for room, but good practice to allow)
                return resetFilters;
            }

            else if (mode === 'exam') {
                // ... (exam logic unchanged)
                if (examView === 'datesheet') {
                    const stored = localStorage.getItem('lucid_exam_datesheet_prefs');
                    if (stored) {
                        try {
                            const prefs = JSON.parse(stored);
                            return {
                                ...resetFilters,
                                program: prefs.program || '',
                                semester: prefs.semester || '',
                                section: prefs.section || ''
                            };
                        } catch (e) { console.error(e); }
                    }
                }
                if (examView === 'seating') {
                    const stored = localStorage.getItem('lucid_exam_seating_prefs');
                    if (stored) {
                        try {
                            const prefs = JSON.parse(stored);
                            return {
                                ...resetFilters,
                                studentSearch: prefs.studentSearch || ''
                            };
                        } catch (e) { console.error(e); }
                    }
                }
                return resetFilters;
            }

            return resetFilters;
        });
    }, [mode, examView]);

    // Initial data restoration from LocalStorage and Sync trigger
    useEffect(() => {
        const initSync = async () => {
            try {
                // First, check if we have data in LocalStorage for instant render
                const localDataStr = localStorage.getItem('lucid_raw_sheet_data');
                if (localDataStr) {
                    try {
                        const localData = JSON.parse(localDataStr);
                        responseCache.current['full_data'] = localData;
                        fetchData(); // Trigger initial render with local data
                    } catch (e) {
                        console.error("Error parsing local data", e);
                    }
                }

                // Trigger sync (if first time or forced elsewhere)
                const freshData = await checkAndSync();
                if (freshData) {
                    responseCache.current['full_data'] = freshData;
                    fetchData(); // Re-render with fresh synced data
                }
            } catch (e) {
                console.error('Sync failed', e);
                if (!responseCache.current['full_data']) {
                    fetchData();
                }
            }
        };
        initSync();

        // --- ADAPTIVE HEARTBEAT LOGIC ---
        let timeoutId: NodeJS.Timeout;

        const getSyncInterval = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const currentTime = hours * 60 + minutes;

            // 7:30 AM = 7*60 + 30 = 450
            // 4:00 PM = 16*60 = 960
            const peakStart = 7 * 60 + 30;
            const peakEnd = 16 * 60;

            if (currentTime >= peakStart && currentTime <= peakEnd) {
                return 10000; // 10 seconds (Peak)
            }
            return 60000; // 60 seconds (Off-Peak)
        };

        const checkUpdates = async () => {
            console.log(`[Heartbeat] Checking updates. Interval: ${getSyncInterval() / 1000}s`);
            const changed = await detectSheetChanges();
            if (changed) {
                setToastMsg('Schedule updated! Refreshing...');
                const updatedData = await checkAndSync(true); // Force sync
                responseCache.current['full_data'] = updatedData;
                fetchData();
            }

            // Schedule next check with potentially new interval
            timeoutId = setTimeout(checkUpdates, getSyncInterval());
        };

        // Start the adaptive cycle
        timeoutId = setTimeout(checkUpdates, getSyncInterval());

        return () => clearTimeout(timeoutId);
    }, []);

    // --- FEATURE REDIRECTS ---
    useEffect(() => {
        if (!settings.enableCrucible && mode === 'exam') {
            setMode('student');
            setToastMsg('Crucible access is currently restricted.');
        }
        if (!settings.enableWeekView && view === 'week') {
            setView('day');
            setToastMsg('Week View is currently restricted.');
        }
    }, [settings.enableCrucible, settings.enableWeekView, mode, view]);

    const fetchData = useCallback(async () => {
        console.log(`FetchData TRIGGERED. Mode: ${mode}, View: ${view}`);
        console.log('Current Filters:', filters);

        if (mode === 'exam') {
            console.log("FetchData skipping: Exam mode");
            return;
        }
        const activeDay = view === 'week' ? 'all' : filters.day;
        if (!activeDay) {
            console.log("FetchData skipping: No active day");
            return;
        }

        // DEBUG LOGGING
        console.log(`FetchData PROCEEDING. Day: ${activeDay}`);

        // TRY LOCAL FILTERING WITH PERFECT PARITY (Using processDayData)
        const localRawData = responseCache.current['full_data'];

        // Only proceed with local filtering if we have the RAW data structure (dictionary of days)
        if (localRawData && typeof localRawData === 'object' && !Array.isArray(localRawData)) {
            console.log("Using local raw data cache.");
            try {
                if (view === 'week') {
                    const weekResult = DAYS.map(d => {
                        const dayValues = localRawData[d] || [];
                        return {
                            day: d,
                            slots: processDayData(dayValues, mode, filters)
                        };
                    });
                    setSlots(weekResult);
                    return;
                } else {
                    const dayValues = localRawData[filters.day] || [];
                    console.log(`Processing local data for day ${filters.day}. Row count: ${dayValues.length}`);
                    const dayResult = processDayData(dayValues, mode, filters);
                    console.log(`Processed result count: ${dayResult.length}`);
                    setSlots(dayResult);
                    return;
                }
            } catch (e) {
                console.error("Local filtering failed", e);
            }
        } else {
            console.log("No local raw data found. Falling back or waiting for sync.");
        }

        // FALLBACK TO API (Only if local data is missing - unlikely with sync)
        if (mode === 'student' && !filters.program && !filters.semester && !filters.section && !filters.course) {
            if (!localRawData) setSlots([]);
            return;
        }
        if (mode === 'teacher' && !filters.teacherName) return;
        if (mode === 'room' && !filters.roomNumber) return;

        // API Params construction (Fallback)
        const params = new URLSearchParams({
            day: activeDay,
            mode,
            ...(filters.program && { program: filters.program }),
            ...(filters.semester && { semester: filters.semester }),
            ...(filters.section && { section: filters.section }),
            ...(filters.teacherName && { teacherName: filters.teacherName }),
            ...(filters.roomNumber && { roomNumber: filters.roomNumber }),
            ...(filters.course && { subject: filters.course }), // subject param
        });

        // ... (fetch logic)
        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        try {
            const res = await fetch(`/api/timetable?${params}`, { signal: controller.signal });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setSlots(data.slots || []);
        } catch (err: any) {
            if (err.name === 'AbortError') setError('Request timed out. Please try again.');
            else setError('Failed to load data');
        } finally {
            clearTimeout(timeoutId);
            setLoading(false);
        }
    }, [mode, filters, view]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSetFilter = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const savePreferences = () => {
        if (mode === 'student') {
            localStorage.setItem('lucid_student_prefs', JSON.stringify({
                program: filters.program,
                semester: filters.semester,
                section: filters.section
            }));
            setToastMsg('Student preferences saved!');
        } else if (mode === 'teacher') {
            localStorage.setItem('lucid_teacher_prefs', JSON.stringify({
                teacherName: filters.teacherName
            }));
            setToastMsg('Teacher preferences saved!');
        } else if (mode === 'exam' && examView === 'datesheet') {
            // ... (exam prefs)
            localStorage.setItem('lucid_exam_datesheet_prefs', JSON.stringify({
                program: filters.program,
                semester: filters.semester,
                section: filters.section
            }));
            setToastMsg('Datesheet preferences saved!');
        } else if (mode === 'exam' && examView === 'seating') {
            localStorage.setItem('lucid_exam_seating_prefs', JSON.stringify({
                studentSearch: filters.studentSearch
            }));
            setToastMsg('Seating search preference saved!');
        }
    };

    const clearPreferences = () => {
        if (mode === 'student') {
            localStorage.removeItem('lucid_student_prefs');
            localStorage.removeItem('lucid_timetable_preferences');
            setFilters(prev => ({ ...prev, program: '', semester: '', section: '' }));
            setToastMsg('Student preferences cleared!');
        } else if (mode === 'teacher') {
            localStorage.removeItem('lucid_teacher_prefs');
            setFilters(prev => ({ ...prev, teacherName: '' }));
            setToastMsg('Teacher preferences cleared!');
        } else if (mode === 'exam' && examView === 'datesheet') {
            // ... (exam clear)
            localStorage.removeItem('lucid_exam_datesheet_prefs');
            setFilters(prev => ({ ...prev, program: '', semester: '', section: '' }));
            setToastMsg('Chronicle configuration cleared!');
        } else if (mode === 'exam' && examView === 'seating') {
            localStorage.removeItem('lucid_exam_seating_prefs');
            setFilters(prev => ({ ...prev, studentSearch: '' }));
            setToastMsg('Seating criteria cleared!');
        }
    };

    const handleDownload = async (isDevConfirmed: boolean = false, isExportConfirmed: boolean = false) => {
        if (mode === 'exam' && examView === 'datesheet') {
            setShowDatesheetDownloadModal(true);
            return;
        }

        if (view === 'week') {
            if (!isDevConfirmed) {
                setShowDeveloperDownloadModal(true);
                return;
            }
            if (!isExportConfirmed) {
                setShowChronicleExportModal(true);
                return;
            }
        }

        setToastMsg('Initiating Chronicle Export...');

        try {
            const { toPng } = await import('html-to-image');
            const element = document.getElementById('timetable-print-view');

            if (!element) {
                setToastMsg('Could not find printable view');
                return;
            }

            // Small delay to ensure render
            await new Promise(r => setTimeout(r, 100));

            // Generate Image using html-to-image
            const dataUrl = await toPng(element, {
                backgroundColor: '#ffffff',
                cacheBust: true,
                pixelRatio: 2,
                skipFonts: true, // Prevent CORS errors from external stylesheets
                filter: (node) => {
                    // Exclude any elements that might cause issues if needed
                    return true;
                }
            });

            // Create download link
            const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
            let filename = `Timetable-${filters.day}`;

            if (mode === 'student') {
                const prog = filters.program || 'Program';
                const sem = filters.semester || '';
                const sec = filters.section || '';
                filename = `Timetable-${prog}-${sem}${sec}-${filters.day}-${dateStr}`;
            } else if (mode === 'room') {
                filename = `Timetable-${filters.roomNumber || 'Room'}-${filters.day}-${dateStr}`;
            } else if (mode === 'teacher') {
                filename = `Timetable-${filters.teacherName || 'Teacher'}-${filters.day}-${dateStr}`;
            }

            // Cleanup any double dashes from empty selections
            filename = filename.replace(/--+/g, '-').replace(/-$/, '');

            const link = document.createElement('a');
            link.download = `${filename}.png`;
            link.href = dataUrl;
            link.click();

            setToastMsg('Chronicle Export Completed!');
        } catch (error) {
            console.error('Download failed:', error);
            setToastMsg('Export process encountered an interference.');
        } finally {
            setLoading(false);
        }
    };

    // Swipe Handler
    const touchStart = useRef<number | null>(null);
    const touchEnd = useRef<number | null>(null);
    const touchStartY = useRef<number | null>(null);
    const touchEndY = useRef<number | null>(null);
    const minSwipeDistance = 100; // Increased threshold to avoid accidental swipes



    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (view !== 'day') return;
            if (mode === 'exam') return;

            const currentIdx = DAYS.indexOf(filters.day);
            if (currentIdx === -1) return;

            if (e.key === 'ArrowLeft') {
                const newIdx = (currentIdx - 1 + DAYS.length) % DAYS.length;
                setFilters(prev => ({ ...prev, day: DAYS[newIdx] }));
                setToastMsg(`Switched to ${DAYS[newIdx]}`);
            } else if (e.key === 'ArrowRight') {
                const newIdx = (currentIdx + 1) % DAYS.length;
                setFilters(prev => ({ ...prev, day: DAYS[newIdx] }));
                setToastMsg(`Switched to ${DAYS[newIdx]}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [view, filters.day, mode]);

    const onTouchStart = (e: React.TouchEvent) => {
        if (mode === 'exam') return;
        touchEnd.current = null;
        touchEndY.current = null;
        touchStart.current = e.targetTouches[0].clientX;
        touchStartY.current = e.targetTouches[0].clientY;
    };

    const onTouchMove = (e: React.TouchEvent) => {
        touchEnd.current = e.targetTouches[0].clientX;
        touchEndY.current = e.targetTouches[0].clientY;
    };

    const onTouchEnd = () => {
        if (!touchStart.current || !touchEnd.current) return;

        const distanceX = touchStart.current - touchEnd.current;

        // Vertical scroll check (if we have Y data)
        if (touchStartY.current !== null && touchEndY.current !== null) {
            const distanceY = touchStartY.current - touchEndY.current;
            // If vertical movement is greater than horizontal, assume scrolling -> ignore swipe
            if (Math.abs(distanceY) > Math.abs(distanceX)) return;
        }

        const isLeftSwipe = distanceX > minSwipeDistance;
        const isRightSwipe = distanceX < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            if (view === 'day') {
                const currentIdx = DAYS.indexOf(filters.day);
                if (currentIdx === -1) return;

                let newIdx = currentIdx;
                if (isLeftSwipe) {
                    newIdx = (currentIdx + 1) % DAYS.length; // Next Day
                } else {
                    newIdx = (currentIdx - 1 + DAYS.length) % DAYS.length; // Prev Day
                }

                const newDay = DAYS[newIdx];
                setFilters(prev => ({ ...prev, day: newDay }));
                setToastMsg(`Switched to ${newDay}`);
            }
        }
    };

    // --- LUCID CHAT HANDLER ---
    const handleChatAction = useCallback((result: any) => {
        console.log("Chat Action:", result);
        const { intent, entities } = result;

        // 1. SET STUDENT PROFILE (New Intent)
        if (intent === 'set_profile' || (intent === 'filter_mode' && (entities.program || entities.semester || entities.section))) {
            const nextProgram = entities.program || filters.program;
            const nextSemester = entities.semester || filters.semester;
            const nextSection = entities.section || ''; // Default to All Sections for profile set

            setMode('student');
            setFilters(prev => ({
                ...prev,
                program: nextProgram,
                semester: nextSemester,
                section: nextSection
            }));

            // Auto-save preferences logic (Replicated from savePreferences)
            // Save IMMEDIATELY so the mode-change useEffect picks up the new values
            const newPrefs = {
                program: nextProgram,
                semester: nextSemester,
                section: nextSection
            };
            localStorage.setItem('lucid_student_prefs', JSON.stringify(newPrefs));

            setToastMsg(`Profile set to ${nextProgram} ${nextSemester} ${nextSection || 'All Sections'}`);
            return;
        }

        // 2. MODE SWITCHING
        if (intent === 'filter_mode' && entities.mode) {
            if (entities.mode === 'student') setMode('student');
            if (entities.mode === 'teacher') setMode('teacher');
            if (entities.mode === 'room') setMode('room');
            if (entities.mode === 'subject') setMode('subject' as any); // If we add subject mode later
            setToastMsg(`Switched to ${entities.mode} mode`);
        }

        // 3. VIEW SWITCHING (Week vs Day)
        if (intent === 'change_view' || entities.view) {
            if (entities.view === 'week') setView('week');
            if (entities.view === 'day') setView('day');
            // If it was just a view change, we don't necessarily need to toast if engine response is clear
            // But a toast confirms the action visually
            setToastMsg(`Switched to ${entities.view} view`);
        }

        // 3. DAY FILTERING
        if (entities.day) {
            const capitalizedDay = entities.day.charAt(0).toUpperCase() + entities.day.slice(1);
            if (DAYS.includes(capitalizedDay)) {
                setFilters(prev => ({ ...prev, day: capitalizedDay }));
                setToastMsg(`Switched to ${capitalizedDay}`);
            }
        }

        // 4. SEARCH & QUERIES
        if (entities.query && entities.query !== 'CLEAR_ALL') {
            // Smart mapping based on current mode or if mode was just switched
            // Fix: Calculate target mode upfront to avoid race condition
            let targetMode = entities.mode || mode;
            if (entities.feature === 'seating' || entities.feature === 'datesheet') targetMode = 'exam';

            // Heuristic: If query contains digits, it might be a room (e.g. 202) -> Room Mode
            // If query starts with 'sir' or 'mam' -> Teacher Mode (handled in engine usually, but safety net here)
            // For now, let's trust the engine's 'mode' entity if present.

            if (targetMode === 'teacher') {
                const applyTeacherSearch = () => {
                    setFilters(prev => ({ ...prev, teacherName: entities.query }));
                    setToastMsg(`Searching Teacher: ${entities.query}`);
                };

                if (mode !== 'teacher') {
                    setMode('teacher');
                    setTimeout(applyTeacherSearch, 800);
                } else {
                    applyTeacherSearch();
                }
            }
            else if (targetMode === 'room') {
                const applyRoomSearch = () => {
                    setFilters(prev => ({ ...prev, roomNumber: entities.query }));
                    setToastMsg(`Searching Room: ${entities.query}`);
                };

                if (mode !== 'room') {
                    setMode('room');
                    setTimeout(applyRoomSearch, 800);
                } else {
                    applyRoomSearch();
                }
            }
            // Logic for Exam (Seating or Datesheet) Search
            else if (targetMode === 'exam' || ((mode === 'exam' || targetMode === 'exam_guest') && (examView === 'seating' || examView === 'datesheet'))) {
                const isDatesheet = entities.feature === 'datesheet' || (examView === 'datesheet' && !entities.feature);

                const applySearch = () => {
                    if (isDatesheet) {
                        setFilters(prev => ({ ...prev, course: entities.query }));
                        setToastMsg(`Searching Datesheet for: ${entities.query}`);
                    } else {
                        setFilters(prev => ({ ...prev, studentSearch: entities.query }));
                        setToastMsg(`Searching Student: ${entities.query}`);
                    }
                };

                const targetView = isDatesheet ? 'datesheet' : 'seating';

                if (mode !== 'exam' || examView !== targetView) {
                    if (mode !== 'exam') setMode('exam');
                    setExamView(targetView);
                    // Add delay to allow view to load and bypass mode-reset effects
                    setTimeout(applySearch, isDatesheet ? 500 : 1000);
                } else {
                    applySearch();
                }
            }
            else {
                // Default fallback if no specific mode inferred? 
                // Maybe assume teacher if query looks like name, or room if digits..
            }
        }

        // 5. ACTION: CLEAR
        if (entities.query === 'CLEAR_ALL') {
            clearPreferences();
        }

        // 6. NAVIGATION / FEATURES
        if (entities.feature) {
            if (entities.feature === 'events') router.push('/events');
            if (entities.feature === 'about') setShowInfoModal(true);
            if (entities.feature === 'datesheet') {
                setMode('exam');
                setExamView('datesheet');
            }
            if (entities.feature === 'seating') {
                setMode('exam');
                setExamView('seating');
            }
            if (entities.feature === 'gpa') router.push('/gpa');
        }
        // --- LUCID CHAT HANDLER ---
    }, [mode, router, filters]);

    // LISTEN FOR GLOBAL CHAT EVENTS
    useEffect(() => {
        const handleEvent = (e: CustomEvent) => handleChatAction(e.detail);
        window.addEventListener('lucid-chat-action', handleEvent as EventListener);
        return () => window.removeEventListener('lucid-chat-action', handleEvent as EventListener);
    }, [handleChatAction]);

    return (
        <div className="min-h-screen pb-10">
            <div className="print:hidden">
                <Navbar />

                <div className="container mx-auto px-4 pt-28 max-w-5xl">

                    {/* View Toggle matching screenshot */}
                    {mode !== 'exam' && settings.enableWeekView && (
                        <div className="animate-fade-in-up animation-delay-100">
                            <ViewToggle view={view} setView={setView} />
                        </div>
                    )}

                    <div className="animate-fade-in-up animation-delay-200">
                        <ModeToggle mode={mode} setMode={setMode} />
                    </div>

                    <div className="animate-fade-in-up animation-delay-300 relative z-50">
                        <FilterBar
                            mode={mode}
                            examView={examView}
                            filters={filters}
                            setFilter={handleSetFilter}
                            onSave={savePreferences}
                            onClear={clearPreferences}
                            availableDates={availableExamDates}
                        />
                    </div>

                    <div
                        className="mt-10 relative z-0 touch-pan-y animate-fade-in-up animation-delay-500"
                        onTouchStart={mode === 'exam' ? undefined : onTouchStart}
                        onTouchMove={mode === 'exam' ? undefined : onTouchMove}
                        onTouchEnd={mode === 'exam' ? undefined : onTouchEnd}
                    >
                        {mode === 'exam' ? (
                            <ExamView
                                view={examView}
                                onViewChange={setExamView}
                                filters={filters}
                                onDatesAvailable={handleDatesAvailable}
                                onDatesheetLoaded={setDatesheetData} // NEW
                                onSeatingLoaded={setSeatingData} // NEW
                                availableDates={availableExamDates}
                                refreshTrigger={examRefreshTrigger}
                            />
                        ) : view === 'day' ? (
                            <DayView slots={slots as ProcessedSlot[]} loading={loading} error={error} day={filters.day} />
                        ) : (
                            <div id="timetable-print-view" className="w-full overflow-x-auto">
                                <WeekView data={slots} loading={loading} error={error} />
                            </div>
                        )}
                    </div>

                    <Footer />

                    <DeveloperDownloadModal
                        isOpen={showDeveloperDownloadModal}
                        onClose={() => setShowDeveloperDownloadModal(false)}
                        onProceed={() => handleDownload(true)}
                    />

                    <ChronicleExportModal
                        isOpen={showChronicleExportModal}
                        onClose={() => setShowChronicleExportModal(false)}
                        onExport={() => {
                            setShowChronicleExportModal(false);
                            handleDownload(true, true);
                        }}
                        dayCount={view === 'week' ? slots.filter((d: any) => d.slots && d.slots.some((s: any) => s.entries && s.entries.length > 0)).length : 0}
                    />

                    {/* Hidden Export Component */}
                    <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                        {view === 'week' ? (
                            <CondensedWeekViewExport
                                data={slots}
                                mode={mode === 'exam' ? 'student' : mode as 'student' | 'teacher' | 'room'}
                                filters={filters}
                                generatedAt={new Date().toLocaleString()}
                            />
                        ) : (
                            <TimetablePrintView
                                slots={slots}
                                day={filters.day}
                                room={filters.roomNumber}
                                mode={mode === 'exam' ? 'student' : mode as 'student' | 'teacher' | 'room'}
                                filters={filters}
                                generatedAt={new Date().toLocaleString()}
                            />
                        )}
                    </div>
                </div>

                {/* Floating Action Buttons */}
                {/* Floating Action Buttons Menu */}
                <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50 animate-scale-in animation-delay-700 pointer-events-none">

                    {/* Menu Items (Only visible when expanded) */}
                    <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${isFabExpanded ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-90 pointer-events-none absolute bottom-16'}`}>

                        {/* Status Pill */}
                        {settings.enableOnlineIndicator && (
                            <div className="px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-black/5 dark:shadow-indigo-500/20 flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 backdrop-blur-md">
                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
                                {isOnline ? 'Online' : 'Offline'}
                            </div>
                        )}

                        {/* Refresh */}
                        <button
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    if (mode === 'exam') {
                                        setExamRefreshTrigger(prev => prev + 1);
                                        setToastMsg('Exam data refreshing...');
                                    } else {
                                        setLoading(true);
                                        // Timetable Refresh
                                        const updated = await checkAndSync(true);
                                        responseCache.current['full_data'] = updated;
                                        fetchData();
                                        setToastMsg('Schedule updated manually!');
                                    }
                                } catch (e) {
                                    setToastMsg('Manual update failed');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="w-12 h-12 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-lg shadow-indigo-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-indigo-100 dark:border-slate-700"
                            title="Refresh Data"
                        >
                            <i className="fas fa-sync-alt"></i>
                        </button>

                        {/* AI Chat Bot (NEW) */}
                        {settings.enableAuraAI && (
                            <button
                                onClick={() => {
                                    // Robust activation using the global fallback
                                    if (typeof window !== 'undefined') {
                                        if ((window as any).LucidChatToggle) {
                                            (window as any).LucidChatToggle();
                                        } else {
                                            // Final fallback: Event
                                            window.dispatchEvent(new CustomEvent('lucid-chat-toggle'));
                                        }
                                    }
                                    setIsFabExpanded(false);
                                }}
                                className="w-12 h-12 bg-white dark:bg-slate-800 text-fuchsia-600 dark:text-fuchsia-400 rounded-full shadow-lg shadow-fuchsia-500/10 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-fuchsia-100 dark:border-slate-700"
                                title="AI Assistant"
                            >
                                <i className="fas fa-robot"></i>
                            </button>
                        )}

                        {/* Download */}
                        <button
                            onClick={() => {
                                if (mode === 'exam') {
                                    if (examView === 'datesheet') setShowDatesheetDownloadModal(true);
                                    else setShowSeatingPlanDownloadModal(true);
                                } else {
                                    handleDownload(); // Timetable Download
                                }
                            }}
                            className="w-12 h-12 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-purple-100 dark:border-slate-700"
                            title="Download Timetable"
                        >
                            <i className="fas fa-download"></i>
                        </button>

                        {/* Info Button (NEW) */}
                        {settings.enableAppInfo && (
                            <button
                                onClick={() => { setShowInfoModal(true); setIsFabExpanded(false); }}
                                className="w-12 h-12 bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-blue-100 dark:border-slate-700"
                                title="App Info"
                            >
                                <i className="fas fa-info"></i>
                            </button>
                        )}

                        {/* Settings Button */}
                        <button
                            onClick={() => { setShowSettingsModal(true); setIsFabExpanded(false); }}
                            className="w-12 h-12 bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 rounded-full shadow-lg shadow-teal-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-teal-100 dark:border-slate-700"
                            title="Settings"
                        >
                            <i className="fas fa-cog"></i>
                        </button>

                    </div>

                    {/* Main Toggle Button */}
                    <button
                        onClick={() => setIsFabExpanded(!isFabExpanded)}
                        className={`w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 pointer-events-auto relative z-50`}
                    >
                        <i className={`fas fa-chevron-up text-xl transition-transform duration-300 ${isFabExpanded ? 'rotate-180' : ''}`}></i>
                    </button>
                </div>

                <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
                <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

                <DatesheetDownloadModal
                    isOpen={showDatesheetDownloadModal}
                    onClose={() => setShowDatesheetDownloadModal(false)}
                    data={datesheetData}
                    filters={filters}
                    onToast={setToastMsg}
                />

                {/* NEW: Seating Plan Download Modal */}
                <SeatingPlanDownloadModal
                    isOpen={showSeatingPlanDownloadModal}
                    onClose={() => setShowSeatingPlanDownloadModal(false)}
                    data={seatingData}
                    filters={filters}
                    onToast={setToastMsg}
                />

                {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
            </div>

            {/* Print View (Hidden standardly, visible for capture) */}
            {mode !== 'exam' && (
                <div style={{ position: 'fixed', left: '-9999px', top: 0, opacity: 0, pointerEvents: 'none' }}>
                    <TimetablePrintView
                        slots={slots as ProcessedSlot[]}
                        day={filters.day}
                        mode={mode}
                        room={mode === 'room' ? filters.roomNumber : undefined}
                        filters={filters}
                        generatedAt={generatedAt}
                    />
                </div>
            )}
        </div>
    );
}
