
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function resetPassword() {
    console.log('Resetting admin password...');

    // 1. Get Admin User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const adminUser = users.find(u => u.email === 'admin@shavi.com');

    if (!adminUser) {
        console.error('Admin user not found!');
        return;
    }

    console.log(`Found Admin: ${adminUser.id}`);

    // 2. Update Password
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
        adminUser.id,
        { password: 'password123' }
    );

    if (updateError) {
        console.error('Error updating password:', updateError);
    } else {
        console.log('✅ Password reset to "password123" for admin@shavi.com');
    }
}

resetPassword();
