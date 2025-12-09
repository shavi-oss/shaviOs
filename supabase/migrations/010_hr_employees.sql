-- ================================================================
-- MIGRATION 010: HR Module (Employees)
-- Description: Creates table for tracking employees
-- Created: 2025-12-09
-- ================================================================

-- ================================================================
-- TABLE: employees
-- Purpose: Store employee information and status
-- ================================================================

CREATE TABLE IF NOT EXISTS employees (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Professional Info
    position TEXT NOT NULL,
    department TEXT NOT NULL 
        CHECK (department IN ('management', 'hr', 'finance', 'marketing', 'sales', 'customer_success', 'tech', 'trainers')),
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'on_leave', 'terminated', 'resigned', 'probation')),
    
    -- Compensation (could be in a separate table for security, but keeping simple for now)
    salary DECIMAL(10, 2),
    currency TEXT DEFAULT 'EGP',
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_created_at ON employees(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all for authenticated users" ON employees
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON employees
    FOR ALL TO service_role USING (true) WITH CHECK (true);
