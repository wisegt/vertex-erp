import { getServerSession } from '#auth'
import { getSupabaseAdmin } from '@/server/utils/supabase'

/**
 * ============================================================================
 * ENDPOINT: Crear Suscripción desde Checkout
 * ============================================================================
 * Crea la suscripción inmediatamente después del pago exitoso
 * Sin esperar el webhook (útil en localhost o como backup)
 */

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { checkoutId } = body

    if (!checkoutId) {
      return {
        success: false,
        message: 'checkoutId es requerido',
      }
    }

    console.log('[Create Subscription] Iniciando con checkout:', checkoutId)

    // Obtener los datos del checkout desde Recurrente
    const config = useRuntimeConfig()

    const checkoutData = await $fetch(`https://app.recurrente.com/api/checkouts/${checkoutId}`, {
      method: 'GET',
      headers: {
        'X-PUBLIC-KEY': config.recurrentePublicKey,
        'X-SECRET-KEY': config.recurrenteSecretKey,
      },
    })

    console.log('[Create Subscription] Datos del checkout obtenidos:', checkoutData)

    // Extraer metadata del checkout
    const metadata = (checkoutData as any).metadata || {}

    if (!metadata.nit || !metadata.email) {
      return {
        success: false,
        message: 'El checkout no tiene metadata completo',
      }
    }

    // Obtener sesión si existe (puede ser un usuario no autenticado)
    const session = await getServerSession(event)
    const isAuthenticated = !!session?.user?.email

    const supabase = getSupabaseAdmin()

    let tenantId: string | null = null

    // 1. Si está autenticado, buscar su usuario y tenant
    if (isAuthenticated) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, tenant_id')
        .eq('email', session.user.email.toLowerCase())
        .maybeSingle()

      if (user && !userError)
        tenantId = user.tenant_id
    }

    // 2. Si no tiene tenant, buscar o crear con los datos de facturación
    if (!tenantId) {
      // Buscar tenant por NIT
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id')
        .eq('tax_id', metadata.nit)
        .maybeSingle()

      if (existingTenant) {
        tenantId = existingTenant.id

        // Actualizar datos del tenant existente
        await supabase
          .from('tenants')
          .update({
            legal_name: metadata.business_name,
            email: metadata.email,
            phone: metadata.phone,
            fiscal_address: metadata.address,
            status: 'activa',
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId)

        // Vincular usuario al tenant solo si está autenticado
        if (isAuthenticated && session.user.email) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email.toLowerCase())
            .maybeSingle()

          if (existingUser) {
            await supabase
              .from('users')
              .update({ tenant_id: tenantId })
              .eq('id', existingUser.id)
          }
        }
      }
      else {
        // Crear nuevo tenant
        const { data: newTenant, error: tenantError } = await supabase
          .from('tenants')
          .insert({
            name: metadata.business_name,
            legal_name: metadata.business_name,
            tax_id: metadata.nit,
            business_type: metadata.plan_type === 'contador' ? 'contador' : 'empresa', // Valores correctos según constraint
            email: metadata.email,
            phone: metadata.phone,
            fiscal_address: metadata.address,
            status: 'activa', // Valor correcto según constraint
            is_active: true,
          })
          .select('id')
          .single()

        if (tenantError || !newTenant) {
          console.error('[Create Subscription] Error creando tenant:', tenantError)

          return {
            success: false,
            message: 'Error creando tenant',
          }
        }

        tenantId = newTenant.id

        // Vincular usuario al tenant solo si está autenticado
        if (isAuthenticated && session.user.email) {
          const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', session.user.email.toLowerCase())
            .maybeSingle()

          if (existingUser) {
            await supabase
              .from('users')
              .update({ tenant_id: tenantId })
              .eq('id', existingUser.id)
          }
        }
      }
    }

    console.log('[Create Subscription] Tenant ID:', tenantId)

    // 3. Verificar si ya existe una suscripción activa
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('tenant_id', tenantId)
      .in('status', ['active', 'trialing', 'past_due'])
      .maybeSingle()

    if (existingSub) {
      console.log('[Create Subscription] Ya existe suscripción activa:', existingSub.id)

      return {
        success: false,
        message: 'Ya existe una suscripción activa para este tenant',
        subscriptionId: existingSub.id,
      }
    }

    // 4. Buscar el plan (construir código correcto según billing_period)
    const billingPeriodMap: Record<string, string> = {
      'monthly': 'mensual',
      'yearly': 'anual',
      'quarterly': 'trimestral',
    }
    
    const billingPeriodES = billingPeriodMap[metadata.billing_period] || metadata.billing_period
    
    // Construir el código del plan según el período
    // Mensuales: starter, business, enterprise
    // Anuales: starteranual, businessanual, enterpriseanual
    const planCode = billingPeriodES === 'anual' 
      ? `${metadata.plan_code}anual` 
      : metadata.plan_code
    
    console.log('[Create Subscription] Buscando plan:', {
      code: planCode,
      billing_period: billingPeriodES,
    })
    
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id, name, code, billing_period')
      .eq('code', planCode)
      .eq('billing_period', billingPeriodES)
      .eq('is_active', true)
      .maybeSingle()

    if (planError) {
      console.error('[Create Subscription] Error buscando plan:', planError)
    }

    if (!plan) {
      console.warn('[Create Subscription] Plan no encontrado con:', {
        code: planCode,
        billing_period: billingPeriodES,
      })
      console.warn('[Create Subscription] Creando suscripción sin plan_id')
    }
    else {
      console.log('[Create Subscription] ✅ Plan encontrado:', plan.name)
    }

    // 5. Calcular fechas
    const now = new Date()
    const periodEnd = new Date(now)
    if (metadata.billing_period === 'yearly')
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)

    else
      periodEnd.setMonth(periodEnd.getMonth() + 1)

    // 6. Crear la suscripción
    const { data: newSub, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        tenant_id: tenantId,
        plan_id: plan?.id || null,
        gateway_provider: 'recurrente',
        gateway_subscription_id: `pending_${checkoutId}`,
        gateway_customer_id: null,
        status: 'active',
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        started_at: now.toISOString(),
        payment_method: 'card',
        auto_renew: true,
        metadata: {
          ...metadata,
          checkout_id: checkoutId,
          created_from: 'direct_checkout',
        },
      })
      .select('id')
      .single()

    if (subError || !newSub) {
      console.error('[Create Subscription] Error creando suscripción:', subError)

      return {
        success: false,
        message: 'Error creando suscripción',
        error: subError,
      }
    }

    console.log('[Create Subscription] ✅ Suscripción creada:', newSub.id)

    return {
      success: true,
      message: 'Suscripción creada exitosamente',
      subscriptionId: newSub.id,
      email: metadata.email,
      businessName: metadata.business_name,
    }
  }
  catch (error: any) {
    console.error('[Create Subscription] Error:', error)

    return {
      success: false,
      message: error.message || 'Error creando suscripción',
    }
  }
})
