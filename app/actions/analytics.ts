'use server';

import { createClient } from '@/lib/supabase/server';
import { getSession } from '@/lib/auth';

export async function getTicketStats() {
    const session = await getSession();
    if (!session) return null;

    const supabase = await createClient();

    // Open Tickets
    const { count: openCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

    // Resolved this week
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { count: resolvedCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'resolved')
        .gte('updated_at', startOfWeek.toISOString());

    // SLA Breaches (Open)
    const { count: breachCount } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .lt('sla_due_at', new Date().toISOString())
        .in('status', ['open', 'in_progress'])
        .not('sla_due_at', 'is', null);

    return {
        openTickets: openCount || 0,
        resolvedThisWeek: resolvedCount || 0,
        slaBreaches: breachCount || 0,
        // CSAT is hard to calculate without a survey table, returning mock for now or 0
        csatScore: 'N/A' 
    };
}

export async function getWeeklyVolume() {
    const session = await getSession();
    if (!session) return [];

    const supabase = await createClient();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const volumeData = [];

    // Get last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dayName = days[d.getDay()];
        const startOfDay = new Date(d.setHours(0, 0, 0, 0)).toISOString();
        const endOfDay = new Date(d.setHours(23, 59, 59, 999)).toISOString();

        // Created count
        const { count: created } = await supabase
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfDay)
            .lte('created_at', endOfDay);

        // Resolved count
        const { count: resolved } = await supabase
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'resolved')
            .gte('updated_at', startOfDay)
            .lte('updated_at', endOfDay);

        volumeData.push({
            day: dayName,
            tickets: created || 0,
            resolved: resolved || 0
        });
    }

    return volumeData;
}
