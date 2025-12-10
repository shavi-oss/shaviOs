-- ================================================================
-- MIGRATION 023: Sales Enhancement (Quotes, Goals, CRM)
-- Purpose: Add CRM features for quotes, targets, and activity logging
-- Created: 2025-12-09
-- ================================================================

-- 1. Sales Quotes (Proposals linked to Deals)
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    quote_number SERIAL, -- Auto-incrementing human readable ID (e.g. 1001)
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    
    -- Content
    items JSONB NOT NULL DEFAULT '[]', -- Array of {description, qty, unit_price, total}
    subtotal DECIMAL(12, 2) DEFAULT 0,
    tax_rate DECIMAL(5, 2) DEFAULT 14, -- VAT 14%
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    
    -- Metadata
    valid_until DATE,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sales Goals (Gamification Targets)
CREATE TABLE IF NOT EXISTS sales_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id), -- If null, team goal
    period TEXT NOT NULL CHECK (period IN ('monthly', 'quarterly', 'yearly')),
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Deal Activities (Timeline)
CREATE TABLE IF NOT EXISTS deal_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('note', 'call', 'meeting', 'email', 'status_change')),
    content TEXT NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON quotes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON sales_goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON deal_activities FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SAMPLE DATA
-- Insert a sample goal
INSERT INTO sales_goals (target_amount, current_amount, period, start_date, end_date) 
VALUES (500000, 320000, 'monthly', DATE_TRUNC('month', CURRENT_DATE), (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'));
