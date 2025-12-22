-- ================================================================
-- MIGRATION 055: Invoice-Deal Integration
-- Description: Link invoices to deals with validation
-- Purpose: Prevent random invoices, ensure revenue traceability
-- Risk: MEDIUM - Alters existing table, but safe (nullable columns)
-- Mandatory: HARDENED validation against missing columns
-- Created: 2025-12-21
-- ================================================================

-- ================================================================
-- STEP 1: Add new columns (nullable, no breaking changes)
-- ================================================================

ALTER TABLE invoices 
    ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS source_type TEXT DEFAULT 'manual' 
        CHECK (source_type IN ('deal', 'manual')),
    ADD COLUMN IF NOT EXISTS manual_reason TEXT;

-- ================================================================
-- STEP 2: Set all existing invoices to 'manual' (safe retroactive)
-- ================================================================

UPDATE invoices 
SET source_type = 'manual' 
WHERE source_type IS NULL;

-- ================================================================
-- STEP 3: Create indexes for performance
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_invoices_deal_id ON invoices(deal_id);
CREATE INDEX IF NOT EXISTS idx_invoices_quote_id ON invoices(quote_id);
CREATE INDEX IF NOT EXISTS idx_invoices_source_type ON invoices(source_type);

-- ================================================================
-- STEP 4: HARDENED Validation Function
-- ================================================================

CREATE OR REPLACE FUNCTION validate_invoice_source()
RETURNS TRIGGER AS $$
DECLARE
    deal_stage TEXT;
    column_exists BOOLEAN;
BEGIN
    -- ============================================================
    -- SAFETY CHECK: Verify source_type column exists
    -- This prevents errors during migration or schema changes
    -- ============================================================
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'invoices' 
        AND column_name = 'source_type'
    ) INTO column_exists;
    
    IF NOT column_exists THEN
        -- Column doesn't exist yet, skip validation
        RETURN NEW;
    END IF;
    
    -- ============================================================
    -- Use JSONB for safe column access
    -- This handles cases where columns might be missing
    -- ============================================================
    DECLARE
        new_json JSONB := to_jsonb(NEW);
        invoice_source_type TEXT := new_json->>'source_type';
    BEGIN
        -- ========================================================
        -- VALIDATION 1: Invoice from deal must have deal_id
        -- ========================================================
        IF invoice_source_type = 'deal' THEN
            IF (new_json->>'deal_id') IS NULL THEN
                RAISE EXCEPTION 'Invoice from deal must have deal_id';
            END IF;
            
            -- ====================================================
            -- VALIDATION 2: Deal must exist and be won
            -- ====================================================
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
        
        -- ========================================================
        -- VALIDATION 3: Manual invoices require reason
        -- ========================================================
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
        -- Gracefully handle missing columns during migration
        RETURN NEW;
    WHEN OTHERS THEN
        -- Re-raise other exceptions
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- STEP 5: Apply trigger (INSERT ONLY - as approved)
-- ================================================================

DROP TRIGGER IF EXISTS invoice_source_validation ON invoices;

CREATE TRIGGER invoice_source_validation
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION validate_invoice_source();

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Check columns added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'invoices'
AND column_name IN ('deal_id', 'quote_id', 'source_type', 'manual_reason')
ORDER BY column_name;

-- Check trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'invoice_source_validation';

-- Verify data integrity
SELECT 
    'Invoice-Deal integration completed' as status,
    COUNT(*) as total_invoices,
    COUNT(*) FILTER (WHERE source_type = 'manual') as manual_invoices,
    COUNT(*) FILTER (WHERE source_type = 'deal') as deal_invoices,
    COUNT(*) FILTER (WHERE deal_id IS NOT NULL) as invoices_with_deal
FROM invoices;

-- Expected: All existing invoices should be 'manual'
