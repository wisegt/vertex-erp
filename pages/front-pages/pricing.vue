<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import { useConfigStore } from '@core/stores/config'
import poseFs9 from '@images/pages/pose-fs-9.png'

interface Plan {
  id: string
  name: string
  code: string
  planType: string
  description: string
  price: number
  yearlyPrice: number
  features: string[]
  isPopular: boolean
  buttonText: string
  icon: string
  iconColor: string
  displayOrder: number
}

const store = useConfigStore()

store.skin = 'default'

definePageMeta({
  layout: 'blank',
  public: true,
})

// State
const pricingTab = ref('empresa')
const billingPeriod = ref('yearly') // 'monthly' o 'yearly'
const isLoading = ref(true)
const allPlans = ref<Plan[]>([])

// Cargar planes al montar
onMounted(async () => {
  await fetchPlans()
})

const fetchPlans = async () => {
  isLoading.value = true
  try {
    const response = await $fetch('/api/plans')
    if (response.success) {
      allPlans.value = response.data
    }
  } catch (error) {
    console.error('Error fetching plans:', error)
  } finally {
    isLoading.value = false
  }
}

// Función para formatear moneda en Quetzales
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

// Planes filtrados por tipo
const currentPlans = computed(() => {
  return allPlans.value
    .filter(p => p.planType === pricingTab.value)
    .sort((a, b) => a.displayOrder - b.displayOrder)
})

