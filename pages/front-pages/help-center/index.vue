<script setup lang="ts">
import Footer from '@/views/front-pages/front-page-footer.vue'
import Navbar from '@/views/front-pages/front-page-navbar.vue'
import { useConfigStore } from '@core/stores/config'

const store = useConfigStore()

store.skin = 'default'
definePageMeta({
  layout: 'blank',
  public: true,
})

const searchQuery = ref('')

const categories = [
  {
    icon: 'ri-rocket-line',
    title: 'Primeros Pasos',
    slug: 'primeros-pasos',
    articles: [
      { title: 'Cómo crear tu cuenta', slug: 'crear-cuenta' },
      { title: 'Configuración inicial del sistema', slug: 'configuracion-inicial' },
      { title: 'Agregar usuarios y roles', slug: 'usuarios-roles' },
      { title: 'Personalizar tu empresa', slug: 'personalizar-empresa' },
    ],
  },
  {
    icon: 'ri-file-text-line',
    title: 'Facturación FEL',
    slug: 'facturacion-fel',
    articles: [
      { title: 'Configurar certificador FEL', slug: 'configurar-fel' },
      { title: 'Emitir tu primera factura', slug: 'primera-factura' },
      { title: 'Notas de crédito y débito', slug: 'notas-credito-debito' },
      { title: 'Anulación de documentos', slug: 'anulacion-documentos' },
    ],
  },
  {
    icon: 'ri-calculator-line',
    title: 'Contabilidad',
    slug: 'contabilidad',
    articles: [
      { title: 'Catálogo de cuentas', slug: 'catalogo-cuentas' },
      { title: 'Registro de pólizas', slug: 'registro-polizas' },
      { title: 'Estados financieros', slug: 'estados-financieros' },
      { title: 'Cierre de período', slug: 'cierre-periodo' },
    ],
  },
  {
    icon: 'ri-archive-line',
    title: 'Inventario',
    slug: 'inventario',
    articles: [
      { title: 'Crear productos y servicios', slug: 'crear-productos' },
      { title: 'Gestión de bodegas', slug: 'gestion-bodegas' },
      { title: 'Ajustes de inventario', slug: 'ajustes-inventario' },
      { title: 'Kardex y costeo', slug: 'kardex-costeo' },
    ],
  },
  {
    icon: 'ri-store-2-line',
    title: 'Punto de Venta',
    slug: 'punto-de-venta',
    articles: [
      { title: 'Configurar caja registradora', slug: 'configurar-caja' },
      { title: 'Proceso de venta rápida', slug: 'venta-rapida' },
      { title: 'Arqueo y cierre de caja', slug: 'arqueo-caja' },
      { title: 'Reportes de ventas', slug: 'reportes-ventas' },
    ],
  },
  {
    icon: 'ri-bank-line',
    title: 'Bancos',
    slug: 'bancos',
    articles: [
      { title: 'Agregar cuentas bancarias', slug: 'agregar-cuentas' },
      { title: 'Conciliación bancaria', slug: 'conciliacion-bancaria' },
      { title: 'Transferencias entre cuentas', slug: 'transferencias' },
      { title: 'Flujo de caja', slug: 'flujo-caja' },
    ],
  },
]

const popularArticles = [
  { icon: 'ri-file-text-line', title: 'Cómo emitir facturas FEL', category: 'Facturación', views: '2.5k' },
  { icon: 'ri-user-add-line', title: 'Agregar usuarios al sistema', category: 'Configuración', views: '1.8k' },
  { icon: 'ri-archive-line', title: 'Control de inventario básico', category: 'Inventario', views: '1.5k' },
  { icon: 'ri-calculator-line', title: 'Generar estados financieros', category: 'Contabilidad', views: '1.2k' },
]

const quickLinks = [
  { icon: 'ri-video-line', title: 'Video tutoriales', desc: 'Aprende con videos paso a paso', href: '#' },
  { icon: 'ri-download-line', title: 'Descargas', desc: 'Manuales y guías en PDF', href: '#' },
  { icon: 'ri-calendar-line', title: 'Webinars', desc: 'Capacitaciones en vivo', href: '#' },
  { icon: 'ri-chat-3-line', title: 'Comunidad', desc: 'Foro de usuarios VERTEX', href: '#' },
]
</script>

