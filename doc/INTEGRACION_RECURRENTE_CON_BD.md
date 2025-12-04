# 🔗 Integración de Recurrente con tu Base de Datos

## 📊 Mapeo de Campos

### Tabla `subscriptions`
- `gateway_provider` → `'recurrente'`
- `gateway_subscription_id` → `checkoutData.subscription.id` (de Recurrente)
- `gateway_customer_id` → `checkoutData.customer.id` (de Recurrente)
- `tenant_id` → Del usuario autenticado
- `plan_id` → Buscar en `plans` por `code` y `billing_period`
- `status` → `'active'` cuando el pago es exitoso
- `payment_method` → `'card'` o `'transfer'` según el método usado
- `current_period_start` → `checkoutData.subscription.current_period_start`
- `current_period_end` → `checkoutData.subscription.current_period_end`

### Tabla `subscription_payments`
- `subscription_id` → ID de la suscripción creada
- `tenant_id` → Del usuario autenticado
- `gateway_provider` → `'recurrente'`
- `gateway_payment_id` → `checkoutData.id` (ID del checkout)
- `gateway_invoice_id` → Si Recurrente proporciona invoice_id
- `amount` → Monto sin descuento
- `discount_amount` → Descuento aplicado
- `tax_amount` → IVA (12%)
- `total_amount` → Monto total a pagar
- `currency` → `'GTQ'`
- `status` → `'completed'` si el pago fue exitoso
- `payment_method` → `'card'` o `'transfer'`
- `paid_at` → Fecha del pago

### Tabla `tenants`
- Los datos de facturación se guardan en `tenants` cuando se crea la suscripción
- `tax_id` → NIT (sin guiones)
- `legal_name` → Nombre de la empresa
- `email` → Email de facturación
- `phone` → Teléfono
- `fiscal_address` → Dirección

### Tabla `plans`
- Ya debe existir el plan con `code` y `billing_period`
- `gateway_provider` → `'recurrente'`
- `gateway_product_id` → ID del producto en Recurrente (opcional)
- `gateway_price_id` → ID del precio en Recurrente (opcional)

## 🔄 Flujo Completo

1. **Usuario completa el pago** en `payment.vue`
2. **Webhook recibe** `checkout.payment_completed`
3. **Buscar o crear tenant** con los datos de facturación
4. **Buscar plan** por `code` y `billing_period`
5. **Crear suscripción** en `subscriptions`
6. **Crear pago** en `subscription_payments`
7. **Actualizar tenant** con datos de facturación

