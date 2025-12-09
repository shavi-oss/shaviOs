-- ================================================================
-- SAMPLE DATA: Finance Invoices
-- Description: Insert sample invoices for testing
-- Run this AFTER running 008_finance_invoices.sql
-- ================================================================

INSERT INTO invoices (customer_name, customer_email, amount, status, due_date, items, paid_at) VALUES
    ('شركة التقنية المتقدمة', 'billing@tech-adv.com', 15000.00, 'paid', NOW() - INTERVAL '5 days', 
    '[{"description": "دورة تطوير ويب متقدمة - 5 موظفين", "quantity": 1, "price": 15000}]'::jsonb, 
    NOW() - INTERVAL '6 days'),

    ('مؤسسة التعليم الحديث', 'finance@edu-modern.com', 25000.50, 'pending', NOW() + INTERVAL '10 days',
    '[{"description": "استشارات تطوير مناهج", "quantity": 10, "price": 2500}]'::jsonb,
    NULL),

    ('محمد أحمد', 'mohamed.ahmed@gmail.com', 2500.00, 'overdue', NOW() - INTERVAL '15 days',
    '[{"description": "دورة تصميم جرافيك", "quantity": 1, "price": 2500}]'::jsonb,
    NULL),

    ('سارة علي', 'sara.ali@hotmail.com', 3000.00, 'draft', NOW() + INTERVAL '30 days',
    '[{"description": "دورة تسويق رقمي", "quantity": 1, "price": 3000}]'::jsonb,
    NULL),

    ('شركة المستقبل', 'accounts@future-corp.com', 50000.00, 'paid', NOW() - INTERVAL '20 days',
    '[{"description": "برنامج تدريب القادة", "quantity": 1, "price": 50000}]'::jsonb,
    NOW() - INTERVAL '22 days'),
    
    ('خالد يوسف', 'khaled.y@outlook.com', 1200.00, 'cancelled', NOW() - INTERVAL '2 days',
    '[{"description": "ورشة عمل - يوم واحد", "quantity": 1, "price": 1200}]'::jsonb,
    NULL);
