-- ================================================================
-- MIGRATION 031: Notifications & Error Logging System
-- Description: Creates notifications and error logging infrastructure
-- Version: 3.0 (Final)
-- Created: 2025-12-12
-- ================================================================

-- ================================================================
-- TABLE: notifications
-- Purpose: System-wide notification management
-- ================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Notification details
  type TEXT NOT NULL CHECK (type IN (
    'leave_request', 'leave_approved', 'leave_rejected',
    'expense_submitted', 'expense_approved', 'expense_rejected',
    'campaign_assigned', 'campaign_updated',
    'payroll_ready', 'review_scheduled', 'review_completed',
    'budget_warning', 'budget_critical',
    'system_alert', 'general'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Related record
  related_table TEXT,
  related_id UUID,
  
  -- Action URL
  action_url TEXT,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority) WHERE NOT read;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- ================================================================
-- TABLE: error_logs
-- Purpose: Application error logging
-- ================================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Error details
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  stack TEXT,
  component_stack TEXT,
  
  -- Context
  user_id UUID REFERENCES profiles(id),
  url TEXT,
  user_agent TEXT,
  ip_address INET,
  
  -- Request details
  request_id UUID,
  method TEXT,
  endpoint TEXT,
  
  -- Metadata
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for error_logs
CREATE INDEX IF NOT EXISTS idx_error_logs_created ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity) WHERE NOT resolved;
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(type);

-- ================================================================
-- NOTIFICATION TRIGGER FUNCTION
-- Purpose: Automatically send notifications for key events
-- ================================================================

CREATE OR REPLACE FUNCTION send_notification()
RETURNS TRIGGER AS $$
DECLARE
  notification_title TEXT;
  notification_message TEXT;
  recipient_id UUID;
  notification_priority TEXT := 'normal';
BEGIN
  -- ============================================================
  -- LEAVE REQUESTS
  -- ============================================================
  
  -- Leave Request Submitted
  IF TG_TABLE_NAME = 'leave_requests' AND TG_OP = 'INSERT' THEN
    -- Get manager/team lead
    SELECT team_lead_id INTO recipient_id
    FROM employees WHERE id = NEW.employee_id;
    
    IF recipient_id IS NOT NULL THEN
      notification_title := 'طلب إجازة جديد';
      notification_message := 'تم تقديم طلب إجازة جديد من ' || 
        (SELECT first_name || ' ' || last_name FROM employees WHERE id = NEW.employee_id) ||
        ' من ' || to_char(NEW.start_date, 'YYYY-MM-DD') || ' إلى ' || to_char(NEW.end_date, 'YYYY-MM-DD');
      
      INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
      VALUES (recipient_id, 'leave_request', notification_title, notification_message, 
              'leave_requests', NEW.id, '/hr/leave', 'high');
    END IF;
  END IF;
  
  -- Leave Approved/Rejected
  IF TG_TABLE_NAME = 'leave_requests' AND TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
    IF NEW.status = 'approved' THEN
      notification_title := '✅ تم الموافقة على طلب الإجازة';
      notification_message := 'تمت الموافقة على طلب إجازتك من ' || to_char(NEW.start_date, 'YYYY-MM-DD') || ' إلى ' || to_char(NEW.end_date, 'YYYY-MM-DD');
      notification_priority := 'high';
    ELSIF NEW.status = 'rejected' THEN
      notification_title := '❌ تم رفض طلب الإجازة';
      notification_message := 'تم رفض طلب إجازتك. السبب: ' || COALESCE(NEW.rejection_reason, 'غير محدد');
      notification_priority := 'high';
    END IF;
    
    -- Get employee's user_id
    SELECT id INTO recipient_id FROM profiles 
    WHERE id = (SELECT id FROM employees WHERE id = NEW.employee_id LIMIT 1);
    
    IF recipient_id IS NOT NULL THEN
      INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
      VALUES (recipient_id, 'leave_' || NEW.status, notification_title, notification_message,
              'leave_requests', NEW.id, '/hr/leave', notification_priority);
    END IF;
  END IF;
  
  -- ============================================================
  -- EXPENSES
  -- ============================================================
  
  -- Expense Submitted
  IF TG_TABLE_NAME = 'expenses' AND TG_OP = 'INSERT' THEN
    -- Notify Finance Manager
    SELECT id INTO recipient_id FROM profiles 
    WHERE role = 'finance_manager' OR role = 'admin'
    LIMIT 1;
    
    IF recipient_id IS NOT NULL THEN
      notification_title := '💰 مصروف جديد للمراجعة';
      notification_message := 'تم تقديم مصروف بقيمة ' || NEW.amount || ' ' || NEW.currency || ' - ' || NEW.category;
      
      INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
      VALUES (recipient_id, 'expense_submitted', notification_title, notification_message,
              'expenses', NEW.id, '/finance/expenses', 'normal');
    END IF;
  END IF;
  
  -- Expense Approved/Rejected
  IF TG_TABLE_NAME = 'expenses' AND TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status != 'pending' THEN
    IF NEW.status = 'approved' THEN
      notification_title := '✅ تمت الموافقة على المصروف';
      notification_message := 'تمت الموافقة على مصروفك بقيمة ' || NEW.amount || ' ' || NEW.currency;
      notification_priority := 'normal';
    ELSIF NEW.status = 'rejected' THEN
      notification_title := '❌ تم رفض المصروف';
      notification_message := 'تم رفض مصروفك. السبب: ' || COALESCE(NEW.rejection_reason, 'غير محدد');
      notification_priority := 'normal';
    END IF;
    
    INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
    VALUES (NEW.submitted_by, 'expense_' || NEW.status, notification_title, notification_message,
            'expenses', NEW.id, '/finance/expenses', notification_priority);
  END IF;
  
  -- ============================================================
  -- CAMPAIGNS
  -- ============================================================
  
  -- Campaign Assigned
  IF TG_TABLE_NAME = 'campaigns' AND TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL THEN
    notification_title := '📢 تم تعيينك لحملة جديدة';
    notification_message := 'تم تعيينك للحملة: ' || NEW.name;
    
    INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
    VALUES (NEW.assigned_to, 'campaign_assigned', notification_title, notification_message,
            'campaigns', NEW.id, '/marketing/campaigns', 'normal');
  END IF;
  
  -- ============================================================
  -- PAYROLL
  -- ============================================================
  
  -- Payroll Approved
  IF TG_TABLE_NAME = 'payroll_records' AND TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'approved' THEN
    -- Get employee's user_id
    SELECT id INTO recipient_id FROM profiles 
    WHERE id = (SELECT id FROM employees WHERE id = NEW.employee_id LIMIT 1);
    
    IF recipient_id IS NOT NULL THEN
      notification_title := '💵 كشف الراتب جاهز';
      notification_message := 'كشف راتبك للفترة ' || NEW.period || ' جاهز للمراجعة. الصافي: ' || NEW.net_salary || ' جنيه';
      
      INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
      VALUES (recipient_id, 'payroll_ready', notification_title, notification_message,
              'payroll_records', NEW.id, '/hr/payroll', 'high');
    END IF;
  END IF;
  
  -- ============================================================
  -- BUDGETS
  -- ============================================================
  
  -- Budget Warning/Critical
  IF TG_TABLE_NAME = 'budgets' AND TG_OP = 'UPDATE' THEN
    IF NEW.status = 'warning' AND OLD.status != 'warning' THEN
      -- Notify budget owner
      IF NEW.owner_id IS NOT NULL THEN
        notification_title := '⚠️ تحذير ميزانية';
        notification_message := 'تم استخدام 75% من ميزانية ' || NEW.category || ' للفترة ' || NEW.period;
        
        INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
        VALUES (NEW.owner_id, 'budget_warning', notification_title, notification_message,
                'budgets', NEW.id, '/finance/budget', 'high');
      END IF;
    ELSIF NEW.status = 'critical' AND OLD.status != 'critical' THEN
      -- Notify budget owner
      IF NEW.owner_id IS NOT NULL THEN
        notification_title := '🚨 تحذير حرج - ميزانية';
        notification_message := 'تم استخدام 90% من ميزانية ' || NEW.category || ' للفترة ' || NEW.period;
        
        INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
        VALUES (NEW.owner_id, 'budget_critical', notification_title, notification_message,
                'budgets', NEW.id, '/finance/budget', 'urgent');
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- APPLY NOTIFICATION TRIGGERS
-- ================================================================

