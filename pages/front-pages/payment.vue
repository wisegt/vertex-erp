<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'

import visaDark from '@images/icons/payments/img/visa-dark.png'
import visaLight from '@images/icons/payments/img/visa-light.png'
import paypalDark from '@images/icons/payments/img/paypal-dark.png'
import paypalLight from '@images/icons/payments/img/paypal-light.png'

import { useConfigStore } from '@core/stores/config'

const visa = useGenerateImageVariant(visaLight, visaDark)
const paypal = useGenerateImageVariant(paypalLight, paypalDark)
const store = useConfigStore()
const route = useRoute()

// Usar composable de pricing con Realtime
const {
  plans,
  isLoading,
  loadPricingData,
  getDisplayPrice,
  getYearlySavings,
  calculateTax,
  formatCurrency,
  discountLabel,
  discountPromoText,
  monthsFree,
  taxPercentage,
  taxName,
  currencySymbol,
  isRealtimeConnected,
} = usePricing()

store.skin = 'default'
definePageMeta({
  layout: 'blank',
  public: true,
})

const selectedPaymentMethod = ref('card')
const isProcessing = ref(false)

// Get modalidad, plan and billing from query params
const selectedModalidad = ref((route.query.modalidad as string) || 'empresa')
const selectedPlanCode = ref((route.query.plan as string) || 'business')
const selectedBilling = ref<'monthly' | 'yearly'>((route.query.billing as 'monthly' | 'yearly') || 'yearly')

// Cargar planes desde la API
onMounted(async () => {
  await loadPricingData()
})

// Planes filtrados por modalidad actual
const currentPlans = computed(() => {
  return plans.value
    .filter(p => p.planType === selectedModalidad.value)
    .sort((a, b) => a.displayOrder - b.displayOrder)
})

// Plan seleccionado actualmente
const selectedPlanDetails = computed(() => {
  return currentPlans.value.find(p => p.code === selectedPlanCode.value) 
    || currentPlans.value.find(p => p.isPopular)
    || currentPlans.value[0]
})

// Watch for modalidad changes to reset plan selection to the popular plan
watch(selectedModalidad, (newVal) => {
  const plansForType = plans.value.filter(p => p.planType === newVal)
  const popularPlan = plansForType.find(p => p.isPopular)
  selectedPlanCode.value = popularPlan?.code || plansForType[0]?.code || ''
})

// Precio base según el tipo de facturación
const basePrice = computed(() => {
  if (!selectedPlanDetails.value) return 0
  return getDisplayPrice(selectedPlanDetails.value, selectedBilling.value)
})

// Precio total anual
const yearlyTotal = computed(() => {
  return selectedPlanDetails.value?.yearlyPrice || 0
})

// Ahorro anual
const yearlySavings = computed(() => {
  if (!selectedPlanDetails.value || selectedBilling.value !== 'yearly') return 0
  return getYearlySavings(selectedPlanDetails.value)
})

// Para pago mensual: precio mensual sin descuento
const monthlyTotal = computed(() => {
  return selectedPlanDetails.value?.price || 0
})

// Total base según billing
const totalBase = computed(() => {
  return selectedBilling.value === 'yearly' ? yearlyTotal.value : monthlyTotal.value
})

// IVA
const taxAmount = computed(() => {
  return calculateTax(totalBase.value)
})

// Total final con IVA
const totalAmount = computed(() => {
  return totalBase.value + taxAmount.value
})

// Función para obtener el precio a mostrar de cada plan en el selector
const getPlanDisplayPrice = (plan: any) => {
  return getDisplayPrice(plan, selectedBilling.value)
}

const handlePayment = () => {
  isProcessing.value = true
  // TODO: Implementar procesamiento de pago
  setTimeout(() => {
    isProcessing.value = false
  }, 2000)
}
</script>

