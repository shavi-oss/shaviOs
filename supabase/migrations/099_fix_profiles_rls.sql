-- ================================================================
-- MIGRATION 099: Fix Profiles RLS and Data
-- Description: Unblock escalation by allowing profile reads and fixing user data
-- Created: 2025-12-20
-- ================================================================

-- 1. Relax RLS on profiles to allow any authenticated user to read all profiles
-- This is necessary for assigning tickets, escalation lookup, etc.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Profiles are viewable by everyone" 
ON profiles FOR SELECT 
USING ( true );

-- 2. Update Admin user to be in Customer Success department (for proper escalation routing)
UPDATE profiles 
SET department = 'customer_success'
WHERE email = 'admin@shavi.com';

-- 3. Update CS Agent name if null
UPDATE profiles 
SET full_name = 'CS Agent 1'
WHERE email = 'cs@shaviacademy.com' AND full_name IS NULL;

-- 4. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

SELECT 'Migration 099 - Profiles Fixed' as status;
