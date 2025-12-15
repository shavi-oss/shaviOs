-- Create budget_categories table
CREATE TABLE IF NOT EXISTS public.budget_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    name_ar TEXT,
    default_allocation NUMERIC NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

-- Create policies

-- 1. Admin Full Access
CREATE POLICY "Admins have full access to budget_categories"
    ON public.budget_categories
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- 2. Finance Read/Write (Manage categories)
CREATE POLICY "Finance can manage budget_categories"
    ON public.budget_categories
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'finance' 
        OR 
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'manager'
    );

-- 3. HR Read Only
CREATE POLICY "HR can view budget_categories"
    ON public.budget_categories
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'hr'
    );

-- Seed Data (from current hardcoded defaults)
INSERT INTO public.budget_categories (name, name_ar, default_allocation)
VALUES 
    ('Salaries', 'الرواتب', 900000),
    ('Rent', 'الإيجار', 150000),
    ('Software', 'البرمجيات', 100000),
    ('Marketing', 'التسويق', 200000),
    ('Subscriptions', 'الاشتراكات', 100000),
    ('Logistics', 'لوجستيات', 150000),
    ('Commissions', 'العمولات', 80000),
    ('Consulting', 'الاستشارات', 50000),
    ('Miscellaneous', 'متنوع', 50000)
ON CONFLICT (name) DO NOTHING;

-- Trigger for updated_at
CREATE TRIGGER update_budget_categories_updated_at
    BEFORE UPDATE ON public.budget_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
