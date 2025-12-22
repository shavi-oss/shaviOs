const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectTicket() {
    const ticketId = 'c348ddcf-af67-4352-8d80-30c4326f586f';
    console.log(`--- Inspecting Ticket: ${ticketId} ---`);

    // 1. Get Ticket Details
    const { data: ticket, error: tErr } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();
    
    if (tErr) {
        console.error('Ticket Error:', tErr.message);
        return;
    }
    console.log('Ticket:', {
        id: ticket.id,
        title: ticket.title,
        status: ticket.status,
        first_response_at: ticket.first_response_at
    });

    // 2. Get Messages
    const { data: msgs, error: mErr } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at');
    
    if (mErr) console.error('Messages Error:', mErr.message);
    else {
        console.log(`Found ${msgs.length} messages.`);
        msgs.forEach(m => console.log(`[${m.sender_type}] ${m.is_internal ? '(INTERNAL)' : ''}: ${m.message_body || m.message}`));
    }
}

inspectTicket();
