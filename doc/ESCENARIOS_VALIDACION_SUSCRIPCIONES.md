# 🔍 Escenarios de Validación de Suscripciones

## 📋 Campos Únicos a Validar

### 1. **NIT (Número de Identificación Tributaria)**
- ✅ Debe ser único por suscripción activa
- ✅ Una empresa con el mismo NIT NO puede tener múltiples suscripciones activas
- ✅ Formato: Sin guiones ni espacios (ej: `12345678` en lugar de `1234567-8`)

### 2. **Email**
- ✅ Debe ser único por suscripción activa
- ✅ Un email NO puede estar asociado a múltiples suscripciones activas
- ⚠️ El mismo email puede renovar o cambiar de plan (cancelando el anterior)

### 3. **Nombre de Empresa**
- ⚠️ NO es único (solo advertencia)
- Pueden existir empresas con nombres similares
- Solo se muestra una advertencia si ya existe

## 🎯 Escenarios Posibles

### Escenario 1: NIT ya tiene suscripción activa
```
Usuario intenta suscribirse con NIT: 12345678
Base de datos: NIT 12345678 ya tiene suscripción ACTIVE
```

**Resultado:**
- ❌ **Bloquear el pago**
- 🔴 **Mensaje:** "El NIT 12345678 ya tiene una suscripción activa registrada a nombre de 'Empresa XYZ, S.A.'. Si deseas cambiar de plan, cancela la suscripción actual primero."
- 💡 **Acción sugerida:** "Iniciar sesión" o "Contactar soporte"

### Escenario 2: Email ya tiene suscripción activa
```
Usuario intenta suscribirse con email: factura@empresa.com
Base de datos: factura@empresa.com ya tiene suscripción ACTIVE
```

**Resultado:**
- ❌ **Bloquear el pago**
- 🔴 **Mensaje:** "El correo factura@empresa.com ya está asociado a una suscripción activa. Si deseas gestionar tu suscripción, inicia sesión con esta cuenta."
- 💡 **Acciones:**
  - Botón "Iniciar sesión"
  - Botón "¿Olvidaste tu contraseña?"

### Escenario 3: Mismo NIT y Email (misma empresa intentando duplicar)
```
Usuario intenta suscribirse con:
- NIT: 12345678
- Email: factura@empresa.com

Base de datos: Ambos ya existen en una suscripción ACTIVE
```

**Resultado:**
- ❌ **Bloquear el pago**
- 🔴 **Mensaje:** "Ya tienes una suscripción activa. Inicia sesión para gestionar tu cuenta."
- 💡 **Redireccionar a:** Página de login con opción de recuperar contraseña

### Escenario 4: NIT diferente pero mismo Email
```
Usuario intenta suscribirse con:
- NIT: 87654321 (nuevo)
- Email: usuario@gmail.com (ya existe)
```

**Resultado:**
- ❌ **Bloquear el pago**
- 🔴 **Mensaje:** "El correo usuario@gmail.com ya está registrado con otro NIT. Si deseas usar otra empresa, utiliza un correo diferente."
- 💡 **Posibles razones:**
  - El usuario ya tiene una empresa registrada
  - Quiere registrar una segunda empresa (debe usar otro email)

### Escenario 5: Mismo NIT pero Email diferente
```
Usuario intenta suscribirse con:
- NIT: 12345678 (ya existe)
- Email: nuevo@empresa.com (nuevo)
```

**Resultado:**
- ❌ **Bloquear el pago**
- 🔴 **Mensaje:** "El NIT 12345678 ya está registrado con otro correo electrónico. Una empresa solo puede tener una suscripción activa."
- 💡 **Posibles razones:**
  - Cambio de persona de contacto (deben cancelar suscripción anterior)
  - Error en el NIT (verificar)

### Escenario 6: Nombre de empresa similar (pero NIT y email diferentes)
```
Usuario intenta suscribirse con:
- Empresa: "Tecnología S.A."
- NIT: 11111111 (nuevo)
- Email: tech@empresa.com (nuevo)

Base de datos: Ya existe "Tecnologia SA" (similar)
```

**Resultado:**
- ⚠️ **Permitir pero advertir**
- 🟡 **Mensaje:** "Ya existe una empresa con nombre similar registrada. Si es la misma empresa, verifica que el NIT y correo sean los correctos."
- ✅ **Puede continuar con el pago**

### Escenario 7: Suscripción cancelada o expirada (mismo NIT/Email)
```
Usuario intenta suscribirse con:
- NIT: 12345678
- Email: factura@empresa.com

Base de datos: Suscripción con status CANCELLED o EXPIRED
```

**Resultado:**
- ✅ **Permitir renovación**
- 🟢 **Mensaje:** "Bienvenido de vuelta. Estás renovando tu suscripción."
- 💡 **Bonus:** Ofrecer un descuento de bienvenida

