-- ================================================================
-- MIGRATION 054: Quotes Management System
-- Description: Create quotes table as formal intermediary between deals and invoices
-- Purpose: Professional quote generation and tracking
-- Risk: LOW - New table, no existing data affected
-- Created: 2025-12-21
-- ================================================================

-- ================================================================
-- TABLE: quotes
-- ================================================================

CREATE TABLE IF NOT EXISTS quotes (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationships
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    
    -- Customer Info (denormalized for simplicity)
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_company TEXT,
    
    -- Quote Details
    quote_number SERIAL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'EGP' NOT NULL,
    
    -- Line Items (JSONB for flexibility)
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    
    -- Status Flow: draft → sent → approved/rejected/expired
    status TEXT NOT NULL DEFAULT 'draft' 
        CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
    
    -- Validity Period
    valid_until DATE,
    
    -- Approval/Rejection Tracking
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    rejected_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Notes and Terms
    notes TEXT,
    terms_and_conditions TEXT,
    
    -- Audit Trail
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================================================
-- INDEXES
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_quotes_deal_id ON quotes(deal_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_name ON quotes(customer_name);

-- ================================================================
-- TRIGGER: updated_at
-- ================================================================

CREATE TRIGGER update_quotes_updated_at
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Sales and Finance can view quotes
CREATE POLICY "quotes_select_sales_finance_admin" ON quotes
    FOR SELECT TO authenticated
    USING (
        (auth.jwt() ->> 'department') IN ('Sales', 'Finance')
        OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
    );

-- Sales and Admin can create quotes
CREATE POLICY "quotes_insert_sales_admin" ON quotes
    FOR INSERT TO authenticated
    WITH CHECK (
        (auth.jwt() ->> 'department') = 'Sales'
        OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
    );

-- Sales and Admin can update quotes
CREATE POLICY "quotes_update_sales_admin" ON quotes
    FOR UPDATE TO authenticated
    USING (
        (auth.jwt() ->> 'department') = 'Sales'
        OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
    )
    WITH CHECK (
        (auth.jwt() ->> 'department') = 'Sales'
        OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
    );

-- Only Admin can delete quotes
CREATE POLICY "quotes_delete_admin_only" ON quotes
    FOR DELETE TO authenticated
    USING (
        (auth.jwt() ->> 'role') = 'admin'
    );

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check table created
SELECT 
    'Quotes table created successfully' as status,
    COUNT(*) as total_columns
FROM information_schema.columns 
WHERE table_name = 'quotes';

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'quotes'
ORDER BY indexname;

-- Check RLS policies
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'quotes'
ORDER BY policyname;

-- Count quotes (should be 0 initially)
SELECT COUNT(*) as total_quotes FROM quotes;
