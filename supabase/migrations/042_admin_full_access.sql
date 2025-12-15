-- ================================================================
-- MIGRATION 042: Restore Full Admin Access
-- Description: Grant universal ALL access (SELECT, INSERT, UPDATE, DELETE) to admins for all tables
-- Created: 2025-12-14
-- ================================================================

-- Helper macro logic: We will just create standard policies for each table
-- Because policies are permissive (OR), adding these will strictly INCREASE access.

-- 1. Deals
DROP POLICY IF EXISTS "admins_manage_deals" ON deals;
CREATE POLICY "admins_manage_deals" ON deals FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 2. Leads
DROP POLICY IF EXISTS "admins_manage_leads" ON leads;
CREATE POLICY "admins_manage_leads" ON leads FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 3. Campaigns
DROP POLICY IF EXISTS "admins_manage_campaigns" ON campaigns;
CREATE POLICY "admins_manage_campaigns" ON campaigns FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 4. Email Campaigns
DROP POLICY IF EXISTS "admins_manage_email_campaigns" ON email_campaigns;
CREATE POLICY "admins_manage_email_campaigns" ON email_campaigns FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 5. Employees (Already partially covered, ensuring ALL)
DROP POLICY IF EXISTS "admins_manage_employees" ON employees;
CREATE POLICY "admins_manage_employees" ON employees FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 6. Leave Requests
DROP POLICY IF EXISTS "admins_manage_leave" ON leave_requests;
CREATE POLICY "admins_manage_leave" ON leave_requests FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 7. Payroll Records
DROP POLICY IF EXISTS "admins_manage_payroll" ON payroll_records;
CREATE POLICY "admins_manage_payroll" ON payroll_records FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 8. Expenses
DROP POLICY IF EXISTS "admins_manage_expenses" ON expenses;
CREATE POLICY "admins_manage_expenses" ON expenses FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 9. Budgets
DROP POLICY IF EXISTS "admins_manage_budgets" ON budgets;
CREATE POLICY "admins_manage_budgets" ON budgets FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 10. Invoices
DROP POLICY IF EXISTS "admins_manage_invoices" ON invoices;
CREATE POLICY "admins_manage_invoices" ON invoices FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

-- 11. Performance Reviews
DROP POLICY IF EXISTS "admins_manage_reviews" ON performance_reviews;
CREATE POLICY "admins_manage_reviews" ON performance_reviews FOR ALL TO authenticated
USING (is_admin()) WITH CHECK (is_admin());

SELECT 'Migration 042 - Universal Admin Access Restored' as status;
