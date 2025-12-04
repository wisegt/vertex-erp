# ⚡ Configuración Rápida - Recurrente

## 🚀 Pasos para activar pagos con tarjeta

### 1️⃣ Obtener llaves de API (2 minutos)

1. Ve a https://app.recurrente.com/bienvenida
2. Crea una cuenta o inicia sesión
3. Navega a **Configuración → Llaves API**
4. Copia tus llaves de **TEST** (ambiente de pruebas)

### 2️⃣ Configurar variables de entorno (1 minuto)

Crea un archivo `.env` en la raíz del proyecto:

```bash
# RECURRENTE - Llaves de PRUEBA
RECURRENTE_PUBLIC_KEY=pk_test_TU_LLAVE_PUBLICA_AQUI
RECURRENTE_SECRET_KEY=sk_test_TU_LLAVE_SECRETA_AQUI
```

### 3️⃣ Configurar Webhook en Recurrente (2 minutos)

1. En Recurrente, ve a **Configuración → Webhooks**
2. Agrega esta URL: `https://tu-dominio.com/api/recurrente/webhooks`
   - Para desarrollo local: `http://localhost:3000/api/recurrente/webhooks`
   - **Nota**: Para desarrollo local, usa [ngrok](https://ngrok.com/) o similar
3. Selecciona estos eventos:
   - ✅ `checkout.payment_completed`
   - ✅ `subscription.created`
   - ✅ `charge.succeeded`
   - ✅ `charge.failed`

### 4️⃣ Reiniciar el servidor

```bash
npm run dev
```

## ✅ ¡Listo para probar!

### Probar el flujo:

1. **Abre la página de pagos**: http://localhost:3000/front-pages/payment
2. **Selecciona un plan** (empresa/contador, mensual/anual)
3. **Completa los datos de facturación**:
   - Nombre o Razón Social
   - NIT
   - Correo electrónico
   - Teléfono
   - Dirección
4. **Selecciona "Tarjeta de Crédito/Débito"**
5. **Haz clic en "Cargar formulario de pago"**
6. **El formulario de Recurrente aparecerá en la página**
7. **Usa la tarjeta de prueba**: `4242 4242 4242 4242`
   - Fecha: Cualquier fecha futura (ej. `12/25`)
   - CVV: Cualquier 3 dígitos (ej. `123`)
   - Nombre: Cualquier nombre
8. **Completa el pago** → Serás redirigido a `/payment-success`

## 🎯 Flujo Completo

```
Usuario en /payment
    ↓
Completa datos de facturación
    ↓
Clic en "Cargar formulario de pago"
    ↓
Se crea checkout en Recurrente (tu servidor)
    ↓
Formulario de tarjeta aparece en la página (iframe)
    ↓
Usuario ingresa datos de tarjeta
    ↓
Recurrente procesa el pago (tokeniza la tarjeta)
    ↓
Webhook notifica tu servidor → Activa suscripción
    ↓
Usuario redirigido a /payment-success
    ↓
¡Suscripción activa! 🎉
```

## 🔄 Pagos Recurrentes Automáticos

Una vez el usuario completa su primer pago:
- ✅ La tarjeta queda **guardada de forma segura** (tokenizada)
- ✅ Los cobros futuros son **100% automáticos**
- ✅ **NO se requiere volver a pedir la tarjeta**
- ✅ Recibes webhooks en cada cobro mensual/anual

## 🧪 Tarjetas de Prueba

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | ✅ Pago exitoso |
| `4000 0000 0000 0002` | ❌ Tarjeta declinada |
| `4000 0000 0000 9995` | ❌ Fondos insuficientes |

## 🔑 Cambiar a Producción

Cuando estés listo para producción:

1. Obtén tus llaves de **LIVE** en Recurrente
2. Actualiza el `.env`:
```bash
# RECURRENTE - Llaves de PRODUCCIÓN
RECURRENTE_PUBLIC_KEY=pk_live_TU_LLAVE_PUBLICA_AQUI
RECURRENTE_SECRET_KEY=sk_live_TU_LLAVE_SECRETA_AQUI
```
3. Actualiza la URL del webhook a tu dominio de producción
4. ¡Listo! Los pagos reales funcionarán

## ❓ Preguntas Frecuentes

### ¿Los datos de tarjeta pasan por mi servidor?
**NO**. Los datos de tarjeta van directamente a Recurrente a través de su formulario embedido. Tu servidor solo recibe un token.

### ¿Necesito certificación PCI DSS?
**NO**. Recurrente maneja toda la seguridad y tiene certificación PCI DSS Level 1.

### ¿Cómo sé si el pago fue exitoso?
De dos formas:
1. **Callback inmediato** `onSuccess()` en el frontend
2. **Webhook** `checkout.payment_completed` en tu servidor (más confiable)

### ¿Qué pasa si el usuario cierra la página?
El checkout queda guardado en Recurrente por 24 horas. Puedes enviarle el link por correo para que complete el pago.

### ¿Puedo probar sin tarjeta real?
**SÍ**. Usa llaves TEST y la tarjeta `4242 4242 4242 4242`. No genera cargos reales.

## 🆘 ¿Necesitas ayuda?

- **Discord de Recurrente**: https://discord.gg/QhKPEkSKp2
- **Email**: soporte@recurrente.com
- **Documentación completa**: Ver archivo `RECURRENTE_INTEGRATION.md`

