<script lang="ts" setup>
import BillingHistoryTable from './BillingHistoryTable.vue'

import mastercard from '@images/icons/payments/mastercard.png'
import visa from '@images/icons/payments/visa.png'

interface CardDetails {
  name: string
  number: string
  expiry: string
  isPrimary: boolean
  type: string
  cvv: string
  image: string
}

// Composable para suscripción
const { 
  subscription, 
  isTrialing, 
  daysRemaining, 
  trialEndsAt, 
  loadSubscriptionStatus,
  bannerColor 
} = useSubscription()

// Estados
const selectedPaymentMethod = ref('credit-debit-atm-card')
const isPricingPlanDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const isCardEditDialogVisible = ref(false)
const isCardDetailSaveBilling = ref(false)
const isLoadingBilling = ref(true)

// Datos de facturación del tenant
const billingData = ref({
  tenant: {
    id: '',
    name: '',
    legalName: '',
    taxId: '',
    email: '',
    phone: '',
    fiscalAddress: '',
  },
  plan: {
    id: null as string | null,
    name: 'Prueba Gratis',
    code: 'trial',
    price: 0,
    billingPeriod: 'trial',
    planType: 'empresa',
  },
  subscription: {
    status: 'trial',
    currentPeriodEnd: '',
    trialEndsAt: '',
  },
})

// Cargar datos al montar
onMounted(async () => {
  await Promise.all([
    loadSubscriptionStatus(true),
    loadBillingData(),
  ])
})

const loadBillingData = async () => {
  isLoadingBilling.value = true
  try {
    const response = await $fetch('/api/billing/info')
    if (response.success && response.data) {
      billingData.value = response.data
    }
  } catch (error) {
    console.error('Error loading billing data:', error)
  } finally {
    isLoadingBilling.value = false
  }
}

// Computed: progreso de días
const daysProgress = computed(() => {
  if (isTrialing.value) {
    // Trial de 14 días
    const totalDays = 14
    const usedDays = totalDays - daysRemaining.value
    return Math.round((usedDays / totalDays) * 100)
  }
  // Para planes activos, calcular desde el período actual
  return 0
})

