<script setup lang="ts">
import type { User } from 'next-auth'
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import { useConfigStore } from '@core/stores/config'

definePageMeta({
  layout: 'blank',
  public: true,
})

const store = useConfigStore()
store.skin = 'default'

const { signIn } = useAuth()
const ability = useAbility()

const currentStep = ref(0)
const isProcessing = ref(false)
const errorMessage = ref('')

const checkoutSteps = [
  { title: 'Tu empresa', icon: 'ri-building-line' },
  { title: 'Tu cuenta', icon: 'ri-user-line' },
  { title: '¡Listo!', icon: 'ri-checkbox-circle-line' },
]

// Lista de países con código de teléfono y bandera
const countries = [
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸' },
]

// Form data
const companyData = ref({
  name: '',
  nit: '',
  industry: '',
  employees: '',
  country: 'GT', // Guatemala por defecto
})

const userData = ref({
  firstName: '',
  lastName: '',
  email: '',
  countryCode: 'GT',
  phone: '',
  password: '',
  confirmPassword: '',
})

// Datos del trial después del registro
const trialData = ref({
  endsAt: '',
  daysRemaining: 14,
})

// Detectar país del usuario al montar
onMounted(async () => {
  try {
    // Intentar detectar país por geolocalización (IP)
    const response = await $fetch('https://ipapi.co/json/', { timeout: 3000 }).catch(() => null)
    if (response && (response as any).country_code) {
      const countryCode = (response as any).country_code
      const found = countries.find(c => c.code === countryCode)
      if (found) {
        companyData.value.country = countryCode
        userData.value.countryCode = countryCode
      }
    }
  } catch {
    // Mantener Guatemala como default
  }
})

// Computed para obtener el país seleccionado
const selectedCountry = computed(() => {
  return countries.find(c => c.code === userData.value.countryCode) || countries[0]
})

// Formatear NIT mientras escribe (solo números)
const formatNit = (value: string) => {
  // Remover todo excepto números
  return value.replace(/[^0-9]/g, '')
}

// Watch para formatear NIT automáticamente
watch(() => companyData.value.nit, (newVal) => {
  companyData.value.nit = formatNit(newVal)
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

// Features del trial premium
const trialFeatures = [
  'Usuarios ilimitados',
  'Facturas FEL ilimitadas',
  'Contabilidad completa',
  'Bancos y conciliación',
  'Cuentas * cobrar y * pagar',
  'Inventario multi-bodega',
  'Punto de Venta (POS)',
  'Reportes avanzados',
  'Sin tarjeta de crédito',
]

// Validación del paso actual
const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 0:
      return companyData.value.name.trim().length >= 2
    case 1:
      return userData.value.firstName.trim().length >= 2
        && userData.value.lastName.trim().length >= 2
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.value.email)
        && userData.value.password.length >= 6
        && userData.value.password === userData.value.confirmPassword
    default:
      return false
  }
})

const handleNext = () => {
  errorMessage.value = ''
  if (currentStep.value < 2 && isStepValid.value) {
    currentStep.value++
  }
}

