<script setup lang="ts">
import sectionTitleIcon from '@images/pages/section-title-icon.png'

const {
  plans,
  isLoading,
  loadPricingData,
  getPlansByType,
  getDisplayPrice,
  formatCurrency,
  discountLabel,
  discountPromoText,
  currencySymbol,
  isRealtimeConnected,
} = usePricing()

const pricingTab = ref('empresa')
const billingPeriod = ref<'monthly' | 'yearly'>('yearly')

// Cargar planes al montar
onMounted(async () => {
  await loadPricingData()
})

// Planes filtrados por tipo
const currentPlans = computed(() => {
  return plans.value
    .filter(p => p.planType === pricingTab.value)
    .sort((a, b) => a.displayOrder - b.displayOrder)
})

// Determinar variante del botón
const getButtonVariant = (plan: any): 'elevated' | 'outlined' => {
  return plan.isPopular ? 'elevated' : 'outlined'
}
</script>

<template>
  <VContainer id="pricing-plan">
    <div class="pricing-plans d-flex flex-column gap-8">
      <div class="headers d-flex justify-center flex-column align-center">
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
            PLANES Y PRECIOS
          </div>
        </div>

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Elige el plan
          </span> <span class="text-h5 d-inline-block">perfecto para ti</span>
        </div>

        <p
          class="text-body-1 font-weight-medium text-center"
          style="letter-spacing: 0.15px !important;"
        >
          Dos modalidades diseñadas para diferentes necesidades.
          Todos los planes incluyen actualizaciones y soporte técnico.
        </p>
      </div>

      <!-- Tabs de modalidad -->
      <div class="d-flex justify-center">
        <VCard variant="outlined" class="pricing-tabs-card">
          <div class="d-flex">
            <VBtn
              :variant="pricingTab === 'empresa' ? 'flat' : 'text'"
              :color="pricingTab === 'empresa' ? 'primary' : 'default'"
              size="large"
              class="pricing-tab-btn"
              @click="pricingTab = 'empresa'"
            >
              <VIcon icon="ri-building-line" class="me-2" />
              Empresas
            </VBtn>
            <VBtn
              :variant="pricingTab === 'contador' ? 'flat' : 'text'"
              :color="pricingTab === 'contador' ? 'primary' : 'default'"
              size="large"
              class="pricing-tab-btn"
              @click="pricingTab = 'contador'"
            >
              <VIcon icon="ri-user-settings-line" class="me-2" />
              Contadores
            </VBtn>
          </div>
        </VCard>
      </div>

      <div class="text-center">
        <VChip
          v-if="pricingTab === 'empresa'"
          color="primary"
          variant="tonal"
          size="small"
          class="mb-4"
        >
          Para comercios, distribuidoras e industrias
        </VChip>
        <VChip
          v-else
          color="success"
          variant="tonal"
          size="small"
          class="mb-4"
        >
          Para contadores independientes, despachos y firmas
        </VChip>
      </div>

      <!-- Toggle mensual/anual -->
      <div class="d-flex align-center justify-center flex-wrap gap-4">
        <VCard variant="outlined" class="billing-tabs-card">
          <div class="d-flex">
            <VBtn
              :variant="billingPeriod === 'monthly' ? 'flat' : 'text'"
              :color="billingPeriod === 'monthly' ? 'primary' : 'default'"
              class="billing-tab-btn"
              @click="billingPeriod = 'monthly'"
            >
              Mensual
            </VBtn>
            <VBtn
              :variant="billingPeriod === 'yearly' ? 'flat' : 'text'"
              :color="billingPeriod === 'yearly' ? 'primary' : 'default'"
              class="billing-tab-btn"
              @click="billingPeriod = 'yearly'"
            >
              Anual
              <VChip color="success" size="x-small" class="ms-2">{{ discountLabel }}</VChip>
            </VBtn>
          </div>
        </VCard>
      </div>

      <!-- Alert de ahorro cuando es anual -->
      <div v-if="billingPeriod === 'yearly'" class="text-center">
        <VChip color="success" variant="flat" size="small">
          <VIcon icon="ri-gift-line" size="16" class="me-1" />
          {{ discountPromoText }}
        </VChip>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="d-flex justify-center py-12">
        <VProgressCircular indeterminate color="primary" size="48" />
      </div>

      <!-- Plans grid -->
      <VRow v-else>
        <VCol
          v-for="plan in currentPlans"
          :key="`${pricingTab}-${billingPeriod}-${plan.id}`"
          cols="12"
          md="4"
        >
          <VCard
            flat
            border
            :style="plan.isPopular ? 'border:2px solid rgb(var(--v-theme-primary))' : ''"
            class="h-100"
          >
            <VCardText class="pa-lg-8 text-no-wrap d-flex flex-column h-100">
              <div class="d-flex flex-column gap-y-5 flex-grow-1">
                <div class="d-flex flex-column gap-y-3">
                  <div class="d-flex align-center justify-space-between">
                    <h4 class="text-h4">
                      {{ plan.name }}
                    </h4>
                    <VChip
                      v-if="plan.isPopular"
                      color="primary"
                      size="small"
                    >
                      Recomendado
                    </VChip>
                  </div>

                  <p class="text-body-2 text-medium-emphasis mb-0" style="white-space: normal;">
                    {{ plan.description }}
                  </p>

                  <!-- Icon Avatar -->
                  <div class="d-flex justify-center my-3">
                    <VAvatar
                      :color="plan.iconColor"
                      variant="tonal"
                      size="80"
                    >
                      <VIcon :icon="plan.icon" size="40" />
                    </VAvatar>
                  </div>

                  <!-- Precio dinámico -->
                  <div class="d-flex flex-column align-center">
                    <div class="d-flex align-end gap-x-1 justify-center">
                      <div class="d-flex align-start">
                        <span class="text-h6 mt-1">{{ currencySymbol }}</span>
                        <span class="plan-price-text">{{ formatCurrency(getDisplayPrice(plan, billingPeriod)) }}</span>
                      </div>
                      <span class="text-body-1 text-medium-emphasis mb-2">/mes</span>
                    </div>
                    
                    <!-- Precio original tachado si es anual -->
                    <div v-if="billingPeriod === 'yearly'" class="text-center">
                      <span class="text-body-2 text-medium-emphasis text-decoration-line-through">
                        {{ currencySymbol }}{{ formatCurrency(plan.price) }}/mes
                      </span>
                      <div class="text-caption text-success font-weight-medium">
                        {{ currencySymbol }}{{ formatCurrency(plan.yearlyPrice) }}/año
                      </div>
                    </div>
                  </div>

                  <VDivider />
                </div>

                <div class="d-flex flex-column flex-grow-1">
                  <VList class="card-list">
                    <VListItem
                      v-for="(feature, i) in plan.features"
                      :key="i"
                      class="px-0"
                      min-height="36"
                    >
                      <template #prepend>
                        <VIcon
                          icon="ri-checkbox-circle-line"
                          color="primary"
                          size="20"
                          class="me-3"
                        />
                      </template>
                      <span class="text-body-1">{{ feature }}</span>
                    </VListItem>
                  </VList>
                </div>

                <VBtn
                  block
                  :variant="getButtonVariant(plan)"
                  :to="{ 
                    name: 'front-pages-payment', 
                    query: { 
                      modalidad: pricingTab, 
                      plan: plan.code,
                      billing: billingPeriod 
                    } 
                  }"
                  :color="plan.isPopular ? 'primary' : undefined"
                >
                  {{ plan.buttonText }}
                </VBtn>
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>

      <!-- Botón solicitar demo -->
      <div class="text-center mt-4">
        <p class="text-body-1 text-medium-emphasis mb-4">
          ¿Prefieres una demostración personalizada antes de decidir?
        </p>
        <VBtn
          size="large"
          class="neon-btn"
          href="#contact-us"
        >
          <VIcon icon="ri-video-chat-line" class="me-2" />
          Solicitar Demo
        </VBtn>
      </div>

      <div class="text-center">
        <p class="text-body-2 text-medium-emphasis">
          Todos los precios están en Quetzales (GTQ). IVA incluido.
        </p>
      </div>
    </div>

    <!-- Indicador de Realtime (solo desarrollo) -->
    <RealtimeIndicator :is-connected="isRealtimeConnected" label="Pricing Realtime" />
  </VContainer>
</template>

<style lang="scss">
.card-list {
  --v-card-list-gap: 8px;
}

.pricing-plans {
  margin-block: 5.25rem;
}
</style>

<style lang="scss" scoped>
.plan-price-text {
  color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
  font-size: 40px;
  font-weight: 700;
  line-height: 48px;
}

.pricing-tabs-card,
.billing-tabs-card {
  border-radius: 12px;
  overflow: hidden;
}

.pricing-tab-btn {
  border-radius: 0;
  min-width: 160px;
}

.billing-tab-btn {
  border-radius: 0;
  min-width: 120px;
}

// Botón neón
.neon-btn {
  position: relative;
  background: linear-gradient(135deg, #ff6b35 0%, #f7931e 50%, #ff6b35 100%);
  color: white !important;
  font-weight: 600;
  border: none;
  border-radius: 50px;
  padding-inline: 2rem;
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
