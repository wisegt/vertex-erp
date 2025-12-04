<script setup lang="ts">
const coursesData = [
  { title: 'Curso básico de diseño de videografía', views: '1.2k', icon: 'ri-video-download-line', color: 'primary' },
  { title: 'Curso básico de desarrollo Front-end', views: '834', icon: 'ri-code-view', color: 'info' },
  { title: 'Fundamentos básicos de fotografía', views: '3.7k', icon: 'ri-image-2-line', color: 'success' },
  { title: 'Diseño visual avanzado base Dribble', views: '2.5k', icon: 'ri-palette-line', color: 'warning' },
  { title: 'Tu primera lección de canto', views: '948', icon: 'ri-music-2-line', color: 'error' },
]
</script>

<template>
  <VCard>
    <VCardItem title="Mejores cursos">
      <template #append>
        <MoreBtn />
      </template>
    </VCardItem>

    <VCardText>
      <VList class="card-list">
        <VListItem
          v-for="(course, index) in coursesData"
          :key="index"
        >
          <template #prepend>
            <VAvatar
              rounded
              variant="tonal"
              :color="course.color"
            >
              <VIcon
                :icon="course.icon"
                size="24"
              />
            </VAvatar>
          </template>

          <template #title>
            <div class="text-h6 clamp-text text-wrap me-4">
              {{ course.title }}
            </div>
          </template>

          <template #append>
            <VChip
              variant="tonal"
              color="secondary"
              size="small"
            >
              {{ course.views }} Vistas
            </VChip>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
