-- ================================================================
-- MIGRATION 045: Financial Audit Logs
-- Purpose: Enable audit trail for remaining financial tables
-- ================================================================

-- 1. Trainer Payments Audit
DROP TRIGGER IF EXISTS audit_trainer_payments ON public.trainer_payments;

CREATE TRIGGER audit_trainer_payments
  AFTER INSERT OR UPDATE OR DELETE ON public.trainer_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_audit_trigger();

-- 2. Budget Categories Audit (Track configuration changes)
DROP TRIGGER IF EXISTS audit_budget_categories ON public.budget_categories;

CREATE TRIGGER audit_budget_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_audit_trigger();

-- Data consistency note: 
-- payroll_records, budgets, and expenses are already auditing via migration 033.
