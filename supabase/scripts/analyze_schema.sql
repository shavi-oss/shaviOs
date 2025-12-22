-- ================================================================
-- SCHEMA ANALYSIS & MIGRATION VERIFICATION SCRIPT
-- Purpose: Analyze current schema before applying migrations 053-056
-- Created: 2025-12-21
-- ================================================================

-- ================================================================
-- STEP 1: Check current DEALS table schema
-- ================================================================
SELECT 
    'DEALS TABLE ANALYSIS' as analysis_stage,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'deals'
ORDER BY ordinal_position;

-- Check existing constraints on deals
SELECT 
    'DEALS CONSTRAINTS' as analysis_stage,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'deals'
ORDER BY constraint_name;

-- ================================================================
-- STEP 2: Check if QUOTES table exists
-- ================================================================
SELECT 
    'QUOTES TABLE CHECK' as analysis_stage,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes')
        THEN 'EXISTS'
        ELSE 'NOT EXISTS - NEEDS CREATION'
    END as status;

-- If quotes exists, show schema
SELECT 
    'QUOTES TABLE SCHEMA' as analysis_stage,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'quotes'
ORDER BY ordinal_position;

-- ================================================================
-- STEP 3: Check INVOICES table for new columns
-- ================================================================
SELECT 
    'INVOICES TABLE ANALYSIS' as analysis_stage,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoices'
ORDER BY ordinal_position;

-- Check if new columns exist
SELECT 
    'INVOICES NEW COLUMNS CHECK' as analysis_stage,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deal_id')
        THEN 'deal_id EXISTS'
        ELSE 'deal_id MISSING'
    END as deal_id_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'quote_id')
        THEN 'quote_id EXISTS'
        ELSE 'quote_id MISSING'
    END as quote_id_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'source_type')
        THEN 'source_type EXISTS'
        ELSE 'source_type MISSING'
    END as source_type_status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'manual_reason')
        THEN 'manual_reason EXISTS'
        ELSE 'manual_reason MISSING'
    END as manual_reason_status;

-- ================================================================
-- STEP 4: Check existing triggers
-- ================================================================
SELECT 
    'TRIGGERS ANALYSIS' as analysis_stage,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table IN ('deals', 'invoices', 'quotes')
ORDER BY event_object_table, trigger_name;

-- ================================================================
-- STEP 5: Check RLS policies
-- ================================================================
SELECT 
    'RLS POLICIES ANALYSIS' as analysis_stage,
    schemaname,
    tablename,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename IN ('deals', 'invoices', 'quotes')
ORDER BY tablename, policyname;

-- ================================================================
-- STEP 6: Count current data in tables
-- ================================================================
SELECT 
    'DATA COUNT CHECK' as analysis_stage,
    (SELECT COUNT(*) FROM deals) as deals_count,
    (SELECT COUNT(*) FROM invoices) as invoices_count,
    (SELECT COUNT(*) FROM quotes) as quotes_count_if_exists;

-- ================================================================
-- SUMMARY
-- ================================================================
SELECT 'SCHEMA ANALYSIS COMPLETE' as status;
