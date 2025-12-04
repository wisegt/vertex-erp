-- Ver el constraint de status en users
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'core.users'::regclass
  AND conname LIKE '%status%';

-- Ver valores existentes
SELECT DISTINCT status 
FROM core.users
WHERE status IS NOT NULL;
