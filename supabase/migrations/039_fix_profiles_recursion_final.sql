-- ================================================================
-- MIGRATION 039: Final Fix for Profiles RLS Recursion
-- Description: Wipes ALL existing policies on profiles table and applies strictly non-recursive ones.
-- Created: 2025-12-14
-- ================================================================

-- STEP 1: Dynamically drop ALL policies on the profiles table
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON profiles', pol.policyname);
  END LOOP;
END $$;

-- STEP 2: Re-apply strictly safe, non-recursive policies

-- 1. Everyone can see their own profile (ID match only)
CREATE POLICY "profiles_select_own"
ON profiles FOR SELECT TO authenticated
USING (id = auth.uid());

-- 2. Everyone can update their own profile (ID match only)
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 3. Admins/Developers can see all (JWT role match only)
CREATE POLICY "profiles_admin_all"
ON profiles FOR ALL TO authenticated
USING ((auth.jwt() ->> 'role') IN ('admin', 'developer'))
WITH CHECK ((auth.jwt() ->> 'role') IN ('admin', 'developer'));

-- NOTE: No other policies should exist on profiles. 

SELECT 'Migration 039 - Profiles RLS fully reset.' as status;
