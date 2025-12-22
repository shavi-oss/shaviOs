-- ================================================================
-- SAFE MIGRATION APPLICATION - COMBINED 053-056
-- Purpose: Apply all 4 migrations in correct order with safety checks
-- Approach: Check before applying, skip if already applied
-- Created: 2025-12-21
-- ================================================================

-- ================================================================
-- MIGRATION 053: Deals Enhancement
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 053: Deals Enhancement ===';
    
    -- Check if constraints already exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'deals' AND constraint_name = 'deals_value_positive'
    ) THEN
        -- Add value constraint
        ALTER TABLE deals ADD CONSTRAINT deals_value_positive CHECK (value > 0);
        RAISE NOTICE '✅ Added deals_value_positive constraint';
    ELSE
        RAISE NOTICE '⏭️  deals_value_positive already exists';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'deals' AND constraint_name = 'deals_stage_required'
    ) THEN
        -- Add stage constraint
        ALTER TABLE deals ADD CONSTRAINT deals_stage_required CHECK (stage IS NOT NULL);
        RAISE NOTICE '✅ Added deals_stage_required constraint';
    ELSE
        RAISE NOTICE '⏭️  deals_stage_required already exists';
    END IF;
    
    RAISE NOTICE '✅ Migration 053 Complete';
END $$;

-- ================================================================
-- MIGRATION 054: Quotes Management
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 054: Quotes Management ===';
    
    -- Check if quotes table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'quotes'
    ) THEN
        -- Create quotes table
        CREATE TABLE quotes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
            customer_name TEXT NOT NULL,
            customer_email TEXT,
            customer_company TEXT,
            quote_number SERIAL UNIQUE,
            amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
            currency TEXT DEFAULT 'EGP' NOT NULL,
            items JSONB DEFAULT '[]'::jsonb NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft' 
                CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
            valid_until DATE,
            approved_at TIMESTAMPTZ,
            approved_by UUID REFERENCES profiles(id),
            rejected_at TIMESTAMPTZ,
            rejection_reason TEXT,
            notes TEXT,
            terms_and_conditions TEXT,
            created_by UUID REFERENCES profiles(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_quotes_deal_id ON quotes(deal_id);
        CREATE INDEX idx_quotes_status ON quotes(status);
        CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
        CREATE INDEX idx_quotes_customer_name ON quotes(customer_name);
        
        -- Create trigger
        CREATE TRIGGER update_quotes_updated_at
            BEFORE UPDATE ON quotes
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
        
        -- Enable RLS
        ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "quotes_select_sales_finance_admin" ON quotes
            FOR SELECT TO authenticated
            USING (
                (auth.jwt() ->> 'department') IN ('Sales', 'Finance')
                OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
            );
        
        CREATE POLICY "quotes_insert_sales_admin" ON quotes
            FOR INSERT TO authenticated
            WITH CHECK (
                (auth.jwt() ->> 'department') = 'Sales'
                OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
            );
        
        CREATE POLICY "quotes_update_sales_admin" ON quotes
            FOR UPDATE TO authenticated
            USING (
                (auth.jwt() ->> 'department') = 'Sales'
                OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
            );
        
        CREATE POLICY "quotes_delete_admin_only" ON quotes
            FOR DELETE TO authenticated
            USING ((auth.jwt() ->> 'role') = 'admin');
        
        RAISE NOTICE '✅ Created quotes table with indexes and policies';
    ELSE
        RAISE NOTICE '⏭️  quotes table already exists';
    END IF;
    
    RAISE NOTICE '✅ Migration 054 Complete';
END $$;

-- ================================================================
-- MIGRATION 055: Invoice-Deal Integration
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 055: Invoice-Deal Integration ===';
    
    -- Add deal_id column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'deal_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN deal_id UUID REFERENCES deals(id) ON DELETE SET NULL;
        CREATE INDEX idx_invoices_deal_id ON invoices(deal_id);
        RAISE NOTICE '✅ Added deal_id column and index';
    ELSE
        RAISE NOTICE '⏭️  deal_id already exists';
    END IF;
    
    -- Add quote_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'quote_id'
    ) THEN
        ALTER TABLE invoices ADD COLUMN quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL;
        CREATE INDEX idx_invoices_quote_id ON invoices(quote_id);
        RAISE NOTICE '✅ Added quote_id column and index';
    ELSE
        RAISE NOTICE '⏭️  quote_id already exists';
    END IF;
    
    -- Add source_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'source_type'
    ) THEN
        ALTER TABLE invoices ADD COLUMN source_type TEXT DEFAULT 'manual' 
            CHECK (source_type IN ('deal', 'manual'));
        CREATE INDEX idx_invoices_source_type ON invoices(source_type);
        
        -- Update existing invoices
        UPDATE invoices SET source_type = 'manual' WHERE source_type IS NULL;
        
        RAISE NOTICE '✅ Added source_type column and updated existing data';
    ELSE
        RAISE NOTICE '⏭️  source_type already exists';
    END IF;
    
    -- Add manual_reason column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' AND column_name = 'manual_reason'
    ) THEN
        ALTER TABLE invoices ADD COLUMN manual_reason TEXT;
        RAISE NOTICE '✅ Added manual_reason column';
    ELSE
        RAISE NOTICE '⏭️  manual_reason already exists';
    END IF;
    
    -- Create validation function
    CREATE OR REPLACE FUNCTION validate_invoice_source()
    RETURNS TRIGGER AS $func$
    DECLARE
        deal_stage TEXT;
    BEGIN
        DECLARE
            new_json JSONB := to_jsonb(NEW);
            invoice_source_type TEXT := new_json->>'source_type';
        BEGIN
            IF invoice_source_type = 'deal' THEN
                IF (new_json->>'deal_id') IS NULL THEN
                    RAISE EXCEPTION 'Invoice from deal must have deal_id';
                END IF;
                
                SELECT stage INTO deal_stage
                FROM deals 
                WHERE id = (new_json->>'deal_id')::UUID;
                
                IF deal_stage IS NULL THEN
                    RAISE EXCEPTION 'Deal with ID % not found', new_json->>'deal_id';
                END IF;
                
                IF deal_stage != 'closed_won' THEN
                    RAISE EXCEPTION 'Invoice can only be created from won deals (current stage: %)', deal_stage;
                END IF;
            END IF;
            
            IF invoice_source_type = 'manual' THEN
                IF (new_json->>'manual_reason') IS NULL OR 
                   LENGTH(TRIM(new_json->>'manual_reason')) < 5 THEN
                    RAISE EXCEPTION 'Manual invoices require a reason (minimum 5 characters)';
                END IF;
            END IF;
        END;
        
        RETURN NEW;
    EXCEPTION
        WHEN undefined_column THEN
            RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql SECURITY DEFINER;
    
    -- Apply trigger
    DROP TRIGGER IF EXISTS invoice_source_validation ON invoices;
    CREATE TRIGGER invoice_source_validation
        BEFORE INSERT ON invoices
        FOR EACH ROW
        EXECUTE FUNCTION validate_invoice_source();
    
    RAISE NOTICE '✅ Created validation function and trigger';
    RAISE NOTICE '✅ Migration 055 Complete';
