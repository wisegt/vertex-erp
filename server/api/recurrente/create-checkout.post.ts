/**
 * ============================================================================
 * ENDPOINT: Crear Checkout de Recurrente
 * ============================================================================
 * Crea una sesión de checkout en Recurrente para procesar pagos con tarjeta.
 *
 * Método: POST
 * Body: { items, success_url, cancel_url, user_id, metadata }
 *
 * Documentación: https://documenter.getpostman.com/view/10340859/2sA2rFQf5R
 */

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const config = useRuntimeConfig()

    // Validar que existan las credenciales de Recurrente
    if (!config.recurrentePublicKey || !config.recurrenteSecretKey) {
      return {
        success: false,
        message: 'Las credenciales de Recurrente no están configuradas',
      }
    }

    console.log('[Recurrente] Creando checkout con datos:', {
      items: body.items,
      has_metadata: !!body.metadata,
    })

    // Preparar el payload según la documentación de Recurrente
    const payload: any = {
      items: body.items.map((item: any) => {
        const mappedItem: any = {
          name: item.name,
          currency: item.currency,
          amount_in_cents: item.amount_in_cents,
        }

        // Para suscripciones, agregar campos de recurrencia (SIN quantity)
        if (item.charge_type === 'recurring') {
          mappedItem.charge_type = item.charge_type
          mappedItem.billing_interval = item.billing_interval
          mappedItem.billing_interval_count = item.billing_interval_count
        }
        else if (item.quantity) {
          // Para pagos únicos, agregar quantity
          mappedItem.quantity = item.quantity
        }

        if (item.image_url)
          mappedItem.image_url = item.image_url

        return mappedItem
      }),
    }

    // Agregar campos opcionales solo si existen
    if (body.success_url)
      payload.success_url = body.success_url
    if (body.cancel_url)
      payload.cancel_url = body.cancel_url
    if (body.user_id)
      payload.user_id = body.user_id
    if (body.metadata)
      payload.metadata = body.metadata
    if (body.expires_at)
      payload.expires_at = body.expires_at

    console.log('[Recurrente] Payload final:', JSON.stringify(payload, null, 2))

    // Llamar a la API de Recurrente
    const response = await $fetch('https://app.recurrente.com/api/checkouts/', {
      method: 'POST',
      headers: {
        'X-PUBLIC-KEY': config.recurrentePublicKey,
        'X-SECRET-KEY': config.recurrenteSecretKey,
        'Content-Type': 'application/json',
      },
      body: payload,
    })

    console.log('[Recurrente] Respuesta exitosa:', response)

    return {
      success: true,
      data: response,
    }
  }
  catch (error: any) {
    console.error('[Recurrente] Error creating checkout:', error)
    console.error('[Recurrente] Error data:', error.data)
    console.error('[Recurrente] Error response:', error.response)

    // Extraer el mensaje de error detallado de Recurrente
    const errorMessage = error.data?.data?.message || error.data?.message || error.message || 'Error al crear el checkout en Recurrente'
    const errorDetails = error.data?.data || error.data || error

    return {
      success: false,
      message: errorMessage,
      error: errorDetails,
    }
  }
})
