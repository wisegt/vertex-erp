/**
 * ============================================================================
 * ENDPOINT: Obtener Suscripción Actual
 * ============================================================================
 * Devuelve la información de la suscripción activa del usuario/tenant
 * para mostrar en el dashboard de Billing & Plans
 */

export default defineEventHandler(async (event) => {
  try {
    // TODO: Obtener el usuario autenticado
    // const session = await getServerSession(event)
    // if (!session?.user?.id) {
    //   return { success: false, message: 'No autenticado' }
    // }

    const supabase = serverSupabaseClient(event)
    
    // TODO: Reemplazar con el ID real del usuario/tenant
    // Por ahora, obtener la suscripción más reciente
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error) {
      console.error('[Subscription Current] Error:', error)
      return {
        success: false,
        message: 'Error al obtener suscripción',
        error: error.message,
      }
    }
    
    if (!data) {
      return {
        success: false,
        message: 'No se encontró suscripción activa',
      }
    }
    
    // Formatear la respuesta
    return {
      success: true,
      data: {
        // IDs
        id: data.id,
        recurrenteSubscriptionId: data.recurrente_subscription_id,
        recurrentePaymentMethodId: data.recurrente_payment_method_id,
        
        // Plan actual
        planCode: data.plan_code,
        planType: data.plan_type,
        billingPeriod: data.billing_period,
        status: data.status,
        
        // Fechas
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        trialEndsAt: data.trial_ends_at,
        cancelledAt: data.cancelled_at,
        
        // Datos de facturación
        businessName: data.business_name,
        nit: data.nit,
        email: data.email,
        phone: data.phone,
        phoneCode: data.phone_code || '+502',
        address: data.address,
        
        // Información de la tarjeta (solo últimos 4 dígitos)
        cardBrand: data.card_brand,
        cardLast4: data.card_last4,
        cardExpMonth: data.card_exp_month,
        cardExpYear: data.card_exp_year,
        
        // Metadata
        metadata: data.metadata,
        
        // Timestamps
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    }
  }
  catch (error: any) {
    console.error('[Subscription Current] Error:', error)
    return {
      success: false,
      message: error.message || 'Error al obtener suscripción',
    }
  }
})

