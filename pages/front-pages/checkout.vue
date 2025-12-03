<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import { useConfigStore } from '@core/stores/config'

definePageMeta({
  layout: 'blank',
  public: true,
})

const store = useConfigStore()
store.skin = 'default'

const currentStep = ref(0)
const isProcessing = ref(false)

// Función para formatear moneda en Quetzales
const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const checkoutSteps = [
  { title: 'Tu empresa', icon: 'ri-building-line' },
  { title: 'Tu cuenta', icon: 'ri-user-line' },
  { title: 'Tu plan', icon: 'ri-price-tag-3-line' },
  { title: 'Confirmación', icon: 'ri-checkbox-circle-line' },
]

// Form data
const companyData = ref({
  name: '',
  nit: '',
  industry: '',
  employees: '',
})

const userData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
})

const planData = ref({
  modalidad: 'empresa',
  plan: 'business',
  billing: 'monthly',
})

const industries = [
  'Comercio / Distribución',
  'Manufactura / Producción',
  'Servicios profesionales',
  'Construcción',
  'Transporte y logística',
  'Restaurantes / Alimentos',
  'Salud',
  'Educación',
  'Tecnología',
  'Otro',
]

const employeeRanges = [
  '1-5 empleados',
  '6-15 empleados',
  '16-50 empleados',
  '51-100 empleados',
  'Más de 100 empleados',
]

const planesEmpresa = [
  { title: 'Starter', value: 'starter', monthlyPrice: 299, yearlyPrice: 2990, desc: 'Hasta 3 usuarios, 500 FEL/mes', icon: 'ri-rocket-line', iconColor: 'info' },
  { title: 'Business', value: 'business', monthlyPrice: 599, yearlyPrice: 5990, desc: 'Hasta 10 usuarios, 2000 FEL/mes', icon: 'ri-line-chart-line', iconColor: 'primary' },
  { title: 'Enterprise', value: 'enterprise', monthlyPrice: 999, yearlyPrice: 9990, desc: 'Usuarios ilimitados', icon: 'ri-building-2-line', iconColor: 'warning' },
]

const planesContador = [
  { title: 'Independiente', value: 'independiente', monthlyPrice: 199, yearlyPrice: 1990, desc: 'Hasta 5 empresas', icon: 'ri-user-line', iconColor: 'info' },
  { title: 'Despacho', value: 'despacho', monthlyPrice: 499, yearlyPrice: 4990, desc: 'Hasta 20 empresas', icon: 'ri-team-line', iconColor: 'primary' },
  { title: 'Firma', value: 'firma', monthlyPrice: 899, yearlyPrice: 8990, desc: 'Empresas ilimitadas', icon: 'ri-bank-line', iconColor: 'warning' },
]

const currentPlans = computed(() => {
  return planData.value.modalidad === 'empresa' ? planesEmpresa : planesContador
})

const selectedPlanDetails = computed(() => {
  return currentPlans.value.find(p => p.value === planData.value.plan)
})

// Precio calculado según el tipo de facturación
const displayPrice = computed(() => {
  if (!selectedPlanDetails.value) return 0
  
  if (planData.value.billing === 'yearly') {
    // Precio mensual equivalente del plan anual (con descuento)
    return Math.floor(selectedPlanDetails.value.yearlyPrice / 12)
  }
  return selectedPlanDetails.value.monthlyPrice
})

// Precio original (sin descuento) para mostrar el ahorro
const originalMonthlyPrice = computed(() => {
  return selectedPlanDetails.value?.monthlyPrice || 0
})

// Total anual
const yearlyTotal = computed(() => {
  return selectedPlanDetails.value?.yearlyPrice || 0
})

// Ahorro total anual (2 meses gratis)
const yearlySavings = computed(() => {
  if (!selectedPlanDetails.value) return 0
  const fullYearPrice = selectedPlanDetails.value.monthlyPrice * 12
  return fullYearPrice - selectedPlanDetails.value.yearlyPrice
})

// Función para obtener el precio mensual de un plan específico
const getPlanDisplayPrice = (plan: typeof planesEmpresa[0]) => {
  if (planData.value.billing === 'yearly') {
    return Math.floor(plan.yearlyPrice / 12)
  }
  return plan.monthlyPrice
}

