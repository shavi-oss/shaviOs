-- ================================================================
-- MIGRATION 034: Seed Data (Sample Data)
-- Description: Populates critical tables with realistic test data
-- Warning: This script deletes existing data in the target tables!
-- Version: 3.0
-- Created: 2025-12-13
-- ================================================================

-- ⚠️ MIGRATION DISABLED FOR PRODUCTION SAFETY ⚠️
-- This migration contains TRUNCATE statements that would DELETE ALL DATA
-- Use this only in development environments by uncommenting below
-- For production, seed data manually or via separate scripts

/*
-- 1. Cleanup existing mock data
TRUNCATE TABLE 
  notifications,
  error_logs,
  email_campaigns,
  campaigns,
  leave_requests,
  expenses,
  budgets,
  performance_reviews,
  payroll_records,
  employees
CASCADE;

-- 2. Variables for ID references
DO $$
DECLARE
  v_admin_id UUID := gen_random_uuid();
  v_hr_manager_id UUID := gen_random_uuid();
  v_finance_manager_id UUID := gen_random_uuid();
  v_marketing_manager_id UUID := gen_random_uuid();
  v_employee1_id UUID := gen_random_uuid();
  v_employee2_id UUID := gen_random_uuid();
  
  v_emp1_record_id UUID := gen_random_uuid();
  v_emp2_record_id UUID := gen_random_uuid();
  
  v_budget_marketing_id UUID;
  v_budget_hr_id UUID;
  v_campaign_id UUID;
BEGIN

  -- ============================================================
  -- 3. Mock Profiles (usually synced from auth.users)
  -- ============================================================
  
  INSERT INTO profiles (id, full_name, role, department, email) VALUES
  (v_admin_id, 'System Admin', 'admin', 'Management', 'admin@shavierp.com'),
  (v_hr_manager_id, 'Mona Ahmed', 'hr_manager', 'HR', 'mona.hr@shavierp.com'),
  (v_finance_manager_id, 'Kareem Mahmoud', 'finance_manager', 'Finance', 'kareem.finance@shavierp.com'),
  (v_marketing_manager_id, 'Sarah Ali', 'marketing_manager', 'Marketing', 'sarah.mkt@shavierp.com'),
  (v_employee1_id, 'Ahmed Hassan', 'employee', 'Tech', 'ahmed.dev@shavierp.com'),
  (v_employee2_id, 'Laila Samir', 'employee', 'Sales', 'laila.sales@shavierp.com')
  ON CONFLICT (id) DO NOTHING; -- Handle if IDs somehow exist (unlikely with random)

  -- ============================================================
  -- 4. Employees
  -- ============================================================
  
  INSERT INTO employees (id, first_name, last_name, email, position, department, join_date, salary, team_lead_id) VALUES
  (v_emp1_record_id, 'Ahmed', 'Hassan', 'ahmed.dev@shavierp.com', 'Senior Developer', 'Tech', '2023-01-15', 25000, v_admin_id),
  (v_emp2_record_id, 'Laila', 'Samir', 'laila.sales@shavierp.com', 'Sales Executive', 'Sales', '2023-06-01', 12000, v_marketing_manager_id);

  -- Link profile IDs to employee table (assuming 1:1 mapping logic exists or just for reference)
  -- Note: In real app, there might be a link_user_id column or similar. Using email to match conceptually.

  -- ============================================================
  -- 5. Budgets
  -- ============================================================
  
  INSERT INTO budgets (category, subcategory, department, allocated, spent, period, fiscal_year, owner_id)
  VALUES 
    ('Q1 Marketing', 'Ads', 'Marketing', 500000, 150000, 'Q1-2025', 2025, v_marketing_manager_id)
  RETURNING id INTO v_budget_marketing_id;
  
  INSERT INTO budgets (category, department, allocated, spent, period, fiscal_year, owner_id)
  VALUES 
    ('Q1 Salaries', 'HR', 1200000, 400000, 'Q1-2025', 2025, v_hr_manager_id)
  RETURNING id INTO v_budget_hr_id;

  -- ============================================================
  -- 6. Campaigns
  -- ============================================================
  
  INSERT INTO campaigns (name, type, status, budget, start_date, end_date, created_by, assigned_to, department)
  VALUES 
    ('Summer Launch 2025', 'social', 'active', 50000, NOW(), NOW() + INTERVAL '30 days', v_marketing_manager_id, v_marketing_manager_id, 'Marketing')
  RETURNING id INTO v_campaign_id;

  INSERT INTO campaigns (name, type, status, budget, start_date, end_date, created_by, department)
  VALUES 
    ('Ramadan Special', 'ads', 'draft', 100000, NOW() + INTERVAL '60 days', NOW() + INTERVAL '90 days', v_marketing_manager_id, 'Marketing');

  -- ============================================================
  -- 7. Email Campaigns
  -- ============================================================
  
  INSERT INTO email_campaigns (campaign_id, subject, content, recipients, sent, delivered, opened, clicked, status)
  VALUES 
    (v_campaign_id, 'Welcome to Summer!', '<h1>Summer is here</h1>', 1000, 1000, 990, 450, 120, 'sent');

  -- ============================================================
  -- 8. Leave Requests
  -- ============================================================
  
  -- Pending Request (Should trigger notification to Manager)
  INSERT INTO leave_requests (employee_id, type, start_date, end_date, days, reason, status)
  VALUES 
    (v_emp1_record_id, 'annual', CURRENT_DATE + 5, CURRENT_DATE + 10, 5, 'Family vacation', 'pending');
    
  -- Approved Request
  INSERT INTO leave_requests (employee_id, type, start_date, end_date, days, reason, status, approved_by, approved_at)
  VALUES 
    (v_emp2_record_id, 'sick', CURRENT_DATE - 5, CURRENT_DATE - 4, 1, 'Flu', 'approved', v_hr_manager_id, NOW());

  -- ============================================================
  -- 9. Expenses
  -- ============================================================
  
  -- Expense linked to Marketing Budget (Should trigger notification)
  INSERT INTO expenses (category, amount, description, expense_date, budget_id, submitted_by, status)
  VALUES 
    ('Software License', 1500, 'Adobe CC Subscription', CURRENT_DATE, v_budget_marketing_id, v_marketing_manager_id, 'pending');

  -- ============================================================
  -- 10. Payroll Records
  -- ============================================================
  
  INSERT INTO payroll_records (employee_id, period, period_start, period_end, base_salary, bonuses, tax, status)
  VALUES 
    (v_emp1_record_id, '2025-01', '2025-01-01', '2025-01-31', 25000, 2000, 2500, 'approved');

  -- ============================================================
  -- 11. Performance Reviews
  -- ============================================================
  
  INSERT INTO performance_reviews (employee_id, reviewer_id, period, overall_rating, feedback, status)
  VALUES 
    (v_emp1_record_id, v_admin_id, '2024-Annual', 4.5, 'Excellent performance throughout the year.', 'completed');

END $$;

-- Verify Data
SELECT 'Seed Data Inserted Successfully!' as status;
SELECT count(*) as notifications_created FROM notifications;
*/

SELECT 'Migration 034 - Seed Data (DISABLED for safety)' as status;
