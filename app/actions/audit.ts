'use server';

import { createClient } from '@supabase/supabase-js';
// cookies import removed

// Create a Supabase client with the SERVICE ROLE key to bypass RLS
// This is strictly for Admin/System use (Audit Logs)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

import { getSession } from '@/lib/auth';

// ... (supabaseAdmin def)

export async function getWebhookLogs() {
    try {
        const session = await getSession();
        if (!session || !session.user || (session.user.role !== 'admin' && session.user.role !== 'developer')) {
            return { success: false, error: 'Unauthorized: Requires admin or developer role' };
        }

        const { data, error } = await supabaseAdmin
            .from('audit_logs')
            .select('*')
            .eq('action', 'WEBHOOK_NAZMLY_RECEIVED')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Error fetching webhook logs:', error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: unknown) {
        console.error('Unexpected error in getWebhookLogs:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
