-- ================================================================
-- MIGRATION 014: Trainers & Courses Module
-- Description: Creates tables for courses and sessions
-- Created: 2025-12-09
-- ================================================================

-- ================================================================
-- TABLE: courses
-- Purpose: Catalog of courses offered by the academy
-- ================================================================

CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    code TEXT UNIQUE NOT NULL, -- e.g., 'WEB-101'
    category TEXT NOT NULL CHECK (category IN ('programming', 'design', 'marketing', 'business', 'languages', 'data')),
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    duration_weeks INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- TABLE: sessions
-- Purpose: Scheduled instances of courses
-- ================================================================

CREATE TABLE IF NOT EXISTS course_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    trainer_id UUID NOT NULL REFERENCES employees(id), -- Trainers are employees in 'trainers' dept
    
    name TEXT NOT NULL, -- e.g., "Web Dev - Group A - Jan 2024"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    schedule_days TEXT[], -- e.g., ['Mon', 'Wed']
    start_time TIME,
    end_time TIME,
    
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
    max_students INTEGER DEFAULT 20,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- TABLE: enrollments
-- Purpose: Link students to sessions
-- ================================================================

CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES course_sessions(id),
    student_id UUID NOT NULL REFERENCES students(id),
    
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'failed')),
    grade DECIMAL(5, 2), -- Optional grade
    
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_sessions_course ON course_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_sessions_trainer ON course_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON course_sessions(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);

-- Triggers
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON course_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON course_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON enrollments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service role" ON courses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service role" ON course_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service role" ON enrollments FOR ALL TO service_role USING (true) WITH CHECK (true);
