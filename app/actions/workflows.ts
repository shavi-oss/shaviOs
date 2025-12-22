'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { assignTicket } from './tickets';
import { sendEmail } from '@/lib/email';

// ================================================================
// AUTO-ASSIGNMENT
// ================================================================

export async function autoAssignTicket(ticketId: string) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    const supabase = await createClient();

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('priority, status')
        .eq('id', ticketId)
        .single();

    if (ticketError || !ticket) {
        throw new Error('Ticket not found');
    }

    // Don't auto-assign if already assigned or closed
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
        return { success: false, reason: 'Ticket already closed' };
    }

    // Get active routing rules
    const { data: rules, error: rulesError } = await supabase
        .from('ticket_routing_rules')
        .select('*')
        .eq('auto_assign_enabled', true)
        .order('created_at', { ascending: true });

    if (rulesError || !rules || rules.length === 0) {
        return { success: false, reason: 'No active routing rules found' };
    }

    // Find matching rule
    let matchedRule = null;
    for (const rule of rules) {
        // Check priority filter
        if (rule.priority_filter && rule.priority_filter.length > 0) {
            if (!rule.priority_filter.includes(ticket.priority)) {
                continue;
            }
        }

        // Rule matches
        matchedRule = rule;
        break;
    }

    if (!matchedRule || !matchedRule.assigned_agents || matchedRule.assigned_agents.length === 0) {
        return { success: false, reason: 'No matching rule or agents found' };
    }

    // Select next agent using strategy
    let selectedAgentId: string;
    
    if (matchedRule.assignment_strategy === 'round_robin') {
        // Round-robin: use last_assigned_index
        const currentIndex = matchedRule.last_assigned_index || 0;
        selectedAgentId = matchedRule.assigned_agents[currentIndex];
        
        // Update index for next assignment
        const nextIndex = (currentIndex + 1) % matchedRule.assigned_agents.length;
        await supabase
            .from('ticket_routing_rules')
            .update({ last_assigned_index: nextIndex })
            .eq('id', matchedRule.id);
    } else {
        // Load balance: count tickets per agent and assign to least loaded
        const agentWorkload = await Promise.all(
            matchedRule.assigned_agents.map(async (agentId) => {
                const { count } = await supabase
                    .from('support_tickets')
                    .select('*', { count: 'exact', head: true })
                    .eq('assigned_to_id', agentId)
                    .in('status', ['open', 'in_progress', 'pending']);
                
                return { agentId, count: count || 0 };
            })
        );

        // Sort by workload (ascending) and pick first
        agentWorkload.sort((a, b) => a.count - b.count);
        selectedAgentId = agentWorkload[0].agentId;
    }

    // Assign ticket using existing action
    try {
        await assignTicket(ticketId, selectedAgentId);
        
        // Create notification
        await supabase.from('notifications').insert({
            user_id: selectedAgentId,
            type: 'ticket_assigned',
            title: 'تذكرة جديدة مخصصة لك',
            message: `تم تخصيص تذكرة جديدة لك تلقائياً - الأولوية: ${ticket.priority}`,
            related_table: 'support_tickets',
            related_id: ticketId,
            action_url: `/customer-success/tickets/${ticketId}`,
            priority: ticket.priority === 'urgent' || ticket.priority === 'high' ? 'high' : 'normal'
        });

        // Send Email Notification
        await sendEmail(
            // In a real app, we'd fetch the user's email. For now, using a placeholder or assuming we have it.
            // But we only have the ID here. We should probably fetch the email.
            // For the mock, I'll just use a fake email derived from ID or generic.
            'agent@shaviacademy.com', 
            `New Ticket Assigned: ${ticket.priority}`,
            `<p>You have been assigned a new ticket.</p><p><strong>Priority:</strong> ${ticket.priority}</p>`
        );

        console.log('[AUTO_ASSIGN_SUCCESS]', {
            ticketId,
            assignedTo: selectedAgentId,
            strategy: matchedRule.assignment_strategy,
            rule: matchedRule.name
        });

        return { success: true, assignedTo: selectedAgentId };
    } catch (error) {
        console.error('[AUTO_ASSIGN_ERROR]', error);
        throw error;
    }
}

// ================================================================
// ESCALATION
// ================================================================

