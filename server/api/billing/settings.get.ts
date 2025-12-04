import { getSupabaseAdmin } from '@/server/utils/supabase'

export default defineEventHandler(async () => {
  const supabase = getSupabaseAdmin()

  try {
    const { data: settings, error } = await supabase
      .from('billing_settings')
      .select('key, value')

    if (error) {
      console.error('Error fetching billing settings:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al obtener configuración de facturación',
      })
    }

    // Transformar array a objeto para fácil acceso
    const settingsMap = (settings || []).reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {} as Record<string, any>)

    return {
      success: true,
      data: {
        annualDiscount: settingsMap.annual_discount || { percentage: 17, months_free: 2, label: '−17%' },
        trialPeriod: settingsMap.trial_period || { days: 14, requires_card: false },
        taxRate: settingsMap.tax_rate || { percentage: 12, name: 'IVA' },
        currency: settingsMap.currency || { code: 'GTQ', symbol: 'Q', name: 'Quetzales' },
      },
    }
  }
  catch (error: any) {
    console.error('Error en /api/billing/settings:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor',
    })
  }
})
