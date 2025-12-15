-- ================================================================
-- MIGRATION 040: Fix Admin RLS Logic
-- Description: Implement proper SECURITY DEFINER function for admin checks to fix visibility issues
-- Created: 2025-12-14
-- ================================================================

-- 1. Create robust is_admin() function that checks profiles table directly
-- SECURITY DEFINER ensures it runs with owner privileges (bypassing RLS), 
-- preventing infinite recursion when used in profiles policies.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public -- Secure search path
AS $$ 
BEGIN 
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'developer')
  );
END; 
$$;

-- 2. Update profiles policies to use the new function
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;

CREATE POLICY "profiles_admin_all"
ON profiles FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Update other policies that used the old JWT check to be safe
-- (Most already use is_admin() or explicit role checks, but ensuring consistency)

-- Ensure deals policy uses is_admin() for admin access
DROP POLICY IF EXISTS "admins_all_deals" ON deals; -- Clean up old name if exists
DROP POLICY IF EXISTS "deals_select_sales" ON deals;

CREATE POLICY "deals_select_sales"
ON deals FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Sales'
  OR is_admin()
);

-- Ensure employees policy uses is_admin()
DROP POLICY IF EXISTS "employees_select_own" ON employees;

CREATE POLICY "employees_select_own"
ON employees FOR SELECT TO authenticated
USING (
  email = (auth.jwt() ->> 'email')
  OR is_admin()
  OR (auth.jwt() ->> 'role') = 'hr_manager'
);

-- 4. Seed Data Fix: Ensure at least the current user (if generic admin) exists
-- We can't know the specific auth.uid() here, but we can try to insert the sample admin profile
-- matched by the seed migration 034 identifiers if possible.
-- Since we can't do that safely without IDs, we rely on the implementation plan's verifying step.

SELECT 'Migration 040 - Admin logic fixed and policies updated.' as status;
