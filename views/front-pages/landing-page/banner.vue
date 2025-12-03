<script setup lang="ts">
import ctaDashborad from '@images/front-pages/landing-page/cta-dashboard.png'
</script>

<template>
  <div class="landing-cta position-relative bg-surface">
    <VContainer>
      <div class="d-flex align-center justify-sm-space-between flex-column flex-md-row gap-y-4 pt-9">
        <div class="text-sm-start text-center py-8">
          <div class="banner-text pb-1">
            ¿Listo para modernizar tu empresa?
          </div>
          <div class="text-body-1 font-weight-medium mb-8">
            Prueba VERTEX gratis por 14 días. Sin tarjeta de crédito.
          </div>
          <div class="d-flex gap-4 flex-wrap justify-center justify-sm-start">
            <VBtn
              color="primary"
              size="large"
              :to="{ name: 'front-pages-checkout' }"
            >
              <VIcon icon="ri-rocket-line" class="me-2" />
              Comenzar Gratis
            </VBtn>
            <VBtn
              size="large"
              class="neon-btn"
              href="#contact-us"
            >
              <VIcon icon="ri-video-chat-line" class="me-2" />
              Solicitar Demo
            </VBtn>
          </div>
        </div>

        <VImg
          :src="ctaDashborad"
          :max-width="$vuetify.display.mdAndUp ? 600 : ''"
          max-height="250"
          width="auto"
          class="mb-n4"
        />
      </div>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.landing-cta {
  background-image: url("@images/front-pages/backgrounds/cta-bg.png");
  background-size: cover;
  margin-block: auto;
}

.banner-text{
  color: rgb(var(--v-theme-primary));
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 0.25px;
  line-height: 42px;
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
