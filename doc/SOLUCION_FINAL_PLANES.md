# Solución Final: Planes de Precios con Billing Interval

## Problema Original

La página de precios mostraba **6 columnas duplicadas** en la tabla comparativa en lugar de 3.

**Causa**: Existían 6 planes activos por tipo (3 mensuales + 3 anuales) y el frontend mostraba TODOS simultáneamente.

## Solución Implementada

En lugar de eliminar los planes anuales, se implementó un **sistema de filtrado dinámico** que muestra solo los planes correspondientes al intervalo de facturación seleccionado.

### Arquitectura Actualizada

```
Base de Datos (6 planes por tipo):
├── Planes Mensuales (billing_interval='monthly')
│   ├── Starter (price: Q249)
│   ├── Business (price: Q499)
│   └── Enterprise (price: Q832)
└── Planes Anuales (billing_interval='annual')
    ├── Starter (price: Q2,490)
    ├── Business (price: Q4,990)
    └── Enterprise (price: Q8,320)

Frontend (muestra 3 a la vez):
└── Filtra según toggle → Solo muestra monthly O annual
```

## Cambios Realizados

### 1. API: Soporte para Filtrado Opcional
**Archivo**: `server/api/plans/index.get.ts`

```typescript
// Nuevo parámetro opcional
const billingInterval = query.billing_interval as string | undefined

// Aplicar filtro si se especifica
if (billingInterval) {
  queryBuilder = queryBuilder.eq('billing_interval', billingInterval)
}
```

### 2. Frontend: Filtrado Dinámico por Intervalo
**Archivos**: 
- `views/front-pages/landing-page/pricing-plans.vue`
- `pages/front-pages/pricing.vue`

```typescript
const currentPlans = computed(() => {
  // Mapear el toggle del frontend al campo de BD
  const targetInterval = billingPeriod.value === 'yearly' ? 'annual' : 'monthly'
  
  return plans.value
    .filter(p => {
      // Filtrar por tipo (empresa/contador)
      if (p.planType !== pricingTab.value) return false
      
      // Filtrar por intervalo de facturación
      const planInterval = p.billingInterval || p.billingPeriod
      return planInterval === targetInterval
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
})
```

### 3. Cálculo de Precios Actualizado

```typescript
// Para planes anuales, mostrar equivalente mensual
const displayPrice = billingPeriod === 'yearly' 
  ? Math.floor(plan.price / 12)  // Q2,490 / 12 = Q207.50/mes
  : plan.price                    // Q249/mes directo
```

## Resultado Final

### ✅ Antes del Cambio del Usuario
- Toggle Mensual: muestra 3 planes mensuales ✅
- Toggle Anual: muestra 3 planes anuales ✅  
- **Problema**: Al cargar todos, se mostraban 6 columnas

### ✅ Después de la Solución
- Toggle Mensual: muestra **solo** 3 planes mensuales ✅
- Toggle Anual: muestra **solo** 3 planes anuales ✅
- **Solución**: Filtrado dinámico muestra 3 columnas siempre

## Flujo de Usuario

1. Usuario visita la página de precios
2. Ve 3 planes con toggle en "Anual" (por defecto)
3. Precios mostrados:
   - Starter: Q207/mes (Q2,490/año)
   - Business: Q416/mes (Q4,990/año)
   - Enterprise: Q693/mes (Q8,320/año)
4. Usuario cambia a "Mensual"
5. Los planes se **recargan instantáneamente**:
   - Starter: Q249/mes
   - Business: Q499/mes
   - Enterprise: Q832/mes

## Verificación

### En la Base de Datos

#### 1. Verificar Estructura de Planes
```sql
-- Verificar estructura correcta
SELECT 
  code, 
  plan_type, 
  billing_interval, 
  price,
  display_order,
  array_length(features, 1) as num_features
FROM core.plans
WHERE is_active = true AND plan_type = 'empresa'
ORDER BY billing_interval, display_order;

-- Resultado esperado: 6 filas (3 monthly + 3 annual)
-- Cada plan debe tener features poblados
```

#### 2. Sincronizar Features entre Mensuales y Anuales
Los planes anuales DEBEN tener los mismos features que sus equivalentes mensuales:

