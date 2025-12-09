-- ================================================================
-- SAMPLE DATA: Trainers Module
-- Description: Insert sample courses and sessions
-- Run this AFTER running 014_trainers_courses.sql
-- ================================================================

-- Insert Courses
INSERT INTO courses (title, code, category, level, duration_weeks, price, status) VALUES
    ('تطوير واجهات المستخدم React', 'DEV-101', 'programming', 'intermediate', 12, 15000.00, 'active'),
    ('أساسيات تصميم الجرافيك', 'DES-101', 'design', 'beginner', 8, 8000.00, 'active'),
    ('التسويق الرقمي الشامل', 'MKT-201', 'marketing', 'advanced', 10, 12000.00, 'active'),
    ('تحليل البيانات باستخدام Python', 'DAT-101', 'data', 'intermediate', 14, 18000.00, 'active'),
    ('اللغة الإنجليزية للأعمال', 'LNG-101', 'languages', 'beginner', 12, 6000.00, 'active');

-- Insert Sessions (Assuming we have trainers from employees table)
-- Note: In a real scenario, we'd query for trainer IDs. For sample data, we'll try to use a placeholder or insert new trainers if needed.
-- But we already inserted employees in migration 011 with department='trainers'.
-- Let's assume the user will run this after 011.

-- To be safe, let's insert a guaranteed trainer first if not exists (though we have 'Omar Farouk' and 'Noor Ibrahim' from 011)

-- We will use a subquery/CTE approach or just rely on the user having run 011.
-- For simplicity, let's insert sessions linked to the FIRST employee found in 'trainers' department for validity.

DO $$
DECLARE
    trainer_id UUID;
    course_id_1 UUID;
    course_id_2 UUID;
BEGIN
    -- Get a trainer ID
    SELECT id INTO trainer_id FROM employees WHERE department = 'trainers' LIMIT 1;
    
    -- Get Course IDs
    SELECT id INTO course_id_1 FROM courses WHERE code = 'DEV-101' LIMIT 1;
    SELECT id INTO course_id_2 FROM courses WHERE code = 'DES-101' LIMIT 1;

    -- Only insert if we found a trainer and courses
    IF trainer_id IS NOT NULL AND course_id_1 IS NOT NULL THEN
        INSERT INTO course_sessions (course_id, trainer_id, name, start_date, end_date, schedule_days, start_time, end_time, status) VALUES
            (course_id_1, trainer_id, 'React دفعة يناير - صباحي', '2024-01-15', '2024-04-15', ARRAY['Mon', 'Wed'], '10:00', '13:00', 'scheduled'),
            (course_id_1, trainer_id, 'React دفعة فبراير - مسائي', '2024-02-01', '2024-05-01', ARRAY['Sun', 'Tue'], '18:00', '21:00', 'scheduled');
    END IF;

    IF trainer_id IS NOT NULL AND course_id_2 IS NOT NULL THEN
        INSERT INTO course_sessions (course_id, trainer_id, name, start_date, end_date, schedule_days, start_time, end_time, status) VALUES
            (course_id_2, trainer_id, 'Graphic Design - المجموعة الأولى', '2024-01-20', '2024-03-20', ARRAY['Sat'], '10:00', '14:00', 'ongoing');
    END IF;
END $$;
