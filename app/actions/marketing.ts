'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  type: z.enum(['email', 'social', 'ads', 'content']),
  budget: z.coerce.number().positive('Budget must be positive'),
  start_date: z.string(),
  end_date: z.string(),
  status: z.enum(['active', 'paused', 'draft']).default('draft'),
});

export async function createCampaign(prevState: any, formData: FormData) {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Authentication required' };
    }

    // Parse and validate data
    const validatedFields = createCampaignSchema.safeParse({
        name: formData.get('name'),
        type: formData.get('type'),
        budget: formData.get('budget'),
        start_date: formData.get('start_date'),
        end_date: formData.get('end_date'),
        status: formData.get('status') || 'draft',
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { data, error } = await supabase
        .from('campaigns')
        .insert({
            name: validatedFields.data.name,
            type: validatedFields.data.type,
            budget: validatedFields.data.budget,
            start_date: validatedFields.data.start_date,
            end_date: validatedFields.data.end_date,
            status: validatedFields.data.status,
            created_by: user.id
        })
        .select()
        .single();

    if (error) {
        console.error('Create Campaign Error:', error);
        return { success: false, message: 'Failed to create campaign' };
    }

    revalidatePath('/marketing/campaigns');
    return { success: true, message: 'Campaign created successfully', campaign: data };
}

export async function getCampaigns() {
    const supabase = await createClient();
    
    // Simple fetch for now - can accept filters later
    const { data, error } = await supabase
        .from('campaigns')
        .select(`
            *,
            creator:created_by(full_name)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Campaigns Error:', error);
        return [];
    }

    return data;
}
