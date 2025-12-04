<script setup lang="ts">
interface Plan {
  id: string
  name: string
  code: string
  planType: string
  description: string
  price: number
  yearlyPrice: number
  billingPeriod: string
  features: string[]
  limits: Record<string, number>
  displayOrder: number
  isPopular: boolean
  buttonText: string
  icon: string
  iconColor: string
}

interface Props {
  isDialogVisible: boolean
  currentPlanId?: string | null
  defaultTab?: 'empresa' | 'contador'
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
  (e: 'select-plan', plan: Plan, billing: 'monthly' | 'yearly'): void
}

const props = withDefaults(defineProps<Props>(), {
  currentPlanId: null,
  defaultTab: 'empresa',
})

const emit = defineEmits<Emit>()
const router = useRouter()

// Usar composable de pricing con Realtime
const {
  plans,
  isLoading,
  loadPricingData,
  getDisplayPrice,
  getYearlySavings,
  formatCurrency,
  discountLabel,
  discountPromoText,
  currencySymbol,
  isRealtimeConnected,
} = usePricing()

// State
const selectedTab = ref<'empresa' | 'contador'>(props.defaultTab)
const isYearly = ref(true) // Por defecto anual (mejor oferta)

// Fetch plans when dialog opens
watch(() => props.isDialogVisible, async (visible) => {
  if (visible) {
    selectedTab.value = props.defaultTab
    if (plans.value.length === 0) {
      await loadPricingData()
    }
  }
})

// Computed: filtered plans by type
const filteredPlans = computed(() => {
  return plans.value
    .filter(p => p.planType === selectedTab.value)
    .sort((a, b) => a.displayOrder - b.displayOrder)
})

// Get main limit to display
const getMainLimit = (plan: Plan): string => {
  if (plan.planType === 'empresa') {
    const usuarios = plan.limits?.usuarios
    if (usuarios === -1) return 'Usuarios ilimitados'
    return `Hasta ${usuarios} usuarios`
  } else {
    const empresas = plan.limits?.owned_tenants
    if (empresas === -1) return 'Empresas ilimitadas'
    return `Hasta ${empresas} empresas`
  }
}

// Handle plan selection - navigate to checkout
const handleSelectPlan = (plan: Plan) => {
  const billing = isYearly.value ? 'yearly' : 'monthly'
  
  // Emit event for parent component
  emit('select-plan', plan, billing)
  emit('update:isDialogVisible', false)
  
  // Navigate to payment/checkout page
  router.push({
    path: '/front-pages/payment',
    query: {
      modalidad: plan.planType,
      plan: plan.code,
      billing: billing,
    },
  })
}

const dialogVisibleUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

// Icon mapping for plans
const getPlanIcon = (plan: Plan): string => {
  return plan.icon || (plan.planType === 'empresa' ? 'ri-building-2-line' : 'ri-calculator-line')
}

