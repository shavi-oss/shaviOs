-- ================================================================
-- COMPREHENSIVE SYSTEM AUDIT SCRIPT
-- Purpose: Verify entire Sales & Finance infrastructure
-- Phase: Pre-3.3 Audit
-- Date: 2025-12-21
-- ================================================================

-- ================================================================
-- SECTION 1: TABLE SCHEMA VERIFICATION
-- ================================================================

SELECT '=== 1. TABLE SCHEMA VERIFICATION ===' as section;

-- Check deals table
SELECT 
    '1.1 DEALS TABLE' as check_name,
    COUNT(*) as column_count,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'deals'
GROUP BY table_name;

-- Check quotes table
SELECT 
    '1.2 QUOTES TABLE' as check_name,
    COUNT(*) as column_count,
    STRING_AGG(column_name, ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns 
WHERE table_name = 'quotes'
GROUP BY table_name;

-- Check invoices table (with new columns)
SELECT 
    '1.3 INVOICES TABLE' as check_name,
    COUNT(*) as column_count,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'deal_id') > 0 THEN 'HAS deal_id ✅'
        ELSE 'MISSING deal_id ❌'
    END as deal_id_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'quote_id') > 0 THEN 'HAS quote_id ✅'
        ELSE 'MISSING quote_id ❌'
    END as quote_id_status,
    CASE 
        WHEN COUNT(*) FILTER (WHERE column_name = 'source_type') > 0 THEN 'HAS source_type ✅'
        ELSE 'MISSING source_type ❌'
    END as source_type_status
FROM information_schema.columns 
WHERE table_name = 'invoices';

-- ================================================================
-- SECTION 2: CONSTRAINTS VERIFICATION
-- ================================================================

SELECT '=== 2. CONSTRAINTS VERIFICATION ===' as section;

-- Deals constraints
SELECT 
    '2.1 DEALS CONSTRAINTS' as check_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'deals'
AND constraint_name LIKE 'deals_%'
ORDER BY constraint_name;

-- Expected: deals_value_positive, deals_stage_required

-- Quotes constraints
SELECT 
    '2.2 QUOTES CONSTRAINTS' as check_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'quotes'
ORDER BY constraint_name;

-- Invoices constraints (check source_type)
SELECT 
    '2.3 INVOICES CONSTRAINTS' as check_name,
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'invoices'
AND (constraint_name LIKE '%source%' OR constraint_name LIKE 'invoices_%')
ORDER BY constraint_name;

-- ================================================================
-- SECTION 3: INDEXES VERIFICATION
-- ================================================================

SELECT '=== 3. INDEXES VERIFICATION ===' as section;

-- All indexes on deals
SELECT 
    '3.1 DEALS INDEXES' as check_name,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'deals'
ORDER BY indexname;

-- All indexes on quotes
SELECT 
    '3.2 QUOTES INDEXES' as check_name,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'quotes'
ORDER BY indexname;

-- All indexes on invoices (including new ones)
SELECT 
    '3.3 INVOICES INDEXES' as check_name,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'invoices'
AND (indexname LIKE '%deal%' OR indexname LIKE '%quote%' OR indexname LIKE '%source%')
ORDER BY indexname;

-- ================================================================
-- SECTION 4: RLS POLICIES VERIFICATION
-- ================================================================

SELECT '=== 4. RLS POLICIES VERIFICATION ===' as section;

-- Deals policies
SELECT 
    '4.1 DEALS RLS POLICIES' as check_name,
    policyname,
    cmd,
    LEFT(qual::text, 50) as using_clause
FROM pg_policies 
WHERE tablename = 'deals'
ORDER BY policyname;

-- Expected: deals_select_sales_finance, deals_manage_sales_admin

-- Quotes policies
SELECT 
    '4.2 QUOTES RLS POLICIES' as check_name,
    policyname,
    cmd,
    LEFT(qual::text, 50) as using_clause
FROM pg_policies 
WHERE tablename = 'quotes'
ORDER BY policyname;

-- Invoices policies
SELECT 
    '4.3 INVOICES RLS POLICIES' as check_name,
    policyname,
    cmd,
    LEFT(qual::text, 50) as using_clause
FROM pg_policies 
WHERE tablename = 'invoices'
ORDER BY policyname;

-- ================================================================
-- SECTION 5: TRIGGERS VERIFICATION
-- ================================================================

SELECT '=== 5. TRIGGERS VERIFICATION ===' as section;

-- All triggers on deals, quotes, invoices
SELECT 
    '5.1 TRIGGERS' as check_name,
    trigger_name,
    event_object_table as table_name,
    event_manipulation as event,
    action_timing as timing
FROM information_schema.triggers 
WHERE event_object_table IN ('deals', 'quotes', 'invoices')
ORDER BY event_object_table, trigger_name;

-- Expected:
-- deals: update_deals_updated_at
-- quotes: update_quotes_updated_at
-- invoices: invoice_source_validation, update_invoices_updated_at

-- Check if validate_invoice_source function exists
SELECT 
    '5.2 VALIDATION FUNCTION' as check_name,
    CASE 
        WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'validate_invoice_source') 
        THEN 'EXISTS ✅' 
        ELSE 'MISSING ❌' 
    END as function_status;