<template>
  <div class="help-center-page">
    <Navbar />

    <!-- Hero Section -->
    <div class="help-center-hero">
      <VContainer>
        <div class="text-center py-16">
          <h1 class="text-h2 text-white mb-4">
            ¿Cómo podemos ayudarte?
          </h1>
          <p class="text-body-1 text-white-50 mb-8">
            Encuentra guías, tutoriales y respuestas a tus preguntas sobre VERTEX ERP
          </p>
          <VTextField
            v-model="searchQuery"
            placeholder="Buscar en el centro de ayuda..."
            prepend-inner-icon="ri-search-line"
            variant="solo"
            bg-color="surface"
            class="mx-auto search-field"
            style="max-width: 600px;"
          />
        </div>
      </VContainer>
    </div>

    <!-- Popular Articles -->
    <div class="bg-surface py-12">
      <VContainer>
        <h4 class="text-h4 text-center mb-8">Artículos Populares</h4>
        <VRow>
          <VCol
            v-for="article in popularArticles"
            :key="article.title"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard variant="outlined" class="h-100 cursor-pointer article-card">
              <VCardText class="d-flex flex-column align-center text-center pa-6">
                <VAvatar color="primary" variant="tonal" size="56" class="mb-4">
                  <VIcon :icon="article.icon" size="28" />
                </VAvatar>
                <h6 class="text-h6 mb-2">{{ article.title }}</h6>
                <VChip size="small" color="primary" variant="tonal">
                  {{ article.category }}
                </VChip>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </div>

    <!-- Knowledge Base -->
    <div class="py-12">
      <VContainer>
        <h4 class="text-h4 text-center mb-8">Base de Conocimiento</h4>
        <VRow>
          <VCol
            v-for="category in categories"
            :key="category.slug"
            cols="12"
            sm="6"
            md="4"
          >
            <VCard variant="outlined" class="h-100">
              <VCardText class="pa-6">
                <div class="d-flex align-center gap-4 mb-4">
                  <VAvatar color="primary" variant="tonal" size="48">
                    <VIcon :icon="category.icon" size="24" />
                  </VAvatar>
                  <h5 class="text-h5">{{ category.title }}</h5>
                </div>
                <VList density="compact" class="pa-0">
                  <VListItem
                    v-for="article in category.articles"
                    :key="article.slug"
                    :to="{ name: 'front-pages-help-center-article-title', params: { title: article.slug } }"
                    class="px-0"
                  >
                    <template #prepend>
                      <VIcon icon="ri-article-line" size="18" class="me-2" color="primary" />
                    </template>
                    <VListItemTitle class="text-body-1">
                      {{ article.title }}
                    </VListItemTitle>
                  </VListItem>
                </VList>
                <VBtn
                  variant="text"
                  color="primary"
                  class="mt-2 px-0"
                  :to="{ name: 'front-pages-help-center-article-title', params: { title: category.slug } }"
                >
                  Ver todos los artículos
                  <VIcon icon="ri-arrow-right-line" class="ms-1" />
                </VBtn>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </div>

    <!-- Quick Links -->
    <div class="bg-surface py-12">
      <VContainer>
        <h4 class="text-h4 text-center mb-8">Recursos Adicionales</h4>
        <VRow>
          <VCol
            v-for="link in quickLinks"
            :key="link.title"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard variant="flat" class="h-100 cursor-pointer resource-card">
              <VCardText class="d-flex align-center gap-4 pa-6">
                <VAvatar color="primary" variant="tonal" size="48">
                  <VIcon :icon="link.icon" size="24" />
                </VAvatar>
                <div>
                  <h6 class="text-h6 mb-1">{{ link.title }}</h6>
                  <p class="text-body-2 text-medium-emphasis mb-0">{{ link.desc }}</p>
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VContainer>
    </div>

    <!-- Contact Support -->
    <div class="py-12">
      <VContainer>
        <VCard color="primary" variant="flat">
          <VCardText class="text-center pa-10">
            <VAvatar color="white" size="64" class="mb-4">
              <VIcon icon="ri-customer-service-2-line" size="32" color="primary" />
            </VAvatar>
            <h4 class="text-h4 text-white mb-2">
              ¿No encontraste lo que buscabas?
            </h4>
            <p class="text-body-1 text-white-50 mb-6">
              Nuestro equipo de soporte está listo para ayudarte
            </p>
            <div class="d-flex justify-center gap-4 flex-wrap">
              <VBtn
                color="white"
                variant="elevated"
                :to="{ name: 'front-pages-landing-page', hash: '#contact-us' }"
              >
                <VIcon icon="ri-mail-line" class="me-2" />
                Enviar mensaje
              </VBtn>
              <VBtn color="white" variant="outlined">
                <VIcon icon="ri-whatsapp-line" class="me-2" />
                WhatsApp
              </VBtn>
            </div>
          </VCardText>
        </VCard>
      </VContainer>
    </div>

    <Footer />
  </div>
</template>

<style lang="scss" scoped>
.help-center-hero {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgba(var(--v-theme-primary), 0.8) 100%);
  padding-block-start: 6rem;
}

.article-card,
.resource-card {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(var(--v-theme-primary), 0.15);
  }
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.7);
}
</style>

<style lang="scss">
.help-center-page {
  @media (max-width: 960px) and (min-width: 600px) {
    .v-container {
      padding-inline: 2rem !important;
    }
  }
}
</style>
