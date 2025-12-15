-- ================================================================
-- MIGRATION 029: Customer Support Module
-- Purpose: Schema for Tickets, Messages, KB, and Automations.
-- Created: 2025-12-10
-- ================================================================

-- 1. Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending', 'resolved', 'closed')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    
    -- In a real app, these would reference existing tables. 
    -- For now, we mock or use loose references if tables aren't guaranteed.
    -- Assuming 'customers' table from CRM module logic exists or we use raw data.
    customer_id UUID, -- Can link to auth.users or a separate CRM customer table
    customer_email TEXT, -- Backup if ID not found
    customer_name TEXT,

    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    tags TEXT[],
    channel TEXT DEFAULT 'email' CHECK (channel IN ('email', 'whatsapp', 'telegram', 'portal', 'phone'))
);

-- 2. Ticket Messages (Conversation)
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID, -- NULL for system messages
    sender_type TEXT CHECK (sender_type IN ('agent', 'customer', 'system')),
    message_body TEXT,
    is_internal BOOLEAN DEFAULT FALSE,
    attachments JSONB, -- Array of objects { name, url, type }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Knowledge Base
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    category TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT FALSE,
    views INT DEFAULT 0,
    author_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Automation Rules
CREATE TABLE IF NOT EXISTS support_automations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL, -- 'ticket_created', 'ticket_updated'
    conditions JSONB, -- { "priority": "high", "subject_contains": "urgent" }
    actions JSONB, -- { "assign_to": "userid", "add_tags": ["vip"] }
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_automations ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to access for now (Staff internal tool)
CREATE POLICY "Enable all for authenticated" ON support_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON ticket_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON knowledge_base FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated" ON support_automations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);-- Indexes
-- COMMENTED OUT: assigned_to column may not exist in older schema
-- CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(category);
