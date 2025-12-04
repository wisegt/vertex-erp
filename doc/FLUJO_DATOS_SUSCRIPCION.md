# 📊 Flujo de Datos de Suscripción - Del Pago al Dashboard

## 🔄 Flujo Completo

```
1. Usuario paga en Recurrente
    ↓
2. Webhook notifica tu servidor
    ↓
3. Guardas datos en Supabase
    ↓
4. Dashboard consulta la información
    ↓
5. Muestra plan actual y detalles
```

## 📝 Paso a Paso

### 1️⃣ **Cuando el pago es exitoso** (Webhook)

Recurrente envía un webhook a: `POST /api/recurrente/webhooks`

**Payload que recibes:**
```json
{
  "type": "checkout.payment_completed",
  "data": {
    "id": "ch_xxxxx",
    "status": "completed",
    "payment_method": {
      "id": "pay_m_xxxxx",  // ← TOKEN DE LA TARJETA
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      }
    },
    "subscription": {
      "id": "su_xxxxx",  // ← ID DE SUSCRIPCIÓN EN RECURRENTE
      "status": "active",
      "current_period_start": "2024-12-04",
      "current_period_end": "2025-12-04"  // 1 año después si es anual
    },
    "customer": {
      "id": "us_xxxxx",
      "email": "cliente@empresa.com",
      "first_name": "Juan",
      "last_name": "Pérez"
    },
    "metadata": {
      "plan_code": "business",
      "plan_type": "empresa",
      "billing_period": "yearly",
      "business_name": "Mi Empresa S.A.",
      "nit": "12345678",
      "email": "factura@empresa.com",
      "phone": "22223333",
      "phone_code": "+502",
      "address": "Zona 10, Guatemala",
      "source": "vertex_erp"
    }
  }
}
```

### 2️⃣ **Guardar en Supabase** (en el webhook)

Actualiza el archivo `server/api/recurrente/webhooks.post.ts`:

```typescript
case 'checkout.payment_completed': {
  const checkoutData = body.data
  const metadata = checkoutData.metadata
  
  // Crear o actualizar suscripción en Supabase
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      // IDs de Recurrente
      recurrente_checkout_id: checkoutData.id,
      recurrente_subscription_id: checkoutData.subscription.id,
      recurrente_payment_method_id: checkoutData.payment_method.id,
      recurrente_customer_id: checkoutData.customer.id,
      
      // Datos del plan
      plan_code: metadata.plan_code,
      plan_type: metadata.plan_type,
      billing_period: metadata.billing_period,
      status: 'active',
      
      // Datos de facturación
      business_name: metadata.business_name,
      nit: metadata.nit,
      email: metadata.email,
      phone: metadata.phone,
      phone_code: metadata.phone_code,
      address: metadata.address,
      
      // Información de tarjeta (tokenizada)
      card_brand: checkoutData.payment_method.card.brand,
      card_last4: checkoutData.payment_method.card.last4,
      card_exp_month: checkoutData.payment_method.card.exp_month,
      card_exp_year: checkoutData.payment_method.card.exp_year,
      
      // Fechas de período
      current_period_start: checkoutData.subscription.current_period_start,
      current_period_end: checkoutData.subscription.current_period_end,
      
      // Metadata completo
      metadata: metadata,
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error guardando suscripción:', error)
  } else {
    console.log('✅ Suscripción guardada:', data.id)
    
    // Opcional: Enviar email de confirmación
    // await sendSubscriptionConfirmationEmail(data)
  }
  
  break
}
```

### 3️⃣ **Crear endpoint para obtener suscripción**

Crea: `server/api/subscription/current.get.ts`

