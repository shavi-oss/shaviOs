-- Fix Students RLS Policy for INSERT operations
-- Created: 2025-12-20
-- Purpose: Allow customer_success roles to insert students

-- Drop existing permissive policies that might conflict
DROP POLICY IF EXISTS "customer_success_manage_students" ON students;

-- Create comprehensive policy for customer_success roles
CREATE POLICY "customer_success_full_access_students"
ON students FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'customer_success')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'manager', 'customer_success')
    )
);
