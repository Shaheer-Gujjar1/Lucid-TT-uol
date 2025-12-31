'use client';

import { AgendaEvent } from '@/components/Events/types';

const NOTIFICATION_LOG_KEY = 'lucid_notification_log';

interface NotificationLog {
    [eventId: string]: {
        dayBefore?: boolean;
        hourBefore?: boolean;
        overdue?: boolean;
    };
}

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support desktop notification');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
        try {
            // Service Worker registration is required for persistent notifications on mobile but
            // requires PWA setup. For now, we fallback to standard new Notification() which works 
            // when app is open/minimized on desktop and some mobile scenarios.
            new Notification(title, {
                icon: '/logo-primary.png', // Assuming this exists, fallback if not
                badge: '/logo-primary.png',
                ...options
            });
        } catch (e) {
            console.error('Notification failed', e);
        }
    }
};

export const checkEventNotifications = (events: AgendaEvent[]) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const now = new Date();
    const currentLog: NotificationLog = JSON.parse(localStorage.getItem(NOTIFICATION_LOG_KEY) || '{}');
    let logChanged = false;

    events.forEach(event => {
        if (event.completed) return;

        const eventTimeStr = `${event.date}T${event.time || '00:00'}`;
        const eventDate = new Date(eventTimeStr);

        // Safety check for invalid dates
        if (isNaN(eventDate.getTime())) return;

        const diffMs = eventDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);

        // Initialize log entry if not exists
        if (!currentLog[event.id]) {
            currentLog[event.id] = {};
        }

        const log = currentLog[event.id];

        // 1. One Day Before (24h +/- 30min window to catch it)
        // We use a looser window to ensure we catch it if the poller runs every minute
        if (diffHours <= 24 && diffHours > 23 && !log.dayBefore) {
            sendNotification(`Upcoming: ${event.title}`, {
                body: `Tomorrow at ${event.time || 'All Day'} - ${event.course || event.type}`,
                tag: `day-${event.id}` // Prevents stacking
            });
            log.dayBefore = true;
            logChanged = true;
        }

        // 2. One Hour Before (1h +/- 15min window)
        if (diffHours <= 1 && diffHours > 0 && !log.hourBefore) {
            sendNotification(`Reminder: ${event.title}`, {
                body: `Starting in 1 hour! ${event.description ? '- ' + event.description.substring(0, 30) + '...' : ''}`,
                tag: `hour-${event.id}`,
                requireInteraction: true // Stays until clicked
            });
            log.hourBefore = true;
            logChanged = true;
        }

        // 3. Overdue 12 Hours (-12h)
        // Check if diffHours is around -12
        if (diffHours <= -12 && !log.overdue) {
            sendNotification(`Overdue: ${event.title}`, {
                body: `This event was due 12 hours ago. Did you finish it?`,
                tag: `overdue-${event.id}`
            });
            log.overdue = true;
            logChanged = true;
        }
    });

    if (logChanged) {
        localStorage.setItem(NOTIFICATION_LOG_KEY, JSON.stringify(currentLog));
    }
};
