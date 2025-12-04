import { getSupabaseAdmin } from '@/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const planType = query.type as string | undefined // 'empresa' | 'contador' | undefined (all)

  // Usa getSupabaseAdmin que ya está configurado para el esquema 'core'
  const supabase = getSupabaseAdmin()

  try {
    let queryBuilder = supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (planType) {
      queryBuilder = queryBuilder.eq('plan_type', planType)
    }

    const { data: plans, error } = await queryBuilder

    if (error) {
      console.error('Error fetching plans:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al obtener los planes',
      })
    }

    // Transformar los datos para el frontend
    const transformedPlans = (plans || []).map(plan => ({
      id: plan.id,
      name: plan.name,
      code: plan.code,
      planType: plan.plan_type,
      description: plan.description,
      price: parseFloat(plan.price),
      yearlyPrice: plan.yearly_price ? parseFloat(plan.yearly_price) : Math.round(parseFloat(plan.price) * 10), // 10 meses = año
      billingPeriod: plan.billing_period,
      features: plan.features || [],
      limits: plan.limits || {},
      displayOrder: plan.display_order,
      isPopular: plan.is_popular || false,
      buttonText: plan.button_text || 'Seleccionar',
      icon: plan.icon || 'ri-building-line',
      iconColor: plan.icon_color || 'primary',
    }))

    return {
      success: true,
      data: transformedPlans,
    }
  }
  catch (error: any) {
    console.error('Error en /api/plans:', error)
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor',
    })
  }
})
