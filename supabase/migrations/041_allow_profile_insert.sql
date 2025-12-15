-- ================================================================
-- MIGRATION 041: Allow Profile Self-Registration
-- Description: Allow users to insert their own profile to escape generic RLS blocking
-- Created: 2025-12-14
-- ================================================================

-- 1. Allow users to INSERT their own profile
-- This is critical for users who don't have a profile yet (bootstrap problem)
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- 2. Allow users to UPDATE their own full_name/avatar etc
-- (Existing policy "profiles_update_own" handles this, verifying here)

-- 3. Just in case: Allow authenticated users to SEE their own profile is already covered by "profiles_select_own"

SELECT 'Migration 041 - Users can now insert their own profile.' as status;
