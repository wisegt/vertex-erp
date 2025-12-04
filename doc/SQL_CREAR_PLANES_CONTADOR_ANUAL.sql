-- ============================================================================
-- CREAR PLANES ANUALES PARA CONTADORES
-- ============================================================================
-- Planes específicos para despachos contables con facturación anual
-- Los códigos siguen el patrón: {codigo}anual
-- ============================================================================

-- Verificar planes de contador existentes
SELECT code, billing_period, name, plan_type, price 
FROM core.plans 
WHERE plan_type IN ('contador', 'firm')
ORDER BY billing_period, code;

-- ============================================================================
-- PLANES ANUALES PARA CONTADORES
-- ============================================================================

-- 1. Independiente Anual
INSERT INTO core.plans (
  name,
  code,
  billing_period,
  price,
  yearly_price,
  is_active,
  plan_type,
  description,
  max_users,
  max_companies
) VALUES (
  'Independiente',
  'independienteanual',
  'anual',
  3588, -- Ajustar según tu precio (299 x 12 con descuento)
  3588,
  true,
  'contador', -- o 'firm' según tu esquema
  'Plan para contador independiente con facturación anual',
  1,  -- 1 usuario (el contador)
  5   -- Puede gestionar hasta 5 empresas
) ON CONFLICT (code, billing_period) DO UPDATE SET
  price = EXCLUDED.price,
  yearly_price = EXCLUDED.yearly_price,
  is_active = EXCLUDED.is_active;

-- 2. Despacho Anual
INSERT INTO core.plans (
  name,
  code,
  billing_period,
  price,
  yearly_price,
  is_active,
  plan_type,
  description,
  max_users,
  max_companies
) VALUES (
  'Despacho',
  'despachoanual',
  'anual',
  7188, -- Ajustar según tu precio (599 x 12 con descuento)
  7188,
  true,
  'contador',
  'Plan para despacho contable con facturación anual',
  5,   -- 5 contadores en el despacho
  20   -- Puede gestionar hasta 20 empresas
) ON CONFLICT (code, billing_period) DO UPDATE SET
  price = EXCLUDED.price,
  yearly_price = EXCLUDED.yearly_price,
  is_active = EXCLUDED.is_active;

-- 3. Firma Anual (Plan Grande)
INSERT INTO core.plans (
  name,
  code,
  billing_period,
  price,
  yearly_price,
  is_active,
  plan_type,
  description,
  max_users,
  max_companies
) VALUES (
  'Firma',
  'firmaanual',
  'anual',
  11988, -- Ajustar según tu precio (999 x 12 con descuento)
  11988,
  true,
  'contador',
  'Plan para firma contable grande con facturación anual',
  15,  -- 15 contadores en la firma
  100  -- Puede gestionar hasta 100 empresas
) ON CONFLICT (code, billing_period) DO UPDATE SET
  price = EXCLUDED.price,
  yearly_price = EXCLUDED.yearly_price,
  is_active = EXCLUDED.is_active;

-- ============================================================================
-- VERIFICAR QUE SE CREARON CORRECTAMENTE
-- ============================================================================

SELECT 
  code, 
  billing_period, 
  name, 
  plan_type,
  price,
  max_users,
  max_companies,
  is_active
FROM core.plans 
WHERE billing_period = 'anual'
ORDER BY plan_type, code;

-- ============================================================================
-- SCRIPT COMPLETO: TODOS LOS PLANES (EMPRESAS + CONTADORES)
-- ============================================================================

-- Si quieres insertar todos de una vez, ejecuta esto:

DO $$
BEGIN
  -- Planes para EMPRESAS (Anuales)
  INSERT INTO core.plans (name, code, billing_period, price, yearly_price, is_active, plan_type, description, max_users, max_companies)
  VALUES 
    ('Starter', 'starteranual', 'anual', 2988, 2988, true, 'standard', 'Plan Starter anual para empresas', 3, 1),
    ('Business', 'businessanual', 'anual', 5988, 5988, true, 'standard', 'Plan Business anual para empresas', 10, 1),
    ('Enterprise', 'enterpriseanual', 'anual', 9984, 9984, true, 'standard', 'Plan Enterprise anual para empresas', 50, 1)
  ON CONFLICT (code, billing_period) DO UPDATE SET
    price = EXCLUDED.price,
    yearly_price = EXCLUDED.yearly_price,
    is_active = EXCLUDED.is_active;

  -- Planes para CONTADORES (Anuales)
  INSERT INTO core.plans (name, code, billing_period, price, yearly_price, is_active, plan_type, description, max_users, max_companies)
  VALUES 
    ('Independiente', 'independienteanual', 'anual', 3588, 3588, true, 'contador', 'Plan anual para contador independiente', 1, 5),
    ('Despacho', 'despachoanual', 'anual', 7188, 7188, true, 'contador', 'Plan anual para despacho contable', 5, 20),
    ('Firma', 'firmaanual', 'anual', 11988, 11988, true, 'contador', 'Plan anual para firma contable grande', 15, 100)
  ON CONFLICT (code, billing_period) DO UPDATE SET
    price = EXCLUDED.price,
    yearly_price = EXCLUDED.yearly_price,
    is_active = EXCLUDED.is_active;

  RAISE NOTICE 'Planes anuales creados/actualizados exitosamente';
END $$;

-- Resumen final de todos los planes
SELECT 
  CASE 
    WHEN plan_type = 'standard' THEN 'Empresa'
    WHEN plan_type = 'contador' THEN 'Contador'
    ELSE plan_type
  END as tipo,
  name as nombre,
  code as codigo,
  billing_period as periodo,
  price as precio,
  max_users as usuarios,
  max_companies as empresas,
  is_active as activo
FROM core.plans 
ORDER BY plan_type, billing_period, price;

