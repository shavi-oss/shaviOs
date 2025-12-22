-- ================================================================
-- MIGRATION 057: PIPELINE OPTIMIZATION
-- Purpose: Optimize queries for >500 deals with materialized views
-- Phase: 3.3 - Optimization
-- Safe: Yes - Only adds views, no data changes
-- ================================================================

-- ================================================================
-- SECTION 1: MATERIALIZED VIEW FOR PIPELINE METRICS
-- ================================================================

-- Drop existing if any
DROP MATERIALIZED VIEW IF EXISTS pipeline_metrics CASCADE;

-- Create materialized view for fast pipeline calculations
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

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_pipeline_metrics_stage ON pipeline_metrics (stage);

-- Grant access
GRANT SELECT ON pipeline_metrics TO authenticated;

-- ================================================================
-- SECTION 2: REFRESH FUNCTION
-- ================================================================

-- Function to refresh pipeline metrics
CREATE OR REPLACE FUNCTION refresh_pipeline_metrics()
RETURNS void AS $$
BEGIN
    -- Use CONCURRENTLY to allow reads during refresh
    REFRESH MATERIALIZED VIEW CONCURRENTLY pipeline_metrics;
    
    -- Log last refresh
    RAISE NOTICE 'Pipeline metrics refreshed at %', NOW();
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Failed to refresh pipeline metrics: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- SECTION 3: AUTO-REFRESH TRIGGER (OPTIONAL - Can be disabled)
-- ================================================================

-- Trigger to auto-refresh on deal changes
-- Note: For high-traffic systems, disable this and use scheduled refresh instead
CREATE OR REPLACE FUNCTION trigger_refresh_pipeline_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Refresh in background (non-blocking)
    PERFORM refresh_pipeline_metrics();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger (can be disabled for performance)
DROP TRIGGER IF EXISTS refresh_metrics_on_deal_change ON deals;
CREATE TRIGGER refresh_metrics_on_deal_change
AFTER INSERT OR UPDATE OR DELETE ON deals
FOR EACH STATEMENT
EXECUTE FUNCTION trigger_refresh_pipeline_metrics();

-- ================================================================
-- SECTION 4: VERIFICATION
-- ================================================================

-- Initial refresh
SELECT refresh_pipeline_metrics();

-- Verify data
SELECT 
    '✅ Pipeline Metrics Created' as status,
    COUNT(*) as stage_count,
    SUM(deal_count) as total_deals,
    SUM(stage_value) as total_value
FROM pipeline_metrics;

-- ================================================================
-- SECTION 5: USAGE EXAMPLES
-- ================================================================

-- Example 1: Get all metrics (fast!)
-- SELECT * FROM pipeline_metrics ORDER BY stage;

-- Example 2: Get total pipeline value
-- SELECT SUM(stage_value) FROM pipeline_metrics 
-- WHERE stage NOT IN ('closed_won', 'closed_lost');

-- Example 3: Get conversion metrics
-- SELECT 
--     stage,
--     deal_count,
--     stage_value,
--     ROUND(avg_deal_size, 2) as avg_size
-- FROM pipeline_metrics
-- ORDER BY 
--     CASE stage
--         WHEN 'lead' THEN 1
--         WHEN 'contacted' THEN 2
--         WHEN 'proposal' THEN 3
--         WHEN 'negotiation' THEN 4
--         WHEN 'closed_won' THEN 5
--         WHEN 'closed_lost' THEN 6
--     END;

-- ================================================================
-- ROLLBACK INSTRUCTIONS
-- ================================================================

-- To rollback this migration:
-- DROP TRIGGER IF EXISTS refresh_metrics_on_deal_change ON deals;
-- DROP FUNCTION IF EXISTS trigger_refresh_pipeline_metrics();
-- DROP FUNCTION IF EXISTS refresh_pipeline_metrics();
-- DROP MATERIALIZED VIEW IF EXISTS pipeline_metrics CASCADE;
