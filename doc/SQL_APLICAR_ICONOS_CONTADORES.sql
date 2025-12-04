-- ============================================================================
-- APLICAR ICONOS Y COLORES EXACTOS A PLANES DE CONTADORES
-- ============================================================================
-- Basado en la imagen proporcionada por el usuario
-- ============================================================================

-- 1. Plan Independiente (2 personas - azul)
UPDATE core.plans
SET 
  icon = 'ri-team-line',
  icon_color = 'info',
  updated_at = NOW()
WHERE code = 'independiente'
  AND plan_type = 'contador'
  AND is_active = true;

-- 2. Plan Despacho (3 personas - morado) - RECOMENDADO
UPDATE core.plans
SET 
  icon = 'ri-group-line',
  icon_color = 'primary',
  is_popular = true,
  updated_at = NOW()
WHERE code = 'despacho'
  AND plan_type = 'contador'
  AND is_active = true;

-- 3. Plan Firma (edificio - dorado)
UPDATE core.plans
SET 
  icon = 'ri-building-2-line',
  icon_color = 'warning',
  updated_at = NOW()
WHERE code = 'firma'
  AND plan_type = 'contador'
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
    WHEN code = 'independiente' AND icon = 'ri-team-line' AND icon_color = 'info' THEN '✅'
    WHEN code = 'despacho' AND icon = 'ri-group-line' AND icon_color = 'primary' AND is_popular = true THEN '✅'
    WHEN code = 'firma' AND icon = 'ri-building-2-line' AND icon_color = 'warning' THEN '✅'
    ELSE '❌'
  END as correcto
FROM core.plans
WHERE plan_type = 'contador'
  AND is_active = true
ORDER BY 
  CASE code 
    WHEN 'independiente' THEN 1
    WHEN 'despacho' THEN 2
    WHEN 'firma' THEN 3
  END,
  billing_interval;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Todos los planes (monthly y annual) deben mostrar:
-- ✅ independiente: ri-team-line (info/azul)
-- ✅ despacho: ri-group-line (primary/morado) + is_popular=true
-- ✅ firma: ri-building-2-line (warning/dorado)
-- ============================================================================

