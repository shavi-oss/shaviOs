-- ================================================================
-- MIGRATION 016: Sales Commissions
-- Description: Creates tables for tracking sales commissions
-- Created: 2025-12-09
-- ================================================================

-- ================================================================
-- TABLE: commissions
-- Purpose: Track commission payouts for sales employees
-- ================================================================

CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    employee_id UUID NOT NULL REFERENCES employees(id),
    deal_id UUID REFERENCES deals(id), -- Optional: Commission might be bonus unrelated to specific deal
    
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EGP',
    
    type TEXT NOT NULL DEFAULT 'deal_commission' CHECK (type IN ('deal_commission', 'bonus', 'quarterly_target')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    
    pay_period TEXT, -- e.g., "Feb 2024"
    paid_at TIMESTAMPTZ,
    approved_by UUID, -- ID of manager who approved
    
    notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- TABLE: commission_rules
-- Purpose: Define percentage rules per role (Optional for now, but good structure)
-- ================================================================

CREATE TABLE IF NOT EXISTS commission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL UNIQUE, -- e.g., 'sales_rep', 'sales_manager'
    percentage DECIMAL(5, 2) NOT NULL DEFAULT 5.0, -- 5%
    min_deal_value DECIMAL(10, 2) DEFAULT 0,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_commissions_employee ON commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_commissions_deal ON commissions(deal_id);
CREATE INDEX IF NOT EXISTS idx_commissions_created_at ON commissions(created_at DESC);

-- Triggers
CREATE TRIGGER update_commissions_updated_at BEFORE UPDATE ON commissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commission_rules_updated_at BEFORE UPDATE ON commission_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON commissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON commission_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service role" ON commissions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for service role" ON commission_rules FOR ALL TO service_role USING (true) WITH CHECK (true);