// Función para obtener el precio a mostrar
const getDisplayPrice = (plan: Plan) => {
  if (billingPeriod.value === 'yearly') {
    return Math.floor(plan.yearlyPrice / 12)
  }
  return plan.price
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

const planHeaders = computed(() => {
  return currentPlans.value.map(plan => ({
    plan: plan.name.toUpperCase(),
    value: plan.code,
    price: getDisplayPrice(plan),
    popular: plan.isPopular,
  }))
})

const getFeatureValue = (feature: any, planIndex: number) => {
  const plan = currentPlans.value[planIndex]
  if (!plan) return false
  return feature[plan.code] ?? false
}

const faqs = [
  {
    question: '¿Qué incluye la prueba gratuita de 14 días?',
    answer: 'La prueba gratuita incluye acceso completo a todas las funcionalidades del plan que elijas. No se requiere tarjeta de crédito para iniciar. Al finalizar los 14 días, puedes elegir continuar con un plan de pago o tus datos serán archivados por 30 días adicionales.',
  },
  {
    question: '¿Cómo se procesan los pagos?',
    answer: 'Aceptamos pagos con tarjeta de crédito/débito (Visa, MasterCard), PayPal, transferencia bancaria y depósito monetario. Para clientes empresariales, también ofrecemos facturación mensual con crédito previa aprobación.',
  },
  {
    question: '¿Puedo cambiar de plan después?',
    answer: 'Sí, puedes subir o bajar de plan en cualquier momento. Si subes de plan, se te cobrará la diferencia prorrateada. Si bajas de plan, el cambio se aplicará en tu próximo ciclo de facturación.',
  },
  {
    question: '¿Tienen garantía de devolución?',
    answer: 'Sí, ofrecemos garantía de satisfacción de 30 días. Si por cualquier razón no estás satisfecho con VERTEX ERP, te devolvemos el 100% de tu pago sin preguntas.',
  },
]
</script>

<template>
  <div class="pricing-page">
    <Navbar />

    <VCard class="pricing-card">
      <VContainer>
        <div class="pricing-section">
          <!-- Header -->
          <div class="text-center mb-6">
            <h2 class="text-h2 pb-2">
              Planes y Precios
            </h2>
            <p class="text-body-1 mb-0">
              Elige la modalidad y el plan que mejor se adapte a tu negocio.
              <br>
              Todos los planes incluyen actualizaciones y soporte técnico.
            </p>
          </div>

          <!-- Tabs -->
          <div class="d-flex justify-center mb-6">
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

          <div class="text-center mb-6">
            <VChip
              v-if="pricingTab === 'empresa'"
              color="primary"
              variant="tonal"
              size="small"
            >
              Para comercios, distribuidoras e industrias
            </VChip>
            <VChip
              v-else
              color="success"
              variant="tonal"
              size="small"
            >
              Para contadores independientes, despachos y firmas
            </VChip>
          </div>

          <!-- Toggle mensual/anual -->
          <div class="d-flex align-center justify-center flex-wrap gap-4 mb-6">
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
                  <VChip color="success" size="x-small" class="ms-2">−17%</VChip>
                </VBtn>
              </div>
            </VCard>
          </div>

          <!-- Alert de ahorro cuando es anual -->
          <div v-if="billingPeriod === 'yearly'" class="text-center mb-6">
            <VChip color="success" variant="flat" size="small">
              <VIcon icon="ri-gift-line" size="16" class="me-1" />
              ¡Paga 10 meses y obtén 12! Ahorra 2 meses completos
            </VChip>
          </div>

          <!-- Loading state -->
          <div v-if="isLoading" class="d-flex justify-center py-12">
            <VProgressCircular indeterminate color="primary" size="48" />
          </div>

          <!-- Pricing Cards -->
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
                :class="plan.isPopular ? 'border-primary border-opacity-100' : ''"
              >
                <VCardText class="text-end pt-4" style="block-size: 3.75rem;">
                  <VChip v-show="plan.isPopular" color="primary" size="small">
                    Recomendado
                  </VChip>
                </VCardText>

                <VCardText class="text-center">
                  <VAvatar
                    :color="plan.iconColor"
                    variant="tonal"
                    size="100"
                    class="mb-5"
                  >
                    <VIcon :icon="plan.icon" size="48" />
                  </VAvatar>
                  <h4 class="text-h4 mb-1">
                    {{ plan.name }}
                  </h4>
                  <p class="mb-0 text-body-1">
                    {{ plan.description }}
                  </p>
                </VCardText>

                <VCardText class="position-relative text-center">
                  <div>
                    <div class="d-flex justify-center align-center">
                      <span class="text-body-1 font-weight-medium align-self-start">Q</span>
                      <h1 class="text-h1 font-weight-medium text-primary">
                        {{ formatCurrency(getDisplayPrice(plan)) }}
                      </h1>
                      <span class="text-body-1 font-weight-medium align-self-end">/mes</span>
                    </div>
                    <!-- Precio original tachado si es anual -->
                    <div v-if="billingPeriod === 'yearly'" class="text-center">
                      <span class="text-body-2 text-medium-emphasis text-decoration-line-through">
                        Q{{ formatCurrency(plan.price) }}/mes
                      </span>
                      <div class="text-caption text-success font-weight-medium">
                        Q{{ formatCurrency(plan.yearlyPrice) }}/año
                      </div>
                    </div>
                  </div>
                </VCardText>

                <VCardText class="pt-2">
                  <VList class="card-list pb-5">
                    <VListItem v-for="feature in plan.features" :key="feature">
                      <VListItemTitle class="text-body-1 d-flex align-center">
                        <VIcon :size="14" icon="ri-checkbox-circle-line" color="primary" class="me-2" />
                        <div class="text-truncate">
                          {{ feature }}
                        </div>
                      </VListItemTitle>
                    </VListItem>
                  </VList>

                  <VBtn
                    :active="false"
                    block
                    color="primary"
                    :variant="plan.isPopular ? 'elevated' : 'outlined'"
                    :to="{ 
                      name: 'front-pages-payment', 
                      query: { 
                        modalidad: pricingTab, 
                        plan: plan.code,
                        billing: billingPeriod
                      } 
                    }"
                  >
                    {{ plan.buttonText }}
                  </VBtn>
                </VCardText>
              </VCard>
            </VCol>
          </VRow>

          <!-- Botón solicitar demo -->
          <div class="text-center mt-8">
            <p class="text-body-1 text-medium-emphasis mb-4">
              ¿Prefieres una demostración personalizada antes de decidir?
            </p>
            <VBtn
              size="large"
              class="neon-btn"
              :to="{ name: 'index', hash: '#contact-us' }"
            >
              <VIcon icon="ri-video-chat-line" class="me-2" />
              Solicitar Demo
            </VBtn>
          </div>
        </div>
      </VContainer>

      <!-- Banner prueba gratis -->
      <div class="page-pricing-free-trial-banner-bg">
        <VContainer>
          <div class="d-flex align-center flex-md-row flex-column position-relative">
            <div class="text-center text-md-start py-10 px-10 px-sm-0">
              <h4 class="text-h4 text-primary mb-2">
                ¿Aún no estás seguro? Comienza con 14 días GRATIS
              </h4>
              <p class="text-body-1">
                Acceso completo a todas las funcionalidades. Sin tarjeta de crédito.
              </p>
              <VBtn class="mt-4" :to="{ name: 'front-pages-checkout' }">
                Comenzar Prueba Gratuita
              </VBtn>
            </div>
            <div class="free-trial-illustrator">
              <VImg :src="poseFs9" :width="250" />
            </div>
          </div>
        </VContainer>
      </div>

      <!-- Tabla comparativa -->
      <VContainer>
        <div class="pricing-section">
          <div class="text-center pb-6">
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
                  v-for="header in planHeaders"
                  :key="header.plan"
                  scope="col"
                  class="text-center py-4"
                >
                  <div class="position-relative">
                    {{ header.plan }}
                    <VAvatar
                      v-if="header.popular"
                      rounded="lg"
                      color="primary"
                      size="18"
                      class="position-absolute ms-2"
                      style="inset-block-start: -0.25rem;"
                    >
                      <VIcon icon="ri-star-s-fill" size="14" />
                    </VAvatar>
                  </div>
                  <div class="text-body-2">Q{{ formatCurrency(header.price) }}/mes</div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="feature in currentFeatures" :key="feature.feature">
                <td class="text-high-emphasis">{{ feature.feature }}</td>
                <td v-for="(_, index) in currentPlans" :key="index" class="text-center">
                  <template v-if="typeof getFeatureValue(feature, index) === 'boolean'">
                    <VIcon
                      :color="getFeatureValue(feature, index) ? 'primary' : ''"
                      size="20"
                      :icon="getFeatureValue(feature, index) ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'"
                    />
                  </template>
                  <template v-else>
                    <span class="text-body-1 font-weight-medium">
                      {{ getFeatureValue(feature, index) }}
                    </span>
                  </template>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td class="py-4" />
                <td v-for="(header, index) in planHeaders" :key="index" class="text-center py-4">
                  <VBtn
                    :variant="header.popular ? 'elevated' : 'outlined'"
                    :to="{ 
                      name: 'front-pages-payment',
                      query: {
                        modalidad: pricingTab,
                        plan: header.value,
                        billing: billingPeriod
                      }
                    }"
                  >
                    Elegir Plan
                  </VBtn>
                </td>
              </tr>
            </tfoot>
          </VTable>
        </div>
      </VContainer>

      <!-- FAQ -->
      <div class="bg-background">
        <VContainer>
          <div class="pricing-section">
            <div class="text-center">
              <h4 class="text-h4 mb-2">Preguntas Frecuentes</h4>
              <p class="text-body-1 mb-0">Resolvemos tus dudas sobre precios y facturación</p>
            </div>
            <div class="pt-6">
              <VExpansionPanels>
                <VExpansionPanel
                  v-for="faq in faqs"
                  :key="faq.question"
                  :title="faq.question"
                  :text="faq.answer"
                />
              </VExpansionPanels>
            </div>
          </div>
        </VContainer>
      </div>
      <Footer />
    </VCard>
  </div>
</template>

<style lang="scss" scoped>
.pricing-section {
  padding-block: 5.25rem !important;
  padding-inline: 0 !important;
}

.page-pricing-free-trial-banner-bg {
  background-color: rgba(var(--v-theme-primary), 0.16);
}

.pricing-card {
  padding-block-start: 4rem !important;
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

.card-list {
  --v-card-list-gap: 1rem;
}

// Botón neón
.neon-btn {
  position: relative;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%) !important;
  color: white !important;
  font-weight: 600;
  border: none !important;
  border-radius: 50px;
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

@media screen and (min-width: 960px) {
  .free-trial-illustrator {
    position: absolute;
    inset-block-end: -1rem !important;
    inset-inline-end: 5%;
  }
}

@media screen and (max-width: 959px) {
  .free-trial-illustrator {
    position: relative;
    inset-block-end: -1rem !important;
  }
}
</style>

<style lang="scss">
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

.pricing-page {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
