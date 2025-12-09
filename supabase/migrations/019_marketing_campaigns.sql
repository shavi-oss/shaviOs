-- ================================================================
-- MIGRATION 019: Marketing Campaigns
-- Purpose: Track marketing initiatives, budget, and performance
-- Created: 2025-12-09
-- ================================================================

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    
    -- Status & Type
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
    type TEXT NOT NULL DEFAULT 'social' CHECK (type IN ('social', 'email', 'search', 'print', 'event', 'other')),
    
    -- Budgeting
    budget DECIMAL(10, 2) DEFAULT 0,
    spend DECIMAL(10, 2) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    
    -- Performance Metrics (Simplified)
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    
    -- Dates
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON campaigns
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Insert Sample Data
INSERT INTO campaigns (name, description, status, type, budget, spend, start_date, end_date, impressions, clicks, conversions) VALUES
('Summer Bootcamp 2024', 'Social media push for summer coding courses', 'active', 'social', 50000, 12500, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', 45000, 1200, 45),
('Corporate Training Q1', 'Email outreach to tech companies', 'completed', 'email', 10000, 8000, NOW() - INTERVAL '3 months', NOW() - INTERVAL '1 month', 5000, 800, 12),
('Google Ads - Full Stack', 'Search campaign for full stack keywords', 'paused', 'search', 25000, 15000, NOW() - INTERVAL '1 month', NOW() + INTERVAL '1 month', 20000, 3500, 80);
