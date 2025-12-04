-- ============================================================================
-- QUERY PARA VERIFICAR EL CONSTRAINT DE business_type
-- ============================================================================
-- Ejecuta esto en Supabase SQL Editor para ver qué valores acepta
-- ============================================================================

-- Ver la definición del constraint
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE
    conname = 'core_tenants_chk_business_type';

-- Ver todos los constraints de la tabla tenants
SELECT
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE
    conrelid = 'core.tenants'::regclass;

-- Ver valores únicos actuales en business_type
SELECT DISTINCT business_type FROM core.tenants;

-- Ver la estructura completa de la columna
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable,
    character_maximum_length
FROM information_schema.columns
WHERE
    table_schema = 'core'
    AND table_name = 'tenants'
    AND column_name = 'business_type';