// Watch modalidad to reset plan selection
watch(() => planData.value.modalidad, (newVal) => {
  planData.value.plan = newVal === 'empresa' ? 'business' : 'despacho'
})

const handleNext = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const handlePrev = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSubmit = () => {
  isProcessing.value = true
  // TODO: Implementar registro
  setTimeout(() => {
    isProcessing.value = false
    currentStep.value = 3
  }, 2000)
}
</script>

<template>
  <div class="checkout-page">
    <Navbar />
    <VContainer>
      <div class="checkout-card">
        <VCard>
          <VCardText>
            <!-- Stepper Header -->
            <div class="d-flex justify-center flex-wrap gap-4 mb-6">
              <div
                v-for="(step, index) in checkoutSteps"
                :key="index"
                class="d-flex align-center gap-2"
                :class="{ 'text-primary': currentStep >= index, 'text-medium-emphasis': currentStep < index }"
              >
                <VAvatar
                  :color="currentStep >= index ? 'primary' : 'default'"
                  :variant="currentStep >= index ? 'elevated' : 'tonal'"
                  size="40"
                >
                  <VIcon :icon="step.icon" />
                </VAvatar>
                <span class="font-weight-medium d-none d-sm-block">{{ step.title }}</span>
                <VIcon
                  v-if="index < checkoutSteps.length - 1"
                  icon="ri-arrow-right-s-line"
                  class="mx-2 d-none d-md-block"
                />
              </div>
            </div>
          </VCardText>

          <VDivider />

          <VCardText class="pa-6 pa-md-10">
            <!-- Step 1: Empresa -->
            <div v-if="currentStep === 0">
              <div class="text-center mb-6">
                <h4 class="text-h4 mb-2">Cuéntanos sobre tu empresa</h4>
                <p class="text-body-1 text-medium-emphasis">
                  Esta información nos ayuda a personalizar VERTEX para tu negocio
                </p>
              </div>

              <VRow class="justify-center">
                <VCol cols="12" md="8" lg="6">
                  <VTextField
                    v-model="companyData.name"
                    label="Nombre de la empresa"
                    placeholder="Mi Empresa S.A."
                    class="mb-4"
                  />
                  <VTextField
                    v-model="companyData.nit"
                    label="NIT"
                    placeholder="1234567-8"
                    class="mb-4"
                  />
                  <VSelect
                    v-model="companyData.industry"
                    :items="industries"
                    label="Industria o giro"
                    placeholder="Selecciona una opción"
                    class="mb-4"
                  />
                  <VSelect
                    v-model="companyData.employees"
                    :items="employeeRanges"
                    label="Número de empleados"
                    placeholder="Selecciona una opción"
                  />
                </VCol>
              </VRow>
            </div>

            <!-- Step 2: Usuario -->
            <div v-if="currentStep === 1">
              <div class="text-center mb-6">
                <h4 class="text-h4 mb-2">Crea tu cuenta de administrador</h4>
                <p class="text-body-1 text-medium-emphasis">
                  Serás el administrador principal de tu cuenta VERTEX
                </p>
              </div>

              <VRow class="justify-center">
                <VCol cols="12" md="8" lg="6">
                  <VRow>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.firstName"
                        label="Nombre"
                        placeholder="Juan"
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.lastName"
                        label="Apellido"
                        placeholder="Pérez"
                      />
                    </VCol>
                    <VCol cols="12">
                      <VTextField
                        v-model="userData.email"
                        label="Correo electrónico"
                        placeholder="juan@empresa.com"
                        type="email"
                      />
                    </VCol>
                    <VCol cols="12">
                      <VTextField
                        v-model="userData.phone"
                        label="Teléfono"
                        placeholder="+502 5555-5555"
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.password"
                        label="Contraseña"
                        placeholder="••••••••"
                        type="password"
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.confirmPassword"
                        label="Confirmar contraseña"
                        placeholder="••••••••"
                        type="password"
                      />
                    </VCol>
                  </VRow>
                </VCol>
              </VRow>
            </div>

            <!-- Step 3: Plan -->
            <div v-if="currentStep === 2">
              <div class="text-center mb-6">
                <h4 class="text-h4 mb-2">Elige tu plan</h4>
                <p class="text-body-1 text-medium-emphasis">
                  Comienza con 14 días de prueba gratis. Sin tarjeta de crédito.
                </p>
              </div>

              <!-- Modalidad Selector -->
              <div class="d-flex justify-center mb-6">
                <VCard variant="outlined" class="modalidad-tabs-card">
                  <div class="d-flex">
                    <VBtn
                      :variant="planData.modalidad === 'empresa' ? 'flat' : 'text'"
                      :color="planData.modalidad === 'empresa' ? 'primary' : 'default'"
                      size="large"
                      class="modalidad-tab-btn"
                      @click="planData.modalidad = 'empresa'"
                    >
                      <VIcon icon="ri-building-line" class="me-2" />
                      Empresas
                    </VBtn>
                    <VBtn
                      :variant="planData.modalidad === 'contador' ? 'flat' : 'text'"
                      :color="planData.modalidad === 'contador' ? 'primary' : 'default'"
                      size="large"
                      class="modalidad-tab-btn"
                      @click="planData.modalidad = 'contador'"
                    >
                      <VIcon icon="ri-user-settings-line" class="me-2" />
                      Contadores
                    </VBtn>
                  </div>
                </VCard>
              </div>

              <!-- Plans Grid -->
              <VRow class="justify-center">
                <VCol
                  v-for="plan in currentPlans"
                  :key="plan.value"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <VCard
                    :variant="planData.plan === plan.value ? 'outlined' : 'flat'"
                    :class="planData.plan === plan.value ? 'border-primary' : 'border'"
                    class="cursor-pointer h-100"
                    @click="planData.plan = plan.value"
                  >
                    <VCardText class="text-center pa-6">
                      <VRadio
                        :model-value="planData.plan"
                        :value="plan.value"
                        class="mb-2"
                      />
                      <VAvatar :color="plan.iconColor" variant="tonal" size="64" class="mb-3">
                        <VIcon :icon="plan.icon" size="32" />
                      </VAvatar>
                      <h5 class="text-h5 mb-1">{{ plan.title }}</h5>
                      <p class="text-body-2 text-medium-emphasis mb-4">{{ plan.desc }}</p>
                      
                      <!-- Precio dinámico -->
                      <div class="text-h4 text-primary">
                        Q{{ formatCurrency(getPlanDisplayPrice(plan)) }}
                        <span class="text-body-2">/mes</span>
                      </div>
                      
                      <!-- Mostrar precio original tachado si es anual -->
                      <div v-if="planData.billing === 'yearly'" class="mt-1">
                        <span class="text-body-2 text-medium-emphasis text-decoration-line-through">
                          Q{{ formatCurrency(plan.monthlyPrice) }}/mes
                        </span>
                      </div>
                    </VCardText>
                  </VCard>
                </VCol>
              </VRow>

              <!-- Billing Toggle -->
              <div class="d-flex flex-column align-center gap-3 mt-6">
                <VCard variant="outlined" class="billing-tabs-card">
                  <div class="d-flex">
                    <VBtn
                      :variant="planData.billing === 'monthly' ? 'flat' : 'text'"
                      :color="planData.billing === 'monthly' ? 'primary' : 'default'"
                      size="small"
                      class="billing-tab-btn"
                      @click="planData.billing = 'monthly'"
                    >
                      Mensual
                    </VBtn>
                    <VBtn
                      :variant="planData.billing === 'yearly' ? 'flat' : 'text'"
                      :color="planData.billing === 'yearly' ? 'primary' : 'default'"
                      size="small"
                      class="billing-tab-btn"
                      @click="planData.billing = 'yearly'"
                    >
                      Anual
                      <VChip color="success" size="x-small" class="ms-2">2 meses gratis</VChip>
                    </VBtn>
                  </div>
                </VCard>

                <!-- Resumen de ahorro -->
                <VAlert
                  v-if="planData.billing === 'yearly'"
                  color="success"
                  variant="tonal"
                  density="compact"
                  class="mt-2"
                  max-width="450"
                >
                  <template #prepend>
                    <VIcon icon="ri-gift-line" />
                  </template>
                  <div class="text-body-2">
                    <strong>¡Ahorras Q{{ formatCurrency(yearlySavings) }} al año!</strong>
                    <br>
                    Pagas Q{{ formatCurrency(yearlyTotal) }} por 12 meses (equivalente a Q{{ formatCurrency(displayPrice) }}/mes)
                  </div>
                </VAlert>
              </div>
            </div>

            <!-- Step 4: Confirmación -->
            <div v-if="currentStep === 3">
              <div class="text-center">
                <VAvatar color="success" size="80" class="mb-4">
                  <VIcon icon="ri-check-line" size="48" />
                </VAvatar>
                <h4 class="text-h4 mb-2">¡Bienvenido a VERTEX ERP!</h4>
                <p class="text-body-1 text-medium-emphasis mb-6">
                  Tu cuenta ha sido creada exitosamente. Ya puedes comenzar a usar el sistema.
                </p>

                <VCard variant="outlined" class="mx-auto mb-6" max-width="400">
                  <VCardText>
                    <div class="d-flex flex-column gap-3">
                      <div class="d-flex justify-space-between">
                        <span class="text-medium-emphasis">Empresa:</span>
                        <span class="font-weight-medium">{{ companyData.name || 'Mi Empresa' }}</span>
                      </div>
                      <div class="d-flex justify-space-between align-center">
                        <span class="text-medium-emphasis">Plan:</span>
                        <div class="d-flex align-center gap-2">
                          <VAvatar :color="selectedPlanDetails?.iconColor" variant="tonal" size="24">
                            <VIcon :icon="selectedPlanDetails?.icon" size="14" />
                          </VAvatar>
                          <span class="font-weight-medium">{{ selectedPlanDetails?.title }}</span>
                        </div>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span class="text-medium-emphasis">Facturación:</span>
                        <span class="font-weight-medium">{{ planData.billing === 'yearly' ? 'Anual' : 'Mensual' }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span class="text-medium-emphasis">Precio:</span>
                        <span class="font-weight-medium text-primary">
                          Q{{ formatCurrency(displayPrice) }}/mes
                          <span v-if="planData.billing === 'yearly'" class="text-success text-body-2">
                            (Q{{ formatCurrency(yearlyTotal) }}/año)
                          </span>
                        </span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span class="text-medium-emphasis">Prueba gratis:</span>
                        <span class="font-weight-medium text-success">14 días</span>
                      </div>
                    </div>
                  </VCardText>
                </VCard>

                <VBtn color="primary" size="large" :to="{ name: 'dashboards-crm' }">
                  Ir al Dashboard
                  <VIcon icon="ri-arrow-right-line" class="ms-2" />
                </VBtn>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div v-if="currentStep < 3" class="d-flex justify-center gap-4 mt-8">
              <VBtn
                v-if="currentStep > 0"
                variant="outlined"
                @click="handlePrev"
              >
                <VIcon icon="ri-arrow-left-line" class="me-2" />
                Anterior
              </VBtn>
              <VBtn
                v-if="currentStep < 2"
                color="primary"
                @click="handleNext"
              >
                Siguiente
                <VIcon icon="ri-arrow-right-line" class="ms-2" />
              </VBtn>
              <VBtn
                v-if="currentStep === 2"
                color="success"
                :loading="isProcessing"
                @click="handleSubmit"
              >
                Comenzar prueba gratis
                <VIcon icon="ri-rocket-line" class="ms-2" />
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </div>
    </VContainer>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.checkout-card {
  margin-block: 9.25rem 5.25rem;
}

.modalidad-tabs-card,
.billing-tabs-card {
  border-radius: 12px;
  overflow: hidden;
}

.modalidad-tab-btn {
  border-radius: 0;
  min-width: 160px;
}

.billing-tab-btn {
  border-radius: 0;
  min-width: 120px;
}
</style>

<style lang="scss">
@media (max-width: 960px) and (min-width: 600px) {
  .checkout-page {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