const handlePrev = () => {
  errorMessage.value = ''
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const handleSubmit = async () => {
  errorMessage.value = ''
  isProcessing.value = true

  try {
    // Construir número de teléfono completo
    const fullPhone = userData.value.phone 
      ? `${selectedCountry.value.dialCode} ${userData.value.phone}`
      : ''

    const response = await $fetch('/api/register-trial', {
      method: 'POST',
      body: {
        company: {
          ...companyData.value,
          // Enviar el país de la empresa
          country: companyData.value.country,
        },
        user: {
          firstName: userData.value.firstName,
          lastName: userData.value.lastName,
          email: userData.value.email,
          phone: fullPhone,
          password: userData.value.password,
        },
      },
    })

    if (!response.success) {
      throw new Error(response.message || 'Error en el registro')
    }

    trialData.value = response.data.trial

    const signInResponse = await signIn('credentials', {
      email: userData.value.email,
      password: userData.value.password,
      redirect: false,
    })

    if (signInResponse?.error) {
      console.warn('Auto-login falló, el usuario deberá iniciar sesión manualmente')
    } else {
      const userCookie: Partial<User> = {
        email: response.data.user.email,
        fullName: `${response.data.user.firstName} ${response.data.user.lastName}`,
        role: 'admin',
        abilityRules: [{ action: 'manage', subject: 'all' }],
      }
      useCookie<Partial<User>>('userData').value = userCookie
      useCookie<User['abilityRules']>('userAbilityRules').value = userCookie.abilityRules
      ability.update(userCookie.abilityRules ?? [])
    }

    currentStep.value = 2
  }
  catch (error: any) {
    console.error('Error en registro:', error)
    errorMessage.value = error.data?.statusMessage || error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.'
  }
  finally {
    isProcessing.value = false
  }
}

const goToDashboard = async () => {
  await navigateTo('/dashboards/crm', { replace: true })
}

// Abrir precios en nueva ventana para no perder la sesión
const openPricingNewTab = () => {
  window.open('/front-pages/pricing', '_blank')
}
</script>

<template>
  <div class="checkout-page">
    <Navbar />
    <VContainer>
      <div class="checkout-card">
        <VRow class="justify-center">
          <!-- Formulario Principal -->
          <VCol cols="12" lg="7">
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

              <VCardText class="pa-6 pa-md-8">
                <!-- Error Message -->
                <VAlert
                  v-if="errorMessage"
                  type="error"
                  variant="tonal"
                  class="mb-6"
                  closable
                  @click:close="errorMessage = ''"
                >
                  {{ errorMessage }}
                </VAlert>

                <!-- Step 1: Empresa -->
                <div v-if="currentStep === 0">
                  <div class="text-center mb-6">
                    <h4 class="text-h4 mb-2">Cuéntanos sobre tu empresa</h4>
                    <p class="text-body-1 text-medium-emphasis">
                      Esta información nos ayuda a personalizar VERTEX para tu negocio
                    </p>
                  </div>

                  <VTextField
                    v-model="companyData.name"
                    label="Nombre de la empresa *"
                    placeholder="Mi Empresa S.A."
                    class="mb-4"
                  />
                  
                  <VTextField
                    v-model="companyData.nit"
                    label="NIT (sin guiones)"
                    placeholder="12345678"
                    class="mb-4"
                    maxlength="15"
                    hint="Solo números, sin guiones ni espacios"
                    type="text"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    autocomplete="off"
                  />
                  
                  <VSelect
                    v-model="companyData.country"
                    :items="countries"
                    item-title="name"
                    item-value="code"
                    label="País"
                    class="mb-4"
                  >
                    <template #selection="{ item }">
                      <span class="me-2">{{ item.raw.flag }}</span>
                      {{ item.raw.name }}
                    </template>
                    <template #item="{ item, props }">
                      <VListItem v-bind="props">
                        <template #prepend>
                          <span class="me-3 text-h6">{{ item.raw.flag }}</span>
                        </template>
                        <VListItemTitle>{{ item.raw.name }}</VListItemTitle>
                      </VListItem>
                    </template>
                  </VSelect>
                  
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
                </div>

                <!-- Step 2: Usuario -->
                <div v-if="currentStep === 1">
                  <div class="text-center mb-6">
                    <h4 class="text-h4 mb-2">Crea tu cuenta de administrador</h4>
                    <p class="text-body-1 text-medium-emphasis">
                      Serás el administrador principal de tu cuenta VERTEX
                    </p>
                  </div>

                  <VRow>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.firstName"
                        label="Nombre *"
                        placeholder="Juan"
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.lastName"
                        label="Apellido *"
                        placeholder="Pérez"
                      />
                    </VCol>
                    <VCol cols="12">
                      <VTextField
                        v-model="userData.email"
                        label="Correo electrónico *"
                        placeholder="juan@empresa.com"
                        type="email"
                        inputmode="email"
                        autocomplete="email"
                      />
                    </VCol>
                    <VCol cols="12">
                      <div class="d-flex gap-2">
                        <VSelect
                          v-model="userData.countryCode"
                          :items="countries"
                          item-title="dialCode"
                          item-value="code"
                          class="flex-shrink-0"
                          style="max-width: 140px;"
                          hide-details
                        >
                          <template #selection="{ item }">
                            <span class="me-1">{{ item.raw.flag }}</span>
                            <span class="text-body-2">{{ item.raw.dialCode }}</span>
                          </template>
                          <template #item="{ item, props }">
                            <VListItem v-bind="props">
                              <template #prepend>
                                <span class="me-2">{{ item.raw.flag }}</span>
                              </template>
                              <VListItemTitle>
                                {{ item.raw.name }} ({{ item.raw.dialCode }})
                              </VListItemTitle>
                            </VListItem>
                          </template>
                        </VSelect>
                        <VTextField
                          v-model="userData.phone"
                          label="Teléfono"
                          placeholder="5555 5555"
                          class="flex-grow-1"
                          type="text"
                          inputmode="tel"
                          pattern="[0-9]*"
                          autocomplete="tel-national"
                        />
                      </div>
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.password"
                        label="Contraseña *"
                        placeholder="••••••••"
                        type="password"
                      />
                    </VCol>
                    <VCol cols="12" sm="6">
                      <VTextField
                        v-model="userData.confirmPassword"
                        label="Confirmar contraseña *"
                        placeholder="••••••••"
                        type="password"
                      />
                    </VCol>
                  </VRow>
                </div>

                <!-- Step 3: Confirmación -->
                <div v-if="currentStep === 2">
                  <div class="text-center">
                    <VAvatar color="success" size="80" class="mb-4">
                      <VIcon icon="ri-check-line" size="48" />
                    </VAvatar>
                    <h4 class="text-h4 mb-2">¡Bienvenido a VERTEX ERP!</h4>
                    <p class="text-body-1 text-medium-emphasis mb-4">
                      Tu cuenta ha sido creada exitosamente. Ya estás logueado.
                    </p>
                    
                    <VCard variant="outlined" class="mb-6 text-start">
                      <VCardText>
                        <div class="d-flex align-center gap-3 mb-3">
                          <VAvatar color="primary" variant="tonal" size="42">
                            <VIcon icon="ri-building-line" size="22" />
                          </VAvatar>
                          <div>
                            <div class="text-h6">{{ companyData.name }}</div>
                            <div class="text-body-2 text-medium-emphasis">{{ userData.email }}</div>
                          </div>
                        </div>
                        
                        <VDivider class="my-3" />
                        
                        <VAlert color="info" variant="tonal" density="compact">
                          <template #prepend>
                            <VIcon icon="ri-information-line" />
                          </template>
                          <div class="text-body-2">
                            <strong>¿Qué pasa después de los 14 días?</strong><br>
                            Podrás elegir entre nuestros 6 planes el que mejor se adapte a tu negocio.
                            <a 
                              href="/front-pages/pricing" 
                              target="_blank" 
                              class="text-primary font-weight-medium"
                            >
                              Ver planes disponibles 
                              <VIcon icon="ri-external-link-line" size="12" />
                            </a>
                          </div>
                        </VAlert>
                      </VCardText>
                    </VCard>

                    <div class="d-flex flex-wrap justify-center gap-4">
                      <VBtn variant="outlined" size="large" @click="openPricingNewTab">
                        <VIcon icon="ri-price-tag-3-line" class="me-2" />
                        Ver Planes
                        <VIcon icon="ri-external-link-line" size="14" class="ms-1" />
                      </VBtn>
                      <VBtn color="primary" size="large" @click="goToDashboard">
                        Ir al Dashboard
                        <VIcon icon="ri-arrow-right-line" class="ms-2" />
                      </VBtn>
                    </div>

                    <p class="text-caption text-medium-emphasis mt-4">
                      <VIcon icon="ri-check-double-line" size="14" color="success" class="me-1" />
                      Ya iniciaste sesión automáticamente. Haz clic en "Ir al Dashboard" para comenzar.
                    </p>
                  </div>
                </div>

                <!-- Navigation Buttons -->
                <div v-if="currentStep < 2" class="d-flex justify-center gap-4 mt-8">
                  <VBtn v-if="currentStep > 0" variant="outlined" @click="handlePrev">
                    <VIcon icon="ri-arrow-left-line" class="me-2" />
                    Anterior
                  </VBtn>
                  <VBtn
                    v-if="currentStep === 0"
                    color="primary"
                    :disabled="!isStepValid"
                    @click="handleNext"
                  >
                    Siguiente
                    <VIcon icon="ri-arrow-right-line" class="ms-2" />
                  </VBtn>
                  <VBtn
                    v-if="currentStep === 1"
                    color="success"
                    :loading="isProcessing"
                    :disabled="isProcessing || !isStepValid"
                    @click="handleSubmit"
                  >
                    <VIcon icon="ri-rocket-line" class="me-2" />
                    Comenzar mi Prueba Gratis
                  </VBtn>
                </div>
              </VCardText>
            </VCard>

            <!-- Testimonial - Debajo del formulario -->
            <VCard v-if="currentStep < 2" class="mt-6 testimonial-card" color="primary">
              <VCardText class="d-flex gap-4 pa-5">
                <VAvatar color="rgba(255,255,255,0.2)" size="48" class="flex-shrink-0">
                  <VIcon icon="ri-double-quotes-l" size="24" color="white" />
                </VAvatar>
                <div>
                  <p class="text-body-1 mb-3 text-white" style="font-style: italic; line-height: 1.6; opacity: 0.95;">
                    "VERTEX transformó la forma en que manejamos nuestra contabilidad. 
                    La prueba gratis nos convenció en menos de una semana."
                  </p>
                  <div class="d-flex align-center gap-2">
                    <VAvatar size="28" color="rgba(255,255,255,0.3)">
                      <span class="text-caption font-weight-bold text-white">MG</span>
                    </VAvatar>
                    <span class="text-body-2 font-weight-medium text-white" style="opacity: 0.9;">
                      María González, Distribuidora El Sol
                    </span>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <!-- Widget del Plan Trial - Estilo Pricing Card -->
          <VCol v-if="currentStep < 2" cols="12" lg="5">
            <VCard class="trial-card border-primary border-opacity-100" border>
              <!-- Badge Gratis -->
              <VCardText class="text-end pt-4" style="block-size: 3.75rem;">
                <VChip color="success" size="small" variant="flat">
                  <VIcon icon="ri-gift-line" size="14" class="me-1" />
                  ¡GRATIS!
                </VChip>
              </VCardText>

              <!-- Icono y Título -->
              <VCardText class="text-center pb-2">
                <div class="trial-icon-wrapper mb-4">
                  <VAvatar
                    color="primary"
                    variant="tonal"
                    size="100"
                    class="trial-avatar"
                  >
                    <VIcon icon="ri-vip-crown-2-line" size="48" />
                  </VAvatar>
                  <div class="trial-badge">
                    <VAvatar color="success" size="32">
                      <VIcon icon="ri-check-line" size="18" />
                    </VAvatar>
                  </div>
                </div>
                
                <h4 class="text-h4 mb-1">Prueba Premium</h4>
                <p class="text-body-1 text-medium-emphasis mb-0">
                  Acceso completo a todas las funcionalidades
                </p>
              </VCardText>

              <!-- Precio -->
              <VCardText class="text-center py-4">
                <div class="d-flex justify-center align-center">
                  <span class="text-h5 font-weight-medium align-self-start text-success mt-2">Q</span>
                  <h1 class="text-h1 font-weight-bold text-success" style="font-size: 4rem;">0</h1>
                  <span class="text-h6 font-weight-medium align-self-end text-medium-emphasis mb-2 ms-1">
                    / 14 días
                  </span>
                </div>
                
                <VChip color="warning" variant="tonal" size="small" class="mt-3">
                  <VIcon icon="ri-timer-flash-line" size="14" class="me-1" />
                  Sin compromiso • Cancela cuando quieras
                </VChip>
              </VCardText>

              <VDivider />

              <!-- Features -->
              <VCardText class="pt-4">
                <div class="text-overline text-medium-emphasis mb-3">
                  TODO INCLUIDO:
                </div>
                
                <VList class="trial-features-list" density="compact">
                  <VListItem
                    v-for="feature in trialFeatures"
                    :key="feature"
                    class="px-0"
                  >
                    <template #prepend>
                      <VIcon
                        icon="ri-checkbox-circle-fill"
                        color="success"
                        size="18"
                        class="me-2"
                      />
                    </template>
                    <VListItemTitle class="text-body-2">
                      {{ feature }}
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VCardText>

              <VDivider />

              <!-- Footer motivacional -->
              <VCardText class="text-center pb-6">
                <div class="d-flex align-center justify-center gap-2 text-body-2 text-medium-emphasis mb-2">
                  <VIcon icon="ri-shield-check-line" size="16" color="success" />
                  Sin tarjeta de crédito requerida
                </div>
                
                <p class="text-caption text-medium-emphasis mb-0">
                  Durante tu prueba, explora nuestros 
                  <a href="/front-pages/pricing" target="_blank" class="text-primary">
                    6 planes disponibles
                  </a>
                  y elige el que mejor se adapte a tu negocio.
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </VContainer>
    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.checkout-card {
  margin-block: 9.25rem 5.25rem;
}

.trial-card {
  position: sticky;
  top: 100px;
  background: rgb(var(--v-theme-surface));
  
  .trial-icon-wrapper {
    position: relative;
    display: inline-block;
  }
  
  .trial-avatar {
    animation: float 3s ease-in-out infinite;
  }
  
  .trial-badge {
    position: absolute;
    bottom: 0;
    right: -5px;
    animation: pulse-badge 2s ease-in-out infinite;
  }
}

.trial-features-list {
  background: transparent !important;
  
  :deep(.v-list-item) {
    min-height: 32px;
    padding-block: 2px;
  }
}

.testimonial-card {
  border-radius: 12px;
  overflow: hidden;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

@keyframes pulse-badge {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
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

@media (max-width: 1280px) {
  .trial-card {
    position: relative !important;
    top: 0 !important;
  }
}
</style>
