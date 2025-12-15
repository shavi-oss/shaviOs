-- ================================================================
-- MIGRATION 022: Enterprise Marketing (Ads & Analytics)
-- Purpose: Unified Ad Manager and Advanced Tracking
-- Created: 2025-12-09
-- ================================================================

-- 1. Unified Ad Campaigns (Stores data from Meta, Google, TikTok, etc.)
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('meta', 'instagram', 'google', 'linkedin', 'tiktok', 'snapchat', 'twitter')),
    external_id TEXT NOT NULL, -- ID on the platform (e.g., 23849102...)
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'archived', 'completed')),
    
    -- Financials
    daily_budget DECIMAL(12, 2) DEFAULT 0,
    total_spend DECIMAL(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'EGP',
    
    -- Performance Metrics (Snapshot)
    impressions BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    cpc DECIMAL(10, 2) DEFAULT 0, -- Cost Per Click
    ctr DECIMAL(5, 2) DEFAULT 0,  -- Click Through Rate
    leads BIGINT DEFAULT 0,
    cost_per_lead DECIMAL(10, 2) DEFAULT 0,
    roas DECIMAL(5, 2) DEFAULT 0, -- Return on Ad Spend
    
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Integration Settings (Securely store API Credentials)
CREATE TABLE IF NOT EXISTS integration_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service TEXT NOT NULL UNIQUE, -- e.g. 'meta_ads', 'google_ads'
    client_id TEXT,
    client_secret TEXT, -- NOTE: In production, enable pgsodium/encryption!
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT false,
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Social Conversations (Unified Inbox)
CREATE TABLE IF NOT EXISTS social_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    external_thread_id TEXT,
    participant_name TEXT,
    last_message TEXT,
    unread_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON ad_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON integration_credentials FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON social_conversations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SAMPLE DATA (For Dashboard Visualization)
INSERT INTO ad_campaigns (platform, external_id, name, status, daily_budget, total_spend, impressions, clicks, leads, roas) VALUES 
('meta', '123456789', 'Summer Coding Bootcamp - FB', 'active', 500, 4500, 45000, 1200, 85, 4.2),
('instagram', '987654321', 'Design Masterclass - Insta', 'active', 300, 2100, 32000, 950, 45, 3.8),
('google', '555444333', 'Search: Learn Python', 'paused', 800, 12000, 12000, 800, 30, 2.5),
('tiktok', '111222333', 'Viral Student Projects', 'active', 400, 2000, 89000, 2500, 90, 5.1);

INSERT INTO integration_credentials (service) VALUES
('meta_ads'), ('google_ads'), ('tiktok_ads'), ('linkedin_ads');
