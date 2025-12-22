-- ================================================================
-- MIGRATION 048: Customer Success Workflows
-- Description: Auto-routing, Escalation, and SLA tracking
-- Created: 2025-12-20
-- ================================================================

-- ================================================================
-- TABLE: ticket_routing_rules
-- Purpose: Configure automatic ticket assignment rules
-- ================================================================

CREATE TABLE IF NOT EXISTS ticket_routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    priority_filter TEXT[], -- ['high', 'urgent'] or NULL for all
    department_filter TEXT, -- 'customer_success' or NULL for all
    auto_assign_enabled BOOLEAN DEFAULT true,
    assignment_strategy TEXT DEFAULT 'round_robin' CHECK (assignment_strategy IN ('round_robin', 'load_balance')),
    assigned_agents UUID[], -- List of agent profile IDs in rotation
    last_assigned_index INT DEFAULT 0, -- For round-robin tracking
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: escalation_logs
-- Purpose: Track ticket escalation history
-- ================================================================

CREATE TABLE IF NOT EXISTS escalation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    escalated_from UUID REFERENCES profiles(id),
    escalated_to UUID REFERENCES profiles(id),
    escalation_reason TEXT NOT NULL, -- 'sla_breach', 'manual', 'priority_upgrade', 'customer_request'
    escalation_level INT DEFAULT 1, -- 1=Manager, 2=Admin
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- TABLE: sla_configurations
-- Purpose: Define SLA targets by priority level
-- ================================================================

CREATE TABLE IF NOT EXISTS sla_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority TEXT NOT NULL UNIQUE CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    first_response_minutes INT NOT NULL, -- Time to first agent response
    resolution_minutes INT NOT NULL, -- Time to resolve
    business_hours_only BOOLEAN DEFAULT false, -- For future enhancement
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ALTER: support_tickets
-- Purpose: Add workflow-related columns
-- ================================================================

ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS escalation_level INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS sla_due_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- ================================================================
-- INDEXES for Performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_tickets_sla_due 
ON support_tickets(sla_due_at) 
WHERE status NOT IN ('resolved', 'closed');

CREATE INDEX IF NOT EXISTS idx_tickets_escalation 
ON support_tickets(escalation_level);

CREATE INDEX IF NOT EXISTS idx_escalation_logs_ticket 
ON escalation_logs(ticket_id);

CREATE INDEX IF NOT EXISTS idx_routing_rules_enabled 
ON ticket_routing_rules(auto_assign_enabled) 
WHERE auto_assign_enabled = true;

-- ================================================================
-- SEED: Default SLA Configurations
-- ================================================================

INSERT INTO sla_configurations (priority, first_response_minutes, resolution_minutes) VALUES
('low', 240, 2880),      -- 4 hours response, 48 hours resolution
('medium', 120, 1440),   -- 2 hours response, 24 hours resolution
('high', 60, 480),       -- 1 hour response, 8 hours resolution
('urgent', 15, 120)      -- 15 min response, 2 hours resolution
ON CONFLICT (priority) DO NOTHING;

-- ================================================================
-- SEED: Default Routing Rule
-- ================================================================

INSERT INTO ticket_routing_rules (name, priority_filter, auto_assign_enabled, assignment_strategy) VALUES
('Default Auto-Assign', NULL, true, 'round_robin')
ON CONFLICT DO NOTHING;

-- ================================================================
-- RLS POLICIES
-- ================================================================

ALTER TABLE ticket_routing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE escalation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sla_configurations ENABLE ROW LEVEL SECURITY;

-- Admin/Manager can manage routing rules
CREATE POLICY "admin_manager_routing_rules" ON ticket_routing_rules
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'manager')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'manager')
    )
);

-- All authenticated users can view escalation logs
CREATE POLICY "view_escalation_logs" ON escalation_logs
FOR SELECT TO authenticated
USING (true);

-- Only authorized roles can create escalation logs
CREATE POLICY "create_escalation_logs" ON escalation_logs
FOR INSERT TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role IN ('admin', 'manager', 'customer_success')
    )
);

-- All authenticated users can view SLA configs
CREATE POLICY "view_sla_configs" ON sla_configurations
FOR SELECT TO authenticated
USING (true);

-- Only admins can modify SLA configs
CREATE POLICY "admin_modify_sla" ON sla_configurations
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
    )
);

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

SELECT 'Migration 048 - Customer Success Workflows Created Successfully' as status;
