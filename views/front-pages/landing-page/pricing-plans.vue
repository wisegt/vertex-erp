<script setup lang="ts">
import sectionTitleIcon from '@images/pages/section-title-icon.png'

const {
  plans,
  isLoading,
  loadPricingData,
  getPlansByType,
  getDisplayPrice,
  formatCurrency,
  discountLabel,
  discountPromoText,
  currencySymbol,
  isRealtimeConnected,
} = usePricing()

const pricingTab = ref('empresa')
const billingPeriod = ref<'monthly' | 'yearly'>('yearly')

// Cargar planes al montar
onMounted(async () => {
  await loadPricingData()
})

// Función para extraer el código base del plan (sin sufijo "anual")
const getBaseCode = (code: string): string => {
  return code.toLowerCase().replace('anual', '')
}

// Planes filtrados por tipo y periodo de facturación
const currentPlans = computed(() => {
  // Mapear el billingPeriod del frontend al billing_interval de la BD
  const targetInterval = billingPeriod.value === 'yearly' ? 'annual' : 'monthly'
  
  return plans.value
    .filter(p => {
      // Filtrar por tipo de plan
      if (p.planType !== pricingTab.value) return false
      
      // Filtrar por intervalo de facturación
      // Verificar ambos campos para compatibilidad
      const planInterval = p.billingInterval || p.billingPeriod
      return planInterval === targetInterval
    })
    .sort((a, b) => a.displayOrder - b.displayOrder)
})

// Determinar variante del botón
const getButtonVariant = (plan: any): 'elevated' | 'outlined' => {
  return plan.isPopular ? 'elevated' : 'outlined'
}

// Función para obtener el valor de una característica para un plan específico
// Usa el código base (sin "anual") para hacer match con las claves de las features
const getFeatureValue = (feature: any, plan: any) => {
  if (!plan) return false
  // Extraer código base: "starteranual" -> "starter", "businessanual" -> "business"
  const baseCode = getBaseCode(plan.code)
  return feature[baseCode] ?? false
}

// Tabla comparativa de características por tipo
const featuresEmpresa = [
  { feature: 'Prueba gratuita 14 días', starter: true, business: true, enterprise: true },
  { feature: 'Usuarios incluidos', starter: '3', business: '10', enterprise: 'Ilimitados' },
  { feature: 'Facturas FEL mensuales', starter: '500', business: '2,000', enterprise: 'Ilimitadas' },
  { feature: 'Bodegas', starter: '1', business: '3', enterprise: 'Ilimitadas' },
  { feature: 'Punto de Venta (POS)', starter: true, business: true, enterprise: true },
  { feature: 'Contabilidad completa', starter: false, business: true, enterprise: true },
  { feature: 'Módulo de Bancos', starter: false, business: true, enterprise: true },
  { feature: 'Cuentas por cobrar y pagar', starter: false, business: true, enterprise: true },
  { feature: 'Multi-empresa', starter: false, business: false, enterprise: true },
  { feature: 'API e Integraciones', starter: false, business: false, enterprise: true },
  { feature: 'Soporte prioritario', starter: false, business: true, enterprise: true },
  { feature: 'Soporte dedicado 24/7', starter: false, business: false, enterprise: true },
]

const featuresContador = [
  { feature: 'Prueba gratuita 14 días', independiente: true, despacho: true, firma: true },
  { feature: 'Empresas incluidas', independiente: '5', despacho: '20', firma: 'Ilimitadas' },
  { feature: 'Usuarios del despacho', independiente: '1', despacho: '5', firma: 'Ilimitados' },
  { feature: 'Contabilidad completa', independiente: true, despacho: true, firma: true },
  { feature: 'Reportes SAT', independiente: true, despacho: true, firma: true },
  { feature: 'Portal para clientes', independiente: false, despacho: true, firma: true },
  { feature: 'Marca blanca', independiente: false, despacho: true, firma: true },
  { feature: 'Consolidación', independiente: false, despacho: false, firma: true },
  { feature: 'API completa', independiente: false, despacho: false, firma: true },
  { feature: 'Capacitación incluida', independiente: false, despacho: false, firma: true },
]

const currentFeatures = computed(() => {
  return pricingTab.value === 'empresa' ? featuresEmpresa : featuresContador
})
</script>

