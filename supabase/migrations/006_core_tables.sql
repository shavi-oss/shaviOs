-- ================================================================
-- MIGRATION 006: Core Application Tables
-- Description: Creates tables for Marketing, Customer Success modules
-- Created: 2025-12-08
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TABLE: leads
-- Purpose: Store marketing leads with scoring and temperature
-- ================================================================

CREATE TABLE IF NOT EXISTS leads (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Contact Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    
    -- Lead Status & Source
    status TEXT NOT NULL DEFAULT 'new' 
        CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
    source TEXT NOT NULL DEFAULT 'manual',
    
    -- Scoring & Temperature
    total_score INTEGER DEFAULT 0 CHECK (total_score >= 0 AND total_score <= 100),
    temperature TEXT CHECK (temperature IN ('hot', 'warm', 'cold')),
    
    -- Additional Info
    notes TEXT,
    last_contact TIMESTAMPTZ,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT leads_email_key UNIQUE (email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_temperature ON leads(temperature);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ================================================================
-- TABLE: lead_activities
-- Purpose: Track all interactions with leads
-- ================================================================

CREATE TABLE IF NOT EXISTS lead_activities (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Key
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    
    -- Activity Details
    type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note')),
    description TEXT NOT NULL,
    
    -- Tracking
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at ON lead_activities(created_at DESC);

-- ================================================================
-- TABLE: students
-- Purpose: Store student information and enrollment status
-- ================================================================

CREATE TABLE IF NOT EXISTS students (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Personal Information
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    
    -- Student Status
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'at_risk', 'completed', 'paused', 'dropped')),
    
    -- Enrollment Info
    enrollment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_enrollment_date ON students(enrollment_date DESC);

-- ================================================================
-- TABLE: support_tickets
-- Purpose: Customer support ticket management
-- ================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Ticket Information
    title TEXT NOT NULL,
    description TEXT,
    
    -- Priority & Status
    priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open'
        CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed')),
    
    -- Relationships (optional - can be NULL if tables don't exist)
    student_id UUID,
    student_name TEXT,
    student_email TEXT,
    assigned_to_id UUID,
    assigned_to_name TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_student_id ON support_tickets(student_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- ================================================================
-- TRIGGERS: Auto-update updated_at timestamps
-- ================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables
CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS but allow all operations for authenticated users
-- You can customize these based on your security requirements
-- ================================================================

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for authenticated users)
CREATE POLICY "Enable all for authenticated users" ON leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON lead_activities
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON students
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users" ON support_tickets
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Optional: Allow service role to bypass RLS
CREATE POLICY "Enable all for service role" ON leads
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON lead_activities
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON students
    FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON support_tickets
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

-- You can verify tables were created with:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;
