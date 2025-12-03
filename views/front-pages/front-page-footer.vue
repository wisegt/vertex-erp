<script setup lang="ts">
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

const productLinks = [
  { name: 'Facturación FEL', hash: '#features' },
  { name: 'Contabilidad', hash: '#features' },
  { name: 'Inventario', hash: '#features' },
  { name: 'Bancos', hash: '#features' },
]

const companyLinks = [
  { name: 'Precios', hash: '#pricing-plan' },
  { name: 'Preguntas Frecuentes', hash: '#faq' },
  { name: 'Contacto', hash: '#contact-us' },
]

const legalLinks = [
  { name: 'Términos de Servicio', to: '#' },
  { name: 'Política de Privacidad', to: '#' },
]

const email = ref('')
const isSubscribing = ref(false)

const handleSubscribe = () => {
  if (!email.value) return
  isSubscribing.value = true
  // TODO: Implementar suscripción
  setTimeout(() => {
    isSubscribing.value = false
    email.value = ''
  }, 1500)
}
</script>

<template>
  <div class="footer">
    <VSheet
      class="footer-top pt-15"
      theme="dark"
    >
      <VContainer>
        <VRow>
          <!-- Logo y descripción -->
          <VCol
            cols="12"
            md="4"
          >
            <div class="mb-4 footer-form">
              <div class="d-flex align-center gap-x-3 mb-6">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <div class="footer-title">
                  VERTEX ERP
                </div>
              </div>
              <div class="text-body-1 footer-text mb-6">
                Sistema ERP en la nube para Guatemala. Facturación electrónica FEL, contabilidad, inventario y más. Todo integrado en una plataforma moderna.
              </div>
              <VForm
                class="subscribe-form d-flex align-center gap-4"
                @submit.prevent="handleSubscribe"
              >
                <VTextField
                  v-model="email"
                  label="Recibe novedades"
                  placeholder="tu@email.com"
                  theme="dark"
                  density="compact"
                  class="footer-text"
                  type="email"
                />
                <VBtn
                  type="submit"
                  :loading="isSubscribing"
                >
                  Suscribir
                </VBtn>
              </VForm>
            </div>
          </VCol>

          <!-- Módulos -->
          <VCol
            md="2"
            sm="4"
            cols="6"
          >
            <div class="footer-links">
              <div class="footer-heading mb-6">
                Módulos
              </div>
              <ul style="list-style: none;">
                <li
                  v-for="(item, index) in productLinks"
                  :key="index"
                  class="mb-4"
                >
                  <NuxtLink
                    class="footer-text text-no-wrap"
                    :to="{ name: 'index', hash: item.hash }"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- Empresa -->
          <VCol
            md="2"
            sm="4"
            cols="6"
          >
            <div class="footer-links">
              <div class="footer-heading mb-6">
                Empresa
              </div>
              <ul style="list-style: none;">
                <li
                  v-for="(item, index) in companyLinks"
                  :key="index"
                  class="mb-4"
                >
                  <NuxtLink
                    class="footer-text text-no-wrap"
                    :to="{ name: 'index', hash: item.hash }"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- Legal y contacto -->
          <VCol
            cols="12"
            md="4"
            sm="4"
          >
            <div>
              <div class="footer-heading mb-6">
                Contacto
              </div>

              <div class="d-flex flex-column gap-4 mb-6">
                <div class="d-flex align-center gap-3 footer-text">
                  <VIcon icon="ri-map-pin-line" size="20" />
                  <span>Ciudad de Guatemala, Guatemala</span>
                </div>
                <div class="d-flex align-center gap-3 footer-text">
                  <VIcon icon="ri-phone-line" size="20" />
                  <span>+502 2222-3333</span>
                </div>
                <div class="d-flex align-center gap-3 footer-text">
                  <VIcon icon="ri-mail-line" size="20" />
                  <span>info@vertexerp.app</span>
                </div>
              </div>

              <div class="footer-heading mb-4">
                Legal
              </div>
              <ul style="list-style: none;">
                <li
                  v-for="(item, index) in legalLinks"
                  :key="index"
                  class="mb-2"
                >
                  <NuxtLink
                    class="footer-text text-no-wrap"
                    :to="item.to"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>

    <div class="footer-line w-100">
      <VContainer>
        <div class="d-flex justify-space-between flex-wrap gap-y-4 py-4">
          <span class="d-flex align-center">
            &copy; {{ new Date().getFullYear() }} VERTEX ERP.
            Hecho con ❤️ por
            <a
              href="https://waisconsultores.io"
              target="_blank"
              rel="noopener noreferrer"
              class="ms-1 font-weight-medium"
              style="color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));"
            >
              Wais Consultores
            </a>
          </span>
          <div class="d-flex gap-x-2">
            <IconBtn
              href="https://www.facebook.com/"
              size="small"
              target="_blank"
              color="#fff"
              rel="noopener noreferrer"
            >
              <VIcon icon="ri-facebook-fill" />
            </IconBtn>
            <IconBtn
              href="https://www.instagram.com/"
              size="small"
              target="_blank"
              color="#fff"
              rel="noopener noreferrer"
            >
              <VIcon icon="ri-instagram-line" />
            </IconBtn>
            <IconBtn
              href="https://www.linkedin.com/"
              size="small"
              target="_blank"
              color="#fff"
              rel="noopener noreferrer"
            >
              <VIcon icon="ri-linkedin-fill" />
            </IconBtn>
            <IconBtn
              href="https://wa.me/50222223333"
              size="small"
              target="_blank"
              color="#fff"
              rel="noopener noreferrer"
            >
              <VIcon icon="ri-whatsapp-line" />
            </IconBtn>
          </div>
        </div>
      </VContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-top {
  background: url("@images/front-pages/backgrounds/footer-bg.png") lightgray 50% / cover no-repeat;
}

.footer-heading {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-weight: 500;
}

.footer-text {
  color: rgba(255, 255, 255, var(--v-medium-emphasis-opacity));
}

.footer-title {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.15px;
  line-height: 1.5rem;
}

.footer-line {
  background: #211b2c;
  color: rgba(255, 255, 255, var(--v-medium-emphasis-opacity));
  font-size: 13px;
  line-height: 20px;
}

.footer {
  color: rgba(255, 255, 255, 70%);
}

.footer-links {
  .footer-text:hover {
    color: #fff;
  }
}
</style>

<style lang="scss">
.footer {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}

.footer-form {
  @media (min-width: 1280px) {
    max-inline-size: 400px;
  }
}
</style>
