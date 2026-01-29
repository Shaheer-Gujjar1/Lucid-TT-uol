
import { NextRequest, NextResponse } from 'next/server';
import { processDayData, DAYS } from '@/lib/parser';

// Cache structure
interface CacheEntry {
    data: any[];
    timestamp: number;
    hash: string;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache: Record<string, CacheEntry> = {};

// Helper to get a consistent hash (Modified Time) from Drive API
async function getEffectiveHash(sheetId: string, apiKey: string): Promise<string> {
    try {
        // Use Drive API to get metadata (modifiedTime)
        // This is the most reliable source of truth for "has the file changed?"
        const driveUrl = `https://www.googleapis.com/drive/v3/files/${sheetId}?fields=modifiedTime&key=${apiKey}`;
        const res = await fetch(driveUrl);
        if (res.ok) {
            const data = await res.json();
            return data.modifiedTime || 'unknown-modified-time';
        }

        // Fallback: If Drive API fails (e.g., API key restrictions), use Sheets API properties
        const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties(title)&key=${apiKey}`;
        const sheetsRes = await fetch(sheetsUrl);
        if (sheetsRes.ok) {
            const data = await sheetsRes.json();
            // This fallback is static and won't detect content changes, effectively disabling auto-refresh if Drive API is blocked.
            // This is safer than infinite loops.
            return data.properties?.title || 'static-fallback-hash';
        }
    } catch (e) {
        console.error("Failed to fetch sheet hash:", e);
    }
    return 'unavailable';
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const isMetaOnly = searchParams.get('meta') === 'true';

    // Use bracket notation to prevent Next.js from inlining the NEXT_PUBLIC_ var as a string literal during build,
    // which triggers Netlify's secret scanner.
    const sheetId = process.env.GOOGLE_SHEETS_ID || process.env['NEXT_PUBLIC_GOOGLE_SHEETS_ID'] || '';
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';

    // 1. Get the "Master Hash" (Modified Time)
    // We do this for BOTH meta checks and full data fetches to ensure consistency.
    const effectiveHash = await getEffectiveHash(sheetId, apiKey);

    // For meta-only requests (Heartbeat) - Return the hash immediately
    if (isMetaOnly) {
        return NextResponse.json({ hash: effectiveHash });
    }

    const day = searchParams.get('day');
    const mode = searchParams.get('mode') as 'student' | 'teacher' | 'room' | 'subject';

    if (!day || !mode) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Validate day parameter if not 'all'
    if (day !== 'all' && !DAYS.includes(day)) {
        return NextResponse.json({ error: 'Invalid day parameter' }, { status: 400 });
    }

    const cacheKey = `${mode}-${day}-${searchParams.toString()}`;
    const now = Date.now();

    // Check Cache - If we have valid data and the HASH matches (meaning no remote changes), return cached
    // validation against `effectiveHash` ensures we serve fresh data if the sheet changed, even if cache isn't expired by time.
    if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
        // Optimistic cache return. To be perfectly safe, we should check if cache[cacheKey].hash === effectiveHash.
        // If the sheet changed, `effectiveHash` will differ.
        if (cache[cacheKey].hash === effectiveHash) {
            return NextResponse.json({ slots: cache[cacheKey].data, hash: effectiveHash });
        }
    }

    const isRaw = searchParams.get('raw') === 'true';

    try {
        const rawDays: Record<string, string[][]> = {};
        const targetDays = day === 'all' ? DAYS : [day];
        let allSlots: any[] = [];

        for (const d of targetDays) {
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${d}!A1:Z200?key=${apiKey}`;
            const res = await fetch(url);

            if (!res.ok) {
                console.error(`Google Sheets API error for day ${d}: ${res.statusText}`);
                if (day === 'all') continue;
                throw new Error(`Failed to fetch data for day ${d}`);
            }

            const data = await res.json();
            const values = data.values || [];

            if (isRaw) {
                rawDays[d] = values;
                continue;
            }

            const processed = processDayData(values, mode, {
                program: searchParams.get('program') || undefined,
                semester: searchParams.get('semester') || undefined,
                section: searchParams.get('section') || undefined,
                teacherName: searchParams.get('teacherName') || undefined,
                roomNumber: searchParams.get('roomNumber') || undefined,
                course: searchParams.get('subject') || undefined, // Map 'subject' param to 'course' filter
            });

            if (day === 'all') {
                allSlots.push({ day: d, slots: processed });
            } else {
                allSlots = processed;
            }
        }

        if (isRaw) {
            return NextResponse.json({ raw: rawDays, hash: effectiveHash });
        }

        // Update Cache with fresh hash
        cache[cacheKey] = { data: allSlots, timestamp: now, hash: effectiveHash };
        return NextResponse.json({ slots: allSlots, hash: effectiveHash });
    } catch (error: any) {
        console.error('Error fetching or processing data:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
