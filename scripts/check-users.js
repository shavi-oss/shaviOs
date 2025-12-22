
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const envConfig = dotenv.parse(envLocal);

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkUsers() {
  console.log('Checking profiles...');
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, department')
    .limit(10);

  if (error) {
    console.error('Error fetching profiles:', error);
  } else {
    console.table(profiles);
    
    // Check for managers
    const managers = profiles.filter(p => p.role === 'manager' || p.role === 'admin');
    console.log(`Found ${managers.length} managers/admins.`);
  }
}

checkUsers();
