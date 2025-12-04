import { getSupabaseAdmin } from '@/server/utils/supabase'

/**
 * ============================================================================
 * ENDPOINT: Webhook de Recurrente
 * ============================================================================
 * Recibe notificaciones de eventos desde Recurrente.
 *
 * Eventos importantes:
 * - checkout.payment_completed: Cuando un pago es completado
 * - subscription.created: Cuando una suscripción es creada
 * - subscription.updated: Cuando una suscripción es actualizada
 * - subscription.cancelled: Cuando una suscripción es cancelada
 * - charge.succeeded: Cuando un cargo es exitoso
 * - charge.failed: Cuando un cargo falla
 *
 * Documentación: https://documenter.getpostman.com/view/10340859/2sA2rFQf5R#785a531d-b59d-4943-b9e8-26119a1aed7c
 */

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)

    // Log del evento recibido
    console.log('[Recurrente Webhook] Evento recibido:', {
      type: body.type,
      id: body.data?.id,
      timestamp: new Date().toISOString(),
    })

    // Manejar diferentes tipos de eventos
    switch (body.type) {
      case 'checkout.payment_completed': {
      // Un checkout fue pagado exitosamente
        const checkoutData = body.data
        const metadata = checkoutData.metadata || {}

        console.log('[Webhook] Pago completado:', {
          checkoutId: checkoutData.id,
          subscriptionId: checkoutData.subscription?.id,
          planCode: metadata.plan_code,
        })

        try {
          const supabase = getSupabaseAdmin()

          // 1. Buscar o crear el tenant con los datos de facturación
          let tenantId: string | null = null

          // Buscar tenant por NIT
          const { data: existingTenant } = await supabase
            .from('tenants')
            .select('id')
            .eq('tax_id', metadata.nit)
            .maybeSingle()

          if (existingTenant) {
            tenantId = existingTenant.id
            console.log('[Webhook] Tenant existente encontrado:', tenantId)

            // Actualizar datos de facturación del tenant
            await supabase
              .from('tenants')
              .update({
                legal_name: metadata.business_name,
                email: metadata.email,
                phone: metadata.phone,
                fiscal_address: metadata.address,
                status: 'activa', // Asegurar que esté activa
                updated_at: new Date().toISOString(),
              })
              .eq('id', tenantId)
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

            if (tenantError) {
              console.error('[Webhook] Error creando tenant:', tenantError)
              throw tenantError
            }

            tenantId = newTenant.id
            console.log('[Webhook] ✅ Nuevo tenant creado:', tenantId)
          }

          if (!tenantId)
          throw new Error('No se pudo obtener o crear el tenant')

          // 2. Buscar el plan por code y billing_period (mapear a español)
          const billingPeriodMap: Record<string, string> = {
            'monthly': 'mensual',
            'yearly': 'anual',
            'quarterly': 'trimestral',
          }
          
          const billingPeriodES = billingPeriodMap[metadata.billing_period] || metadata.billing_period
          
          // Construir el código correcto (anuales tienen sufijo 'anual')
          const planCode = billingPeriodES === 'anual' 
            ? `${metadata.plan_code}anual` 
            : metadata.plan_code
          
          const { data: plan, error: planError } = await supabase
            .from('plans')
            .select('id')
            .eq('code', planCode)
            .eq('billing_period', billingPeriodES)
            .eq('is_active', true)
            .maybeSingle()

          if (planError)
            console.error('[Webhook] Error buscando plan:', planError)

          if (!plan)
            console.warn('[Webhook] Plan no encontrado, creando suscripción sin plan_id')

          // 3. Crear la suscripción
          const { data: newSubscription, error: subError } = await supabase
            .from('subscriptions')
            .insert({
              tenant_id: tenantId,
              plan_id: plan?.id || null,

              // Gateway info (Recurrente)
              gateway_provider: 'recurrente',
              gateway_subscription_id: checkoutData.subscription?.id,
              gateway_customer_id: checkoutData.customer?.id,

              // Estado y fechas
              status: 'active',
              current_period_start: checkoutData.subscription?.current_period_start || new Date().toISOString(),
              current_period_end: checkoutData.subscription?.current_period_end || new Date().toISOString(),
              started_at: new Date().toISOString(),

              // Método de pago
              payment_method: checkoutData.payment_method?.type || 'card',
              auto_renew: true,

              // Metadata
              metadata: {
                ...metadata,
                checkout_id: checkoutData.id,
                payment_method_id: checkoutData.payment_method?.id,
              },
            })
            .select('id')
            .single()

          if (subError) {
            console.error('[Webhook] Error creando suscripción:', subError)
            throw subError
          }

          console.log('[Webhook] ✅ Suscripción creada:', newSubscription.id)

          // 4. Calcular montos del pago
          const amount = checkoutData.amount || checkoutData.total_amount || 0
          const discountAmount = checkoutData.discount_amount || 0
          const taxAmount = checkoutData.tax_amount || 0
          const totalAmount = checkoutData.total_amount || amount

          // 5. Crear registro de pago en subscription_payments
          const { data: payment, error: paymentError } = await supabase
            .from('subscription_payments')
            .insert({
              subscription_id: newSubscription.id,
              tenant_id: tenantId,

              // Período
              period_start: checkoutData.subscription?.current_period_start || new Date().toISOString(),
              period_end: checkoutData.subscription?.current_period_end || new Date().toISOString(),

              // Montos
              amount: amount / 100, // Recurrente envía en centavos
              discount_amount: discountAmount / 100,
              tax_amount: taxAmount / 100,
              total_amount: totalAmount / 100,
              currency: checkoutData.currency || 'GTQ',

              // Estado y método
              status: 'completed',
              payment_method: checkoutData.payment_method?.type || 'card',

              // Gateway info
              gateway_provider: 'recurrente',
              gateway_payment_id: checkoutData.id,
              gateway_invoice_id: checkoutData.invoice_id || null,

              // Fechas
              paid_at: new Date().toISOString(),
              due_date: new Date(checkoutData.subscription?.current_period_end || new Date()).toISOString().split('T')[0],

              // Metadata
              notes: `Pago inicial de suscripción - Plan ${metadata.plan_code} ${metadata.billing_period}`,
            })
            .select('id')
            .single()

          if (paymentError)
          console.error('[Webhook] Error creando pago:', paymentError)

          // No lanzar error, la suscripción ya está creada
        else
          console.log('[Webhook] ✅ Pago registrado:', payment.id)

          // 6. Actualizar plan con IDs de gateway si no los tiene
          if (plan && !plan.gateway_product_id) {
            await supabase
              .from('plans')
              .update({
                gateway_provider: 'recurrente',
                gateway_product_id: checkoutData.product_id || null,
                gateway_price_id: checkoutData.price_id || null,
                gateway_synced_at: new Date().toISOString(),
              })
              .eq('id', plan.id)
          }

          console.log('[Webhook] ✅ Proceso completo finalizado')
        }
        catch (error: any) {
          console.error('[Webhook] Error procesando pago:', error)

        // TODO: Enviar notificación de error
        }

        break
      }

      case 'subscription.created': {
      // Una suscripción fue creada
        const subscriptionData = body.data

        console.log('[Webhook] Suscripción creada:', subscriptionData)

        // TODO: Actualizar estado de suscripción en base de datos

        break
      }

      case 'subscription.updated': {
      // Una suscripción fue actualizada
        const subscriptionData = body.data

        console.log('[Webhook] Suscripción actualizada:', subscriptionData)

        // TODO: Sincronizar cambios de suscripción

        break
      }

      case 'subscription.cancelled': {
      // Una suscripción fue cancelada
        const subscriptionData = body.data

        console.log('[Webhook] Suscripción cancelada:', subscriptionData)

        // TODO: Desactivar acceso del usuario

        break
      }

      case 'charge.succeeded': {
      // Un cargo fue exitoso (pago recurrente)
        const chargeData = body.data

        console.log('[Webhook] Cargo exitoso:', chargeData)

        // TODO: Registrar pago en historial

        break
      }

      case 'charge.failed': {
      // Un cargo falló
        const chargeData = body.data

        console.log('[Webhook] Cargo fallido:', chargeData)

        // TODO: Notificar al usuario sobre el pago fallido

        break
      }

      default:
        console.log('[Webhook] Evento no manejado:', body.type)
    }

    // Responder con éxito a Recurrente
    return {
      success: true,
      message: 'Webhook procesado correctamente',
    }
  }
  catch (error: any) {
    console.error('[Recurrente Webhook] Error:', error)

    // Importante: Siempre responder 200 OK para que Recurrente no reintente
    return {
      success: false,
      message: 'Error procesando webhook',
      error: error.message,
    }
  }
})
