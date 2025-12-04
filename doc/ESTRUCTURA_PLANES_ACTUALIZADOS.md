# Estructura Actualizada de Planes de Precios

## Nueva Arquitectura de Base de Datos

La estructura de planes ha sido actualizada para mantener **registros separados** para planes mensuales y anuales.

### Características de la Nueva Estructura

1. **Planes Mensuales y Anuales Separados**
   - 3 planes mensuales: Starter, Business, Enterprise (`billing_interval='monthly'`)
   - 3 planes anuales: Starter, Business, Enterprise (`billing_interval='annual'`)
   - Total: 6 planes activos por tipo (empresa/contador)

2. **Campos Clave**
   - `code`: Identificador del plan (ej: "starter", "business", "enterprise")
   - `billing_interval`: `'monthly'` o `'annual'`
   - `price`: Precio directo del plan
     - Planes mensuales: precio por mes (ej: Q299)
     - Planes anuales: precio total anual (ej: Q2,990 = 10 meses)
   - `display_order`: 1-3 dentro de cada grupo para ordenamiento

3. **Normalización**
   - Cada grupo (monthly/annual) tiene `display_order` del 1-3
   - Los planes con el mismo `code` tienen diferentes `billing_interval`

## Ejemplo de Estructura en BD

| code | name | plan_type | billing_interval | price | display_order |
|------|------|-----------|------------------|-------|---------------|
| starter | Starter | empresa | monthly | 249.00 | 1 |
| business | Business | empresa | monthly | 499.00 | 2 |
| enterprise | Enterprise | empresa | monthly | 832.00 | 3 |
| starter | Starter | empresa | annual | 2490.00 | 1 |
| business | Business | empresa | annual | 4990.00 | 2 |
| enterprise | Enterprise | empresa | annual | 8320.00 | 3 |

## Cambios Implementados en el Código

### 1. API de Planes (`server/api/plans/index.get.ts`)

**Nuevo Parámetro**: `billing_interval` (opcional)

```typescript
// Filtrar por billing_interval si se especifica
if (billingInterval) {
  queryBuilder = queryBuilder.eq('billing_interval', billingInterval)
}
```

**Uso**:
- Sin parámetro: devuelve TODOS los planes (mensuales y anuales)
- Con parámetro: devuelve solo planes de ese intervalo
  - `/api/plans?billing_interval=monthly` → Solo planes mensuales
  - `/api/plans?billing_interval=annual` → Solo planes anuales

### 2. Componente Landing Page (`views/front-pages/landing-page/pricing-plans.vue`)

**Filtrado Dinámico**:

```typescript
const currentPlans = computed(() => {
  // Mapear el billingPeriod del frontend al billing_interval de la BD
  const targetInterval = billingPeriod.value === 'yearly' ? 'annual' : 'monthly'
  
  return plans.value
    .filter(p => {
      // Filtrar por tipo de plan (empresa/contador)
      if (p.planType !== pricingTab.value) return false
      
      // Filtrar por intervalo de facturación
      const planInterval = p.billingInterval || p.billingPeriod
      return planInterval === targetInterval
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
})
```

**Lógica de Precio**:

```typescript
// Para planes anuales, mostrar precio mensual equivalente
formatCurrency(
  billingPeriod === 'yearly' 
    ? Math.floor(plan.price / 12)  // Dividir precio anual entre 12
    : plan.price                    // Mostrar precio mensual directo
)
```

### 3. Página de Precios (`pages/front-pages/pricing.vue`)

Se aplicó la misma lógica de filtrado y cálculo de precios.

## Flujo de Funcionamiento

### Carga Inicial
1. El frontend carga TODOS los planes desde `/api/plans`
2. Se cargan 6 planes por tipo (3 monthly + 3 annual)

### Cuando el Usuario Cambia el Toggle
1. El usuario cambia entre "Mensual" y "Anual"
2. `billingPeriod` se actualiza a `'monthly'` o `'yearly'`
3. El computed `currentPlans` filtra automáticamente:
   - Si `billingPeriod === 'monthly'` → Muestra solo planes con `billing_interval='monthly'`
   - Si `billingPeriod === 'yearly'` → Muestra solo planes con `billing_interval='annual'`
4. Se muestran solo 3 planes (los correspondientes al intervalo seleccionado)

### Cálculo de Precios

#### Modo Mensual
- Se muestra directamente `plan.price`
- Ejemplo: Q249.00/mes

#### Modo Anual
- Se muestra `Math.floor(plan.price / 12)` como precio mensual equivalente
- Se muestra `plan.price` como total anual
- Se calcula el ahorro: `(plan.price / 10) * 2` (equivalente a 2 meses gratis)
- Ejemplo: 
  - Q207.50/mes (equivalente)
  - Q2,490.00/año (total)
  - Ahorras Q498.00

## Ventajas de Esta Arquitectura

1. ✅ **Flexibilidad**: Cada plan puede tener precios completamente independientes
2. ✅ **Claridad**: Los precios están explícitos en la BD, no calculados
3. ✅ **Mantenibilidad**: Fácil actualizar precios individuales
4. ✅ **Performance**: No se requieren cálculos complejos en el frontend
5. ✅ **Escalabilidad**: Fácil agregar nuevos intervalos (trimestral, semestral, etc.)

## Verificación

### En la Base de Datos
```sql
-- Debe retornar 6 planes por tipo
SELECT 
  plan_type, 
  billing_interval, 
  COUNT(*) as total
FROM core.plans
WHERE is_active = true
GROUP BY plan_type, billing_interval
ORDER BY plan_type, billing_interval;

-- Resultado esperado:
-- empresa    | annual  | 3
-- empresa    | monthly | 3
-- contador   | annual  | 3
-- contador   | monthly | 3
```

### En la Interfaz
1. Al cargar la página, debe mostrar **3 planes** (según el toggle seleccionado)
2. Al cambiar el toggle Mensual ↔ Anual:
   - Los planes se **recargan con precios diferentes**
   - Los nombres permanecen iguales (Starter, Business, Enterprise)
   - El `display_order` mantiene el orden consistente

## Migración desde la Estructura Anterior

Si necesitas migrar desde la estructura anterior donde había un solo registro por plan con campos `price` y `yearly_price`:

```sql
-- 1. Actualizar planes existentes (monthly)
UPDATE core.plans
SET billing_interval = 'monthly'
WHERE billing_interval IS NULL OR billing_interval = '';

-- 2. Crear planes anuales duplicando los mensuales
INSERT INTO core.plans (
  code, name, plan_type, billing_interval, price, 
  description, features, limits, display_order, 
  is_popular, button_text, icon, icon_color, is_active
)
SELECT 
  code, name, plan_type, 'annual' as billing_interval, 
  yearly_price as price,  -- El precio anual se convierte en el precio principal
  description, features, limits, display_order,
  is_popular, button_text, icon, icon_color, is_active
FROM core.plans
WHERE billing_interval = 'monthly' AND yearly_price IS NOT NULL;
```

## Notas Importantes

- 🔄 El frontend ahora **filtra** los planes en lugar de calcular precios
- 💰 Cada plan tiene su **precio directo** en la BD
- 🎯 La tabla comparativa muestra solo **3 columnas** (según el intervalo seleccionado)
- ⚡ Los cambios son **instantáneos** al cambiar el toggle (sin recarga de datos)

