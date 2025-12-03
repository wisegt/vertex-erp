<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'
import { PerfectScrollbar } from 'vue3-perfect-scrollbar'
import { useDisplay } from 'vuetify'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const props = defineProps({
  activeId: String,
})

const display = useDisplay()
const route = useRoute()

const { y } = useWindowScroll()

const sidebar = ref(false)

watch(() => display, () => {
  return display.mdAndUp ? sidebar.value = false : sidebar.value
}, { deep: true })

const navItems = ['Inicio', 'Módulos', 'Roadmap', 'Precios', 'FAQ', 'Contacto']

const getHash = (item: string) => {
  const hashMap: Record<string, string> = {
    'Inicio': 'home',
    'Módulos': 'features',
    'Roadmap': 'roadmap',
    'Precios': 'pricing-plan',
    'FAQ': 'faq',
    'Contacto': 'contact-us',
  }
  return hashMap[item] || item.toLowerCase()
}

// Determine the correct route name based on current route
const getLandingRoute = () => {
  if (route.path === '/' || route.path === '/front-pages/landing-page' || route.path === '/front-pages/landing-page/') {
    return route.name
  }
  return 'index'
}
</script>

<template>
  <!-- Navegación móvil -->
  <VNavigationDrawer
    v-model="sidebar"
    data-allow-mismatch
    disable-resize-watcher
  >
    <PerfectScrollbar
      :options="{ wheelPropagation: false }"
      class="h-100"
    >
      <div>
        <div class="d-flex flex-column gap-y-4 pa-4">
          <NuxtLink
            v-for="(item, index) in navItems"
            :key="index"
            :to="{ name: getLandingRoute(), hash: `#${getHash(item)}` }"
            class="font-weight-medium"
            :class="[props.activeId?.toLocaleLowerCase() === getHash(item) ? 'active-link' : 'text-high-emphasis']"
          >
            {{ item }}
          </NuxtLink>

          <VDivider class="my-2" />

          <a
            href="/login"
            class="text-body-1 font-weight-medium nav-link px-0"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>

      <VIcon
        id="navigation-drawer-close-btn"
        icon="ri-close-line"
        size="20"
        @click="() => sidebar = !sidebar"
      />
    </PerfectScrollbar>
  </VNavigationDrawer>

  <!-- Navbar desktop -->
  <div class="front-page-navbar">
    <VAppBar
      :class="y > 20 ? 'front-page-navbar-box-shadow' : ''"
      elevation="0"
      class="rounded-b-lg"
    >
      <!-- Toggle móvil -->
      <VAppBarNavIcon
        :class="$vuetify.display.mdAndUp ? 'd-none' : 'd-inline-block'"
        class="ms-0 me-1"
        color="high-emphasis"
        @click="() => sidebar = !sidebar"
      />

      <!-- Logo y navegación -->
      <div class="d-flex align-center">
        <VAppBarTitle class="me-6">
          <NuxtLink
            :to="{ name: 'index' }"
            class="d-flex gap-x-4"
          >
            <div class="d-flex gap-x-3 align-center">
              <VNodeRenderer :nodes="themeConfig.app.logo" />

              <div
                class="nav-title text-uppercase text-truncate"
                :class="[$vuetify.display.lgAndUp ? 'd-block' : 'd-none']"
              >
                {{ themeConfig.app.title }}
              </div>
            </div>
          </NuxtLink>
        </VAppBarTitle>

        <!-- Links de navegación -->
        <div
          :class="$vuetify.display.mdAndUp ? 'd-flex' : 'd-none'"
          class="text-base align-center gap-x-1"
        >
          <NuxtLink
            v-for="(item, index) in navItems"
            :key="index"
            :to="{ name: getLandingRoute(), hash: `#${getHash(item)}` }"
            class="nav-link font-weight-medium px-3"
            :class="[props.activeId?.toLocaleLowerCase() === getHash(item) ? 'active-link' : '']"
          >
            {{ item }}
          </NuxtLink>
        </div>
      </div>

      <VSpacer />

      <!-- Acciones -->
      <div class="d-flex gap-x-4 align-center">
        <NavbarThemeSwitcher class="me-0 me-sm-2" />

        <!-- Botón Login usando <a> directo -->
        <a
          v-if="$vuetify.display.mdAndUp"
          href="/login"
          class="login-btn"
        >
          Iniciar Sesión
        </a>

        <!-- Botón Prueba Gratis -->
        <a
          v-if="$vuetify.display.lgAndUp"
          href="/front-pages/checkout"
          class="trial-btn"
        >
          Prueba Gratis
        </a>

        <a
          v-else-if="$vuetify.display.mdAndUp"
          href="/front-pages/checkout"
          class="trial-btn-icon"
        >
          <VIcon icon="ri-rocket-line" />
        </a>
      </div>
    </VAppBar>
  </div>
</template>

<style lang="scss" scoped>
.front-page-navbar-box-shadow {
  box-shadow: 0 4px 8px -4px rgba(var(--v-shadow-key-umbra-color), 42%) !important;
}

.nav-title {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity)) !important;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.15px;
  line-height: 1.5rem;
}

.nav-link {
  padding-inline: 0.5rem;

  &:not(:hover) {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  }
}

.active-link {
  color: rgb(var(--v-theme-primary)) !important;
}

// Estilos para botones de navegación
.login-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.22);
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  background-color: transparent;
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  z-index: 10;

  &:hover {
    background-color: rgba(var(--v-theme-on-surface), 0.04);
    border-color: rgba(var(--v-theme-on-surface), 0.32);
  }
}

.trial-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  color: white;
  background-color: rgb(var(--v-theme-primary));
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  z-index: 10;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.trial-btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  text-decoration: none;
  color: white;
  background-color: rgb(var(--v-theme-primary));
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  z-index: 10;

  &:hover {
    opacity: 0.9;
  }
}
</style>

<style lang="scss">
@media (min-width: 1920px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(1440px - 32px);
    }
  }
}

@media (min-width: 1280px) and (max-width: 1919px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(1200px - 32px);
    }
  }
}

@media (min-width: 960px) and (max-width: 1279px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(900px - 32px);
    }
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(100% - 64px);
    }
  }
}

@media (max-width: 600px) {
  .front-page-navbar {
    .v-toolbar {
      max-inline-size: calc(100% - 32px);
    }
  }
}

.front-page-navbar {
  .v-toolbar__content {
    padding-inline: 2rem !important;
  }

  .v-toolbar {
    inset-inline: 0 !important;
    margin-inline: auto !important;
  }
}

#navigation-drawer-close-btn {
  position: absolute;
  cursor: pointer;
  inset-block-start: 0.5rem;
  inset-inline-end: 1rem;
}

@media (max-width: 600px) {
  .front-page-navbar {
    .v-toolbar__content {
      padding-inline: 0.75rem !important;
    }
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .front-page-navbar {
    .v-toolbar__content {
      padding-inline: 1rem !important;
    }
  }
}
</style>
