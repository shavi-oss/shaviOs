-- ================================================================
-- SEED DATA: Sales Revenue Engine
-- Description: Testing data for Phase 3.2
-- WARNING: This is NOT a migration. Run manually for testing only.
-- Location: supabase/scripts/ (NOT in migrations/)
-- Created: 2025-12-21
-- ================================================================

-- ================================================================
-- SAFETY CHECK: Don't run in production
-- ================================================================

DO $$
BEGIN
    -- Add your production database name check here if needed
    -- IF current_database() = 'production_db_name' THEN
    --     RAISE EXCEPTION 'Cannot run seed data in production!';
    -- END IF;
    
    RAISE NOTICE 'This is SEED DATA for testing only';
END $$;

-- ================================================================
-- STEP 1: INSERT 20 DEALS (across all stages)
-- ================================================================

INSERT INTO deals (title, value, currency, stage, customer_name, customer_company, expected_close_date, created_at)
VALUES
-- Lead Stage (5 deals) - Early pipeline
('Enterprise Training Program 2025', 150000, 'EGP', 'lead', 'محمد أحمد', 'شركة التطوير', CURRENT_DATE + INTERVAL '60 days', NOW() - INTERVAL '3 days'),
('Digital Marketing Course', 45000, 'EGP', 'lead', 'فاطمة علي', 'وكالة الإبداع', CURRENT_DATE + INTERVAL '45 days', NOW() - INTERVAL '2 days'),
('Advanced Analytics Workshop', 75000, 'EGP', 'lead', 'عمر حسين', 'مركز البيانات', CURRENT_DATE + INTERVAL '50 days', NOW() - INTERVAL '1 day'),
('Cloud Migration Consulting', 95000, 'EGP', 'lead', 'سارة محمود', 'شركة السحابة', CURRENT_DATE + INTERVAL '70 days', NOW()),
('DevOps Bootcamp', 120000, 'EGP', 'lead', 'خالد عمر', 'معهد التقنية', CURRENT_DATE + INTERVAL '80 days', NOW()),

-- Contacted Stage (4 deals) - Initial conversations
('Sales Training Workshop', 60000, 'EGP', 'contacted', 'أحمد حسن', 'مجموعة النجاح', CURRENT_DATE + INTERVAL '30 days', NOW() - INTERVAL '5 days'),
('Product Management Course', 55000, 'EGP', 'contacted', 'ليلى سعيد', 'شركة المنتجات', CURRENT_DATE + INTERVAL '35 days', NOW() - INTERVAL '4 days'),
('Agile Methodology Training', 48000, 'EGP', 'contacted', 'نور أحمد', 'فريق السرعة', CURRENT_DATE + INTERVAL '25 days', NOW() - INTERVAL '6 days'),
('UI/UX Design Workshop', 42000, 'EGP', 'contacted', 'ياسمين حسين', 'استوديو التصميم', CURRENT_DATE + INTERVAL '28 days', NOW() - INTERVAL '3 days'),

-- Proposal Stage (4 deals) - Quotes being prepared
('Leadership Development Program', 85000, 'EGP', 'proposal', 'كريم سامي', 'بنك التنمية', CURRENT_DATE + INTERVAL '20 days', NOW() - INTERVAL '8 days'),
('Cybersecurity Awareness', 65000, 'EGP', 'proposal', 'مريم علي', 'شركة الأمن', CURRENT_DATE + INTERVAL '22 days', NOW() - INTERVAL '7 days'),
('Data Science Fundamentals', 78000, 'EGP', 'proposal', 'طارق محمود', 'مؤسسة البيانات', CURRENT_DATE + INTERVAL '18 days', NOW() - INTERVAL '9 days'),
('Strategic Planning Session', 52000, 'EGP', 'proposal', 'داليا أشرف', 'الشركة الوطنية', CURRENT_DATE + INTERVAL '15 days', NOW() - INTERVAL '10 days'),

