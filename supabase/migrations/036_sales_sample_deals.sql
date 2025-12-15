-- ================================================================
-- MIGRATION 036: Add Sample Sales Deals Data
-- Description: Insert sample deals for testing Sales module
-- Created: 2025-12-13
-- ================================================================

-- ================================================================
-- HOTFIX: Patch enhanced_audit_trigger for Tables w/o deleted_at
-- This ensures the insert below doesn't crash on trigger execution
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
-- DATA INSERTION
-- ================================================================

-- First, clear any existing sample data (optional - comment out if you want to keep existing)
-- DELETE FROM deals WHERE customer_name IN ('أحمد محمود', 'سارة علي', 'خالد إبراهيم');

-- Insert sample deals with various stages
INSERT INTO deals (title, value, stage, customer_name, customer_company, expected_close_date, created_at) 
VALUES
    -- Lead Stage
    ('رخصة استخدام المنصة - سنوي', 120000.00, 'lead', 'محمد حسن', 'جامعة القاهرة الجديدة', CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '2 days'),
    ('برنامج التدريب الصيفي', 45000.00, 'lead', 'فاطمة أحمد', 'مركز الإبداع', CURRENT_DATE + INTERVAL '45 days', NOW() - INTERVAL '1 day'),
    
    -- Contacted Stage
    ('استشارات تطوير المناهج', 25000.00, 'contacted', 'خالد إبراهيم', 'أكاديمية المعرفة', CURRENT_DATE + INTERVAL '20 days', NOW() - INTERVAL '3 days'),
    ('كورس تصميم الجرافيك - للأطفال', 5000.00, 'contacted', 'نور أحمد', 'نادي المبدعين', CURRENT_DATE + INTERVAL '8 days', NOW() - INTERVAL '1 day'),
    ('دورة البرمجة للمبتدئين', 8500.00, 'contacted', 'أميرة سعيد', 'مدرسة النور', CURRENT_DATE + INTERVAL '12 days', NOW() - INTERVAL '2 days'),
    
    -- Proposal Stage  
    ('دورة البرمجة المكثفة - مجموعة خاصة', 15000.00, 'proposal', 'سارة علي', 'مدرسة المستقبل', CURRENT_DATE + INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('برنامج التسويق الرقمي', 20000.00, 'proposal', 'ليلى سعيد', 'شركة التسويق الحديث', CURRENT_DATE + INTERVAL '15 days', NOW() - INTERVAL '4 days'),
    ('ورش عمل القيادة والإدارة', 18000.00, 'proposal', 'طارق محمود', 'بنك التنمية', CURRENT_DATE + INTERVAL '10 days', NOW() - INTERVAL '6 days'),
    
    -- Negotiation Stage
    ('مشروع تدريب الموظفين - شركة النيل', 50000.00, 'negotiation', 'أحمد محمود', 'شركة النيل للتقنية', CURRENT_DATE + INTERVAL '10 days', NOW() - INTERVAL '8 days'),
    ('استشارات تحول رقمي', 75000.00, 'negotiation', 'هناء فاروق', 'مجموعة الأعمال', CURRENT_DATE + INTERVAL '7 days', NOW() - INTERVAL '10 days'),
    ('تدريب فريق IT الداخلي', 35000.00, 'negotiation', 'يوسف عبدالله', 'شركة الاتصالات الكبرى', CURRENT_DATE + INTERVAL '5 days', NOW() - INTERVAL '12 days'),
    
    -- Closed Won (Success)
    ('ورشة عمل الذكاء الاصطناعي', 8000.00, 'closed_won', 'ياسمين عادل', 'مؤسسة الابتكار', CURRENT_DATE - INTERVAL '2 days', NOW() - INTERVAL '15 days'),
    ('برنامج تدريب المدربين TOT', 22000.00, 'closed_won', 'كريم سامي', 'أكاديمية التميز', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '20 days'),
    ('دورة أمن المعلومات', 12500.00, 'closed_won', 'مريم حسين', 'شركة البيانات الآمنة', CURRENT_DATE - INTERVAL '10 days', NOW() - INTERVAL '25 days'),
    ('استشارات استراتيجية', 40000.00, 'closed_won', 'عمر خالد', 'مؤسسة النماء', CURRENT_DATE - INTERVAL '15 days', NOW() - INTERVAL '30 days'),
    
    -- Closed Lost (Failed)
    ('تدريب فريق المبيعات', 12000.00, 'closed_lost', 'عمر فاروق', 'شركة التوزيع الكبرى', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '18 days'),
    ('برنامج التطوير التنظيمي', 28000.00, 'closed_lost', 'داليا أشرف', 'الشركة الوطنية', CURRENT_DATE - INTERVAL '8 days', NOW() - INTERVAL '22 days')
ON CONFLICT (id) DO NOTHING;

-- Optional: Add a comment to track this migration
COMMENT ON TABLE deals IS 'Sales deals pipeline - Sample data added on 2025-12-13';
