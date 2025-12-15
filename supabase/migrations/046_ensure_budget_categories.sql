-- ================================================================
-- MIGRATION 046: Ensure Budget Categories
-- Purpose: Fix missing table gap identified in Compliance Report
-- ================================================================

-- 1. Create Table (Safe Mode)
CREATE TABLE IF NOT EXISTS public.budget_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  default_allocation numeric DEFAULT 0 CHECK (default_allocation >= 0),
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT budget_categories_pkey PRIMARY KEY (id),
  CONSTRAINT budget_categories_name_key UNIQUE (name)
);

-- 2. Audit This Table
DROP TRIGGER IF EXISTS audit_budget_categories ON public.budget_categories;
CREATE TRIGGER audit_budget_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.budget_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.enhanced_audit_trigger();

-- 3. Enable RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Admin & Finance: Full Access
DROP POLICY IF EXISTS "finance_manage_categories" ON budget_categories;
CREATE POLICY "finance_manage_categories"
ON budget_categories
FOR ALL
TO authenticated
USING (
  (auth.jwt() ->> 'department') = 'Finance'
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer', 'finance_manager')
)
WITH CHECK (
  (auth.jwt() ->> 'department') = 'Finance'
  OR (auth.jwt() ->> 'role') IN ('admin', 'developer', 'finance_manager')
);

-- Everyone Else: Read Only (needed for viewing budgets)
DROP POLICY IF EXISTS "everyone_read_categories" ON budget_categories;
CREATE POLICY "everyone_read_categories"
ON budget_categories
FOR SELECT
TO authenticated
USING (true);

-- 5. Seed Data (Upsert to avoid duplicates)
INSERT INTO public.budget_categories (name, default_allocation, is_active)
VALUES
  ('Salaries', 100000, true),
  ('Rent', 50000, true),
  ('Software', 10000, true),
  ('Marketing', 25000, true),
  ('Office Supplies', 5000, true),
  ('Travel', 15000, true)
ON CONFLICT (name) DO UPDATE
SET default_allocation = EXCLUDED.default_allocation;
