
import { NextRequest, NextResponse } from 'next/server';
import { parseSeatingPlan, parseDatesheet } from '@/lib/exam_parser';
import fs from 'fs';
import path from 'path';
import { parseSeatingPlanPDF } from '@/lib/pdf_parser';

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Global cache to persist across hot reloads in dev
declare global {
    var _examCache: { data: any, timestamp: number } | undefined;
}

const SEATING_PLAN_ID = process.env.SEATING_PLAN_FILE_ID || '1YNgAd0YyU2seheGTQzNCs3S6wYrlP9BS';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'seating' | 'datesheet'
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';

    // Seating Plan requires API Key
    if (!apiKey && type === 'seating') {
        return NextResponse.json({ error: 'Server configuration error (API Key)' }, { status: 500 });
    }

    if (type === 'seating') {
        // Cache Check
        const now = Date.now();
        const cached = global._examCache;

        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
            console.log(`[ExamAPI] Cache Hit: Serving ${cached.data?.length || 0} entries`);
            return NextResponse.json({ data: cached.data, cached: true });
        }

        try {
            console.log('[ExamAPI] Fetching Seating Plan from Drive...');

            // 1. Fetch File Metadata (Name)
            const metaUrl = `https://www.googleapis.com/drive/v3/files/${SEATING_PLAN_ID}?fields=name&key=${apiKey}`;
            const metaRes = await fetch(metaUrl);
            let fileName = 'Exam';
            if (metaRes.ok) {
                const meta = await metaRes.json();
                fileName = meta.name || 'Exam';
                // Remove extension if present
                fileName = fileName.replace(/\.[^/.]+$/, "");
            }

            // 2. Fetch File Content
            const url = `https://www.googleapis.com/drive/v3/files/${SEATING_PLAN_ID}?alt=media&key=${apiKey}`;
            const res = await fetch(url);

            if (!res.ok) {
                console.error('Drive API Error:', res.statusText);
                return NextResponse.json({ error: 'Failed to fetch Seating Plan file' }, { status: res.status });
            }

            const arrayBuffer = await res.arrayBuffer();

            // Check for PDF signature (%PDF)
            const header = new Uint8Array(arrayBuffer.slice(0, 5));
            const headerStr = Array.from(header).map(b => String.fromCharCode(b)).join('');

            let parsedData: any[] = [];

            if (headerStr.startsWith('%PDF')) {
                console.log('[ExamAPI] Detected PDF. Switching to PDF Parser...');
                const buffer = Buffer.from(arrayBuffer);
                // Pass fileName as Default Date/Context
                parsedData = await parseSeatingPlanPDF(buffer, fileName);
            } else {
                parsedData = parseSeatingPlan(arrayBuffer);
                // Inject Date into Excel data if needed (Excel parser might need update too, but focusing on PDF now)
                if (fileName) {
                    parsedData = parsedData.map(d => ({ ...d, examDate: fileName }));
                }
            }
            console.log(`[ExamAPI] Parse Success: Found ${parsedData.length} entries`);

            // Update Cache
            global._examCache = { data: parsedData, timestamp: now };

            return NextResponse.json({ data: parsedData });


        } catch (error: any) {
            console.error('Seating Plan Error:', error);
            return NextResponse.json({ error: 'Failed to parse Seating Plan' }, { status: 500 });
        }
    }

    if (type === 'datesheet') {
        const filePath = path.join(process.cwd(), 'public', 'datesheet.xlsx');

        if (!fs.existsSync(filePath)) {
            // Return empty data instead of error to prevent UI crash, prompt user to upload
            return NextResponse.json({ data: [], error: 'Datesheet file missing' });
        }

        try {
            const fileBuffer = fs.readFileSync(filePath);
            // Convert Node Buffer to ArrayBuffer
            const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength) as ArrayBuffer;
            const parsedData = parseDatesheet(arrayBuffer);
            return NextResponse.json({ data: parsedData });
        } catch (e) {
            console.error('Datesheet Parse Error:', e);
            return NextResponse.json({ error: 'Failed to parse datesheet' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
}
