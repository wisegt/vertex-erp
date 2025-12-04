/**
 * API para actualizar configuración de billing
 * POST /api/billing/settings
 * 
 * Body: { key: string, value: object }
 * 
 * Ejemplo:
 * {
 *   "key": "annual_discount",
 *   "value": { "percentage": 25, "months_free": 3, "label": "−25%", "promo_text": "¡25% de descuento!" }
 * }
 */
import { getSupabaseAdmin } from '@/server/utils/supabase'

const VALID_KEYS = ['annual_discount', 'trial_period', 'tax_rate', 'currency']

export default defineEventHandler(async (event) => {
  // Solo permitir en desarrollo o con autenticación de admin
  // TODO: Agregar verificación de permisos de admin
  
  const body = await readBody(event)
  
  if (!body.key || !body.value) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Se requiere key y value',
    })
  }

  if (!VALID_KEYS.includes(body.key)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Key inválida. Keys válidas: ${VALID_KEYS.join(', ')}`,
    })
  }

  const supabase = getSupabaseAdmin()

  try {
    const { data, error } = await supabase
      .from('billing_settings')
      .update({ 
        value: body.value,
        updated_at: new Date().toISOString(),
      })
      .eq('key', body.key)
      .select()
      .single()

    if (error) {
      console.error('Error updating billing settings:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al actualizar configuración',
      })
    }

    return {
      success: true,
      message: `Configuración '${body.key}' actualizada`,
      data,
    }
  }
  catch (error: any) {
    console.error('Error en POST /api/billing/settings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor',
    })
  }
})
