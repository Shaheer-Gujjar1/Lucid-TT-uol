'use client';

import { useState, useEffect, useRef } from 'react';
import { GPAState, Semester, calculateCGPA } from '@/lib/gpa_utils';
import { saveGPAState, loadGPAState, clearGPAState } from '@/lib/db';
import SemesterCard from './SemesterCard';
import GPAStats from './GPAStats';
import InfoModal from '@/components/UI/InfoModal';
import Toast from '@/components/UI/Toast';
import GPAReportDownloadModal from './GPAReportDownloadModal';

const GPACalculator = () => {
    const [state, setState] = useState<GPAState>({
        previousCGPA: 0,
        previousCredits: 0,
        semesters: []
    });
    const [loading, setLoading] = useState(true);

    // FAB & Modal States
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [toastMsg, setToastMsg] = useState<string | null>(null);

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
        const load = async () => {
            const saved = await loadGPAState();
            if (saved) setState(saved);
            setLoading(false);
        };
        load();
    }, []);

    useEffect(() => {
        if (!loading) {
            saveGPAState(state);
        }
    }, [state, loading]);

    // History State for Undo/Redo
    const [history, setHistory] = useState<GPAState[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1); // Points to the current state in history

    const ignoreNextHistoryUpdate = useRef(false);

    // Filter out initial load to avoid empty history issues or double sets
    useEffect(() => {
        if (!loading && state.semesters.length > 0 && history.length === 0) {
            setHistory([state]);
            setHistoryIndex(0);
        }
    }, [loading, state]);

    // Undo/Redo Handlers
    const addToHistory = (newState: GPAState) => {
        const currentHistory = history.slice(0, historyIndex + 1);
        const newHistory = [...currentHistory, newState];

        // Limit history size to 50 steps to prevent memory bloat
        if (newHistory.length > 50) newHistory.shift();

        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setState(newState);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIndex = historyIndex - 1;
            setHistoryIndex(prevIndex);
            setState(history[prevIndex]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIndex = historyIndex + 1;
            setHistoryIndex(nextIndex);
            setState(history[nextIndex]);
        }
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    handleRedo();
                } else {
                    handleUndo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                e.preventDefault();
                handleRedo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history, historyIndex]);

    const { cgpa, totalCredits } = calculateCGPA(state.semesters, state.previousCGPA, state.previousCredits);

    const addSemester = () => {
        const newSemester: Semester = {
            id: crypto.randomUUID(),
            name: `Semester ${state.semesters.length + 1}`,
            subjects: []
        };
        const newState = { ...state, semesters: [...state.semesters, newSemester] };
        addToHistory(newState);
    };

    const updateSemester = (id: string, updated: Semester) => {
        const newState = {
            ...state,
            semesters: state.semesters.map(s => s.id === id ? updated : s)
        };
        addToHistory(newState);
    };

    const deleteSemester = (id: string) => {
        const newState = {
            ...state,
            semesters: state.semesters.filter(s => s.id !== id)
        };
        addToHistory(newState);
    };

    const handleReset = async () => {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            await clearGPAState();
            const newState = { previousCGPA: 0, previousCredits: 0, semesters: [] };
            addToHistory(newState);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Loading your data...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Extended Header Layout (Restored) */}
            <div className="animate-fade-in-up">
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/30 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        {/* Welcome / Intro Section */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">GPA Calculator</h1>
                            <p className="text-indigo-200 font-medium max-w-md">Track your academic progress with precision. Add semesters below to get started.</p>
                        </div>

                        {/* Previous/History Section */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 w-full md:w-auto min-w-[300px]">
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center justify-center md:justify-start gap-2">
                                <i className="fas fa-history text-indigo-300"></i> Previous History
                            </h3>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold block mb-1.5 opacity-80">Prev CGPA</label>
                                    <input
                                        type="number"
                                        value={state.previousCGPA || ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const newState = { ...state, previousCGPA: val };
                                            // We don't want to spam history for every keystroke, so we just set state here directly
                                            // Ideally we should debounce this for history, but for now direct update is fine for inputs
                                            setState(newState);
                                        }}
                                        onBlur={() => addToHistory(state)} // Commit to history on blur
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 font-bold focus:outline-none focus:bg-black/30 transition-all text-center"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] uppercase tracking-wider text-indigo-200 font-bold block mb-1.5 opacity-80">Prev Credits</label>
                                    <input
                                        type="number"
                                        value={state.previousCredits || ''}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const newState = { ...state, previousCredits: val };
                                            setState(newState);
                                        }}
                                        onBlur={() => addToHistory(state)} // Commit on blur
                                        className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder:text-white/30 font-bold focus:outline-none focus:bg-black/30 transition-all text-center"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="animate-fade-in-up">
                <div className="flex justify-between items-center mb-6 px-2">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                        <i className="fas fa-layer-group text-indigo-500"></i>
                        Semesters
                    </h2>

                    <div className="flex items-center gap-3">
                        {/* Undo / Redo Buttons */}
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mr-2">
                            <button
                                onClick={handleUndo}
                                disabled={historyIndex <= 0}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${historyIndex > 0 ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                                title="Undo (Ctrl+Z)"
                            >
                                <i className="fas fa-undo text-xs"></i>
                            </button>
                            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>
                            <button
                                onClick={handleRedo}
                                disabled={historyIndex >= history.length - 1}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${historyIndex < history.length - 1 ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-500' : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'}`}
                                title="Redo (Ctrl+Y)"
                            >
                                <i className="fas fa-redo text-xs"></i>
                            </button>
                        </div>

                        <button
                            onClick={handleReset}
                            className="text-red-400 hover:text-red-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <i className="fas fa-trash-can"></i> Reset
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {state.semesters.map((semester, index) => (
                        <SemesterCard
                            key={semester.id}
                            semester={semester}
                            onUpdate={updateSemester}
                            onDelete={deleteSemester}
                            index={index}
                        />
                    ))}

                    {/* Add Semester Button */}
                    <button
                        onClick={addSemester}
                        className="min-h-[200px] border-3 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-indigo-500 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all group animate-fade-in-up"
                        style={{ animationDelay: `${Math.min(state.semesters.length * 150, 1500)}ms` }}
                    >
                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
                            <i className="fas fa-plus"></i>
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">Add Semester</span>
                    </button>
                </div>
            </div>

            {/* Circular Floating Widget */}
            <GPAStats
                cgpa={cgpa}
                totalCredits={totalCredits}
                semesters={state.semesters}
                previousCGPA={state.previousCGPA}
            />

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50 animate-scale-in">

                {/* Menu Items */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${isFabExpanded ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-90 pointer-events-none absolute bottom-16'}`}>

                    {/* Status Pill */}
                    <div className="px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-black/5 dark:shadow-indigo-500/20 flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 backdrop-blur-md">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
                        {isOnline ? 'Online' : 'Offline'}
                    </div>

                    {/* Download */}
                    <button
                        onClick={() => { setShowDownloadModal(true); setIsFabExpanded(false); }}
                        className="w-12 h-12 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-purple-100 dark:border-slate-700"
                        title="Download Report"
                    >
                        <i className="fas fa-download"></i>
                    </button>

                    {/* Info Button */}
                    <button
                        onClick={() => { setShowInfoModal(true); setIsFabExpanded(false); }}
                        className="w-12 h-12 bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-blue-100 dark:border-slate-700"
                        title="App Info"
                    >
                        <i className="fas fa-info"></i>
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

            <GPAReportDownloadModal
                isOpen={showDownloadModal}
                onClose={() => setShowDownloadModal(false)}
                semesters={state.semesters}
                cgpa={cgpa}
                totalCredits={totalCredits}
                onToast={setToastMsg}
            />

            <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
        </div>
    );
};

export default GPACalculator;
