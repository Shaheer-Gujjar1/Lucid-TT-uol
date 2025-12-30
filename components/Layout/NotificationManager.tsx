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

        // Run every minute (60,000 ms)
        const intervalId = setInterval(runCheck, 60000);

        return () => clearInterval(intervalId);
    }, []);

    return null; // Invisible component
}
