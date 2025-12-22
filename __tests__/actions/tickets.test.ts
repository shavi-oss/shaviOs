import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTicket, updateTicket, getMyTickets, assignTicket, getTicketsByStatus } from '@/app/actions/tickets';

// Mock the dependencies
vi.mock('@/lib/auth', () => ({
    getSession: vi.fn(),
}));

vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

import { getSession } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

describe('Customer Success - Tickets Actions', () => {
    let mockSupabase: any;

    beforeEach(() => {
        vi.clearAllMocks();
        
        // Setup mock Supabase client
        mockSupabase = {
            from: vi.fn().mockReturnThis(),
            insert: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
        };
        
        (createClient as any).mockResolvedValue(mockSupabase);
    });

    describe('createTicket', () => {
        it('requires authentication', async () => {
            (getSession as any).mockResolvedValue(null);
            
            const formData = new FormData();
            formData.append('subject', 'Test Subject');
            formData.append('description', 'Test Description');
            formData.append('priority', 'high');
            
            const result = await createTicket(null, formData);
            
            expect(result.success).toBe(false);
            expect(result.message).toBe('Authentication required');
        });

        it('validates input with Zod', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            const formData = new FormData();
            formData.append('subject', 'Too short'); // Less than 5 chars
            formData.append('description', 'Short'); // Less than 10 chars
            formData.append('priority', 'high');
            
            const result = await createTicket(null, formData);
            
            expect(result.success).toBe(false);
            expect(result.message).toBe('Validation failed');
            expect(result.errors).toBeDefined();
        });

        it('creates ticket successfully', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            mockSupabase.single.mockResolvedValue({
                data: { id: 'ticket-1', title: 'Test Subject' },
                error: null
            });
            
            const formData = new FormData();
            formData.append('subject', 'Valid Test Subject');
            formData.append('description', 'This is a valid description with enough characters');
            formData.append('priority', 'high');
            
            const result = await createTicket(null, formData);
            
            expect(result.success).toBe(true);
            expect(result.message).toBe('Ticket created successfully');
            expect(result.ticket).toBeDefined();
        });
    });

    describe('updateTicket', () => {
        it('requires authentication', async () => {
            (getSession as any).mockResolvedValue(null);
            
            await expect(updateTicket('ticket-1', { status: 'resolved' }))
                .rejects.toThrow('Authentication required');
        });

        it('requires customer_success, manager, or admin role', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'sales' } });
            
            await expect(updateTicket('ticket-1', { status: 'resolved' }))
                .rejects.toThrow('Insufficient permissions');
        });

        it('validates status enum', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            await expect(updateTicket('ticket-1', { status: 'invalid_status' as any }))
                .rejects.toThrow();
        });

        it('updates ticket successfully', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            mockSupabase.single.mockResolvedValue({
                data: { id: 'ticket-1', status: 'resolved' },
                error: null
            });
            
            const result = await updateTicket('ticket-1', { status: 'resolved' });
            
            expect(result).toBeDefined();
            expect(mockSupabase.update).toHaveBeenCalledWith({ status: 'resolved' });
        });
    });

    describe('getMyTickets', () => {
        it('requires authentication', async () => {
            (getSession as any).mockResolvedValue(null);
            
            const result = await getMyTickets();
            
            expect(result).toEqual([]);
        });

        it('filters tickets by current user', async () => {
            const userId = 'user-1';
            (getSession as any).mockResolvedValue({ user: { id: userId, role: 'customer_success' } });
            
            mockSupabase.order.mockResolvedValue({
                data: [
                    { id: 'ticket-1', assigned_to: userId },
                    { id: 'ticket-2', assigned_to: userId }
                ],
                error: null
            });
            
            const result = await getMyTickets();
            
            expect(result).toHaveLength(2);
            expect(mockSupabase.eq).toHaveBeenCalledWith('assigned_to', userId);
        });

        it('orders by priority then creation date', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            mockSupabase.order.mockResolvedValue({ data: [], error: null });
            
            await getMyTickets();
            
            expect(mockSupabase.order).toHaveBeenCalledWith('priority', { ascending: false });
            expect(mockSupabase.order).toHaveBeenCalledWith('created_at', { ascending: true });
        });
    });

    describe('assignTicket', () => {
        it('requires authentication', async () => {
            (getSession as any).mockResolvedValue(null);
            
            await expect(assignTicket('ticket-1', 'agent-1'))
                .rejects.toThrow('Authentication required');
        });

        it('requires admin or manager role', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            await expect(assignTicket('ticket-1', 'agent-1'))
                .rejects.toThrow('Insufficient permissions: manager or admin role required');
        });

        it('assigns ticket and sets status to in_progress', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'manager' } });
            
            mockSupabase.single.mockResolvedValue({
                data: { id: 'ticket-1', assigned_to: 'agent-1', status: 'in_progress' },
                error: null
            });
            
            const result = await assignTicket('ticket-1', 'agent-1');
            
            expect(mockSupabase.update).toHaveBeenCalledWith({
                assigned_to: 'agent-1',
                status: 'in_progress'
            });
        });

        it('unassigns ticket and sets status to open when agentId is null', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'admin' } });
            
            mockSupabase.single.mockResolvedValue({
                data: { id: 'ticket-1', assigned_to: null, status: 'open' },
                error: null
            });
            
            await assignTicket('ticket-1', null);
            
            expect(mockSupabase.update).toHaveBeenCalledWith({
                assigned_to: null,
                status: 'open'
            });
        });
    });

    describe('getTicketsByStatus', () => {
        it('requires authentication', async () => {
            (getSession as any).mockResolvedValue(null);
            
            const result = await getTicketsByStatus('open');
            
            expect(result).toEqual([]);
        });

        it('filters by status when provided', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            mockSupabase.order.mockResolvedValue({ data: [], error: null });
            
            await getTicketsByStatus('resolved');
            
            expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'resolved');
        });

        it('returns all tickets when status is "all"', async () => {
            (getSession as any).mockResolvedValue({ user: { id: 'user-1', role: 'customer_success' } });
            
            mockSupabase.order.mockResolvedValue({ data: [], error: null });
            
            await getTicketsByStatus('all');
            
            expect(mockSupabase.eq).not.toHaveBeenCalled();
        });
    });
});
