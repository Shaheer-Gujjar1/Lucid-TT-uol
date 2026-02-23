'use client';

import { useEffect } from 'react';
import { checkEventNotifications, checkClassNotifications } from '@/lib/notification_service';
import { AgendaEvent } from '@/components/Events/types';
import { useSettings } from '@/lib/settings';
import { processDayData, DAYS } from '@/lib/parser';

export default function NotificationManager() {
    const { settings } = useSettings();

    useEffect(() => {
        // Initial check on load //
        const runCheck = () => {
            if (settings.notificationStrategy === 'none') return;
            try {
                // 1. Events Check
                const strategyIncludesEvents = ['events_only', 'all_classes_and_events', 'after_free_and_events'].includes(settings.notificationStrategy);
                if (settings.enableEvents && strategyIncludesEvents) {
                    const stored = localStorage.getItem('lucid_timetable_events');
                    if (stored) {
                        const events: AgendaEvent[] = JSON.parse(stored);
                        checkEventNotifications(events);
                    }
                }

                // 2. Classes Check
                const strategyIncludesClasses = ['all_classes', 'after_free', 'all_classes_and_events', 'after_free_and_events'].includes(settings.notificationStrategy);
                if (strategyIncludesClasses) {
                    const mode = settings.defaultMode || 'student';
                    const rawStr = localStorage.getItem('lucid_raw_sheet_data');
                    const prefsStr = mode === 'student' ? (localStorage.getItem('lucid_student_prefs') || localStorage.getItem('lucid_timetable_preferences')) : localStorage.getItem('lucid_teacher_prefs');

                    if (rawStr && prefsStr) {
                        const raw = JSON.parse(rawStr);
                        const prefs = JSON.parse(prefsStr);

                        const todayIndex = (new Date().getDay() + 6) % 7;
                        const todayList = DAYS[todayIndex];

                        if (raw[todayList]) {
                            const slots = processDayData(raw[todayList], mode as any, prefs);
                            // Normalize the strategy for class checks (strip events)
                            const classStrategy = settings.notificationStrategy.includes('after_free') ? 'after_free' : 'all_classes';
                            checkClassNotifications(slots, classStrategy);
                        }
                    }
                }
            } catch (e) {
                console.error("Notification check failed", e);
            }
        };

        // Run immediately
        runCheck();

        // Register Service Worker for Mobile Notifications
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => console.log('SW Registered:', registration.scope))
                .catch(err => console.error('SW Registration Failed:', err));
        }

        // Listen for network recovery
        const handleOnline = () => {
            console.log('Network restored - Checking for missed notifications...');
            runCheck();
        };
        window.addEventListener('online', handleOnline);

        // Run every minute (60,000 ms)
        const intervalId = setInterval(runCheck, 60000);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('online', handleOnline);
        };
    }, [settings.notificationStrategy, settings.enableEvents, settings.defaultMode]);

    return null; // Invisible component
}
