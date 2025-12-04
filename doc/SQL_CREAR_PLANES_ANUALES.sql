-- ============================================================================
-- CREAR PLANES ANUALES (SI NO EXISTEN)
-- ============================================================================
-- Tu sistema actualmente solo tiene planes mensuales
-- Necesitas crear las versiones anuales para soportar facturación anual
-- ============================================================================

-- Verificar planes existentes
SELECT code, billing_period, name, price FROM core.plans;

-- Crear planes anuales (ajusta los precios según tu estrategia)
-- Aquí uso precios con 20% de descuento sobre el anual

-- 1. Starter Anual
INSERT INTO core.plans (
  name,
  code,
  billing_period,
  price,
  yearly_price,
  is_active,
  plan_type,
  description
) VALUES (
  'Starter',
  'starter',
  'anual',
  2988, -- 249 x 12 meses
  2988,
  true,
  'standard',
  'Plan Starter con facturación anual'
) ON CONFLICT DO NOTHING;

-- 2. Business Anual  
INSERT INTO core.plans (
  name,
  code,
  billing_period,
  price,
  yearly_price,
  is_active,
  plan_type,
  description
) VALUES (
  'Business',
  'business',
  'anual',
  5988, -- 499 x 12 meses
  5988,
  true,
  'standard',
  'Plan Business con facturación anual'
) ON CONFLICT DO NOTHING;

-- 3. Enterprise Anual
INSERT INTO core.plans (
  name,
  code,
  billing_period,
  price,
  yearly_price,
  is_active,
  plan_type,
  description
) VALUES (
  'Enterprise',
  'enterprise',
  'anual',
  9984, -- 832 x 12 meses  
  9984,
  true,
  'standard',
  'Plan Enterprise con facturación anual'
) ON CONFLICT DO NOTHING;

-- Verificar que se crearon
SELECT 
  code, 
  billing_period, 
  name, 
  price,
  is_active
FROM core.plans 
WHERE billing_period = 'anual'
ORDER BY code;

