-- ================================================================
-- SAMPLE DATA: Core Application Tables
-- Description: Insert sample data for testing all pages
-- Run this AFTER running 006_core_tables.sql
-- ================================================================

-- ================================================================
-- SAMPLE LEADS (Marketing Module)
-- ================================================================

INSERT INTO leads (first_name, last_name, email, phone, company, status, source, total_score, temperature, notes) VALUES
    ('أحمد', 'محمد', 'ahmed.mohamed@example.com', '+20123456789', 'شركة التقنية المتقدمة', 'new', 'nazmly', 85, 'hot', 'عميل محتمل ذو قيمة عالية، مهتم بالدورة التدريبية للبرمجة'),
    ('فاطمة', 'حسن', 'fatima.hassan@example.com', '+20987654321', 'مؤسسة النجاح', 'contacted', 'facebook', 65, 'warm', 'تم التواصل عبر الهاتف، طلبت معلومات إضافية'),
    ('محمود', 'علي', 'mahmoud.ali@example.com', '+20111222333', 'شركة الإبداع', 'qualified', 'google', 75, 'warm', 'مؤهل للدورة، سيقوم بالتسجيل قريباً'),
    ('سارة', 'عبدالله', 'sara.abdullah@example.com', '+20444555666', NULL, 'new', 'website', 45, 'cold', 'استفسرت عن الأسعار فقط'),
    ('خالد', 'إبراهيم', 'khaled.ibrahim@example.com', '+20777888999', 'مكتب الاستشارات', 'converted', 'nazmly', 90, 'hot', 'تم التحويل إلى طالب مسجل'),
    ('نور', 'أحمد', 'noor.ahmed@example.com', '+20222333444', NULL, 'contacted', 'facebook', 55, 'warm', 'مهتمة بدورة التصميم'),
    ('عمر', 'يوسف', 'omar.youssef@example.com', '+20555666777', 'شركة الحلول الذكية', 'qualified', 'google', 80, 'hot', 'جاهز للتسجيل، ينتظر موافقة الشركة'),
    ('ليلى', 'سعيد', 'laila.said@example.com', '+20888999000', NULL, 'lost', 'website', 30, 'cold', 'لم يتم الرد على المكالمات');

-- ================================================================
-- SAMPLE LEAD ACTIVITIES (Marketing Timeline)
-- ================================================================

-- Get some lead IDs for activities
DO $$
DECLARE
    lead1_id UUID;
    lead2_id UUID;
    lead3_id UUID;
BEGIN
    -- Get first 3 leads
    SELECT id INTO lead1_id FROM leads WHERE email = 'ahmed.mohamed@example.com';
    SELECT id INTO lead2_id FROM leads WHERE email = 'fatima.hassan@example.com';
    SELECT id INTO lead3_id FROM leads WHERE email = 'mahmoud.ali@example.com';
    
    -- Insert activities for lead 1
    INSERT INTO lead_activities (lead_id, type, description, created_by) VALUES
        (lead1_id, 'call', 'مكالمة هاتفية أولية - أبدى اهتماماً كبيراً', 'sales_team'),
        (lead1_id, 'email', 'تم إرسال تفاصيل الدورة التدريبية', 'sales_team'),
        (lead1_id, 'meeting', 'اجتماع عبر الإنترنت لمناقشة التفاصيل', 'sales_team');
    
    -- Insert activities for lead 2
    INSERT INTO lead_activities (lead_id, type, description, created_by) VALUES
        (lead2_id, 'call', 'مكالمة متابعة - طلبت معلومات عن الأسعار', 'sales_team'),
        (lead2_id, 'note', 'مهتمة لكن تحتاج للتفكير', 'sales_team');
    
    -- Insert activities for lead 3
    INSERT INTO lead_activities (lead_id, type, description, created_by) VALUES
        (lead3_id, 'email', 'تم إرسال العرض الخاص', 'sales_team'),
        (lead3_id, 'call', 'مكالمة تأكيد - جاهز للتسجيل', 'sales_team');
END $$;

-- ================================================================
-- SAMPLE STUDENTS (Customer Success Module)
-- ================================================================

