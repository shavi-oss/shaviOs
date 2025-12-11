-- ================================================================
-- CLEANUP SCRIPT - Run this FIRST if you have errors
-- This will drop all existing tables and start fresh
-- ================================================================

-- Drop all tables (in reverse dependency order)
DROP TABLE IF EXISTS ticket_messages CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS training_sessions CASCADE;
DROP TABLE IF EXISTS trainers CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS pipeline_stages CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS secrets CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Verify cleanup
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- If list is empty or only shows supabase tables, you're ready!
-- Now run complete-setup.sql