### Escenario 8: Suscripción en período de prueba (trial)
```
Usuario intenta suscribirse con:
- NIT: 12345678
- Email: factura@empresa.com

Base de datos: Suscripción con status TRIALING
```

**Resultado:**
- ❌ **Bloquear el pago**
- 🔴 **Mensaje:** "Ya tienes un período de prueba activo. Puedes actualizar a un plan de pago desde tu panel de control."
- 💡 **Botón:** "Ir al Dashboard"

### Escenario 9: Suscripción con pago pendiente (past_due)
```
Usuario intenta suscribirse con:
- NIT: 12345678
- Email: factura@empresa.com

Base de datos: Suscripción con status PAST_DUE
```

**Resultado:**
- ❌ **Bloquear nueva suscripción**
- 🔴 **Mensaje:** "Tu suscripción tiene un pago pendiente. Por favor, actualiza tu método de pago desde tu panel de control."
- 💡 **Botones:**
  - "Actualizar método de pago"
  - "Contactar soporte"

## 🗄️ Estructura de Base de Datos Sugerida

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES users(id),
  
  -- Datos de facturación (únicos)
  business_name VARCHAR(255) NOT NULL,
  nit VARCHAR(50) NOT NULL UNIQUE, -- Único en suscripciones activas
  email VARCHAR(255) NOT NULL UNIQUE, -- Único en suscripciones activas
  phone VARCHAR(50),
  phone_code VARCHAR(10) DEFAULT '+502',
  address TEXT,
  
  -- Datos de suscripción
  plan_code VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL, -- active, trialing, past_due, cancelled, expired
  recurrente_subscription_id VARCHAR(100),
  recurrente_payment_method_id VARCHAR(100), -- Token de la tarjeta
  
  -- Fechas
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Metadata
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices para búsquedas rápidas
  CONSTRAINT unique_active_nit UNIQUE (nit) WHERE status IN ('active', 'trialing', 'past_due'),
  CONSTRAINT unique_active_email UNIQUE (email) WHERE status IN ('active', 'trialing', 'past_due')
);
```

## 🔧 Implementación en el Endpoint

```typescript
// server/api/subscription/check-duplicates.post.ts

// 1. Verificar NIT con suscripción activa
const { data: nitSub } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('nit', nit)
  .in('status', ['active', 'trialing', 'past_due'])
  .single()

if (nitSub) {
  if (nitSub.status === 'trialing') {
    errors.push('Ya tienes un período de prueba activo.')
  } else if (nitSub.status === 'past_due') {
    errors.push('Tu suscripción tiene un pago pendiente.')
  } else {
    errors.push(`El NIT ${nit} ya tiene una suscripción activa.`)
  }
}

// 2. Verificar Email con suscripción activa
const { data: emailSub } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('email', email)
  .in('status', ['active', 'trialing', 'past_due'])
  .single()

if (emailSub) {
  errors.push(`El correo ${email} ya está asociado a una suscripción activa.`)
}
```

## 📊 Matriz de Decisiones

| NIT | Email | Nombre | Acción |
|-----|-------|--------|--------|
| ✅ Nuevo | ✅ Nuevo | ✅ Nuevo | ✅ **PERMITIR** - Nueva suscripción |
| ❌ Existe | ❌ Existe | - | ❌ **BLOQUEAR** - Misma empresa |
| ❌ Existe | ✅ Nuevo | - | ❌ **BLOQUEAR** - NIT ya registrado |
| ✅ Nuevo | ❌ Existe | - | ❌ **BLOQUEAR** - Email ya registrado |
| ✅ Nuevo | ✅ Nuevo | ⚠️ Similar | ⚠️ **ADVERTIR** - Nombre similar |
| ❌ Cancelado | ❌ Cancelado | - | ✅ **PERMITIR** - Renovación |

## 💡 Mejores Prácticas

### Para el Usuario:
1. **Mensajes claros** sobre por qué no puede proceder
2. **Acciones específicas** (Iniciar sesión, Contactar soporte, etc.)
3. **Opción de recuperar contraseña** si ya tiene cuenta
4. **Descuento de reactivación** si viene de suscripción cancelada

### Para el Sistema:
1. **Validar en el servidor** (no solo en el cliente)
2. **Índices únicos condicionales** en la base de datos
3. **Logs detallados** de intentos de duplicados
4. **Rate limiting** para evitar spam de intentos

## 🎯 Flujo Recomendado

```
Usuario completa formulario
    ↓
Click en "Cargar formulario"
    ↓
Verificar duplicados (API)
    ↓
¿Duplicado encontrado?
    ├─ SÍ → Mostrar error + Botón "Iniciar sesión"
    └─ NO → Crear checkout → Mostrar formulario de pago
```

Esta documentación está lista para implementar en `server/api/subscription/check-duplicates.post.ts` cuando conectes con Supabase.

