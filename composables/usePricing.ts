/**
 * ============================================================================
 * PRICING COMPOSABLE - Con Supabase Realtime
 * ============================================================================
 * Maneja planes y configuración de precios con actualización en tiempo real.
 * 
 * Características:
 * - Carga inicial de planes y configuración desde API
 * - Suscripción a cambios en billing_settings via WebSocket
 * - Actualización automática de descuentos, IVA, moneda sin refrescar
 */

import type { RealtimeChannel } from '@supabase/supabase-js'

interface Plan {
  id: string
  name: string
  code: string
  planType: string
  description: string
  price: number
  yearlyPrice: number
  billingInterval: 'monthly' | 'annual' // Para filtrar planes mensuales vs anuales
  features: string[]
  limits: Record<string, number>
  displayOrder: number
  isPopular: boolean
  buttonText: string
  icon: string
  iconColor: string
}

interface BillingSettings {
  annualDiscount: {
    percentage: number
    months_free: number
    label: string
    promo_text: string
  }
  trialPeriod: {
    days: number
    requires_card: boolean
  }
  taxRate: {
    percentage: number
    name: string
    included_in_price: boolean
  }
  currency: {
    code: string
    symbol: string
    name: string
  }
}

// Valores por defecto
const DEFAULT_SETTINGS: BillingSettings = {
  annualDiscount: { 
    percentage: 17, 
    months_free: 2, 
    label: '−17%', 
    promo_text: '¡Paga 10 meses y obtén 12! Ahorra 2 meses completos' 
  },
  trialPeriod: { 
    days: 14, 
    requires_card: false 
  },
  taxRate: { 
    percentage: 12, 
    name: 'IVA', 
    included_in_price: true 
  },
  currency: { 
    code: 'GTQ', 
    symbol: 'Q', 
    name: 'Quetzales' 
  },
}