```typescript
export default defineEventHandler(async (event) => {
  try {
    const session = await getServerSession(event)
    
    if (!session?.user?.id) {
      return {
        success: false,
        message: 'No autenticado'
      }
    }
    
    const supabase = serverSupabaseClient(event)
    
    // Obtener la suscripción activa del usuario
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', session.user.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error || !data) {
      return {
        success: false,
        message: 'No se encontró suscripción activa'
      }
    }
    
    return {
      success: true,
      data: {
        // Plan actual
        planCode: data.plan_code,
        planType: data.plan_type,
        billingPeriod: data.billing_period,
        status: data.status,
        
        // Fechas
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        trialEndsAt: data.trial_ends_at,
        
        // Datos de facturación
        businessName: data.business_name,
        nit: data.nit,
        email: data.email,
        phone: data.phone,
        phoneCode: data.phone_code,
        address: data.address,
        
        // Información de la tarjeta (solo últimos 4 dígitos)
        cardBrand: data.card_brand,
        cardLast4: data.card_last4,
        cardExpMonth: data.card_exp_month,
        cardExpYear: data.card_exp_year,
        
        // IDs de Recurrente (para futuras operaciones)
        recurrenteSubscriptionId: data.recurrente_subscription_id,
        recurrentePaymentMethodId: data.recurrente_payment_method_id,
      }
    }
  } catch (error: any) {
    console.error('[Subscription] Error:', error)
    return {
      success: false,
      message: error.message
    }
  }
})
```

### 4️⃣ **Usar en el Dashboard**

En `views/pages/account-settings/AccountSettingsBillingAndPlans.vue`:

```typescript
const subscriptionData = ref<any>(null)
const isLoadingSubscription = ref(false)

const loadSubscription = async () => {
  isLoadingSubscription.value = true
  try {
    const response = await $fetch('/api/subscription/current')
    if (response.success) {
      subscriptionData.value = response.data
    }
  } catch (error) {
    console.error('Error cargando suscripción:', error)
  } finally {
    isLoadingSubscription.value = false
  }
}

onMounted(() => {
  loadSubscription()
})

// Computed properties útiles
const planName = computed(() => {
  const plans = {
    starter: 'Starter',
    business: 'Business',
    enterprise: 'Enterprise'
  }
  return plans[subscriptionData.value?.planCode] || 'Free'
})

const isYearly = computed(() => {
  return subscriptionData.value?.billingPeriod === 'yearly'
})

const nextBillingDate = computed(() => {
  if (!subscriptionData.value?.currentPeriodEnd) return 'N/A'
  
  return new Date(subscriptionData.value.currentPeriodEnd).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

const cardInfo = computed(() => {
  if (!subscriptionData.value?.cardLast4) return null
  
  return {
    brand: subscriptionData.value.cardBrand,
    last4: subscriptionData.value.cardLast4,
    expiry: `${subscriptionData.value.cardExpMonth}/${subscriptionData.value.cardExpYear}`
  }
})
```

### 5️⃣ **Mostrar en el Template**

```vue
<template>
  <VCard>
    <VCardItem title="Plan Actual">
      <template #append>
        <VChip :color="subscriptionData?.status === 'active' ? 'success' : 'warning'">
          {{ subscriptionData?.status === 'active' ? 'Activo' : subscriptionData?.status }}
        </VChip>
      </template>
    </VCardItem>
    
    <VCardText>
      <!-- Información del plan -->
      <div class="mb-4">
        <h5 class="text-h5">Plan {{ planName }}</h5>
        <p class="text-body-1">
          Facturación {{ isYearly ? 'Anual' : 'Mensual' }}
        </p>
      </div>
      
      <!-- Próxima fecha de cobro -->
      <div class="mb-4">
        <div class="text-body-2 text-medium-emphasis">Próximo cobro</div>
        <div class="text-h6">{{ nextBillingDate }}</div>
      </div>
      
      <!-- Información de pago -->
      <div v-if="cardInfo" class="mb-4">
        <div class="text-body-2 text-medium-emphasis mb-2">Método de pago</div>
        <div class="d-flex align-center gap-2">
          <VIcon icon="ri-bank-card-line" />
          <span>{{ cardInfo.brand }} •••• {{ cardInfo.last4 }}</span>
          <span class="text-caption">Vence {{ cardInfo.expiry }}</span>
        </div>
      </div>
      
      <!-- Datos de facturación -->
      <VExpansionPanels>
        <VExpansionPanel title="Datos de facturación">
          <VExpansionPanelText>
            <div class="d-flex flex-column gap-2">
              <div><strong>Empresa:</strong> {{ subscriptionData?.businessName }}</div>
              <div><strong>NIT:</strong> {{ subscriptionData?.nit }}</div>
              <div><strong>Correo:</strong> {{ subscriptionData?.email }}</div>
              <div><strong>Teléfono:</strong> {{ subscriptionData?.phoneCode }} {{ subscriptionData?.phone }}</div>
              <div><strong>Dirección:</strong> {{ subscriptionData?.address }}</div>
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
      </VExpansionPanels>
      
      <!-- Acciones -->
      <div class="d-flex gap-3 mt-6">
        <VBtn variant="outlined" @click="navigateTo('/pages/pricing')">
          Cambiar Plan
        </VBtn>
        <VBtn variant="outlined" color="error" @click="openCancelDialog">
          Cancelar Suscripción
        </VBtn>
      </div>
    </VCardText>
  </VCard>
</template>
```

