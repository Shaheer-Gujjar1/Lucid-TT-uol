
const RAW_DATA_KEY = 'lucid_raw_sheet_data';
const SYNC_METADATA_KEY = 'lucid_sync_metadata';
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export interface SyncMetadata {
    lastSync: number;
    sheetHash: string;
}

export async function fetchAllTimetableData() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    try {
        const res = await fetch('/api/timetable?day=all&mode=student&raw=true', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch from server');
        const data = await res.json();
        return data;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function checkAndSync(force: boolean = false) {
    if (typeof window === 'undefined') return null; // Server-side check

    const metadataStr = localStorage.getItem(SYNC_METADATA_KEY);
    const metadata = metadataStr ? JSON.parse(metadataStr) : null;
    const now = Date.now();

    // Check if we need to sync based on time
    if (!force && metadata && (now - metadata.lastSync < SYNC_INTERVAL)) {
        const cachedData = localStorage.getItem(RAW_DATA_KEY);
        if (cachedData) {
            console.log('Sync not needed, using cached data');
            return JSON.parse(cachedData);
        }
    }

    console.log(force ? 'Manual refresh triggered' : '24h sync triggered');
    try {
        const data = await fetchAllTimetableData();

        const newMetadata: SyncMetadata = {
            lastSync: now,
            sheetHash: data.hash || 'initial'
        };

        localStorage.setItem(RAW_DATA_KEY, JSON.stringify(data.raw));
        localStorage.setItem(SYNC_METADATA_KEY, JSON.stringify(newMetadata));

        return data.raw;
    } catch (error) {
        console.error("Sync failed:", error);
        // Fallback to cache if available even if expired, better than nothing
        const cachedData = localStorage.getItem(RAW_DATA_KEY);
        if (cachedData) return JSON.parse(cachedData);
        throw error;
    }
}

// Change detection mechanism (Heartbeat)
export async function detectSheetChanges() {
    if (typeof window === 'undefined') return false;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    try {
        const res = await fetch('/api/timetable?meta=true', { signal: controller.signal });
        if (!res.ok) return false;
        const { hash } = await res.json();

        const metadataStr = localStorage.getItem(SYNC_METADATA_KEY);
        const metadata = metadataStr ? JSON.parse(metadataStr) : null;

        if (metadata && metadata.sheetHash !== hash) {
            console.log('Change detected in Google Sheet!');
            return true;
        }
    } catch (e) {
        // Silent fail for heartbeat
        return false;
    } finally {
        clearTimeout(timeoutId);
    }
    return false;
}