<template>
  <VContainer id="pricing-plan">
    <div class="pricing-plans d-flex flex-column gap-8">
      <div class="headers d-flex justify-center flex-column align-center">
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div
            class="text-body-1 text-high-emphasis font-weight-medium"
            style="letter-spacing: 0.15px !important;"
          >
            PLANES Y PRECIOS
          </div>
        </div>

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Elige el plan
          </span> <span class="text-h5 d-inline-block">perfecto para ti</span>
        </div>

        <p
          class="text-body-1 font-weight-medium text-center"
          style="letter-spacing: 0.15px !important;"
        >
          Dos modalidades diseñadas para diferentes necesidades.
          Todos los planes incluyen actualizaciones y soporte técnico.
        </p>
      </div>

      <!-- Tabs de modalidad -->
      <div class="d-flex justify-center">
        <VCard variant="outlined" class="pricing-tabs-card">
          <div class="d-flex">
            <VBtn
              :variant="pricingTab === 'empresa' ? 'flat' : 'text'"
              :color="pricingTab === 'empresa' ? 'primary' : 'default'"
              size="large"
              class="pricing-tab-btn"
              @click="pricingTab = 'empresa'"
            >
              <VIcon icon="ri-building-line" class="me-2" />
              Empresas
            </VBtn>
            <VBtn
              :variant="pricingTab === 'contador' ? 'flat' : 'text'"
              :color="pricingTab === 'contador' ? 'primary' : 'default'"
              size="large"
              class="pricing-tab-btn"
              @click="pricingTab = 'contador'"
            >
              <VIcon icon="ri-user-settings-line" class="me-2" />
              Contadores
            </VBtn>
          </div>
        </VCard>
      </div>

      <div class="text-center">
        <VChip
          v-if="pricingTab === 'empresa'"
          color="primary"
          variant="tonal"
          size="small"
          class="mb-4"
        >
          Para comercios, distribuidoras e industrias
        </VChip>
        <VChip
          v-else
          color="success"
          variant="tonal"
          size="small"
          class="mb-4"
        >
          Para contadores independientes, despachos y firmas
        </VChip>
      </div>

      <!-- Toggle mensual/anual -->
      <div class="d-flex align-center justify-center flex-wrap gap-4">
        <VCard variant="outlined" class="billing-tabs-card">
          <div class="d-flex">
            <VBtn
              :variant="billingPeriod === 'monthly' ? 'flat' : 'text'"
              :color="billingPeriod === 'monthly' ? 'primary' : 'default'"
              class="billing-tab-btn"
              @click="billingPeriod = 'monthly'"
            >
              Mensual
            </VBtn>
            <VBtn
              :variant="billingPeriod === 'yearly' ? 'flat' : 'text'"
              :color="billingPeriod === 'yearly' ? 'primary' : 'default'"
              class="billing-tab-btn"
              @click="billingPeriod = 'yearly'"
            >
              Anual
              <VChip color="success" size="x-small" class="ms-2">{{ discountLabel }}</VChip>
            </VBtn>
          </div>
        </VCard>
      </div>

      <!-- Alert de ahorro cuando es anual -->
      <div v-if="billingPeriod === 'yearly'" class="text-center">
        <VChip color="success" variant="flat" size="small">
          <VIcon icon="ri-gift-line" size="16" class="me-1" />
          {{ discountPromoText }}
        </VChip>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="d-flex justify-center py-12">
        <VProgressCircular indeterminate color="primary" size="48" />
      </div>

      <!-- Plans grid -->
      <VRow v-else>
        <VCol
          v-for="plan in currentPlans"
          :key="`${pricingTab}-${billingPeriod}-${plan.id}`"
          cols="12"
          md="4"
        >
          <VCard
            flat
            border
            :style="plan.isPopular ? 'border:2px solid rgb(var(--v-theme-primary))' : ''"
            class="h-100"
          >
            <VCardText class="pa-lg-8 text-no-wrap d-flex flex-column h-100">
              <div class="d-flex flex-column gap-y-5 flex-grow-1">
                <div class="d-flex flex-column gap-y-3">
                  <div class="d-flex align-center justify-space-between">
                    <h4 class="text-h4">
                      {{ plan.name }}
                    </h4>
                    <VChip
                      v-if="plan.isPopular"
                      color="primary"
                      size="small"
                    >
                      Recomendado
                    </VChip>
                  </div>

                  <p class="text-body-2 text-medium-emphasis mb-0" style="white-space: normal;">
                    {{ plan.description }}
                  </p>

                  <!-- Icon Avatar -->
                  <div class="d-flex justify-center my-3">
                    <VAvatar
                      :color="plan.iconColor"
                      variant="tonal"
                      size="80"
                    >
                      <VIcon :icon="plan.icon" size="40" />
                    </VAvatar>
                  </div>

                  <!-- Precio dinámico -->
                  <div class="d-flex flex-column align-center">
                    <div class="d-flex align-end gap-x-1 justify-center">
                      <div class="d-flex align-start">
                        <span class="text-h6 mt-1">{{ currencySymbol }}</span>
                        <!-- Para planes anuales, mostrar precio mensual equivalente -->
                        <span class="plan-price-text">{{ 
                          formatCurrency(
                            billingPeriod === 'yearly' 
                              ? Math.floor(plan.price / 12) 
                              : plan.price
                          ) 
                        }}</span>
                      </div>
                      <span class="text-body-1 text-medium-emphasis mb-2">/mes</span>
                    </div>
                    
                    <!-- Precio total anual cuando está en modo anual -->
                    <div v-if="billingPeriod === 'yearly'" class="text-center">
                      <div class="text-caption text-success font-weight-medium">
                        {{ currencySymbol }}{{ formatCurrency(plan.price) }}/año
                      </div>
                      <div class="text-caption text-medium-emphasis">
                        Ahorras {{ currencySymbol }}{{ formatCurrency(Math.round((plan.price / 10) * 2)) }}
                      </div>
                    </div>
                  </div>

                  <VDivider />
                </div>

                <div class="d-flex flex-column flex-grow-1">
                  <VList class="card-list">
                    <VListItem
                      v-for="(feature, i) in plan.features"
                      :key="i"
                      class="px-0"
                      min-height="36"
                    >
                      <template #prepend>
                        <VIcon
                          icon="ri-checkbox-circle-line"
                          color="primary"
                          size="20"
                          class="me-3"
                        />
                      </template>
                      <span class="text-body-1">{{ feature }}</span>
                    </VListItem>
                  </VList>
                </div>

                <VBtn
                  block
                  :variant="getButtonVariant(plan)"
                  :to="{ 
                    name: 'front-pages-payment', 
                    query: { 
                      modalidad: pricingTab, 
                      plan: plan.code,
                      billing: billingPeriod 
                    } 
                  }"
                  :color="plan.isPopular ? 'primary' : undefined"
                >
                  {{ plan.buttonText }}
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Botón solicitar demo -->
      <div class="text-center mt-4">
        <p class="text-body-1 text-medium-emphasis mb-4">
          ¿Prefieres una demostración personalizada antes de decidir?
        </p>
        <VBtn
          size="large"
          class="neon-btn"
          href="#contact-us"
        >
          <VIcon icon="ri-video-chat-line" class="me-2" />
          Solicitar Demo
        </VBtn>
      </div>

      <div class="text-center">
        <p class="text-body-2 text-medium-emphasis">
          Todos los precios están en Quetzales (GTQ). IVA incluido.
        </p>
      </div>

      <!-- Tabla comparativa detallada -->
      <div class="mt-16">
        <div class="text-center pb-8">
          <h4 class="text-h4 mb-2">
            Comparación detallada de planes
          </h4>
          <p class="text-body-1 mb-0">
            Todas las funcionalidades para que elijas mejor
          </p>
        </div>

        <!-- Loading state para tabla -->
        <div v-if="isLoading" class="d-flex justify-center py-12">
          <VProgressCircular indeterminate color="primary" size="48" />
        </div>

        <VTable v-else class="text-no-wrap border rounded pricing-table">
          <thead>
            <tr>
              <th scope="col" class="py-4">CARACTERÍSTICA</th>
              <th
                v-for="plan in currentPlans"
                :key="plan.code"
                scope="col"
                class="text-center py-4"
              >
                <div class="position-relative">
                  {{ plan.name.toUpperCase() }}
                  <VAvatar
                    v-if="plan.isPopular"
                    rounded="lg"
                    color="primary"
                    size="18"
                    class="position-absolute ms-2"
                    style="inset-block-start: -0.25rem;"
                  >
                    <VIcon icon="ri-star-s-fill" size="14" />
                  </VAvatar>
                </div>
                <div class="text-body-2">
                  {{ currencySymbol }}{{ 
                    formatCurrency(
                      billingPeriod === 'yearly' 
                        ? Math.floor(plan.price / 12) 
                        : plan.price
                    ) 
                  }}/mes
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="feature in currentFeatures" :key="feature.feature">
              <td class="text-high-emphasis">{{ feature.feature }}</td>
              <td v-for="plan in currentPlans" :key="plan.code" class="text-center">
                <template v-if="typeof getFeatureValue(feature, plan) === 'boolean'">
                  <VIcon
                    :color="getFeatureValue(feature, plan) ? 'primary' : ''"
                    size="20"
                    :icon="getFeatureValue(feature, plan) ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'"
                  />
                </template>
                <template v-else>
                  <span class="text-body-1 font-weight-medium">
                    {{ getFeatureValue(feature, plan) }}
                  </span>
                </template>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td class="py-4" />
              <td v-for="plan in currentPlans" :key="plan.code" class="text-center py-4">
                <div class="d-flex flex-column gap-2 align-center">
                  <VBtn
                    color="primary"
                    variant="flat"
                    :to="{ name: 'front-pages-checkout' }"
                  >
                    Prueba Gratis
                  </VBtn>
                  <VBtn
                    :variant="getButtonVariant(plan)"
                    :color="plan.isPopular ? 'primary' : undefined"
                    :to="{ 
                      name: 'front-pages-payment', 
                      query: { 
                        modalidad: pricingTab, 
                        plan: plan.code,
                        billing: billingPeriod 
                      } 
                    }"
                  >
                    Elegir Plan
                  </VBtn>
                </div>
              </td>
            </tr>
          </tfoot>
        </VTable>
      </div>
    </div>

    <!-- Indicador de Realtime (solo desarrollo) -->
    <RealtimeIndicator :is-connected="isRealtimeConnected" label="Pricing Realtime" />
  </VContainer>
