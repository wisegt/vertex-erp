<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'

import paypalDark from '@images/icons/payments/img/paypal-dark.png'
import paypalLight from '@images/icons/payments/img/paypal-light.png'

import { useConfigStore } from '@core/stores/config'

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

// Integración con Recurrente para pagos
const {
  isProcessing: isRecurrenteProcessing,
  error: recurrenteError,
  createSubscriptionCheckout,
  getCheckoutStatus,
} = useRecurrente()

// Declarar tipo para el objeto global de Recurrente
declare global {
  interface Window {
    RecurrenteCheckout?: any
  }
}

store.skin = 'default'
definePageMeta({
  layout: 'blank',
  public: true,
})

const selectedPaymentMethod = ref('card')
const isProcessing = ref(false)

// Datos del formulario de facturación
const billingData = ref({
  businessName: '',
  nit: '',
  email: '',
  phone: '',
  phoneCode: '+502', // Guatemala por defecto
  address: '',
})

// Cargar datos del tenant y usuario autenticado
const { status: authStatus } = useAuth()
const isLoadingUserData = ref(false)

const loadUserBillingData = async () => {
  if (authStatus.value !== 'authenticated')
    return

  isLoadingUserData.value = true
  try {
    const response = await $fetch('/api/billing/info')
    if (response.success && response.data) {
      const { tenant } = response.data

      // Pre-llenar solo si están vacíos (localStorage tiene prioridad)
      if (!billingData.value.businessName && tenant.legalName)
        billingData.value.businessName = tenant.legalName

      if (!billingData.value.nit && tenant.taxId)
        billingData.value.nit = tenant.taxId

      if (!billingData.value.email && tenant.email)
        billingData.value.email = tenant.email

      if (!billingData.value.phone && tenant.phone) {
        const phoneMatch = tenant.phone.match(/\d+/)
        if (phoneMatch)
          billingData.value.phone = phoneMatch[0]
      }
      if (!billingData.value.address && tenant.fiscalAddress)
        billingData.value.address = tenant.fiscalAddress
    }
  }
  catch (error) {
    console.warn('No se pudieron cargar datos de facturación:', error)
  }
  finally {
    isLoadingUserData.value = false
  }
}

// Función para limpiar datos guardados (útil después de un pago exitoso)
const clearSavedBillingData = () => {
  if (typeof window !== 'undefined')
    localStorage.removeItem('vertex_billing_data')
}

// Cargar al montar si está autenticado
onMounted(() => {
  if (authStatus.value === 'authenticated')
    loadUserBillingData()
})

