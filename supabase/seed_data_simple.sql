-- Finance Seed Data - Simple Version
-- No trigger manipulation - just pure INSERT statements

-- ============================================
-- INVOICES (Revenue)
-- ============================================

INSERT INTO invoices (customer_name, amount, currency, status, due_date, paid_at) VALUES
('TechCorp Solutions Ltd', 85000, 'EGP', 'paid', '2025-12-15', '2025-12-10'),
('Digital Innovation Hub', 62000, 'EGP', 'paid', '2025-12-17', '2025-12-12'),
('Smart Systems Inc', 45000, 'EGP', 'paid', '2025-12-19', '2025-12-15'),
('Cloud Ventures', 38000, 'EGP', 'paid', '2025-12-22', '2025-12-18'),
('Startup Accelerator', 28000, 'EGP', 'pending', '2025-12-29', NULL),
('Enterprise Solutions', 95000, 'EGP', 'pending', '2026-01-01', NULL),
('TechCorp Solutions Ltd', 78000, 'EGP', 'paid', '2025-11-15', '2025-11-12'),
('Digital Innovation Hub', 55000, 'EGP', 'paid', '2025-11-19', '2025-11-14'),
('Smart Systems Inc', 42000, 'EGP', 'paid', '2025-11-22', '2025-11-20'),
('Cloud Ventures', 35000, 'EGP', 'paid', '2025-11-26', '2025-11-25'),
('TechCorp Solutions Ltd', 92000, 'EGP', 'paid', '2025-10-15', '2025-10-10'),
('Digital Innovation Hub', 68000, 'EGP', 'paid', '2025-10-19', '2025-10-15'),
('Smart Systems Inc', 51000, 'EGP', 'paid', '2025-10-24', '2025-10-22'),
('TechCorp Solutions Ltd', 88000, 'EGP', 'paid', '2025-09-15', '2025-09-12'),
('Digital Innovation Hub', 59000, 'EGP', 'paid', '2025-09-19', '2025-09-16'),
('Smart Systems Inc', 46000, 'EGP', 'paid', '2025-09-24', '2025-09-23'),
('TechCorp Solutions Ltd', 95000, 'EGP', 'paid', '2025-08-15', '2025-08-11'),
('Digital Innovation Hub', 72000, 'EGP', 'paid', '2025-08-19', '2025-08-17'),
('Smart Systems Inc', 54000, 'EGP', 'paid', '2025-08-24', '2025-08-22'),
('TechCorp Solutions Ltd', 82000, 'EGP', 'paid', '2025-07-15', '2025-07-12'),
('Digital Innovation Hub', 61000, 'EGP', 'paid', '2025-07-19', '2025-07-16'),
('Smart Systems Inc', 48000, 'EGP', 'paid', '2025-07-24', '2025-07-21');

-- ============================================
-- EXPENSES (Operating Costs)
-- ============================================

INSERT INTO expenses (description, amount, currency, category, status, expense_date, submitted_by, approved_at) VALUES
('Office Rent - December', 150000, 'EGP', 'Rent', 'approved', '2025-12-01', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('AWS Cloud Services', 45000, 'EGP', 'Software', 'approved', '2025-12-03', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Marketing Campaign - Social Media', 32000, 'EGP', 'Marketing', 'approved', '2025-12-05', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Equipment & Supplies', 18000, 'EGP', 'Logistics', 'approved', '2025-12-08', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Software Licenses (Adobe, MS)', 22000, 'EGP', 'Subscriptions', 'approved', '2025-12-10', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Consulting Services', 15000, 'EGP', 'Consulting', 'approved', '2025-12-12', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Sales Commissions', 28000, 'EGP', 'Commissions', 'approved', '2025-12-15', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Travel & Accommodation', 12000, 'EGP', 'Miscellaneous', 'approved', '2025-12-18', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Office Rent - November', 150000, 'EGP', 'Rent', 'approved', '2025-11-01', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('AWS Cloud Services', 42000, 'EGP', 'Software', 'approved', '2025-11-03', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Marketing Campaign - Email', 28000, 'EGP', 'Marketing', 'approved', '2025-11-05', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Equipment Maintenance', 15000, 'EGP', 'Logistics', 'approved', '2025-11-08', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Software Licenses', 20000, 'EGP', 'Subscriptions', 'approved', '2025-11-10', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Sales Commissions', 25000, 'EGP', 'Commissions', 'approved', '2025-11-15', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Office Rent - October', 150000, 'EGP', 'Rent', 'approved', '2025-10-01', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('AWS Cloud Services', 48000, 'EGP', 'Software', 'approved', '2025-10-03', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Marketing Campaign - Content', 35000, 'EGP', 'Marketing', 'approved', '2025-10-05', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Office Supplies', 12000, 'EGP', 'Logistics', 'approved', '2025-10-08', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Sales Commissions', 30000, 'EGP', 'Commissions', 'approved', '2025-10-15', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Office Rent - September', 150000, 'EGP', 'Rent', 'approved', '2025-09-01', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('AWS Cloud Services', 44000, 'EGP', 'Software', 'approved', '2025-09-03', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Marketing Campaign', 30000, 'EGP', 'Marketing', 'approved', '2025-09-05', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Sales Commissions', 27000, 'EGP', 'Commissions', 'approved', '2025-09-15', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Office Rent - August', 150000, 'EGP', 'Rent', 'approved', '2025-08-01', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('AWS Cloud Services', 46000, 'EGP', 'Software', 'approved', '2025-08-03', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Marketing Campaign', 33000, 'EGP', 'Marketing', 'approved', '2025-08-05', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Sales Commissions', 32000, 'EGP', 'Commissions', 'approved', '2025-08-15', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Office Rent - July', 150000, 'EGP', 'Rent', 'approved', '2025-07-01', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('AWS Cloud Services', 43000, 'EGP', 'Software', 'approved', '2025-07-03', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Marketing Campaign', 29000, 'EGP', 'Marketing', 'approved', '2025-07-05', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW()),
('Sales Commissions', 26000, 'EGP', 'Commissions', 'approved', '2025-07-15', (SELECT id FROM profiles WHERE role = 'admin' LIMIT 1), NOW());

-- Verification
SELECT COUNT(*) as invoices_count FROM invoices WHERE due_date >= '2025-07-01';
SELECT COUNT(*) as expenses_count FROM expenses WHERE expense_date >= '2025-07-01';
SELECT SUM(amount) as total_revenue FROM invoices WHERE status = 'paid' AND paid_at >= '2025-07-01';
SELECT SUM(amount) as total_expenses FROM expenses WHERE status = 'approved' AND expense_date >= '2025-07-01';