-- Negotiation Stage (3 deals) - Almost closed
('Corporate Training Package', 120000, 'EGP', 'negotiation', 'عبدالله فاروق', 'شركة الاتصالات', CURRENT_DATE + INTERVAL '10 days', NOW() - INTERVAL '12 days'),
('Executive Coaching Program', 95000, 'EGP', 'negotiation', 'هناء إبراهيم', 'مجموعة القيادة', CURRENT_DATE + INTERVAL '12 days', NOW() - INTERVAL '11 days'),
('Change Management Workshop', 68000, 'EGP', 'negotiation', 'وليد صلاح', 'مركز التحول', CURRENT_DATE + INTERVAL '8 days', NOW() - INTERVAL '13 days'),

-- Won (2 deals) - Success stories  
('Tech Bootcamp Q1 2025', 95000, 'EGP', 'closed_won', 'ليلى سعيد', 'مركز الابتكار', CURRENT_DATE - INTERVAL '5 days', NOW() - INTERVAL '20 days'),
('Project Management Certification', 55000, 'EGP', 'closed_won', 'عمر فاروق', 'شركة الإنشاءات', CURRENT_DATE - INTERVAL '10 days', NOW() - INTERVAL '25 days'),

-- Lost (2 deals) - Learning experiences
('Data Science Course', 75000, 'EGP', 'closed_lost', 'نور أحمد', 'معهد التكنولوجيا', CURRENT_DATE - INTERVAL '8 days', NOW() - INTERVAL '18 days'),
('Business Analytics Training', 40000, 'EGP', 'closed_lost', 'ياسمين حسين', 'شركة التحليل', CURRENT_DATE - INTERVAL '12 days', NOW() - INTERVAL '22 days')

ON CONFLICT (id) DO NOTHING;

-- ================================================================
-- STEP 2: CREATE QUOTES FOR WON DEALS
-- ================================================================

DO $$
DECLARE
    deal1_id UUID;
    deal2_id UUID;
    quote1_id UUID;
    quote2_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get admin user for approved_by
    SELECT id INTO admin_user_id FROM profiles WHERE role = 'admin' LIMIT 1;
    
    -- Get won deal IDs
    SELECT id INTO deal1_id FROM deals WHERE title = 'Tech Bootcamp Q1 2025' LIMIT 1;
    SELECT id INTO deal2_id FROM deals WHERE title = 'Project Management Certification' LIMIT 1;
    
    -- Deal 1: Tech Bootcamp (PAID)
    IF deal1_id IS NOT NULL THEN
        INSERT INTO quotes (
            deal_id, customer_name, customer_email, customer_company,
            amount, currency, items, status, approved_at, approved_by
        ) VALUES (
            deal1_id, 
            'ليلى سعيد', 
            'laila@innovation.com',
            'مركز الابتكار',
            95000, 
            'EGP',
            '[{
                "description": "Tech Bootcamp - 12 weeks intensive program",
                "quantity": 1,
                "unit_price": 95000,
                "total": 95000
            }]'::jsonb,
            'approved',
            NOW() - INTERVAL '6 days',
            admin_user_id
        ) RETURNING id INTO quote1_id;
        
        -- Create PAID invoice from quote
        INSERT INTO invoices (
            customer_name, customer_email,
            amount, currency,
            status, due_date, paid_at,
            deal_id, quote_id, source_type,
            items
        ) VALUES (
            'ليلى سعيد',
            'laila@innovation.com',
            95000,
            'EGP',
            'paid',
            CURRENT_DATE - INTERVAL '3 days',
            NOW() - INTERVAL '1 day',
            deal1_id,
            quote1_id,
            'deal',
            '[{"description": "Tech Bootcamp - 12 weeks", "quantity": 1, "price": 95000}]'::jsonb
        );
    END IF;
    
    -- Deal 2: PM Certification (PENDING)
    IF deal2_id IS NOT NULL THEN
        INSERT INTO quotes (
            deal_id, customer_name, customer_email, customer_company,
            amount, currency, items, status, approved_at, approved_by
        ) VALUES (
            deal2_id,
            'عمر فاروق',
            'omar@construction.com',
            'شركة الإنشاءات',
            55000,
            'EGP',
            '[{
                "description": "PM Certification - 2 weeks intensive",
                "quantity": 1,
                "unit_price": 55000,
                "total": 55000
            }]'::jsonb,
            'approved',
            NOW() - INTERVAL '11 days',
            admin_user_id
        ) RETURNING id INTO quote2_id;
        
        -- Create PENDING invoice
        INSERT INTO invoices (
            customer_name, customer_email,
            amount, currency,
            status, due_date,
            deal_id, quote_id, source_type,
            items
        ) VALUES (
            'عمر فاروق',
            'omar@construction.com',
            55000,
            'EGP',
            'pending',
            CURRENT_DATE + INTERVAL '15 days',
            deal2_id,
            quote2_id,
            'deal',
            '[{"description": "PM Certification - 2 weeks", "quantity": 1, "price": 55000}]'::jsonb
        );
    END IF;
