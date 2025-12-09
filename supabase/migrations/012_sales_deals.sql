-- ================================================================
-- MIGRATION 012: Sales Module (Deals Pipeline)
-- Description: Creates table for tracking sales deals
-- Created: 2025-12-09
-- ================================================================

-- ================================================================
-- TABLE: deals
-- Purpose: Track sales opportunities through the pipeline
-- ================================================================

CREATE TABLE IF NOT EXISTS deals (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Deal Information
    title TEXT NOT NULL,
    value DECIMAL(10, 2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    
    -- Pipeline Status
    stage TEXT NOT NULL DEFAULT 'lead'
        CHECK (stage IN ('lead', 'contacted', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
    
    -- Relationships
    lead_id UUID REFERENCES leads(id), -- Optional link to existing lead
    assigned_to_id UUID REFERENCES employees(id), -- Optional link to sales rep
    
    -- Metadata (Customer Info directly on deal for simplicity if no lead exists)
    customer_name TEXT, 
    customer_company TEXT,
    
    -- Tracking dates
    expected_close_date DATE,
    actual_close_date DATE,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_deals_stage ON deals(stage);
CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON deals(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close ON deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON deals(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_deals_updated_at
    BEFORE UPDATE ON deals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all for authenticated users" ON deals
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON deals
    FOR ALL TO service_role USING (true) WITH CHECK (true);
