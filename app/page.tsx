
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ModeToggle from '@/components/Timetable/ModeToggle';
import FilterBar from '@/components/Timetable/FilterBar';
import DayView from '@/components/Timetable/DayView';
import WeekView from '@/components/Timetable/WeekView';
import TimetablePrintView from '@/components/Timetable/TimetablePrintView';
import Toast from '@/components/UI/Toast';
import { ProcessedSlot, DAYS, processDayData } from '@/lib/parser';
import { checkAndSync, detectSheetChanges } from '@/lib/sync_service';

export default function Home() {
  const [mode, setMode] = useState<'student' | 'teacher' | 'room'>('student');
  const [view, setView] = useState<'day' | 'week'>('day');
  const [filters, setFilters] = useState({
    program: '',
    semester: '',
    section: '',
    day: '',
    teacherName: '',
    roomNumber: ''
  });

  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  useEffect(() => {
    setGeneratedAt(new Date().toLocaleString());
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
    if (mode === 'student') {
      const stored = localStorage.getItem('lucid_timetable_preferences');
      if (stored) {
        try {
          const prefs = JSON.parse(stored);
          setFilters(f => ({ ...f, ...prefs }));
        } catch (e) { console.error(e); }
      }
    }
  }, [mode]);

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

        // Trigger sync (24h or first time)
        const freshData = await checkAndSync();
        if (freshData) {
          responseCache.current['full_data'] = freshData;
          fetchData(); // Re-render with fresh synced data
        }
      } catch (e) {
        console.error('Sync failed', e);
        // Ensure we try to fetch data even if sync fails, so we don't end up with empty slots if cache was missing
        if (!responseCache.current['full_data']) {
          fetchData();
        }
      }
    };
    initSync();

    // Setup Change Detection Heartbeat (Every 5 minutes)
    const interval = setInterval(async () => {
      const changed = await detectSheetChanges();
      if (changed) {
        setToastMsg('Schedule updated! Refreshing...');
        const updatedData = await checkAndSync(true); // Force sync
        responseCache.current['full_data'] = updatedData;
        fetchData();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = useCallback(async () => {
    const activeDay = view === 'week' ? 'all' : filters.day;
    if (!activeDay) return;

    // TRY LOCAL FILTERING WITH PERFECT PARITY (Using processDayData)
    const localRawData = responseCache.current['full_data'];

    // Only proceed with local filtering if we have the RAW data structure (dictionary of days)
    if (localRawData && typeof localRawData === 'object' && !Array.isArray(localRawData)) {
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
          // If we successfully filtered locally, we return early.
          // UNLESS the local data was empty for some reason, but we trust sync_service
          return;
        } else {
          const dayValues = localRawData[filters.day] || [];
          const dayResult = processDayData(dayValues, mode, filters);
          setSlots(dayResult);
          return;
        }
      } catch (e) {
        console.error("Local filtering failed", e);
      }
    }

    // FALLBACK TO API (Only if local data is missing)

    if (mode === 'student' && !filters.program && !filters.semester && !filters.section) {
      // Avoid hitting API for empty searches if not needed, or just clear slots
      if (!localRawData) setSlots([]);
      return;
    }
    if (mode === 'teacher' && !filters.teacherName) return;
    if (mode === 'room' && !filters.roomNumber) return;

    const params = new URLSearchParams({
      day: activeDay,
      mode,
      ...(filters.program && { program: filters.program }),
      ...(filters.semester && { semester: filters.semester }),
      ...(filters.section && { section: filters.section }),
      ...(filters.teacherName && { teacherName: filters.teacherName }),
      ...(filters.roomNumber && { roomNumber: filters.roomNumber }),
    });

    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const res = await fetch(`/api/timetable?${params}`, { signal: controller.signal });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to load data');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [mode, filters, view]);

  // Trigger fetchData when dependencies change (with debounce)
  useEffect(() => {
    const timer = setTimeout(fetchData, 400);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSetFilter = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const savePreferences = () => {
    localStorage.setItem('lucid_timetable_preferences', JSON.stringify({
      program: filters.program,
      semester: filters.semester,
      section: filters.section
    }));
    setToastMsg('Preferences saved!');
  };

  const clearPreferences = () => {
    localStorage.removeItem('lucid_timetable_preferences');
    setFilters(prev => ({ ...prev, program: '', semester: '', section: '' }));
    setToastMsg('Preferences cleared!');
  };

  const handleDownload = async () => {
    if (view !== 'day') {
      setToastMsg('Download is only available for Day View');
      return;
    }

    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('timetable-download-view');

      if (!element) {
        setToastMsg('Download view not found');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#e9d5ff',
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Force simple colors on the cloned body/html to prevent html2canvas from detecting 'lab()' or 'oklch()' variables
          // from Tailwind v4 defaults, which causes it to crash.
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.color = '#000000';
          // Also try to nullify any style attributes that might contain vars
          clonedDoc.documentElement.removeAttribute('style');
        }
      });

      const link = document.createElement('a');
      link.download = `timetable-${filters.day}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setToastMsg('Timetable downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      setToastMsg('Failed to download timetable');
    }
  };

  // Swipe Handler
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

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
        setToastMsg(`Switched to ${newDay}`); // Notification
      }
    }
  };

  return (
    <div className="min-h-screen pb-10">
      <div className="print:hidden">
        <Navbar />

        <div className="container mx-auto px-4 pt-28 max-w-5xl">

          {/* View Toggle matching screenshot */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full p-1.5 flex shadow-[0_8px_32px_rgba(0,0,0,0.06)] mb-8 border border-white/40 dark:border-slate-800/50 max-w-sm mx-auto animate-fade-in-up animation-delay-100">
            <button
              onClick={() => setView('day')}
              className={`flex-1 py-3 px-8 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 transform ${view === 'day' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:text-indigo-400 dark:hover:bg-slate-800 hover:scale-105 active:scale-95'}`}
            >
              <i className="fas fa-calendar-day"></i> Day View
            </button>
            <button
              onClick={() => setView('week')}
              className={`flex-1 py-3 px-8 rounded-full font-black text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 transform ${view === 'week' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 scale-105' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:text-indigo-400 dark:hover:bg-slate-800 hover:scale-105 active:scale-95'}`}
            >
              <i className="fas fa-calendar-week"></i> Week View
            </button>
          </div>

          <div className="animate-fade-in-up animation-delay-200">
            <ModeToggle mode={mode} setMode={setMode} />
          </div>

          <div className="animate-fade-in-up animation-delay-300 relative z-50">
            <FilterBar
              mode={mode}
              filters={filters}
              setFilter={handleSetFilter}
              onSave={savePreferences}
              onClear={clearPreferences}
            />
          </div>

          <div
            className="mt-10 relative z-0 touch-pan-y animate-fade-in-up animation-delay-500"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {view === 'day' ? (
              <DayView slots={slots as ProcessedSlot[]} loading={loading} error={error} day={filters.day} />
            ) : (
              <WeekView data={slots} loading={loading} error={error} />
            )}
          </div>

          <Footer />
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50 animate-scale-in animation-delay-700">
          <div className="px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-indigo-500/20 flex items-center gap-2 border-2 border-white/20 transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'}`}></span>
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <button onClick={async () => {
            setLoading(true);
            try {
              const updated = await checkAndSync(true);
              responseCache.current['full_data'] = updated;
              fetchData();
              setToastMsg('Schedule updated manually!');
            } catch (e) {
              setToastMsg('Manual update failed');
            } finally {
              setLoading(false);
            }
          }} className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/20 group" title="Refresh Data">
            <i className="fas fa-sync-alt group-hover:animate-spin"></i>
          </button>
          <button onClick={handleDownload} className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/20 group" title="Download Timetable">
            <i className="fas fa-download group-hover:animate-bounce"></i>
          </button>
        </div>

        {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
      </div>

      {/* Print View (Hidden standardly, visible on print) */}
      <TimetablePrintView
        slots={slots as ProcessedSlot[]}
        day={filters.day}
        mode={mode}
        room={mode === 'room' ? filters.roomNumber : undefined}
        filters={filters}
        generatedAt={generatedAt}
      />
    </div>
  );
}