-- ================================================================
-- SECTION 6: DATA INTEGRITY CHECKS
-- ================================================================

SELECT '=== 6. DATA INTEGRITY CHECKS ===' as section;

-- Deals data verification
SELECT 
    '6.1 DEALS DATA' as check_name,
    COUNT(*) as total_deals,
    COUNT(*) FILTER (WHERE value > 0) as deals_with_valid_value,
    COUNT(*) FILTER (WHERE stage IS NOT NULL) as deals_with_stage,
    COUNT(*) FILTER (WHERE value > 0 AND stage IS NOT NULL) as fully_valid_deals
FROM deals;

-- Quotes data verification
SELECT 
    '6.2 QUOTES DATA' as check_name,
    COUNT(*) as total_quotes,
    COUNT(*) FILTER (WHERE deal_id IS NOT NULL) as quotes_with_deal,
    COUNT(*) FILTER (WHERE total_amount > 0) as quotes_with_valid_amount,
    COUNT(DISTINCT status) as distinct_statuses,
    STRING_AGG(DISTINCT status, ', ' ORDER BY status) as all_statuses
FROM quotes;

-- Invoices data verification
SELECT 
    '6.3 INVOICES DATA' as check_name,
    COUNT(*) as total_invoices,
    COUNT(*) FILTER (WHERE source_type = 'manual') as manual_invoices,
    COUNT(*) FILTER (WHERE source_type = 'deal') as deal_invoices,
    COUNT(*) FILTER (WHERE deal_id IS NOT NULL) as invoices_with_deal,
    COUNT(*) FILTER (WHERE quote_id IS NOT NULL) as invoices_with_quote
FROM invoices;

-- ================================================================
-- SECTION 7: FOREIGN KEY RELATIONSHIPS
-- ================================================================

SELECT '=== 7. FOREIGN KEY RELATIONSHIPS ===' as section;

-- Check foreign keys on invoices
SELECT 
    '7.1 INVOICE FOREIGN KEYS' as check_name,
    conname as constraint_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.conrelid = 'invoices'::regclass
AND c.contype = 'f'
ORDER BY constraint_name;

-- Check foreign keys on quotes
SELECT 
    '7.2 QUOTE FOREIGN KEYS' as check_name,
    conname as constraint_name,
    confrelid::regclass as referenced_table,
    a.attname as column_name
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE c.conrelid = 'quotes'::regclass
AND c.contype = 'f'
ORDER BY constraint_name;

-- ================================================================
-- SECTION 8: PERFORMANCE METRICS
-- ================================================================

SELECT '=== 8. PERFORMANCE METRICS ===' as section;

-- Table sizes
SELECT 
    '8.1 TABLE SIZES' as check_name,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size
FROM pg_tables 
WHERE tablename IN ('deals', 'quotes', 'invoices', 'employees', 'profiles')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage statistics
SELECT 
    '8.2 INDEX USAGE' as check_name,
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE tablename IN ('deals', 'quotes', 'invoices')
ORDER BY tablename, indexname;

-- ================================================================
-- SECTION 9: VALIDATION SCENARIOS TEST
-- ================================================================

SELECT '=== 9. VALIDATION TESTS (Read-Only) ===' as section;

-- Test 1: Check if manual invoices have reasons
SELECT 
    '9.1 MANUAL INVOICE REASONS' as test_name,
    COUNT(*) as total_manual_invoices,
    COUNT(*) FILTER (WHERE manual_reason IS NOT NULL) as invoices_with_reason,
    COUNT(*) FILTER (WHERE manual_reason IS NULL) as invoices_without_reason
FROM invoices
WHERE source_type = 'manual';

-- Test 2: Check if deal invoices are linked to won deals
SELECT 
    '9.2 DEAL INVOICE VALIDATION' as test_name,
    COUNT(*) as total_deal_invoices,
    COUNT(*) FILTER (
        WHERE deal_id IN (SELECT id FROM deals WHERE stage = 'closed_won')
    ) as invoices_from_won_deals,
    COUNT(*) FILTER (
        WHERE deal_id NOT IN (SELECT id FROM deals WHERE stage = 'closed_won')
    ) as invoices_from_non_won_deals
FROM invoices
WHERE source_type = 'deal';

-- Expected: All deal invoices should be from won deals

-- ================================================================
-- SECTION 10: SUMMARY REPORT
-- ================================================================

SELECT '=== 10. SUMMARY REPORT ===' as section;

SELECT 
    '10.1 OVERALL SYSTEM STATUS' as report_name,
    (SELECT COUNT(*) FROM deals) as total_deals,
    (SELECT COUNT(*) FROM quotes) as total_quotes,
    (SELECT COUNT(*) FROM invoices) as total_invoices,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('deals', 'quotes', 'invoices')) as total_rls_policies,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table IN ('deals', 'quotes', 'invoices')) as total_triggers,
    (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name IN ('deals', 'quotes', 'invoices')) as total_constraints;

-- Final status message
SELECT 
    '=== ✅ AUDIT COMPLETE ===' as status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM quotes)
        AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deal_id')
        AND EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'invoice_source_validation')
        THEN 'SYSTEM HEALTHY ✅' 
        ELSE 'ISSUES DETECTED ❌' 
    END as system_status;
