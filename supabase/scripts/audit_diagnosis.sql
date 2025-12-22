-- Get detailed section results from audit
-- Run each section separately to see what's causing REVIEW NEEDED

-- Section 1: Tables
SELECT 
    '1. TABLES' as section,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') 
         THEN '✅ deals' ELSE '❌ deals' END as deals_table,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') 
         THEN '✅ quotes' ELSE '❌ quotes' END as quotes_table,
    CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'invoices') 
         THEN '✅ invoices' ELSE '❌ invoices' END as invoices_table;

-- Section 6: Data Summary (most important)
SELECT 
    '6. DATA SUMMARY' as section,
    (SELECT COUNT(*) FROM deals) as total_deals,
    (SELECT COUNT(*) FROM quotes) as total_quotes,
    (SELECT COUNT(*) FROM invoices) as total_invoices,
    (SELECT COUNT(*) FROM invoices WHERE source_type = 'manual') as manual_invoices,
    (SELECT COUNT(*) FROM invoices WHERE source_type = 'deal') as deal_invoices;

-- Section 7: Deals breakdown
SELECT 
    '7. DEALS BY STAGE' as section,
    COUNT(*) FILTER (WHERE stage = 'lead') as lead,
    COUNT(*) FILTER (WHERE stage = 'contacted') as contacted,
    COUNT(*) FILTER (WHERE stage = 'proposal') as proposal,
    COUNT(*) FILTER (WHERE stage = 'negotiation') as negotiation,
    COUNT(*) FILTER (WHERE stage = 'closed_won') as closed_won,
    COUNT(*) FILTER (WHERE stage = 'closed_lost') as closed_lost,
    COUNT(*) as total
FROM deals;

-- Check what's causing REVIEW NEEDED status
SELECT 
    'DIAGNOSIS' as section,
    EXISTS(SELECT 1 FROM quotes) as quotes_exist,
    EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'deal_id') as has_deal_id,
    EXISTS(SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'invoice_source_validation') as has_trigger,
    (SELECT COUNT(*) FROM deals) as deal_count,
    CASE 
        WHEN (SELECT COUNT(*) FROM deals) = 0 THEN 'NO DEALS - This is why REVIEW NEEDED! ⚠️'
        ELSE 'Deals exist ✅'
    END as diagnosis;
