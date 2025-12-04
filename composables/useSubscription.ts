/**
 * Composable para manejar el estado de la suscripción/trial del usuario
 * Se usa globalmente en toda la aplicación para mostrar el banner de trial
 */

interface SubscriptionStatus {
  status: string
  isTrialing: boolean
  isFullAccessTrial: boolean
  trialEndsAt: string | null
  daysRemaining: number
  trialType: string
  currentPeriodStart: string
  currentPeriodEnd: string
  plan: {
    id: string
    name: string
    code: string
    price: number
    billingPeriod: string
  } | null
  needsPlanSelection: boolean
}

// Estado global compartido
const subscriptionState = ref<SubscriptionStatus | null>(null)
const isLoading = ref(false)
const hasLoaded = ref(false)

export function useSubscription() {
  const { status: authStatus } = useAuth()

  // Cargar el estado de la suscripción
  const loadSubscriptionStatus = async (force = false) => {
    // Si ya cargamos y no es forzado, no recargar
    if (hasLoaded.value && !force) {
      return subscriptionState.value
    }

    // Solo cargar si está autenticado
    if (authStatus.value !== 'authenticated') {
      subscriptionState.value = null
      return null
    }

    isLoading.value = true

    try {
      const response = await $fetch('/api/subscription/status')
      
      if (response.success && response.data) {
        subscriptionState.value = response.data
      } else {
        subscriptionState.value = null
      }
      
      hasLoaded.value = true
      return subscriptionState.value
    } catch (error) {
      console.warn('Error cargando estado de suscripción:', error)
      subscriptionState.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Computed helpers
  const isTrialing = computed(() => subscriptionState.value?.isTrialing ?? false)
  const daysRemaining = computed(() => subscriptionState.value?.daysRemaining ?? 0)
  const trialEndsAt = computed(() => subscriptionState.value?.trialEndsAt ?? null)
  const planName = computed(() => subscriptionState.value?.plan?.name ?? 'Premium')
  const needsPlanSelection = computed(() => subscriptionState.value?.needsPlanSelection ?? false)

  // Color del banner según días restantes
  const bannerColor = computed(() => {
    const days = daysRemaining.value
    if (days > 7) return 'success'
    if (days > 3) return 'warning'
    return 'error'
  })

  // Mensaje del banner
  const bannerMessage = computed(() => {
    const days = daysRemaining.value
    
    if (days === 0) {
      return 'Tu período de prueba ha terminado. Elige un plan para continuar.'
    }
    if (days === 1) {
      return '¡Último día de prueba! Elige tu plan antes de que expire.'
    }
    if (days <= 3) {
      return `¡Solo quedan ${days} días de prueba! Explora nuestros planes.`
    }
    if (days <= 7) {
      return `Te quedan ${days} días de acceso completo. Aprovecha para explorar.`
    }
    return `¡Bienvenido! Tienes ${days} días de acceso completo gratis.`
  })

  // Resetear estado (útil en logout)
  const resetSubscription = () => {
    subscriptionState.value = null
    hasLoaded.value = false
  }

  return {
    // Estado
    subscription: subscriptionState,
    isLoading: readonly(isLoading),
    hasLoaded: readonly(hasLoaded),
    
    // Métodos
    loadSubscriptionStatus,
    resetSubscription,
    
    // Computed helpers
    isTrialing,
    daysRemaining,
    trialEndsAt,
    planName,
    needsPlanSelection,
    bannerColor,
    bannerMessage,
  }
}
