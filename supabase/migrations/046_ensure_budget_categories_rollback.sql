-- ================================================================
-- ROLLBACK 046: Revert Budget Categories
-- Purpose: Emergency undo for Migration 046
-- ================================================================

-- 1. Drop Table (Cascade will drop RLS and Audit Trigger)
DROP TABLE IF EXISTS public.budget_categories CASCADE;

-- 2. Verify
-- SELECT * FROM public.budget_categories; -- Should fail