END $$;

-- ================================================================
-- MIGRATION 056: RBAC Updates
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION 056: RBAC Updates ===';
    
    -- Drop old policies
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON deals;
    DROP POLICY IF EXISTS "Enable all for service role" ON deals;
    DROP POLICY IF EXISTS "deals_select_sales_finance" ON deals;
    DROP POLICY IF EXISTS "deals_manage_sales_admin" ON deals;
    
    -- Create new deals policies
    CREATE POLICY "deals_select_sales_finance" ON deals
        FOR SELECT TO authenticated
        USING (
            (auth.jwt() ->> 'department') IN ('Sales', 'Finance')
            OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
        );
    
    CREATE POLICY "deals_manage_sales_admin" ON deals
        FOR ALL TO authenticated
        USING (
            (auth.jwt() ->> 'department') = 'Sales'
            OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
        );
    
    -- Update invoices policies
    DROP POLICY IF EXISTS "Enable all for authenticated users" ON invoices;
    DROP POLICY IF EXISTS "Enable all for service role" ON invoices;
    DROP POLICY IF EXISTS "invoices_select_all_auth" ON invoices;
    DROP POLICY IF EXISTS "invoices_manage_finance_admin" ON invoices;
    
    CREATE POLICY "invoices_select_all_auth" ON invoices
        FOR SELECT TO authenticated
        USING (true);
    
    CREATE POLICY "invoices_manage_finance_admin" ON invoices
        FOR ALL TO authenticated
        USING (
            (auth.jwt() ->> 'department') = 'Finance'
            OR (auth.jwt() ->> 'role') IN ('admin', 'manager')
        );
    
    RAISE NOTICE '✅ Updated RLS policies for deals and invoices';
    RAISE NOTICE '✅ Migration 056 Complete';
END $$;

-- ================================================================
-- FINAL VERIFICATION
-- ================================================================
SELECT '=== ✅ ALL MIGRATIONS APPLIED SUCCESSFULLY ===' as status;

-- Verification Summary
SELECT 
    'VERIFICATION SUMMARY' as check_type,
    (SELECT COUNT(*) FROM information_schema.table_constraints 
     WHERE table_name = 'deals' AND constraint_name LIKE 'deals_%') as deals_constraints,
    (SELECT CASE WHEN EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'quotes') 
            THEN 'EXISTS' ELSE 'MISSING' END) as quotes_table,
    (SELECT COUNT(*) FROM information_schema.columns 
     WHERE table_name = 'invoices' 
     AND column_name IN ('deal_id', 'quote_id', 'source_type', 'manual_reason')) as invoice_new_columns,
    (SELECT COUNT(*) FROM pg_policies 
     WHERE tablename IN ('deals', 'quotes', 'invoices')) as total_policies;
