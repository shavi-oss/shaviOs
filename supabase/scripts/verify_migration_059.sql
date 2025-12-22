-- Quick verification query for Migration 059
-- Run this after applying the migration

SELECT '=== MIGRATION 059 VERIFICATION ===' as title;

-- 1. Check tables
SELECT 
    '1. TABLES' as section,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'pending_auto_invoices')
         THEN '✅ pending_auto_invoices' ELSE '❌ pending_auto_invoices' END as queue_table,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'cron_job_logs')
         THEN '✅ cron_job_logs' ELSE '❌ cron_job_logs' END as monitoring_table;

-- 2. Check functions
SELECT 
    '2. FUNCTIONS' as section,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'try_create_invoice_from_quote')
         THEN '✅ try_create_invoice_from_quote()' ELSE '❌ MISSING' END as invoice_fn,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'start_cron_job')
         THEN '✅ start_cron_job()' ELSE '❌ MISSING' END as start_fn,
    CASE WHEN EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'complete_cron_job')
         THEN '✅ complete_cron_job()' ELSE '❌ MISSING' END as complete_fn;

-- 3. Check indexes
SELECT 
    '3. INDEXES' as section,
    COUNT(*) as total_indexes
FROM pg_indexes 
WHERE tablename IN ('pending_auto_invoices', 'cron_job_logs')
AND indexname LIKE 'idx_%';

-- 4. Test invoice creation function (dry run - read only)
SELECT 
    '4. FUNCTION TEST' as section,
    'Ready to test with actual quote' as status;

-- 5. Summary
SELECT 
    '=== ✅ VERIFICATION COMPLETE ===' as status,
    NOW() as timestamp;
