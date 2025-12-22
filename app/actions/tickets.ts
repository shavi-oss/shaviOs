'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSession } from '@/lib/auth';

const createTicketSchema = z.object({
    subject: z.string().min(5, 'Subject must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    student_name: z.string().optional(),
    student_email: z.string().email('Invalid email').optional().or(z.literal('')),
});

import { Database } from '@/lib/database.types';

type Ticket = Database['public']['Tables']['support_tickets']['Row'];

export type ActionState = {
    success: boolean;
    message: string;
    errors?: Record<string, string[]>;
    ticket?: Ticket;
};

export async function createTicket(prevState: ActionState | null, formData: FormData) {
    // Get current session
    const session = await getSession();
    if (!session || !session.user) {
        return { success: false, message: 'Authentication required' };
    }

    const supabase = await createClient();

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
    const session = await getSession();
    if (!session) {
        return [];
    }

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

/**
 * Update Ticket Status/Priority/Assignment
 * Requires: customer_success, admin, or manager role
 */
const updateTicketSchema = z.object({
    status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    assigned_to_id: z.string().uuid().optional(),
    resolution_notes: z.string().optional(),
});

export async function updateTicket(ticketId: string, updates: z.infer<typeof updateTicketSchema>) {
    // 1. Authentication
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    // 2. Authorization (agents, managers, and admins can update)
    const allowedRoles = ['admin', 'manager', 'customer_success'];
    if (!allowedRoles.includes(session.user.role || '')) {
        throw new Error('Insufficient permissions: customer success role required');
    }

    // 3. Validation
    const validated = updateTicketSchema.parse(updates);

    // 4. Database update
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('support_tickets')
        .update(validated)
        .eq('id', ticketId)
        .select()
        .single();

    if (error) {
        console.error('Update Ticket Error:', error);
        throw new Error('Failed to update ticket');
    }

    // 5. Revalidate
    revalidatePath('/customer-success/tickets');
    revalidatePath('/customer-success/my-queue');
    return data;
}

/**
 * Get Tickets Assigned to Current User
 */
export async function getMyTickets() {
    const session = await getSession();
    if (!session || !session.user) {
        return [];
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('assigned_to_id', session.user.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Fetch My Tickets Error:', error);
        return [];
    }

    return data || [];
}

/**
 * Assign Ticket to Agent
 * Requires: admin or manager role
 */
export async function assignTicket(ticketId: string, agentId: string | null) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    // Only managers and admins can assign tickets
    const allowedRoles = ['admin', 'manager'];
    if (!allowedRoles.includes(session.user.role || '')) {
        throw new Error('Insufficient permissions: manager or admin role required');
    }

    const supabase = await createClient();
    const { data, error } = await supabase
        .from('support_tickets')
        .update({
            assigned_to_id: agentId,
            status: agentId ? 'in_progress' : 'open', // Set to in_progress if assigning, open if unassigning
        })
        .eq('id', ticketId)
        .select()
        .single();

    if (error) {
        console.error('Assign Ticket Error:', error);
        throw new Error('Failed to assign ticket');
    }

    revalidatePath('/customer-success/tickets');
    revalidatePath('/customer-success/my-queue');
    return data;
}

/**
 * Get Tickets by Status Filter
 */
export async function getTicketsByStatus(status?: string) {
    const session = await getSession();
    if (!session) {
        return [];
    }

    const supabase = await createClient();
    let query = supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Fetch Tickets by Status Error:', error);
        return [];
    }

    return data || [];
}

/**
 * Ticket Comments / Messages (Strict MVP)
 * 
 * Rules:
 * 1. Immutable (Insert Only)
 * 2. RBAC: Internal roles only (for now)
 * 3. SLA: Updates first_response_at on first internal reply
 */

const addCommentSchema = z.object({
    message_body: z.string().min(1, "Message cannot be empty"),
    is_internal: z.boolean().default(false),
});

export async function addTicketComment(ticketId: string, content: string, isInternal: boolean = false) {
    // 1. Authentication
    const session = await getSession();
    if (!session || !session.user) throw new Error('Unauthorized');

    // 2. Authorization (RBAC) - Strictly Internal Roles for MVP
    const allowedRoles = ['admin', 'manager', 'customer_success'];
    if (!allowedRoles.includes(session.user.role || '')) {
        throw new Error('Forbidden: Only internal staff can add comments');
    }

    // 3. Validation
    const validated = addCommentSchema.safeParse({ message_body: content, is_internal: isInternal });
    if (!validated.success) {
        throw new Error('Validation failed: ' + validated.error.message);
    }

    const supabase = await createClient();

    // 4. SLA Hook: Check and update first_response_at
    // Only if it's an internal user replying publicly (not internal note)
    if (!isInternal) {
         const { data: ticket } = await supabase
            .from('support_tickets')
            .select('first_response_at')
            .eq('id', ticketId)
            .single();
        
         if (ticket && !ticket.first_response_at) {
             await supabase
                .from('support_tickets')
                .update({ first_response_at: new Date().toISOString() })
                .eq('id', ticketId);
         }
    }

    // 5. Database Insert (Immutable)
    // @ts-ignore - mismatch between local types (message) and migration (message_body)
    const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
            ticket_id: ticketId,
            sender_id: session.user.id,
            sender_type: 'agent', // Enforced as agent for RBAC roles
            message_body: validated.data.message_body,
            is_internal: validated.data.is_internal,
        } as any)
        .select()
        .single();

    if (error) {
        console.error('Add Comment Error:', error);
        throw new Error('Failed to add comment');
    }

    revalidatePath(`/customer-success/tickets/${ticketId}`);
    return data;
}

export async function getTicketComments(ticketId: string) {
    const session = await getSession();
    if (!session) return [];

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Get Comments Error:', error);
        return [];
    }

    return data;
}

// Alias for backward compatibility if needed, else deprecate
export const getTicketMessages = getTicketComments;
