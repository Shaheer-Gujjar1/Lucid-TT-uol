
import { useState, useEffect, useMemo, useRef } from 'react';
import Datesheet from './Datesheet';
import SeatingPlan from './SeatingPlan';
import { DatesheetEntry, SeatingPlanEntry } from '@/lib/exam_utils';

interface ExamViewProps {
    view: 'datesheet' | 'seating';
    onViewChange: (view: 'datesheet' | 'seating') => void;
    filters: {
        program: string;
        semester: string;
        section: string;
        roomNumber: string;
        date?: string;
        studentSearch?: string;
        course?: string;
    };
    onDatesAvailable?: (dates: string[]) => void;
    onDatesheetLoaded?: (data: DatesheetEntry[]) => void; // NEW
    onSeatingLoaded?: (data: SeatingPlanEntry[]) => void; // NEW
    availableDates?: string[];
    refreshTrigger?: number;
}

interface ExamFile {
    id: string;
    name: string;
}

export default function ExamView({ view, onViewChange, filters, onDatesAvailable, onDatesheetLoaded, onSeatingLoaded, refreshTrigger = 0 }: ExamViewProps) {
    const [datesheetData, setDatesheetData] = useState<DatesheetEntry[]>([]);
    const [seatingData, setSeatingData] = useState<SeatingPlanEntry[]>([]);

    // Store full data for client-side filtering
    const [allSeating, setAllSeating] = useState<SeatingPlanEntry[]>([]);
    const [allDatesheet, setAllDatesheet] = useState<DatesheetEntry[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Multi-File State
    const [availableFiles, setAvailableFiles] = useState<ExamFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string | null>(null);

    // Internal State for Debounced Values
    const [debouncedSearchName, setDebouncedSearchName] = useState('');
    const [debouncedSearchRoom, setDebouncedSearchRoom] = useState('');

    // Track if we've already handled the current refresh trigger
    const lastHandledRefresh = useRef(0);

    // Debounce Search Inputs from Props
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchName(filters.studentSearch || '');
            setDebouncedSearchRoom(filters.roomNumber || '');
        }, 300);
        return () => clearTimeout(timer);
    }, [filters.studentSearch, filters.roomNumber]);

    // Load from LocalStorage on mount
    useEffect(() => {
        try {
            const cachedDatesheet = localStorage.getItem('lucid_exam_datesheet_cache');
            if (cachedDatesheet) {
                const data = JSON.parse(cachedDatesheet);
                setAllDatesheet(data);
                setDatesheetData(data);

                // Propagate dates to parent even from cache
                const dates = Array.from(new Set(data.map((d: any) => d.date))).filter(Boolean) as string[];
                dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                if (onDatesAvailable) onDatesAvailable(dates);
                if (onDatesheetLoaded) onDatesheetLoaded(data); // NEW
            }

            const cachedSeating = localStorage.getItem('lucid_exam_seating_cache');
            if (cachedSeating) {
                const data = JSON.parse(cachedSeating);
                setAllSeating(data);
                setSeatingData(data);
            }

            // Load File List Cache
            const cachedFiles = localStorage.getItem('lucid_exam_files_cache');
            if (cachedFiles) {
                try {
                    const files = JSON.parse(cachedFiles);
                    if (files && files.length > 0) setAvailableFiles(files);
                } catch (e) { console.error('Error parsing file cache', e); }
            }
        } catch (e) {
            console.error('Error loading exam cache', e);
        }
    }, []);

    // Fetch Seating Plan
    const fetchSeating = (fileId?: string, forceRefresh: boolean = false) => {
        setLoading(true);
        setError(null);
        // Cache busting and explicit refresh param
        const url = `/api/exam?type=seating${fileId ? `&fileId=${fileId}` : ''}${forceRefresh ? '&refresh=true' : ''}&_t=${Date.now()}`;

        fetch(url)
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    setError(res.error);
                } else if (res.data) {
                    setAllSeating(res.data);
                    setSeatingData(res.data);

                    // Persist to local storage
                    localStorage.setItem('lucid_exam_seating_cache', JSON.stringify(res.data));

                    if (res.files && res.files.length > 0) {
                        // Protective Check: If we are fetching a specific fileId, and the response only contains 1 file,
                        // and we previously had more than 1 file, assume it's an API echo and DO NOT overwrite our full list.
                        const isSuspiciousEcho = fileId && res.files.length === 1 && availableFiles.length > 1;

                        if (!isSuspiciousEcho) {
                            setAvailableFiles(res.files);
                            // Persist File List
                            localStorage.setItem('lucid_exam_files_cache', JSON.stringify(res.files));
                        }
                    }
                    if (res.activeFileId) setActiveFileId(res.activeFileId);
                }
            })
            .catch(err => {
                console.error(err);
                setError('Network Error: Failed to load seating plan.');
            })
            .finally(() => setLoading(false));
    };

    // Initial Fetch (If no cache) or Force Refresh
    useEffect(() => {
        const isInitial = allSeating.length === 0;
        const isNewRefresh = refreshTrigger > lastHandledRefresh.current;
        // Recovery: If we have data but no file list (e.g. bad cache), fetch again to populate selector
        const isMissingFiles = allSeating.length > 0 && availableFiles.length === 0;

        if (view === 'seating' && (isInitial || isNewRefresh || isMissingFiles)) {
            if (isNewRefresh) lastHandledRefresh.current = refreshTrigger;
            fetchSeating(activeFileId || undefined, isNewRefresh);
        }
    }, [view, refreshTrigger, allSeating.length, availableFiles.length]); // Keep length to handle initial load vs empty state

    // Handle File Switch
    const handleFileSwitch = (fileId: string) => {
        if (fileId === activeFileId) return;
        fetchSeating(fileId);
    };

    // Fetch Datesheet (If no cache) or Force Refresh
    useEffect(() => {
        const isInitial = allDatesheet.length === 0;
        const isNewRefresh = refreshTrigger > lastHandledRefresh.current;

        if (view === 'datesheet' && (isInitial || isNewRefresh)) {
            if (isNewRefresh) lastHandledRefresh.current = refreshTrigger;
            setLoading(true);
            fetch(`/api/exam?type=datesheet&_t=${Date.now()}`)
                .then(res => res.json())
                .then(res => {
                    if (res.data) {
                        setAllDatesheet(res.data);
                        setDatesheetData(res.data);

                        // Persist to local storage
                        localStorage.setItem('lucid_exam_datesheet_cache', JSON.stringify(res.data));

                        // Extract unique dates for Dropdown
                        const dates = Array.from(new Set(res.data.map((d: any) => d.date))).filter(Boolean) as string[];
                        dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                        dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
                        if (onDatesAvailable) onDatesAvailable(dates);
                        if (onDatesAvailable) onDatesAvailable(dates);
                        // Do NOT pass full data here, wait for the effect that updates 'datesheetData' state
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [view, refreshTrigger, onDatesAvailable]);

    // Efficient Memoized Filter logic
    useEffect(() => {
        if (view === 'seating') {
            // Filter Seating
            let filtered = allSeating;

            if (debouncedSearchRoom) {
                const term = debouncedSearchRoom.toLowerCase();
                filtered = filtered.filter(s => s.room.toLowerCase().includes(term));
            }

            if (debouncedSearchName) {
                const term = debouncedSearchName.toLowerCase();
                filtered = filtered.filter(s =>
                    s.studentName.toLowerCase().includes(term) ||
                    s.studentId.toLowerCase().includes(term)
                );
            }

            // New Filters (Course, Program, Semester, Section)
            if (filters.course) {
                const term = filters.course.toLowerCase();
                filtered = filtered.filter(s => s.courseTitle.toLowerCase().includes(term));
            }

            if (filters.program) {
                const term = filters.program.toUpperCase();
                filtered = filtered.filter(s => s.studentClass && s.studentClass.toUpperCase().startsWith(term));
            }

            if (filters.semester) {
                filtered = filtered.filter(s => s.studentClass && s.studentClass.includes(filters.semester));
            }

            if (filters.section) {
                const sec = filters.section.toUpperCase();
                filtered = filtered.filter(s => s.studentClass && s.studentClass.endsWith(sec));
            }
            setSeatingData(filtered);
            if (onSeatingLoaded) onSeatingLoaded(filtered); // NEW

        } else {
            // Filter Datesheet
            let filtered = allDatesheet;
            if (filters.program) {
                const term = filters.program.toLowerCase();
                filtered = filtered.filter(d => d.program.toLowerCase().includes(term) || d.courseCode.toLowerCase().includes(term));
            }
            if (filters.semester) filtered = filtered.filter(d => d.semester === filters.semester);
            if (filters.section) filtered = filtered.filter(d => d.section === filters.section);
            if (filters.date) filtered = filtered.filter(d => d.date === filters.date);

            setDatesheetData(filtered);
            if (onDatesheetLoaded) onDatesheetLoaded(filtered); // Correctly pass filtered data
        }
    }, [view, allSeating, allDatesheet, debouncedSearchName, debouncedSearchRoom, filters]);


    return (
        <div className="animate-fade-in-up">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r shadow-sm flex items-center gap-4 animate-shake">
                    <div className="text-2xl"><i className="fas fa-file-excel"></i></div>
                    <div>
                        <h3 className="font-bold">Cannot Load Seating Plan</h3>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Header and Toggle */}
            <div className={`mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 ${view === 'seating' && availableFiles.length > 1 ? 'md:items-start' : ''}`}>
                <div>
                    <h2 className="text-4xl font-black text-slate-800 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                        <i className={`fas ${view === 'datesheet' ? 'fa-calendar-alt text-indigo-500' : 'fa-chair text-purple-500'}`}></i>
                        {view === 'datesheet' ? 'Exam Datesheet' : 'Seating Plan'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm ml-1 max-w-md">
                        {view === 'datesheet' ? 'Official Academic Examination Schedule' : 'Find your exam venue and seat allocation instantly'}
                    </p>
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto items-stretch md:items-end">
                    {/* Main View Toggle */}
                    <div className="self-center md:self-end bg-white md:bg-white/80 dark:bg-slate-900 md:dark:bg-slate-900/80 backdrop-blur-none md:backdrop-blur-md rounded-full p-1.5 w-full md:w-auto shadow-sm md:shadow-[0_8px_32px_rgba(0,0,0,0.06)] border border-white/40 dark:border-slate-800/50 relative isolate sm:max-w-xs transition-all duration-300">
                        <div className="grid grid-cols-2 relative h-full">
                            {/* Sliding Pill */}
                            <div
                                className={`absolute top-0 bottom-0 w-[50%] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-md shadow-indigo-500/30 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] -z-10
                                ${view === 'datesheet' ? 'left-0' : 'left-[50%]'}
                                `}
                            />

                            <button
                                onClick={() => onViewChange('datesheet')}
                                className={`py-3 px-6 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${view === 'datesheet' ? 'text-white' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                            >
                                <i className="fas fa-calendar-alt text-sm"></i>
                                <span>Datesheet</span>
                            </button>
                            <button
                                onClick={() => onViewChange('seating')}
                                className={`py-3 px-6 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-colors duration-300 flex items-center justify-center gap-2 transform active:scale-95 ${view === 'seating' ? 'text-white' : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                            >
                                <i className="fas fa-chair text-sm"></i>
                                <span>Seating</span>
                            </button>
                        </div>
                    </div>

                    {/* Multi-File Seating Selector */}
                    {view === 'seating' && availableFiles.length > 1 && (
                        <div className="animate-fade-in-down self-center md:self-end bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-1.5 flex flex-wrap justify-center gap-1 border border-slate-200 dark:border-slate-700/50 shadow-inner">
                            {availableFiles.map(file => (
                                <button
                                    key={file.id}
                                    onClick={() => handleFileSwitch(file.id)}
                                    className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all duration-300 flex items-center gap-2 ${activeFileId === file.id
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm scale-100 ring-1 ring-indigo-100 dark:ring-slate-600'
                                        : 'text-slate-400 dark:text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-slate-600 dark:hover:text-slate-300'
                                        }`}
                                >
                                    <i className={`fas ${activeFileId === file.id ? 'fa-file-pdf' : 'fa-file'} ${activeFileId === file.id ? 'animate-bounce-short' : ''}`}></i>
                                    {file.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {view === 'datesheet' ? (
                <Datesheet data={datesheetData} loading={loading} />
            ) : (
                <SeatingPlan data={seatingData} loading={loading} />
            )}
        </div>
    );
}
