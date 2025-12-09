-- ================================================================
-- MIGRATION 018: Advanced Tech Panel
-- Purpose: Schema for Webhooks, Secrets, and Integrations
-- Created: 2025-12-09
-- ================================================================

-- Enable pgcrypto for value encryption if available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================================
-- TABLE: system_secrets
-- Purpose: Securely store API keys and tokens
-- Note: 'value' should be encrypted at application level or using PGP_SYM_ENCRYPT
-- ================================================================

CREATE TABLE IF NOT EXISTS system_secrets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE, -- e.g. 'TELEGRAM_BOT_TOKEN'
    encrypted_value TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general', -- 'auth', 'payment', 'marketing'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for lookup
CREATE INDEX IF NOT EXISTS idx_secrets_key ON system_secrets(key);

-- ================================================================
-- TABLE: integrations
-- Purpose: Configuration for external services (Slack, Telegram, etc.)
-- ================================================================

CREATE TABLE IF NOT EXISTS integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'Telegram', 'Slack'
    slug TEXT NOT NULL UNIQUE, -- 'telegram', 'slack'
    is_active BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb, -- Store non-sensitive config (e.g. channel_id)
    secret_id UUID REFERENCES system_secrets(id), -- Link to the sensitive token
    last_synced_at TIMESTAMPTZ,
    status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- TABLE: webhooks
-- Purpose: Outbound webhook configurations
-- ================================================================

CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of events: ['lead.created', 'deal.won']
    is_active BOOLEAN DEFAULT true,
    secret_header TEXT, -- Optional, e.g. 'X-Shavi-Signature'
    retry_count INTEGER DEFAULT 3,
    version TEXT DEFAULT 'v1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- TABLE: webhook_logs
-- Purpose: Execution history for webhooks
-- ================================================================

CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB,
    response_status INTEGER,
    response_body TEXT,
    duration_ms INTEGER,
    status TEXT CHECK (status IN ('success', 'failure', 'pending')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook_id ON webhook_logs(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at ON webhook_logs(created_at DESC);

-- ================================================================
-- RLS POLICIES
-- Strict access: Only authenticated users (admins/devs)
-- ================================================================

ALTER TABLE system_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Allow Full Access to Authenticated Users (assuming Role check handles specific permissions in UI)
-- In a real prod scenario, you might restrict DELETE or valid reading of secrets even for authed users.

CREATE POLICY "Allow full access to authenticated" ON system_secrets
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated" ON integrations
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated" ON webhooks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow full access to authenticated" ON webhook_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- Reuse the update_updated_at_column function from previous migrations
CREATE TRIGGER update_system_secrets_updated_at
    BEFORE UPDATE ON system_secrets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
