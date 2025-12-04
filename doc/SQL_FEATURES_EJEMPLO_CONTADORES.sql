-- ============================================================================
-- FEATURES E ICONOS PARA PLANES DE CONTADORES
-- ============================================================================
-- Estos son los features e iconos que deberían tener los planes de contadores
-- tanto mensuales como anuales
-- ============================================================================

-- ============================================================================
-- PLAN INDEPENDIENTE (para contadores independientes)
-- ============================================================================
UPDATE core.plans
SET 
  features = ARRAY[
    'Hasta 5 empresas',
    '1 usuario contador',
    'Contabilidad completa',
    'Reportes SAT',
    'Libros contables',
    'Soporte por email'
  ]::text[],
  icon = 'ri-team-line',  -- Ícono de 2 personas
  icon_color = 'info',
  description = 'Para contadores que manejan pocos clientes'
WHERE code = 'independiente'
  AND plan_type = 'contador'
  AND is_active = true;

-- ============================================================================
-- PLAN DESPACHO (para despachos contables)
-- ============================================================================
UPDATE core.plans
SET 
  features = ARRAY[
    'Hasta 20 empresas',
    '5 usuarios del despacho',
    'Portal para clientes',
    'Reportes avanzados',
    'Marca blanca',
    'Soporte prioritario'
  ]::text[],
  icon = 'ri-group-line',  -- Ícono de 3 personas
  icon_color = 'primary',
  description = 'Para despachos contables con cartera de clientes',
  is_popular = true  -- Plan recomendado
WHERE code = 'despacho'
  AND plan_type = 'contador'
  AND is_active = true;

-- ============================================================================
-- PLAN FIRMA (para firmas de auditoría)
-- ============================================================================
UPDATE core.plans
SET 
  features = ARRAY[
    'Empresas ilimitadas',
    'Usuarios ilimitados',
    'Consolidación',
    'API completa',
    'Capacitación incluida',
    'Gerente de cuenta'
  ]::text[],
  icon = 'ri-building-2-line',  -- Ícono de edificio/banco
  icon_color = 'warning',
  description = 'Para firmas de auditoría y consultoría',
  button_text = 'Contactar Ventas'
WHERE code = 'firma'
  AND plan_type = 'contador'
  AND is_active = true;

-- ============================================================================
-- VERIFICAR QUE SE APLICARON
-- ============================================================================
SELECT 
  code,
  name,
  billing_interval,
  features
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
-- FEATURES PARA PLANES DE EMPRESA (Referencia)
-- ============================================================================
-- Si también necesitas actualizar los planes de empresa:

-- Plan Starter
UPDATE core.plans
SET 
  features = ARRAY[
    'Hasta 3 usuarios',
    '500 facturas FEL/mes',
    '1 bodega',
    'Punto de Venta (POS)',
    'Inventario básico',
    'Soporte por email'
  ]::text[],
  icon = 'ri-store-2-line',
  icon_color = 'info',
  description = 'Ideal para pequeños negocios que inician su transformación digital',
  button_text = 'Comenzar'
WHERE code = 'starter'
  AND plan_type = 'empresa'
  AND is_active = true;

-- Plan Business
UPDATE core.plans
SET 
  features = ARRAY[
    'Hasta 10 usuarios',
    '2,000 facturas FEL/mes',
    '3 bodegas',
    'Contabilidad completa',
    'Módulo de Bancos',
    'Cuentas por cobrar y pagar',
    'Soporte prioritario'
  ]::text[],
  icon = 'ri-line-chart-line',
  icon_color = 'primary',
  description = 'Para empresas en crecimiento que necesitan más control',
  is_popular = true,  -- Plan recomendado
  button_text = 'Comenzar'
WHERE code = 'business'
  AND plan_type = 'empresa'
  AND is_active = true;

-- Plan Enterprise
UPDATE core.plans
SET 
  features = ARRAY[
    'Usuarios ilimitados',
    'Facturas ilimitadas',
    'Bodegas ilimitadas',
    'Multi-empresa',
    'API e Integraciones',
    'Soporte dedicado 24/7',
    'Gerente de cuenta'
  ]::text[],
  icon = 'ri-building-line',
  icon_color = 'warning',
  description = 'Solución completa para operaciones complejas',
  button_text = 'Contactar Ventas'
WHERE code = 'enterprise'
  AND plan_type = 'empresa'
  AND is_active = true;

-- Verificar planes de empresa
SELECT 
  code,
  name,
  billing_interval,
  features
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

