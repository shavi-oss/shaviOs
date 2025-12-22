-- ================================================================
-- MIGRATION 058: PERFORMANCE INDEXES
-- Purpose: Add strategic indexes for common query patterns
-- Phase: 3.3 - Optimization
-- Safe: Yes - Only adds indexes, improves performance
-- ================================================================

-- ================================================================
-- SECTION 1: DEALS TABLE INDEXES
-- ================================================================

-- Composite index for pipeline queries (stage + value)
CREATE INDEX IF NOT EXISTS idx_deals_stage_value 
ON deals(stage, value) 
WHERE value > 0;

-- Composite index for forecasting (stage + expected close date)
CREATE INDEX IF NOT EXISTS idx_deals_stage_date 
ON deals(stage, expected_close_date)
WHERE expected_close_date IS NOT NULL;

-- Partial index for active deals only (excludes closed)
CREATE INDEX IF NOT EXISTS idx_active_deals 
ON deals(stage, value, expected_close_date) 
WHERE stage NOT IN ('closed_won', 'closed_lost');

-- Index for deal owner queries
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to 
ON deals(assigned_to_id, stage)
WHERE assigned_to_id IS NOT NULL;

-- Index for recent deals
CREATE INDEX IF NOT EXISTS idx_deals_created_at 
ON deals(created_at DESC);

-- ================================================================
-- SECTION 2: QUOTES TABLE INDEXES
-- ================================================================

-- Composite index for quote lookups by deal and status
CREATE INDEX IF NOT EXISTS idx_quotes_deal_status 
ON quotes(deal_id, status);

-- Partial index for pending/active quotes
CREATE INDEX IF NOT EXISTS idx_pending_quotes 
ON quotes(deal_id, valid_until, status)
WHERE status IN ('draft', 'sent');

-- Index for quote number lookups (unique already, but explicit)
-- (Already has unique constraint from migration 054)

-- Index for approved quotes (for auto-invoice trigger)
CREATE INDEX IF NOT EXISTS idx_approved_quotes 
ON quotes(deal_id, status, created_at)
WHERE status = 'approved';

-- Index for quote creator
CREATE INDEX IF NOT EXISTS idx_quotes_created_by 
ON quotes(created_by);

-- ================================================================
-- SECTION 3: INVOICES TABLE INDEXES
-- ================================================================

-- Composite index for source tracking
CREATE INDEX IF NOT EXISTS idx_invoices_source_status 
ON invoices(source_type, status);

-- Index for deal invoices
CREATE INDEX IF NOT EXISTS idx_invoices_deal_id 
ON invoices(deal_id)
WHERE deal_id IS NOT NULL;

-- Index for quote invoices
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id 
ON invoices(quote_id)
WHERE quote_id IS NOT NULL;

-- Partial index for paid invoices (revenue calculations)
CREATE INDEX IF NOT EXISTS idx_paid_invoices 
ON invoices(source_type, amount, created_at)
WHERE status = 'paid';

-- Partial index for pending/overdue invoices
CREATE INDEX IF NOT EXISTS idx_pending_invoices 
ON invoices(status, due_date)
WHERE status IN ('pending', 'overdue');

-- ================================================================
-- SECTION 4: VERIFICATION
-- ================================================================

-- Check all indexes created
SELECT 
    '✅ Indexes Created' as status,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('deals', 'quotes', 'invoices')
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Check index sizes
SELECT 
    '📊 Index Sizes' as info,
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname)) as index_size
FROM pg_indexes 
WHERE tablename IN ('deals', 'quotes', 'invoices')
AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;

-- ================================================================
-- SECTION 5: PERFORMANCE TEST QUERIES
-- ================================================================

-- Test 1: Pipeline query (should use idx_deals_stage_value)
EXPLAIN ANALYZE
SELECT stage, COUNT(*), SUM(value)
FROM deals
WHERE value > 0
GROUP BY stage;

-- Test 2: Active deals query (should use idx_active_deals)
EXPLAIN ANALYZE
SELECT *
FROM deals
WHERE stage NOT IN ('closed_won', 'closed_lost')
AND value > 0
ORDER BY expected_close_date;

-- Test 3: Revenue query (should use idx_paid_invoices)
EXPLAIN ANALYZE
SELECT source_type, SUM(amount)
FROM invoices
WHERE status = 'paid'
GROUP BY source_type;

-- ================================================================
-- ROLLBACK INSTRUCTIONS
-- ================================================================

-- To rollback this migration:
-- DROP INDEX IF EXISTS idx_deals_stage_value;
-- DROP INDEX IF EXISTS idx_deals_stage_date;
-- DROP INDEX IF EXISTS idx_active_deals;
-- DROP INDEX IF EXISTS idx_deals_assigned_to;
-- DROP INDEX IF EXISTS idx_deals_created_at;
-- DROP INDEX IF EXISTS idx_quotes_deal_status;
-- DROP INDEX IF EXISTS idx_pending_quotes;
-- DROP INDEX IF EXISTS idx_approved_quotes;
-- DROP INDEX IF EXISTS idx_quotes_created_by;
-- DROP INDEX IF EXISTS idx_invoices_source_status;
-- DROP INDEX IF EXISTS idx_invoices_deal_id;
-- DROP INDEX IF EXISTS idx_invoices_quote_id;
-- DROP INDEX IF EXISTS idx_paid_invoices;
-- DROP INDEX IF EXISTS idx_pending_invoices;
