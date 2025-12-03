<script setup lang="ts">
import ConnectImg from '@images/front-pages/landing-page/lets-contact.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'

const name = ref('')
const email = ref('')
const phone = ref('')
const company = ref('')
const message = ref('')
const isLoading = ref(false)

const handleSubmit = async () => {
  isLoading.value = true
  // TODO: Implementar envío del formulario
  setTimeout(() => {
    isLoading.value = false
    // Reset form
    name.value = ''
    email.value = ''
    phone.value = ''
    company.value = ''
    message.value = ''
  }, 1500)
}
</script>

<template>
  <VContainer id="contact-us">
    <div class="contact-us-section">
      <div class="headers d-flex justify-center flex-column align-center pb-15">
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
            CONTÁCTANOS
          </div>
        </div>

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Hablemos de
          </span> <span class="text-h5 d-inline-block">tu proyecto</span>
        </div>

        <p class="text-body-1 font-weight-medium text-center mb-0">
          ¿Tienes preguntas o necesitas una demostración personalizada? Escríbenos.
        </p>
      </div>

      <div class="mb-15">
        <VRow class="match-height">
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VCard
              flat
              elevation="0"
              color="primary"
              theme="dark"
            >
              <VCardText class="pa-8">
                <h6 class="text-h6 mb-1">
                  Solicita una demostración
                </h6>

                <h4 class="text-h4">
                  Te mostramos cómo VERTEX puede transformar tu negocio.
                </h4>

                <VImg
                  :src="ConnectImg"
                  class="my-5"
                />

                <div class="text-body-1 mb-6">
                  Nuestro equipo te guiará por todas las funcionalidades y responderá tus preguntas en una sesión personalizada.
                </div>

                <VDivider class="mb-6" />

                <div class="d-flex flex-column gap-4">
                  <div class="d-flex align-center gap-3">
                    <VIcon icon="ri-map-pin-line" size="20" />
                    <span>Ciudad de Guatemala, Guatemala</span>
                  </div>
                  <div class="d-flex align-center gap-3">
                    <VIcon icon="ri-phone-line" size="20" />
                    <span>+502 2222-3333</span>
                  </div>
                  <div class="d-flex align-center gap-3">
                    <VIcon icon="ri-mail-line" size="20" />
                    <span>info@vertexerp.app</span>
                  </div>
                </div>
              </VCardText>
            </VCard>
          </VCol>

          <VCol
            cols="12"
            md="8"
            sm="6"
          >
            <VCard
              flat
              elevation="0"
            >
              <VCardText>
                <div class="text-h5 mb-5">
                  Envíanos un mensaje
                </div>
                <VForm @submit.prevent="handleSubmit">
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="name"
                        placeholder="Juan Pérez"
                        label="Nombre completo"
                        :rules="[v => !!v || 'El nombre es requerido']"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="email"
                        placeholder="juan@empresa.com"
                        label="Correo electrónico"
                        type="email"
                        :rules="[v => !!v || 'El email es requerido']"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="phone"
                        placeholder="+502 5555-5555"
                        label="Teléfono"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="company"
                        placeholder="Nombre de tu empresa"
                        label="Empresa"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VTextarea
                        v-model="message"
                        placeholder="Cuéntanos sobre tu negocio y qué necesitas..."
                        label="Mensaje"
                        rows="4"
                      />
                    </VCol>

                    <VCol>
                      <VBtn
                        type="submit"
                        :loading="isLoading"
                      >
                        Enviar mensaje
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.contact-us-section {
  margin-block: 5.25rem;
}
</style>
