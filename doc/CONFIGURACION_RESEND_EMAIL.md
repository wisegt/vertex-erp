# 📧 Configuración de Resend para Emails

## ¿Qué es Resend?

Resend es un servicio moderno de email para desarrolladores que permite enviar emails transaccionales (como confirmaciones de pago, reseteo de contraseña, etc.) de forma fácil y confiable.

**Características:**
- ✅ 3,000 emails gratis al mes
- ✅ Fácil integración con Nuxt/Node
- ✅ Templates HTML modernos
- ✅ Alta tasa de entrega (deliverability)
- ✅ Dashboard con analytics

## 🚀 Configuración Paso a Paso

### 1️⃣ Crear Cuenta en Resend

1. Ve a https://resend.com
2. Click en "Sign Up" (gratis)
3. Verifica tu email
4. Te dará 3,000 emails gratis al mes

### 2️⃣ Obtener tu API Key

1. En el dashboard de Resend: https://resend.com/api-keys
2. Click en "Create API Key"
3. Dale un nombre: "VERTEX ERP Production"
4. Copia la API key (empieza con `re_...`)

**⚠️ Importante:** Guarda la API key en un lugar seguro, solo se muestra una vez.

### 3️⃣ Verificar tu Dominio (Opcional pero Recomendado)

**Para desarrollo (localhost):**
- Puedes usar `onboarding@resend.dev` como remitente
- Límite: 100 emails por día
- Solo puedes enviar a tu propio email

**Para producción:**
1. Ve a https://resend.com/domains
2. Click en "Add Domain"
3. Ingresa tu dominio: `vertexerp.app`
4. Agrega los registros DNS que te indiquen:
   - SPF
   - DKIM
   - DMARC
5. Espera la verificación (5-10 minutos)
6. Una vez verificado, podrás enviar desde `noreply@vertexerp.app`

### 4️⃣ Configurar Variables de Entorno

Agrega al archivo `.env`:

```env
# Resend Email Service
RESEND_API_KEY=re_tu_api_key_aqui

# URL pública de tu sitio (para los enlaces en emails)
NUXT_PUBLIC_SITE_URL=http://localhost:3000  # Desarrollo
# NUXT_PUBLIC_SITE_URL=https://vertexerp.app  # Producción
```

### 5️⃣ Reiniciar el Servidor

```bash
# Ctrl+C para detener
npm run dev
```

## 📝 Archivos Ya Configurados

### ✅ `nuxt.config.ts`
Ya agregué la configuración:
```typescript
runtimeConfig: {
  resendApiKey: process.env.RESEND_API_KEY,
  public: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  }
}
```

### ✅ `server/api/auth/send-setup-email.post.ts`
Ya implementé el envío de email con Resend:
- Template HTML profesional
- Logo de VERTEX
- Botón de acción
- Lista de beneficios
- Advertencia de expiración (24h)

## 🧪 Probar en Desarrollo (sin dominio verificado)

1. **Obtén tu API key de Resend**

2. **Agrégala al .env:**
   ```env
   RESEND_API_KEY=re_tu_api_key_aqui
   ```

3. **Modifica temporalmente el remitente:**
   
   En `server/api/auth/send-setup-email.post.ts`, línea ~60:
   ```typescript
   from: 'onboarding@resend.dev', // Para desarrollo
   ```

4. **Reinicia el servidor**

5. **Haz un pago de prueba**

6. **Revisa tu email** (el que usaste en el pago)

## 📧 Email que Recibirá el Usuario

**Asunto:** ¡Bienvenido a VERTEX! Configura tu cuenta

**Contenido:**
```
┌─────────────────────────────────────┐
│        VERTEX                       │
│   Sistema ERP para Guatemala        │
├─────────────────────────────────────┤
│                                     │
│ ¡Bienvenido a VERTEX, Mi Empresa!  │
│                                     │
│ Tu suscripción ha sido activada     │
│ exitosamente. 🎉                    │
│                                     │
│ Para acceder a tu cuenta, primero   │
│ necesitas configurar tu usuario y   │
│ contraseña:                         │
│                                     │
│    [Configurar mi cuenta]           │
│                                     │
│ ⏰ Este enlace expira en 24 horas   │
│                                     │
│ Con VERTEX podrás:                  │
│ ✅ Gestionar tu contabilidad        │
│ ✅ Emitir facturas electrónicas     │
│ ✅ Control de inventario            │
│ ✅ Reportes financieros             │
│ ✅ Acceso desde cualquier lugar     │
│                                     │
└─────────────────────────────────────┘
```

## 🔧 Alternativas a Resend

Si prefieres otro servicio:

### SendGrid
```bash
npm install @sendgrid/mail
```
```typescript
import sgMail from '@sendgrid/mail'
sgMail.setApiKey(config.sendgridApiKey)

await sgMail.send({
  to: email,
  from: 'noreply@vertexerp.app',
  subject: '...',
  html: '...'
})
```

### AWS SES
```bash
npm install @aws-sdk/client-ses
```

### Mailgun
```bash
npm install mailgun.js form-data
```

## 💰 Precios de Resend

- **Plan Gratuito:**
  - 3,000 emails/mes
  - 1 dominio
  - Perfecto para empezar

- **Plan Pro ($20/mes):**
  - 50,000 emails/mes
  - Dominios ilimitados
  - Soporte prioritario

## 🎯 Ventajas de Resend

1. **Fácil de usar** - API simple y directa
2. **Built for developers** - Diseñado para devs
3. **Alta entrega** - 99%+ deliverability
4. **Analytics** - Dashboard con métricas
5. **Templates** - Soporta React Email
6. **Webhooks** - Notificaciones de bounces, quejas, etc.

## 📊 Monitoreo

Una vez configurado, podrás ver en el dashboard de Resend:
- Emails enviados
- Emails abiertos
- Clicks en enlaces
- Bounces
- Quejas (spam)

## ✅ Checklist

- [x] Resend instalado (`npm install resend`)
- [x] Endpoint implementado
- [x] Template HTML creado
- [x] nuxt.config.ts configurado
- [ ] Crear cuenta en Resend
- [ ] Obtener API key
- [ ] Agregar RESEND_API_KEY al .env
- [ ] Reiniciar servidor
- [ ] Probar envío de email

Después de configurar tu API key, los emails se enviarán automáticamente. 📨