## 📋 Endpoints a Crear

### 1. `server/api/subscription/current.get.ts`
- Obtiene la suscripción activa del usuario
- Devuelve todos los datos para mostrar en el dashboard

### 2. `server/api/subscription/update-card.post.ts`
- Permite actualizar el método de pago
- Crea un nuevo checkout y actualiza el `payment_method_id`

### 3. `server/api/subscription/cancel.post.ts`
- Cancela la suscripción en Recurrente
- Actualiza el estado en Supabase

### 4. `server/api/subscription/change-plan.post.ts`
- Cambia el plan actual (upgrade/downgrade)

## 🗄️ Estructura de Tabla en Supabase

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  tenant_id UUID REFERENCES tenants(id),
  
  -- IDs de Recurrente (para sincronización)
  recurrente_checkout_id VARCHAR(100),
  recurrente_subscription_id VARCHAR(100) UNIQUE,
  recurrente_payment_method_id VARCHAR(100),
  recurrente_customer_id VARCHAR(100),
  
  -- Plan seleccionado
  plan_code VARCHAR(50) NOT NULL, -- starter, business, enterprise
  plan_type VARCHAR(50) NOT NULL, -- empresa, contador
  billing_period VARCHAR(20) NOT NULL, -- monthly, yearly
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, trialing, past_due, cancelled, expired
  
  -- Datos de facturación
  business_name VARCHAR(255) NOT NULL,
  nit VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  phone_code VARCHAR(10) DEFAULT '+502',
  address TEXT,
  
  -- Información de tarjeta (tokenizada, NO guardas el número completo)
  card_brand VARCHAR(50), -- visa, mastercard, amex
  card_last4 VARCHAR(4), -- Últimos 4 dígitos
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  
  -- Fechas importantes
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Metadata adicional
  metadata JSONB,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Índices para búsquedas rápidas
  CONSTRAINT unique_active_nit UNIQUE (nit) 
    WHERE status IN ('active', 'trialing', 'past_due'),
  CONSTRAINT unique_active_email UNIQUE (email) 
    WHERE status IN ('active', 'trialing', 'past_due')
);

-- Índices
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_recurrente_sub_id ON subscriptions(recurrente_subscription_id);
```

## 📥 Información Disponible en el Dashboard

### Del endpoint `/api/subscription/current`:

```typescript
{
  // Plan actual
  planCode: 'business',
  planType: 'empresa',
  billingPeriod: 'yearly',
  status: 'active',
  
  // Fechas
  currentPeriodStart: '2024-12-04',
  currentPeriodEnd: '2025-12-04',
  
  // Facturación
  businessName: 'Mi Empresa S.A.',
  nit: '12345678',
  email: 'factura@empresa.com',
  phone: '22223333',
  phoneCode: '+502',
  address: 'Zona 10, Guatemala',
  
  // Tarjeta (solo últimos 4 dígitos)
  cardBrand: 'visa',
  cardLast4: '4242',
  cardExpMonth: 12,
  cardExpYear: 2025,
  
  // IDs para operaciones
  recurrenteSubscriptionId: 'su_xxxxx',
  recurrentePaymentMethodId: 'pay_m_xxxxx'
}
```

## 🎨 Elementos a Mostrar en el Dashboard

### Vista Principal:
```
┌─────────────────────────────────────┐
│ Plan Actual                [Activo] │
├─────────────────────────────────────┤
│                                     │
│ Plan Business                       │
│ Facturación Anual                   │
│                                     │
│ Próximo cobro                       │
│ 4 de diciembre de 2025             │
│                                     │
│ Método de pago                      │
│ 💳 Visa •••• 4242                   │
│ Vence 12/2025                       │
│                                     │
│ [Cambiar Plan] [Actualizar Tarjeta] │
│                                     │
└─────────────────────────────────────┘
```

### Datos de Facturación (Expandible):
```
▶ Datos de facturación
  Empresa: Mi Empresa S.A.
  NIT: 12345678
  Correo: factura@empresa.com
  Teléfono: +502 22223333
  Dirección: Zona 10, Guatemala
