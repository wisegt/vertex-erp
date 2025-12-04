<script setup lang="ts">
import AcademyMyCourses from '@/views/apps/academy/AcademyMyCourses.vue'
import academyCourseIllustration1 from '@images/pages/academy-course-illustration1.png'
import academyCourseIllustration2Dark from '@images/pages/academy-course-illustration2-dark.png'
import academyCourseIllustration2Light from '@images/pages/academy-course-illustration2-light.png'
import boyAcademyIllustration from '@images/pages/boy-academy-illustration.png'
import girlAcademyIllustration from '@images/pages/girl-academy-illustration.png'
import guitarCoursePoster from '@images/pages/guitar-course.png'
import singingCoursePoster from '@images/pages/singing-course.png'

const academyCourseIllustration2 = useGenerateImageVariant(academyCourseIllustration2Light, academyCourseIllustration2Dark)

const searchQuery = ref('')
</script>

<template>
  <div>
    <VCard class="mb-6">
      <VCardText class="py-12 position-relative">
        <div
          class="d-flex flex-column gap-y-4 mx-auto"
          :class="$vuetify.display.mdAndUp ? 'w-50' : 'w-100'"
        >
          <h4
            class="text-h4 text-center text-wrap mx-auto"
            :class="$vuetify.display.mdAndUp ? 'w-75' : 'w-100'"
          >
            Educación, talentos y oportunidades
            profesionales. <span class="text-primary"> Todo en un solo lugar.</span>
          </h4>
          <p class="text-center text-wrap text-body-1 mx-auto mb-0">
            Desarrolla tus habilidades con los cursos en línea y certificaciones más confiables en marketing, tecnología de la información, programación y ciencia de datos.
          </p>
          <div class="d-flex justify-center align-center gap-x-4">
            <VTextField
              v-model="searchQuery"
              density="compact"
              placeholder="Encuentra tu curso"
              style="max-inline-size: 400px;"
            />
            <VBtn
              color="primary"
              icon="ri-search-line"
              class="rounded"
            />
          </div>
        </div>
        <img
          :src="academyCourseIllustration1"
          class="illustration1 d-none d-md-block flip-in-rtl"
          height="180"
        >
        <img
          :src="academyCourseIllustration2"
          class="illustration2 d-none d-md-block"
          height="100"
        >
      </VCardText>
    </VCard>

    <AcademyMyCourses :search-query="searchQuery" />

    <div class="mb-6">
      <VRow>
        <VCol
          cols="12"
          md="6"
        >
          <VCard
            flat
            color="rgba(var(--v-theme-primary), 0.08)"
          >
            <VCardText>
              <div class="d-flex flex-column-reverse flex-sm-row gap-4 justify-space-between">
                <div class="text-center text-sm-start">
                  <h5 class="text-h5 text-primary mb-1">
                    Obtén un certificado
                  </h5>
                  <p class="text-body-1 text-high-emphasis mb-6">
                    Obtén el programa de certificación profesional adecuado para ti.
                  </p>
                  <VBtn>Ver programas</VBtn>
                </div>

                <div class="text-center">
                  <img :src="boyAcademyIllustration">
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol
          cols="12"
          md="6"
        >
          <VCard
            flat
            color="rgba(var(--v-theme-error), 0.08)"
          >
            <VCardText>
              <div class="d-flex flex-column-reverse flex-sm-row gap-4 justify-space-between">
                <div class="text-center text-sm-start">
                  <h5 class="text-h5 text-error mb-1">
                    Cursos mejor valorados
                  </h5>
                  <p class="text-body-1 text-high-emphasis text-wrap mb-6">
                    Inscríbete ahora en los cursos más populares y mejor valorados.
                  </p>
                  <VBtn color="error">
                    Ver cursos
                  </VBtn>
                </div>

                <div class="text-center">
                  <img :src="girlAcademyIllustration">
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>

    <VCard>
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
          >
            <div class="d-flex flex-column align-center gap-y-4 h-100 justify-center">
              <VAvatar
                variant="tonal"
                size="52"
                rounded
                color="primary"
              >
                <VIcon
                  icon="ri-gift-line"
                  size="36"
                />
              </VAvatar>
              <h4 class="text-h4">
                Cursos gratuitos de hoy
              </h4>
              <p class="text-body-1 text-center mb-0">
                Ofrecemos 284 cursos en línea gratuitos de tutores y empresas líderes para ayudarte a iniciar o avanzar en tus habilidades profesionales. ¡Aprende en línea gratis y rápido hoy!
              </p>
              <VBtn>Obtener cursos Premium</VBtn>
            </div>
          </VCol>
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VCard
              flat
              border
            >
              <div class="pa-2">
                <VVideo
                  :image="singingCoursePoster"
                  src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4"
                  pills
                  density="compact"
                  :height="$vuetify.display.mdAndUp ? 200 : 150"
                  elevation="0"
                  rounded
                />
              </div>
              <VCardText class="pt-3">
                <h5 class="text-h5 mb-2">
                  Tu primera lección de canto
                </h5>
                <p class="text-body-1 mb-0">
                  De la misma manera que cualquier otro dominio artístico, el canto se presta perfectamente para el autoaprendizaje.
                </p>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VCard
              flat
              border
            >
              <div class="pa-2">
                <VVideo
                  :image="guitarCoursePoster"
                  src="https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4"
                  pills
                  density="compact"
                  :height="$vuetify.display.mdAndUp ? 200 : 150"
                  elevation="0"
                  rounded
                />
              </div>
              <VCardText class="pt-3">
                <h5 class="text-h5 mb-2">
                  Guitarra para principiantes
                </h5>
                <p class="text-body-1 mb-0">
                  La guitarra acústica Fender es la mejor opción para principiantes y profesionales.
                </p>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </div>
</template>

<style lang="scss">
.illustration1 {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 0;
}

.illustration2 {
  position: absolute;
  inset-block-start: 2rem;
  inset-inline-start: 2.5rem;
}
</style>
