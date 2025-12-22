-- ================================================================
-- MIGRATION 056: RBAC for Sales & Finance
-- Description: Fine-grained permissions for quotes and deals
-- Purpose: Control who can manage vs view sales/finance data
-- Risk: LOW - Only policy updates
-- Created: 2025-12-21
-- ================================================================

-- ================================================================
-- DEALS POLICIES
-- ================================================================

-- Sales and Finance can view deals, Admin/Manager full access
DROP POLICY IF EXISTS "Enable all for authenticated users" ON deals;
DROP POLICY IF EXISTS "Enable all for service role" ON deals;
DROP POLICY IF EXISTS "deals_select_sales_finance" ON deals;
DROP POLICY IF EXISTS "deals_manage_sales_admin" ON deals;

CREATE POLICY "deals_select_sales_finance" ON deals
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'department') IN ('Sales', 'Finance')
        OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
    );

CREATE POLICY "deals_manage_sales_admin" ON deals
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'department') = 'Sales'
        OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
    );

-- ================================================================
-- INVOICES POLICIES (Updated)
-- ================================================================

-- Everyone can view invoices
DROP POLICY IF EXISTS "Enable all for authenticated users" ON invoices;
DROP POLICY IF EXISTS "Enable all for service role" ON invoices;
DROP POLICY IF EXISTS "invoices_select_all_auth" ON invoices;
DROP POLICY IF EXISTS "invoices_manage_finance_admin" ON invoices;

CREATE POLICY "invoices_select_all_auth" ON invoices
    FOR SELECT TO authenticated
    USING (true);

-- Only Finance and Admin can manage invoices
CREATE POLICY "invoices_manage_finance_admin" ON invoices
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'department') = 'Finance'
        OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
    );

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check all policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    LEFT(qual::text, 50) as using_clause,
    LEFT(with_check::text, 50) as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('deals', 'quotes', 'invoices')
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('deals', 'quotes', 'invoices')
GROUP BY tablename
ORDER BY tablename;

SELECT 'RBAC policies updated successfully' as status;
