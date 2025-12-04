-- ============================================================================
-- SINCRONIZAR FEATURES DE PLANES ANUALES
-- ============================================================================
-- Este script copia los features de los planes mensuales a los planes anuales
-- para que ambos muestren las mismas características en la interfaz
-- ============================================================================

-- PASO 1: Ver los features actuales de planes mensuales y anuales
SELECT 
  code,
  plan_type,
  billing_interval,
  name,
  features
FROM core.plans
WHERE is_active = true
ORDER BY plan_type, code, billing_interval;

-- PASO 2: Sincronizar features, iconos y descripción de planes mensuales a anuales
-- Los planes anuales deben tener EXACTAMENTE las mismas características visuales
-- que sus equivalentes mensuales (solo cambia el precio)

UPDATE core.plans annual
SET 
  features = monthly.features,           -- ✅ Características del plan
  description = monthly.description,     -- ✅ Descripción
  icon = monthly.icon,                   -- ✅ Ícono (ej: ri-team-line)
  icon_color = monthly.icon_color,       -- ✅ Color del ícono (ej: primary, info, warning)
  button_text = monthly.button_text,     -- ✅ Texto del botón
  is_popular = monthly.is_popular,       -- ✅ Si es el plan recomendado
  limits = monthly.limits,               -- ✅ Límites del plan
  updated_at = NOW()
FROM core.plans monthly
WHERE annual.code = monthly.code
  AND annual.plan_type = monthly.plan_type
  AND annual.billing_interval = 'annual'
  AND monthly.billing_interval = 'monthly'
  AND annual.is_active = true
  AND monthly.is_active = true;

-- PASO 3: Verificar que los features se copiaron correctamente
SELECT 
  code,
  plan_type,
  billing_interval,
  name,
  array_length(features, 1) as num_features,
  features
FROM core.plans
WHERE is_active = true
ORDER BY plan_type, code, billing_interval;

-- PASO 4: Verificar que los features coincidan entre monthly y annual
SELECT 
  m.code,
  m.plan_type,
  array_length(m.features, 1) as monthly_features,
  array_length(a.features, 1) as annual_features,
  CASE 
    WHEN m.features = a.features THEN '✅ Iguales'
    ELSE '❌ Diferentes'
  END as status
FROM core.plans m
LEFT JOIN core.plans a ON 
  m.code = a.code 
  AND m.plan_type = a.plan_type 
  AND a.billing_interval = 'annual'
WHERE m.billing_interval = 'monthly'
  AND m.is_active = true
ORDER BY m.plan_type, m.code;

-- ============================================================================
-- VERIFICACIÓN VISUAL
-- ============================================================================

-- Ver features e iconos lado a lado para planes de empresa
SELECT 
  code,
  CASE 
    WHEN billing_interval = 'monthly' THEN 'MENSUAL'
    WHEN billing_interval = 'annual' THEN 'ANUAL'
  END as periodo,
  icon,
  icon_color,
  is_popular,
  array_length(features, 1) as num_features,
  features
FROM core.plans
WHERE is_active = true 
  AND plan_type = 'empresa'
ORDER BY code, billing_interval;

-- Ver features e iconos lado a lado para planes de contador
SELECT 
  code,
  CASE 
    WHEN billing_interval = 'monthly' THEN 'MENSUAL'
    WHEN billing_interval = 'annual' THEN 'ANUAL'
  END as periodo,
  icon,
  icon_color,
  is_popular,
  array_length(features, 1) as num_features,
  features
FROM core.plans
WHERE is_active = true 
  AND plan_type = 'contador'
ORDER BY code, billing_interval;

-- ============================================================================
-- VERIFICACIÓN DE ICONOS
-- ============================================================================

-- Los planes mensuales y anuales deben tener los mismos iconos
SELECT 
  m.code,
  m.plan_type,
  m.icon as icon_mensual,
  a.icon as icon_anual,
  CASE 
    WHEN m.icon = a.icon THEN '✅ Iguales'
    ELSE '❌ Diferentes'
  END as estado_icon,
  m.icon_color as color_mensual,
  a.icon_color as color_anual,
  CASE 
    WHEN m.icon_color = a.icon_color THEN '✅ Iguales'
    ELSE '❌ Diferentes'
  END as estado_color
FROM core.plans m
LEFT JOIN core.plans a ON 
  m.code = a.code 
  AND m.plan_type = a.plan_type 
  AND a.billing_interval = 'annual'
WHERE m.billing_interval = 'monthly'
  AND m.is_active = true
ORDER BY m.plan_type, m.code;

-- ============================================================================
-- NOTAS
-- ============================================================================
-- Este script sincroniza:
-- ✅ features (características del plan)
-- ✅ description (descripción)
-- ✅ icon (ícono del plan)
-- ✅ icon_color (color del ícono)
-- ✅ button_text (texto del botón)
-- ✅ is_popular (si es el plan recomendado)
-- ✅ limits (límites del plan)
--
-- El único campo que DEBE ser diferente es:
-- - price (precio mensual vs precio anual)
-- ============================================================================

