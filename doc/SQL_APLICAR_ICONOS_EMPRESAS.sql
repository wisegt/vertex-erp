-- ============================================================================
-- APLICAR ICONOS Y COLORES EXACTOS A PLANES DE EMPRESAS
-- ============================================================================
-- Basado en las imágenes proporcionadas por el usuario
-- Estos iconos se aplican a TODOS los planes (mensuales Y anuales)
-- ============================================================================

-- 1. Plan Starter (Tienda - azul claro)
UPDATE core.plans
SET 
  icon = 'ri-store-2-line',
  icon_color = 'info',
  updated_at = NOW()
WHERE code = 'starter'
  AND plan_type = 'empresa'
  AND is_active = true;

-- 2. Plan Business (Gráfica ascendente - morado) - RECOMENDADO
UPDATE core.plans
SET 
  icon = 'ri-line-chart-line',
  icon_color = 'primary',
  is_popular = true,
  updated_at = NOW()
WHERE code = 'business'
  AND plan_type = 'empresa'
  AND is_active = true;

-- 3. Plan Enterprise (Edificio - dorado)
UPDATE core.plans
SET 
  icon = 'ri-building-line',
  icon_color = 'warning',
  updated_at = NOW()
WHERE code = 'enterprise'
  AND plan_type = 'empresa'
  AND is_active = true;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
SELECT 
  code,
  name,
  billing_interval,
  icon,
  icon_color,
  is_popular,
  CASE 
    WHEN code = 'starter' AND icon = 'ri-store-2-line' AND icon_color = 'info' THEN '✅'
    WHEN code = 'business' AND icon = 'ri-line-chart-line' AND icon_color = 'primary' AND is_popular = true THEN '✅'
    WHEN code = 'enterprise' AND icon = 'ri-building-line' AND icon_color = 'warning' THEN '✅'
    ELSE '❌'
  END as correcto
FROM core.plans
WHERE plan_type = 'empresa'
  AND is_active = true
ORDER BY 
  CASE code 
    WHEN 'starter' THEN 1
    WHEN 'business' THEN 2
    WHEN 'enterprise' THEN 3
  END,
  billing_interval;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Todos los planes (monthly y annual) deben mostrar:
-- ✅ starter: ri-store-2-line (info/azul) - Tienda
-- ✅ business: ri-line-chart-line (primary/morado) + is_popular=true - Gráfica
-- ✅ enterprise: ri-building-line (warning/dorado) - Edificio
-- ============================================================================

