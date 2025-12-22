'use server';

import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { revalidatePath } from 'next/cache';

/**
 * PHASE 3.3 STEP 3: ENTERPRISE AUTOMATION
 * Auto-Invoice, Notifications, Monitoring
 */

// ================================================================
// AUTO-INVOICE AUTOMATION
// ================================================================

/**
 * Create invoice from approved quote (manual trigger or webhook)
 * Uses DB function with retry logic + queue fallback
 */
export async function createInvoiceFromQuote(quoteId: string) {
    const supabase = await createClient();
    
    try {
        logger.info('Attempting auto-invoice creation', { quoteId });
        
        // 1. Check feature flag (will implement in next step)
        // const enabled = await isFeatureEnabled('auto_invoice_from_quote');
        // if (!enabled) return { success: false, message: 'Feature disabled' };
        
        // 2. Call DB function to create invoice
        const { data, error } = await supabase
            .rpc('try_create_invoice_from_quote', { p_quote_id: quoteId });
        
        if (error) {
            throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
            throw new Error('No response from invoice creation function');
        }
        
        const result = data[0];
        
        if (!result.success) {
            // 3. Add to pending queue for retry
            const { data: dealData } = await supabase
                .from('quotes')
                .select('deal_id')
                .eq('id', quoteId)
                .single();
            
            if (dealData) {
                await supabase.from('pending_auto_invoices').insert({
                    quote_id: quoteId,
                    deal_id: dealData.deal_id,
                    error_message: result.error,
                    status: 'pending'
                });
                
                logger.warn('Auto-invoice failed, queued for retry', { 
                    quoteId, 
                    error: result.error 
                });
            }
            
            return { 
                success: false, 
                message: result.error, 
                queued: true 
            };
        }
        
        // 4. Success - log and revalidate
        logger.info('Invoice auto-created successfully', { 
            quoteId, 
            invoiceId: result.invoice_id 
        });
        
        revalidatePath('/finance/invoices');
        revalidatePath('/sales/pipeline');
        
        return { 
            success: true, 
            invoiceId: result.invoice_id 
        };
        
    } catch (error) {
        logger.error('createInvoiceFromQuote error', { error, quoteId });
        return { 
            success: false, 
            message: error instanceof Error ? error.message : 'Unexpected error' 
        };
    }
}

/**
 * Background Job: Process pending auto-invoices (retry queue)
 * Called by cron every 15 minutes
 * SLA: ≤1 minute per invoice attempt
 */
