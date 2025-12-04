-- ============================================================================
-- APLICAR TODOS LOS ICONOS CORRECTOS
-- ============================================================================
-- Este script actualiza los iconos de TODOS los planes (empresas y contadores)
-- tanto mensuales como anuales, para que coincidan con el diseño
-- ============================================================================

-- ============================================================================
-- PLANES DE EMPRESAS
-- ============================================================================

-- Starter: Tienda (azul claro)
UPDATE core.plans
SET icon = 'ri-store-2-line', icon_color = 'info', updated_at = NOW()
WHERE code = 'starter' AND plan_type = 'empresa' AND is_active = true;

-- Business: Gráfica ascendente (morado) - RECOMENDADO
UPDATE core.plans
SET icon = 'ri-line-chart-line', icon_color = 'primary', is_popular = true, updated_at = NOW()
WHERE code = 'business' AND plan_type = 'empresa' AND is_active = true;

-- Enterprise: Edificio (dorado)
UPDATE core.plans
SET icon = 'ri-building-line', icon_color = 'warning', updated_at = NOW()
WHERE code = 'enterprise' AND plan_type = 'empresa' AND is_active = true;

-- ============================================================================
-- PLANES DE CONTADORES
-- ============================================================================

-- Independiente: 2 personas (azul)
UPDATE core.plans
SET icon = 'ri-team-line', icon_color = 'info', updated_at = NOW()
WHERE code = 'independiente' AND plan_type = 'contador' AND is_active = true;

-- Despacho: 3 personas (morado) - RECOMENDADO
UPDATE core.plans
SET icon = 'ri-group-line', icon_color = 'primary', is_popular = true, updated_at = NOW()
WHERE code = 'despacho' AND plan_type = 'contador' AND is_active = true;

-- Firma: Edificio/banco (dorado)
UPDATE core.plans
SET icon = 'ri-building-2-line', icon_color = 'warning', updated_at = NOW()
WHERE code = 'firma' AND plan_type = 'contador' AND is_active = true;

-- ============================================================================
-- VERIFICACIÓN COMPLETA
-- ============================================================================

-- Ver TODOS los planes con sus iconos
SELECT 
  plan_type,
  code,
  billing_interval,
  icon,
  icon_color,
  is_popular,
  CASE 
    -- Empresas
    WHEN plan_type = 'empresa' AND code = 'starter' AND icon = 'ri-store-2-line' AND icon_color = 'info' THEN '✅'
    WHEN plan_type = 'empresa' AND code = 'business' AND icon = 'ri-line-chart-line' AND icon_color = 'primary' THEN '✅'
    WHEN plan_type = 'empresa' AND code = 'enterprise' AND icon = 'ri-building-line' AND icon_color = 'warning' THEN '✅'
    -- Contadores
    WHEN plan_type = 'contador' AND code = 'independiente' AND icon = 'ri-team-line' AND icon_color = 'info' THEN '✅'
    WHEN plan_type = 'contador' AND code = 'despacho' AND icon = 'ri-group-line' AND icon_color = 'primary' THEN '✅'
    WHEN plan_type = 'contador' AND code = 'firma' AND icon = 'ri-building-2-line' AND icon_color = 'warning' THEN '✅'
    ELSE '❌'
  END as estado
FROM core.plans
WHERE is_active = true
ORDER BY 
  plan_type,
  CASE code 
    WHEN 'starter' THEN 1 WHEN 'independiente' THEN 1
    WHEN 'business' THEN 2 WHEN 'despacho' THEN 2
    WHEN 'enterprise' THEN 3 WHEN 'firma' THEN 3
  END,
  billing_interval;

-- ============================================================================
-- RESUMEN POR TIPO
-- ============================================================================

-- Empresas
SELECT 
  '📊 EMPRESAS' as tipo,
  code,
  icon,
  icon_color,
  COUNT(*) as total_planes,
  ARRAY_AGG(billing_interval ORDER BY billing_interval) as intervalos
FROM core.plans
WHERE plan_type = 'empresa' AND is_active = true
GROUP BY code, icon, icon_color
ORDER BY 
  CASE code 
    WHEN 'starter' THEN 1
    WHEN 'business' THEN 2
    WHEN 'enterprise' THEN 3
  END;

-- Contadores
SELECT 
  '👥 CONTADORES' as tipo,
  code,
  icon,
  icon_color,
  COUNT(*) as total_planes,
  ARRAY_AGG(billing_interval ORDER BY billing_interval) as intervalos
FROM core.plans
WHERE plan_type = 'contador' AND is_active = true
GROUP BY code, icon, icon_color
ORDER BY 
  CASE code 
    WHEN 'independiente' THEN 1
    WHEN 'despacho' THEN 2
    WHEN 'firma' THEN 3
  END;

-- ============================================================================
-- ICONOS CORRECTOS (REFERENCIA)
-- ============================================================================
/*
EMPRESAS:
  🏪 Starter:     ri-store-2-line     (info/azul)
  📈 Business:    ri-line-chart-line  (primary/morado) ⭐
  🏢 Enterprise:  ri-building-line    (warning/dorado)

CONTADORES:
  👥 Independiente: ri-team-line       (info/azul)
  👥👤 Despacho:     ri-group-line      (primary/morado) ⭐
  🏛️ Firma:        ri-building-2-line (warning/dorado)
*/

