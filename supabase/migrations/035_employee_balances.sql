-- ================================================================
-- MIGRATION 035: Employee Leave Balances
-- Description: Adds leave balance columns to employees table
-- Version: 3.0
-- Created: 2025-12-13
-- ================================================================

-- 1. Add balance columns
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS annual_leave_balance INTEGER NOT NULL DEFAULT 21 CHECK (annual_leave_balance >= 0),
ADD COLUMN IF NOT EXISTS sick_leave_balance INTEGER NOT NULL DEFAULT 14 CHECK (sick_leave_balance >= 0);

-- 2. Index for faster balance lookups (optional but good for filtering)
CREATE INDEX IF NOT EXISTS idx_employees_balances ON employees(annual_leave_balance, sick_leave_balance);

-- 3. Trigger to prevent negative balance on update (Double Safety)
-- Note: The CHECK constraint >= 0 already handles this, but a trigger could
-- handle complex logic if needed. For now, CHECK is sufficient and performant.

-- 4. Audit this change
-- Since we enabled audit triggers on 'employees' table in migration 033,
-- these schema changes won't be logged in audit_logs (data only),
-- but future updates to balances will be automatically logged.

-- ================================================================
-- VERIFICATION
-- ================================================================

SELECT 'Migration 035 - Employee Balances added successfully' as status;

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'employees' AND column_name LIKE '%_balance';
