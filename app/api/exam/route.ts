
import { NextRequest, NextResponse } from 'next/server';
import { parseSeatingPlan, parseDatesheet } from '@/lib/exam_parser';
import fs from 'fs';
import path from 'path';
import { parseSeatingPlanPDF } from '@/lib/pdf_parser';

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Global cache to persist across hot reloads in dev
declare global {
    var _examCache: { [key: string]: { data: any, timestamp: number } } | undefined;
}

// Configuration
const SEATING_PLAN_FILE_ID = process.env.SEATING_PLAN_FILE_ID || '1YNgAd0YyU2seheGTQzNCs3S6wYrlP9BS';
const SEATING_PLAN_FOLDER_ID = process.env.SEATING_PLAN_FOLDER_ID || '1-N4iIKObpxT6J9rL2vNNUt3LCtzlCmfG';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'seating' | 'datesheet'
    const requestedFileId = searchParams.get('fileId');
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';

    // Seating Plan requires API Key
    if (!apiKey && type === 'seating') {
        return NextResponse.json({ error: 'Server configuration error (API Key)' }, { status: 500 });
    }

    if (type === 'seating') {
        const now = Date.now();
        // Initialize cache if needed
        if (!global._examCache) global._examCache = {};

        // Construct a cache key based on file/folder
        const isRefresh = searchParams.get('refresh') === 'true';
        const cacheKey = requestedFileId ? `file_${requestedFileId}` : `folder_${SEATING_PLAN_FOLDER_ID}`;
        const cached = global._examCache[cacheKey];

        if (!isRefresh && cached && (now - cached.timestamp < CACHE_DURATION)) {
            console.log(`[ExamAPI] Cache Hit (${cacheKey}): Serving ${cached.data?.data?.length || 0} entries`);
            return NextResponse.json({ ...cached.data, cached: true });
        }

        try {
            console.log('[ExamAPI] Fetching Seating Plan info...');
            let targetFileId = requestedFileId;
            let targetFileName = 'Exam';
            let availableFiles: { id: string, name: string }[] = [];

            // 1. If Folder ID is present, fetch file list first
            if (SEATING_PLAN_FOLDER_ID) {
                const listUrl = `https://www.googleapis.com/drive/v3/files?q='${SEATING_PLAN_FOLDER_ID}' in parents and mimeType='application/pdf' and trashed=false&fields=files(id, name)&key=${apiKey}`;
                const listRes = await fetch(listUrl);

                if (listRes.ok) {
                    const listData = await listRes.json();
                    console.log(`[ExamAPI] Folder List Response: Found ${listData.files?.length} files`);
                    if (listData.files && listData.files.length > 0) {
                        availableFiles = listData.files.map((f: any) => ({
                            id: f.id,
                            name: f.name.replace(/\.[^/.]+$/, "") // Remove extension
                        }));

                        // Default to the first file (or maybe sort by name?)
                        // Sorting by name might be safer if they are "Slot 1", "Slot 2"
                        availableFiles.sort((a, b) => a.name.localeCompare(b.name));

                        // Only auto-select if no specific file was requested
                        if (!requestedFileId) {
                            targetFileId = availableFiles[0].id;
                            targetFileName = availableFiles[0].name;
                        } else {
                            // If requestedFileId is present, try to find its name in the list
                            const found = availableFiles.find(f => f.id === requestedFileId);
                            if (found) targetFileName = found.name;
                        }

                        console.log(`[ExamAPI] Found ${availableFiles.length} files. Files: ${JSON.stringify(availableFiles.map(f => f.name))}`);
                    }
                } else {
                    const errText = await listRes.text();
                    console.error('[ExamAPI] Failed to list folder contents:', listRes.status, listRes.statusText, errText);
                }
            }

            // Fallback to single file ID if no folder logic worked or no files found
            if (!targetFileId) {
                targetFileId = SEATING_PLAN_FILE_ID;
            }

            // If we have a specific file ID (either requested or resolved from folder), get its name if we don't have it
            if (targetFileId && !targetFileName && !availableFiles.length) {
                const metaUrl = `https://www.googleapis.com/drive/v3/files/${targetFileId}?fields=name&key=${apiKey}`;
                const metaRes = await fetch(metaUrl);
                if (metaRes.ok) {
                    const meta = await metaRes.json();
                    targetFileName = meta.name || 'Exam';
                    targetFileName = targetFileName.replace(/\.[^/.]+$/, "");
                }
            }

            // Should verify we have a targetFileId
            if (!targetFileId) {
                return NextResponse.json({ error: 'No Seating Plan configuration found' }, { status: 404 });
            }


            // 2. Fetch File Content
            console.log(`[ExamAPI] Fetching content for file: ${targetFileId}`);
            const url = `https://www.googleapis.com/drive/v3/files/${targetFileId}?alt=media&key=${apiKey}`;
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
                const buffer = Buffer.from(arrayBuffer);
                parsedData = await parseSeatingPlanPDF(buffer, targetFileName);
            } else {
                parsedData = parseSeatingPlan(arrayBuffer);
                if (targetFileName) {
                    parsedData = parsedData.map(d => ({ ...d, examDate: targetFileName }));
                }
            }
            console.log(`[ExamAPI] Parse Success: Found ${parsedData.length} entries`);

            const responsePayload = {
                data: parsedData,
                files: availableFiles,
                activeFileId: targetFileId
            };

            // Update Cache
            global._examCache[cacheKey] = { data: responsePayload, timestamp: now };

            return NextResponse.json(responsePayload);


        } catch (error: any) {
            console.error('Seating Plan Error:', error);
            return NextResponse.json({ error: 'Failed to parse Seating Plan' }, { status: 500 });
        }
    }

    if (type === 'datesheet') {
        const filePath = path.join(process.cwd(), 'public', 'datesheet.xlsx');

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ data: [], error: 'Datesheet file missing' });
        }

        try {
            const fileBuffer = fs.readFileSync(filePath);
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
