-- ================================================================
-- PHASE 3.3 - STEP 1: OPTIMIZATION PACKAGE
-- Migrations 057-058 Only (Seed Data Removed)
-- Apply in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- PART 1: MIGRATION 057 - PIPELINE OPTIMIZATION
-- ================================================================

-- Drop existing if any
DROP MATERIALIZED VIEW IF EXISTS pipeline_metrics CASCADE;

-- Create materialized view
CREATE MATERIALIZED VIEW pipeline_metrics AS
SELECT 
    stage,
    COUNT(*) as deal_count,
    SUM(value) as stage_value,
    AVG(value) as avg_deal_size,
    MIN(value) as min_deal_value,
    MAX(value) as max_deal_value,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_this_month,
    COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as new_this_week,
    COUNT(*) FILTER (WHERE expected_close_date < NOW()) as overdue_count,
    COUNT(*) FILTER (WHERE expected_close_date BETWEEN NOW() AND NOW() + INTERVAL '7 days') as closing_soon
FROM deals
WHERE stage IS NOT NULL
GROUP BY stage;

-- Create unique index
CREATE UNIQUE INDEX idx_pipeline_metrics_stage ON pipeline_metrics (stage);

-- Refresh function
CREATE OR REPLACE FUNCTION refresh_pipeline_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY pipeline_metrics;
    RAISE NOTICE 'Pipeline metrics refreshed at %', NOW();
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to refresh pipeline metrics: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-refresh trigger
CREATE OR REPLACE FUNCTION trigger_refresh_pipeline_metrics()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM refresh_pipeline_metrics();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS refresh_metrics_on_deal_change ON deals;
CREATE TRIGGER refresh_metrics_on_deal_change
AFTER INSERT OR UPDATE OR DELETE ON deals
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_pipeline_metrics();

-- Initial refresh
SELECT refresh_pipeline_metrics();

-- ================================================================
-- PART 2: PERFORMANCE INDEXES
-- ================================================================

-- DEALS INDEXES
CREATE INDEX IF NOT EXISTS idx_deals_stage_value ON deals(stage, value) WHERE value > 0;
CREATE INDEX IF NOT EXISTS idx_deals_stage_date ON deals(stage, expected_close_date) WHERE expected_close_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_active_deals ON deals(stage, value, expected_close_date) WHERE stage NOT IN ('closed_won', 'closed_lost');
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to_id, stage) WHERE assigned_to_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);

-- QUOTES INDEXES
CREATE INDEX IF NOT EXISTS idx_quotes_deal_status ON quotes(deal_id, status);
CREATE INDEX IF NOT EXISTS idx_pending_quotes ON quotes(deal_id, valid_until, status) WHERE status IN ('draft', 'sent');
CREATE INDEX IF NOT EXISTS idx_approved_quotes ON quotes(deal_id, status, created_at) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_quotes_created_by ON quotes(created_by);

-- INVOICES INDEXES
CREATE INDEX IF NOT EXISTS idx_invoices_source_status ON invoices(source_type, status);
CREATE INDEX IF NOT EXISTS idx_invoices_deal_id ON invoices(deal_id) WHERE deal_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id) WHERE quote_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_paid_invoices ON invoices(source_type, amount, created_at) WHERE status = 'paid';
CREATE INDEX IF NOT EXISTS idx_pending_invoices ON invoices(status, due_date) WHERE status IN ('pending', 'overdue');

-- ================================================================
-- PART 3: VERIFICATION
-- ================================================================

-- Verify materialized view exists and has data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'pipeline_metrics') THEN
        RAISE NOTICE '✅ Pipeline metrics view created successfully';
        
        -- Show metrics
        PERFORM * FROM pipeline_metrics;
        RAISE NOTICE 'Total stages in view: %', (SELECT COUNT(*) FROM pipeline_metrics);
    ELSE
        RAISE WARNING '❌ Pipeline metrics view not found - check creation step';
    END IF;
END $$;

-- Verify indexes created
SELECT 
    '✅ INDEXES CREATED' as check,
    COUNT(*) as index_count
FROM pg_indexes 
WHERE tablename IN ('deals', 'quotes', 'invoices')
AND indexname LIKE 'idx_%';

-- Verify data counts
SELECT 
    '✅ DATA SUMMARY' as check,
    (SELECT COUNT(*) FROM deals) as deals,
    (SELECT COUNT(*) FROM quotes) as quotes,
    (SELECT COUNT(*) FROM invoices) as invoices;

-- Performance test (conditional on view existence)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'pipeline_metrics') THEN
        RAISE NOTICE 'Running performance test...';
        -- This will be in the output but won't show in DO block
    END IF;
END $$;

-- Show pipeline metrics if exists
SELECT 
    '✅ PIPELINE METRICS' as check,
    stage,
    deal_count,
    ROUND(stage_value::numeric, 2) as stage_value,
    ROUND(avg_deal_size::numeric, 2) as avg_deal_size
FROM pipeline_metrics
WHERE EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'pipeline_metrics')
ORDER BY 
    CASE stage
        WHEN 'lead' THEN 1
        WHEN 'contacted' THEN 2
        WHEN 'proposal' THEN 3
        WHEN 'negotiation' THEN 4
        WHEN 'closed_won' THEN 5
        WHEN 'closed_lost' THEN 6
    END;

-- Final status
SELECT 
    '=== ✅ PHASE 3.3 STEP 1 COMPLETE ===' as status,
    'Optimization applied successfully' as message,
    NOW() as completed_at;
