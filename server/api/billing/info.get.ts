import { getServerSession } from '#auth'
import { getSupabaseAdmin } from '@/server/utils/supabase'

/**
 * ============================================================================
 * ENDPOINT: Información de Facturación y Plan
 * ============================================================================
 * Devuelve la información completa de facturación y suscripción
 * para mostrar en Account Settings -> Billing & Plans
 */

export default defineEventHandler(async (event) => {
  try {
    // Obtener sesión del usuario
    const session = await getServerSession(event)
    
    if (!session?.user?.email) {
      return {
        success: false,
        message: 'No autenticado',
      }
    }
    
    const supabase = getSupabaseAdmin()
    
    // Buscar el usuario y su tenant
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, tenant_id, is_super_admin')
      .eq('email', session.user.email.toLowerCase())
      .maybeSingle()
    
    if (userError || !user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      }
    }
    
    // Si no tiene tenant asignado y NO es super admin, devolver trial
    if (!user.tenant_id && !user.is_super_admin) {
      return {
        success: true,
        data: {
          tenant: {
            id: null,
            name: 'Mi Empresa',
            legalName: '',
            taxId: '',
            email: session.user.email,
            phone: '',
            fiscalAddress: '',
          },
          plan: {
            id: null,
            name: 'Prueba Gratis',
            code: 'trial',
            price: 0,
            billingPeriod: 'trial',
            planType: 'empresa',
          },
          subscription: {
            status: 'trial',
            currentPeriodEnd: '',
            trialEndsAt: '',
          },
        },
      }
    }
    
    // Super admins no deberían ver datos de billing
    if (user.is_super_admin) {
      return {
        success: false,
        message: 'Super admins no tienen datos de facturación',
      }
    }
    
    if (!user.tenant_id) {
      return {
        success: false,
        message: 'Usuario sin tenant asignado',
      }
    }
    
    // Obtener la suscripción activa del tenant
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select(`
        *,
        plan:plans(*),
        tenant:tenants(*)
      `)
      .eq('tenant_id', user.tenant_id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    if (error) {
      console.error('[Billing Info] Error:', error)
    }
    
    // Si no hay suscripción, obtener datos del tenant y devolver trial
    if (!subscription) {
      const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.tenant_id)
        .maybeSingle()
      
      return {
        success: true,
        data: {
          tenant: {
            id: tenant?.id || null,
            name: tenant?.name || 'Mi Empresa',
            legalName: tenant?.legal_name || '',
            taxId: tenant?.tax_id || '',
            email: tenant?.email || '',
            phone: tenant?.phone || '',
            fiscalAddress: tenant?.fiscal_address || '',
          },
          plan: {
            id: null,
            name: 'Prueba Gratis',
            code: 'trial',
            price: 0,
            billingPeriod: 'trial',
            planType: tenant?.business_type === 'firm' ? 'contador' : 'empresa',
          },
          subscription: {
            status: 'trial',
            currentPeriodEnd: '',
            trialEndsAt: '',
          },
        },
      }
    }
    
    // Obtener datos del tenant
    const tenant = subscription.tenant || {}
    const plan = subscription.plan || {}
    
    // Formatear respuesta con datos reales
    return {
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name || '',
          legalName: tenant.legal_name || '',
          taxId: tenant.tax_id || '',
          email: tenant.email || '',
          phone: tenant.phone || '',
          fiscalAddress: tenant.fiscal_address || '',
        },
        plan: {
          id: plan.id || subscription.plan_id,
          name: plan.name || 'Plan',
          code: plan.code || '',
          price: plan.price || 0,
          billingPeriod: plan.billing_period || subscription.billing_period || 'monthly',
          planType: plan.plan_type || 'empresa',
        },
        subscription: {
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          trialEndsAt: subscription.trial_ends_at,
          cancelledAt: subscription.cancelled_at,
          
          // Información de gateway
          gatewayProvider: subscription.gateway_provider,
          gatewaySubscriptionId: subscription.gateway_subscription_id,
          gatewayCustomerId: subscription.gateway_customer_id,
          
          // Método de pago
          paymentMethod: subscription.payment_method,
          autoRenew: subscription.auto_renew,
        },
      },
    }
  }
  catch (error: any) {
    console.error('[Billing Info] Error:', error)
    return {
      success: false,
      message: error.message || 'Error al obtener información de facturación',
    }
  }
})

