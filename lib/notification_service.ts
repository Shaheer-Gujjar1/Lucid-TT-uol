'use client';

import { AgendaEvent } from '@/components/Events/types';
import { ProcessedSlot } from '@/lib/parser';

const NOTIFICATION_LOG_KEY = 'lucid_notification_log';
const CLASS_NOTIF_LOG_KEY = 'lucid_class_notification_log';

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

export const sendNotification = async (title: string, options?: NotificationOptions & { showTrigger?: any }) => {
    if (Notification.permission === 'granted') {
        try {
            // Priority: Service Worker (Required for Mobile Android/iOS or scheduled triggers)
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                if (registration) {
                    await registration.showNotification(title, {
                        icon: '/logo-primary.png',
                        badge: '/logo-primary.png',
                        // @ts-ignore - vibrate is valid in SW notification but TS definition might be missing it
                        vibrate: [200, 100, 200],
                        ...options
                    });
                    return;
                }
            }

            // Fallback: Standard Web API (Desktop)
            // Note: Standard Notification API does NOT support showTrigger, so it will just fire instantly
            // if we fall back to this, which only happens if SW is completely dead/unsupported.
            new Notification(title, {
                icon: '/logo-primary.png',
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

        // 2. One Hour Before (or just missed start)
        if (diffHours <= 1 && diffHours > -1 && !log.hourBefore) {
            const isStarted = diffHours < 0;
            const title = isStarted ? `Happening Now: ${event.title}` : `Reminder: ${event.title}`;

            const timeMsg = isStarted
                ? `Started ${Math.abs(Math.round(diffHours * 60))} mins ago.`
                : `Starting in ${Math.round(diffHours * 60)} mins!`;

            sendNotification(title, {
                body: `${timeMsg} ${event.description ? '- ' + event.description.substring(0, 30) + '...' : ''}`,
                tag: `hour-${event.id}`,
                requireInteraction: true
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

export const checkClassNotifications = (slots: ProcessedSlot[], strategy: 'all_classes' | 'after_free') => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const now = new Date();
    const currentLog: Record<string, boolean> = JSON.parse(localStorage.getItem(CLASS_NOTIF_LOG_KEY) || '{}');
    let logChanged = false;

    // We only care about today, so we get today's date string prefix: YYYY-MM-DD
    const todayStr = now.toISOString().split('T')[0];

    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        if (!slot.entries || slot.entries.length === 0) continue; // Free slot

        // Apply after_free logic: check if previous slot is free
        if (strategy === 'after_free' && i > 0) {
            const prevSlot = slots[i - 1];
            if (prevSlot.entries && prevSlot.entries.length > 0) {
                continue; // Previous slot was not free, skip notification
            }
        }

        // Parse time: "08:00 - 09:30" => "08:00"
        const timeMatch = slot.time.match(/(\d{1,2}:\d{2})/);
        if (!timeMatch) continue;

        const startTimeStr = timeMatch[1];
        // Create full date object for comparison
        const classTime = new Date(`${todayStr}T${startTimeStr.padStart(5, '0')}:00`);
        // Handle timezone/parsing oddities if needed, assuming local time aligns

        if (isNaN(classTime.getTime())) continue;

        const diffMs = classTime.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / (1000 * 60));

        // Generate a unique ID for this slot to prevent spamming
        const logId = `${todayStr}-${slot.time}`;

        if (!currentLog[logId]) {
            // Target time is exactly 5 minutes BEFORE the class starts
            const targetTimeMs = classTime.getTime() - (5 * 60 * 1000);

            // If the target notification time is in the future, schedule it!
            if (targetTimeMs > now.getTime()) {
                // @ts-ignore - TimestampTrigger is experimental
                if ('showTrigger' in Notification.prototype) {
                    try {
                        // @ts-ignore
                        const trigger = new TimestampTrigger(targetTimeMs);
                        sendNotification('Class Starting Soon!', {
                            body: `You have a class starting at ${startTimeStr}.`,
                            tag: `class-${logId}`,
                            // @ts-ignore
                            showTrigger: trigger
                        });
                        currentLog[logId] = true;
                        logChanged = true;
                        console.log(`Scheduled notification for class at ${startTimeStr}`);
                    } catch (e) {
                        console.error("Failed to schedule notification trigger", e);
                    }
                }
            }
            // Otherwise, if we already missed the 5 minute mark, but the class hasn't started yet
            // (e.g. they opened the app 2 minutes before class), fire it immediately.
            else if (diffMins > 0 && diffMins <= 5) {
                sendNotification('Class Starting Soon!', {
                    body: `You have a class starting in ${diffMins} minutes.`,
                    tag: `class-${logId}`
                });
                currentLog[logId] = true;
                logChanged = true;
            }
        }
    }

    if (logChanged) {
        localStorage.setItem(CLASS_NOTIF_LOG_KEY, JSON.stringify(currentLog));
    }
};
