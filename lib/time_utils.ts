
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * Converts a 12-hour time string (e.g. "08:30", "12:00", "01:30") to minutes from midnight.
 * Handles the "12:00 is Noon" rule and "1-6 is PM" heuristic.
 */
export function timeToMinutesSimple(timeStr: string): number {
    const [hoursStr, minutesStr] = timeStr.trim().split(/[:.]/);
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10) || 0;

    // 12-hour format specific logic
    if (hours === 12) {
        // 12:00 is always treated as Noon (12 PM) in this academic context
        // Noon is 12 * 60 = 720 minutes;
        hours = 12;
    } else if (hours >= 1 && hours <= 6) {
        // 1:00 to 6:00 is treated as PM
        hours += 12;
    }
    // 7, 8, 9, 10, 11 are treated as AM (no change)

    return hours * 60 + minutes;
}

export function isSlotActive(dayName: string, timeRange: string): boolean {
    if (!dayName || !timeRange) return false;

    // 1. Check Day
    const now = new Date();
    const currentDayIndex = (now.getDay() + 6) % 7; // Monday=0, Sunday=6
    const targetDayIndex = DAYS.indexOf(dayName);

    if (currentDayIndex !== targetDayIndex) return false;

    // 2. Parse Time Range
    // Expected formats: "08:30 - 10:00", "8:30-10:00"
    const parts = timeRange.split('-').map(s => s.trim());
    if (parts.length !== 2) return false;

    const startMinutes = timeToMinutesSimple(parts[0]);
    const endMinutes = timeToMinutesSimple(parts[1]);

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}
