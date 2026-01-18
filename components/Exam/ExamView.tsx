
import { useState, useEffect, useMemo } from 'react';
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
    };
    onDatesAvailable?: (dates: string[]) => void;
    availableDates?: string[];
}

interface ExamFile {
    id: string;
    name: string;
}

export default function ExamView({ view, onViewChange, filters, onDatesAvailable }: ExamViewProps) {
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

    // Debounce Search Inputs from Props
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchName(filters.studentSearch || '');
            setDebouncedSearchRoom(filters.roomNumber || '');
        }, 300);
        return () => clearTimeout(timer);
    }, [filters.studentSearch, filters.roomNumber]);

    // Fetch Seating Plan
    const fetchSeating = (fileId?: string) => {
        setLoading(true);
        setError(null);
        const url = `/api/exam?type=seating${fileId ? `&fileId=${fileId}` : ''}&_t=${Date.now()}`;

        fetch(url)
            .then(res => res.json())
            .then(res => {
                if (res.error) {
                    setError(res.error);
                } else if (res.data) {
                    setAllSeating(res.data);
                    setSeatingData(res.data);

                    if (res.files && res.files.length > 0) setAvailableFiles(res.files);
                    if (res.activeFileId) setActiveFileId(res.activeFileId);
                }
            })
            .catch(err => {
                console.error(err);
                setError('Network Error: Failed to load seating plan.');
            })
            .finally(() => setLoading(false));
    };

    // Initial Fetch (Once)
    useEffect(() => {
        if (view === 'seating' && allSeating.length === 0) {
            fetchSeating();
        }
    }, [view, allSeating.length]);

    // Handle File Switch
    const handleFileSwitch = (fileId: string) => {
        if (fileId === activeFileId) return;
        fetchSeating(fileId);
    };

    // Fetch Datesheet (Once)
    useEffect(() => {
        if (view === 'datesheet' && allDatesheet.length === 0) {
            setLoading(true);
            fetch('/api/exam?type=datesheet')
                .then(res => res.json())
                .then(res => {
                    if (res.data) {
                        setAllDatesheet(res.data);
                        setDatesheetData(res.data);

                        // Extract unique dates for Dropdown
                        const dates = Array.from(new Set(res.data.map((d: any) => d.date))).filter(Boolean) as string[];
                        dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                        if (onDatesAvailable) onDatesAvailable(dates);
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [view, allDatesheet.length, onDatesAvailable]);

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
            setSeatingData(filtered);

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
                        {view === 'datesheet' ? 'Official Final Term Schedule v6.0' : 'Find your exam venue and seat allocation instantly'}
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