// Color mapping
const getIconColor = (plan: Plan): string => {
  if (plan.isPopular) return 'primary'
  return plan.iconColor || 'secondary'
}
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="1100"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="pricing-dialog">
      <!-- Close button -->
      <DialogCloseBtn
        variant="text"
        size="default"
        @click="emit('update:isDialogVisible', false)"
      />

      <VCardText class="pt-6 pb-2 px-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <h4 class="text-h4 mb-2">Elige tu Plan</h4>
          <p class="text-body-1 text-medium-emphasis mb-4">
            Todos los planes incluyen acceso completo a las funcionalidades según tu tipo de cuenta.
          </p>

          <!-- Type tabs (Empresa / Contador) -->
          <VCard variant="outlined" class="d-inline-flex mb-4" style="border-radius: 12px; overflow: hidden;">
            <VBtn
              :variant="selectedTab === 'empresa' ? 'flat' : 'text'"
              :color="selectedTab === 'empresa' ? 'primary' : 'default'"
              size="large"
              class="px-6"
              style="border-radius: 0;"
              @click="selectedTab = 'empresa'"
            >
              <VIcon icon="ri-building-line" class="me-2" />
              Empresas
            </VBtn>
            <VBtn
              :variant="selectedTab === 'contador' ? 'flat' : 'text'"
              :color="selectedTab === 'contador' ? 'primary' : 'default'"
              size="large"
              class="px-6"
              style="border-radius: 0;"
              @click="selectedTab = 'contador'"
            >
              <VIcon icon="ri-user-settings-line" class="me-2" />
              Contadores
            </VBtn>
          </VCard>

          <!-- Subtitle based on selection -->
          <div class="mb-4">
            <VChip
              v-if="selectedTab === 'empresa'"
              color="primary"
              variant="tonal"
              size="small"
            >
              Para comercios, distribuidoras e industrias
            </VChip>
            <VChip
              v-else
              color="success"
              variant="tonal"
              size="small"
            >
              Para contadores independientes, despachos y firmas
            </VChip>
          </div>

          <!-- Billing toggle -->
          <VCard variant="outlined" class="d-inline-flex" style="border-radius: 12px; overflow: hidden;">
            <VBtn
              :variant="!isYearly ? 'flat' : 'text'"
              :color="!isYearly ? 'primary' : 'default'"
              class="px-4"
              style="border-radius: 0;"
              @click="isYearly = false"
            >
              Mensual
            </VBtn>
            <VBtn
              :variant="isYearly ? 'flat' : 'text'"
              :color="isYearly ? 'primary' : 'default'"
              class="px-4"
              style="border-radius: 0;"
              @click="isYearly = true"
            >
              Anual
              <VChip
                color="success"
                size="x-small"
                class="ms-2"
              >
                {{ discountLabel }}
              </VChip>
            </VBtn>
          </VCard>

          <!-- Yearly savings banner -->
          <div v-if="isYearly" class="mt-4">
            <VChip color="success" variant="flat" size="small">
              <VIcon icon="ri-gift-line" size="16" class="me-1" />
              {{ discountPromoText }}
            </VChip>
          </div>
        </div>
      </VCardText>

      <VCardText class="px-6 pb-6">
        <!-- Loading state -->
        <div v-if="isLoading" class="text-center py-12">
          <VProgressCircular indeterminate color="primary" />
          <p class="mt-4 text-medium-emphasis">Cargando planes...</p>
        </div>

        <!-- Plans grid -->
        <VRow v-else>
          <VCol
            v-for="plan in filteredPlans"
            :key="plan.id"
            cols="12"
            md="4"
          >
            <VCard
              :class="[
                'plan-card h-100',
                { 'border-primary border-opacity-100': plan.isPopular },
                { 'current-plan': plan.id === currentPlanId }
              ]"
              :variant="plan.isPopular ? 'outlined' : 'flat'"
              :color="plan.isPopular ? undefined : 'rgba(var(--v-theme-on-surface), 0.04)'"
              :style="plan.isPopular ? 'border-width: 2px;' : ''"
            >
              <!-- Popular badge -->
              <VChip
                v-if="plan.isPopular"
                color="primary"
                size="small"
                class="popular-badge"
              >
                Recomendado
              </VChip>

              <!-- Current plan badge -->
              <VChip
                v-if="plan.id === currentPlanId"
                color="success"
                size="small"
                class="current-badge"
              >
                Plan Actual
              </VChip>

              <VCardText class="text-center pt-8 pb-4">
                <!-- Plan name -->
                <h5 class="text-h5 mb-1">{{ plan.name }}</h5>
                <p class="text-body-2 text-medium-emphasis mb-4">
                  {{ plan.description }}
                </p>

                <!-- Plan icon -->
                <VAvatar
                  :color="getIconColor(plan)"
                  variant="tonal"
                  size="80"
                  class="mb-4"
                >
                  <VIcon
                    :icon="getPlanIcon(plan)"
                    size="40"
                  />
                </VAvatar>

                <!-- Price -->
                <div class="d-flex flex-column align-center mb-2">
                  <div class="d-flex align-center justify-center">
                    <span class="text-h6 font-weight-medium align-self-start mt-1">{{ currencySymbol }}</span>
                    <span class="text-h2 font-weight-bold">{{ formatCurrency(getDisplayPrice(plan, isYearly ? 'yearly' : 'monthly')) }}</span>
                    <span class="text-body-1 align-self-end mb-1 ms-1 text-medium-emphasis">/mes</span>
                  </div>

                  <!-- Original price (crossed out) for yearly -->
                  <div v-if="isYearly" class="text-center">
                    <span class="text-body-2 text-medium-emphasis text-decoration-line-through">
                      {{ currencySymbol }}{{ formatCurrency(plan.price) }}/mes
                    </span>
                    <div class="text-caption text-success font-weight-medium">
                      {{ currencySymbol }}{{ formatCurrency(plan.yearlyPrice) }}/año
                    </div>
                  </div>
                </div>

                <!-- Main limit -->
                <VChip
                  color="secondary"
                  variant="tonal"
                  size="small"
                  class="mb-2"
                >
                  {{ getMainLimit(plan) }}
                </VChip>
              </VCardText>

              <VDivider />

              <!-- Features -->
              <VCardText class="pt-4">
                <VList density="compact" class="features-list">
                  <VListItem
                    v-for="(feature, index) in plan.features"
                    :key="index"
                    class="px-0"
                  >
                    <template #prepend>
                      <VIcon
                        icon="ri-checkbox-circle-line"
                        color="primary"
                        size="20"
                        class="me-2"
                      />
                    </template>
                    <VListItemTitle class="text-body-2">
                      {{ feature }}
                    </VListItemTitle>
                  </VListItem>
                </VList>
              </VCardText>

              <VSpacer />

              <!-- Action button -->
              <VCardText class="pt-0">
                <VBtn
                  block
                  :color="plan.isPopular ? 'primary' : 'secondary'"
                  :variant="plan.id === currentPlanId ? 'outlined' : 'elevated'"
                  :disabled="plan.id === currentPlanId"
                  @click="handleSelectPlan(plan)"
                >
                  {{ plan.id === currentPlanId ? 'Plan Actual' : plan.buttonText }}
                </VBtn>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>

        <!-- Footer note -->
        <p class="text-center text-caption text-medium-emphasis mt-6 mb-0">
          ¿Necesitas un plan personalizado? 
          <a href="/front-pages/contacto" class="text-primary">Contáctanos</a>
        </p>
      </VCardText>

      <!-- Indicador de Realtime (solo desarrollo) -->
      <RealtimeIndicator :is-connected="isRealtimeConnected" label="Pricing Realtime" />
    </VCard>
  </VDialog>
</template>

<style lang="scss" scoped>
.pricing-dialog {
  .plan-card {
    position: relative;
    transition: transform 0.2s ease, box-shadow 0.2s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(var(--v-shadow-key-umbra-color), 0.16);
    }

    &.current-plan {
      border-color: rgb(var(--v-theme-success)) !important;
    }
  }

  .popular-badge {
    position: absolute;
    top: 12px;
    right: 12px;
  }

  .current-badge {
    position: absolute;
    top: 12px;
    left: 12px;
  }

  .features-list {
    background: transparent !important;

    :deep(.v-list-item) {
      min-height: 32px;
      padding-block: 2px;
    }
  }
}
</style>
