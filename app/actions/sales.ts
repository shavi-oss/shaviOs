'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { Database } from '@/lib/database.types';

type Deal = Database['public']['Tables']['deals']['Row'];

/**
 * Update Deal Stage and Trigger Automated Workflows
 */
export async function updateDealStage(dealId: string, newStage: string) {
    const supabase = await createClient();
    
    try {
        // 1. Fetch current deal to get value and assignee
        const { data: deal, error: fetchError } = await supabase
            .from('deals')
            .select('*')
            .eq('id', dealId)
            .single();

        if (fetchError || !deal) throw new Error('Deal not found');

        // 2. Update Deal
        const { error: updateError } = await supabase
            .from('deals')
            .update({ 
                stage: newStage,
                // Set actual_close_date if won/lost
                actual_close_date: ['closed_won', 'closed_lost'].includes(newStage) ? new Date().toISOString() : null
            })
            .eq('id', dealId);

        if (updateError) throw updateError;

        // 3. Workflow: Automated Commission on 'closed_won'
        if (newStage === 'closed_won' && deal.assigned_to_id && deal.value > 0) {
            await createCommissionForDeal(deal);
        }

        revalidatePath('/sales');
        revalidatePath('/sales/deals');
        return { success: true };

    } catch (error: any) {
        logger.error('updateDealStage error', error);
        return { success: false, error: error.message };
    }
}

/**
 * PRIVATE: Create Commission Record
 */
async function createCommissionForDeal(deal: Deal) {
    const supabase = await createClient();
    const COMMISSION_RATE = 0.05; // 5% Standard

    const amount = (deal.value || 0) * COMMISSION_RATE;

    const { error } = await supabase.from('commissions').insert({
        employee_id: deal.assigned_to_id!, // Verified not null before calling
        deal_id: deal.id,
        amount: amount,
        currency: deal.currency || 'EGP',
        type: 'deal_commission',
        status: 'pending',
        notes: `Automated commission for deal: ${deal.title}`
    });

    if (error) {
        logger.error('Failed to create commission', error);
        // Don't fail the deal update, but log critical error
    }
}
