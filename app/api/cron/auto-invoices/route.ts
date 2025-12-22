import { processPendingAutoInvoices } from '@/app/actions/automation';
import { NextResponse } from 'next/server';

/**
 * Cron Job: Process Pending Auto-Invoices
 * Schedule: Every 15 minutes
 * SLA: Process at least 50 items per run, <1min per invoice
 */
export async function GET(request: Request) {
    try {
        // 1. Verify cron secret (security)
        const authHeader = request.headers.get('authorization');
        const validAuth = `Bearer ${process.env.CRON_SECRET}`;
        
        if (authHeader !== validAuth) {
            console.error('Unauthorized cron access attempt');
            return new NextResponse('Unauthorized', { status: 401 });
        }
        
        // 2. Execute batch job
        const result = await processPendingAutoInvoices();
        
        // 3. Return status
        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

// Vercel cron configuration
export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 1 minute max
