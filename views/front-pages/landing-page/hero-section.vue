<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { useTheme } from 'vuetify'
import { useGenerateImageVariant } from '@/@core/composable/useGenerateImageVariant'
import darkBg from '@images/front-pages/backgrounds/hero-bg-dark.png'
import lightBg from '@images/front-pages/backgrounds/hero-bg.png'
import heroDashboardImgDark from '@images/front-pages/landing-page/hero-dashboard-dark.png'
import heroDashboardImgLight from '@images/front-pages/landing-page/hero-dashboard-light.png'

import heroElementsImgDark from '@images/front-pages/landing-page/hero-elements-dark.png'
import heroElementsImgLight from '@images/front-pages/landing-page/hero-elements-light.png'

const theme = useTheme()
const isDark = ref(theme.name)

const heroBgUrl = computed(() => {
  if (isDark.value === 'dark')
    return darkBg
  else
    return lightBg
})

const heroElementsImg = useGenerateImageVariant(heroElementsImgLight, heroElementsImgDark)
const heroDashboardImg = useGenerateImageVariant(heroDashboardImgLight, heroDashboardImgDark)

const { x, y } = useMouse({ touch: false })

const transformDashboardImg = ref('translate(0px, 0px)')
const transformHeroElements = ref('translate(0px, 0px)')

const calculatePosition = (speed: number) => {
  const positionX = (window.innerWidth - (x.value * speed)) / 100
  const positionY = Math.max((window.innerHeight - (y.value * speed)) / 100, -40)

  return `translate(${positionX}px, ${positionY}px)`
}

onMounted(() => {
  watchEffect(() => {
    transformDashboardImg.value = calculatePosition(2.5)
    transformHeroElements.value = calculatePosition(5)
  })
})
</script>

<template>
  <section
    id="home"
    :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }"
  >
    <div
      id="landingHero"
      class="landing-hero"
      :style="{ backgroundImage: `url(${heroBgUrl})` }"
    >
      <VContainer>
        <div class="text-center px-6">
          <div class="mb-4">
            <div class="landing-page-title">
              El ERP que impulsa
            </div>
            <div class="landing-page-title">
              tu negocio en Guatemala
            </div>
          </div>
          <div class="text-body-1 font-weight-medium text-high-emphasis pb-8">
            <p class="mb-0">
              Facturación electrónica FEL, contabilidad, inventario, bancos y más.
            </p>
            <p class="mb-0">
              Todo integrado en una plataforma moderna y fácil de usar.
            </p>
          </div>
          <div class="d-flex gap-4 justify-center flex-wrap">
            <VBtn
              :to="{ name: 'front-pages-checkout' }"
              size="large"
              color="primary"
            >
              <VIcon icon="ri-rocket-line" class="me-2" />
              Comenzar Gratis
            </VBtn>
            <VBtn
              href="#contact-us"
              size="large"
              class="neon-btn"
            >
              <VIcon icon="ri-video-chat-line" class="me-2" />
              Solicitar Demo
            </VBtn>
          </div>
        </div>

        <div class="position-relative hero-animation-img">
          <div class="hero-dashboard-img text-center">
            <NuxtLink
              to="/"
              target="_blank"
            >
              <img
                :src="heroDashboardImg"
                data-allow-mismatch
                class="mx-auto cursor-pointer"
                :style="{ transform: transformDashboardImg }"
              >
            </NuxtLink>
          </div>

          <div class="hero-elements-img">
            <NuxtLink
              to="/"
              target="_blank"
            >
              <img
                class="cursor-pointer"
                data-allow-mismatch
                :src="heroElementsImg"
                :style="{ transform: transformHeroElements }"
                target="_blank"
              >
            </NuxtLink>
          </div>
        </div>
      </VContainer>
    </div>
  </section>
</template>

<style lang="scss" scoped>
section {
  display: block;
  padding-block-end: 6.25rem;
}

.landing-hero {
  background-position: bottom;
  background-repeat: no-repeat;
  background-size: cover;
  padding-block-start: 9rem;
}

.hero-dashboard-img {
  img {
    inline-size: 85%;
  }
}

.hero-elements-img {
  position: absolute;
  inline-size: 100%;
  inset: 0;
  margin-block: 15%;
  margin-inline: auto;

  img {
    inline-size: 100%;
  }
}

.container {
  margin-inline: auto;
  max-inline-size: 85vw;
}

.feature-cards {
  margin-block-start: 6.25rem;
}

.landing-page-title {
  color: rgb(var(--v-theme-primary));
  font-size: 2.375rem;
  font-weight: 800;
  line-height: 2.75rem;
}

.hero-animation-img {
  inset-block-start: 0;
  margin-block-end: -16rem;
}

@media (max-width: 960px) {
  .hero-animation-img {
    inset-block-start: 2rem;
    margin-block-end: -8rem;
  }
}

@media (max-width: 600px) {
  .hero-animation-img {
    inset-block-start: 1rem;
    margin-block-end: -2rem;
  }
}

// Botón neón
.neon-btn {
  position: relative;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%) !important;
  color: white !important;
  font-weight: 600;
  border: none !important;
  border-radius: 50px;
  box-shadow: 
    0 0 20px rgba(247, 147, 30, 0.5),
    0 0 40px rgba(247, 147, 30, 0.3),
    0 0 60px rgba(247, 147, 30, 0.1);
  transition: all 0.3s ease;
  animation: neon-pulse 2s ease-in-out infinite;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 0 25px rgba(247, 147, 30, 0.7),
      0 0 50px rgba(247, 147, 30, 0.5),
      0 0 75px rgba(247, 147, 30, 0.3);
  }
}

@keyframes neon-pulse {
  0%, 100% {
    box-shadow: 
      0 0 20px rgba(247, 147, 30, 0.5),
      0 0 40px rgba(247, 147, 30, 0.3),
      0 0 60px rgba(247, 147, 30, 0.1);
  }
  50% {
    box-shadow: 
      0 0 25px rgba(247, 147, 30, 0.6),
      0 0 50px rgba(247, 147, 30, 0.4),
      0 0 75px rgba(247, 147, 30, 0.2);
  }
}
</style>
