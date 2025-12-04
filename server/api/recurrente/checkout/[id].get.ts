/**
 * ============================================================================
 * ENDPOINT: Obtener estado de Checkout de Recurrente
 * ============================================================================
 * Consulta el estado de un checkout específico.
 * 
 * Método: GET
 * Params: id (checkout ID)
 * 
 * Documentación: https://documenter.getpostman.com/view/10340859/2sA2rFQf5R
 */

export default defineEventHandler(async (event) => {
  try {
    const checkoutId = getRouterParam(event, 'id')
    const config = useRuntimeConfig()

    if (!checkoutId) {
      return {
        success: false,
        message: 'ID de checkout no proporcionado',
      }
    }

    // Validar credenciales
    if (!config.recurrentePublicKey || !config.recurrenteSecretKey) {
      return {
        success: false,
        message: 'Las credenciales de Recurrente no están configuradas',
      }
    }

    // Headers de autenticación
    const headers = {
      'X-PUBLIC-KEY': config.recurrentePublicKey,
      'X-SECRET-KEY': config.recurrenteSecretKey,
    }

    // Consultar el checkout
    const response = await $fetch(`https://app.recurrente.com/api/checkouts/${checkoutId}`, {
      method: 'GET',
      headers,
    })

    return {
      success: true,
      data: response,
    }
  } catch (error: any) {
    console.error('[Recurrente] Error getting checkout:', error)
    
    return {
      success: false,
      message: error.message || 'Error al obtener el estado del checkout',
      error: error.data || error,
    }
  }
})

