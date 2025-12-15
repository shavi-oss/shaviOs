-- ================================================================
-- MIGRATION 025: Operations Module (Trainers, Classes, Quality)
-- Purpose: Schema for class scheduling and operations management
-- Created: 2025-12-10
-- ================================================================

-- 1. Trainers
CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- Optional: Link if they have login access
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    specialization TEXT[], -- Array of strings: ['React', 'Node.js']
    hourly_rate DECIMAL(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'leave')),
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Rooms / Labs
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g. "Lab A"
    capacity INT DEFAULT 20,
    resources TEXT[], -- Array: ['Projector', 'Macs', 'Whiteboard']
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Classes / Sessions
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    course_code TEXT, -- e.g. "FS-101"
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    description TEXT,
    max_students INT DEFAULT 30,
    enrolled_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Quality Feedback
CREATE TABLE IF NOT EXISTS class_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_name TEXT, -- Optional name
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON trainers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON rooms FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON classes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON class_feedback FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SAMPLE DATA
-- COMMENTED OUT: Can conflict with existing table schemas
-- INSERT INTO rooms (name, capacity, resources) VALUES
-- ('Lab A (Mac)', 25, ARRAY['Mac M1', 'Projector', 'AC']),
-- ('Lab B (Windows)', 30, ARRAY['High-End PC', 'Smart Board']),
-- ('Meeting Room', 10, ARRAY['TV', 'Conference Phone']);

-- INSERT INTO trainers (first_name, last_name, specialization, hourly_rate, bio) VALUES
-- ('Sarah', 'Ahmed', ARRAY['UI/UX', 'Figma'], 400, 'Senior Product Designer'),
-- ('Omar', 'Hassan', ARRAY['React', 'Next.js', 'Node.js'], 500, 'Full Stack Lead'),
-- ('Khaled', 'Ibrahim', ARRAY['Python', 'Data Science'], 450, 'AI Researcher');
