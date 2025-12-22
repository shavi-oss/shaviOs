-- ================================================================
-- MIGRATION 049: Fix Support Tickets Schema Mismatches
-- Description: Add missing columns and ensure compatibility
-- Created: 2025-12-20
-- ================================================================

-- Add workflow columns if they don't exist
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS escalation_level INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Add assigned_to_id column (new naming convention)
-- Keep assigned_to for backward compatibility
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES auth.users(id);

-- Migrate data from assigned_to to assigned_to_id if needed
UPDATE support_tickets 
SET assigned_to_id = assigned_to 
WHERE assigned_to_id IS NULL AND assigned_to IS NOT NULL;

-- Add student columns if they don't exist (from user's description)
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS student_id UUID,
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS student_email TEXT;

-- Migrate customer data to student data if needed
UPDATE support_tickets
SET 
    student_id = customer_id,
    student_name = customer_name,
    student_email = customer_email
WHERE student_id IS NULL;

-- Add assigned_to_name for denormalization (performance)
ALTER TABLE support_tickets
ADD COLUMN IF NOT EXISTS assigned_to_name TEXT;

-- Populate assigned_to_name from profiles
UPDATE support_tickets st
SET assigned_to_name = p.full_name
FROM profiles p
WHERE st.assigned_to_id = p.id
AND st.assigned_to_name IS NULL;

-- Add title column (alias for subject for compatibility)
-- Note: We'll keep subject as the primary column
-- and update code to use subject instead of title

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to_id 
ON support_tickets(assigned_to_id) 
WHERE assigned_to_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tickets_student_id 
ON support_tickets(student_id) 
WHERE student_id IS NOT NULL;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

SELECT 'Migration 049 - Support Tickets Schema Fixed' as status;
