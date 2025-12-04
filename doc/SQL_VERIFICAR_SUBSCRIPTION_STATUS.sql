-- ============================================================================
-- QUERY PARA VERIFICAR EL CONSTRAINT DE status EN subscriptions
-- ============================================================================

-- Ver todos los constraints de la tabla subscriptions
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'core.subscriptions'::regclass
  AND contype = 'c'; -- Solo check constraints

-- Ver valores únicos actuales en status de subscriptions
SELECT DISTINCT status 
FROM core.subscriptions
WHERE status IS NOT NULL;

-- Ver la estructura de la columna status
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'core' 
  AND table_name = 'subscriptions' 
  AND column_name = 'status';

-- Ver si hay un ENUM definido
SELECT 
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname LIKE '%status%' 
  AND n.nspname = 'core'
ORDER BY e.enumsortorder;

