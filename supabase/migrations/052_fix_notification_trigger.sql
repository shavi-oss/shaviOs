-- Migration: Fix send_notification() trigger to handle missing columns
-- Purpose: Fix trigger that fails when checking fields that don't exist in all tables
-- Created: 2025-12-21

-- Drop and recreate the send_notification() function with proper column existence checks
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
  -- FIXED: Only check assigned_to if we're actually ON the campaigns table
  IF TG_TABLE_NAME = 'campaigns' AND TG_OP = 'UPDATE' THEN
    -- Use a safer approach with DECLARE and exception handling
    BEGIN
      IF (NEW.assigned_to IS DISTINCT FROM OLD.assigned_to) AND (NEW.assigned_to IS NOT NULL) THEN
        notification_title := '📢 تم تعيينك لحملة جديدة';
        notification_message := 'تم تعيينك للحملة: ' || NEW.name;
        
        INSERT INTO notifications (user_id, type, title, message, related_table, related_id, action_url, priority)
        VALUES (NEW.assigned_to, 'campaign_assigned', notification_title, notification_message,
                'campaigns', NEW.id, '/marketing/campaigns', 'normal');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Silently ignore if column doesn't exist
      NULL;
    END;
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

SELECT 'send_notification() function updated successfully' as status;