export async function processPendingAutoInvoices() {
    const supabase = await createClient();
    
    try {
        // 1. Start cron job log
        const { data: logData } = await supabase.rpc('start_cron_job', {
            p_job_name: 'process_pending_auto_invoices',
            p_metadata: { triggered_at: new Date().toISOString() }
        });
        
        const logId = logData;
        
        // 2. Get pending items (max 3 attempts, limit 50 per run)
        const { data: pending, error: fetchError } = await supabase
            .from('pending_auto_invoices')
            .select('*')
            .eq('status', 'pending')
            .lt('attempt_count', 3)
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (fetchError) {
            await supabase.rpc('complete_cron_job', {
                p_log_id: logId,
                p_success: false,
                p_error: fetchError.message
            });
            return { processed: 0, error: fetchError.message };
        }
        
        if (!pending || pending.length === 0) {
            await supabase.rpc('complete_cron_job', {
                p_log_id: logId,
                p_success: true,
                p_processed: 0
            });
            return { processed: 0, message: 'No pending items' };
        }
        
        let successCount = 0;
        let failedCount = 0;
        
        // 3. Process each pending item
        for (const item of pending) {
            // Update status to processing
            await supabase
                .from('pending_auto_invoices')
                .update({ status: 'processing' })
                .eq('id', item.id);
            
            // Try to create invoice
            const result = await createInvoiceFromQuote(item.quote_id);
            
            if (result.success) {
                // Mark as completed
                await supabase
                    .from('pending_auto_invoices')
                    .update({ 
                        status: 'completed',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.id);
                successCount++;
            } else {
                // Increment attempt count
                const newAttemptCount = item.attempt_count + 1;
                const newStatus = newAttemptCount >= 3 ? 'failed' : 'pending';
                
                await supabase
                    .from('pending_auto_invoices')
                    .update({ 
                        status: newStatus,
                        attempt_count: newAttemptCount,
                        last_attempt_at: new Date().toISOString(),
                        error_message: result.message,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', item.id);
                
                failedCount++;
                
                // ⚠️ Alert if max retries reached
                if (newAttemptCount >= 3) {
                    logger.error('Auto-invoice failed after 3 attempts', {
                        pendingItemId: item.id,
                        quoteId: item.quote_id,
                        error: result.message
                    });
                    // TODO: Send alert notification to admin/finance
                }
            }
        }
        
        // 4. Complete cron job log
        await supabase.rpc('complete_cron_job', {
            p_log_id: logId,
            p_success: true,
            p_processed: pending.length,
            p_success_count: successCount,
            p_failed_count: failedCount
        });
        
        logger.info('Processed pending auto-invoices', { 
            total: pending.length, 
            success: successCount, 
            failed: failedCount 
        });
        
        return { 
            processed: pending.length, 
            success: successCount, 
            failed: failedCount 
        };
        
    } catch (error) {
        logger.error('processPendingAutoInvoices error', { error });
        return { processed: 0, error: true };
    }
}

// ================================================================
// NOTIFICATIONS (Simplified UX)
// ================================================================

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';
export type NotificationType = 
    | 'quote_approved' 
    | 'invoice_created' 
    | 'deal_aging' 
    | 'daily_summary'
    | 'automation_failed';

/**
 * Send notification with priority filtering
 * Only critical notifications sent real-time
 * Others batched in daily summary
 */
export async function sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    priority: NotificationPriority = 'normal',
    data: Record<string, any> = {}
) {
    const supabase = await createClient();
    
    try {
        const { data: result } = await supabase.rpc('send_notification', {
            p_user_id: userId,
            p_type: type,
            p_title: title,
            p_message: message,
            p_priority: priority,
            p_data: data
        });
        
        logger.info('Notification sent', { userId, type, priority });
        return result;
        
    } catch (error) {
        logger.error('sendNotification error', { error, userId, type });
        return null;
    }
}

/**
 * Generate daily summary (avoid alert fatigue)
 * Called by cron at configured time (default 8:00 AM)
 */
export async function generateDailySummary(userId: string) {
    const supabase = await createClient();
    
    try {
        // Get pending quotes
        const { data: pendingQuotes } = await supabase
            .from('quotes')
            .select('id, quote_number, total_amount, deal_id')
            .eq('created_by', userId)
            .in('status', ['draft', 'sent'])
            .limit(10);
        
        // Get aging deals (>7 days in same stage)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const { data: agingDeals } = await supabase
            .from('deals')
            .select('id, title, stage, value, updated_at')
            .eq('assigned_to_id', userId)
            .not('stage', 'in', '("closed_won","closed_lost")')
            .lt('updated_at', sevenDaysAgo.toISOString())
            .limit(10);
        
        // Get failed auto-invoices assigned to user
        const { data: failedInvoices } = await supabase
            .from('pending_auto_invoices')
            .select(`
                id,
                quote_id,
                error_message,
                quotes!inner(created_by)
            `)
            .eq('status', 'failed')
            .eq('quotes.created_by', userId)
            .limit(5);
        
        const summary = {
            pendingQuotes: pendingQuotes || [],
            agingDeals: agingDeals || [],
            failedInvoices: failedInvoices || [],
            generatedAt: new Date().toISOString()
        };
        
        // Only send if there's actionable content
        const hasContent = summary.pendingQuotes.length > 0 || 
                          summary.agingDeals.length > 0 || 
                          summary.failedInvoices.length > 0;
        
        if (hasContent) {
            await sendNotification(
                userId,
                'daily_summary',
                '📊 Daily Sales Summary',
                `${summary.pendingQuotes.length} pending quotes, ${summary.agingDeals.length} aging deals`,
                'normal',
                summary
            );
        }
        
        return summary;
        
    } catch (error) {
        logger.error('generateDailySummary error', { error, userId });
        return null;
    }
}

// ================================================================
// MONITORING & ALERTS
// ================================================================

/**
 * Check cron job health
 * Alert if jobs failing consistently
 */
export async function checkCronJobHealth() {
    const supabase = await createClient();
    
    try {
        // Get failed jobs in last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const { data: failedJobs } = await supabase
            .from('cron_job_logs')
            .select('job_name, error_message, started_at')
            .eq('status', 'failed')
            .gte('started_at', oneDayAgo.toISOString());
        
        // Count failures by job
        const failuresByJob: Record<string, number> = {};
        failedJobs?.forEach(job => {
            failuresByJob[job.job_name] = (failuresByJob[job.job_name] || 0) + 1;
        });
        
        // ⚠️ Alert if any job failed >3 times
        for (const [jobName, count] of Object.entries(failuresByJob)) {
            if (count > 3) {
                logger.error('Cron job failing repeatedly', { 
                    jobName, 
                    failureCount: count,
                    lastErrors: failedJobs?.filter(j => j.job_name === jobName)
                        .map(j => j.error_message)
                });
                // TODO: Send alert to ops/admin
            }
        }
        
        return failuresByJob;
        
    } catch (error) {
        logger.error('checkCronJobHealth error', { error });
        return {};
    }
}
