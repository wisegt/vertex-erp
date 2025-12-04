# 🔐 Integración de Recurrente - Pagos con Tarjeta

## 📋 Documentación API
https://documenter.getpostman.com/view/10340859/2sA2rFQf5R

## 🚀 Configuración

### 1. Obtener las llaves de API

1. Ve a https://app.recurrente.com
2. Inicia sesión en tu cuenta
3. Navega a **Configuración → Llaves API**
4. Copia tus llaves de **TEST** (para desarrollo) o **LIVE** (para producción)

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```bash
# ============================================================================
# RECURRENTE PAYMENT GATEWAY
# ============================================================================

# Para DESARROLLO/PRUEBAS (ambiente Sandbox)
RECURRENTE_PUBLIC_KEY=pk_test_tu_llave_publica_aqui
RECURRENTE_SECRET_KEY=sk_test_tu_llave_secreta_aqui

# Para PRODUCCIÓN
# RECURRENTE_PUBLIC_KEY=pk_live_tu_llave_publica_aqui
# RECURRENTE_SECRET_KEY=sk_live_tu_llave_secreta_aqui
```

### 3. Configurar Webhook en Recurrente

1. En tu cuenta de Recurrente, ve a **Configuración → Webhooks**
2. Agrega una nueva URL de webhook:
   - **Desarrollo**: `https://tu-dominio-dev.com/api/recurrente/webhooks`
   - **Producción**: `https://tu-dominio.com/api/recurrente/webhooks`
3. Selecciona los siguientes eventos:
   - ✅ `checkout.payment_completed`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.cancelled`
   - ✅ `charge.succeeded`
   - ✅ `charge.failed`

## 🧪 Modo de Pruebas (Sandbox)

### Usar ambiente TEST:
- Configura las llaves que comienzan con `pk_test_` y `sk_test_`
- Los checkouts mostrarán un aviso de **"PRUEBA"**
- Tendrán `live_mode = false`
- **No generan actividad real ni cobros**

### Tarjeta de prueba:
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej. 12/25)
CVV: Cualquier 3 dígitos (ej. 123)
```

## 📝 Flujo de Integración (Embedded Checkout)

### 1. Usuario selecciona plan y completa datos
El usuario elige un plan en `/front-pages/payment` y completa:
- Datos de facturación (Nombre, NIT, correo, teléfono, dirección)

### 2. Se crea el checkout
Al hacer clic en "Cargar formulario de pago", se crea un checkout en Recurrente:

```typescript
const checkout = await createSubscriptionCheckout(
  'Plan Business - Anual',  // Nombre del plan
  120000,                    // Monto en centavos (Q1,200.00)
  'yearly',                  // Período de facturación
  'user_123',                // ID del usuario (opcional)
  { plan_code: 'business' }  // Metadata adicional
)
```

### 3. Formulario embedido en la página
El formulario de pago de Recurrente se carga **dentro de tu página** (sin redirección):
- Se muestra un iframe con el formulario de tarjeta
- El usuario ingresa sus datos de tarjeta directamente
- Los datos son encriptados y procesados por Recurrente (PCI compliant)
- **Tu servidor nunca ve los datos de la tarjeta**

### 4. Proceso de pago en tiempo real
El pago se procesa inmediatamente y recibes callbacks:
- **onSuccess**: Pago exitoso → Redirige a `/payment-success`
- **onFailure**: Pago fallido → Muestra mensaje de error
- **onPaymentInProgress**: Para transferencias (24hrs)

### 5. Webhook de confirmación
Recurrente envía un webhook a tu servidor:
```
POST /api/recurrente/webhooks
```

### 6. Tokenización automática
Después del primer pago exitoso, Recurrente:
- **Guarda el método de pago** del cliente (tokenizado)
- Te devuelve un `payment_method_id`
- Puedes usar este ID para pagos futuros sin pedir la tarjeta de nuevo

