<script setup lang="ts">
import { themeConfig } from '@themeConfig'
import type { User } from 'next-auth'
import { emailValidator, requiredValidator } from '@/@core/utils/validators'

import tree1 from '@images/misc/tree1.png'
import authV2LoginIllustrationBorderedDark from '@images/pages/auth-v2-login-illustration-bordered-dark.png'
import authV2LoginIllustrationBorderedLight from '@images/pages/auth-v2-login-illustration-bordered-light.png'
import authV2LoginIllustrationDark from '@images/pages/auth-v2-login-illustration-dark.png'
import authV2LoginIllustrationLight from '@images/pages/auth-v2-login-illustration-light.png'
import authV2MaskDark from '@images/pages/mask-v2-dark.png'
import authV2MaskLight from '@images/pages/mask-v2-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import AuthProvider from '@/views/pages/authentication/AuthProvider.vue'

interface ApiError { data?: Record<string, string | undefined> }

const { signIn, data: sessionData, getSession } = useAuth()

const isHydrated = ref(false)

const authThemeImg = useGenerateImageVariant(
  authV2LoginIllustrationLight,
  authV2LoginIllustrationDark,
  authV2LoginIllustrationBorderedLight,
  authV2LoginIllustrationBorderedDark,
  true)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

definePageMeta({
  layout: 'blank',
  public: true,
  unauthenticatedOnly: true,
})

const isPasswordVisible = ref(false)

const route = useRoute()

const ability = useAbility()

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
  form: undefined,
})

const refVForm = ref<any>()

const credentials = ref({
  email: 'admin@vertex-erp.com',
  password: 'Demo123!',
})

const rememberMe = ref(false)
const isSubmitting = ref(false)

// Ruta por defecto después del login (dashboard)
const defaultRedirect = '/dashboards/crm'

onMounted(() => {
  isHydrated.value = true
})

async function login() {
  errors.value.form = undefined
  isSubmitting.value = true

  let response

  try {
    console.log('[login] Iniciando login con:', credentials.value.email)
    response = await signIn('credentials', {
      callbackUrl: defaultRedirect,
      redirect: false,
      ...credentials.value,
    })
    console.log('[login] Respuesta de signIn:', response)
  }
  catch (err) {
    console.error('[login] signIn error', err)
    errors.value.form = 'No se pudo conectar. Verifica que el servidor esté en el mismo puerto (ej: 127.0.0.1:3001).'
    isSubmitting.value = false

    return
  }

  // If error is not null => Error is occurred
  if (response && response.error) {
    console.warn('[login] Error en response:', response.error)
    try {
      const apiError: ApiError = JSON.parse(response.error)

      errors.value = apiError.data as Record<string, string | undefined>
    }
    catch {
      errors.value.form = response.error
    }
    isSubmitting.value = false

    // If err => Don't execute further
    return
  }

  console.log('[login] Login exitoso, obteniendo sesión')

  // Reset error on successful login
  errors.value = {}

  // Usar sessionData que ya está disponible
  console.log('[login] Usando sessionData:', sessionData.value?.user?.email)

  const user = sessionData.value?.user

  if (!user) {
    console.error('[login] No hay usuario en la sesión')
    isSubmitting.value = false

    return
  }

  useCookie<Partial<User>>('userData').value = user

  // Save user abilities in cookie so we can retrieve it back on refresh
  useCookie<User['abilityRules']>('userAbilityRules').value = user.abilityRules

  ability.update(user.abilityRules ?? [])

  isSubmitting.value = false

  // Determinar a dónde redirigir:
  // 1. Si hay un query param "to", usar ese (pero no si es "/" que es la landing)
  // 2. Si no, usar el dashboard por defecto
  const redirectTo = route.query.to 
    ? (String(route.query.to) === '/' ? defaultRedirect : String(route.query.to))
    : defaultRedirect

  console.log('[login] Redirigiendo a:', redirectTo)
  await navigateTo(redirectTo, { replace: true })
}

const onSubmit = () => {
  console.log('[onSubmit] Intentando validar formulario...')
  
  if (!refVForm.value) {
    console.error('[onSubmit] refVForm no está definido')
    login()
    return
  }

  refVForm.value.validate()
    .then(({ valid: isValid }: { valid: boolean }) => {
      console.log('[onSubmit] Validación completada, isValid:', isValid)
      if (isValid)
        login()
      else
        console.warn('[onSubmit] Formulario no válido')
    })
    .catch((err: any) => {
      console.error('[onSubmit] Error en validación:', err)
      login()
    })
}
</script>

