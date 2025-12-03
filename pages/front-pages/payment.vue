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

store.skin = 'default'
definePageMeta({
  layout: 'blank',
  public: true,
})

// Función para formatear moneda en Quetzales
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const selectedPaymentMethod = ref('card')
const isProcessing = ref(false)

// Get modalidad, plan and billing from query params
const selectedModalidad = ref((route.query.modalidad as string) || 'empresa')
const selectedPlanValue = ref((route.query.plan as string) || 'business')
const selectedBilling = ref((route.query.billing as string) || 'monthly')

// Plan definitions with monthly and yearly prices
const planesEmpresa = [
  { title: 'Starter', value: 'starter', monthlyPrice: 299, yearlyPrice: 2990, icon: 'ri-rocket-line', iconColor: 'info' },
  { title: 'Business', value: 'business', monthlyPrice: 599, yearlyPrice: 5990, icon: 'ri-line-chart-line', iconColor: 'primary' },
  { title: 'Enterprise', value: 'enterprise', monthlyPrice: 999, yearlyPrice: 9990, icon: 'ri-building-2-line', iconColor: 'warning' },
]

const planesContador = [
  { title: 'Independiente', value: 'independiente', monthlyPrice: 199, yearlyPrice: 1990, icon: 'ri-user-line', iconColor: 'info' },
  { title: 'Despacho', value: 'despacho', monthlyPrice: 499, yearlyPrice: 4990, icon: 'ri-team-line', iconColor: 'primary' },
  { title: 'Firma', value: 'firma', monthlyPrice: 899, yearlyPrice: 8990, icon: 'ri-bank-line', iconColor: 'warning' },
]

const currentPlans = computed(() => {
  return selectedModalidad.value === 'empresa' ? planesEmpresa : planesContador
})

const selectedPlanDetails = computed(() => {
  return currentPlans.value.find(p => p.value === selectedPlanValue.value) || currentPlans.value[1]
})

// Precio base según el tipo de facturación
const basePrice = computed(() => {
  if (!selectedPlanDetails.value) return 0
  
  if (selectedBilling.value === 'yearly') {
    // Precio mensual equivalente del plan anual
    return Math.floor(selectedPlanDetails.value.yearlyPrice / 12)
  }
  return selectedPlanDetails.value.monthlyPrice
})

// Precio total anual (solo para mostrar cuando es anual)
const yearlyTotal = computed(() => {
  return selectedPlanDetails.value?.yearlyPrice || 0
})

// Ahorro anual
const yearlySavings = computed(() => {
  if (!selectedPlanDetails.value || selectedBilling.value !== 'yearly') return 0
  const fullYearPrice = selectedPlanDetails.value.monthlyPrice * 12
  return fullYearPrice - selectedPlanDetails.value.yearlyPrice
})

// Precio original mensual (para mostrar tachado)
const originalMonthlyPrice = computed(() => {
  return selectedPlanDetails.value?.monthlyPrice || 0
})

// IVA y total
const taxAmount = computed(() => Math.round(basePrice.value * 0.12 * 100) / 100)
const totalAmount = computed(() => basePrice.value + taxAmount.value)

// Para pago anual: total anual con IVA
const yearlyTotalWithTax = computed(() => {
  if (selectedBilling.value !== 'yearly') return 0
  const yearlyBase = selectedPlanDetails.value?.yearlyPrice || 0
  const yearlyTax = Math.round(yearlyBase * 0.12 * 100) / 100
  return yearlyBase + yearlyTax
})

// Watch for modalidad changes to reset plan selection
watch(selectedModalidad, (newVal) => {
  selectedPlanValue.value = newVal === 'empresa' ? 'business' : 'despacho'
})

// Función para obtener el precio a mostrar de cada plan
const getPlanDisplayPrice = (plan: typeof planesEmpresa[0]) => {
  if (selectedBilling.value === 'yearly') {
    return Math.floor(plan.yearlyPrice / 12)
  }
  return plan.monthlyPrice
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
          <VRow>
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
                      <VChip color="success" size="x-small" class="ms-1">−17%</VChip>
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
                        :key="plan.value"
                        :variant="selectedPlanValue === plan.value ? 'outlined' : 'flat'"
                        :class="selectedPlanValue === plan.value ? 'border-primary' : ''"
                        class="cursor-pointer"
                        @click="selectedPlanValue = plan.value"
                      >
                        <VCardText class="d-flex align-center gap-3 pa-3">
                          <VRadio
                            :model-value="selectedPlanValue"
                            :value="plan.value"
                          />
                          <VAvatar :color="plan.iconColor" variant="tonal" size="36">
                            <VIcon :icon="plan.icon" size="20" />
                          </VAvatar>
                          <div class="flex-grow-1">
                            <div class="text-body-1 font-weight-medium">{{ plan.title }}</div>
                          </div>
                          <div class="text-end">
                            <div class="text-body-1 font-weight-medium text-primary">
                              Q{{ formatCurrency(getPlanDisplayPrice(plan)) }}
                            </div>
                            <div v-if="selectedBilling === 'yearly'" class="text-caption text-medium-emphasis text-decoration-line-through">
                              Q{{ formatCurrency(plan.monthlyPrice) }}
                            </div>
                          </div>
                        </VCardText>
                      </VCard>
                    </div>
                  </VCardText>
                </VCard>

                <!-- Alert de ahorro cuando es anual -->
                <VAlert
                  v-if="selectedBilling === 'yearly'"
                  color="success"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  <template #prepend>
                    <VIcon icon="ri-gift-line" />
                  </template>
                  <div class="text-body-2">
                    <strong>¡Ahorras Q{{ formatCurrency(yearlySavings) }} al año!</strong>
                  </div>
                </VAlert>

                <!-- Summary -->
                <div class="my-5">
                  <div class="d-flex justify-space-between mb-2">
                    <div class="text-body-1">
                      Suscripción {{ selectedBilling === 'yearly' ? 'anual' : 'mensual' }}
                    </div>
                    <div class="text-body-1 font-weight-medium text-high-emphasis">
                      Q{{ formatCurrency(selectedBilling === 'yearly' ? yearlyTotal : basePrice) }}
                    </div>
                  </div>
                  <div v-if="selectedBilling === 'yearly'" class="d-flex justify-space-between mb-2 text-success">
                    <div class="text-body-2">Descuento (2 meses gratis)</div>
                    <div class="text-body-2 font-weight-medium">
                      -Q{{ formatCurrency(yearlySavings) }}
                    </div>
                  </div>
                  <div class="d-flex justify-space-between">
                    <div class="text-body-1">IVA (12%)</div>
                    <div class="text-body-1 font-weight-medium text-high-emphasis">
                      Q{{ formatCurrency(selectedBilling === 'yearly' ? (yearlyTotal * 0.12) : taxAmount) }}
                    </div>
                  </div>
                  <VDivider class="my-4" />
                  <div class="d-flex justify-space-between">
                    <div class="text-body-1 font-weight-medium">Total a pagar</div>
                    <div class="text-h6 text-primary">
                      Q{{ formatCurrency(selectedBilling === 'yearly' ? yearlyTotalWithTax : totalAmount) }}
                    </div>
                  </div>
                  <div v-if="selectedBilling === 'yearly'" class="text-caption text-medium-emphasis text-end mt-1">
                    (equivalente a Q{{ formatCurrency(basePrice) }}/mes)
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
