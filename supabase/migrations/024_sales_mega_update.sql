-- ================================================================
-- MIGRATION 024: Sales Mega-Update (Files, Tasks, Notifications)
-- Purpose: Support for full CRM features and internal notifications
-- Created: 2025-12-09
-- ================================================================

-- 1. Deal Files (Attachments)
CREATE TABLE IF NOT EXISTS deal_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL, -- Simulating storage URL
    size BIGINT, -- in bytes
    type TEXT, -- mime type
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tasks & Follow-ups
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Polymorphic relation (can be linked to deal, lead, invoice, etc.)
    related_to_type TEXT DEFAULT 'deal', 
    related_to_id UUID, -- deal_id or other
    
    assigned_to UUID REFERENCES auth.users(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Internal System Notifications (User Alerts)
CREATE TABLE IF NOT EXISTS system_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
    link TEXT, -- URL to redirect to
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Sample Data
-- Add a task
INSERT INTO tasks (title, description, priority, status, due_date)
VALUES 
    ('Follow up with New Client', 'Call regarding the proposal sent yesterday.', 'high', 'pending', NOW() + INTERVAL '1 day'),
    ('Prepare Monthly Report', 'Sales report for management.', 'normal', 'pending', NOW() + INTERVAL '3 days');

-- Add a notification
-- Note: We can't easily guess a valid user_id here without extensive sub-selects which might fail if empty. 
-- Skipping notification insert in migration to avoid constraint errors.

-- RLS
ALTER TABLE deal_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON deal_files FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON system_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);