<template>
  <div class="payment-page">
    <Navbar />

    <VContainer>
      <div class="d-flex justify-center align-center payment-card">
        <VCard width="100%">
          <!-- Loading state -->
          <div v-if="isLoading" class="d-flex justify-center align-center py-16">
            <VProgressCircular indeterminate color="primary" size="48" />
          </div>

          <VRow v-else>
            <VCol
              cols="12"
              md="8"
              :class="$vuetify.display.mdAndUp ? 'border-e' : 'border-b'"
            >
              <VCardText
                class="pa-8"
                :class="$vuetify.display.smAndDown ? 'pb-5' : 'pe-5'"
              >
                <div>
                  <h4 class="text-h4 mb-2">
                    Completa tu suscripción
                  </h4>
                  <div class="text-body-1">
                    Estás a un paso de transformar la gestión de tu negocio con VERTEX ERP. 
                    Completa los datos de pago para activar tu cuenta.
                  </div>
                </div>

                <!-- Método de pago -->
                <div class="my-8">
                  <h5 class="text-h5 mb-4">Método de pago</h5>
                  <VRow>
                    <VCol cols="12" sm="4">
                      <VCard
                        :variant="selectedPaymentMethod === 'card' ? 'outlined' : 'flat'"
                        :class="selectedPaymentMethod === 'card' ? 'border-primary' : 'border'"
                        class="cursor-pointer h-100"
                        @click="selectedPaymentMethod = 'card'"
                      >
                        <VCardText class="d-flex flex-column align-center text-center pa-4">
                          <VRadio
                            :model-value="selectedPaymentMethod"
                            value="card"
                            class="mb-2"
                          />
                          <img :src="visa" height="28" class="mb-2">
                          <div class="text-body-2">Tarjeta de Crédito/Débito</div>
                        </VCardText>
                      </VCard>
                    </VCol>
                    <VCol cols="12" sm="4">
                      <VCard
                        :variant="selectedPaymentMethod === 'paypal' ? 'outlined' : 'flat'"
                        :class="selectedPaymentMethod === 'paypal' ? 'border-primary' : 'border'"
                        class="cursor-pointer h-100"
                        @click="selectedPaymentMethod = 'paypal'"
                      >
                        <VCardText class="d-flex flex-column align-center text-center pa-4">
                          <VRadio
                            :model-value="selectedPaymentMethod"
                            value="paypal"
                            class="mb-2"
                          />
                          <img :src="paypal" height="28" class="mb-2">
                          <div class="text-body-2">PayPal</div>
                        </VCardText>
                      </VCard>
                    </VCol>
                    <VCol cols="12" sm="4">
                      <VCard
                        :variant="selectedPaymentMethod === 'transfer' ? 'outlined' : 'flat'"
                        :class="selectedPaymentMethod === 'transfer' ? 'border-primary' : 'border'"
                        class="cursor-pointer h-100"
                        @click="selectedPaymentMethod = 'transfer'"
                      >
                        <VCardText class="d-flex flex-column align-center text-center pa-4">
                          <VRadio
                            :model-value="selectedPaymentMethod"
                            value="transfer"
                            class="mb-2"
                          />
                          <VIcon icon="ri-bank-line" size="28" color="primary" class="mb-2" />
                          <div class="text-body-2">Transferencia Bancaria</div>
                        </VCardText>
                      </VCard>
                    </VCol>
                  </VRow>
                </div>

                <!-- Datos de facturación -->
                <div class="mb-7">
                  <h5 class="text-h5 mb-4">Datos de facturación</h5>
                  <VRow>
                    <VCol cols="12" md="6">
                      <VTextField
                        label="Nombre o Razón Social"
                        placeholder="Empresa S.A."
                      />
                    </VCol>
                    <VCol cols="12" md="6">
                      <VTextField
                        label="NIT"
                        placeholder="1234567-8"
                      />
                    </VCol>
                    <VCol cols="12" md="6">
                      <VTextField
                        label="Correo electrónico"
                        type="email"
                        placeholder="facturacion@empresa.com"
                      />
                    </VCol>
                    <VCol cols="12" md="6">
                      <VTextField
                        label="Teléfono"
                        placeholder="+502 2222-3333"
                      />
                    </VCol>
                    <VCol cols="12">
                      <VTextField
                        label="Dirección"
                        placeholder="Zona 10, Ciudad de Guatemala"
                      />
                    </VCol>
                  </VRow>
                </div>

                <!-- Datos de tarjeta -->
                <div v-if="selectedPaymentMethod === 'card'">
                  <h5 class="text-h5 mb-4">Datos de la tarjeta</h5>
                  <VRow>
                    <VCol cols="12">
                      <VTextField
                        label="Número de tarjeta"
                        placeholder="4242 4242 4242 4242"
                        type="text"
                      />
                    </VCol>
                    <VCol cols="12" md="4">
                      <VTextField
                        label="Nombre en la tarjeta"
                        placeholder="JUAN PEREZ"
                      />
                    </VCol>
                    <VCol cols="12" md="4">
                      <VTextField
                        label="Fecha de expiración"
                        placeholder="MM/AA"
                      />
                    </VCol>
                    <VCol cols="12" md="4">
                      <VTextField
                        label="CVV"
                        type="password"
                        placeholder="***"
                        maxlength="4"
                      />
                    </VCol>
                  </VRow>
                </div>

                <!-- PayPal -->
                <div v-if="selectedPaymentMethod === 'paypal'">
                  <VAlert color="info" variant="tonal" class="mb-4">
                    <template #prepend>
                      <img :src="paypal" height="24">
                    </template>
                    <div class="text-body-1">
                      Al hacer clic en "Pagar con PayPal", serás redirigido a PayPal para completar tu pago de forma segura.
                    </div>
                  </VAlert>
                </div>

                <!-- Instrucciones de transferencia -->
                <div v-if="selectedPaymentMethod === 'transfer'">
                  <h5 class="text-h5 mb-4">Datos para transferencia</h5>
                  <VAlert color="info" variant="tonal" class="mb-4">
                    <div class="text-body-1">
                      Realiza la transferencia a la siguiente cuenta y envíanos el comprobante a 
                      <strong>pagos@vertexerp.app</strong>
                    </div>
                  </VAlert>
                  <VCard variant="outlined" class="mb-4">
                    <VCardText>
                      <div class="d-flex flex-column gap-3">
                        <div class="d-flex justify-space-between">
                          <span class="text-medium-emphasis">Banco:</span>
                          <span class="font-weight-medium">Banco Industrial</span>
                        </div>
                        <div class="d-flex justify-space-between">
                          <span class="text-medium-emphasis">Tipo de cuenta:</span>
                          <span class="font-weight-medium">Monetaria</span>
                        </div>
                        <div class="d-flex justify-space-between">
                          <span class="text-medium-emphasis">Número de cuenta:</span>
                          <span class="font-weight-medium">001-123456-7</span>
                        </div>
                        <div class="d-flex justify-space-between">
                          <span class="text-medium-emphasis">A nombre de:</span>
                          <span class="font-weight-medium">Wais Consultores, S.A.</span>
                        </div>
                      </div>
                    </VCardText>
                  </VCard>
                </div>
              </VCardText>
            </VCol>

            <VCol cols="12" md="4">
              <VCardText
                class="pa-8"
                :class="$vuetify.display.smAndDown ? '' : 'ps-5'"
              >
                <div class="mb-6">
                  <h5 class="text-h5 mb-2">Resumen del pedido</h5>
                  <div class="text-body-2 text-medium-emphasis">
                    Tu suscripción se renovará automáticamente cada {{ selectedBilling === 'yearly' ? 'año' : 'mes' }}.
                  </div>
                </div>

                <!-- Selector de modalidad -->
                <div class="mb-4">
                  <div class="text-body-2 font-weight-medium mb-2">Modalidad</div>
                  <VBtnToggle
                    v-model="selectedModalidad"
                    mandatory
                    color="primary"
                    variant="outlined"
                    density="compact"
                    class="w-100"
                  >
                    <VBtn value="empresa" class="flex-grow-1">
                      <VIcon icon="ri-building-line" size="18" class="me-1" />
                      Empresa
                    </VBtn>
                    <VBtn value="contador" class="flex-grow-1">
                      <VIcon icon="ri-user-settings-line" size="18" class="me-1" />
                      Contador
                    </VBtn>
                  </VBtnToggle>
                </div>

                <!-- Toggle de facturación -->
                <div class="mb-4">
                  <div class="text-body-2 font-weight-medium mb-2">Facturación</div>
                  <VBtnToggle
                    v-model="selectedBilling"
                    mandatory
                    color="primary"
                    variant="outlined"
                    density="compact"
                    class="w-100"
                  >
                    <VBtn value="monthly" class="flex-grow-1">
                      Mensual
                    </VBtn>
                    <VBtn value="yearly" class="flex-grow-1">
                      Anual
                      <VChip color="success" size="x-small" class="ms-1">{{ discountLabel }}</VChip>
                    </VBtn>
                  </VBtnToggle>
                </div>

                <!-- Plan selection -->
                <VCard flat color="rgba(var(--v-theme-on-surface), var(--v-hover-opacity))" class="mb-4">
                  <VCardText class="pa-4">
                    <div class="text-body-2 font-weight-medium mb-3">Selecciona tu plan</div>
                    <div class="d-flex flex-column gap-2">
                      <VCard
                        v-for="plan in currentPlans"
                        :key="plan.id"
                        :variant="selectedPlanCode === plan.code ? 'outlined' : 'flat'"
                        :class="selectedPlanCode === plan.code ? 'border-primary' : ''"
                        class="cursor-pointer"
                        @click="selectedPlanCode = plan.code"
                      >
                        <VCardText class="d-flex align-center gap-3 pa-3">
                          <VRadio
                            :model-value="selectedPlanCode"
                            :value="plan.code"
                          />
                          <VAvatar :color="plan.iconColor" variant="tonal" size="36">
                            <VIcon :icon="plan.icon" size="20" />
                          </VAvatar>
                          <div class="flex-grow-1">
                            <div class="text-body-1 font-weight-medium">{{ plan.name }}</div>
                          </div>
                          <div class="text-end">
                            <div class="text-body-1 font-weight-medium text-primary">
                              {{ currencySymbol }}{{ formatCurrency(getPlanDisplayPrice(plan)) }}
                            </div>
                            <div v-if="selectedBilling === 'yearly'" class="text-caption text-medium-emphasis text-decoration-line-through">
                              {{ currencySymbol }}{{ formatCurrency(plan.price) }}
                            </div>
                          </div>
                        </VCardText>
                      </VCard>
                    </div>
                  </VCardText>
                </VCard>

                <!-- Alert de ahorro cuando es anual -->
                <VAlert
                  v-if="selectedBilling === 'yearly' && yearlySavings > 0"
                  color="success"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  <template #prepend>
                    <VIcon icon="ri-gift-line" />
                  </template>
                  <div class="text-body-2">
                    <strong>¡Ahorras {{ currencySymbol }}{{ formatCurrency(yearlySavings) }} al año!</strong>
                  </div>
                </VAlert>

                <!-- Summary -->
                <div class="my-5">
                  <div class="d-flex justify-space-between mb-2">
                    <div class="text-body-1">
                      Plan {{ selectedPlanDetails?.name }} ({{ selectedBilling === 'yearly' ? 'anual' : 'mensual' }})
                    </div>
                    <div class="text-body-1 font-weight-medium text-high-emphasis">
                      {{ currencySymbol }}{{ formatCurrency(totalBase) }}
                    </div>
                  </div>
                  <div v-if="selectedBilling === 'yearly'" class="d-flex justify-space-between mb-2 text-success">
                    <div class="text-body-2">Descuento ({{ monthsFree }} meses gratis)</div>
                    <div class="text-body-2 font-weight-medium">
                      -{{ currencySymbol }}{{ formatCurrency(yearlySavings) }}
                    </div>
                  </div>
                  <div class="d-flex justify-space-between">
                    <div class="text-body-1">{{ taxName }} ({{ taxPercentage }}%)</div>
                    <div class="text-body-1 font-weight-medium text-high-emphasis">
                      {{ currencySymbol }}{{ formatCurrency(taxAmount) }}
                    </div>
                  </div>
                  <VDivider class="my-4" />
                  <div class="d-flex justify-space-between">
                    <div class="text-body-1 font-weight-medium">Total a pagar</div>
                    <div class="text-h6 text-primary">
                      {{ currencySymbol }}{{ formatCurrency(totalAmount) }}
                    </div>
                  </div>
                  <div v-if="selectedBilling === 'yearly'" class="text-caption text-medium-emphasis text-end mt-1">
                    (equivalente a {{ currencySymbol }}{{ formatCurrency(basePrice) }}/mes)
                  </div>
                </div>

                <VBtn
                  block
                  color="success"
                  class="mb-6"
                  :loading="isProcessing"
                  @click="handlePayment"
                >
                  <VIcon v-if="selectedPaymentMethod === 'paypal'" class="me-2">
                    <img :src="paypal" height="18" style="filter: brightness(0) invert(1);">
                  </VIcon>
                  {{ selectedPaymentMethod === 'card' ? 'Pagar ahora' : selectedPaymentMethod === 'paypal' ? 'Pagar con PayPal' : 'Confirmar pedido' }}
                  <VIcon icon="ri-arrow-right-line" class="ms-2" />
                </VBtn>

                <VAlert color="success" variant="tonal" density="compact" class="mb-4">
                  <template #prepend>
                    <VIcon icon="ri-shield-check-line" />
                  </template>
                  <div class="text-body-2">
                    Pago 100% seguro con encriptación SSL
                  </div>
                </VAlert>

                <div class="text-body-2 text-medium-emphasis">
                  Al continuar, aceptas nuestros 
                  <a href="#" class="text-primary">Términos de Servicio</a> y 
                  <a href="#" class="text-primary">Política de Privacidad</a>. 
                  Ofrecemos garantía de satisfacción de 30 días.
                </div>
              </VCardText>
            </VCol>
          </VRow>
        </VCard>
      </div>
    </VContainer>

    <Footer />

    <!-- Indicador de Realtime (solo desarrollo) -->
    <RealtimeIndicator :is-connected="isRealtimeConnected" label="Pricing Realtime" />
  </div>
</template>

<style lang="scss" scoped>
.payment-card {
  margin-block: 9.25rem 5.25rem;
}

.payment-page {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
