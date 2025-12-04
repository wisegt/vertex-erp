# 📧 Pasos Finales para Activar Resend

## ✅ Lo que ya tienes:
- Cuenta en Resend creada
- DNS configurados en Vercel para `vertexerp.app`
- Código implementado y listo

## 🔑 Paso 1: Obtener API Key de Resend

1. Ve a https://resend.com/api-keys
2. Click en **"Create API Key"**
3. Dale un nombre: `VERTEX ERP Production`
4. **Permiso:** "Sending access" (por defecto)
5. Click en **"Add"**
6. **¡IMPORTANTE!** Copia la API key inmediatamente (empieza con `re_...`)
   - Solo se muestra una vez
   - Si la pierdes, debes crear una nueva

## 📝 Paso 2: Agregar al archivo .env

En la raíz del proyecto, edita el archivo `.env` y agrega:

```env
# Resend Email Service
RESEND_API_KEY=re_tu_api_key_aqui_la_que_copiaste
```

**Ejemplo:**
```env
RESEND_API_KEY=re_abc123def456ghi789jkl
```

## 🔄 Paso 3: Reiniciar el Servidor

En el terminal:
```bash
# Presiona Ctrl+C para detener el servidor
# Luego ejecuta:
npm run dev
```

## ✅ Paso 4: Actualizar el Remitente en el Código

Como ya verificaste tu dominio `vertexerp.app`, actualiza el remitente:

En `server/api/auth/send-setup-email.post.ts`, línea ~83, cambia:

```typescript
// De esto:
from: 'VERTEX ERP <noreply@vertexerp.app>',

// A esto (con tu dominio verificado):
from: 'VERTEX ERP <noreply@vertexerp.app>',
```

**Nota:** Si tu dominio aún no está verificado en Resend, usa temporalmente:
```typescript
from: 'onboarding@resend.dev', // Solo para pruebas
```

## 🧪 Paso 5: Probar el Flujo Completo

1. **Cierra sesión** (logout)
2. **Ve a** `/payment`
3. **Completa el pago** con tarjeta `4242 4242 4242 4242`
4. **Espera en** `/payment-success`
5. **Revisa tu email** (el que usaste en el pago)
6. **Deberías recibir** el email con el botón "Configurar mi cuenta"
7. **Haz click** en el botón
8. **Completa** nombre, apellido, contraseña
9. **Inicia sesión**
10. **¡Accede al dashboard!** ✅

## 🔍 Verificar que Funciona

### En la consola del servidor deberías ver:
```
📧 [Send Setup Email] Iniciando para: tu@email.com
💾 [Send Setup Email] Guardando token en BD...
✅ [Send Setup Email] Token guardado: uuid-xxx
✅ [Send Setup Email] Email enviado: em_xxxxx
```

### En la consola del navegador deberías ver:
```
✅ Suscripción creada: uuid-xxx
📧 Usuario NO autenticado, enviando email de setup...
✅ Email enviado (o URL en consola del servidor)
```

## ⚠️ Si NO Ves el Email

### Verifica estas cosas:

1. **Revisa la carpeta de Spam** 📬

2. **Verifica el dominio en Resend:**
   - Ve a https://resend.com/domains
   - Tu dominio `vertexerp.app` debe estar en verde (Verified)
   - Si está en amarillo, los DNS aún no se han propagado (espera 10-30 min)

3. **Verifica la consola del servidor:**
   - Si dice `RESEND_API_KEY no configurada` → Falta agregar al .env
   - Si dice `Error de Resend` → Revisa el dominio o el formato del remitente

4. **Para pruebas rápidas usa `onboarding@resend.dev`:**
   ```typescript
   from: 'onboarding@resend.dev', // Solo para desarrollo
   ```
   Este remitente funciona sin verificar dominio.

## 📊 Dashboard de Resend

Ve a https://resend.com/emails para ver:
- Emails enviados
- Estado de entrega
- Errores (si los hay)
- Logs completos

## 🎯 Resumen

**Para activar los emails:**
1. ✅ Cuenta en Resend creada
2. ✅ DNS configurados
3. ⏳ **Falta:** Obtener API key
4. ⏳ **Falta:** Agregar al .env
5. ⏳ **Falta:** Reiniciar servidor
6. ⏳ **Falta:** Probar

**¿Ya tienes la API key? Agrégala al .env y reinicia el servidor.** 🚀

