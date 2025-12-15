-- ================================================================
-- MIGRATION 047: Fix RLS Helper Functions (Critical Hotfix)
-- Purpose: Correctly read user role from JWT metadata instead of Postgres role
-- ================================================================

-- 1. Fix is_admin()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check user_metadata for 'role'
  RETURN (
    (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'developer')
    OR
    -- Fallback: Check profiles table directly (more expensive but safer)
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'developer')
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix is_department_manager()
CREATE OR REPLACE FUNCTION public.is_department_manager(dept TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') LIKE '%_manager'
    AND 
    coalesce(auth.jwt() -> 'user_metadata' ->> 'department', '') = dept
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Fix is_senior_in_department()
CREATE OR REPLACE FUNCTION public.is_senior_in_department(dept TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'senior'
    AND 
    coalesce(auth.jwt() -> 'user_metadata' ->> 'department', '') = dept
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Note: No changes needed to policies, as they use these functions.
-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
