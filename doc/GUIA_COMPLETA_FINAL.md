# 🎯 Guía Completa Final - Sistema de Pagos y Suscripciones

## 📋 Resumen de Todo lo Implementado

### ✅ Sistema de Pagos con Recurrente
- Formulario embedido de tarjeta (PCI compliant)
- Soporte para planes mensuales y anuales
- Descuentos automáticos (20% en planes anuales)
- Cálculo de IVA (12%)
- Selector de país con banderas para teléfono
- Formato automático de NIT (sin guiones)
- Validación de duplicados (NIT/email)
- Ícono genérico de tarjeta (no solo Visa)

### ✅ Sistema de Registro Post-Pago
- Flujo diferenciado para usuarios autenticados vs no autenticados
- Email automático con link para crear cuenta
- Tokens seguros con expiración de 24 horas
- Página de setup de cuenta
- Hash de contraseñas con bcrypt
- Vinculación automática usuario-tenant

### ✅ Integración con Base de Datos
- Webhook actualizado para guardar en tus tablas
- Endpoint alternativo para localhost (sin webhook)
- Mapeo completo a tu estructura ERD
- Separación de datos (super admins no ven billing)
- Validaciones de duplicados reales

## 🗄️ Cambios Necesarios en la Base de Datos

### 1. Crear tabla `account_setup_tokens`

Ejecuta en Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS account_setup_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  checkout_id VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_account_setup_tokens_email ON account_setup_tokens(email);
CREATE INDEX idx_account_setup_tokens_token ON account_setup_tokens(token);
CREATE INDEX idx_account_setup_tokens_checkout ON account_setup_tokens(checkout_id);
```

### 2. Verificar que existan las tablas necesarias

Tu diagrama ERD muestra que ya tienes:
- ✅ `tenants`
- ✅ `users`
- ✅ `plans`
- ✅ `subscriptions`
- ✅ `subscription_payments`

**Solo necesitas agregar `account_setup_tokens`**

## 🔑 Variables de Entorno Requeridas

Agrega al archivo `.env`:

```env
# Recurrente Payment Gateway
RECURRENTE_PUBLIC_KEY=pk_test_tu_llave_aqui
RECURRENTE_SECRET_KEY=sk_test_tu_llave_aqui

# Resend Email Service
RESEND_API_KEY=re_tu_api_key_aqui

# URL pública del sitio
NUXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase (si no las tienes)
NUXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

## 📝 Cómo Obtener las API Keys

### Recurrente
1. Ve a https://app.recurrente.com
2. Sign up / Login
3. Settings → API Keys
4. Copia Public Key y Secret Key

### Resend
1. Ve a https://resend.com
2. Sign up (gratis)
3. Dashboard → API Keys → Create
4. Copia la API key (empieza con `re_`)

### Supabase
1. Ve a https://supabase.com/dashboard
2. Tu proyecto → Settings → API
3. Copia URL, anon key y service_role key

## 🔄 Flujos Completos

### 🟢 Flujo A: Usuario Nuevo (SIN cuenta)

```mermaid
Usuario sin cuenta
    ↓
1. Va a /payment (público)
    ↓
2. Selecciona plan
    ↓
3. Completa datos de facturación
    ↓
4. Sistema verifica duplicados
    ↓
5. Click "Cargar formulario de pago"
    ↓
6. Aparece formulario de Recurrente
    ↓
7. Ingresa tarjeta y paga
    ↓
8. Redirige a /payment-success
    ↓
9. Sistema crea:
   - Tenant (empresa)
   - Suscripción
   - Token de setup
    ↓
10. Envía email con link
    ↓
11. Botón: "Crear mi cuenta"
    ↓
12. Usuario hace click
    ↓
13. Página /setup-account
    ↓
14. Ingresa: nombre, apellido, contraseña
    ↓
15. Sistema crea usuario vinculado al tenant
    ↓
16. Redirige a /login
    ↓
17. Usuario inicia sesión
    ↓
18. Accede al dashboard ✅
```

### 🔵 Flujo B: Usuario Existente (CON cuenta)

```mermaid
Usuario con cuenta
    ↓
1. Login
    ↓
2. Va a /payment
    ↓
3. Datos pre-llenados de su tenant
    ↓
4. Selecciona plan y paga
    ↓
5. Redirige a /payment-success
    ↓
6. Contador de 5 segundos
    ↓
7. Redirige automáticamente al dashboard ✅
```

### 🔴 Flujo C: Super Admin

```mermaid
Super Admin
    ↓
1. Login
    ↓
2. Va a Billing & Plans
    ↓
3. Mensaje: "Super admins no tienen datos de facturación"
    ↓
4. NO ve datos de otros tenants ✅
```

## 🧪 Guía de Pruebas

### Test 1: Pago sin cuenta

