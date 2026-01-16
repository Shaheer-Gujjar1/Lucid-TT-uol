
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { parseSeatingPlan } from '@/lib/exam_parser';
import { parseSeatingPlanPDF, getRawPDFText } from '@/lib/pdf_parser';

const SEATING_PLAN_ID = '1YNgAd0YyU2seheGTQzNCs3S6wYrlP9BS';

export async function GET(request: NextRequest) {
    const apiKey = process.env.GOOGLE_SHEETS_API_KEY || '';
    const debugLog: string[] = [];

    const log = (msg: string) => {
        console.log(`[TestSeating] ${msg}`);
        debugLog.push(msg);
    };

    log('Starting Seating Plan Debug Test...');

    if (!apiKey) {
        return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    try {
        const url = `https://www.googleapis.com/drive/v3/files/${SEATING_PLAN_ID}?alt=media&key=${apiKey}`;

        const res = await fetch(url);
        log(`Fetch Status: ${res.status}`);

        if (!res.ok) {
            return NextResponse.json({ error: 'Fetch Failed' }, { status: res.status });
        }

        const arrayBuffer = await res.arrayBuffer();
        log(`Buffer Received: ${arrayBuffer.byteLength} bytes`);

        // Check Type
        const header = new Uint8Array(arrayBuffer.slice(0, 5));
        const headerStr = Array.from(header).map(b => String.fromCharCode(b)).join('');

        let entries: any[] = [];
        let sheetInfo: any = {};

        if (headerStr.startsWith('%PDF')) {
            log('Detected PDF Header. Using PDF Parser...');
            const buffer = Buffer.from(arrayBuffer);

            // Debug Raw Text (Safe)
            try {
                const rawText = await getRawPDFText(buffer);
                log(`PDF Raw Text Extracted. Length: ${rawText.length}`);
                sheetInfo = {
                    type: 'PDF',
                    raw_text_preview: rawText.substring(0, 5000)
                };
            } catch (e: any) {
                log(`Failed to get raw text: ${e.message}`);
            }

            entries = await parseSeatingPlanPDF(buffer);
        } else {
            log('Detected Excel/Other. Using XLSX Parser...');
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            log(`Sheet Names: ${JSON.stringify(workbook.SheetNames)}`);

            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            sheetInfo = {
                names: workbook.SheetNames,
                sample_row: data[0]?.map(c => String(c).substring(0, 20))
            };
            entries = parseSeatingPlan(arrayBuffer);
        }

        log(`Parser Output: ${entries.length} entries`);

        return NextResponse.json({
            status: 'success',
            logs: debugLog,
            sheet_info: sheetInfo,
            parser_result: {
                total_entries: entries.length,
                sample: entries.slice(0, 5)
            }
        });

    } catch (error: any) {
        log(`Exception: ${error.message}`);
        return NextResponse.json({ error: error.message, logs: debugLog }, { status: 500 });
    }
}