INSERT INTO students (full_name, email, phone, status, progress, enrollment_date) VALUES
    ('أحمد محمد سالم', 'ahmed.salem@student.com', '+20123456700', 'active', 75, NOW() - INTERVAL '30 days'),
    ('فاطمة علي حسن', 'fatima.ali@student.com', '+20987654300', 'active', 45, NOW() - INTERVAL '60 days'),
    ('محمود عبدالله', 'mahmoud.abdullah@student.com', '+20111222300', 'at_risk', 25, NOW() - INTERVAL '45 days'),
    ('سارة إبراهيم', 'sara.ibrahim@student.com', '+20444555600', 'active', 90, NOW() - INTERVAL '90 days'),
    ('خالد يوسف', 'khaled.youssef@student.com', '+20777888900', 'completed', 100, NOW() - INTERVAL '120 days'),
    ('نور محمد', 'noor.mohamed@student.com', '+20222333400', 'active', 60, NOW() - INTERVAL '20 days'),
    ('عمر حسن', 'omar.hassan@student.com', '+20555666700', 'paused', 35, NOW() - INTERVAL '50 days'),
    ('ليلى سعيد', 'laila.saeed@student.com', '+20888999001', 'at_risk', 15, NOW() - INTERVAL '40 days'),
    ('مريم أحمد', 'mariam.ahmed@student.com', '+20333444500', 'active', 80, NOW() - INTERVAL '25 days'),
    ('يوسف محمود', 'youssef.mahmoud@student.com', '+20666777800', 'completed', 100, NOW() - INTERVAL '150 days');

-- ================================================================
-- SAMPLE SUPPORT TICKETS (Customer Success Module)
-- ================================================================

INSERT INTO support_tickets (
    title, 
    description, 
    priority, 
    status, 
    student_name, 
    student_email,
    assigned_to_name,
    created_at
) VALUES
    ('مشكلة في تسجيل الدخول', 'لا أستطيع الدخول إلى حسابي في المنصة', 'urgent', 'open', 'أحمد محمد سالم', 'ahmed.salem@student.com', 'فريق الدعم', NOW() - INTERVAL '2 hours'),
    ('استفسار عن محتوى الدورة', 'هل يمكن الحصول على مواد إضافية؟', 'medium', 'in_progress', 'فاطمة علي حسن', 'fatima.ali@student.com', 'أحمد الدعم', NOW() - INTERVAL '1 day'),
    ('طلب شهادة', 'أحتاج شهادة إتمام الدورة', 'low', 'pending', 'خالد يوسف', 'khaled.youssef@student.com', NULL, NOW() - INTERVAL '3 days'),
    ('مشكلة في الفيديو', 'الفيديو لا يعمل في الدرس الخامس', 'high', 'open', 'محمود عبدالله', 'mahmoud.abdullah@student.com', 'محمد الدعم', NOW() - INTERVAL '5 hours'),
    ('استفسار عن الدفع', 'كيف يمكنني تقسيط المبلغ؟', 'medium', 'resolved', 'نور محمد', 'noor.mohamed@student.com', 'سارة الدعم', NOW() - INTERVAL '2 days'),
    ('طلب إعادة جدولة', 'أريد تأجيل الدورة لشهر آخر', 'medium', 'in_progress', 'عمر حسن', 'omar.hassan@student.com', 'فريق الدعم', NOW() - INTERVAL '1 day'),
    ('خطأ في الاختبار', 'الاختبار لا يحفظ إجاباتي', 'high', 'open', 'ليلى سعيد', 'laila.saeed@student.com', NULL, NOW() - INTERVAL '3 hours'),
    ('شكر وتقدير', 'شكراً على الدعم الرائع', 'low', 'closed', 'سارة إبراهيم', 'sara.ibrahim@student.com', 'فريق الدعم', NOW() - INTERVAL '5 days');

-- ================================================================
-- VERIFICATION QUERIES
-- Run these to verify data was inserted correctly
-- ================================================================

-- Count records
-- SELECT 
--     'leads' as table_name, COUNT(*) as count FROM leads
-- UNION ALL
-- SELECT 'lead_activities', COUNT(*) FROM lead_activities
-- UNION ALL
-- SELECT 'students', COUNT(*) FROM students
-- UNION ALL
-- SELECT 'support_tickets', COUNT(*) FROM support_tickets;

-- ================================================================
-- SAMPLE DATA INSERTION COMPLETE
-- ================================================================