<template>
  <div v-if="isHydrated">
    <NuxtLink to="/">
      <div class="auth-logo d-flex align-center gap-x-3">
        <VNodeRenderer :nodes="themeConfig.app.logo" />
        <h1 class="auth-title">
          {{ themeConfig.app.title }}
        </h1>
      </div>
    </NuxtLink>

    <VRow
      no-gutters
      class="auth-wrapper"
    >
      <VCol
        md="8"
        class="d-none d-md-flex position-relative"
      >
        <div class="d-flex align-center justify-end w-100 h-100 pa-10 pe-0">
          <VImg
            max-width="797"
            :src="authThemeImg"
            class="auth-illustration"
          />
        </div>

        <img
          class="auth-footer-mask"
          height="360"
          :src="authThemeMask"
        >

        <VImg
          :src="tree1"
          alt="tree image"
          height="190"
          width="90"
          class="auth-footer-tree"
        />
      </VCol>

      <VCol
        cols="12"
        md="4"
        class="auth-card-v2 d-flex align-center justify-center"
        style="background-color: rgb(var(--v-theme-surface));"
      >
        <VCard
          flat
          :max-width="500"
          class="mt-12 mt-sm-0 pa-4"
        >
          <VCardText>
            <h4 class="text-h4 mb-1">
              Bienvenidos a <span class="text-capitalize">{{ themeConfig.app.title }}!</span> 👋🏻
            </h4>
            <p class="mb-0">
              Por favor ingresa con tu cuenta y que empiece la aventura
            </p>
          </VCardText>
          <VCardText>
            <VAlert
              color="primary"
              variant="tonal"
            >
              <p class="text-caption mb-2 text-primary">
                Admin: <strong>admin@vertex-erp.com</strong> / Pass: <strong>Demo123!</strong>
              </p>
              <p class="text-caption mb-0 text-primary">
                Gerente: <strong>gerente@comercialexito.com</strong> / Pass: <strong>Demo123!</strong>
              </p>
            </VAlert>
          </VCardText>

          <VCardText>
            <VAlert
              v-if="errors.form"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              {{ errors.form }}
            </VAlert>

            <VForm
              ref="refVForm"
              @submit.prevent="onSubmit"
            >
              <VRow>
                <!-- email -->
                <VCol cols="12">
                  <VTextField
                    v-model="credentials.email"
                    label="Email"
                    placeholder="johndoe@email.com"
                    type="email"
                    autofocus
                    :rules="[requiredValidator, emailValidator]"
                    :error-messages="errors.email"
                  />
                </VCol>

                <!-- password -->
                <VCol cols="12">
                  <VTextField
                    v-model="credentials.password"
                    label="Password"
                    placeholder="············"
                    :rules="[requiredValidator]"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    autocomplete="password"
                    :error-messages="errors.password"
                    :append-inner-icon="isPasswordVisible ? 'ri-eye-off-line' : 'ri-eye-line'"
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />

                  <div class="d-flex align-center flex-wrap justify-space-between my-5 gap-2">
                    <VCheckbox
                      v-model="rememberMe"
                      label="Recordarme"
                    />
                    <NuxtLink
                      class="text-primary"
                      :to="{ name: 'forgot-password' }"
                    >
                      ¿Olvidaste tu contraseña?
                    </NuxtLink>
                  </div>

                  <VBtn
                    block
                    type="submit"
                    :loading="isSubmitting"
                    :disabled="isSubmitting"
                  >
                    Ingresar
                  </VBtn>
                </VCol>

                <!-- create account -->
                <VCol
                  cols="12"
                  class="text-center text-base"
                >
                  <span>¿Nuevo en la plataforma?</span> <NuxtLink
                    class="text-primary d-inline-block"
                    :to="{ name: 'register' }"
                  >
                    Crea tu cuenta
                  </NuxtLink>
                </VCol>
                <VCol
                  cols="12"
                  class="d-flex align-center"
                >
                  <VDivider />
                  <span class="mx-4">or</span>
                  <VDivider />
                </VCol>

                <!-- auth providers -->
                <VCol
                  cols="12"
                  class="text-center"
                >
                  <AuthProvider />
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";
</style>