## 📂 Archivos Creados

### Composables
- `composables/useRecurrente.ts` - Manejo de la API de Recurrente

### Endpoints del Servidor
- `server/api/recurrente/create-checkout.post.ts` - Crear checkout
- `server/api/recurrente/checkout/[id].get.ts` - Obtener estado de checkout
- `server/api/recurrente/webhooks.post.ts` - Recibir webhooks

### Páginas
- `pages/front-pages/payment.vue` - ✅ Actualizada con integración
- `pages/payment-success.vue` - ✅ Nueva página de éxito

## 🔑 Funciones Principales

### `createSubscriptionCheckout()`
Crea un checkout para una suscripción recurrente.

```typescript
const checkout = await createSubscriptionCheckout(
  'Plan Premium Anual',
  120000, // Q1,200.00 en centavos
  'yearly',
  'user_123',
  { custom_data: 'value' }
)
```

### `getCheckoutStatus()`
Obtiene el estado actual de un checkout.

```typescript
const status = await getCheckoutStatus('ch_xxxxx')
console.log(status.status) // 'completed', 'open', 'expired', 'cancelled'
```

### `initializeEmbeddedCheckout()`
Carga el formulario de pago embedido en tu página.

```typescript
await initializeEmbeddedCheckout('https://app.recurrente.com/checkout-session/ch_xxxxx')
```

El script de Recurrente se carga automáticamente y muestra el formulario en el contenedor con ID `recurrente-checkout-container`.

## 🔒 Seguridad

- ✅ Las llaves de API **nunca se exponen al cliente**
- ✅ Todas las llamadas a Recurrente se hacen desde el **servidor**
- ✅ Los datos de tarjeta **nunca pasan por tu servidor** (PCI compliant)
- ✅ Encriptación SSL de 256 bits
- ✅ Cumplimiento PCI DSS Level 1

## 💳 Métodos de Pago Soportados

- ✅ Visa
- ✅ Mastercard
- ✅ American Express
- ✅ Tarjetas locales de Guatemala

## 🌍 Monedas Soportadas

- ✅ GTQ (Quetzales guatemaltecos)
- ✅ USD (Dólares estadounidenses)

## 📊 Próximos Pasos

### Para activación completa:

1. **Implementar lógica de activación** en el webhook:
   - Actualizar el estado de suscripción en Supabase
   - Activar acceso del usuario
   - Enviar email de confirmación

2. **Manejar estados de suscripción**:
   - `active` - Suscripción activa
   - `paused` - Suscripción pausada
   - `past_due` - Pago atrasado
   - `cancelled` - Suscripción cancelada

3. **Implementar renovaciones automáticas**:
   - Recurrente maneja automáticamente los cobros recurrentes
   - Recibirás webhooks en cada cargo

4. **Panel de administración**:
   - Ver suscripciones activas
   - Historial de pagos
   - Gestión de cancelaciones

## 🆘 Soporte

- **Documentación**: https://documenter.getpostman.com/view/10340859/2sA2rFQf5R
- **Discord**: https://discord.gg/QhKPEkSKp2
- **Email**: soporte@recurrente.com
- **Centro de ayuda**: https://ayuda.recurrente.com

## ⚠️ Notas Importantes

1. **Nunca expongas tus llaves secretas** en el código del cliente
2. **Usa llaves TEST** durante el desarrollo
3. **Cambia a llaves LIVE** solo en producción
4. **Reembolsa pagos de prueba** el mismo día para evitar comisiones
5. **Configura los webhooks** para recibir notificaciones de pagos

## 📧 Emails de Confirmación

Recurrente envía automáticamente:
- Email de confirmación de pago al cliente
- Email de notificación al comercio (tú)
- Factura electrónica (si está configurada)

## 🎉 ¡Listo!

Tu integración con Recurrente está completa. Los pagos con tarjeta ahora se procesarán de forma segura a través de Recurrente.