```

### Historial de Pagos:
```
┌────────────────────────────────────┐
│ Historial de Pagos                │
├────────────────────────────────────┤
│ 4 Dic 2024  Q6,708.80  ✅ Pagado  │
│ 4 Nov 2024  Q6,708.80  ✅ Pagado  │
│ 4 Oct 2024  Q6,708.80  ✅ Pagado  │
└────────────────────────────────────┘
```

## 🔄 Sincronización con Webhooks

### Eventos importantes a manejar:

1. **`charge.succeeded`** - Cobro mensual/anual exitoso
   ```typescript
   // Actualizar current_period_end
   await supabase
     .from('subscriptions')
     .update({
       current_period_start: newPeriodStart,
       current_period_end: newPeriodEnd,
       status: 'active',
       updated_at: new Date().toISOString()
     })
     .eq('recurrente_subscription_id', subscriptionId)
   ```

2. **`charge.failed`** - Cobro fallido
   ```typescript
   // Cambiar status a past_due
   await supabase
     .from('subscriptions')
     .update({
       status: 'past_due',
       updated_at: new Date().toISOString()
     })
     .eq('recurrente_subscription_id', subscriptionId)
   ```

3. **`subscription.cancelled`** - Suscripción cancelada
   ```typescript
   // Cambiar status a cancelled
   await supabase
     .from('subscriptions')
     .update({
       status: 'cancelled',
       cancelled_at: new Date().toISOString(),
       updated_at: new Date().toISOString()
     })
     .eq('recurrente_subscription_id', subscriptionId)
   ```

## 💡 Composable Recomendado

Crea: `composables/useCurrentSubscription.ts`

```typescript
export const useCurrentSubscription = () => {
  const subscription = ref<any>(null)
  const isLoading = ref(false)
  
  const loadSubscription = async () => {
    isLoading.value = true
    try {
      const response = await $fetch('/api/subscription/current')
      if (response.success) {
        subscription.value = response.data
      }
    } finally {
      isLoading.value = false
    }
  }
  
  const planName = computed(() => {
    const plans = {
      starter: 'Starter',
      business: 'Business', 
      enterprise: 'Enterprise'
    }
    return plans[subscription.value?.planCode] || 'Free'
  })
  
  const isActive = computed(() => {
    return subscription.value?.status === 'active'
  })
  
  const isPastDue = computed(() => {
    return subscription.value?.status === 'past_due'
  })
  
  return {
    subscription,
    isLoading,
    loadSubscription,
    planName,
    isActive,
    isPastDue,
  }
}
```

## 📱 Uso en el Dashboard

```vue
<script setup>
const { 
  subscription, 
  isLoading, 
  loadSubscription,
  planName,
  isActive 
} = useCurrentSubscription()

onMounted(() => {
  loadSubscription()
})
</script>

<template>
  <VCard v-if="subscription">
    <VCardItem :title="`Plan ${planName}`">
      <template #append>
        <VChip :color="isActive ? 'success' : 'warning'">
          {{ isActive ? 'Activo' : subscription.status }}
        </VChip>
      </template>
    </VCardItem>
    
    <VCardText>
      <!-- Mostrar toda la información de suscripción -->
    </VCardText>
  </VCard>
</template>
```

## 🎯 Resumen

Para mantener la información de suscripción en el dashboard:

1. **Webhook guarda datos** en Supabase cuando hay un pago
2. **Endpoint `/api/subscription/current`** devuelve la suscripción activa
3. **Dashboard consulta** el endpoint y muestra los datos
4. **Webhooks actualizan** automáticamente en cada cobro

**Archivos que ya tienes listos:**
- ✅ `server/api/recurrente/webhooks.post.ts` (agregar lógica de guardar)
- ✅ Estructura de tabla documentada
- ✅ Ejemplos de queries

**Archivos a crear:**
- `server/api/subscription/current.get.ts`
- `composables/useCurrentSubscription.ts`

¿Quieres que implemente estos archivos ahora? 🚀

