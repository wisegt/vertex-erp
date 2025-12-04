import { getServerSession } from '#auth'
import { getSupabaseAdmin } from '@/server/utils/supabase'

export default defineEventHandler(async (event) => {
  // Obtener sesión del usuario
  const session = await getServerSession(event)
  
  if (!session?.user?.email) {
    console.log('⚠️ subscription/status: No hay sesión o email')
    return {
      success: false,
      data: null,
    }
  }

  // Usar cliente admin para bypass de RLS
  const supabase = getSupabaseAdmin()

  try {
    // Buscar el usuario y su tenant
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, tenant_id, first_name, last_name')
      .eq('email', session.user.email.toLowerCase())
      .maybeSingle()

    if (userError) {
      console.error('Error buscando usuario:', userError)
    }

    if (!user || !user.tenant_id) {
      console.log('⚠️ subscription/status: Usuario no encontrado o sin tenant:', session.user.email)
      return {
        success: true,
        data: null,
      }
    }

    console.log('✅ subscription/status: Usuario encontrado:', user.id, 'Tenant:', user.tenant_id)

    // Buscar la suscripción del tenant
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        id,
        status,
        trial_ends_at,
        current_period_start,
        current_period_end,
        plan_id,
        metadata
      `)
      .eq('tenant_id', user.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subError) {
      console.error('Error buscando suscripción:', subError)
    }

    if (!subscription) {
      console.log('⚠️ subscription/status: No hay suscripción para tenant:', user.tenant_id)
      return {
        success: true,
        data: null,
      }
    }

    console.log('✅ subscription/status: Suscripción encontrada:', subscription.status, 'Trial ends:', subscription.trial_ends_at)

    // Si hay un plan_id, obtener los detalles del plan
    let plan = null
    if (subscription.plan_id) {
      const { data: planData } = await supabase
        .from('plans')
        .select('id, name, code, price, billing_period')
        .eq('id', subscription.plan_id)
        .maybeSingle()
      
      if (planData) {
        plan = {
          id: planData.id,
          name: planData.name,
          code: planData.code,
          price: planData.price,
          billingPeriod: planData.billing_period,
        }
      }
    }

    // Calcular días restantes si está en trial
    let daysRemaining = 0
    const isTrialing = subscription.status === 'trial'
    
    if (isTrialing && subscription.trial_ends_at) {
      const endDate = new Date(subscription.trial_ends_at)
      const today = new Date()
      const diffTime = endDate.getTime() - today.getTime()
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      daysRemaining = Math.max(0, daysRemaining)
    }

    // Determinar el tipo de trial
    const trialType = subscription.metadata?.trial_type || 'full_access'

    const responseData = {
      status: subscription.status,
      isTrialing,
      isFullAccessTrial: isTrialing && !subscription.plan_id,
      trialEndsAt: subscription.trial_ends_at,
      daysRemaining,
      trialType,
      currentPeriodStart: subscription.current_period_start,
      currentPeriodEnd: subscription.current_period_end,
      plan,
      needsPlanSelection: isTrialing && !subscription.plan_id,
    }

    console.log('✅ subscription/status: Respondiendo con:', { isTrialing, daysRemaining })

    return {
      success: true,
      data: responseData,
    }
  }
  catch (error: any) {
    console.error('Error obteniendo subscription status:', error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
})