CREATE TRIGGER notify_leave_request
AFTER INSERT OR UPDATE ON leave_requests
FOR EACH ROW EXECUTE FUNCTION send_notification();

CREATE TRIGGER notify_expense
AFTER INSERT OR UPDATE ON expenses
FOR EACH ROW EXECUTE FUNCTION send_notification();

CREATE TRIGGER notify_campaign
AFTER UPDATE ON campaigns
FOR EACH ROW EXECUTE FUNCTION send_notification();

CREATE TRIGGER notify_payroll
AFTER UPDATE ON payroll_records
FOR EACH ROW EXECUTE FUNCTION send_notification();

CREATE TRIGGER notify_budget
AFTER UPDATE ON budgets
FOR EACH ROW EXECUTE FUNCTION send_notification();

-- ================================================================
-- RLS POLICIES FOR NEW TABLES
-- ================================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_see_own_notifications" ON notifications;
DROP POLICY IF EXISTS "users_update_own_notifications" ON notifications;
DROP POLICY IF EXISTS "admins_see_error_logs" ON error_logs;
DROP POLICY IF EXISTS "system_insert_error_logs" ON error_logs;

-- Users can only see their own notifications
CREATE POLICY "users_see_own_notifications"
ON notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can mark their own notifications as read
CREATE POLICY "users_update_own_notifications"
ON notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Only admins can see error logs
CREATE POLICY "admins_see_error_logs"
ON error_logs FOR SELECT TO authenticated
USING (auth.jwt() ->> 'role' IN ('admin', 'developer'));

-- System can insert error logs
CREATE POLICY "system_insert_error_logs"
ON error_logs FOR INSERT TO authenticated
WITH CHECK (true);

-- ================================================================
-- HELPER VIEWS
-- ================================================================

-- Unread notifications count per user
CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT 
  user_id,
  COUNT(*) as unread_count
FROM notifications
WHERE NOT read
GROUP BY user_id;

-- Recent errors summary
CREATE OR REPLACE VIEW recent_errors_summary AS
SELECT 
  type,
  severity,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM error_logs
WHERE NOT resolved
AND created_at > NOW() - INTERVAL '7 days'
GROUP BY type, severity
ORDER BY severity DESC, count DESC;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

SELECT 'Notifications and Error Logging System Created Successfully' as status;