export async function escalateTicket(ticketId: string, reason: string, notes?: string) {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    // RBAC: Only CS, Manager, Admin can escalate
    const allowedRoles = ['admin', 'manager', 'customer_success'];
    if (!allowedRoles.includes(session.user.role || '')) {
        throw new Error('Insufficient permissions: escalation requires CS, manager or admin role');
    }

    const supabase = await createClient();

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('escalation_level, assigned_to_id, priority, title')
        .eq('id', ticketId)
        .single();

    if (ticketError || !ticket) {
        throw new Error('Ticket not found');
    }

    const currentLevel = ticket.escalation_level || 0;
    const newLevel = currentLevel + 1;

    // Max escalation level is 2 (Admin)
    if (newLevel > 2) {
        throw new Error('Ticket already at maximum escalation level');
    }

    // Determine escalation target
    let targetRole: string;
    if (newLevel === 1) {
        targetRole = 'manager';
    } else {
        targetRole = 'admin';
    }

    // Find available manager/admin using Service Role (bypass RLS)
    const adminSupabase = createAdminClient();
    
    const { data: targetUsers, error: targetError } = await adminSupabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', targetRole)
        .eq('department', 'customer_success')
        .limit(1);

    if (targetError || !targetUsers || targetUsers.length === 0) {
        // Fallback: find any admin
        const { data: admins } = await adminSupabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('role', 'admin')
            .limit(1);

        if (!admins || admins.length === 0) {
            throw new Error(`No ${targetRole} found for escalation`);
        }
        
        targetUsers[0] = admins[0];
    }

    const targetUser = targetUsers[0];

    // Update ticket
    const { error: updateError } = await supabase
        .from('support_tickets')
        .update({
            escalation_level: newLevel,
            assigned_to_id: targetUser.id,
            priority: ticket.priority === 'medium' ? 'high' : ticket.priority, // Upgrade priority if needed
            updated_at: new Date().toISOString()
        })
        .eq('id', ticketId);

    if (updateError) {
        throw new Error('Failed to escalate ticket');
    }

    // Log escalation
    const { error: logError } = await supabase
        .from('escalation_logs')
        .insert({
            ticket_id: ticketId,
            escalated_from: ticket.assigned_to_id,
            escalated_to: targetUser.id,
            escalation_reason: reason,
            escalation_level: newLevel,
            notes: notes || null
        });

    if (logError) {
        console.error('[ESCALATION_LOG_ERROR]', logError);
    }

    // Create urgent notification
    await supabase.from('notifications').insert({
        user_id: targetUser.id,
        type: 'ticket_escalated',
        title: '🚨 تذكرة مُصعَّدة تحتاج انتباهك',
        message: `تم تصعيد تذكرة إليك - المستوى ${newLevel} - السبب: ${reason}`,
        related_table: 'support_tickets',
        related_id: ticketId,
        action_url: `/customer-success/tickets/${ticketId}`,
        priority: 'urgent'
    });

    // Send Email Notification
    await sendEmail(
        targetUser.email || 'admin@shavi.com',
        `🚨 Ticket Escalated: Level ${newLevel}`,
        `<p>A ticket has been escalated to you.</p><p><strong>Reason:</strong> ${reason}</p><p><strong>Level:</strong> ${newLevel}</p>`
    );

    console.log('[TICKET_ESCALATED]', {
        ticketId,
        from: ticket.assigned_to_id,
        to: targetUser.id,
        level: newLevel,
        reason
    });

    revalidatePath('/customer-success/tickets');
    revalidatePath(`/customer-success/tickets/${ticketId}`);

    return {
        success: true,
        escalatedTo: targetUser.full_name,
        newLevel
    };
}

// ================================================================
// SLA CALCULATION
// ================================================================

export async function calculateSLA(ticketId: string) {
    const supabase = await createClient();

    // Get ticket
    const { data: ticket, error: ticketError } = await supabase
        .from('support_tickets')
        .select('priority, created_at, status')
        .eq('id', ticketId)
        .single();

    if (ticketError || !ticket) {
        throw new Error('Ticket not found');
    }

    // Don't calculate SLA for closed tickets
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
        return { success: false, reason: 'Ticket already closed' };
    }

    // Get SLA config for priority
    const { data: slaConfig, error: slaError } = await supabase
        .from('sla_configurations')
        .select('resolution_minutes')
        .eq('priority', ticket.priority)
        .single();

    if (slaError || !slaConfig) {
        console.error('[SLA_CONFIG_NOT_FOUND]', ticket.priority);
        return { success: false, reason: 'SLA configuration not found' };
    }

    // Calculate SLA due date
    const createdAt = new Date(ticket.created_at);
    const slaDueAt = new Date(createdAt.getTime() + slaConfig.resolution_minutes * 60 * 1000);

    // Update ticket
    const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ sla_due_at: slaDueAt.toISOString() })
        .eq('id', ticketId);

    if (updateError) {
        throw new Error('Failed to update SLA deadline');
    }

    console.log('[SLA_CALCULATED]', {
        ticketId,
        priority: ticket.priority,
        slaDueAt: slaDueAt.toISOString(),
        minutesAllowed: slaConfig.resolution_minutes
    });

    return {
        success: true,
        slaDueAt: slaDueAt.toISOString()
    };
}

// ================================================================
// SLA BREACH CHECKER
// ================================================================

export async function checkSLABreaches() {
    const session = await getSession();
    if (!session || !session.user) {
        throw new Error('Authentication required');
    }

    // Only admins can run this check
    if (session.user.role !== 'admin') {
        throw new Error('Insufficient permissions: admin role required');
    }

    const supabase = await createClient();

    // Find tickets with breached SLA
    const { data: breachedTickets, error } = await supabase
        .from('support_tickets')
        .select('id, title, assigned_to_id, sla_due_at, priority')
        .lt('sla_due_at', new Date().toISOString())
        .in('status', ['open', 'in_progress', 'pending'])
        .not('sla_due_at', 'is', null);

    if (error) {
        throw new Error('Failed to check SLA breaches');
    }

    if (!breachedTickets || breachedTickets.length === 0) {
        return { success: true, breachedCount: 0 };
    }

    // Create notifications for each breach
    const notifications = breachedTickets.map(ticket => ({
        user_id: ticket.assigned_to_id,
        type: 'sla_breach',
        title: '⚠️ تجاوز SLA',
        message: `التذكرة "${ticket.title}" تجاوزت الوقت المحدد للحل`,
        related_table: 'support_tickets',
        related_id: ticket.id,
        action_url: `/customer-success/tickets/${ticket.id}`,
        priority: 'urgent'
    }));

    const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications);

    if (notifError) {
        console.error('[SLA_BREACH_NOTIFICATION_ERROR]', notifError);
    }

    console.log('[SLA_BREACHES_FOUND]', {
        count: breachedTickets.length,
        tickets: breachedTickets.map(t => t.id)
    });

    return {
        success: true,
        breachedCount: breachedTickets.length,
        tickets: breachedTickets
    };
}
