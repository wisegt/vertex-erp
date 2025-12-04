# Iconos y Colores de Planes

## Planes de Contadores

### Plan Independiente
- **Código**: `independiente`
- **Ícono**: `ri-team-line` (👥 2 personas)
- **Color**: `info` (azul claro)
- **Descripción**: Para contadores que manejan pocos clientes
- **Botón**: "Comenzar"

### Plan Despacho ⭐ (Recomendado)
- **Código**: `despacho`
- **Ícono**: `ri-group-line` (👥👤 3 personas)
- **Color**: `primary` (morado)
- **Descripción**: Para despachos contables con cartera de clientes
- **Botón**: "Comenzar"
- **Popular**: `true`

### Plan Firma
- **Código**: `firma`
- **Ícono**: `ri-building-2-line` (🏛️ edificio/banco)
- **Color**: `warning` (amarillo/dorado)
- **Descripción**: Para firmas de auditoría y consultoría
- **Botón**: "Contactar Ventas"

---

## Planes de Empresa

### Plan Starter
- **Código**: `starter`
- **Ícono**: `ri-store-2-line` (🏪 tienda)
- **Color**: `info` (azul claro)
- **Descripción**: Ideal para pequeños negocios que inician su transformación digital
- **Botón**: "Comenzar"

### Plan Business ⭐ (Recomendado)
- **Código**: `business`
- **Ícono**: `ri-line-chart-line` (📈 gráfica crecimiento)
- **Color**: `primary` (morado)
- **Descripción**: Para empresas en crecimiento que necesitan más control
- **Botón**: "Comenzar"
- **Popular**: `true`

### Plan Enterprise
- **Código**: `enterprise`
- **Ícono**: `ri-building-line` (🏢 edificio corporativo)
- **Color**: `warning` (amarillo/dorado)
- **Descripción**: Solución completa para operaciones complejas
- **Botón**: "Contactar Ventas"

---

## Colores de Vuetify

Los colores disponibles en Vuetify para `icon_color`:

| Color | Nombre | Uso Recomendado |
|-------|--------|-----------------|
| `primary` | Morado | Planes recomendados |
| `info` | Azul claro | Planes básicos/iniciales |
| `success` | Verde | - |
| `warning` | Amarillo/Dorado | Planes premium/enterprise |
| `error` | Rojo | - |
| `secondary` | Gris | - |

---

## Iconos Remix Icon

Todos los iconos usan la librería **Remix Icon** con el prefijo `ri-`.

### Iconos de Personas/Equipos
- `ri-user-line` - 1 persona
- `ri-team-line` - 2 personas
- `ri-group-line` - 3+ personas

### Iconos de Negocios
- `ri-store-line` - Tienda simple
- `ri-store-2-line` - Tienda con toldo
- `ri-building-line` - Edificio corporativo
- `ri-building-2-line` - Edificio tipo banco
- `ri-building-4-line` - Edificio de oficinas

### Iconos de Crecimiento
- `ri-line-chart-line` - Gráfica lineal
- `ri-bar-chart-line` - Gráfica de barras
- `ri-pie-chart-line` - Gráfica circular

### Otros
- `ri-briefcase-line` - Maletín
- `ri-home-office-line` - Oficina en casa
- `ri-community-line` - Comunidad

---

## Script SQL Rápido

Para actualizar todos los planes con los iconos correctos:

```sql
-- CONTADORES
UPDATE core.plans SET icon = 'ri-team-line', icon_color = 'info' 
WHERE code = 'independiente' AND plan_type = 'contador';

UPDATE core.plans SET icon = 'ri-group-line', icon_color = 'primary', is_popular = true 
WHERE code = 'despacho' AND plan_type = 'contador';

UPDATE core.plans SET icon = 'ri-building-2-line', icon_color = 'warning' 
WHERE code = 'firma' AND plan_type = 'contador';

-- EMPRESAS
UPDATE core.plans SET icon = 'ri-store-2-line', icon_color = 'info' 
WHERE code = 'starter' AND plan_type = 'empresa';

UPDATE core.plans SET icon = 'ri-line-chart-line', icon_color = 'primary', is_popular = true 
WHERE code = 'business' AND plan_type = 'empresa';

UPDATE core.plans SET icon = 'ri-building-line', icon_color = 'warning' 
WHERE code = 'enterprise' AND plan_type = 'empresa';
```

---

## Verificación Visual

Después de aplicar los cambios, los planes deben verse así:

### Contadores (Mensual y Anual)
```
[👥]  Independiente   Q199/mes    [🔵 Azul claro]
[👥👤] Despacho ⭐      Q499/mes    [🟣 Morado]
[🏛️]  Firma           Q899/mes    [🟡 Dorado]
```

### Empresas (Mensual y Anual)
```
[🏪] Starter      Q249/mes    [🔵 Azul claro]
[📈] Business ⭐   Q499/mes    [🟣 Morado]
[🏢] Enterprise   Q832/mes    [🟡 Dorado]
```

