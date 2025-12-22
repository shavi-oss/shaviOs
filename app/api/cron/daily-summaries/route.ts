import { generateDailySummary } from '@/app/actions/automation';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Cron Job: Daily Summary Notifications
 * Schedule: Daily at 8:00 AM
 * Sends consolidated summary to avoid alert fatigue
 */
export async function GET(request: Request) {
    try {
        // 1. Verify cron secret
        const authHeader = request.headers.get('authorization');
        const validAuth = `Bearer ${process.env.CRON_SECRET}`;
        
        if (authHeader !== validAuth) {
            return new NextResponse('Unauthorized', { status: 401 });
        }
        
        // 2. Get all sales users
        const supabase = await createClient();
        const { data: users } = await supabase
            .from('profiles')
            .select('id, full_name, department')
            .eq('department', 'Sales');
        
        if (!users || users.length === 0) {
            return NextResponse.json({
                success: true,
                sent: 0,
                message: 'No sales users found'
            });
        }
        
        // 3. Generate summary for each user
        let successCount = 0;
        const errors: string[] = [];
        
        for (const user of users) {
            try {
                await generateDailySummary(user.id);
                successCount++;
            } catch (error) {
                errors.push(`Failed for user ${user.full_name}: ${error}`);
            }
        }
        
        // 4. Return results
        return NextResponse.json({
            success: true,
            totalUsers: users.length,
            sent: successCount,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Daily summary cron error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
