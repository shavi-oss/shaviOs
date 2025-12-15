-- ================================================================
-- MIGRATION 037: Fix Infinite Recursion in RLS Policies
-- Description: Simplify policies to avoid circular dependencies
-- Created: 2025-12-13
-- ================================================================

-- The problem: Complex policies with subqueries to profiles caused
-- infinite recursion. Solution: Use simpler policies.

-- ================================================================
-- STEP 1: Drop ALL existing policies (start fresh)
-- ================================================================

-- Profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON profiles;

-- Employees  
DROP POLICY IF EXISTS "employees_create_own_leave" ON leave_requests;
DROP POLICY IF EXISTS "employees_see_own_leave" ON leave_requests;
DROP POLICY IF EXISTS "employees_see_own_payroll" ON payroll_records;
DROP POLICY IF EXISTS "employees_see_own_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "employees_comment_reviews" ON performance_reviews;
DROP POLICY IF EXISTS "employees_see_self" ON employees;
DROP POLICY IF EXISTS "sales_see_own_deals" ON deals;
DROP POLICY IF EXISTS "sales_update_assigned_deals" ON deals;

-- ================================================================
-- STEP 2: Create SIMPLE policies for PROFILES (no recursion!)
-- ================================================================

-- Everyone can see their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid());

-- Everyone can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins see all
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all"
ON profiles FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role') IN ('admin', 'developer'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('admin', 'developer'));

-- ================================================================
-- STEP 3: EMPLOYEES - Simple policies
-- ================================================================

-- Everyone can see own employee record (match by email)
DROP POLICY IF EXISTS "employees_select_own" ON employees;
CREATE POLICY "employees_select_own"
ON employees FOR SELECT TO authenticated
USING (
  email = (auth.jwt() ->> 'email')
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer', 'hr_manager')
);

-- ================================================================
-- STEP 4: LEAVE_REQUESTS - Simplified
-- ================================================================

-- Employees create own (using auth.uid() directly)
DROP POLICY IF EXISTS "leave_create_own" ON leave_requests;
CREATE POLICY "leave_create_own"
ON leave_requests FOR INSERT TO authenticated
WITH CHECK (
  -- User must exist in employees table with matching user_id
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = leave_requests.employee_id 
    AND email = (auth.jwt() ->> 'email')
  )
  AND status = 'pending'
);

-- Employees see own leave
DROP POLICY IF EXISTS "leave_select_own" ON leave_requests;
CREATE POLICY "leave_select_own"
ON leave_requests FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = leave_requests.employee_id 
    AND email = (auth.jwt() ->> 'email')
  )
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer', 'hr_manager')
);

-- ================================================================
-- STEP 5: PAYROLL_RECORDS - Simplified
-- ================================================================

DROP POLICY IF EXISTS "payroll_select_own" ON payroll_records;
CREATE POLICY "payroll_select_own"
ON payroll_records FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = payroll_records.employee_id 
    AND email = (auth.jwt() ->> 'email')
  )
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer', 'hr_manager')
);

-- ================================================================
-- STEP 6: PERFORMANCE_REVIEWS - Simplified
-- ================================================================

DROP POLICY IF EXISTS "reviews_select_own" ON performance_reviews;
CREATE POLICY "reviews_select_own"
ON performance_reviews FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = performance_reviews.employee_id 
    AND email = (auth.jwt() ->> 'email')
  )
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer', 'hr_manager')
  OR reviewer_id = auth.uid()
);

DROP POLICY IF EXISTS "reviews_update_own" ON performance_reviews;
CREATE POLICY "reviews_update_own"
ON performance_reviews FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = performance_reviews.employee_id 
    AND email = (auth.jwt() ->> 'email')
  )
)
WITH CHECK (
  employee_comments IS NOT NULL
  AND employee_acknowledged = true
);

-- ================================================================
-- STEP 7: DEALS - Simplified
-- ================================================================

DROP POLICY IF EXISTS "deals_select_sales" ON deals;
CREATE POLICY "deals_select_sales"
ON deals FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Sales'
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer')
);

DROP POLICY IF EXISTS "deals_update_assigned" ON deals;
CREATE POLICY "deals_update_assigned"
ON deals FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM employees 
    WHERE id = deals.assigned_to_id 
    AND email = (auth.jwt() ->> 'email')
  )
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer')
);

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT 'Migration 037 - Fixed infinite recursion! Policies simplified.' as status;

-- Show active policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'employees', 'leave_requests', 'payroll_records', 'deals')
ORDER BY tablename, policyname;

