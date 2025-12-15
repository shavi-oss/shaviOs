import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const body = await request.json();

        // Get current user if any
        const { data: { user } } = await supabase.auth.getUser();

        const {
            message,
            stack,
            componentStack,
            url,
            userAgent,
            type = 'client_error',
            severity = 'medium'
        } = body;

        const { error } = await supabase
            .from('error_logs')
            .insert({
                type,
                message,
                stack,
                component_stack: componentStack,
                user_id: user?.id,
                url,
                user_agent: userAgent,
                ip_address: request.headers.get('x-forwarded-for') || 'unknown',
                severity
            });

        if (error) {
            console.error('Error logging to DB:', error);
            return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('API Error Logging failed:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
