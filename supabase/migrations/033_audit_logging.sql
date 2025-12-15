-- ================================================================
-- MIGRATION 033: Audit Logging System
-- Description: Comprehensive audit trail for all critical tables
-- Version: 3.0 (Final)
-- Created: 2025-12-12
-- ================================================================

-- ================================================================
-- TABLE: audit_logs
-- Purpose: Track all changes to critical data
-- ================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- What changed
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SOFT_DELETE')),
  
  -- Data snapshots
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[], -- Array of changed field names
  
  -- Who changed it
  user_id UUID REFERENCES profiles(id),
  user_email TEXT NOT NULL,
  user_role TEXT,
  user_department TEXT,
  
  -- When and where
  ip_address INET,
  user_agent TEXT,
  request_id UUID,
  
  -- Context
  reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_table_name ON audit_logs(table_name);

-- ================================================================
-- AUDIT TRIGGER FUNCTION
-- Purpose: Automatically log all changes
-- ================================================================

CREATE OR REPLACE FUNCTION enhanced_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields TEXT[];
  action_type TEXT;
  old_json JSONB;
  new_json JSONB;
BEGIN
  -- Convert records to JSONB for safe access
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    old_json := to_jsonb(OLD);
  END IF;
  
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    new_json := to_jsonb(NEW);
  END IF;

  -- Determine action type (safely check deleted_at via JSONB)
  IF TG_OP = 'UPDATE' AND 
     (new_json->>'deleted_at') IS NOT NULL AND 
     (old_json->>'deleted_at') IS NULL THEN
    action_type := 'SOFT_DELETE';
  ELSE
    action_type := TG_OP;
  END IF;

  -- Calculate changed fields for UPDATE
  IF TG_OP = 'UPDATE' THEN
    SELECT array_agg(key)
    INTO changed_fields
    FROM jsonb_each(new_json)
    WHERE new_json -> key IS DISTINCT FROM old_json -> key;
  END IF;

  -- Insert audit log
  INSERT INTO audit_logs (
    table_name,
    record_id,
    action,
    old_data,
    new_data,
    changed_fields,
    user_id,
    user_email,
    user_role,
    user_department
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE((new_json->>'id')::uuid, (old_json->>'id')::uuid),
    action_type,
    old_json,
    new_json,
    changed_fields,
    auth.uid(),
    COALESCE(auth.jwt() ->> 'email', 'system'),
    auth.jwt() ->> 'role',
    auth.jwt() ->> 'department'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- DROP EXISTING TRIGGERS TO MAKE MIGRATION IDEMPOTENT
-- ================================================================

DROP TRIGGER IF EXISTS audit_campaigns ON campaigns;
DROP TRIGGER IF EXISTS audit_email_campaigns ON email_campaigns;
DROP TRIGGER IF EXISTS audit_leave_requests ON leave_requests;
DROP TRIGGER IF EXISTS audit_payroll_records ON payroll_records;
DROP TRIGGER IF EXISTS audit_performance_reviews ON performance_reviews;
DROP TRIGGER IF EXISTS audit_budgets ON budgets;
DROP TRIGGER IF EXISTS audit_expenses ON expenses;
DROP TRIGGER IF EXISTS audit_deals ON deals;
DROP TRIGGER IF EXISTS audit_employees ON employees;
DROP TRIGGER IF EXISTS audit_invoices ON invoices;
DROP TRIGGER IF EXISTS audit_leads ON leads;

-- ================================================================
-- APPLY AUDIT TRIGGERS TO CRITICAL TABLES
-- ================================================================

-- New tables from migration 030
CREATE TRIGGER audit_campaigns
AFTER INSERT OR UPDATE OR DELETE ON campaigns
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_email_campaigns
AFTER INSERT OR UPDATE OR DELETE ON email_campaigns
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_leave_requests
AFTER INSERT OR UPDATE OR DELETE ON leave_requests
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_payroll_records
AFTER INSERT OR UPDATE OR DELETE ON payroll_records
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_performance_reviews
AFTER INSERT OR UPDATE OR DELETE ON performance_reviews
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_budgets
AFTER INSERT OR UPDATE OR DELETE ON budgets
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_expenses
AFTER INSERT OR UPDATE OR DELETE ON expenses
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

-- Existing critical tables
CREATE TRIGGER audit_deals
AFTER INSERT OR UPDATE OR DELETE ON deals
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_employees
AFTER INSERT OR UPDATE OR DELETE ON employees
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_invoices
AFTER INSERT OR UPDATE OR DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

CREATE TRIGGER audit_leads
AFTER INSERT OR UPDATE OR DELETE ON leads
FOR EACH ROW EXECUTE FUNCTION enhanced_audit_trigger();

-- ================================================================
-- SOFT DELETE REPORTING VIEW
-- Purpose: View all soft-deleted records across tables
-- ================================================================

CREATE OR REPLACE VIEW deleted_records_report AS
SELECT 
  'campaigns' as table_name,
  id,
  name as record_name,
  deleted_at,
  deleted_by,
  (SELECT email FROM profiles WHERE id = campaigns.deleted_by) as deleted_by_email,
  department
FROM campaigns WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'leave_requests',
  id,
  'Leave Request - ' || type as record_name,
  deleted_at,
  deleted_by,
  (SELECT email FROM profiles WHERE id = leave_requests.deleted_by),
  department
FROM leave_requests WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'payroll_records',
  id,
  'Payroll - ' || period as record_name,
  deleted_at,
  deleted_by,
  (SELECT email FROM profiles WHERE id = payroll_records.deleted_by),
  department
FROM payroll_records WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'performance_reviews',
  id,
  'Review - ' || period as record_name,
  deleted_at,
  deleted_by,
  (SELECT email FROM profiles WHERE id = performance_reviews.deleted_by),
  department
FROM performance_reviews WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'budgets',
  id,
  category || ' - ' || period as record_name,
  deleted_at,
  deleted_by,
  (SELECT email FROM profiles WHERE id = budgets.deleted_by),
  department
FROM budgets WHERE deleted_at IS NOT NULL
UNION ALL
SELECT 
  'expenses',
  id,
  description as record_name,
  deleted_at,
  deleted_by,
  (SELECT email FROM profiles WHERE id = expenses.deleted_by),
  department
FROM expenses WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- ================================================================
-- HELPER VIEWS FOR MONITORING
-- ================================================================

-- Recent audit activity
CREATE OR REPLACE VIEW recent_audit_activity AS
SELECT 
  table_name,
  action,
  user_email,
  user_role,
  COUNT(*) as count,
  MAX(created_at) as last_action
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY table_name, action, user_email, user_role
ORDER BY last_action DESC;

-- Audit summary by table
CREATE OR REPLACE VIEW audit_summary_by_table AS
SELECT 
  table_name,
  COUNT(*) as total_changes,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN action = 'INSERT' THEN 1 END) as inserts,
  COUNT(CASE WHEN action = 'UPDATE' THEN 1 END) as updates,
  COUNT(CASE WHEN action = 'DELETE' THEN 1 END) as deletes,
  COUNT(CASE WHEN action = 'SOFT_DELETE' THEN 1 END) as soft_deletes,
  MAX(created_at) as last_change
FROM audit_logs
GROUP BY table_name
ORDER BY total_changes DESC;

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  user_email,
  user_role,
  user_department,
  COUNT(*) as total_actions,
  COUNT(DISTINCT table_name) as tables_modified,
  MAX(created_at) as last_activity
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY user_email, user_role, user_department
ORDER BY total_actions DESC;

-- ================================================================
-- RLS POLICIES FOR AUDIT LOGS
-- ================================================================

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "admins_see_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "system_insert_audit_logs" ON audit_logs;

-- Only admins can see audit logs
CREATE POLICY "admins_see_audit_logs"
ON audit_logs FOR SELECT TO authenticated
USING (
  (auth.jwt() ->> 'role') IN ('admin', 'developer')
);

-- System can insert audit logs
CREATE POLICY "system_insert_audit_logs"
ON audit_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT 'Migration 033 - Audit Logging System created successfully!' as status;

-- Show audit triggers
SELECT 
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation as event
FROM information_schema.triggers
WHERE trigger_name LIKE 'audit_%'
ORDER BY event_object_table;