END $$;

-- ================================================================
-- STEP 3: CREATE ADDITIONAL QUOTES (various statuses)
-- ================================================================

DO $$
DECLARE
    proposal_deal_id UUID;
    negotiation_deal_id UUID;
BEGIN
    -- Get proposal stage deal
    SELECT id INTO proposal_deal_id FROM deals WHERE stage = 'proposal' LIMIT 1;
    
    IF proposal_deal_id IS NOT NULL THEN
        -- Sent quote (waiting for customer)
        INSERT INTO quotes (
            deal_id, customer_name, customer_email,
            amount, currency, items, status, valid_until
        ) VALUES (
            proposal_deal_id,
            'كريم سامي',
            'karim@bank.com',
            85000,
            'EGP',
            '[{
                "description": "Leadership Development - 5 days",
                "quantity": 1,
                "unit_price": 85000,
                "total": 85000
            }]'::jsonb,
            'sent',
            CURRENT_DATE + INTERVAL '30 days'
        );
    END IF;
    
    -- Get negotiation stage deal
    SELECT id INTO negotiation_deal_id FROM deals WHERE stage = 'negotiation' LIMIT 1;
    
    IF negotiation_deal_id IS NOT NULL THEN
        -- Draft quote (being prepared)
        INSERT INTO quotes (
            deal_id, customer_name, customer_email,
            amount, currency, items, status
        ) VALUES (
            negotiation_deal_id,
            'عبدالله فاروق',
            'abdullah@telecom.com',
            120000,
            'EGP',
            '[{
                "description": "Corporate Training Package",
                "quantity": 1,
                "unit_price": 120000,
                "total": 120000
            }]'::jsonb,
            'draft'
        );
    END IF;
END $$;

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT '=== SEED DATA APPLIED SUCCESSFULLY ===' as message;

SELECT 
    'Deals' as entity,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE stage = 'lead') as lead,
    COUNT(*) FILTER (WHERE stage = 'contacted') as contacted,
    COUNT(*) FILTER (WHERE stage = 'proposal') as proposal,
    COUNT(*) FILTER (WHERE stage = 'negotiation') as negotiation,
    COUNT(*) FILTER (WHERE stage = 'closed_won') as won,
    COUNT(*) FILTER (WHERE stage = 'closed_lost') as lost
FROM deals
WHERE created_at > NOW() - INTERVAL '1 minute';

SELECT 
    'Quotes' as entity,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE status = 'draft') as draft,
    COUNT(*) FILTER (WHERE status = 'sent') as sent,
    COUNT(*) FILTER (WHERE status = 'approved') as approved
FROM quotes
WHERE created_at > NOW() - INTERVAL '1 minute';

SELECT 
    'Invoices' as entity,
    COUNT(*) as total,
    COUNT(*) FILTER (WHERE source_type = 'deal') as from_deals,
    COUNT(*) FILTER (WHERE status = 'paid') as paid,
    COUNT(*) FILTER (WHERE status = 'pending') as pending
FROM invoices
WHERE created_at > NOW() - INTERVAL '1 minute';

-- Pipeline Value Summary
SELECT 
    SUM(value) FILTER (WHERE stage IN ('lead', 'contacted', 'proposal', 'negotiation')) as pipeline_value,
    SUM(value) FILTER (WHERE stage = 'closed_won') as won_value,
    SUM(value) FILTER (WHERE stage = 'closed_lost') as lost_value
FROM deals
WHERE created_at > NOW() - INTERVAL '1 minute';
