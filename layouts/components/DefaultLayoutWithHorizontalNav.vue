<script lang="ts" setup>
import navItems from '@/navigation/horizontal'

import { themeConfig } from '@themeConfig'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavBarNotifications from '@/layouts/components/NavBarNotifications.vue'
import NavSearchBar from '@/layouts/components/NavSearchBar.vue'
import NavbarShortcuts from '@/layouts/components/NavbarShortcuts.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import NavBarI18n from '@core/components/I18n.vue'
import { HorizontalNavLayout } from '@layouts'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import TrialBanner from '@/components/trial/TrialBanner.vue'

// Composable para suscripción
const { loadSubscriptionStatus, isTrialing } = useSubscription()

// Cargar estado de suscripción al montar
onMounted(() => {
  loadSubscriptionStatus()
})
</script>

<template>
  <HorizontalNavLayout :nav-items="navItems">
    <!-- 👉 navbar -->
    <template #navbar>
      <NuxtLink
        to="/"
        class="d-flex align-start gap-x-4"
      >
        <VNodeRenderer :nodes="themeConfig.app.logo" />

        <h1 class="leading-normal text-xl text-uppercase">
          {{ themeConfig.app.title }}
        </h1>
      </NuxtLink>
      <VSpacer />

      <NavSearchBar />

      <NavBarI18n
        v-if="themeConfig.app.i18n.enable && themeConfig.app.i18n.langConfig?.length"
        :languages="themeConfig.app.i18n.langConfig"
      />

      <NavbarThemeSwitcher />
      <NavbarShortcuts />
      <NavBarNotifications class="me-2" />
      <UserProfile />
    </template>

    <!-- 👉 Pages -->
    <!-- Banner de Trial - Se muestra en todas las páginas si el usuario está en trial -->
    <TrialBanner v-if="isTrialing" :auto-load="false" />
    
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>

    <!-- 👉 Customizer -->
    <!-- <TheCustomizer /> -->
  </HorizontalNavLayout>
</template>
