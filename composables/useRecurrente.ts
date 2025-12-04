/**
 * ============================================================================
 * RECURRENTE COMPOSABLE
 * ============================================================================
 * Maneja la integración con la API de Recurrente para pagos con tarjeta.
 *
 * Documentación: https://documenter.getpostman.com/view/10340859/2sA2rFQf5R
 *
 * Características:
 * - Crear checkout sessions para suscripciones
 * - Verificar estado de pagos
 * - Manejar webhooks de Recurrente
 */

export interface RecurrenteCheckoutItem {
  name: string
  currency: 'GTQ' | 'USD'
  amount_in_cents: number
  quantity?: number
  image_url?: string
  charge_type?: 'one_time' | 'recurring'
  billing_interval?: 'day' | 'week' | 'month' | 'year'
  billing_interval_count?: number
}

export interface RecurrenteCheckoutOptions {
  items: RecurrenteCheckoutItem[]
  success_url?: string
  cancel_url?: string
  user_id?: string
  metadata?: Record<string, any>
  expires_at?: string
}

export interface RecurrenteCheckoutResponse {
  id: string
  checkout_url: string
  status?: string
  live_mode?: boolean
}

export interface RecurrenteCheckoutStatus {
  id: string
  status: 'open' | 'completed' | 'expired' | 'cancelled'
  live_mode: boolean
  payment_intent?: {
    id: string
    status: string
    amount: number
    currency: string
  }
  subscription?: {
    id: string
    status: string
  }
  customer?: {
    id: string
    email: string
    name: string
  }
  metadata?: Record<string, any>
}

export const useRecurrente = () => {
  const isProcessing = ref(false)
  const error = ref<string | null>(null)

  /**
   * Crear un checkout session para una suscripción
   */
  const createSubscriptionCheckout = async (  
    planName: string,
    amountInCents: number,
    billingPeriod: 'monthly' | 'yearly',
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<RecurrenteCheckoutResponse | null> => {
    isProcessing.value = true
    error.value = null

    try {
      // Determinar el intervalo de facturación
      const billingInterval = billingPeriod === 'yearly' ? 'year' : 'month'
      const billingIntervalCount = 1

      // Construir el item de la suscripción
      // IMPORTANTE: Para suscripciones NO incluir quantity
      // IMPORTANTE: Los campos se llaman billing_interval, NO recurring_interval
      const item: any = {
        name: planName,
        currency: 'GTQ',
        amount_in_cents: amountInCents,
        charge_type: 'recurring',
        billing_interval: billingInterval,
        billing_interval_count: billingIntervalCount,
      }

      const checkoutData: any = {
        items: [item],
        success_url: `${window.location.origin}/payment-success`,
        cancel_url: `${window.location.origin}/payment`,
      }

      // Solo agregar campos opcionales si existen
      if (userId)
        checkoutData.user_id = userId

      if (metadata && Object.keys(metadata).length > 0) {
        checkoutData.metadata = {
          ...metadata,
          source: 'vertex_erp',
          created_from: 'payment_page',
        }
      }

      console.log('[useRecurrente] Datos a enviar:', JSON.stringify(checkoutData, null, 2))

      // Llamar al endpoint del servidor
      const response = await $fetch<any>('/api/recurrente/create-checkout', {
        method: 'POST',
        body: checkoutData,
      })

      if (response.success) {
        return response.data
      }
      else {
        error.value = response.message || 'Error al crear el checkout'

        return null
      }
    }
    catch (e: any) {
      console.error('[useRecurrente] Error creating checkout:', e)
      error.value = e.message || 'Error de conexión con Recurrente'

      return null
    }
    finally {
      isProcessing.value = false
    }
  }

  /**
   * Obtener el estado de un checkout
   */
  const getCheckoutStatus = async (checkoutId: string): Promise<RecurrenteCheckoutStatus | null> => {
    try {
      const response = await $fetch<any>(`/api/recurrente/checkout/${checkoutId}`)

      if (response.success)
        return response.data

      return null
    }
    catch (e: any) {
      console.error('[useRecurrente] Error getting checkout status:', e)

      return null
    }
  }

  /**
   * Verificar si un checkout fue completado exitosamente
   */
  const isCheckoutCompleted = async (checkoutId: string): Promise<boolean> => {
    const status = await getCheckoutStatus(checkoutId)

    return status?.status === 'completed'
  }

  /**
   * Redirigir al usuario a la página de pago de Recurrente
   */
  const redirectToCheckout = (checkoutUrl: string) => {
    window.location.href = checkoutUrl
  }

  /**
   * Crear checkout y redirigir en un solo paso
   */
  const createAndRedirect = async (
    planName: string,
    amountInCents: number,
    billingPeriod: 'monthly' | 'yearly',
    userId?: string,
    metadata?: Record<string, any>,
  ): Promise<boolean> => {
    const checkout = await createSubscriptionCheckout(
      planName,
      amountInCents,
      billingPeriod,
      userId,
      metadata,
    )

    if (checkout && checkout.checkout_url) {
      redirectToCheckout(checkout.checkout_url)

      return true
    }

    return false
  }

  return {
    // Estado
    isProcessing: readonly(isProcessing),
    error: readonly(error),

    // Métodos
    createSubscriptionCheckout,
    getCheckoutStatus,
    isCheckoutCompleted,
    redirectToCheckout,
    createAndRedirect,
  }
}
