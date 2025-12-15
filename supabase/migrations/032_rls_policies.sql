-- ================================================================
-- MIGRATION 032: Detailed RLS Policies - RBAC System
-- Description: Granular RLS policies for all roles and departments
-- Version: 3.0 (Final)
-- Created: 2025-12-12
-- ================================================================

-- ================================================================
-- STEP 1: Drop temporary policies from migration 030
-- ================================================================

-- Drop temporary policies on new tables
DROP POLICY IF EXISTS "temp_all_campaigns" ON campaigns;
DROP POLICY IF EXISTS "temp_all_email_campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "temp_all_leave_requests" ON leave_requests;
DROP POLICY IF EXISTS "temp_all_payroll_records" ON payroll_records;
DROP POLICY IF EXISTS "temp_all_performance_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "temp_all_budgets" ON budgets;
DROP POLICY IF EXISTS "temp_all_expenses" ON expenses;

-- ================================================================
-- STEP 2: Helper Functions for RLS
-- ================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') IN ('admin', 'developer');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is manager of specific department
CREATE OR REPLACE FUNCTION is_department_manager(dept TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') LIKE '%_manager'
    AND (auth.jwt() ->> 'department') = dept;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is senior in department
CREATE OR REPLACE FUNCTION is_senior_in_department(dept TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'senior'
    AND (auth.jwt() ->> 'department') = dept;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's team members (for senior role)
CREATE OR REPLACE FUNCTION get_team_member_ids()
RETURNS UUID[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT id FROM employees 
    WHERE team_lead_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- STEP 2.5: Drop ALL existing policies to make migration idempotent
-- ================================================================

-- Campaigns
DROP POLICY IF EXISTS "admins_all_campaigns" ON campaigns;
DROP POLICY IF EXISTS "marketing_manager_campaigns" ON campaigns;
DROP POLICY IF EXISTS "marketing_manager_modify_campaigns" ON campaigns;
DROP POLICY IF EXISTS "marketing_manager_update_campaigns" ON campaigns;
DROP POLICY IF EXISTS "marketing_team_own_campaigns" ON campaigns;
DROP POLICY IF EXISTS "marketing_team_update_assigned" ON campaigns;

-- Email Campaigns
DROP POLICY IF EXISTS "admins_all_email_campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "marketing_see_email_campaigns" ON email_campaigns;
DROP POLICY IF EXISTS "marketing_create_email_campaigns" ON email_campaigns;

-- Leave Requests
DROP POLICY IF EXISTS "admins_all_leave_requests" ON leave_requests;
DROP POLICY IF EXISTS "employees_create_own_leave" ON leave_requests;
DROP POLICY IF EXISTS "employees_see_own_leave" ON leave_requests;
DROP POLICY IF EXISTS "hr_manager_see_all_leave" ON leave_requests;
DROP POLICY IF EXISTS "hr_manager_approve_leave" ON leave_requests;
DROP POLICY IF EXISTS "senior_see_team_leave" ON leave_requests;

-- Payroll
DROP POLICY IF EXISTS "admins_all_payroll" ON payroll_records;
DROP POLICY IF EXISTS "hr_manager_see_payroll" ON payroll_records;
DROP POLICY IF EXISTS "hr_manager_manage_payroll" ON payroll_records;
DROP POLICY IF EXISTS "hr_manager_approve_payroll" ON payroll_records;
DROP POLICY IF EXISTS "employees_see_own_payroll" ON payroll_records;

-- Performance Reviews
DROP POLICY IF EXISTS "admins_all_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "employees_see_own_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "employees_comment_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "hr_manager_see_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "managers_create_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "reviewers_see_own_reviews" ON performance_reviews;

-- Budgets
DROP POLICY IF EXISTS "admins_all_budgets" ON budgets;
DROP POLICY IF EXISTS "finance_manager_see_budgets" ON budgets;
DROP POLICY IF EXISTS "finance_manager_manage_budgets" ON budgets;
DROP POLICY IF EXISTS "finance_manager_update_budgets" ON budgets;
DROP POLICY IF EXISTS "dept_managers_see_dept_budgets" ON budgets;
DROP POLICY IF EXISTS "owners_see_own_budgets" ON budgets;

-- Expenses
DROP POLICY IF EXISTS "admins_all_expenses" ON expenses;
DROP POLICY IF EXISTS "employees_submit_expenses" ON expenses;
DROP POLICY IF EXISTS "employees_see_own_expenses" ON expenses;
DROP POLICY IF EXISTS "finance_manager_see_expenses" ON expenses;
DROP POLICY IF EXISTS "finance_manager_approve_expenses" ON expenses;
DROP POLICY IF EXISTS "dept_managers_see_dept_expenses" ON expenses;

-- Deals
DROP POLICY IF EXISTS "admins_all_deals" ON deals;
DROP POLICY IF EXISTS "sales_see_own_deals" ON deals;
DROP POLICY IF EXISTS "sales_manager_see_all_deals" ON deals;
DROP POLICY IF EXISTS "sales_update_assigned_deals" ON deals;

-- Leads
DROP POLICY IF EXISTS "admins_all_leads" ON leads;
DROP POLICY IF EXISTS "marketing_see_leads" ON leads;
DROP POLICY IF EXISTS "marketing_manage_leads" ON leads;

-- Employees
DROP POLICY IF EXISTS "admins_all_employees" ON employees;
DROP POLICY IF EXISTS "hr_manager_see_employees" ON employees;
DROP POLICY IF EXISTS "hr_manager_manage_employees" ON employees;
DROP POLICY IF EXISTS "employees_see_self" ON employees;

-- Invoices
DROP POLICY IF EXISTS "admins_all_invoices" ON invoices;
DROP POLICY IF EXISTS "finance_see_invoices" ON invoices;
DROP POLICY IF EXISTS "finance_manager_manage_invoices" ON invoices;

-- Students
DROP POLICY IF EXISTS "admins_all_students" ON students;
DROP POLICY IF EXISTS "customer_success_see_students" ON students;
DROP POLICY IF EXISTS "customer_success_manage_students" ON students;

-- Support Tickets
DROP POLICY IF EXISTS "admins_all_tickets" ON support_tickets;
DROP POLICY IF EXISTS "customer_success_see_tickets" ON support_tickets;
DROP POLICY IF EXISTS "customer_success_manage_tickets" ON support_tickets;

-- ================================================================
-- CAMPAIGNS TABLE - Marketing Module
-- ================================================================

-- Admins see all campaigns
CREATE POLICY "admins_all_campaigns"
ON campaigns FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Marketing managers see all marketing campaigns
CREATE POLICY "marketing_manager_campaigns"
ON campaigns FOR SELECT TO authenticated
USING (
  is_department_manager('Marketing')
  AND department = 'Marketing'
  AND deleted_at IS NULL
);

-- Marketing managers can create/update campaigns
CREATE POLICY "marketing_manager_modify_campaigns"
ON campaigns FOR INSERT TO authenticated
WITH CHECK (
  is_department_manager('Marketing')
  AND department = 'Marketing'
);

CREATE POLICY "marketing_manager_update_campaigns"
ON campaigns FOR UPDATE TO authenticated
USING (
  is_department_manager('Marketing')
  AND department = 'Marketing'
)
WITH CHECK (
  is_department_manager('Marketing')
  AND department = 'Marketing'
);

-- Marketing team sees assigned/created campaigns
CREATE POLICY "marketing_team_own_campaigns"
ON campaigns FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Marketing'
  AND (assigned_to = auth.uid() OR created_by = auth.uid())
  AND deleted_at IS NULL
);

-- Marketing team can update assigned campaigns
CREATE POLICY "marketing_team_update_assigned"
ON campaigns FOR UPDATE TO authenticated
USING (assigned_to = auth.uid())
WITH CHECK (assigned_to = auth.uid());

-- ================================================================
-- EMAIL_CAMPAIGNS TABLE - Marketing Module
-- ================================================================

-- Admins see all
CREATE POLICY "admins_all_email_campaigns"
ON email_campaigns FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Marketing sees all email campaigns
CREATE POLICY "marketing_see_email_campaigns"
ON email_campaigns FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Marketing'
  OR is_admin()
);

-- Marketing can create email campaigns
CREATE POLICY "marketing_create_email_campaigns"
ON email_campaigns FOR INSERT TO authenticated
WITH CHECK (
  (auth.jwt() ->> 'department') = 'Marketing'
  OR is_admin()
);

-- ================================================================
-- LEAVE_REQUESTS TABLE - HR Module
-- ================================================================

-- Admins see all
CREATE POLICY "admins_all_leave_requests"
ON leave_requests FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Employees can create own leave requests
CREATE POLICY "employees_create_own_leave"
ON leave_requests FOR INSERT TO authenticated
WITH CHECK (
  employee_id IN (
    SELECT id FROM employees WHERE id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
  AND status = 'pending'
);

-- Employees see own leave requests
CREATE POLICY "employees_see_own_leave"
ON leave_requests FOR SELECT TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- HR Manager sees all leave requests
CREATE POLICY "hr_manager_see_all_leave"
ON leave_requests FOR SELECT TO authenticated
USING (
  is_department_manager('HR')
  OR is_admin()
);

-- HR Manager can approve/reject
CREATE POLICY "hr_manager_approve_leave"
ON leave_requests FOR UPDATE TO authenticated
USING (
  is_department_manager('HR')
  AND status = 'pending'
)
WITH CHECK (
  status IN ('approved', 'rejected')
  AND approved_by = auth.uid()
);

-- Senior/Team leads see team leave requests
CREATE POLICY "senior_see_team_leave"
ON leave_requests FOR SELECT TO authenticated
USING (
  is_senior_in_department('HR')
  AND employee_id = ANY(get_team_member_ids())
);

-- ================================================================
-- PAYROLL_RECORDS TABLE - HR/Finance Module
-- ================================================================

-- Admins see all
CREATE POLICY "admins_all_payroll"
ON payroll_records FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- HR Manager sees all payroll in HR department
CREATE POLICY "hr_manager_see_payroll"
ON payroll_records FOR SELECT TO authenticated
USING (
  is_department_manager('HR')
  AND department = 'HR'
  AND deleted_at IS NULL
);

-- HR Manager can create/approve payroll
CREATE POLICY "hr_manager_manage_payroll"
ON payroll_records FOR INSERT TO authenticated
WITH CHECK (
  is_department_manager('HR')
  AND department = 'HR'
);

CREATE POLICY "hr_manager_approve_payroll"
ON payroll_records FOR UPDATE TO authenticated
USING (
  is_department_manager('HR')
  AND status = 'pending'
)
WITH CHECK (
  status IN ('approved', 'paid')
  AND approved_by = auth.uid()
);

-- Employees see only own payroll
CREATE POLICY "employees_see_own_payroll"
ON payroll_records FOR SELECT TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- ================================================================
-- PERFORMANCE_REVIEWS TABLE - HR Module
-- ================================================================

-- Admins see all
CREATE POLICY "admins_all_reviews"
ON performance_reviews FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Employees see own reviews
CREATE POLICY "employees_see_own_reviews"
ON performance_reviews FOR SELECT TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Employees can add comments to own reviews
CREATE POLICY "employees_comment_reviews"
ON performance_reviews FOR UPDATE TO authenticated
USING (
  employee_id IN (
    SELECT id FROM employees WHERE id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
)
WITH CHECK (
  employee_comments IS NOT NULL
  AND employee_acknowledged = true
);

-- HR Manager sees all reviews
CREATE POLICY "hr_manager_see_reviews"
ON performance_reviews FOR SELECT TO authenticated
USING (
  is_department_manager('HR')
  OR is_admin()
);

-- Managers/Seniors can create reviews for team
CREATE POLICY "managers_create_reviews"
ON performance_reviews FOR INSERT TO authenticated
WITH CHECK (
  (is_department_manager('HR') OR is_senior_in_department('HR'))
  AND reviewer_id = auth.uid()
);

-- Reviewers see reviews they created
CREATE POLICY "reviewers_see_own_reviews"
ON performance_reviews FOR SELECT TO authenticated
USING (reviewer_id = auth.uid());

-- ================================================================
-- BUDGETS TABLE - Finance Module
-- ================================================================

-- Admins see all
CREATE POLICY "admins_all_budgets"
ON budgets FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Finance Manager sees all budgets
CREATE POLICY "finance_manager_see_budgets"
ON budgets FOR SELECT TO authenticated
USING (
  is_department_manager('Finance')
  OR is_admin()
);

-- Finance Manager can create/manage budgets
CREATE POLICY "finance_manager_manage_budgets"
ON budgets FOR INSERT TO authenticated
WITH CHECK (
  is_department_manager('Finance')
  OR is_admin()
);

CREATE POLICY "finance_manager_update_budgets"
ON budgets FOR UPDATE TO authenticated
USING (
  is_department_manager('Finance')
  OR is_admin()
);

-- Department managers see their department budgets
CREATE POLICY "dept_managers_see_dept_budgets"
ON budgets FOR SELECT TO authenticated
USING (
  department = (auth.jwt() ->> 'department')
  AND (auth.jwt() ->> 'role') LIKE '%_manager'
);

-- Budget owners see their budgets
CREATE POLICY "owners_see_own_budgets"
ON budgets FOR SELECT TO authenticated
USING (owner_id = auth.uid());

-- ================================================================
-- EXPENSES TABLE - Finance Module
-- ================================================================

-- Admins see all
CREATE POLICY "admins_all_expenses"
ON expenses FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Any employee can submit expenses
CREATE POLICY "employees_submit_expenses"
ON expenses FOR INSERT TO authenticated
WITH CHECK (
  submitted_by = auth.uid()
  AND status = 'pending'
);

-- Employees see own expenses
CREATE POLICY "employees_see_own_expenses"
ON expenses FOR SELECT TO authenticated
USING (submitted_by = auth.uid());

-- Finance Manager sees all expenses
CREATE POLICY "finance_manager_see_expenses"
ON expenses FOR SELECT TO authenticated
USING (
  is_department_manager('Finance')
  OR is_admin()
);

-- Finance Manager can approve/reject
CREATE POLICY "finance_manager_approve_expenses"
ON expenses FOR UPDATE TO authenticated
USING (
  is_department_manager('Finance')
  AND status = 'pending'
)
WITH CHECK (
  status IN ('approved', 'rejected', 'reimbursed')
  AND approved_by = auth.uid()
);

-- Department managers see department expenses
CREATE POLICY "dept_managers_see_dept_expenses"
ON expenses FOR SELECT TO authenticated
USING (
  department = (auth.jwt() ->> 'department')
  AND (auth.jwt() ->> 'role') LIKE '%_manager'
);

-- ================================================================
-- EXISTING TABLES - Update RLS Policies
-- ================================================================

-- DEALS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON deals;

CREATE POLICY "admins_all_deals"
ON deals FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "sales_see_own_deals"
ON deals FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Sales'
  OR assigned_to_id = (
    SELECT id FROM employees WHERE id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "sales_manager_see_all_deals"
ON deals FOR SELECT TO authenticated
USING (is_department_manager('Sales'));

CREATE POLICY "sales_update_assigned_deals"
ON deals FOR UPDATE TO authenticated
USING (
  assigned_to_id = (
    SELECT id FROM employees WHERE id = (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- LEADS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON leads;

CREATE POLICY "admins_all_leads"
ON leads FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "marketing_see_leads"
ON leads FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Marketing'
  OR is_admin()
);

CREATE POLICY "marketing_manage_leads"
ON leads FOR ALL TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Marketing'
  OR is_admin()
)
WITH CHECK (
  (auth.jwt() ->> 'department') = 'Marketing'
  OR is_admin()
);

-- EMPLOYEES TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON employees;

CREATE POLICY "admins_all_employees"
ON employees FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "hr_manager_see_employees"
ON employees FOR SELECT TO authenticated
USING (
  is_department_manager('HR')
  OR is_admin()
);

CREATE POLICY "hr_manager_manage_employees"
ON employees FOR ALL TO authenticated
USING (
  is_department_manager('HR')
  OR is_admin()
)
WITH CHECK (
  is_department_manager('HR')
  OR is_admin()
);

CREATE POLICY "employees_see_self"
ON employees FOR SELECT TO authenticated
USING (
  id = (
    SELECT id FROM profiles WHERE id = auth.uid()
  )
);

-- INVOICES TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON invoices;

CREATE POLICY "admins_all_invoices"
ON invoices FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "finance_see_invoices"
ON invoices FOR SELECT TO authenticated
USING (
  is_department_manager('Finance')
  OR (auth.jwt() ->> 'department') = 'Finance'
  OR is_admin()
);

CREATE POLICY "finance_manager_manage_invoices"
ON invoices FOR ALL TO authenticated
USING (
  is_department_manager('Finance')
  OR is_admin()
)
WITH CHECK (
  is_department_manager('Finance')
  OR is_admin()
);

-- STUDENTS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON students;

CREATE POLICY "admins_all_students"
ON students FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "customer_success_see_students"
ON students FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Customer Success'
  OR is_admin()
);

CREATE POLICY "customer_success_manage_students"
ON students FOR ALL TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Customer Success'
  OR is_admin()
)
WITH CHECK (
  (auth.jwt() ->> 'department') = 'Customer Success'
  OR is_admin()
);

-- SUPPORT_TICKETS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON support_tickets;

CREATE POLICY "admins_all_tickets"
ON support_tickets FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "customer_success_see_tickets"
ON support_tickets FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Customer Success'
  OR assigned_to_id = (
    SELECT id FROM profiles WHERE id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "customer_success_manage_tickets"
ON support_tickets FOR ALL TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Customer Success'
  OR is_admin()
)
WITH CHECK (
  (auth.jwt() ->> 'department') = 'Customer Success'
  OR is_admin()
);

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT 'Migration 032 - RLS Policies created successfully!' as status;

-- Count policies per table
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;
