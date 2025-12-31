
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

export default function EventsPage() {
    const [events, setEvents] = useState<AgendaEvent[]>([]);
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [notificationPerm, setNotificationPerm] = useState<NotificationPermission>('default');

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
        const newEvent: AgendaEvent = {
            ...eventData,
            id: Date.now().toString(),
            completed: false
        };
        saveEvents([...events, newEvent]);
        setToastMsg("Event added successfully!");
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this event?")) {
            const newEvents = events.filter(e => e.id !== id);
            saveEvents(newEvents);
            setToastMsg("Event deleted.");
        }
    };

    const handleToggleComplete = (id: string) => {
        const newEvents = events.map(e => {
            if (e.id === id) return { ...e, completed: !e.completed };
            return e;
        });
        saveEvents(newEvents);
    };

    // Calculate stats
    const total = events.length;
    const completed = events.filter(e => e.completed).length;
    const pending = total - completed;

    return (
        <div className="min-h-screen pb-10">
            <Navbar />

            <div className="container mx-auto px-4 pt-28 max-w-5xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 glass p-6 rounded-[2.5rem] bg-white/40 dark:bg-slate-900/40 border border-white/40 dark:border-slate-700/30">
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-2">
                            Events <span className="text-indigo-500">Catalog</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm">Manage your academic deadlines and tasks</p>
                    </div>
                    <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <Link href="/" className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 transition-all hover:scale-105 active:scale-95 shadow-sm">
                            <i className="fas fa-arrow-left"></i> Back
                        </Link>
                        {notificationPerm !== 'granted' && (
                            <button
                                onClick={handleEnableNotifications}
                                className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-white bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 border border-slate-700 transition-all hover:scale-105 active:scale-95 shadow-sm"
                            >
                                <i className="fas fa-bell"></i> Enable Alerts
                            </button>
                        )}
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className={`w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-full font-black text-white shadow-lg transition-all hover:scale-105 active:scale-95 ${showForm ? 'bg-slate-500 hover:bg-slate-600 shadow-slate-500/30' : 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30'}`}
                        >
                            <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i> {showForm ? 'Close Form' : 'Add New Event'}
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/80 p-6 rounded-[2rem] border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
                        <div className="text-4xl font-black text-slate-800 dark:text-white mb-1 relative z-10">{total}</div>
                        <div className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest relative z-10">Total Events</div>
                        <i className="fas fa-layer-group absolute right-6 bottom-6 text-3xl text-slate-200 dark:text-slate-800 group-hover:scale-110 transition-transform duration-300"></i>
                    </div>

                    <div className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/80 p-6 rounded-[2rem] border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                        <div className="text-4xl font-black text-emerald-600 dark:text-emerald-400 mb-1 relative z-10">{completed}</div>
                        <div className="text-xs font-black text-emerald-600/60 dark:text-emerald-400/60 uppercase tracking-widest relative z-10">Completed</div>
                        <i className="fas fa-check-circle absolute right-6 bottom-6 text-3xl text-emerald-100 dark:text-emerald-900/30 group-hover:scale-110 transition-transform duration-300"></i>
                    </div>

                    <div className="relative overflow-hidden group bg-white/70 dark:bg-slate-900/80 p-6 rounded-[2rem] border border-white/40 dark:border-slate-700/50 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                        <div className="text-4xl font-black text-amber-500 dark:text-amber-400 mb-1 relative z-10">{pending}</div>
                        <div className="text-xs font-black text-amber-500/60 dark:text-amber-400/60 uppercase tracking-widest relative z-10">Pending</div>
                        <i className="fas fa-clock absolute right-6 bottom-6 text-3xl text-amber-100 dark:text-amber-900/30 group-hover:scale-110 transition-transform duration-300"></i>
                    </div>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showForm ? 'max-h-[1000px] opacity-100 mb-10' : 'max-h-0 opacity-0 mb-0'}`}>
                    <EventForm onAdd={(e) => { handleAdd(e); setShowForm(false); }} />
                </div>

                <EventList events={events} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />

                <Footer />
            </div>
            {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)} />}
        </div>
    );
}
