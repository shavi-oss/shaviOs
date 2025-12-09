-- ================================================================
-- MIGRATION 020: Finance Module (Transactions)
-- Purpose: Centralized tracking of all financial movements (Income/Expense)
-- Created: 2025-12-09
-- ================================================================

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core info
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EGP',
    category TEXT NOT NULL, -- e.g., 'Tuition', 'Salary', 'Rent', 'Software', 'Marketing'
    description TEXT,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Relationships (Nullable)
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL, -- Link to income source
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL, -- Link to marketing spend
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    custom_metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users (Staff)
CREATE POLICY "Enable read access for all authenticated users" ON transactions
    FOR SELECT TO authenticated USING (true);

-- Allow insert/update/delete only if needed (for now open to authenticated, can be restricted to admin/finance roles later)
CREATE POLICY "Enable insert for authenticated users" ON transactions
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON transactions
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete for authenticated users" ON transactions
    FOR DELETE TO authenticated USING (true);

-- Sample Data (Seed financial history)
INSERT INTO transactions (type, amount, category, description, date) VALUES
('expense', 15000, 'Rent', 'Office Rent - Jan 2024', NOW() - INTERVAL '30 days'),
('expense', 120000, 'Salaries', 'Staff Payroll - Jan 2024', NOW() - INTERVAL '30 days'),
('expense', 5000, 'Software', 'Vercel & Supabase Subscription', NOW() - INTERVAL '15 days'),
('income', 25000, 'Tuition', 'Course Enrollment Batch A', NOW() - INTERVAL '20 days'),
('income', 35000, 'Consulting', 'Corporate Training Project', NOW() - INTERVAL '10 days');
