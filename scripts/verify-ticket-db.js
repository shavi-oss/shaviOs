const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkTicketAPI() {
    const ticketId = 'c348ddcf-af67-4352-8d80-30c4326f586f';
    console.log(`Checking DB for Ticket: ${ticketId}`);
    
    // Check Ticket
    const { data: ticket } = await supabase.from('support_tickets').select('id, title').eq('id', ticketId).single();
    if (!ticket) {
        console.log('Ticket NOT FOUND in DB.');
        return;
    }
    console.log(`Ticket Found: ${ticket.title}`);

    // Check Messages
    const { data: msgs, error } = await supabase.from('ticket_messages').select('*').eq('ticket_id', ticketId);
    if (error) console.log('Error fetching messages:', error.message);
    else {
        console.log(`Messages Count: ${msgs.length}`);
        msgs.forEach(m => console.log(`- [${m.sender_type}] ${m.message_body || m.message}`));
    }
}

checkTicketAPI();
