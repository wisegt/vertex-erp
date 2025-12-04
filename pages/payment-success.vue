<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import { useConfigStore } from '@core/stores/config'

const store = useConfigStore()
const route = useRoute()

store.skin = 'default'
definePageMeta({
  layout: 'blank',
  public: true,
})

// Obtener el checkout_id de la URL si existe
const checkoutId = computed(() => route.query.checkout_id as string)

// Usar el composable de Recurrente para verificar el pago
const { getCheckoutStatus } = useRecurrente()
const checkoutStatus = ref<any>(null)
const isVerifying = ref(true)
const billingEmail = ref('')

onMounted(async () => {
  // Si hay un checkout_id, verificar su estado y crear la suscripción
  if (checkoutId.value) {
    try {
      // Obtener el estado del checkout desde Recurrente
      checkoutStatus.value = await getCheckoutStatus(checkoutId.value)

      console.log('🔄 Iniciando creación de suscripción...')
      console.log('🔑 Usuario autenticado:', isAuthenticated.value)

      // Crear la suscripción usando los datos del checkout
      const response: any = await $fetch('/api/subscription/create-from-checkout', {
        method: 'POST',
        body: {
          checkoutId: checkoutId.value,
        },
      })

      console.log('📊 Respuesta de crear suscripción:', response)

      if (response.success) {
        console.log('✅ Suscripción creada:', response.subscriptionId)
        billingEmail.value = response.email || ''

        // Si el usuario no está autenticado, enviar email para crear cuenta
        if (!isAuthenticated.value) {
          console.log('📧 Usuario NO autenticado, enviando email de setup...')
          console.log('📧 Email destino:', response.email)
          console.log('📧 Empresa:', response.businessName)

          try {
            const emailResponse: any = await $fetch('/api/auth/send-setup-email', {
              method: 'POST',
              body: {
                email: response.email,
                businessName: response.businessName,
                checkoutId: checkoutId.value,
              },
            })

            console.log('📧 Respuesta de envío de email:', emailResponse)

            if (emailResponse.success) {
              console.log('✅ Email enviado (o URL en consola del servidor)')
              if (emailResponse.setupUrl)
                console.log('🔗 URL de setup:', emailResponse.setupUrl)
            }
            else {
              console.error('❌ Error enviando email:', emailResponse.message)
            }
          }
          catch (emailError) {
            console.error('❌ Error al llamar send-setup-email:', emailError)
          }
        }
        else {
          console.log('✅ Usuario autenticado, no se envía email')
        }
      }
      else {
        console.warn('⚠️ No se pudo crear la suscripción:', response.message)
      }
    }
    catch (error) {
      console.error('Error en el proceso:', error)
    }
    finally {
      isVerifying.value = false
    }
  }
  else {
    isVerifying.value = false
  }
})

// Estado de autenticación
const { status: authStatus } = useAuth()
const isAuthenticated = computed(() => authStatus.value === 'authenticated')

// Redirigir según el estado de autenticación
const countdown = ref(5)
const interval = ref<NodeJS.Timeout | null>(null)
const redirectUrl = ref('/setup-account') // Por defecto, a crear cuenta

onMounted(() => {
  // Determinar a dónde redirigir
  if (isAuthenticated.value) {
    redirectUrl.value = '/dashboards/analytics'
  }
  else {
    // No autenticado - necesita crear cuenta
    // No iniciar contador, mostrar botón manual
    return
  }

  // Solo iniciar contador si está autenticado
  interval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (interval.value)
        clearInterval(interval.value)

      navigateTo(redirectUrl.value)
    }
  }, 1000)
})

onBeforeUnmount(() => {
  if (interval.value)
    clearInterval(interval.value)
})
</script>