// Códigos de teléfono por país (Centroamérica + principales)
const phoneCodes = [
  { code: '+502', country: 'Guatemala', flag: '🇬🇹' },
  { code: '+503', country: 'El Salvador', flag: '🇸🇻' },
  { code: '+504', country: 'Honduras', flag: '🇭🇳' },
  { code: '+505', country: 'Nicaragua', flag: '🇳🇮' },
  { code: '+506', country: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', country: 'Panamá', flag: '🇵🇦' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
]

// Validación y formato de NIT (sin guiones)
const formatNIT = (value: string) => {
  // Remover todo lo que no sea número o letra
  return value.replace(/[^0-9A-Z]/i, '').toUpperCase()
}

// Watch para formatear NIT automáticamente
watch(() => billingData.value.nit, (newVal: string) => {
  billingData.value.nit = formatNIT(newVal)
})

// Estado de validación de duplicados
const isDuplicateChecking = ref(false)
const duplicateErrors = ref<string[]>([])

// Función para verificar duplicados
const checkForDuplicates = async () => {
  isDuplicateChecking.value = true
  duplicateErrors.value = []

  try {
    const response: any = await $fetch('/api/subscription/check-duplicates', {
      method: 'POST',
      body: {
        nit: billingData.value.nit,
        email: billingData.value.email,
        businessName: billingData.value.businessName,
      },
    })

    if (!response.success && response.errors) {
      duplicateErrors.value = response.errors

      return false
    }

    return true
  }
  catch (error: any) {
    console.error('Error verificando duplicados:', error)

    return true // Continuar si hay error en la verificación
  }
  finally {
    isDuplicateChecking.value = false
  }
}

// Datos de tarjeta (para referencia, la captura real la hace Recurrente)
const cardData = ref({
  cardNumber: '',
  cardName: '',
  expirationDate: '',
  cvv: '',
})

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
watch(selectedModalidad, newVal => {
  const plansForType = plans.value.filter(p => p.planType === newVal)
  const popularPlan = plansForType.find(p => p.isPopular)

  selectedPlanCode.value = popularPlan?.code || plansForType[0]?.code || ''
})

// Precio base según el tipo de facturación
const basePrice = computed(() => {
  if (!selectedPlanDetails.value)
    return 0

  return getDisplayPrice(selectedPlanDetails.value, selectedBilling.value)
})

// Precio total anual
const yearlyTotal = computed(() => {
  return selectedPlanDetails.value?.yearlyPrice || 0
})

// Ahorro anual
const yearlySavings = computed(() => {
  if (!selectedPlanDetails.value || selectedBilling.value !== 'yearly')
    return 0

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

const checkoutUrl = ref<string | null>(null)
const checkoutId = ref<string | null>(null)
const isScriptLoaded = ref(false)
const isFormShowing = ref(false)
const checkingPaymentStatus = ref(false)

// Polling para verificar el estado del checkout
const startPaymentStatusPolling = (checkoutIdToCheck: string) => {
  let attempts = 0
  const maxAttempts = 60 // 60 intentos = 2 minutos

  const pollInterval = setInterval(async () => {
    attempts++
    console.log(`🔍 Verificando estado del pago (intento ${attempts}/${maxAttempts})...`)

    try {
      const status = await getCheckoutStatus(checkoutIdToCheck)

      console.log('📊 Estado actual:', status)

      if (status && status.status === 'completed') {
        console.log('✅ ¡Pago confirmado!')
        clearInterval(pollInterval)
        checkingPaymentStatus.value = false
        window.location.href = `/payment-success?checkout_id=${checkoutIdToCheck}`
      }
      else if (attempts >= maxAttempts) {
        console.log('⏱️ Tiempo de espera agotado')
        clearInterval(pollInterval)
        checkingPaymentStatus.value = false
        alert('No pudimos verificar el estado del pago. Por favor, revisa tu correo electrónico para la confirmación.')
      }
    }
    catch (error) {
      console.error('Error verificando estado:', error)
    }
  }, 2000) // Verificar cada 2 segundos
}

// Cargar el script de Recurrente Checkout al montar el componente
onMounted(() => {
  if (typeof window !== 'undefined' && !window.RecurrenteCheckout) {
    const script = document.createElement('script')

    script.src = 'https://unpkg.com/recurrente-checkout@latest/recurrente-checkout.js'
    script.async = true
    script.onload = () => {
      console.log('✅ Recurrente Checkout script cargado')
      isScriptLoaded.value = true
    }
    script.onerror = () => {
      console.error('❌ Error al cargar Recurrente Checkout script')
    }
    document.head.appendChild(script)
  }
  else if (window.RecurrenteCheckout) {
    isScriptLoaded.value = true
  }
})

// Inicializar el checkout embedido de Recurrente
const initializeEmbeddedCheckout = async (url: string) => {
  try {
    // Esperar a que el script esté cargado
    let attempts = 0
    while (!window.RecurrenteCheckout && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    if (!window.RecurrenteCheckout)
      throw new Error('Recurrente Checkout no disponible')

    console.log('🔄 Inicializando Recurrente Checkout con URL:', url)

    // Limpiar el contenedor primero
    const container = document.getElementById('recurrente-checkout-container')
    if (container)
      container.innerHTML = ''

    // Marcar que estamos mostrando el formulario
    isFormShowing.value = true

    // Iniciar polling para verificar el estado (como backup si el callback no funciona)
    setTimeout(() => {
      checkingPaymentStatus.value = true
      startPaymentStatusPolling(checkoutId.value!)
    }, 5000) // Esperar 5 segundos antes de empezar a verificar

    window.RecurrenteCheckout.load({
      url,
      onSuccess(paymentData: any) {
        console.log('✅✅✅ PAGO EXITOSO CONFIRMADO:', paymentData)
        isProcessing.value = false
        checkingPaymentStatus.value = false

        // Asegurar que tengamos el checkout_id
        const finalCheckoutId = paymentData.checkoutId || paymentData.checkout_id || checkoutId.value

        console.log('🔗 Redirigiendo a success con ID:', finalCheckoutId)

        // Redirigir inmediatamente
        window.location.href = `/payment-success?checkout_id=${finalCheckoutId}`
      },
      onFailure(error: any) {
        console.error('❌❌❌ PAGO FALLIDO:', error)
        alert('El pago no pudo ser procesado. Por favor, verifica los datos de tu tarjeta e intenta nuevamente.')
        isProcessing.value = false
        isFormShowing.value = false
      },
      onPaymentInProgress() {
        console.log('⏳⏳⏳ PAGO EN PROCESO (transferencia)')
        isProcessing.value = false
        setTimeout(() => {
          window.location.href = `/payment-success?checkout_id=${checkoutId.value}`
        }, 500)
      },
    })

    console.log('✅ Formulario de Recurrente inicializado')
  }
  catch (error: any) {
    console.error('❌ Error al inicializar checkout embedido:', error)
    alert('Error al cargar el formulario de pago. Por favor, recarga la página e intenta de nuevo.')
    isProcessing.value = false
    isFormShowing.value = false
  }
}

const handlePayment = async () => {
  if (!selectedPlanDetails.value) {
    alert('Por favor selecciona un plan')

    return
  }

  // Validar datos de facturación
  if (!billingData.value.businessName || !billingData.value.nit || !billingData.value.email || !billingData.value.phone || !billingData.value.address) {
    alert('Por favor completa todos los datos de facturación')

    return
  }

  isProcessing.value = true

  try {
    // Para pagos con tarjeta, usar Recurrente Embedded Checkout
    if (selectedPaymentMethod.value === 'card') {
      // Convertir el monto total a centavos
      const amountInCents = Math.round(totalAmount.value * 100)

      // Nombre del plan para mostrar en Recurrente
      const planName = `${selectedPlanDetails.value.name} - ${selectedBilling.value === 'yearly' ? 'Plan Anual' : 'Plan Mensual'}`

      // Metadata para tracking
      const metadata = {
        plan_code: selectedPlanDetails.value.code,
        plan_type: selectedModalidad.value,
        billing_period: selectedBilling.value,
        business_name: billingData.value.businessName,
        nit: billingData.value.nit,
        email: billingData.value.email,
        phone: billingData.value.phone,
        address: billingData.value.address,
      }

      console.log('📤 Creando checkout con:', {
        planName,
        amountInCents,
        billingPeriod: selectedBilling.value,
        metadata,
      })

      // Crear el checkout en Recurrente
      const checkout = await createSubscriptionCheckout(
        planName,
        amountInCents,
        selectedBilling.value,
        undefined,
        metadata,
      )

      console.log('📥 Respuesta del checkout:', checkout)

      if (checkout && checkout.checkout_url) {
        checkoutUrl.value = checkout.checkout_url
        checkoutId.value = checkout.id

        // Cargar el checkout embedido en el contenedor
        await initializeEmbeddedCheckout(checkout.checkout_url)
      }
      else {
        alert('Error al crear el checkout. Por favor, intenta de nuevo.')
        isProcessing.value = false
      }
    }

    // Para PayPal
    else if (selectedPaymentMethod.value === 'paypal') {
      alert('PayPal estará disponible próximamente')
      isProcessing.value = false
    }

    // Para transferencia bancaria
    else if (selectedPaymentMethod.value === 'transfer') {
      alert('Hemos registrado tu solicitud. Recibirás un correo con los detalles para realizar la transferencia.')
      isProcessing.value = false
    }
  }
  catch (err: any) {
    console.error('Error en handlePayment:', err)
    alert('Error al procesar el pago')
    isProcessing.value = false
  }
}
</script>

<template>
  <div class="payment-page">
    <Navbar />

    <VContainer>
      <div class="d-flex justify-center align-center payment-card">
        <VCard width="100%">
          <!-- Loading state -->
          <div
            v-if="isLoading"
            class="d-flex justify-center align-center py-16"
          >
            <VProgressCircular
              indeterminate
              color="primary"
              size="48"
            />
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
                  <h5 class="text-h5 mb-4">
                    Método de pago
                  </h5>
                  <VRow>
                    <VCol
                      cols="12"
                      sm="4"
                    >
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
                          <VIcon
                            icon="ri-bank-card-2-line"
                            size="32"
                            color="primary"
                            class="mb-2"
                          />
                          <div class="text-body-2">
                            Tarjeta de Crédito/Débito
                          </div>
                          <div class="text-caption text-medium-emphasis">
                            Visa, Mastercard, Amex
                          </div>
                        </VCardText>
                      </VCard>
                    </VCol>
                    <VCol
                      cols="12"
                      sm="4"
                    >
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
                          <img
                            :src="paypal"
                            height="28"
                            class="mb-2"
                          >
                          <div class="text-body-2">
                            PayPal
                          </div>
                        </VCardText>
                      </VCard>
                    </VCol>
                    <VCol
                      cols="12"
                      sm="4"
                    >
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
                          <VIcon
                            icon="ri-bank-line"
                            size="28"
                            color="primary"
                            class="mb-2"
                          />
                          <div class="text-body-2">
                            Transferencia Bancaria
                          </div>
                        </VCardText>
                      </VCard>
                    </VCol>
                  </VRow>
                </div>

                <!-- Datos de facturación -->
                <div class="mb-7">
                  <div class="d-flex justify-space-between align-center mb-4">
                    <h5 class="text-h5 mb-0">
                      Datos de facturación
                    </h5>
                    <VTooltip
                      v-if="billingData.businessName || billingData.nit || billingData.email"
                      location="top"
                    >
                      <template #activator="{ props }">
                        <VBtn
                          v-bind="props"
                          variant="text"
                          size="small"
                          color="error"
                          @click="clearSavedBillingData(); billingData = loadSavedBillingData()"
                        >
                          <VIcon
                            icon="ri-delete-bin-line"
                            class="me-1"
                          />
                          Limpiar campos
                        </VBtn>
                      </template>
                      <span>Los datos se guardan automáticamente</span>
                    </VTooltip>
                  </div>

                  <!-- Mostrar errores de duplicados -->
                  <VAlert
                    v-if="duplicateErrors.length > 0"
                    color="error"
                    variant="tonal"
                    class="mb-4"
                  >
                    <template #prepend>
                      <VIcon icon="ri-error-warning-line" />
                    </template>
                    <div class="text-body-2">
                      <div class="font-weight-medium mb-2">
                        No se puede proceder con el pago:
                      </div>
                      <ul class="ps-4 mb-0">
                        <li
                          v-for="(error, index) in duplicateErrors"
                          :key="index"
                        >
                          {{ error }}
                        </li>
                      </ul>
                    </div>
                  </VAlert>

                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="billingData.businessName"
                        label="Empresa"
                        placeholder="Nombre de tu empresa"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="billingData.nit"
                        label="NIT"
                        placeholder="NIT (sin guiones)"
                        hint="Sin guiones ni espacios"
                        persistent-hint
                        :rules="[requiredValidator]"
                        @input="billingData.nit = formatNIT(billingData.nit)"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="billingData.email"
                        label="Correo electrónico"
                        type="email"
                        placeholder="facturacion@empresa.com"
                        :rules="[requiredValidator, emailValidator]"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="billingData.phone"
                        label="Teléfono"
                        placeholder="22223333"
                        hint="Solo números, sin espacios"
                        persistent-hint
                        :rules="[requiredValidator]"
                      >
                        <template #prepend-inner>
                          <VMenu>
                            <template #activator="{ props }">
                              <VBtn
                                v-bind="props"
                                variant="text"
                                size="small"
                                class="me-1"
                              >
                                {{ phoneCodes.find(c => c.code === billingData.phoneCode)?.flag }}
                                {{ billingData.phoneCode }}
                                <VIcon
                                  icon="ri-arrow-down-s-line"
                                  size="16"
                                  class="ms-1"
                                />
                              </VBtn>
                            </template>
                            <VList density="compact">
                              <VListItem
                                v-for="country in phoneCodes"
                                :key="country.code"
                                @click="billingData.phoneCode = country.code"
                              >
                                <template #prepend>
                                  <span class="me-2">{{ country.flag }}</span>
                                </template>
                                <VListItemTitle>{{ country.country }} {{ country.code }}</VListItemTitle>
                              </VListItem>
                            </VList>
                          </VMenu>
                        </template>
                      </VTextField>
                    </VCol>
                    <VCol cols="12">
                      <VTextField
                        v-model="billingData.address"
                        label="Dirección"
                        placeholder="Zona 10, Ciudad de Guatemala"
                        :rules="[requiredValidator]"
                      />
                    </VCol>
                  </VRow>
                </div>

                <!-- Datos de tarjeta -->
                <div v-if="selectedPaymentMethod === 'card'">
                  <h5 class="text-h5 mb-4">
                    Datos de la tarjeta
                  </h5>

                  <!-- Mensaje antes de cargar el formulario -->
                  <VAlert
                    v-if="!checkoutUrl"
                    color="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <template #prepend>
                      <VIcon icon="ri-information-line" />
                    </template>
                    <div class="text-body-2">
                      Completa los datos de facturación arriba y haz clic en <strong>"Cargar formulario de pago"</strong> para ingresar los datos de tu tarjeta.
                    </div>
                  </VAlert>

                  <!-- Loading del formulario -->
                  <div
                    v-if="checkoutUrl && !isFormShowing"
                    class="d-flex flex-column align-center justify-center py-8 mb-4"
                  >
                    <VProgressCircular
                      indeterminate
                      color="primary"
                      size="48"
                      class="mb-4"
                    />
                    <div class="text-body-1">
                      Cargando formulario seguro de pago...
                    </div>
                  </div>

                  <!-- Contenedor para el checkout embedido de Recurrente -->
                  <div
                    v-show="isFormShowing"
                    id="recurrente-checkout-container"
                    class="mb-4 recurrente-container"
                  />

                  <!-- Verificando estado del pago -->
                  <VAlert
                    v-if="checkingPaymentStatus"
                    color="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <template #prepend>
                      <VProgressCircular
                        indeterminate
                        size="24"
                      />
                    </template>
                    <div class="text-body-2">
                      Verificando el estado de tu pago... Esto puede tomar unos segundos.
                    </div>
                  </VAlert>

                  <div class="d-flex align-center gap-2 mb-2">
                    <VIcon
                      icon="ri-shield-check-line"
                      color="success"
                      size="20"
                    />
                    <span class="text-body-2">Encriptación SSL de 256 bits</span>
                  </div>

                  <div class="d-flex align-center gap-2 mb-4">
                    <VIcon
                      icon="ri-lock-line"
                      color="success"
                      size="20"
                    />
                    <span class="text-body-2">Cumplimiento PCI DSS Level 1</span>
                  </div>
                </div>

                <!-- PayPal -->
                <div v-if="selectedPaymentMethod === 'paypal'">
                  <VAlert
                    color="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <template #prepend>
                      <img
                        :src="paypal"
                        height="24"
                      >
                    </template>
                    <div class="text-body-1">
                      Al hacer clic en "Pagar con PayPal", serás redirigido a PayPal para completar tu pago de forma segura.
                    </div>
                  </VAlert>
                </div>

                <!-- Instrucciones de transferencia -->
                <div v-if="selectedPaymentMethod === 'transfer'">
                  <h5 class="text-h5 mb-4">
                    Datos para transferencia
                  </h5>
                  <VAlert
                    color="info"
                    variant="tonal"
                    class="mb-4"
                  >
                    <div class="text-body-1">
                      Realiza la transferencia a la siguiente cuenta y envíanos el comprobante a
                      <strong>pagos@vertexerp.app</strong>
                    </div>
                  </VAlert>
                  <VCard
                    variant="outlined"
                    class="mb-4"
                  >
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

            <VCol
              cols="12"
              md="4"
            >
              <VCardText
                class="pa-8"
                :class="$vuetify.display.smAndDown ? '' : 'ps-5'"
              >
                <div class="mb-6">
                  <h5 class="text-h5 mb-2">
                    Resumen del pedido
                  </h5>
                  <div class="text-body-2 text-medium-emphasis">
                    Tu suscripción se renovará automáticamente cada {{ selectedBilling === 'yearly' ? 'año' : 'mes' }}.
                  </div>
                </div>

                <!-- Selector de modalidad -->
                <div class="mb-4">
                  <div class="text-body-2 font-weight-medium mb-2">
                    Modalidad
                  </div>
                  <VBtnToggle
                    v-model="selectedModalidad"
                    mandatory
                    color="primary"
                    variant="outlined"
                    density="compact"
                    class="w-100"
                  >
                    <VBtn
                      value="empresa"
                      class="flex-grow-1"
                    >
                      <VIcon
                        icon="ri-building-line"
                        size="18"
                        class="me-1"
                      />
                      Empresa
                    </VBtn>
                    <VBtn
                      value="contador"
                      class="flex-grow-1"
                    >
                      <VIcon
                        icon="ri-user-settings-line"
                        size="18"
                        class="me-1"
                      />
                      Contador
                    </VBtn>
                  </VBtnToggle>
                </div>

                <!-- Toggle de facturación -->
                <div class="mb-4">
                  <div class="text-body-2 font-weight-medium mb-2">
                    Facturación
                  </div>
                  <VBtnToggle
                    v-model="selectedBilling"
                    mandatory
                    color="primary"
                    variant="outlined"
                    density="compact"
                    class="w-100"
                  >
                    <VBtn
                      value="monthly"
                      class="flex-grow-1"
                    >
                      Mensual
                    </VBtn>
                    <VBtn
                      value="yearly"
                      class="flex-grow-1"
                    >
                      Anual
                      <VChip
                        color="success"
                        size="x-small"
                        class="ms-1"
                      >
                        {{ discountLabel }}
                      </VChip>
                    </VBtn>
                  </VBtnToggle>
                </div>

                <!-- Plan selection -->
                <VCard
                  flat
                  color="rgba(var(--v-theme-on-surface), var(--v-hover-opacity))"
                  class="mb-4"
                >
                  <VCardText class="pa-4">
                    <div class="text-body-2 font-weight-medium mb-3">
                      Selecciona tu plan
                    </div>
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
                          <VAvatar
                            :color="plan.iconColor"
                            variant="tonal"
                            size="36"
                          >
                            <VIcon
                              :icon="plan.icon"
                              size="20"
                            />
                          </VAvatar>
                          <div class="flex-grow-1">
                            <div class="text-body-1 font-weight-medium">
                              {{ plan.name }}
                            </div>
                          </div>
                          <div class="text-end">
                            <div class="text-body-1 font-weight-medium text-primary">
                              {{ currencySymbol }}{{ formatCurrency(getPlanDisplayPrice(plan)) }}
                            </div>
                            <div
                              v-if="selectedBilling === 'yearly'"
                              class="text-caption text-medium-emphasis text-decoration-line-through"
                            >
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
                  <div
                    v-if="selectedBilling === 'yearly'"
                    class="d-flex justify-space-between mb-2 text-success"
                  >
                    <div class="text-body-2">
                      Descuento ({{ monthsFree }} meses gratis)
                    </div>
                    <div class="text-body-2 font-weight-medium">
                      -{{ currencySymbol }}{{ formatCurrency(yearlySavings) }}
                    </div>
                  </div>
                  <div class="d-flex justify-space-between">
                    <div class="text-body-1">
                      {{ taxName }} ({{ taxPercentage }}%)
                    </div>
                    <div class="text-body-1 font-weight-medium text-high-emphasis">
                      {{ currencySymbol }}{{ formatCurrency(taxAmount) }}
                    </div>
                  </div>
                  <VDivider class="my-4" />
                  <div class="d-flex justify-space-between">
                    <div class="text-body-1 font-weight-medium">
                      Total a pagar
                    </div>
                    <div class="text-h6 text-primary">
                      {{ currencySymbol }}{{ formatCurrency(totalAmount) }}
                    </div>
                  </div>
                  <div
                    v-if="selectedBilling === 'yearly'"
                    class="text-caption text-medium-emphasis text-end mt-1"
                  >
                    (equivalente a {{ currencySymbol }}{{ formatCurrency(basePrice) }}/mes)
                  </div>
                </div>

                <VBtn
                  v-if="!checkoutUrl"
                  block
                  color="success"
                  class="mb-6"
                  :loading="isProcessing || isRecurrenteProcessing"
                  :disabled="!billingData.businessName || !billingData.nit || !billingData.email || !billingData.phone || !billingData.address"
                  @click="handlePayment"
                >
                  <VIcon
                    v-if="selectedPaymentMethod === 'paypal'"
                    class="me-2"
                  >
                    <img
                      :src="paypal"
                      height="18"
                      style="filter: brightness(0) invert(1);"
                    >
                  </VIcon>
                  {{ selectedPaymentMethod === 'card' ? 'Cargar formulario de pago' : selectedPaymentMethod === 'paypal' ? 'Pagar con PayPal' : 'Confirmar pedido' }}
                  <VIcon
                    icon="ri-arrow-right-line"
                    class="ms-2"
                  />
                </VBtn>

                <!-- Mensaje cuando el formulario está cargando -->
                <VAlert
                  v-if="checkoutUrl && isProcessing"
                  color="info"
                  variant="tonal"
                  class="mb-4"
                >
                  <template #prepend>
                    <VProgressCircular
                      indeterminate
                      size="24"
                    />
                  </template>
                  <div class="text-body-2">
                    Cargando formulario de pago seguro...
                  </div>
                </VAlert>

                <!-- Mostrar error de Recurrente si existe -->
                <VAlert
                  v-if="recurrenteError"
                  color="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  {{ recurrenteError }}
                </VAlert>

                <VAlert
                  color="success"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
                >
                  <template #prepend>
                    <VIcon icon="ri-shield-check-line" />
                  </template>
                  <div class="text-body-2">
                    Pago 100% seguro con encriptación SSL
                  </div>
                </VAlert>

                <div class="text-body-2 text-medium-emphasis">
                  Al continuar, aceptas nuestros
                  <a
                    href="#"
                    class="text-primary"
                  >Términos de Servicio</a> y
                  <a
                    href="#"
                    class="text-primary"
                  >Política de Privacidad</a>.
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
    <RealtimeIndicator
      :is-connected="isRealtimeConnected"
      label="Pricing Realtime"
    />
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

.recurrente-container {
  inline-size: 100%;
  min-block-size: 450px;

  :deep(iframe) {
    border: none;
    border-radius: 8px;
    inline-size: 100%;
  }
}
</style>
