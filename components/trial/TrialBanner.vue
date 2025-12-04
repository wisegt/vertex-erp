<script setup lang="ts">
/**
 * TrialBanner Component
 * 
 * Banner global que muestra el estado del período de prueba.
 * Se puede usar de dos formas:
 * 1. Sin props: usa el composable useSubscription() para obtener los datos
 * 2. Con props: usa los datos proporcionados directamente
 */

interface Props {
  // Props opcionales - si no se proporcionan, usa el composable
  trialEndsAt?: string | null
  daysRemaining?: number
  autoLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  trialEndsAt: undefined,
  daysRemaining: undefined,
  autoLoad: true,
})

const emit = defineEmits<{
  (e: 'view-plans'): void
  (e: 'dismiss'): void
}>()

// Usar composable si no se proporcionan props
const { 
  isTrialing, 
  daysRemaining: composableDays, 
  trialEndsAt: composableTrialEndsAt,
  bannerColor: composableBannerColor,
  bannerMessage: composableBannerMessage,
  loadSubscriptionStatus 
} = useSubscription()

// Cargar estado si autoLoad está habilitado
onMounted(async () => {
  if (props.autoLoad && props.trialEndsAt === undefined) {
    await loadSubscriptionStatus()
  }
})

// Calcular días restantes (priorizar props sobre composable)
const computedDaysRemaining = computed(() => {
  if (props.daysRemaining !== undefined) return props.daysRemaining
  if (props.trialEndsAt) {
    const endDate = new Date(props.trialEndsAt)
    const today = new Date()
    const diffTime = endDate.getTime() - today.getTime()
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }
  return composableDays.value
})

// Color del banner según días restantes
const bannerColor = computed(() => {
  if (props.trialEndsAt !== undefined) {
    const days = computedDaysRemaining.value
    if (days > 7) return 'success'
    if (days > 3) return 'warning'
    return 'error'
  }
  return composableBannerColor.value
})

// Icono del banner
const bannerIcon = computed(() => {
  const days = computedDaysRemaining.value
  if (days > 7) return 'ri-gift-2-line'
  if (days > 3) return 'ri-time-line'
  return 'ri-alarm-warning-line'
})

// Mensaje principal del banner
const bannerTitle = computed(() => {
  const days = computedDaysRemaining.value
  if (days === 0) return 'Tu período de prueba ha terminado'
  if (days === 1) return '¡Último día de prueba!'
  if (days <= 3) return `¡Solo quedan ${days} días de prueba!`
  if (days <= 7) return `Te quedan ${days} días de acceso completo`
  return `¡Bienvenido! Tienes ${days} días de acceso completo`
})

// Mensaje secundario del banner
const bannerSubtitle = computed(() => {
  const days = computedDaysRemaining.value
  if (days === 0) return 'Elige un plan para continuar disfrutando de VERTEX.'
  if (days <= 3) return 'Explora nuestros planes y elige el que mejor se adapte a tu negocio.'
  if (days <= 7) return 'Aprovecha para explorar todas las funcionalidades y encontrar el plan ideal.'
  return 'Explora todas las funcionalidades sin límites. Cuando estés listo, elige tu plan.'
})

// Texto del botón
const buttonText = computed(() => {
  const days = computedDaysRemaining.value
  if (days === 0) return 'Elegir Plan'
  if (days <= 3) return 'Ver Planes'
  return 'Explorar Planes'
})

// Determinar si mostrar el banner
const showBanner = computed(() => {
  // Si se proporcionó trialEndsAt como prop
  if (props.trialEndsAt !== undefined) {
    return props.trialEndsAt !== null && computedDaysRemaining.value >= 0
  }
  // Usar estado del composable
  return isTrialing.value
})

// Estado para controlar si el banner está visible (dismiss temporal por sesión)
const isDismissed = ref(false)

const handleViewPlans = () => {
  emit('view-plans')
  // También abrimos en nueva pestaña para no perder el contexto
  window.open('/front-pages/pricing', '_blank')
}
</script>

<template>
  <VAlert
    v-if="showBanner && !isDismissed"
    :color="bannerColor"
    variant="tonal"
    density="comfortable"
    class="trial-banner mb-4"
    closable
    @click:close="isDismissed = true"
  >
    <template #prepend>
      <VAvatar :color="bannerColor" variant="flat" size="40">
        <VIcon :icon="bannerIcon" size="22" />
      </VAvatar>
    </template>

    <div class="d-flex flex-wrap align-center justify-space-between gap-3 w-100">
      <div>
        <div class="text-body-1 font-weight-semibold">{{ bannerTitle }}</div>
        <div class="text-body-2" style="opacity: 0.85;">{{ bannerSubtitle }}</div>
      </div>
      
      <VBtn
        :color="bannerColor"
        :variant="computedDaysRemaining <= 3 ? 'elevated' : 'outlined'"
        size="small"
        @click="handleViewPlans"
      >
        <VIcon icon="ri-price-tag-3-line" size="16" class="me-1" />
        {{ buttonText }}
      </VBtn>
    </div>
  </VAlert>
</template>

<style lang="scss" scoped>
.trial-banner {
  border-radius: 10px;
  
  :deep(.v-alert__content) {
    width: 100%;
  }
  
  :deep(.v-alert__prepend) {
    align-self: center;
  }
}
</style>
