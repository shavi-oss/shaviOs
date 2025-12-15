'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

export async function getWebhookLogs() {
    try {
        // Optional: Check if user is authenticated at all (Basic protection)
        // const cookieStore = cookies();
        // ... (User auth check logic can go here if needed, but for now we assume the page is protected by middleware)

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
    } catch (error: any) {
        console.error('Unexpected error in getWebhookLogs:', error);
        return { success: false, error: error.message };
    }
}