// Computed: fecha de vencimiento formateada
const formattedEndDate = computed(() => {
  const dateStr = isTrialing.value 
    ? trialEndsAt.value 
    : billingData.value.subscription.currentPeriodEnd
  
  if (!dateStr) return 'N/A'
  
  return new Date(dateStr).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

// Computed: días hasta renovación (para planes activos)
const daysUntilRenewal = computed(() => {
  if (isTrialing.value) return 0
  
  const endDate = billingData.value.subscription.currentPeriodEnd
  if (!endDate) return 0
  
  const now = new Date()
  const end = new Date(endDate)
  const diffTime = end.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
})

// Computed: color e ícono de estado de suscripción según proximidad de vencimiento
const subscriptionStatusColor = computed(() => {
  const days = daysUntilRenewal.value
  
  if (days <= 7) return 'error'      // Rojo - 7 días o menos
  if (days <= 15) return 'warning'   // Amarillo - 15 días o menos
  if (days <= 30) return 'info'      // Azul - 30 días o menos
  return 'success'                    // Verde - más de 30 días
})

const subscriptionStatusIcon = computed(() => {
  const days = daysUntilRenewal.value
  
  if (days <= 7) return 'ri-alert-line'           // Alerta
  if (days <= 15) return 'ri-time-line'           // Reloj
  if (days <= 30) return 'ri-calendar-line'       // Calendario
  return 'ri-checkbox-circle-line'                 // Check
})

// Computed: fecha de renovación en formato dd/mm/aaaa
const renewalDateFormatted = computed(() => {
  const dateStr = billingData.value.subscription.currentPeriodEnd
  if (!dateStr) return ''
  
  const date = new Date(dateStr)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  
  return `${day}/${month}/${year}`
})

// Computed: color del alert según días restantes
const alertType = computed(() => {
  if (daysRemaining.value <= 0) return 'error'
  if (daysRemaining.value <= 3) return 'error'
  if (daysRemaining.value <= 7) return 'warning'
  return 'info'
})

// Computed: mensaje del alert
const alertMessage = computed(() => {
  if (daysRemaining.value <= 0) {
    return 'Tu período de prueba ha terminado. Selecciona un plan para continuar.'
  }
  if (daysRemaining.value <= 3) {
    return `¡Solo quedan ${daysRemaining.value} días! Actualiza tu plan ahora.`
  }
  if (daysRemaining.value <= 7) {
    return `Quedan ${daysRemaining.value} días de tu período de prueba.`
  }
  return `Tienes ${daysRemaining.value} días restantes de acceso completo.`
})

// Computed: precio formateado
const formattedPrice = computed(() => {
  const price = billingData.value.plan.price
  if (price === 0) return 'Q0'
  return `Q${price.toLocaleString('es-GT')}`
})

// Computed: período formateado
const formattedPeriod = computed(() => {
  const period = billingData.value.plan.billingPeriod
  if (period === 'trial') return 'por 14 días'
  if (period === 'mensual') return 'por Mes'
  if (period === 'anual') return 'por Año'
  return ''
})

// Computed: default tab para el modal
const defaultPlanTab = computed(() => {
  return billingData.value.plan.planType === 'contador' ? 'contador' : 'empresa'
})

// Cards de pago (demo por ahora)
const creditCards: CardDetails[] = [
  {
    name: 'Tom McBride',
    number: '5531234567899856',
    expiry: '12/23',
    isPrimary: true,
    type: 'visa',
    cvv: '456',
    image: mastercard,
  },
  {
    name: 'Mildred Wagner',
    number: '4851234567895896',
    expiry: '10/27',
    isPrimary: false,
    type: 'mastercard',
    cvv: '123',
    image: visa,
  },
]

const countryList = ['Guatemala', 'El Salvador', 'Honduras', 'México', 'Estados Unidos']

const currentCardDetails = ref()

const openEditCardDialog = (cardDetails: CardDetails) => {
  currentCardDetails.value = cardDetails
  isCardEditDialogVisible.value = true
}

const cardNumber = ref('')
const cardName = ref('')
const cardExpiryDate = ref('')
const cardCvv = ref('')

const resetPaymentForm = () => {
  cardNumber.value = ''
  cardName.value = ''
  cardExpiryDate.value = ''
  cardCvv.value = ''
  selectedPaymentMethod.value = 'credit-debit-atm-card'
}

const handlePlanSelected = (plan: any) => {
  console.log('Plan seleccionado:', plan)
  // Aquí iría la lógica para procesar el cambio de plan
  // Por ahora solo mostramos un mensaje
}

// Datos de dirección de facturación
const billingAddress = ref({
  companyName: '',
  billingEmail: '',
  taxId: '',
  vatNumber: '',
  phone: '',
  country: 'Guatemala',
  address: '',
  state: '',
  zipCode: '',
})

// Sincronizar datos cuando se cargan
watch(() => billingData.value.tenant, (tenant) => {
  if (tenant) {
    billingAddress.value.companyName = tenant.legalName || tenant.name
    billingAddress.value.billingEmail = tenant.email
    billingAddress.value.taxId = tenant.taxId
    billingAddress.value.phone = tenant.phone
    billingAddress.value.address = tenant.fiscalAddress
  }
}, { immediate: true })
</script>

<template>
  <VRow>
    <!-- 👉 Current Plan -->
    <VCol cols="12">
      <VCard title="Plan Actual">
        <VCardText>
          <!-- Loading state -->
          <div v-if="isLoadingBilling" class="d-flex justify-center py-8">
            <VProgressCircular indeterminate color="primary" />
          </div>

          <!-- Alert para trial O Card para suscripción activa -->
          <VRow v-else>
            <VCol cols="12">
              <!-- Para trial -->
              <VAlert
                v-if="isTrialing"
                :type="alertType"
                variant="tonal"
                class="mb-4"
              >
                <template #title>
                  <span class="text-body-1 font-weight-semibold">
                    {{ daysRemaining <= 0 ? '¡Acción requerida!' : '¡Atención!' }}
                  </span>
                </template>
                {{ alertMessage }}
              </VAlert>

              <!-- Para suscripción activa -->
              <VCard
                v-else
                :color="subscriptionStatusColor"
                variant="tonal"
                class="mb-4"
              >
                <VCardText class="pa-4">
                  <div class="d-flex align-center gap-3">
                    <VAvatar
                      :color="subscriptionStatusColor"
                      size="48"
                      variant="tonal"
                    >
                      <VIcon
                        :icon="subscriptionStatusIcon"
                        size="28"
                      />
                    </VAvatar>
                    <div class="flex-grow-1">
                      <div class="text-h6 mb-1">
                        Activo hasta {{ formattedEndDate }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        Te enviaremos una notificación antes de que expire tu suscripción
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>
            </VCol>

            <!-- Progress bar para trial -->
            <VCol
              v-if="isTrialing"
              cols="12"
            >
              <h6 class="d-flex text-h6 justify-space-between mb-1">
                <div>Días</div>
                <div>{{ 14 - daysRemaining }} de 14 Días</div>
              </h6>
              <VProgressLinear
                :color="bannerColor"
                rounded
                height="8"
                :model-value="daysProgress"
              />
              <p class="text-body-2 text-medium-emphasis mt-2">
                {{ daysRemaining > 0 
                  ? `${daysRemaining} días restantes de tu período de prueba`
                  : 'Tu período de prueba ha terminado'
                }}
              </p>
            </VCol>

            <!-- Stats con iconos elegantes (4 cards iguales) -->
            <VCol
              v-if="!isTrialing"
              cols="12"
            >
              <VRow>
                <!-- Card 1: Precio -->
                <VCol cols="6" md="3">
                  <VCard variant="tonal" color="warning" class="text-center">
                    <VCardText class="pa-4">
                      <VAvatar
                        color="warning"
                        size="64"
                        variant="tonal"
                        class="mb-2"
                      >
                        <VIcon
                          icon="ri-money-dollar-circle-line"
                          size="32"
                        />
                      </VAvatar>
                      <div class="text-caption text-medium-emphasis mb-2">
                        Precio
                      </div>
                      <div class="text-h6">
                        {{ formattedPrice }}/{{ formattedPeriod }}
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Card 2: Próxima Renovación -->
                <VCol cols="6" md="3">
                  <VCard variant="tonal" :color="subscriptionStatusColor" class="text-center">
                    <VCardText class="pa-4">
                      <VAvatar
                        :color="subscriptionStatusColor"
                        size="64"
                        variant="tonal"
                        class="mb-2"
                      >
                        <VIcon
                          icon="ri-calendar-check-line"
                          size="32"
                        />
                      </VAvatar>
                      <div class="text-caption text-medium-emphasis mb-2">
                        Próxima Renovación
                      </div>
                      <div class="text-h6">
                        {{ daysUntilRenewal }} días ({{ renewalDateFormatted }})
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Card 3: Estado -->
                <VCol cols="6" md="3">
                  <VCard variant="tonal" color="success" class="text-center">
                    <VCardText class="pa-4">
                      <VAvatar
                        color="success"
                        size="64"
                        variant="tonal"
                        class="mb-2"
                      >
                        <VIcon
                          icon="ri-shield-check-line"
                          size="32"
                        />
                      </VAvatar>
                      <div class="text-caption text-medium-emphasis">
                        Estado
                      </div>
                      <div class="text-h6 mt-1">
                        Activo
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>

                <!-- Card 4: Plan -->
                <VCol cols="6" md="3">
                  <VCard variant="tonal" color="info" class="text-center">
                    <VCardText class="pa-4">
                      <VAvatar
                        :color="billingData.plan.iconColor || 'info'"
                        size="64"
                        variant="tonal"
                        class="mb-2"
                      >
                        <VIcon
                          :icon="billingData.plan.icon || 'ri-vip-crown-line'"
                          size="32"
                        />
                      </VAvatar>
                      <div class="text-caption text-medium-emphasis">
                        Plan
                      </div>
                      <div class="text-h6 mt-1">
                        {{ billingData.plan.name }}
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12">
              <div class="d-flex flex-wrap gap-4">
                <VBtn 
                  color="primary"
                  @click="isPricingPlanDialogVisible = true"
                >
                  <VIcon icon="ri-arrow-up-line" class="me-2" />
                  {{ isTrialing ? 'Elegir Plan' : 'Cambiar Plan' }}
                </VBtn>

                <VBtn
                  v-if="!isTrialing"
                  color="error"
                  variant="outlined"
                  @click="isConfirmDialogVisible = true"
                >
                  Cancelar Suscripción
                </VBtn>
              </div>
            </VCol>
          </VRow>

          <!-- 👉 Confirm Dialog -->
          <ConfirmDialog
            v-model:is-dialog-visible="isConfirmDialogVisible"
            confirmation-question="¿Estás seguro de cancelar tu suscripción?"
            cancel-msg="Cancelación abortada"
            cancel-title="Cancelado"
            confirm-msg="Tu suscripción ha sido cancelada exitosamente."
            confirm-title="¡Cancelado!"
          />

          <!-- 👉 Plan and pricing dialog -->
          <PricingPlanDialog 
            v-model:is-dialog-visible="isPricingPlanDialogVisible"
            :current-plan-id="billingData.plan.id"
            :default-tab="defaultPlanTab"
            @select-plan="handlePlanSelected"
          />
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Payment Methods -->
    <VCol cols="12">
      <VCard title="Métodos de Pago">
        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <VCol cols="12" md="6">
                <VRow>
                  <!-- 👉 card type switch -->
                  <VCol cols="12">
                    <VRadioGroup
                      v-model="selectedPaymentMethod"
                      inline
                    >
                      <VRadio
                        value="credit-debit-atm-card"
                        label="Tarjeta de Crédito/Débito"
                        color="primary"
                      />
                      <VRadio
                        value="bank-transfer"
                        label="Transferencia Bancaria"
                        color="primary"
                      />
                    </VRadioGroup>
                  </VCol>

                  <VCol cols="12">
                    <VRow v-show="selectedPaymentMethod === 'credit-debit-atm-card'">
                      <!-- 👉 Card Number -->
                      <VCol cols="12">
                        <VTextField
                          v-model="cardNumber"
                          label="Número de Tarjeta"
                          placeholder="1234 1234 1234 1234"
                        />
                      </VCol>

                      <!-- 👉 Name -->
                      <VCol cols="12" md="6">
                        <VTextField
                          v-model="cardName"
                          label="Nombre en la Tarjeta"
                          placeholder="Juan Pérez"
                        />
                      </VCol>

                      <!-- 👉 Expiry date -->
                      <VCol cols="6" md="3">
                        <VTextField
                          v-model="cardExpiryDate"
                          label="Fecha de Expiración"
                          placeholder="MM/AA"
                        />
                      </VCol>

                      <!-- 👉 Cvv code -->
                      <VCol cols="6" md="3">
                        <VTextField
                          v-model="cardCvv"
                          label="CVV"
                          placeholder="123"
                        />
                      </VCol>

                      <!-- 👉 Future Billing switch -->
                      <VCol cols="12">
                        <VSwitch
                          v-model="isCardDetailSaveBilling"
                          density="compact"
                          label="Guardar tarjeta para futuros pagos"
                        />
                      </VCol>

                      <!-- 👉 Payment method action button -->
                      <VCol cols="12" class="d-flex flex-wrap gap-4">
                        <VBtn type="submit">
                          Guardar Cambios
                        </VBtn>
                        <VBtn
                          color="secondary"
                          variant="outlined"
                          @click="resetPaymentForm"
                        >
                          Limpiar
                        </VBtn>
                      </VCol>
                    </VRow>

                    <div v-show="selectedPaymentMethod === 'bank-transfer'">
                      <VAlert type="info" variant="tonal" class="mb-4">
                        <template #title>Transferencia Bancaria</template>
                        Para pagos por transferencia, contáctanos y te enviaremos los datos bancarios.
                      </VAlert>
                      <VBtn color="primary" variant="outlined">
                        <VIcon icon="ri-mail-line" class="me-2" />
                        Solicitar Datos Bancarios
                      </VBtn>
                    </div>
                  </VCol>
                </VRow>
              </VCol>

              <!-- 👉 Saved Cards -->
              <VCol cols="12" md="6">
                <h6 class="text-h6 mb-6">
                  Mis Tarjetas
                </h6>

                <div class="d-flex flex-column gap-y-4">
                  <VCard
                    v-for="card in creditCards"
                    :key="card.name"
                    color="rgba(var(--v-theme-on-surface), var(--v-hover-opacity))"
                    flat
                  >
                    <VCardText class="d-flex flex-sm-row flex-column">
                      <div class="text-no-wrap">
                        <img :src="card.image" height="24">
                        <div class="d-flex align-center gap-x-4">
                          <h6 class="text-h6 my-2">
                            {{ card.name }}
                          </h6>
                          <VChip
                            v-if="card.isPrimary"
                            color="primary"
                            size="small"
                          >
                            Principal
                          </VChip>
                        </div>
                        <div class="text-body-2">
                          **** **** **** {{ card.number.substring(card.number.length - 4) }}
                        </div>
                      </div>

                      <VSpacer />

                      <div class="d-flex flex-column text-sm-end">
                        <div class="d-flex flex-wrap gap-4 order-sm-0 order-1">
                          <VBtn
                            variant="outlined"
                            size="small"
                            @click="openEditCardDialog(card)"
                          >
                            Editar
                          </VBtn>
                          <VBtn
                            color="error"
                            variant="outlined"
                            size="small"
                          >
                            Eliminar
                          </VBtn>
                        </div>
                        <div class="my-4 text-body-2 text-medium-emphasis order-sm-1 order-0">
                          Expira {{ card.expiry }}
                        </div>
                      </div>
                    </VCardText>
                  </VCard>

                  <!-- Empty state -->
                  <VCard
                    v-if="creditCards.length === 0"
                    color="rgba(var(--v-theme-on-surface), var(--v-hover-opacity))"
                    flat
                  >
                    <VCardText class="text-center py-8">
                      <VIcon icon="ri-bank-card-line" size="48" color="secondary" class="mb-2" />
                      <p class="text-body-1 mb-0">No tienes tarjetas guardadas</p>
                    </VCardText>
                  </VCard>
                </div>

                <!-- 👉 Add Edit Card Dialog -->
                <CardAddEditDialog
                  v-model:is-dialog-visible="isCardEditDialogVisible"
                  :card-details="currentCardDetails"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Billing Address -->
    <VCol cols="12">
      <VCard title="Dirección de Facturación">
        <VCardText>
          <VForm @submit.prevent="() => {}">
            <VRow>
              <!-- 👉 Company name -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="billingAddress.companyName"
                  label="Nombre de la Empresa"
                  placeholder="Mi Empresa S.A."
                />
              </VCol>

              <!-- 👉 Billing Email -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="billingAddress.billingEmail"
                  label="Correo de Facturación"
                  placeholder="facturacion@empresa.com"
                />
              </VCol>

              <!-- 👉 Tax ID (NIT) -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="billingAddress.taxId"
                  label="NIT"
                  placeholder="1234567-8"
                />
              </VCol>

              <!-- 👉 Phone -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="billingAddress.phone"
                  label="Teléfono"
                  placeholder="+502 2222-3333"
                />
              </VCol>

              <!-- 👉 Country -->
              <VCol cols="12" md="6">
                <VSelect
                  v-model="billingAddress.country"
                  label="País"
                  :items="countryList"
                  placeholder="Selecciona un país"
                />
              </VCol>

              <!-- 👉 State -->
              <VCol cols="12" md="6">
                <VTextField
                  v-model="billingAddress.state"
                  label="Departamento"
                  placeholder="Guatemala"
                />
              </VCol>

              <!-- 👉 Billing Address -->
              <VCol cols="12">
                <VTextField
                  v-model="billingAddress.address"
                  label="Dirección Fiscal"
                  placeholder="12 Calle 1-25 Zona 10"
                />
              </VCol>

              <!-- 👉 Actions Button -->
              <VCol cols="12" class="d-flex flex-wrap gap-4">
                <VBtn type="submit">
                  Guardar Cambios
                </VBtn>
                <VBtn
                  type="reset"
                  color="secondary"
                  variant="outlined"
                >
                  Restaurar
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <!-- 👉 Billing History -->
    <VCol cols="12">
      <BillingHistoryTable />
    </VCol>
  </VRow>
</template>

<style lang="scss">
.pricing-dialog {
  .pricing-title {
    font-size: 1.5rem !important;
  }

  .v-card {
    border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
    box-shadow: none;
  }
}
</style>
