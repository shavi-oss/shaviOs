-- ================================================================
-- MIGRATION 021: Marketing Expansion (Social & Notifications)
-- Purpose: Support Social Media Management and Multi-channel Notifications
-- Created: 2025-12-09
-- ================================================================

-- 1. Social Media Accounts (Stores credentials for connected platforms)
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'linkedin')),
    username TEXT NOT NULL,
    page_name TEXT,
    page_id TEXT, -- External ID from the platform
    
    -- Security (In real app, these should be encrypted. For MVP/Mock, we store as text)
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    
    avatar_url TEXT,
    is_connected BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Social Media Posts (Track performance of posts)
CREATE TABLE IF NOT EXISTS social_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    
    content TEXT,
    media_url TEXT,
    external_post_id TEXT,
    
    -- Engagement Metrics
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    published_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Marketing Notifications (Configuration for outbound alerts)
CREATE TABLE IF NOT EXISTS marketing_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel TEXT NOT NULL CHECK (channel IN ('email', 'telegram', 'whatsapp')),
    name TEXT NOT NULL, -- e.g. "Sales Team Telegram"
    
    -- Configuration (JSON to store channel-specifics like ChatID, Phone Number, Email Address)
    config JSONB DEFAULT '{}', 
    
    is_active BOOLEAN DEFAULT true,
    events TEXT[] DEFAULT '{}', -- e.g. ['lead_new', 'campaign_end']
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_social_platform ON social_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_account ON social_posts(account_id);

-- Triggers for updated_at
CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON social_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_notifications_updated_at
    BEFORE UPDATE ON marketing_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Enable Security)
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_notifications ENABLE ROW LEVEL SECURITY;

-- Policies (Open to authenticated staff for MVP)
CREATE POLICY "Enable all for authenticated users" ON social_accounts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON social_posts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON marketing_notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SAMPLE DATA (For Development/UI Testing)
INSERT INTO social_accounts (platform, username, page_name, is_connected, avatar_url) VALUES 
('facebook', 'shavi_academy', 'Shavi Academy Official', true, 'https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg'),
('instagram', '@shavi_edu', 'Shavi Academy', true, 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg'),
('linkedin', 'school-of-code', 'Shavi Tech School', false, 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png');

INSERT INTO marketing_notifications (channel, name, config, events) VALUES
('telegram', 'Marketing Alerts', '{"chat_id": "123456"}', ARRAY['lead_new']),
('email', 'CMO Weekly Report', '{"email": "cmo@shavi.os"}', ARRAY['campaign_end']);
