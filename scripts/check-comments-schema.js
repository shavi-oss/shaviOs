
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envLocal = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const envConfig = dotenv.parse(envLocal);

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function checkSchema() {
    console.log('Checking ticket_messages schema...');
    
    // Insert a dummy row to see what fails, or just select 1 to see structure if possible (but select * doesn't give types easily without data)
    // Better: Introspection if possible, or just try to insert with all columns and see error?
    // Or querying information_schema
    
    // We can't query information_schema easily via supabase-js client unless we use rpc or raw sql if exposed.
    // But we have service role.
    
    // Let's try to select one row
    const { data, error } = await supabase.from('ticket_messages').select('*').limit(1);
    
    if (error) {
        console.error('Error selecting:', error);
    } else {
        console.log('Select success. Data:', data);
        if (data.length > 0) {
             console.log('Keys:', Object.keys(data[0]));
        } else {
            console.log('No data to infer columns from.');
            // Try inserting a dummy verify
            const { error: insertError } = await supabase.from('ticket_messages').insert({
                // minimal
                 ticket_id: '00000000-0000-0000-0000-000000000000', // Invalid FK likely
                 message_body: 'test'
            }).select();
            
             if (insertError) {
                 console.log('Insert attempt error:', insertError.message);
                 if (insertError.message.includes('column "message_body" does not exist')) {
                     console.log('--> Column message_body MISSING');
                 }
                  if (insertError.message.includes('relation "ticket_messages" does not exist')) {
                     console.log('--> Table ticket_messages MISSING');
                 }
             }
        }
    }
}

checkSchema();
