-- ================================================================
-- MIGRATION 027: Enterprise Operations Update
-- Purpose: Incidents, Internal Ops Tasks, and Quality Evaluations
-- Created: 2025-12-10
-- ================================================================

-- 1. Incident Management
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    reported_by UUID REFERENCES auth.users(id),
    responsible_party TEXT, -- e.g. "IT Dept", "Trainer", "Student"
    resolution_time INTERVAL, -- SLA tracking
    root_cause TEXT,
    preventive_action TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Ops Task Force (Internal Tasks)
CREATE TABLE IF NOT EXISTS ops_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'qa', 'completed')),
    assigned_to UUID REFERENCES auth.users(id),
    due_date TIMESTAMPTZ,
    tags TEXT[], -- Array e.g. ['finance-audit', 'scheduling']
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Detailed Evaluations (QMS)
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID, -- Optional link if student table not fully enforced
    student_name TEXT, -- Fallback
    criteria JSONB, -- { "clarity": 5, "punctuality": 4, "materials": 5 }
    score DECIMAL(3, 1), -- Calculated average e.g. 4.5
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ops_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON incidents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON ops_tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON evaluations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_status ON ops_tasks(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_session ON evaluations(session_id);