```sql
-- Copiar features de planes mensuales a anuales
UPDATE core.plans annual
SET 
  features = monthly.features,
  description = monthly.description,
  icon = monthly.icon,
  icon_color = monthly.icon_color,
  is_popular = monthly.is_popular
FROM core.plans monthly
WHERE annual.code = monthly.code
  AND annual.plan_type = monthly.plan_type
  AND annual.billing_interval = 'annual'
  AND monthly.billing_interval = 'monthly'
  AND annual.is_active = true
  AND monthly.is_active = true;
```

**Scripts disponibles:**
- `SQL_SINCRONIZAR_FEATURES_PLANES.sql`: Sincroniza automáticamente los features
- `SQL_FEATURES_EJEMPLO_CONTADORES.sql`: Ejemplos de features para actualizar manualmente

### En la Interfaz
1. ✅ Solo 3 columnas en la tabla comparativa
2. ✅ Toggle cambia los planes correctamente
3. ✅ Precios se muestran adecuadamente:
   - Mensual: precio directo por mes
   - Anual: precio mensual equivalente + total anual + ahorro

## Ventajas de Esta Solución

1. **Mantiene los 6 planes en BD** → Mayor flexibilidad para precios diferentes
2. **Filtrado en tiempo real** → Sin recarga de página
3. **Código más limpio** → No se requieren cálculos complejos
4. **Escalable** → Fácil agregar más intervalos (trimestral, etc.)
5. **Consistente** → Misma lógica en landing page y página de precios

## Archivos Modificados

### Código
```
✅ server/api/plans/index.get.ts
   - Agregado soporte para filtrar por billing_interval
   - Agregado campo billingInterval en respuesta

✅ views/front-pages/landing-page/pricing-plans.vue
   - Actualizado computed currentPlans con filtrado por intervalo
   - Actualizado cálculo de precios para planes anuales

✅ pages/front-pages/pricing.vue  
   - Actualizado computed currentPlans con filtrado por intervalo
   - Actualizado función getDisplayPrice
```

### Documentación y Scripts SQL
```
📄 ESTRUCTURA_PLANES_ACTUALIZADOS.md
   - Documentación completa de la nueva arquitectura

📄 SQL_SINCRONIZAR_FEATURES_PLANES.sql
   - Script para copiar features de planes mensuales a anuales

📄 SQL_FEATURES_EJEMPLO_CONTADORES.sql
   - Ejemplos de features para planes de contadores y empresas

📄 SQL_VERIFICAR_PLANES_DUPLICADOS.sql
   - Script para verificar la estructura de planes en BD
```

## ⚠️ Importante: Sincronización de Features

Los planes mensuales y anuales **deben tener los mismos features** para mantener consistencia en la interfaz.

### Problema Común
Si los planes anuales no muestran características (features), es porque el campo `features` está vacío o NULL en la base de datos.

### Solución Rápida
Ejecuta este comando SQL para sincronizar:

```sql
-- Copiar features de mensuales a anuales
UPDATE core.plans annual
SET features = monthly.features
FROM core.plans monthly
WHERE annual.code = monthly.code
  AND annual.plan_type = monthly.plan_type
  AND annual.billing_interval = 'annual'
  AND monthly.billing_interval = 'monthly'
  AND annual.is_active = true;
```

### Features Recomendados

**Contadores - Plan Independiente:**
- Hasta 5 empresas
- 1 usuario contador
- Contabilidad completa
- Reportes SAT
- Libros contables
- Soporte por email

**Contadores - Plan Despacho:**
- Hasta 20 empresas
- 5 usuarios del despacho
- Portal para clientes
- Reportes avanzados
- Marca blanca
- Soporte prioritario

**Contadores - Plan Firma:**
- Empresas ilimitadas
- Usuarios ilimitados
- Consolidación
- API completa
- Capacitación incluida
- Gerente de cuenta

## Conclusión

La solución elimina las columnas duplicadas mediante **filtrado inteligente** en el frontend, manteniendo la flexibilidad de tener precios independientes para cada intervalo de facturación en la base de datos.

**Estado**: ✅ IMPLEMENTADO Y LISTO PARA USAR

**Nota**: Asegúrate de sincronizar los features ejecutando `SQL_SINCRONIZAR_FEATURES_PLANES.sql`

