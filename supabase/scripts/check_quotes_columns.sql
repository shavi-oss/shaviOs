-- Quick check: What columns exist in quotes table?
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes'
ORDER BY ordinal_position;
