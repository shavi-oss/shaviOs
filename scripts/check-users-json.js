
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const envConfig = dotenv.parse(envLocal);

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function checkUsers() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, department');

  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(JSON.stringify(profiles, null, 2));
}

checkUsers();
