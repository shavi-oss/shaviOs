const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkStudentSchema() {
    console.log('--- Checking Student Tables ---');
    
    // Check for 'students' table
    const { count: studentCount, error: sErr } = await supabase.from('students').select('*', { count: 'exact', head: true });
    console.log('Students Table Exists?', !sErr, 'Count:', studentCount, 'Error:', sErr?.message);

    // Check for 'profiles' or 'users' filtering
    const { count: profileCount, error: pErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
    console.log('Student Profiles Count:', profileCount, 'Error:', pErr?.message);
    
    // Check for 'courses' / 'enrollments'
    const { count: courseCount } = await supabase.from('courses').select('*', { count: 'exact', head: true });
    const { count: enrollCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true });
    console.log('Courses:', courseCount, 'Enrollments:', enrollCount);
}

checkStudentSchema();
