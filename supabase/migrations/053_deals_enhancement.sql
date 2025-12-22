-- ================================================================
-- MIGRATION 053: Deals System Enhancement
-- Description: Add constraints for data integrity
-- Purpose: Ensure deals have valid amounts and stages
-- Risk: LOW - Only adds constraints, no data changes
-- Created: 2025-12-21
-- ================================================================

-- ================================================================
-- STEP 1: Add DEFAULT for value column (safety measure)
-- ================================================================

ALTER TABLE deals 
    ALTER COLUMN value SET DEFAULT 0;

-- ================================================================
-- STEP 2: Add CHECK constraint - value must be positive
-- ================================================================

ALTER TABLE deals 
    ADD CONSTRAINT deals_value_positive 
    CHECK (value > 0);

-- ================================================================
-- STEP 3: Add CHECK constraint - stage must not be null
-- ================================================================

ALTER TABLE deals 
    ADD CONSTRAINT deals_stage_required 
    CHECK (stage IS NOT NULL);

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check constraints were added
SELECT 
    constraint_name, 
    constraint_type,
    check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'deals'
AND tc.constraint_name LIKE 'deals_%'
ORDER BY constraint_name;

-- Verify existing data integrity
SELECT 
    'Deals Enhancement Migration Completed' as status,
    COUNT(*) as total_deals,
    COUNT(*) FILTER (WHERE value > 0) as deals_with_positive_value,
    COUNT(*) FILTER (WHERE stage IS NOT NULL) as deals_with_stage,
    COUNT(*) FILTER (WHERE value > 0 AND stage IS NOT NULL) as valid_deals
FROM deals;

-- Expected result: All counts should match (all deals are valid)
