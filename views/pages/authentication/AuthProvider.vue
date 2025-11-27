<script setup lang="ts">
import { useTheme } from 'vuetify'

const { signIn } = useAuth()
const { global } = useTheme()

const authProviders = [
  {
    id: 'google',
    icon: 'bxl-google',
    color: '#db4437',
    colorInDark: '#db4437',
    label: 'Google',
  },
  {
    id: 'facebook',
    icon: 'bxl-facebook',
    color: '#4267b2',
    colorInDark: '#4267b2',
    label: 'Facebook',
  },

  // Descomentar cuando tengas credenciales de Apple
  // {
  //   id: 'apple',
  //   icon: 'bxl-apple',
  //   color: '#000000',
  //   colorInDark: '#ffffff',
  //   label: 'Apple',
  // },
]

const handleSocialLogin = async (providerId: string) => {
  await signIn(providerId, { callbackUrl: '/' })
}
</script>

<template>
  <div class="d-flex justify-center gap-2">
    <VBtn
      v-for="provider in authProviders"
      :key="provider.id"
      :icon="provider.icon"
      variant="tonal"
      size="small"
      :color="global.name.value === 'dark' ? provider.colorInDark : provider.color"
      :title="`Continuar con ${provider.label}`"
      @click="handleSocialLogin(provider.id)"
    />
  </div>
</template>
