-- ================================================================
-- MIGRATION 008: Finance Module (Invoices)
-- Description: Creates table for tracking invoices and payments
-- Created: 2025-12-09
-- ================================================================

-- ================================================================
-- TABLE: invoices
-- Purpose: Track customer invoices and payments
-- ================================================================

CREATE TABLE IF NOT EXISTS invoices (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Invoice Details
    invoice_number SERIAL, -- Auto-incrementing human readable number
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    
    -- Financials
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'EGP',
    
    -- Status & Dates
    status TEXT NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('draft', 'pending', 'paid', 'overdue', 'cancelled')),
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    
    -- Items (JSONB for flexibility)
    items JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_name ON invoices(customer_name);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);

-- Trigger for updated_at
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all for authenticated users" ON invoices
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for service role" ON invoices
    FOR ALL TO service_role USING (true) WITH CHECK (true);
