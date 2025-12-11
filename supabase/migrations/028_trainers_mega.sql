-- ================================================================
-- MIGRATION 028: Trainers Mega-Update
-- Purpose: Complete backend for Trainer Profiles, Skills, Payroll, and Availability.
-- Created: 2025-12-10
-- ================================================================

-- 1. Expand Trainers Table
ALTER TABLE trainers 
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS experience_years INT,
ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('full_time', 'part_time', 'freelance')),
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10, 2) DEFAULT 0; -- Ensure this exists or update if already there

-- 2. Trainer Skills Matrix
CREATE TABLE IF NOT EXISTS trainer_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL,
    proficiency INT CHECK (proficiency BETWEEN 1 AND 5), -- 1=Novice, 5=Expert
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Trainer Availability (Weekly Template)
CREATE TABLE IF NOT EXISTS trainer_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun, 6=Sat
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Trainer Payments (Payroll)
CREATE TABLE IF NOT EXISTS trainer_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id),
    amount DECIMAL(10, 2) NOT NULL,
    period_start DATE,
    period_end DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
    sessions_count INT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Trainer Documents
CREATE TABLE IF NOT EXISTS trainer_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
    title TEXT NOT NULL, -- e.g. "Contract", "ID"
    url TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE trainer_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated" ON trainer_skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON trainer_availability FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON trainer_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON trainer_documents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trainer_skills_trainer ON trainer_skills(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_availability_trainer ON trainer_availability(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_payments_trainer ON trainer_payments(trainer_id);
