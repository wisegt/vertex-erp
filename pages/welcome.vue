<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import { useConfigStore } from '@core/stores/config'

const store = useConfigStore()

store.skin = 'default'

definePageMeta({
  layout: 'blank',
  public: true,
})

const route = useRoute()
const isNewUser = computed(() => route.query.new === 'true')
const userEmail = computed(() => route.query.email as string)
const firstName = computed(() => route.query.firstName as string)
const lastName = computed(() => route.query.lastName as string)
const businessName = computed(() => route.query.businessName as string)
const planCode = computed(() => route.query.planCode as string)
const planName = computed(() => route.query.planName as string)
const billingPeriod = computed(() => route.query.billingPeriod as string)

// Nombre completo del usuario
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// Información del plan con ícono
const planInfo = computed(() => {
  const plans: Record<string, { icon: string, color: string, benefits: string[] }> = {
    'starter': {
      icon: 'ri-rocket-line',
      color: 'info',
      benefits: [
        '1 usuario',
        '1 empresa',
        '50 facturas al mes',
        'Soporte básico',
        '5GB almacenamiento',
      ],
    },
    'business': {
      icon: 'ri-briefcase-line',
      color: 'primary',
      benefits: [
        '5 usuarios',
        '1 empresa',
        '500 facturas al mes',
        'Soporte prioritario',
        '50GB almacenamiento',
        'Reportes avanzados',
      ],
    },
    'enterprise': {
      icon: 'ri-building-line',
      color: 'success',
      benefits: [
        'Usuarios ilimitados',
        '1 empresa',
        'Facturas ilimitadas',
        'Soporte 24/7',
        'Almacenamiento ilimitado',
        'Reportes personalizados',
        'API completa',
      ],
    },
    'independiente': {
      icon: 'ri-user-star-line',
      color: 'warning',
      benefits: [
        '1 contador',
        'Hasta 5 empresas',
        'Facturas ilimitadas',
        'Soporte prioritario',
        '20GB almacenamiento',
      ],
    },
    'despacho': {
      icon: 'ri-team-line',
      color: 'secondary',
      benefits: [
        '5 contadores',
        'Hasta 20 empresas',
        'Facturas ilimitadas',
        'Soporte 24/7',
        '100GB almacenamiento',
        'Panel de administración',
      ],
    },
    'firma': {
      icon: 'ri-building-2-line',
      color: 'error',
      benefits: [
        '15 contadores',
        'Hasta 100 empresas',
        'Facturas ilimitadas',
        'Soporte dedicado',
        'Almacenamiento ilimitado',
        'API completa',
        'White label',
      ],
    },
  }

  // Remover sufijo "anual" del código para obtener el plan base
  const baseCode = planCode.value.replace('anual', '')
  return plans[baseCode] || plans['starter']
})

// Período formateado
const billingPeriodFormatted = computed(() => {
  if (billingPeriod.value === 'anual') return 'Anual'
  if (billingPeriod.value === 'mensual') return 'Mensual'
  return billingPeriod.value
})

// Auto login después de 3 segundos
const countdown = ref(3)
const isLoggingIn = ref(false)

onMounted(() => {
  if (isNewUser.value) {
    const interval = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(interval)
        redirectToLogin()
      }
    }, 1000)

    onBeforeUnmount(() => clearInterval(interval))
  }
})

const redirectToLogin = () => {
  isLoggingIn.value = true
  navigateTo({
    path: '/login',
    query: {
      email: userEmail.value,
      welcome: 'true',
    },
  })
}
</script>

<template>
  <div class="welcome-page">
    <Navbar />

    <VContainer>
      <div class="d-flex justify-center align-center welcome-card">
        <VCard
          width="100%"
          max-width="700"
        >
          <VCardText class="pa-12">
            <div class="d-flex flex-column align-center text-center gap-6">
              <!-- Animación de éxito -->
              <VAvatar
                size="120"
                color="success"
                variant="tonal"
              >
                <VIcon
                  icon="ri-check-double-line"
                  size="70"
                />
              </VAvatar>

              <!-- Título -->
              <div>
                <h2 class="text-h2 mb-2">
                  ¡Bienvenido, {{ fullName }}!
                </h2>
                <p class="text-h6 text-medium-emphasis">
                  {{ businessName }}
                </p>
              </div>

              <!-- Información -->
              <VCard
                flat
                color="rgba(var(--v-theme-success), 0.08)"
                class="w-100"
              >
                <VCardText>
                  <div class="d-flex flex-column gap-4">
                    <div class="d-flex align-center gap-3">
                      <VIcon
                        icon="ri-mail-check-line"
                        color="success"
                        size="24"
                      />
                      <div class="text-start">
                        <div class="text-body-1 font-weight-medium">
                          Tu correo: {{ userEmail }}
                        </div>
                        <div class="text-body-2 text-medium-emphasis">
                          Usa este correo para iniciar sesión
                        </div>
                      </div>
                    </div>

                    <VDivider />

                    <!-- Información del plan suscrito -->
                    <div class="text-body-1">
                      <div class="d-flex align-center gap-2 mb-3">
                        <VIcon
                          :icon="planInfo.icon"
                          :color="planInfo.color"
                          size="24"
                        />
                        <div class="font-weight-medium">
                          Plan {{ planName }} - {{ billingPeriodFormatted }}
                        </div>
                      </div>
                      
                      <div class="text-body-2 text-medium-emphasis mb-2">
                        Tu plan incluye:
                      </div>
                      
                      <div class="d-flex flex-column gap-2">
                        <div
                          v-for="(benefit, index) in planInfo.benefits"
                          :key="index"
                          class="d-flex align-center gap-2"
                        >
                          <VIcon
                            icon="ri-check-line"
                            color="success"
                            size="20"
                          />
                          <span>{{ benefit }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </VCardText>
              </VCard>

              <!-- Botón de acción -->
              <div class="d-flex flex-column gap-3 w-100">
                <VBtn
                  block
                  color="success"
                  size="x-large"
                  :loading="isLoggingIn"
                  @click="redirectToLogin"
                >
                  Iniciar sesión ahora
                  <VIcon
                    icon="ri-arrow-right-line"
                    class="ms-2"
                  />
                </VBtn>

                <div
                  v-if="countdown > 0"
                  class="text-body-2 text-medium-emphasis"
                >
                  Serás redirigido automáticamente en {{ countdown }} segundo{{ countdown !== 1 ? 's' : '' }}...
                </div>
              </div>

              <!-- Info adicional -->
              <VAlert
                color="info"
                variant="tonal"
                density="compact"
                class="w-100"
              >
                <template #prepend>
                  <VIcon icon="ri-information-line" />
                </template>
                <div class="text-body-2">
                  <strong>Próximo paso:</strong> Inicia sesión para comenzar a configurar tu empresa.
                </div>
              </VAlert>
            </div>
          </VCardText>
        </VCard>
      </div>
    </VContainer>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.welcome-card {
  margin-block: 5rem 5.25rem;
}

.welcome-page {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>

