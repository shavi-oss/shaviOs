-- ================================================================
-- SIMPLIFIED SYSTEM AUDIT SCRIPT
-- Purpose: Quick verification of Sales & Finance infrastructure
-- Fixed for actual production schema
-- ================================================================

SELECT '=== SYSTEM AUDIT REPORT ===' as title;

-- 1. TABLE EXISTENCE CHECK
SELECT 
    '1. TABLES' as section,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') 
         THEN '✅ deals' ELSE '❌ deals' END as deals_table,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') 
         THEN '✅ quotes' ELSE '❌ quotes' END as quotes_table,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') 
         THEN '✅ invoices' ELSE '❌ invoices' END as invoices_table;

-- 2. CRITICAL COLUMNS CHECK
SELECT 
    '2. INVOICE COLUMNS' as section,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deal_id')
         THEN '✅ deal_id' ELSE '❌ deal_id' END as deal_id_col,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'quote_id')
         THEN '✅ quote_id' ELSE '❌ quote_id' END as quote_id_col,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'source_type')
         THEN '✅ source_type' ELSE '❌ source_type' END as source_type_col,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'manual_reason')
         THEN '✅ manual_reason' ELSE '❌ manual_reason' END as manual_reason_col;

-- 3. CONSTRAINTS CHECK
SELECT 
    '3. CONSTRAINTS' as section,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.table_constraints 
                     WHERE table_name = 'deals' AND constraint_name = 'deals_value_positive')
         THEN '✅ deals_value_positive' ELSE '❌ deals_value_positive' END as deals_value_check,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.table_constraints 
                     WHERE table_name = 'deals' AND constraint_name = 'deals_stage_required')
         THEN '✅ deals_stage_required' ELSE '❌ deals_stage_required' END as deals_stage_check;

-- 4. TRIGGERS CHECK
SELECT 
    '4. TRIGGERS' as section,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.triggers 
                     WHERE trigger_name = 'invoice_source_validation')
         THEN '✅ invoice_source_validation' ELSE '❌ invoice_source_validation' END as invoice_trigger,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'validate_invoice_source')
         THEN '✅ validate_invoice_source()' ELSE '❌ validate_invoice_source()' END as validation_function;

-- 5. RLS POLICIES COUNT
SELECT 
    '5. RLS POLICIES' as section,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'deals') as deals_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'quotes') as quotes_policies,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'invoices') as invoices_policies;

-- 6. DATA COUNTS
SELECT 
    '6. DATA SUMMARY' as section,
    (SELECT COUNT(*) FROM deals) as total_deals,
    (SELECT COUNT(*) FROM quotes) as total_quotes,
    (SELECT COUNT(*) FROM invoices) as total_invoices,
    (SELECT COUNT(*) FROM invoices WHERE source_type = 'manual') as manual_invoices,
    (SELECT COUNT(*) FROM invoices WHERE source_type = 'deal') as deal_invoices;

-- 7. DEALS BREAKDOWN BY STAGE
SELECT 
    '7. DEALS BY STAGE' as section,
    COUNT(*) FILTER (WHERE stage = 'lead') as lead,
    COUNT(*) FILTER (WHERE stage = 'contacted') as contacted,
    COUNT(*) FILTER (WHERE stage = 'proposal') as proposal,
    COUNT(*) FILTER (WHERE stage = 'negotiation') as negotiation,
    COUNT(*) FILTER (WHERE stage = 'closed_won') as closed_won,
    COUNT(*) FILTER (WHERE stage = 'closed_lost') as closed_lost
FROM deals;

-- 8. QUOTES BREAKDOWN BY STATUS
SELECT 
    '8. QUOTES BY STATUS' as section,
    COUNT(*) FILTER (WHERE status = 'draft') as draft,
    COUNT(*) FILTER (WHERE status = 'sent') as sent,
    COUNT(*) FILTER (WHERE status = 'approved') as approved,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
    COUNT(*) FILTER (WHERE status = 'expired') as expired
FROM quotes;

-- 9. INVOICES BREAKDOWN BY STATUS
SELECT 
    '9. INVOICES BY STATUS' as section,
    COUNT(*) FILTER (WHERE status = 'draft') as draft,
    COUNT(*) FILTER (WHERE status = 'pending') as pending,
    COUNT(*) FILTER (WHERE status = 'paid') as paid,
    COUNT(*) FILTER (WHERE status = 'overdue') as overdue,
    COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled
FROM invoices;

-- 10. VALIDATION TESTS
SELECT 
    '10. VALIDATION' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM invoices WHERE source_type = 'deal' AND deal_id IS NULL) > 0
        THEN '❌ Deal invoices without deal_id found'
        ELSE '✅ All deal invoices have deal_id'
    END as deal_invoice_integrity,
    CASE 
        WHEN (SELECT COUNT(*) FROM invoices WHERE source_type = 'manual' AND (manual_reason IS NULL OR LENGTH(manual_reason) < 5)) > 0
        THEN '⚠️ Manual invoices without proper reason'
        ELSE '✅ All manual invoices have reasons'
    END as manual_invoice_integrity;

-- 11. FINAL STATUS
SELECT 
    '=== ✅ AUDIT COMPLETE ===' as status,
    CASE 
        WHEN EXISTS(SELECT 1 FROM quotes)
        AND EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deal_id')
        AND EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'invoice_source_validation')
        AND (SELECT COUNT(*) FROM deals) > 0
        THEN '🟢 SYSTEM HEALTHY' 
        ELSE '🟡 REVIEW NEEDED' 
    END as system_status,
    NOW() as audit_timestamp;
