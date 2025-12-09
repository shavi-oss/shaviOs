-- ================================================================
-- SAMPLE DATA: Sales Deals
-- Description: Insert sample deals for testing pipeline
-- Run this AFTER running 012_sales_deals.sql
-- ================================================================

INSERT INTO deals (title, value, stage, customer_name, customer_company, expected_close_date) VALUES
    ('مشروع تدريب الموظفين - شركة النيل', 50000.00, 'negotiation', 'أحمد محمود', 'شركة النيل للتقنية', NOW() + INTERVAL '10 days'),
    ('دورة البرمجة المكثفة - مجموعة خاصة', 15000.00, 'proposal', 'سارة علي', 'مدرسة المستقبل', NOW() + INTERVAL '5 days'),
    ('استشارات تطوير المناهج', 25000.00, 'contacted', 'خالد إبراهيم', 'أكاديمية المعرفة', NOW() + INTERVAL '20 days'),
    ('رخصة استخدام المنصة - سنوي', 120000.00, 'lead', 'محمد حسن', 'جامعة القاهرة الجديدة', NOW() + INTERVAL '30 days'),
    ('ورشة عمل الذكاء الاصطناعي', 8000.00, 'closed_won', 'ياسمين عادل', 'مؤسسة الابتكار', NOW() - INTERVAL '2 days'),
    ('تدريب فريق المبيعات', 12000.00, 'closed_lost', 'عمر فاروق', 'شركة التوزيع الكبرى', NOW() - INTERVAL '5 days'),
    ('برنامج التسويق الرقمي', 20000.00, 'proposal', 'ليلى سعيد', NULL, NOW() + INTERVAL '15 days'),
    ('كورس تصميم الجرافيك - للأطفال', 5000.00, 'contacted', 'نور أحمد', 'نادي المبدعين', NOW() + INTERVAL '8 days');
