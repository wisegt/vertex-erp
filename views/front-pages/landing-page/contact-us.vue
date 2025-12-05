<script setup lang="ts">
import ConnectImg from '@images/front-pages/landing-page/lets-contact.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'

// Lista de países con código de teléfono y bandera (Centroamérica + principales)
const countries = [
  { code: 'GT', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', flag: '🇵🇦' },
  { code: 'MX', name: 'México', dialCode: '+52', flag: '🇲🇽' },
  { code: 'US', name: 'Estados Unidos', dialCode: '+1', flag: '🇺🇸' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Perú', dialCode: '+51', flag: '🇵🇪' },
  { code: 'CL', name: 'Chile', dialCode: '+56', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', flag: '🇦🇷' },
  { code: 'ES', name: 'España', dialCode: '+34', flag: '🇪🇸' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', flag: '🇧🇷' },
]

const name = ref('')
const email = ref('')
const phone = ref('')
const company = ref('')
const message = ref('')
const isLoading = ref(false)
const selectedCountryCode = ref('GT') // Guatemala por defecto

// País seleccionado
const selectedCountry = computed(() => {
  return countries.find(c => c.code === selectedCountryCode.value) || countries[0]
})

// Detectar país automáticamente al montar
onMounted(async () => {
  try {
    // Usar API de geolocalización por IP
    const response = await $fetch('https://ipapi.co/json/', { timeout: 3000 }).catch(() => null)
    if (response && (response as any).country_code) {
      const countryCode = (response as any).country_code
      const found = countries.find(c => c.code === countryCode)
      if (found) {
        selectedCountryCode.value = countryCode
      }
    }
  }
  catch {
    // Si falla, mantener Guatemala como default (ya está configurado)
    console.log('Usando país por defecto: Guatemala')
  }
})

// Formatear teléfono (solo números)
const formatPhone = (event: Event) => {
  const input = event.target as HTMLInputElement
  const cleaned = input.value.replace(/[^0-9]/g, '')
  phone.value = cleaned
}

const handleSubmit = async () => {
  isLoading.value = true
  
  // Construir número completo con código de país
  const fullPhone = phone.value ? `${selectedCountry.value.dialCode} ${phone.value}` : ''
  
  // TODO: Implementar envío del formulario
  console.log('Enviando:', {
    name: name.value,
    email: email.value,
    phone: fullPhone,
    company: company.value,
    message: message.value,
  })
  
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
                        autocomplete="name"
                        :rules="[v => !!v || 'El nombre es requerido']"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <!-- Email con inputmode para teclado optimizado -->
                      <VTextField
                        v-model="email"
                        placeholder="juan@empresa.com"
                        label="Correo electrónico"
                        type="email"
                        inputmode="email"
                        autocomplete="email"
                        :rules="[v => !!v || 'El email es requerido']"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <!-- Teléfono con selector de país y bandera -->
                      <VTextField
                        v-model="phone"
                        placeholder="5555 5555"
                        label="Teléfono"
                        type="text"
                        inputmode="tel"
                        pattern="[0-9]*"
                        autocomplete="tel-national"
                        @input="formatPhone"
                      >
                        <template #prepend-inner>
                          <VMenu>
                            <template #activator="{ props }">
                              <VBtn
                                v-bind="props"
                                variant="text"
                                size="small"
                                class="me-1 country-selector-btn"
                              >
                                <span class="country-flag">{{ selectedCountry.flag }}</span>
                                <span class="dial-code">{{ selectedCountry.dialCode }}</span>
                                <VIcon
                                  icon="ri-arrow-down-s-line"
                                  size="16"
                                  class="ms-1"
                                />
                              </VBtn>
                            </template>
                            <VList density="compact" max-height="300">
                              <VListItem
                                v-for="country in countries"
                                :key="country.code"
                                :active="selectedCountryCode === country.code"
                                @click="selectedCountryCode = country.code"
                              >
                                <template #prepend>
                                  <span class="me-3 text-h6">{{ country.flag }}</span>
                                </template>
                                <VListItemTitle>
                                  {{ country.name }}
                                  <span class="text-medium-emphasis">({{ country.dialCode }})</span>
                                </VListItemTitle>
                              </VListItem>
                            </VList>
                          </VMenu>
                        </template>
                      </VTextField>
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="company"
                        placeholder="Nombre de tu empresa"
                        label="Empresa"
                        autocomplete="organization"
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

.country-selector-btn {
  min-inline-size: auto;
  padding-inline: 8px !important;
  
  .country-flag {
    font-size: 1.25rem;
    line-height: 1;
    margin-inline-end: 4px;
  }
  
  .dial-code {
    font-size: 0.875rem;
    font-weight: 500;
  }
}
</style>
