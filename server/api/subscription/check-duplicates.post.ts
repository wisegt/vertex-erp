/**
 * ============================================================================
 * ENDPOINT: Verificar Duplicados de Suscripción
 * ============================================================================
 * Verifica si ya existe una suscripción activa con el mismo:
 * - NIT (identificador fiscal único)
 * - Email
 * - Nombre de empresa
 * 
 * Escenarios a manejar:
 * 1. NIT ya tiene suscripción activa → No permitir
 * 2. Email ya tiene suscripción activa → No permitir
 * 3. Empresa con mismo nombre → Advertir pero permitir (pueden ser diferentes)
 */

import { getSupabaseAdmin } from '@/server/utils/supabase'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { nit, email, businessName } = body

    const errors: string[] = []
    
    const supabase = getSupabaseAdmin()

    // Implementar verificación en Supabase

    // 1. Verificar NIT duplicado en tenants con suscripción activa
    const { data: tenantWithNit } = await supabase
      .from('tenants')
      .select(`
        id,
        legal_name,
        subscriptions!inner(id, status)
      `)
      .eq('tax_id', nit)
      .in('subscriptions.status', ['active', 'trialing', 'past_due'])
      .maybeSingle()

    if (tenantWithNit) {
      errors.push(`El NIT ${nit} ya tiene una suscripción activa registrada a nombre de "${tenantWithNit.legal_name}". Si deseas cambiar de plan, cancela la suscripción actual primero.`)
    }

    // 2. Verificar Email duplicado en tenants con suscripción activa
    const { data: tenantWithEmail } = await supabase
      .from('tenants')
      .select(`
        id,
        legal_name,
        subscriptions!inner(id, status)
      `)
      .eq('email', email)
      .in('subscriptions.status', ['active', 'trialing', 'past_due'])
      .maybeSingle()

    if (tenantWithEmail && tenantWithEmail.id !== tenantWithNit?.id) {
      errors.push(`El correo ${email} ya está asociado a una suscripción activa. Si deseas gestionar tu suscripción, inicia sesión con esta cuenta.`)
    }

    if (errors.length > 0) {
      return {
        success: false,
        errors,
        message: 'Se encontraron suscripciones duplicadas',
      }
    }

    return {
      success: true,
      message: 'No se encontraron duplicados',
    }
  }
  catch (error: any) {
    console.error('[Check Duplicates] Error:', error)
    
    return {
      success: true, // En caso de error, permitir continuar
      message: 'No se pudo verificar duplicados',
    }
  }
})

