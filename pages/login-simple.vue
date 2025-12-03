<script setup lang="ts">
import type { User } from '@/types'

definePageMeta({
  layout: 'blank',
  unauthenticatedOnly: true,
})

const { signIn, data: sessionData } = useAuth()
const router = useRouter()
const route = useRoute()
const ability = useAbility()

const credentials = ref({
  email: 'admin@vertex-erp.com',
  password: 'Demo123!',
})

const isSubmitting = ref(false)
const error = ref('')

async function login() {
  console.log('[simple-login] Iniciando login...')
  error.value = ''
  isSubmitting.value = true

  try {
    console.log('[simple-login] Llamando a signIn...')

    const response = await signIn('credentials', {
      callbackUrl: '/',
      redirect: false,
      ...credentials.value,
    })

    console.log('[simple-login] Respuesta recibida:', response)

    if (response?.error) {
      error.value = response.error
      console.error('[simple-login] Error:', response.error)
      isSubmitting.value = false

      return
    }

    console.log('[simple-login] Login exitoso')

    // Esperar a que sessionData se actualice
    await nextTick()

    const user = sessionData.value?.user

    if (user) {
      // Guardar datos del usuario en cookies
      useCookie<Partial<User>>('userData').value = user
      useCookie<User['abilityRules']>('userAbilityRules').value = user.abilityRules

      // Actualizar abilities
      ability.update(user.abilityRules ?? [])

      console.log('[simple-login] Usuario y abilities configurados')
    }

    // Redirigir
    const redirectTo = route.query.to ? String(route.query.to) : '/'

    console.log('[simple-login] Redirigiendo a:', redirectTo)
    await router.push(redirectTo)
  }
  catch (err) {
    console.error('[simple-login] Excepción:', err)
    error.value = 'Error de conexión'
  }
  finally {
    isSubmitting.value = false
    console.log('[simple-login] Proceso completado')
  }
}
</script>

<template>
  <div
    class="d-flex align-center justify-center"
    style="min-block-size: 100vh;"
  >
    <VCard
      max-width="400"
      class="pa-4"
    >
      <VCardTitle>Login Simplificado</VCardTitle>

      <VCardText>
        <VAlert
          v-if="error"
          type="error"
          class="mb-4"
        >
          {{ error }}
        </VAlert>

        <VForm @submit.prevent="login">
          <VTextField
            v-model="credentials.email"
            label="Email"
            type="email"
            class="mb-3"
          />

          <VTextField
            v-model="credentials.password"
            label="Password"
            type="password"
            class="mb-3"
          />

          <VBtn
            type="submit"
            block
            color="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Ingresar
          </VBtn>
        </VForm>

        <div class="mt-4">
          <p class="text-caption">
            Admin: admin@vertex-erp.com / Demo123!
          </p>
        </div>
      </VCardText>
    </VCard>
  </div>
</template>
