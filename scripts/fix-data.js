
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const envConfig = dotenv.parse(envLocal);

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY);

async function fixData() {
  console.log('Fixing data...');
  
  // 1. Set Admin Department to customer_success
  const { data: admin, error: err1 } = await supabase
    .from('profiles')
    .update({ department: 'customer_success' })
    .eq('email', 'admin@shavi.com')
    .select();
    
  if (err1) console.error('Error updating admin:', err1);
  else console.log('Updated Admin:', admin);

  // 2. Set CS Agent Name
  const { data: cs, error: err2 } = await supabase
    .from('profiles')
    .update({ full_name: 'CS Agent 1' })
    .eq('email', 'cs@shaviacademy.com')
    .select();

  if (err2) console.error('Error updating CS Agent:', err2);
  else console.log('Updated CS Agent:', cs);
}

fixData();
