-- ================================================================
-- SAMPLE DATA: HR Employees
-- Description: Insert sample employees for testing
-- Run this AFTER running 010_hr_employees.sql
-- ================================================================

INSERT INTO employees (first_name, last_name, email, phone, position, department, join_date, status, salary) VALUES
    ('محمد', 'الشافعي', 'shavi@shaviacademy.com', '+201000000001', 'المدير التنفيذي', 'management', '2023-01-01', 'active', 50000.00),
    ('أحمد', 'كمال', 'ahmed.k@shaviacademy.com', '+201000000002', 'مدير المبيعات', 'sales', '2023-03-15', 'active', 25000.00),
    ('سارة', 'محمود', 'sara.m@shaviacademy.com', '+201000000003', 'مسؤول تسويق', 'marketing', '2023-04-01', 'active', 15000.00),
    ('خالد', 'علي', 'khaled.a@shaviacademy.com', '+201000000004', 'مطور برمجيات', 'tech', '2023-02-10', 'active', 30000.00),
    ('منى', 'سعيد', 'mona.s@shaviacademy.com', '+201000000005', 'خدمة عملاء', 'customer_success', '2023-06-20', 'probation', 8000.00),
    ('عمر', 'فاروق', 'omar.f@shaviacademy.com', '+201000000006', 'مدرب برمجة', 'trainers', '2023-05-01', 'active', 20000.00),
    ('ليلى', 'حسن', 'laila.h@shaviacademy.com', '+201000000007', 'محاسب', 'finance', '2023-07-01', 'on_leave', 12000.00),
    ('ياسمين', 'عادل', 'yasmin.a@shaviacademy.com', '+201000000008', 'مدير موارد بشرية', 'hr', '2023-03-01', 'active', 22000.00),
    ('كريم', 'نادر', 'kareem.n@shaviacademy.com', '+201000000009', 'مبيعات', 'sales', '2023-08-15', 'active', 10000.00),
    ('نور', 'إبراهيم', 'noor.i@shaviacademy.com', '+201000000010', 'مدرب تصميم', 'trainers', '2023-09-01', 'terminated', 18000.00);
