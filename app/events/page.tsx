
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Layout/Navbar';
import Footer from '@/components/Layout/Footer';
import EventForm from '@/components/Events/EventForm';
import EventList from '@/components/Events/EventList';
import { AgendaEvent } from '@/components/Events/types';
import Link from 'next/link';
import Toast from '@/components/UI/Toast';
import { requestNotificationPermission } from '@/lib/notification_service';
import InfoModal from '@/components/UI/InfoModal';

import ConfirmationModal from '@/components/UI/ConfirmationModal';

export default function EventsPage() {
    const [events, setEvents] = useState<AgendaEvent[]>([]);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AgendaEvent | null>(null);
    const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>('default');

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        eventId: ''
    });

    // FAB & Info Modal States
    const [isFabExpanded, setIsFabExpanded] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
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
        if (typeof window !== 'undefined' && 'Notification' in window) {
            setNotificationPerm(Notification.permission);
        }
    }, []);

    const handleEnableNotifications = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            setNotificationPerm('granted');
            setToastMsg("Notifications enabled successfully!");
            // Test Notification
            new Notification("Notifications Active", { body: "You will now receive alerts for your events.", icon: "/logo-primary.png" });
        } else {
            setNotificationPerm('denied');
            setToastMsg("Notifications denied. Please enable them in browser settings.");
        }
    };


    useEffect(() => {
        const stored = localStorage.getItem('lucid_timetable_events');
        if (stored) {
            try {
                setEvents(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to load events", e);
            }
        }
    }, []);

    const saveEvents = (newEvents: AgendaEvent[]) => {
        setEvents(newEvents);
        localStorage.setItem('lucid_timetable_events', JSON.stringify(newEvents));
    };

    const handleAdd = (eventData: Omit<AgendaEvent, 'id' | 'completed'>) => {
        if (editingEvent) {
            // Update existing
            const updatedEvents = events.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e);
            saveEvents(updatedEvents);
            setToastMsg("Event updated successfully!");
            setEditingEvent(null);
        } else {
            // Create new
            const newEvent: AgendaEvent = {
                ...eventData,
                id: Date.now().toString(),
                completed: false
            };
            saveEvents([...events, newEvent]);
            setToastMsg("Event added successfully!");
        }
        setShowForm(false);
    };

    const handleEdit = (event: AgendaEvent) => {
        setEditingEvent(event);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingEvent(null);
        setShowForm(false);
    }

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            const newEvents = events.filter(e => e.id !== id);
            saveEvents(newEvents);
            setToastMsg("Event deleted.");
        }
    };

    const handleToggleComplete = (id: string) => {
        // Prevent toggling if already completed (though UI should handle this too)
        const event = events.find(e => e.id === id);
        if (event?.completed) return;

        // Show confirmation modal
        setConfirmModal({ isOpen: true, eventId: id });
    };

    const confirmToggleComplete = () => {
        if (!confirmModal.eventId) return;

        const newEvents = events.map(e => {
            if (e.id === confirmModal.eventId) return { ...e, completed: true };
            return e;
        });
        saveEvents(newEvents);
        setToastMsg("Event marked as completed! 🎉");
        setConfirmModal({ isOpen: false, eventId: '' });
    };

    // Calculate stats
    const total = events.length;
    const completed = events.filter(e => e.completed).length;
    const pending = total - completed;

    return (
        <div className="min-h-screen pb-10">
            <Navbar />

            <div className="container mx-auto px-4 pt-28 max-w-5xl animate-fade-in-up">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-6 glass p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-slate-700/30">
                    <div>
                        <h1 className="text-2xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-1 md:mb-2">
                            Events <span className="bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">Catalog</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-sm mb-4">Manage your academic deadlines and tasks.</p>

                        {/* Detailed User Guidance */}
                        <div className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-3 md:p-4 max-w-lg">
                            <h3 className="text-indigo-900 dark:text-indigo-200 font-bold text-sm mb-1 flex items-center gap-2">
                                <i className="fas fa-info-circle"></i> How to Add Events?
                            </h3>
                            <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                                Use the <span className="font-bold">Floating Action Button (FAB)</span> located at the <span className="font-bold border-b border-indigo-400 border-dashed">bottom-right corner</span> of your screen.
                                <br />
                                <span className="inline-flex items-center gap-1 mt-1">
                                    <i className="fas fa-chevron-circle-up text-indigo-500"></i> Tap the arrow to expand, then select
                                    <span className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 font-black shadow-sm mx-1">+</span>
                                    to add.
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 md:gap-3 w-full md:w-auto items-center">

                        {notificationPerm !== 'granted' && (
                            <button
                                onClick={handleEnableNotifications}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 border border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <i className="fas fa-bell"></i> <span className="hidden sm:inline">Alerts</span><span className="sm:hidden">On</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Mobile FAB for Add Event */}


                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
                    <div className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/80 p-3 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="text-xl md:text-4xl font-black text-slate-800 dark:text-white mb-0.5 md:mb-1 relative z-10">{total}</div>
                        <div className="text-[9px] md:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10 truncate">Total</div>
                        <i className="fas fa-layer-group absolute right-2 bottom-2 md:right-6 md:bottom-6 text-xl md:text-3xl text-slate-200 dark:text-slate-800 group-hover:scale-110 transition-transform duration-300 opacity-50 md:opacity-100"></i>
                    </div>

                    <div className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/80 p-3 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                        <div className="text-xl md:text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-0.5 md:mb-1 relative z-10">{completed}</div>
                        <div className="text-[9px] md:text-xs font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest relative z-10 truncate">Done</div>
                        <i className="fas fa-check-circle absolute right-2 bottom-2 md:right-6 md:bottom-6 text-xl md:text-3xl text-emerald-100 dark:text-emerald-900/30 group-hover:scale-110 transition-transform duration-300 opacity-50 md:opacity-100"></i>
                    </div>

                    <div className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/80 p-3 md:p-6 rounded-2xl md:rounded-[2rem] border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                        <div className="text-xl md:text-4xl font-black text-amber-500 dark:text-amber-400 mb-0.5 md:mb-1 relative z-10">{pending}</div>
                        <div className="text-[9px] md:text-xs font-black text-amber-500/60 dark:text-amber-400/60 uppercase tracking-widest relative z-10 truncate">Pending</div>
                        <i className="fas fa-clock absolute right-2 bottom-2 md:right-6 md:bottom-6 text-xl md:text-3xl text-amber-100 dark:text-amber-900/30 group-hover:scale-110 transition-transform duration-300 opacity-50 md:opacity-100"></i>
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[1000px] opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'}`}>
                    <EventForm onAdd={handleAdd} initialData={editingEvent} onCancel={handleCancelEdit} />
                </div>

                <EventList events={events} onDelete={handleDelete} onToggleComplete={handleToggleComplete} onEdit={handleEdit} />

                <Footer />
            </div>

            {/* Floating Action Buttons System */}
            <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-[100] animate-scale-in">

                {/* Menu Items */}
                <div className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${isFabExpanded ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-90 pointer-events-none absolute bottom-16'}`}>

                    {/* Status Pill */}
                    <div className="px-5 py-2.5 rounded-full font-bold text-xs shadow-lg shadow-black/5 dark:shadow-indigo-500/20 flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-all duration-300 bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 backdrop-blur-md">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></span>
                        {isOnline ? 'Online' : 'Offline'}
                    </div>

                    {/* Add Event Button */}
                    <button
                        onClick={() => {
                            if (showForm) handleCancelEdit();
                            else {
                                setEditingEvent(null);
                                setShowForm(true);
                            }
                            setIsFabExpanded(false);
                        }}
                        className="w-12 h-12 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-lg shadow-indigo-500/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-indigo-100 dark:border-slate-700"
                        title="Add Event"
                    >
                        <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
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
                <div className="relative">


                    <button
                        onClick={() => setIsFabExpanded(!isFabExpanded)}
                        className={`w-14 h-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 pointer-events-auto relative z-50 animate-pulse`}
                    >
                        <i className={`fas fa-chevron-up text-xl transition-transform duration-300 ${isFabExpanded ? 'rotate-180' : ''}`}></i>
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmToggleComplete}
                title="Mark as Completed?"
                message="This action cannot be undone. Are you sure you want to mark this task as completed?"
                confirmText="Yes, Complete it"
                type="warning"
            />

            <InfoModal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)} />
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
        </div>
    );
}
