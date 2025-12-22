
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf8');
const envConfig = dotenv.parse(envLocal);

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.SUPABASE_SERVICE_ROLE_KEY || envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listColumns() {
  console.log('Fetching columns for support_tickets...');
  
  // Method 1: RPC if available (unlikely for arbitrary query)
  // Method 2: Select * limit 0 and look at returned object keys? No, supabase-js returns data array.
  
  // Since we can't query information_schema directly with supabase-js easily unless we have a specific function,
  // We will try to insert a dummy row or select specific expected columns and see which fail.
  // Actually, we can check "title" explicitly.
  
  const columnsToCheck = [
    'id', 'title', 'subject', 'description', 'status', 'priority', 
    'assigned_to', 'assigned_to_id', 
    'escalation_level', 'sla_due_at', 'first_response_at', 'resolved_at'
  ];
  
  const results = {};
  
  for (const col of columnsToCheck) {
    const { error } = await supabase.from('support_tickets').select(col).limit(1);
    results[col] = !error;
  }
  
  console.log('Column Existence:', JSON.stringify(results, null, 2));
}

listColumns();
