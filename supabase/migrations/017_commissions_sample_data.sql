-- ================================================================
-- SAMPLE DATA: Sales Commissions
-- Description: Insert dummy commission data
-- Run this AFTER running 016_sales_commissions.sql
-- ================================================================

-- Insert Commission Rules
INSERT INTO commission_rules (role, percentage, min_deal_value) VALUES
    ('sales_rep', 10.0, 5000),
    ('sales_manager', 5.0, 0);

DO $$
DECLARE
    emp_id UUID;
    deal_id_1 UUID;
    deal_id_2 UUID;
BEGIN
    -- Get a sales employee (from HR sample data)
    SELECT id INTO emp_id FROM employees WHERE department = 'sales' LIMIT 1;
    
    -- Get some closed deals (from Sales sample data)
    SELECT id INTO deal_id_1 FROM deals WHERE stage = 'closed_won' LIMIT 1;
    
    -- If we don't have enough closed deals, just pick any
    SELECT id INTO deal_id_2 FROM deals WHERE id != deal_id_1 LIMIT 1;

    -- Only insert if we found an employee
    IF emp_id IS NOT NULL THEN
        -- Commission for Deal 1
        IF deal_id_1 IS NOT NULL THEN
            INSERT INTO commissions (employee_id, deal_id, amount, type, status, notes, pay_period) VALUES
            (emp_id, deal_id_1, 2500.00, 'deal_commission', 'paid', 'عمولة صفقة شركة النور', 'Jan 2024');
        END IF;

        -- Commission for Deal 2
        IF deal_id_2 IS NOT NULL THEN
            INSERT INTO commissions (employee_id, deal_id, amount, type, status, notes, pay_period) VALUES
            (emp_id, deal_id_2, 1200.00, 'deal_commission', 'pending', 'بانتظار التحصيل النهائي', 'Feb 2024');
        END IF;

        -- Quarterly Bonus
        INSERT INTO commissions (employee_id, amount, type, status, notes, pay_period) VALUES
        (emp_id, 5000.00, 'quarterly_target', 'approved', 'مكافأة تحقيق المستهدف الربع سنوي', 'Q1 2024');
    END IF;
END $$;
