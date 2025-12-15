'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createTicketSchema = z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    student_name: z.string().optional(),
    student_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

export async function createTicket(prevState: any, formData: FormData) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, message: 'Authentication required' };
    }

    // Parse and validate data
    const validatedFields = createTicketSchema.safeParse({
        subject: formData.get('subject'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        student_name: formData.get('student_name'),
        student_email: formData.get('student_email'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            message: 'Validation failed',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { data, error } = await supabase
        .from('support_tickets')
        .insert({
            title: validatedFields.data.subject, // Schema uses 'title'
            description: validatedFields.data.description,
            priority: validatedFields.data.priority,
            student_name: validatedFields.data.student_name,
            student_email: validatedFields.data.student_email,
            status: 'open',
            // assigned_to could be auto-assigned later
        })
        .select()
        .single();

    if (error) {
        console.error('Create Ticket Error:', error);
        return { success: false, message: 'Failed to create ticket' };
    }

    revalidatePath('/customer-success/tickets');
    return { success: true, message: 'Ticket created successfully', ticket: data };
}

export async function getTickets() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch Tickets Error:', error);
        return [];
    }

    return data;
}
