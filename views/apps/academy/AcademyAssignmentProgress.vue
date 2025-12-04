<script setup lang="ts">
const assignmentData = [
  { title: 'Diseño de Experiencia de Usuario', tasks: 120, progress: 72, color: 'primary' },
  { title: 'Fundamentos básicos', tasks: 32, progress: 48, color: 'success' },
  { title: 'Componentes de React Native', tasks: 182, progress: 15, color: 'error' },
  { title: 'Teoría básica de música', tasks: 56, progress: 24, color: 'info' },
]
</script>

<template>
  <VCard>
    <VCardItem title="Progreso de tareas">
      <template #append>
        <MoreBtn />
      </template>
    </VCardItem>
    <VCardText>
      <VList class="card-list">
        <VListItem
          v-for="assignment in assignmentData"
          :key="assignment.title"
        >
          <template #prepend>
            <VProgressCircular
              v-model="assignment.progress"
              :size="54"
              class="me-4"
              :color="assignment.color"
            >
              <h6 class="text-h6">
                {{ assignment.progress }}%
              </h6>
            </VProgressCircular>
          </template>
          <template #title>
            <div class="text-h6 me-4 mb-2 text-truncate">
              {{ assignment.title }}
            </div>
          </template>

          <VListItemSubtitle>{{ assignment.tasks }} Tareas</VListItemSubtitle>
          <template #append>
            <VBtn
              variant="tonal"
              color="secondary"
              class="rounded"
              size="34"
            >
              <VIcon
                icon="ri-arrow-right-s-line"
                size="20"
                class="flip-in-rtl"
              />
            </VBtn>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.5rem;
}
</style>