```bash
# 1. Cierra sesión (logout)
# 2. Ve a http://localhost:3000/payment
# 3. Completa todos los campos:
   - Empresa: Test Company
   - NIT: 12345678
   - Email: test@empresa.com
   - Teléfono: 22223333
   - Dirección: Zona 10
# 4. Selecciona plan
# 5. Click "Cargar formulario de pago"
# 6. Ingresa tarjeta de prueba: 4242 4242 4242 4242
# 7. Completa el pago
# 8. Verás: "Crear mi cuenta"
# 9. Revisa la consola del servidor para ver el setup URL
# 10. Copia el URL y pégalo en el navegador
# 11. Completa: nombre, apellido, contraseña
# 12. Click "Crear mi cuenta"
# 13. Inicia sesión con el email y contraseña
# 14. ¡Deberías estar en el dashboard!
```

### Test 2: Verificar en Base de Datos

```sql
-- Ver tenant creado
SELECT * FROM tenants WHERE tax_id = '12345678';

-- Ver suscripción creada
SELECT * FROM subscriptions WHERE tenant_id = '...';

-- Ver usuario creado
SELECT * FROM users WHERE email = 'test@empresa.com';

-- Ver token generado
SELECT * FROM account_setup_tokens WHERE email = 'test@empresa.com';
```

### Test 3: Validación de Duplicados

```bash
# 1. Intenta pagar con el mismo NIT otra vez
# 2. Debe mostrar alerta y NO permitir continuar
```

## 📧 Configuración de Email (Importante)

### Modo Desarrollo (sin API key):
- El sistema registra el URL en consola
- Puedes copiar y pegar manualmente el URL
- No se envían emails reales

### Modo Producción (con API key):
1. Crea cuenta en Resend
2. Verifica tu dominio
3. Agrega RESEND_API_KEY al .env
4. Los emails se envían automáticamente

## 🚀 Para Poner en Producción

### 1. Configurar Webhook en Recurrente

1. Ve a https://app.recurrente.com/settings/webhooks
2. Agrega webhook URL: `https://tu-dominio.com/api/recurrente/webhooks`
3. Selecciona eventos:
   - `checkout.payment_completed`
   - `charge.succeeded`
   - `charge.failed`
   - `subscription.cancelled`

### 2. Variables de Entorno en Producción

```env
# Recurrente (keys de producción)
RECURRENTE_PUBLIC_KEY=pk_live_tu_llave
RECURRENTE_SECRET_KEY=sk_live_tu_llave

# Resend
RESEND_API_KEY=re_tu_api_key

# Site URL
NUXT_PUBLIC_SITE_URL=https://vertexerp.app

# Supabase
NUXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 3. Verificar Dominio en Resend

Para enviar desde `noreply@vertexerp.app`:
1. Agregar dominio en Resend
2. Configurar registros DNS (SPF, DKIM, DMARC)
3. Esperar verificación

### 4. Actualizar remitente en el código

En `send-setup-email.post.ts`:
```typescript
from: 'VERTEX ERP <noreply@vertexerp.app>', // Tu dominio verificado
```

## 📚 Documentación Creada

1. **`FLUJO_REGISTRO_POST_PAGO.md`** - Flujo detallado de registro
2. **`CONFIGURACION_RESEND_EMAIL.md`** - Cómo configurar emails
3. **`RESUMEN_INTEGRACION_COMPLETA.md`** - Integración con BD
4. **`ESCENARIOS_VALIDACION_SUSCRIPCIONES.md`** - Validaciones
5. **`SOLUCIONES_IMPLEMENTADAS.md`** - Problemas resueltos
6. **`INTEGRACION_RECURRENTE_CON_BD.md`** - Mapeo de campos

## ✅ Estado Actual

### Lo que funciona AHORA (sin API key de Resend):
- ✅ Pagos con tarjeta
- ✅ Formulario embedido de Recurrente
- ✅ Validaciones de duplicados
- ✅ Creación de tenant + suscripción
- ✅ Página de setup de cuenta
- ✅ Creación de usuario
- ✅ Setup URL en consola (para copiar manualmente)

### Lo que funcionará CON API key de Resend:
- ✅ Todo lo anterior +
- ✅ Email automático al usuario
- ✅ Template HTML profesional
- ✅ No necesitas copiar URLs manualmente

## 🎯 Próximos Pasos

1. **Crear tabla `account_setup_tokens` en Supabase**
   ```sql
   -- Ejecuta el archivo: supabase/migrations/create_account_setup_tokens_table.sql
   ```

2. **Obtener API key de Resend** (5 minutos):
   - https://resend.com → Sign up
   - Dashboard → API Keys → Create
   - Copiar la key

3. **Agregar al .env:**
   ```env
   RESEND_API_KEY=re_tu_key
   ```

4. **Reiniciar servidor:**
   ```bash
   npm run dev
   ```

5. **Probar el flujo completo**

Todo está implementado y listo. Solo necesitas:
1. Crear la tabla en Supabase ✅
2. Obtener API key de Resend ✅
3. Agregar al .env ✅
4. ¡Probar! ✅

¿Te ayudo con alguno de estos pasos? 🚀

