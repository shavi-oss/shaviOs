-- ================================================================
-- MIGRATION 059: AUTO-INVOICE AUTOMATION INFRASTRUCTURE
-- Purpose: Queue-based invoice creation with retry + monitoring
-- Phase: 3.3 Step 3 - Automation
-- Safe: Yes - Only adds tables and functions
-- ================================================================

-- ================================================================
-- SECTION 1: PENDING AUTO-INVOICES QUEUE
-- ================================================================

-- Table: pending_auto_invoices
CREATE TABLE IF NOT EXISTS pending_auto_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    attempt_count INTEGER DEFAULT 0 CHECK (attempt_count >= 0),
    last_attempt_at TIMESTAMPTZ,
    error_message TEXT,
    status TEXT DEFAULT 'pending' 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pending_auto_invoices_status 
    ON pending_auto_invoices(status) 
    WHERE status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_pending_auto_invoices_quote 
    ON pending_auto_invoices(quote_id);

CREATE INDEX IF NOT EXISTS idx_pending_auto_invoices_created 
    ON pending_auto_invoices(created_at DESC);

-- Updated_at trigger
CREATE TRIGGER update_pending_auto_invoices_updated_at
    BEFORE UPDATE ON pending_auto_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- SECTION 2: CRON JOB MONITORING
-- ================================================================

-- Table: cron_job_logs (for monitoring batch jobs)
CREATE TABLE IF NOT EXISTS cron_job_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
    duration_ms INTEGER,
    processed_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_cron_logs_job_name 
    ON cron_job_logs(job_name, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_cron_logs_status 
    ON cron_job_logs(status) 
    WHERE status = 'failed';

-- ================================================================
-- SECTION 3: AUTO-INVOICE CREATION FUNCTION
-- ================================================================

-- Function: Try to create invoice from approved quote
CREATE OR REPLACE FUNCTION try_create_invoice_from_quote(p_quote_id UUID)
RETURNS TABLE(success BOOLEAN, invoice_id UUID, error TEXT) AS $$
DECLARE
    v_deal_id UUID;
    v_deal_stage TEXT;
    v_quote_total NUMERIC;
    v_deal_customer_name TEXT;
    v_deal_customer_email TEXT;
    v_quote_items JSONB;
    v_new_invoice_id UUID;
BEGIN
    -- 1. Get quote and deal details
    SELECT 
        q.deal_id, 
        q.total_amount,
        q.items,
        d.stage,
        d.customer_name,
        d.customer_email
    INTO 
        v_deal_id, 
        v_quote_total,
        v_quote_items,
        v_deal_stage,
        v_deal_customer_name,
        v_deal_customer_email
    FROM quotes q
    JOIN deals d ON q.deal_id = d.id
    WHERE q.id = p_quote_id
    AND q.status = 'approved';
    
    -- 2. Validate quote exists and is approved
    IF v_deal_id IS NULL THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Quote not found or not approved'::TEXT;
        RETURN;
    END IF;
    
    -- 3. Validate deal is closed_won
    IF v_deal_stage != 'closed_won' THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 
            format('Deal not in closed_won stage (current: %s)', v_deal_stage)::TEXT;
        RETURN;
    END IF;
    
    -- 4. Check if invoice already exists for this quote
    IF EXISTS(SELECT 1 FROM invoices WHERE quote_id = p_quote_id) THEN
        RETURN QUERY SELECT FALSE, NULL::UUID, 'Invoice already exists for this quote'::TEXT;
        RETURN;
    END IF;
    
    -- 5. Create invoice
    INSERT INTO invoices (
        customer_name,
        customer_email,
        amount,
        currency,
        items,
        status,
        due_date,
        deal_id,
        quote_id,
        source_type,
        created_at
    ) VALUES (
        v_deal_customer_name,
        v_deal_customer_email,
        v_quote_total,
        'EGP',
        v_quote_items,
        'pending',
        CURRENT_DATE + INTERVAL '30 days',
        v_deal_id,
        p_quote_id,
        'deal',
        NOW()
    )
    RETURNING id INTO v_new_invoice_id;
    
    -- 6. Return success
    RETURN QUERY SELECT TRUE, v_new_invoice_id, NULL::TEXT;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Return error but don't fail transaction
        RETURN QUERY SELECT FALSE, NULL::UUID, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- SECTION 4: CRON JOB LOGGING HELPERS
-- ================================================================

-- Function: Start cron job log
CREATE OR REPLACE FUNCTION start_cron_job(p_job_name TEXT, p_metadata JSONB DEFAULT '{}'::jsonb)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO cron_job_logs (job_name, status, metadata)
    VALUES (p_job_name, 'started', p_metadata)
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Complete cron job log
CREATE OR REPLACE FUNCTION complete_cron_job(
    p_log_id UUID,
    p_success BOOLEAN,
    p_processed INTEGER DEFAULT 0,
    p_success_count INTEGER DEFAULT 0,
    p_failed_count INTEGER DEFAULT 0,
    p_error TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_started_at TIMESTAMPTZ;
    v_duration_ms INTEGER;
BEGIN
    -- Get started_at
    SELECT started_at INTO v_started_at
    FROM cron_job_logs
    WHERE id = p_log_id;
    
    -- Calculate duration
    v_duration_ms := EXTRACT(EPOCH FROM (NOW() - v_started_at)) * 1000;
    
    -- Update log
    UPDATE cron_job_logs
    SET 
        status = CASE WHEN p_success THEN 'completed' ELSE 'failed' END,
        duration_ms = v_duration_ms,
        processed_count = p_processed,
        success_count = p_success_count,
        failed_count = p_failed_count,
        error_message = p_error,
        completed_at = NOW()
    WHERE id = p_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- SECTION 5: VERIFICATION
-- ================================================================

-- Verify tables created
SELECT 
    '✅ AUTO-INVOICE INFRASTRUCTURE' as status,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_auto_invoices')
         THEN 'pending_auto_invoices ✅' ELSE 'MISSING ❌' END as queue_table,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cron_job_logs')
         THEN 'cron_job_logs ✅' ELSE 'MISSING ❌' END as monitoring_table,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'try_create_invoice_from_quote')
         THEN 'try_create_invoice_from_quote() ✅' ELSE 'MISSING ❌' END as invoice_function,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'start_cron_job')
         THEN 'start_cron_job() ✅' ELSE 'MISSING ❌' END as cron_start_function,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'complete_cron_job')
         THEN 'complete_cron_job() ✅' ELSE 'MISSING ❌' END as cron_complete_function;

-- ================================================================
-- ROLLBACK INSTRUCTIONS
-- ================================================================

-- To rollback:
-- DROP TABLE IF EXISTS cron_job_logs CASCADE;
-- DROP TABLE IF EXISTS pending_auto_invoices CASCADE;
-- DROP FUNCTION IF EXISTS try_create_invoice_from_quote(UUID);
-- DROP FUNCTION IF EXISTS start_cron_job(TEXT, JSONB);
-- DROP FUNCTION IF EXISTS complete_cron_job(UUID, BOOLEAN, INTEGER, INTEGER, INTEGER, TEXT);
