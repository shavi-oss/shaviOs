
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envLocal = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const envConfig = dotenv.parse(envLocal);

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function debugMessages() {
    console.log('Debugging ticket_messages...');

    // 1. Count total messages
    const { count, error: countError } = await supabase.from('ticket_messages').select('*', { count: 'exact', head: true });
    console.log('Total messages:', count, countError ? countError.message : 'OK');

    // 2. Fetch last 5 messages
    const { data: messages, error: selectError } = await supabase
        .from('ticket_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (selectError) {
        console.error('Select Error:', selectError);
    } else {
        console.log('Last 5 messages:', JSON.stringify(messages, null, 2));
    }
}

debugMessages();