</template>

<style lang="scss">
.card-list {
  --v-card-list-gap: 8px;
}

.pricing-plans {
  margin-block: 5.25rem;
}

.pricing-table {
  --v-table-header-color: rgb(var(--v-theme-surface));

  &.v-table {
    .v-table__wrapper {
      table {
        thead tr th {
          border-block-end: 1px solid rgba(var(--v-theme-on-surface), var(--v-border-opacity)) !important;
        }
        tbody tr:nth-child(even) {
          background: rgba(var(--v-theme-on-surface), var(--v-hover-opacity));
        }
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.plan-price-text {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 40px;
  font-weight: 700;
  line-height: 48px;
}

.pricing-tabs-card,
.billing-tabs-card {
  border-radius: 12px;
  overflow: hidden;
}

.pricing-tab-btn {
  border-radius: 0;
  min-width: 160px;
}

.billing-tab-btn {
  border-radius: 0;
  min-width: 120px;
}

// Botón neón
.neon-btn {
  position: relative;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%);
  color: white !important;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  padding-inline: 2rem;
  box-shadow: 
    0 0 20px rgba(247, 147, 30, 0.5),
    0 0 40px rgba(247, 147, 30, 0.3),
    0 0 60px rgba(247, 147, 30, 0.1);
  transition: all 0.3s ease;
  animation: neon-pulse 2s ease-in-out infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 0 25px rgba(247, 147, 30, 0.7),
      0 0 50px rgba(247, 147, 30, 0.5),
      0 0 75px rgba(247, 147, 30, 0.3);
  }
}

@keyframes neon-pulse {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(247, 147, 30, 0.5),
      0 0 40px rgba(247, 147, 30, 0.3),
      0 0 60px rgba(247, 147, 30, 0.1);
  }
  50% {
    box-shadow: 
      0 0 25px rgba(247, 147, 30, 0.6),
      0 0 50px rgba(247, 147, 30, 0.4),
      0 0 75px rgba(247, 147, 30, 0.2);
  }
}
</style>
