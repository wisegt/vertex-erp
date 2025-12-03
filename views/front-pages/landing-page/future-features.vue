<script setup lang="ts">
import sectionTitleIcon from '@images/pages/section-title-icon.png'

const futureModules = [
  {
    title: 'Inteligencia Artificial',
    desc: 'Asistente conversacional que permite consultar datos, generar análisis y hasta registrar facturas desde un chat en lenguaje natural.',
    icon: 'ri-robot-2-line',
    color: 'primary',
    badge: 'Próximamente',
  },
  {
    title: 'Transporte y Entregas',
    desc: 'Gestión de rutas optimizadas, asignación de cargas, app móvil para pilotos con GPS y firma digital de entregas.',
    icon: 'ri-truck-line',
    color: 'success',
    badge: 'En desarrollo',
  },
  {
    title: 'Logística Avanzada',
    desc: 'Control de ubicaciones en bodega, picking optimizado, gestión de lotes y fechas de vencimiento (FIFO/FEFO).',
    icon: 'ri-inbox-2-line',
    color: 'warning',
    badge: 'En desarrollo',
  },
  {
    title: 'CRM Ventas',
    desc: 'Pipeline de oportunidades, seguimiento de clientes, automatización de seguimientos y análisis de rentabilidad.',
    icon: 'ri-user-heart-line',
    color: 'info',
    badge: 'Próximamente',
  },
  {
    title: 'Activos Fijos',
    desc: 'Control de activos depreciables, cálculo automático de depreciación según métodos guatemaltecos y mantenimiento preventivo.',
    icon: 'ri-building-4-line',
    color: 'error',
    badge: 'Próximamente',
  },
  {
    title: 'Producción',
    desc: 'Fórmulas de productos (BOM), órdenes de producción, costeo automático y control de calidad en proceso.',
    icon: 'ri-tools-line',
    color: 'secondary',
    badge: 'Próximamente',
  },
]
</script>

<template>
  <div :style="{ 'background-color': 'rgb(var(--v-theme-surface))' }">
    <VContainer id="roadmap">
      <div class="future-features py-16">
        <div class="headers d-flex justify-center flex-column align-center mb-10">
          <div class="d-flex gap-x-3 mb-6">
            <img
              :src="sectionTitleIcon"
              alt="section title icon"
              height="24"
              width="25"
            >
            <div
              class="text-body-1 text-high-emphasis font-weight-medium"
              style="letter-spacing: 0.15px !important;"
            >
              PRÓXIMAMENTE
            </div>
          </div>

          <div class="mb-2 text-center">
            <span
              class="text-h4 d-inline-block font-weight-bold"
              style="line-height: 2rem;"
            >
              El futuro de
            </span> <span class="text-h5 d-inline-block">VERTEX ERP</span>
          </div>

          <p
            class="text-body-1 font-weight-medium text-center"
            style="letter-spacing: 0.15px !important;"
          >
            Estamos desarrollando nuevos módulos para llevarte a otro nivel de productividad.
          </p>
        </div>

        <VRow>
          <VCol
            v-for="(module, index) in futureModules"
            :key="index"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard
              variant="outlined"
              class="h-100 future-card"
            >
              <VCardText class="d-flex flex-column align-center text-center pa-6">
                <VBadge
                  :content="module.badge"
                  color="primary"
                  location="top end"
                  offset-x="-10"
                  offset-y="10"
                >
                  <VAvatar
                    variant="tonal"
                    size="72"
                    :color="module.color"
                    class="mb-4"
                  >
                    <VIcon
                      :icon="module.icon"
                      size="36"
                    />
                  </VAvatar>
                </VBadge>

                <h5 class="text-h6 mb-2">
                  {{ module.title }}
                </h5>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ module.desc }}
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <div class="text-center mt-10">
          <p class="text-body-1 text-medium-emphasis mb-4">
            ¿Tienes una idea para un nuevo módulo? Nos encantaría escucharte.
          </p>
          <VBtn
            variant="outlined"
            color="primary"
            :to="{ name: 'front-pages-landing-page', hash: '#contact-us' }"
          >
            <VIcon icon="ri-lightbulb-line" class="me-2" />
            Sugerir funcionalidad
          </VBtn>
        </div>
      </div>
    </VContainer>
  </div>
</template>

<style lang="scss" scoped>
.future-features {
  margin-block: 2rem;
}

.future-card {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.15);
  }
}
</style>
