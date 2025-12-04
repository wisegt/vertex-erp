<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import pdf from '@images/icons/project-icons/pdf.png'
</script>

<template>
  <VCard title="Línea de tiempo de actividad">
    <VCardText>
      <VTimeline
        side="end"
        align="start"
        line-inset="8"
        truncate-line="start"
        density="compact"
      >
        <VTimelineItem
          dot-color="primary"
          size="x-small"
        >
          <!-- 👉 Header -->
          <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-3">
            <div class="app-timeline-title align-self-start">
              12 facturas han sido pagadas
            </div>
            <div class="app-timeline-meta">
              hace 12 min
            </div>
          </div>

          <p class="app-timeline-text mb-2">
            Las facturas han sido pagadas a la empresa.
          </p>

          <div class="d-inline-flex align-center timeline-chip mb-2">
            <img
              :src="pdf"
              height="20"
              class="me-3"
              alt="img"
            >
            <h6 class="text-h6 text-medium-emphasis">
              invoice.pdf
            </h6>
          </div>
        </VTimelineItem>

        <VTimelineItem
          dot-color="success"
          size="x-small"
        >
          <!-- 👉 Header -->
          <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-3">
            <div class="app-timeline-title align-self-start">
              Reunión con cliente
            </div>
            <div class="app-timeline-meta">
              hace 45 min
            </div>
          </div>

          <p class="app-timeline-text mb-2">
            Reunión de proyecto con john @10:15am
          </p>

          <div class="d-flex align-center mb-2">
            <VAvatar
              size="32"
              :image="avatar1"
              class="me-3"
            />

            <div>
              <div class="text-body-2 font-weight-medium">
                Lester McCarthy (Cliente)
              </div>
              <div class="text-body-2">
                CEO de ThemeSelection
              </div>
            </div>
          </div>
        </VTimelineItem>

        <VTimelineItem
          dot-color="info"
          size="x-small"
        >
          <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-3">
            <div class="app-timeline-title align-self-start">
              Crear un nuevo proyecto para cliente
            </div>
            <div class="app-timeline-meta">
              hace 2 días
            </div>
          </div>

          <p class="mb-0 app-timeline-text">
            6 miembros del equipo en un proyecto
          </p>
        </VTimelineItem>
      </VTimeline>
    </VCardText>
  </VCard>
</template>
