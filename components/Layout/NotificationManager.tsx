'use client';

import { useEffect } from 'react';
import { checkEventNotifications } from '@/lib/notification_service';
import { AgendaEvent } from '@/components/Events/types';

export default function NotificationManager() {
    useEffect(() => {
        // Initial check on load
        const runCheck = () => {
            try {
                const stored = localStorage.getItem('lucid_timetable_events');
                if (stored) {
                    const events: AgendaEvent[] = JSON.parse(stored);
                    checkEventNotifications(events);
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
    }, []);

    return null; // Invisible component
}
