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
const router = useRouter()

// Obtener token de la URL
const token = computed(() => route.query.token as string)
const email = computed(() => route.query.email as string)

// Estados
const isLoading = ref(false)
const isVerifying = ref(true)
const tokenValid = ref(false)
const errorMessage = ref('')

// Formulario
const form = ref({
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
})

const errors = ref<Record<string, string>>({})

// Verificar token al montar
onMounted(async () => {
  if (!token.value || !email.value) {
    errorMessage.value = 'Enlace inválido o expirado'
    isVerifying.value = false

    return
  }

  try {
    const response = await $fetch('/api/auth/verify-setup-token', {
      method: 'POST',
      body: {
        token: token.value,
        email: email.value,
      },
    })

    if (response.success)
      tokenValid.value = true

    else
      errorMessage.value = response.message || 'Token inválido o expirado'
  }
  catch (error: any) {
    errorMessage.value = 'Error al verificar el enlace'
  }
  finally {
    isVerifying.value = false
  }
})

// Validar formulario
const validateForm = () => {
  errors.value = {}

  if (!form.value.firstName)
    errors.value.firstName = 'El nombre es requerido'

  if (!form.value.lastName)
    errors.value.lastName = 'El apellido es requerido'

  if (!form.value.password)
    errors.value.password = 'La contraseña es requerida'

  else if (form.value.password.length < 8)
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres'

  if (form.value.password !== form.value.confirmPassword)
    errors.value.confirmPassword = 'Las contraseñas no coinciden'

  return Object.keys(errors.value).length === 0
}

// Crear cuenta e iniciar sesión automáticamente
const createAccount = async () => {
  if (!validateForm())
    return

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 1. Crear la cuenta
    const response = await $fetch('/api/auth/complete-setup', {
      method: 'POST',
      body: {
        token: token.value,
        email: email.value,
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        password: form.value.password,
      },
    })

    if (response.success) {
      // Redirigir a página de bienvenida con datos del usuario y plan
      await navigateTo({
        path: '/welcome',
        query: {
          email: email.value,
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          businessName: response.businessName || '',
          planCode: response.planCode || '',
          planName: response.planName || '',
          billingPeriod: response.billingPeriod || '',
          new: 'true',
        },
      })
    }
    else {
      errorMessage.value = response.message || 'Error al crear la cuenta'
    }
  }
  catch (error: any) {
    errorMessage.value = error.data?.message || 'Error al crear la cuenta'
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="setup-account-page">
    <Navbar />

    <VContainer>
      <div class="d-flex justify-center align-center setup-account-card">
        <VCard
          width="100%"
          max-width="500"
        >
          <VCardText class="pa-10">
            <!-- Loading -->
            <div
              v-if="isVerifying"
              class="d-flex flex-column align-center gap-4"
            >
              <VProgressCircular
                indeterminate
                color="primary"
                size="64"
              />
              <h4 class="text-h5">
                Verificando enlace...
              </h4>
            </div>

            <!-- Error -->
            <div
              v-else-if="!tokenValid"
              class="d-flex flex-column align-center gap-4"
            >
              <VAvatar
                size="100"
                color="error"
                variant="tonal"
              >
                <VIcon
                  icon="ri-close-line"
                  size="60"
                />
              </VAvatar>

              <h3 class="text-h4">
                Enlace inválido
              </h3>

              <VAlert
                type="error"
                variant="tonal"
              >
                {{ errorMessage }}
              </VAlert>

              <VBtn
                block
                color="primary"
                to="/front-pages/payment"
              >
                Volver al pago
              </VBtn>
            </div>

            <!-- Formulario -->
            <div v-else>
              <div class="text-center mb-6">
                <VAvatar
                  size="80"
                  color="success"
                  variant="tonal"
                  class="mb-4"
                >
                  <VIcon
                    icon="ri-user-add-line"
                    size="40"
                  />
                </VAvatar>
                <h3 class="text-h4 mb-2">
                  ¡Bienvenido a VERTEX!
                </h3>
                <p class="text-body-1 text-medium-emphasis">
                  Tu suscripción está activa. Crea tu cuenta para acceder.
                </p>
              </div>

              <!-- Email (readonly) -->
              <VTextField
                v-model="email"
                label="Correo electrónico"
                prepend-inner-icon="ri-mail-line"
                readonly
                variant="outlined"
                class="mb-4"
              />

              <!-- Nombre -->
              <VTextField
                v-model="form.firstName"
                label="Nombre"
                prepend-inner-icon="ri-user-line"
                :error-messages="errors.firstName"
                variant="outlined"
                class="mb-4"
              />

              <!-- Apellido -->
              <VTextField
                v-model="form.lastName"
                label="Apellido"
                prepend-inner-icon="ri-user-line"
                :error-messages="errors.lastName"
                variant="outlined"
                class="mb-4"
              />

              <!-- Contraseña -->
              <VTextField
                v-model="form.password"
                label="Contraseña"
                type="password"
                prepend-inner-icon="ri-lock-line"
                :error-messages="errors.password"
                hint="Mínimo 8 caracteres"
                variant="outlined"
                class="mb-4"
              />

              <!-- Confirmar contraseña -->
              <VTextField
                v-model="form.confirmPassword"
                label="Confirmar contraseña"
                type="password"
                prepend-inner-icon="ri-lock-line"
                :error-messages="errors.confirmPassword"
                variant="outlined"
                class="mb-6"
              />

              <!-- Error general -->
              <VAlert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
              >
                {{ errorMessage }}
              </VAlert>

              <!-- Botón -->
              <VBtn
                block
                color="success"
                size="large"
                :loading="isLoading"
                :disabled="isLoading"
                @click="createAccount"
              >
                <span v-if="!isLoading">Crear mi cuenta</span>
                <span v-else>Creando tu cuenta...</span>
              </VBtn>

              <!-- Términos -->
              <p class="text-caption text-center text-medium-emphasis mt-4">
                Al crear tu cuenta, aceptas nuestros
                <a href="#">Términos de Servicio</a> y
                <a href="#">Política de Privacidad</a>
              </p>
            </div>
          </VCardText>
        </VCard>
      </div>
    </VContainer>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.setup-account-card {
  margin-block: 9.25rem 5.25rem;
}

.setup-account-page {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
