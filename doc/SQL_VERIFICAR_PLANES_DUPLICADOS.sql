-- ============================================================================
-- VERIFICAR PLANES DUPLICADOS
-- ============================================================================
-- Este script verifica si hay planes duplicados en la base de datos
-- ============================================================================

-- 1. Ver todos los planes activos agrupados por tipo y código
SELECT 
  plan_type,
  code,
  billing_period,
  name,
  price,
  yearly_price,
  display_order,
  is_popular,
  is_active
FROM core.plans
WHERE is_active = true
ORDER BY plan_type, display_order, code, billing_period;

-- 2. Detectar códigos duplicados (mismo code, mismo plan_type, mismo billing_period)
SELECT 
  plan_type,
  code,
  billing_period,
  COUNT(*) as cantidad
FROM core.plans
WHERE is_active = true
GROUP BY plan_type, code, billing_period
HAVING COUNT(*) > 1;

-- 3. Ver planes de empresa
SELECT 
  code,
  billing_period,
  name,
  price,
  yearly_price,
  display_order,
  is_popular
FROM core.plans
WHERE is_active = true 
  AND plan_type = 'empresa'
ORDER BY display_order, billing_period;

-- 4. Ver planes de contador
SELECT 
  code,
  billing_period,
  name,
  price,
  yearly_price,
  display_order,
  is_popular
FROM core.plans
WHERE is_active = true 
  AND plan_type = 'contador'
ORDER BY display_order, billing_period;

-- 5. Contar planes por tipo
SELECT 
  plan_type,
  billing_period,
  COUNT(*) as total_planes
FROM core.plans
WHERE is_active = true
GROUP BY plan_type, billing_period
ORDER BY plan_type, billing_period;

