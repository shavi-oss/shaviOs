'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { Database } from '@/lib/database.types';

type Deal = Database['public']['Tables']['deals']['Row'];

/**
 * Create a New Deal
 */
export async function createDeal(data: Partial<Deal> & { notes?: string }) {
    const supabase = await createClient();
    
    try {
        // 1. Create Deal (Exclude notes from direct insert as column doesn't exist)
        const { data: newDeal, error } = await supabase
            .from('deals')
            .insert({
                title: data.title || 'New Deal', // Fix: Ensure title is string
                value: data.value || 0,
                currency: data.currency || 'EGP',
                stage: data.stage || 'lead',
                customer_name: data.customer_name || null,
                customer_company: data.customer_company || null,
                expected_close_date: data.expected_close_date || null
            })
            .select()
            .single();

        if (error) throw error;

        // 2. Add Initial Note if provided (store in deal_activities)
        if (data.notes && newDeal) {
            await supabase.from('deal_activities').insert({
                deal_id: newDeal.id,
                type: 'note',
                content: data.notes,
                occurred_at: new Date().toISOString()
                // performed_by will be handled by RLS/Trigger usually, or we can try adding it if we have user context.
                // For now, let's rely on default or just insert content/type.
            });
        }

        revalidatePath('/sales');
        revalidatePath('/sales/deals');
        return { success: true, deal: newDeal };

    } catch (error: unknown) {
        logger.error('createDeal error', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Update Deal Stage and Trigger Automated Workflows
 */
export async function updateDealStage(dealId: string, newStage: string) {
    const supabase = await createClient();
    
    try {
        const { data: deal, error } = await supabase
            .from('deals')
            .update({ stage: newStage, updated_at: new Date().toISOString() })
            .eq('id', dealId)
            .select()
            .single();

        if (error) throw error;

        // If stage changed to closed_won, trigger commission calculation
        if (newStage === 'closed_won' && deal) {
            await calculateCommission(dealId, deal.value);
        }

        revalidatePath('/sales');
        revalidatePath('/sales/deals');
        revalidatePath('/sales/pipeline');

        return { success: true, deal };
    } catch (error: unknown) {
        logger.error('updateDealStage error', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Calculate Commission for a Won Deal
 */
async function calculateCommission(dealId: string, dealValue: number | null) {
    if (!dealValue) return;

    const supabase = await createClient();
    
    try {
        // Get deal owner
        const { data: deal } = await supabase
            .from('deals')
            .select('assigned_to_id')
            .eq('id', dealId)
            .single();

        if (!deal?.assigned_to_id) return;

        // Create commission record (adjust commission rate as needed)
        const commissionRate = 0.05; // 5%
        const commissionAmount = dealValue * commissionRate;

        await supabase.from('commissions').insert({
            employee_id: deal.assigned_to_id,
            deal_id: dealId,
            amount: commissionAmount,
            status: 'pending'
        });

    } catch (error: unknown) {
        logger.error('calculateCommission error', error);
    }
}

/**
 * Get Sales Dashboard Statistics (Server Action)
 * Replaces client-side useEffect fetching
 */
export async function getSalesStats() {
    const supabase = await createClient();
    
    try {
        // Get deals
        const { data: deals, error: dealsError } = await supabase
            .from('deals')
            .select('*');
        
        if (dealsError) throw dealsError;
        
        // Calculate stats
        const totalDeals = deals?.length || 0;
        const wonDeals = deals?.filter(d => d.stage === 'closed_won').length || 0;
        const activeDeals = deals?.filter(d => !['closed_won', 'closed_lost'].includes(d.stage || '')).length || 0;
        const totalValue = deals?.reduce((sum, d) => sum + Number(d.value || 0), 0) || 0;
        const wonValue = deals?.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + Number(d.value || 0), 0) || 0;
        
        return {
            totalDeals,
            wonDeals,
            activeDeals,
            totalValue,
            wonValue,
            conversionRate: totalDeals > 0 ? Math.round((wonDeals / totalDeals) * 100) : 0
        };
    } catch (error: unknown) {
        logger.error('getSalesStats error', error);
        return {
            totalDeals: 0,
            wonDeals: 0,
            activeDeals: 0,
            totalValue: 0,
            wonValue: 0,
            conversionRate: 0
        };
    }
}

/**
 * Get Deals with Optional Filters (Server Action)
 * Replaces client-side supabase.from('deals') calls
 */
export async function getDeals(stageFilter: string = 'all') {
    const supabase = await createClient();
    
    try {
        let query = supabase
            .from('deals')
            .select('*')
            .order('created_at', { ascending: false });

        if (stageFilter !== 'all') {
            query = query.eq('stage', stageFilter);
        }

        const { data, error } = await query;

        if (error) {
            logger.error('getDeals error', error);
            return [];
        }

        return data || [];
    } catch (error: unknown) {
        logger.error('getDeals error', error);
        return [];
    }
}

/**
 * Get Deals Pipeline Data
 * Returns deals organized by stage with metrics
 */
export async function getDealsPipeline() {
    const supabase = await createClient();
    
    try {
        // Fetch all deals
        const { data: deals, error } = await supabase
            .from('deals')
            .select('*')
            .order('expected_close_date', { ascending: true });
        
        if (error) throw error;
        
        // Define pipeline stages
        const stages = [
            { name: 'lead', label: 'Lead', color: 'bg-gray-100' },
            { name: 'contacted', label: 'Contacted', color: 'bg-blue-100' },
            { name: 'proposal', label: 'Proposal', color: 'bg-yellow-100' },
            { name: 'negotiation', label: 'Negotiation', color: 'bg-orange-100' },
            { name: 'closed_won', label: 'Won', color: 'bg-green-100' },
            { name: 'closed_lost', label: 'Lost', color: 'bg-red-100' },
        ];
        
        // Calculate metrics per stage
        const pipelineStages = stages.map(stage => {
            const stageDeals = deals?.filter(d => d.stage === stage.name) || [];
            const stageValue = stageDeals.reduce((sum, d) => sum + Number(d.value || 0), 0);
            
            return {
                ...stage,
                deals: stageDeals,
                count: stageDeals.length,
                value: stageValue,
            };
        });
        
        // Calculate overall metrics
        const totalDeals = deals?.length || 0;
        const totalValue = deals?.reduce((sum, d) => sum + Number(d.value || 0), 0) || 0;
        
        // Pipeline value (active stages only)
        const pipelineValue = deals
            ?.filter(d => !['closed_won', 'closed_lost'].includes(d.stage || ''))
            .reduce((sum, d) => sum + Number(d.value || 0), 0) || 0;
        
        // Expected revenue (proposal + negotiation)
        const expectedRevenue = deals
            ?.filter(d => ['proposal', 'negotiation'].includes(d.stage || ''))
            .reduce((sum, d) => sum + Number(d.value || 0), 0) || 0;
        
        // Conversion rate
        const wonDeals = deals?.filter(d => d.stage === 'closed_won').length || 0;
        const lostDeals = deals?.filter(d => d.stage === 'closed_lost').length || 0;
        const completedDeals = wonDeals + lostDeals;
        const conversionRate = completedDeals > 0 
            ? ((wonDeals / completedDeals) * 100).toFixed(1) 
            : '0';
        
        // Average deal size
        const avgDealSize = totalDeals > 0 ? totalValue / totalDeals : 0;
        
        return {
            stages: pipelineStages,
            metrics: {
                total: totalValue,
                pipeline: pipelineValue,
                expected: expectedRevenue,
                conversionRate,
                avgDealSize,
                totalDeals,
                wonDeals,
                lostDeals,
            },
        };
    } catch (error: unknown) {
        logger.error('getDealsPipeline error', error);
        return {
            stages: [],
            metrics: {
                total: 0,
                pipeline: 0,
                expected: 0,
                conversionRate: '0',
                avgDealSize: 0,
                totalDeals: 0,
                wonDeals: 0,
                lostDeals: 0,
            },
        };
    }
}
