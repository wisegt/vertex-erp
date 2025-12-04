<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import Banner from '@/views/front-pages/landing-page/banner.vue'
import ContactUs from '@/views/front-pages/landing-page/contact-us.vue'
import FaqSection from '@/views/front-pages/landing-page/faq-section.vue'
import Features from '@/views/front-pages/landing-page/features.vue'
import FutureFeatures from '@/views/front-pages/landing-page/future-features.vue'
import HeroSection from '@/views/front-pages/landing-page/hero-section.vue'
import PricingPlans from '@/views/front-pages/landing-page/pricing-plans.vue'
import ProductStats from '@/views/front-pages/landing-page/product-stats.vue'
import { useConfigStore } from '@core/stores/config'

const store = useConfigStore()

store.skin = 'default'
definePageMeta({
  layout: 'blank',
  public: true,
})

const activeSectionId = ref()

const refHome = ref()
const refFeatures = ref()
const refRoadmap = ref()
const refPricing = ref()
const refFaq = ref()
const refContact = ref()

useIntersectionObserver(
  [refHome, refFeatures, refRoadmap, refPricing, refFaq, refContact],
  ([{ isIntersecting, target }]) => {
    if (isIntersecting)
      activeSectionId.value = target.id
  },
  {
    threshold: 0.25,
  },
)
</script>

<template>
  <div class="landing-page-wrapper">
    <Navbar :active-id="activeSectionId" />

    <!-- Hero Section  -->
    <HeroSection ref="refHome" />

    <!-- Módulos / Features  -->
    <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
      <Features ref="refFeatures" />
    </div>

    <!-- Módulos Futuros -->
    <FutureFeatures ref="refRoadmap" />

    <!-- Planes y Precios -->
    <PricingPlans ref="refPricing" />

    <!-- Estadísticas -->
    <ProductStats />

    <!-- FAQ Section -->
    <FaqSection ref="refFaq" />

    <!-- Banner CTA  -->
    <Banner />

    <!-- Contact Us  -->
    <ContactUs ref="refContact" />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<style lang="scss">
@media (max-width: 960px) and (min-width: 600px) {
  .landing-page-wrapper {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