<template>
  <div class="payment-success-page">
    <Navbar />

    <VContainer>
      <div class="d-flex justify-center align-center payment-success-card">
        <VCard
          width="100%"
          max-width="600"
        >
          <VCardText class="pa-12 text-center">
            <!-- Loading -->
            <div
              v-if="isVerifying"
              class="d-flex flex-column align-center gap-4"
            >
              <VProgressCircular
                indeterminate
                color="success"
                size="64"
              />
              <h4 class="text-h4">
                Verificando tu pago...
              </h4>
            </div>

            <!-- Success -->
            <div
              v-else
              class="d-flex flex-column align-center gap-4"
            >
              <!-- Icono de éxito -->
              <VAvatar
                size="100"
                color="success"
                variant="tonal"
              >
                <VIcon
                  icon="ri-check-line"
                  size="60"
                />
              </VAvatar>

              <!-- Título -->
              <h3 class="text-h3 text-success">
                ¡Pago exitoso!
              </h3>

              <!-- Mensaje -->
              <p class="text-h6 text-medium-emphasis">
                Tu suscripción a VERTEX ERP ha sido activada correctamente
              </p>

              <!-- Detalles del checkout si están disponibles -->
              <VCard
                v-if="checkoutStatus"
                variant="outlined"
                class="w-100"
              >
                <VCardText>
                  <div class="d-flex flex-column gap-3">
                    <div class="d-flex justify-space-between">
                      <span class="text-medium-emphasis">ID de transacción:</span>
                      <span class="font-weight-medium">{{ checkoutStatus.id }}</span>
                    </div>
                    <div
                      v-if="checkoutStatus.subscription"
                      class="d-flex justify-space-between"
                    >
                      <span class="text-medium-emphasis">Suscripción:</span>
                      <span class="font-weight-medium">{{ checkoutStatus.subscription.id }}</span>
                    </div>
                    <div
                      v-if="checkoutStatus.payment_intent"
                      class="d-flex justify-space-between"
                    >
                      <span class="text-medium-emphasis">Estado:</span>
                      <VChip
                        color="success"
                        size="small"
                      >
                        {{ checkoutStatus.payment_intent.status }}
                      </VChip>
                    </div>
                  </div>
                </VCardText>
              </VCard>

              <!-- Beneficios -->
              <VCard
                flat
                color="rgba(var(--v-theme-success), 0.08)"
                class="w-100"
              >
                <VCardText>
                  <div class="text-body-1 mb-3">
                    <strong>Ya puedes disfrutar de:</strong>
                  </div>
                  <div class="d-flex flex-column gap-2">
                    <div class="d-flex align-center gap-2">
                      <VIcon
                        icon="ri-check-line"
                        color="success"
                        size="20"
                      />
                      <span>Acceso completo a todas las funcionalidades</span>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <VIcon
                        icon="ri-check-line"
                        color="success"
                        size="20"
                      />
                      <span>Soporte técnico prioritario</span>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <VIcon
                        icon="ri-check-line"
                        color="success"
                        size="20"
                      />
                      <span>Actualizaciones automáticas</span>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <VIcon
                        icon="ri-check-line"
                        color="success"
                        size="20"
                      />
                      <span>Almacenamiento ilimitado</span>
                    </div>
                  </div>
                </VCardText>
              </VCard>

              <!-- Botones de acción -->
              <div class="d-flex flex-column gap-3 w-100">
                <!-- Usuario autenticado - ir al dashboard -->
                <template v-if="isAuthenticated">
                  <VBtn
                    block
                    color="success"
                    size="large"
                    to="/dashboards/analytics"
                  >
                    Ir al dashboard
                    <VIcon
                      icon="ri-arrow-right-line"
                      class="ms-2"
                    />
                  </VBtn>

                  <div class="text-body-2 text-medium-emphasis">
                    Serás redirigido automáticamente en {{ countdown }} segundo{{ countdown !== 1 ? 's' : '' }}...
                  </div>
                </template>

                <!-- Usuario NO autenticado - crear cuenta -->
                <template v-else>
                  <VBtn
                    block
                    color="success"
                    size="large"
                    @click="navigateTo(`/setup-account?token=${checkoutId}&email=${billingEmail}`)"
                  >
                    Crear mi cuenta
                    <VIcon
                      icon="ri-arrow-right-line"
                      class="ms-2"
                    />
                  </VBtn>

                  <div class="text-body-2 text-medium-emphasis">
                    Recibirás un correo con las instrucciones para acceder a tu cuenta.
                  </div>
                </template>
              </div>

              <!-- Información adicional -->
              <VAlert
                color="info"
                variant="tonal"
                density="compact"
                class="w-100"
              >
                <template #prepend>
                  <VIcon icon="ri-mail-line" />
                </template>
                <div class="text-body-2">
                  Recibirás un correo de confirmación con los detalles de tu suscripción y tu factura.
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
.payment-success-card {
  margin-block: 9.25rem 5.25rem;
}

.payment-success-page {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
