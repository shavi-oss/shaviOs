const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedStudent() {
    console.log('--- Seeding Test Student ---');
    const { data, error } = await supabase.from('students').insert({
        full_name: 'Test Student ' + Math.floor(Math.random() * 1000),
        email: `test${Date.now()}@example.com`,
        status: 'active',
        progress: 15
    }).select();

    if (error) console.error('Error:', error.message);
    else console.log('Created:', data[0].full_name);
}

seedStudent();