export const usePricing = () => {
  // State
  const plans = ref<Plan[]>([])
  const settings = ref<BillingSettings>({ ...DEFAULT_SETTINGS })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isRealtimeConnected = ref(false)
  
  // Referencia al canal de Realtime
  const realtimeChannel = ref<RealtimeChannel | null>(null)

  // Cargar planes desde API
  const fetchPlans = async () => {
    try {
      const response = await $fetch('/api/plans')
      if (response.success) {
        plans.value = response.data
      }
    } catch (e: any) {
      console.error('[usePricing] Error fetching plans:', e)
      error.value = e.message
    }
  }

  // Cargar configuración de billing desde API
  const fetchSettings = async () => {
    try {
      const response = await $fetch('/api/billing/settings')
      if (response.success) {
        settings.value = response.data
      }
    } catch (e: any) {
      console.error('[usePricing] Error fetching billing settings:', e)
      // Mantener valores por defecto si falla
    }
  }

  // Actualizar una configuración específica cuando llega via Realtime
  const updateSettingFromRealtime = (key: string, value: any) => {
    console.log(`[Realtime] 📡 Received update for ${key}:`, value)
    
    switch (key) {
      case 'annual_discount':
        settings.value = {
          ...settings.value,
          annualDiscount: value
        }
        break
      case 'trial_period':
        settings.value = {
          ...settings.value,
          trialPeriod: value
        }
        break
      case 'tax_rate':
        settings.value = {
          ...settings.value,
          taxRate: value
        }
        break
      case 'currency':
        settings.value = {
          ...settings.value,
          currency: value
        }
        break
    }
  }

  // Suscribirse a cambios en billing_settings via Realtime
  const subscribeToSettings = () => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') {
      console.log('[Realtime] Skipping - not in browser')
      return
    }

    const nuxtApp = useNuxtApp()
    const supabase = nuxtApp.$supabase

    if (!supabase) {
      console.warn('[Realtime] Supabase client not available')
      return
    }

    // Evitar múltiples suscripciones
    if (realtimeChannel.value) {
      console.log('[Realtime] Already subscribed')
      return
    }

    try {
      console.log('[Realtime] Subscribing to billing_settings...')
      
      const channel = supabase
        .channel('billing-settings-realtime')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'core',
            table: 'billing_settings',
          },
          (payload: any) => {
            console.log('[Realtime] Received payload:', payload)
            const { new: newRecord } = payload
            if (newRecord?.key && newRecord?.value) {
              updateSettingFromRealtime(newRecord.key, newRecord.value)
            }
          }
        )
        .subscribe((status: string, err?: Error) => {
          console.log(`[Realtime] Subscription status: ${status}`, err || '')
          
          if (status === 'SUBSCRIBED') {
            isRealtimeConnected.value = true
            console.log('[Realtime] ✓ Connected to billing_settings')
          } else if (status === 'CHANNEL_ERROR') {
            isRealtimeConnected.value = false
            console.error('[Realtime] ✗ Channel error:', err)
          } else if (status === 'TIMED_OUT') {
            isRealtimeConnected.value = false
            console.error('[Realtime] ✗ Connection timed out')
          } else if (status === 'CLOSED') {
            isRealtimeConnected.value = false
            console.log('[Realtime] Channel closed')
          }
        })

      realtimeChannel.value = channel
    } catch (e) {
      console.error('[Realtime] Failed to subscribe:', e)
    }
  }

  // Desuscribirse de Realtime
  const unsubscribeFromSettings = () => {
    if (realtimeChannel.value) {
      console.log('[Realtime] Unsubscribing...')
      realtimeChannel.value.unsubscribe()
      realtimeChannel.value = null
      isRealtimeConnected.value = false
    }
  }

  // Cargar todo (planes + settings + activar realtime)
  const loadPricingData = async () => {
    isLoading.value = true
    error.value = null
    try {
      await Promise.all([fetchPlans(), fetchSettings()])
      // Activar Realtime después de cargar datos iniciales
      // Usar nextTick para asegurar que el plugin esté listo
      await nextTick()
      subscribeToSettings()
    } finally {
      isLoading.value = false
    }
  }

  // Computed: Filtrar planes por tipo
  const getPlansByType = (type: 'empresa' | 'contador') => {
    return computed(() => 
      plans.value
        .filter(p => p.planType === type)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    )
  }

  // ============================================================================
  // COMPUTED SETTINGS - Se actualizan automáticamente con Realtime
  // ============================================================================
  
  const discountPercentage = computed(() => settings.value.annualDiscount?.percentage ?? 17)
  const discountLabel = computed(() => settings.value.annualDiscount?.label ?? '−17%')
  const discountPromoText = computed(() => settings.value.annualDiscount?.promo_text ?? '¡Paga 10 meses y obtén 12!')
  const monthsFree = computed(() => settings.value.annualDiscount?.months_free ?? 2)
  const trialDays = computed(() => settings.value.trialPeriod?.days ?? 14)
  const taxPercentage = computed(() => settings.value.taxRate?.percentage ?? 12)
  const taxName = computed(() => settings.value.taxRate?.name ?? 'IVA')
  const currencySymbol = computed(() => settings.value.currency?.symbol ?? 'Q')
  const currencyCode = computed(() => settings.value.currency?.code ?? 'GTQ')

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  // Precio a mostrar según billing period
  const getDisplayPrice = (plan: Plan, billingPeriod: 'monthly' | 'yearly') => {
    // Con la nueva estructura donde los planes están separados por billing_interval:
    // El plan filtrado ya tiene el precio correcto en plan.price
    
    if (billingPeriod === 'yearly') {
      // Si es anual, el plan.price es el precio anual total
      // Mostramos el equivalente mensual
      return Math.floor(plan.price / 12)
    }
    
    // Si es mensual, plan.price es el precio mensual
    return plan.price
  }

  // Ahorro anual para un plan
  const getYearlySavings = (plan: Plan) => {
    // Con la nueva estructura de billing_interval:
    // - Planes anuales: plan.price YA es el precio anual total (ej: Q11,988/año)
    // - El ahorro es equivalente a 2 meses gratis (paga 10, obtiene 12)
    
    // Si el plan tiene billing_interval='annual'
    if (plan.billingInterval === 'annual') {
      // Precio anual = 10 meses pagados (plan.price)
      // Precio mensual = plan.price / 10
      // Ahorro = precio mensual * 2 (2 meses gratis)
      const precioMensual = plan.price / 10
      return Math.round(precioMensual * 2)
    }
    
    // Para planes mensuales (si aún se usa esta lógica)
    // yearlyPrice debería ser el precio de 10 meses
    const fullYearPrice = plan.price * 12
    return fullYearPrice - (plan.yearlyPrice || plan.price * 10)
  }

  // Calcular IVA
  const calculateTax = (amount: number) => {
    return Math.round(amount * (taxPercentage.value / 100) * 100) / 100
  }

  // Formatear moneda (solo número)
  const formatCurrency = (amount: number): string => {
    return amount.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Formatear precio completo con símbolo
  const formatPrice = (amount: number): string => {
    return `${currencySymbol.value}${formatCurrency(amount)}`
  }

  // Limpiar al desmontar componente
  onUnmounted(() => {
    unsubscribeFromSettings()
  })

  return {
    // State
    plans,
    settings,
    isLoading,
    error,
    isRealtimeConnected,
    
    // Methods
    loadPricingData,
    fetchPlans,
    fetchSettings,
    getPlansByType,
    getDisplayPrice,
    getYearlySavings,
    calculateTax,
    formatCurrency,
    formatPrice,
    subscribeToSettings,
    unsubscribeFromSettings,
    
    // Computed settings (reactivos con Realtime)
    discountPercentage,
    discountLabel,
    discountPromoText,
    monthsFree,
    trialDays,
    taxPercentage,
    taxName,
    currencySymbol,
    currencyCode,
  }
}
