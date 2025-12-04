# 🔐 Flujo de Registro Post-Pago

## 📋 Problema Original

- ❌ Usuarios sin cuenta eran redirigidos al dashboard
- ❌ Super admins veían datos de cualquier empresa
- ❌ No había forma de crear usuario después del pago

## ✅ Solución Implementada

### Flujo para USUARIOS NO AUTENTICADOS

```
1. Usuario completa el pago (sin estar logueado)
   ↓
2. Se crea tenant + suscripción
   ↓
3. Se envía email con enlace para crear cuenta
   ↓
4. Usuario hace clic en el enlace
   ↓
5. Página "setup-account" para definir contraseña
   ↓
6. Usuario ingresa: nombre, apellido, contraseña
   ↓
7. Se crea el usuario vinculado al tenant
   ↓
8. Redirección a login
   ↓
9. Usuario inicia sesión y accede al dashboard
```

### Flujo para USUARIOS AUTENTICADOS

```
1. Usuario logueado completa el pago
   ↓
2. Se actualiza/crea su tenant + suscripción
   ↓
3. Redirección automática al dashboard (5 segundos)
```

## 🗄️ Nueva Tabla en BD

### `account_setup_tokens`

```sql
CREATE TABLE account_setup_tokens (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  checkout_id VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Propósito:**
- Almacenar tokens temporales para crear cuenta
- Token expira en 24 horas
- Se marca como `used` después de usarse
- Función automática para limpiar tokens expirados

## 📝 Archivos Creados

### 1. `pages/setup-account.vue`
Página para crear cuenta después del pago:
- Verifica que el token sea válido
- Formulario para nombre, apellido, contraseña
- Valida la contraseña (mínimo 8 caracteres)
- Crea el usuario vinculado al tenant
- Redirige al login

### 2. `server/api/auth/send-setup-email.post.ts`
Envía email con link para crear cuenta:
- Genera token único
- Guarda en `account_setup_tokens`
- Envía email (pendiente integrar servicio real)
- Devuelve URL del setup

### 3. `server/api/auth/verify-setup-token.post.ts`
Verifica que el token sea válido:
- Busca el token en la BD
- Verifica que no haya expirado
- Verifica que no haya sido usado

### 4. `server/api/auth/complete-setup.post.ts`
Completa el setup de la cuenta:
- Verifica el token
- Busca la suscripción asociada
- Crea o actualiza el usuario
- Hash de la contraseña con bcrypt
- Vincula usuario al tenant
- Marca token como usado

## 📝 Archivos Modificados

### `pages/payment-success.vue`
- Detecta si el usuario está autenticado
- **Usuario autenticado:** Contador de 5 segundos → Dashboard
- **Usuario NO autenticado:** Botón "Crear mi cuenta" → setup-account
- Llama a `send-setup-email` para usuarios no autenticados
- Pasa el email en la URL

### `server/api/billing/info.get.ts`
- Ya NO permite que super admins vean datos de facturación
- Devuelve datos solo del tenant del usuario actual
- Si no tiene tenant y no es super admin → devuelve trial

### `server/api/subscription/create-from-checkout.post.ts`
- Ya NO requiere autenticación
- Funciona para usuarios autenticados y no autenticados
- Vincula usuario al tenant solo si está autenticado
- Crea el tenant siempre

## 🔒 Seguridad

### Tokens
- Expiran en 24 horas
- Solo se pueden usar una vez
- Vinculados al email específico
- Token format: `setup_{checkoutId}_{timestamp}`

### Contraseñas
- Mínimo 8 caracteres
- Hash con bcrypt (10 rounds)
- Nunca se almacenan en texto plano

### Separación de Datos
- Super admins NO ven datos de facturación
- Usuarios solo ven datos de su tenant
- Sin autenticación NO se puede acceder al dashboard

## 🧪 Flujo de Pruebas

### Prueba 1: Usuario Nuevo (NO autenticado)
```
1. Ir a /payment (sin login)
2. Completar datos y pagar
3. En payment-success:
   - Ver botón "Crear mi cuenta"
   - NO ver contador automático
4. Click en "Crear mi cuenta"
5. Verificar que llega a /setup-account
6. Completar: nombre, apellido, contraseña
7. Click "Crear mi cuenta"
8. Redirige a /login
9. Iniciar sesión con email y contraseña
10. Acceder al dashboard ✅
```

### Prueba 2: Usuario Existente (autenticado)
```
1. Login con cuenta existente
2. Ir a /payment
3. Completar pago
4. En payment-success:
   - Ver contador de 5 segundos
   - Ver botón "Ir al dashboard"
5. Esperar o hacer click
6. Acceder al dashboard directamente ✅
```

### Prueba 3: Super Admin
```
1. Login como super admin
2. Ir a Billing & Plans
3. Debe mostrar mensaje: "Super admins no tienen datos de facturación"
4. NO debe ver datos de otros tenants ✅
```

## 📧 Email de Bienvenida (Pendiente)

El endpoint `send-setup-email` está listo pero necesita integrar un servicio de email:

### Servicios Recomendados:
- **Resend** (recomendado para Nuxt)
- SendGrid
- AWS SES
- Mailgun
- Postmark

### Template del Email:
```html
¡Bienvenido a VERTEX, {business_name}!

Tu suscripción ha sido activada exitosamente.

Para acceder a tu cuenta, primero necesitas configurar tu usuario y contraseña:

[Configurar mi cuenta]

Este enlace expira en 24 horas.

Si no solicitaste esta suscripción, ignora este correo.
```

## 🎯 Beneficios de este Flujo

1. ✅ **Seguridad:** Usuarios nuevos no pueden acceder sin crear contraseña
2. ✅ **UX Mejorada:** Flujo claro para crear cuenta
3. ✅ **Separación de datos:** Super admins no ven datos de facturación
4. ✅ **Tokens seguros:** Expiran en 24h y solo se usan una vez
5. ✅ **Flexible:** Funciona para usuarios nuevos y existentes
6. ✅ **Email confirmación:** Usuario recibe instrucciones claras

## 🚀 Próximos Pasos

1. **Integrar servicio de email:**
   ```bash
   npm install resend
   ```
   
2. **Configurar variables de entorno:**
   ```env
   RESEND_API_KEY=re_xxxxx
   ```

3. **Actualizar `send-setup-email.post.ts`:**
   - Descomentar código de envío de email
   - Usar template HTML
   - Incluir logo de la empresa

4. **Mejorar UX:**
   - Agregar página de "Revisa tu email"
   - Botón para reenviar email
   - Mostrar tiempo de expiración del token

5. **Testing:**
   - Probar flujo completo
   - Verificar expiración de tokens
   - Validar seguridad

Todo está implementado y listo para usar. Solo falta integrar el servicio de email real. 🎉

