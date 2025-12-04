# 💳 Cómo funcionan los Pagos Recurrentes con Recurrente

## 🔐 Seguridad y Tokenización

Cuando un cliente realiza su primer pago exitoso:

### 1. **Primer Pago**
- El cliente ingresa sus datos de tarjeta en el formulario embedido
- Recurrente encripta y procesa el pago de forma segura
- **Tu servidor NUNCA ve los datos de la tarjeta** (PCI compliant)

### 2. **Tokenización Automática**
Después del pago exitoso, Recurrente:
- Tokeniza la tarjeta del cliente
- Almacena el token de forma segura en sus servidores
- Te devuelve un `payment_method_id` único

### 3. **Pagos Futuros Automáticos**
Para los cobros recurrentes (mensuales/anuales):
- Recurrente cobra automáticamente usando el token guardado
- **NO necesitas pedir la tarjeta de nuevo**
- Recibes webhooks en cada cobro:
  - `charge.succeeded` - Cobro exitoso
  - `charge.failed` - Cobro fallido (reintentos automáticos)

## 📋 Información en el Webhook

Cuando recibes el webhook `checkout.payment_completed`, obtienes:

```json
{
  "type": "checkout.payment_completed",
  "data": {
    "id": "ch_xxxxx",
    "payment_method": {
      "id": "pay_m_xxxxx",  // ← Este es el token de la tarjeta
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      }
    },
    "subscription": {
      "id": "su_xxxxx",
      "status": "active",
      "current_period_start": "2024-01-01",
      "current_period_end": "2024-02-01"
    },
    "customer": {
      "id": "us_xxxxx",
      "email": "cliente@ejemplo.com"
    },
    "metadata": {
      "plan_code": "business",
      "plan_type": "empresa",
      "billing_period": "yearly"
    }
  }
}
```

## 💾 Guardar en tu Base de Datos

En el webhook, guarda esta información en Supabase:

```typescript
// Tabla: user_subscriptions
{
  user_id: userData.id,
  plan_code: metadata.plan_code,
  status: 'active',
  recurrente_subscription_id: data.subscription.id,
  recurrente_payment_method_id: data.payment_method.id, // Token de la tarjeta
  card_last4: data.payment_method.card.last4,
  card_brand: data.payment_method.card.brand,
  current_period_start: data.subscription.current_period_start,
  current_period_end: data.subscription.current_period_end,
  metadata: metadata
}
```

## 🔄 Renovaciones Automáticas

### Cobros Mensuales:
- Recurrente cobra automáticamente cada mes
- Usa el `payment_method_id` guardado
- No se requiere acción del usuario

### Cobros Anuales:
- Recurrente cobra automáticamente cada año
- Mismo proceso que mensual

### Manejo de Fallos:
Si un cargo falla, Recurrente:
1. Reintenta automáticamente 3 veces en 5 días
2. Envía webhooks de `charge.failed`
3. Cambia el status a `past_due`
4. Si todos los reintentos fallan → `cancelled`

## 🎯 Webhooks Importantes para Pagos Recurrentes

```typescript
switch (webhookType) {
  case 'charge.succeeded':
    // ✅ Cobro recurrente exitoso
    // Extender la suscripción por otro período
    break
    
  case 'charge.failed':
    // ❌ Cobro fallido
    // Notificar al usuario para actualizar su tarjeta
    break
    
  case 'subscription.updated':
    // 📝 Cambios en la suscripción
    // Sincronizar con tu base de datos
    break
    
  case 'subscription.cancelled':
    // 🚫 Suscripción cancelada
    // Desactivar acceso del usuario
    break
}
```

## 🔧 Usar el Token para Pagos Manuales

Si necesitas hacer un cargo adicional (upgrade, cargo extra, etc.), usa el `payment_method_id`:

```typescript
POST /api/one_time_payments/

{
  "payment_method_id": "pay_m_xxxxx",  // Token guardado
  "items": [{
    "name": "Upgrade a plan superior",
    "currency": "GTQ",
    "amount_in_cents": 50000
  }]
}
```

## 📊 Gestión de Tarjetas

### Ver tarjetas guardadas:
```typescript
GET /api/users/{user_id}/payment_methods
```

### Actualizar tarjeta:
El cliente puede actualizar su tarjeta creando un nuevo checkout. Recurrente:
- Crea un nuevo `payment_method_id`
- Actualiza automáticamente la suscripción con la nueva tarjeta

### Eliminar tarjeta:
Cuando se cancela una suscripción, puedes optar por:
- Mantener el `payment_method_id` por si el usuario se suscribe de nuevo
- O eliminarlo por políticas de privacidad

## ⚠️ Importantes Consideraciones de Seguridad

### ✅ Qué SÍ hacer:
- Guardar el `payment_method_id` en tu base de datos
- Guardar los últimos 4 dígitos para mostrar al usuario
- Usar el token para pagos futuros
- Validar webhooks con la firma

### ❌ Qué NO hacer:
- **NUNCA** guardar números de tarjeta completos
- **NUNCA** guardar CVV
- **NUNCA** intentar procesar tarjetas sin PCI compliance
- **NUNCA** compartir el `payment_method_id` con terceros

## 🎉 Beneficios de este Enfoque

1. **✅ Cumplimiento PCI** - Recurrente maneja toda la seguridad
2. **✅ Experiencia fluida** - Cliente ingresa tarjeta una sola vez
3. **✅ Pagos automáticos** - Sin intervención manual
4. **✅ Reintentos inteligentes** - 3 reintentos automáticos en fallos
5. **✅ Gestión simple** - Todo desde un solo dashboard

## 📞 Soporte

Si tienes dudas sobre la tokenización o pagos recurrentes:
- **Discord**: https://discord.gg/QhKPEkSKp2
- **Email**: soporte@recurrente.com
- **Docs**: https://documenter.getpostman.com/view/10340859/2sA2rFQf5R

