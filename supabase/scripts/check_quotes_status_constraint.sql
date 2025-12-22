-- Quick check: What are the allowed status values for quotes?
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'quotes'::regclass
AND contype = 'c'
AND conname LIKE '%status%';
