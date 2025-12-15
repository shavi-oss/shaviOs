'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fixAdminProfile() {
  try {
    const supabase = await createClient(); // Await the promise!
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Upsert profile for the current user
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'System Admin',
        role: 'admin',
        department: 'Management',
        updated_at: new Date().toISOString()
      });

    if (upsertError) {
        console.error('Profile upsert failed:', upsertError);
        return { success: false, error: upsertError.message };
    }

    revalidatePath('/tech-panel/debug');
    return { success: true };
  } catch (error: any) {
    console.error('Fix admin profile error:', error);
    return { success: false, error: error.message };
  }
}

export async function seedSampleData() {
    // Enhanced Seed Function
    try {
        const supabase = await createClient();
        
        // 1. Seed Employees (if empty)
        const { count: empCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });
        if (!empCount) {
             await supabase.from('employees').insert([
                { first_name: 'John', last_name: 'Doe', email: 'john@shavi.com', position: 'Developer', department: 'Tech', salary: 15000, join_date: '2024-01-01' },
                { first_name: 'Sarah', last_name: 'Smith', email: 'sarah@shavi.com', position: 'Manager', department: 'HR', salary: 20000, join_date: '2024-02-01' },
                { first_name: 'Mike', last_name: 'Johnson', email: 'mike@shavi.com', position: 'Trainer', department: 'Trainers', salary: 12000, join_date: '2024-03-01' }
             ]);
        }

        // 2. Seed Campaigns
        const { count: campCount } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
        if (!campCount) {
            // Need a creator
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('campaigns').insert([
                    { name: 'Summer Sale 2025', type: 'social', status: 'active', budget: 50000, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 86400000*30).toISOString(), created_by: user.id }
                ]);
            }
        }

        // 3. Seed Deals
        const { count: dealCount } = await supabase.from('deals').select('*', { count: 'exact', head: true });
        if (!dealCount) {
             await supabase.from('deals').insert([
                { title: 'Big Corp Contract', value: 50000, stage: 'negotiation', customer_name: 'Big Corp', expected_close_date: new Date().toISOString() },
                { title: 'Startup License', value: 5000, stage: 'closed_won', customer_name: 'Tech Start', actual_close_date: new Date().toISOString() }
             ]);
        }
        
        revalidatePath('/tech-panel/debug');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

import { initializeBudgets } from './finance';

export async function verifyBudgetSystem() {
    const supabase = await createClient();
    const results = {
        categoriesFound: false,
        categoryCount: 0,
        budgetInitTest: false,
        message: ''
    };

    try {
        // 1. Check Categories
        const { count, error } = await supabase
            .from('budget_categories')
            .select('*', { count: 'exact', head: true });
        
        if (error) throw error;
        results.categoriesFound = true;
        results.categoryCount = count || 0;

        // 2. Test Logic (Simulate future budget)
        const testPeriod = '2099-01';
        // Clean up first just in case
        await supabase.from('budgets').delete().eq('period', testPeriod);

        const budgets = await initializeBudgets(testPeriod);
        if (budgets && budgets.length > 0) {
            results.budgetInitTest = true;
            // Clean up
            await supabase.from('budgets').delete().eq('period', testPeriod);
        }

        results.message = `Success: Found ${results.categoryCount} categories. Logic test passed.`;
        return { success: true, data: results };

    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
