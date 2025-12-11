-- ================================================================
-- ADD MISSING TABLES TO EXISTING SHAVI ACADEMY OS DATABASE
-- Execute this file to add missing tables only
-- Safe to run - won't affect existing tables
-- ================================================================

-- ================================================================
-- PART 1: PROFILES TABLE (CRITICAL for Authentication)
-- ================================================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT UNIQUE,
    avatar_url TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'employee', 'sales', 'hr', 'finance', 'operations', 'trainer', 'support', 'developer')),
    department TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );


-- ================================================================
-- PART 2: PIPELINE STAGES (for Sales Module)
-- ================================================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default stages
INSERT INTO pipeline_stages (name, position, color) VALUES
    ('New Lead', 1, '#6366f1'),
    ('Qualification', 2, '#8b5cf6'),
    ('Proposal', 3, '#ec4899'),
    ('Negotiation', 4, '#f59e0b'),
    ('Closed Won', 5, '#10b981'),
    ('Closed Lost', 6, '#ef4444')
ON CONFLICT DO NOTHING;


-- ================================================================
-- PART 3: TRAINERS EXTENSION (complement course_sessions)
-- ================================================================

CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    specializations TEXT[],
    bio TEXT,
    experience_years INTEGER,
    hourly_rate NUMERIC(10,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS training_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id),
    course_name TEXT NOT NULL,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location TEXT,
    capacity INTEGER DEFAULT 15,
    enrolled_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES training_sessions(id),
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    max_score INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trainers_email ON trainers(email);
CREATE INDEX IF NOT EXISTS idx_sessions_trainer ON training_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON training_sessions(session_date);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PART 4: HR EXTENSION
-- ================================================================

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES employees(id),
    leave_type TEXT NOT NULL CHECK (leave_type IN ('vacation', 'sick', 'personal', 'unpaid')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_count INTEGER NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES profiles(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leave_employee ON leave_requests(employee_id);
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PART 5: FINANCE EXTENSION
-- ================================================================

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12,2) NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    date DATE NOT NULL,
    vendor TEXT,
    payment_method TEXT,
    receipt_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PART 6: OPERATIONS MODULE
-- ================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assignee_id UUID REFERENCES profiles(id),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PART 7: SUPPORT EXTENSION
-- ================================================================

CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;


-- ================================================================
-- PART 8: UPDATE TRIGGERS
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to new tables with updated_at
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
        AND table_name IN ('profiles', 'trainers', 'leave_requests')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
            CREATE TRIGGER update_%I_updated_at
                BEFORE UPDATE ON %I
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        ', t, t, t, t);
    END LOOP;
END $$;


-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check all tables now exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should now see 30+ tables!


-- ================================================================
-- SETUP COMPLETE! ✅
-- Next: Create admin user in Supabase Authentication Dashboard
-- ================================================================
