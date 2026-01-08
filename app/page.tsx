
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import ModeToggle from '@/components/Timetable/ModeToggle';
import FilterBar from '@/components/Timetable/FilterBar';
import DayView from '@/components/Timetable/DayView';
import WeekView from '@/components/Timetable/WeekView';
import TimetablePrintView from '@/components/Timetable/TimetablePrintView';
import ViewToggle from '@/components/Timetable/ViewToggle';
import Toast from '@/components/UI/Toast';
import InfoModal from '@/components/UI/InfoModal';
import { ProcessedSlot, DAYS, processDayData } from '@/lib/parser';
import { checkAndSync, detectSheetChanges } from '@/lib/sync_service';
import { triggerHaptic } from '@/lib/haptics';

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

  const [isFabExpanded, setIsFabExpanded] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

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

  // Haptic feedback on Toast
  useEffect(() => {
    if (toastMsg) triggerHaptic();
  }, [toastMsg]);

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
        teacherName: '',
        roomNumber: '',
        day: prev.day // Always preserve day
      };

      if (mode === 'student') {
        const stored = localStorage.getItem('lucid_student_prefs') || localStorage.getItem('lucid_timetable_preferences');
        if (stored) {
          try {
            const prefs = JSON.parse(stored);
            // Strictly apply only student fields
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
            // Strictly apply only teacher fields
            return {
              ...resetFilters,
              teacherName: prefs.teacherName || ''
            };
          } catch (e) { console.error(e); }
        }
        return resetFilters;
      }

      // Room Mode or Default -> Clean Slate
      return resetFilters;
    });
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
    }
  };

  const clearPreferences = () => {
    if (mode === 'student') {
      localStorage.removeItem('lucid_student_prefs');
      // Also clear legacy key
      localStorage.removeItem('lucid_timetable_preferences');
      setFilters(prev => ({ ...prev, program: '', semester: '', section: '' }));
      setToastMsg('Student preferences cleared!');
    } else if (mode === 'teacher') {
      localStorage.removeItem('lucid_teacher_prefs');
      setFilters(prev => ({ ...prev, teacherName: '' }));
      setToastMsg('Teacher preferences cleared!');
    }
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

          // Force Light Mode for consistent download design
          clonedDoc.documentElement.classList.remove('dark');

          // Optimize for Capture: Remove Blur and Shadows to prevent rendering artifacts
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.backdropFilter = 'none'; // Fix gray boxes
              el.style.boxShadow = 'none';      // Fix shadow scaling artifacts
            }
          });

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
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);
  const minSwipeDistance = 100; // Increased threshold to avoid accidental swipes



  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'day') return;

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
        triggerHaptic();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, filters.day]);

  const onTouchStart = (e: React.TouchEvent) => {
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

  return (
    <div className="min-h-screen pb-10">
      <div className="print:hidden">
        <Navbar />

        <div className="container mx-auto px-4 pt-28 max-w-5xl">

          {/* View Toggle matching screenshot */}
          <div className="animate-fade-in-up animation-delay-100">
            <ViewToggle view={view} setView={setView} />
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
        {/* Floating Action Buttons Menu */}
        <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50 animate-scale-in animation-delay-700 pointer-events-none">

          {/* Menu Items (Only visible when expanded) */}
          <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${isFabExpanded ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-90 pointer-events-none absolute bottom-16'}`}>

            {/* Status Pill */}
            <div className="px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-black/5 dark:shadow-indigo-500/20 flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 backdrop-blur-md">
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
              {isOnline ? 'Online' : 'Offline'}
            </div>

            {/* Refresh */}
            <button
              onClick={async () => {
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
              }}
              className="w-12 h-12 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-lg shadow-indigo-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-indigo-100 dark:border-slate-700"
              title="Refresh Data"
            >
              <i className="fas fa-sync-alt"></i>
            </button>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="w-12 h-12 bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 rounded-full shadow-lg shadow-purple-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-purple-100 dark:border-slate-700"
              title="Download Timetable"
            >
              <i className="fas fa-download"></i>
            </button>

            {/* Info Button (NEW) */}
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
            style={{ transform: isFabExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <i className={`fas ${isFabExpanded ? 'fa-chevron-down' : 'fa-chevron-up'} text-xl`}></i>
          </button>
        </div>

        <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />

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
