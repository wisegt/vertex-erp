import { getSupabaseAdmin } from '@/server/utils/supabase'
import bcrypt from 'bcryptjs'

/**
 * ============================================================================
 * ENDPOINT: Completar Setup de Cuenta
 * ============================================================================
 * Crea el usuario con su contraseña y lo vincula al tenant
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, email, firstName, lastName, password } = body
    
    if (!token || !email || !firstName || !lastName || !password) {
      return {
        success: false,
        message: 'Todos los campos son requeridos',
      }
    }
    
    if (password.length < 8) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 8 caracteres',
      }
    }
    
    const supabase = getSupabaseAdmin()
    
    // 1. Verificar token
    const { data: tokenData, error: tokenError } = await supabase
      .from('account_setup_tokens')
      .select('*')
      .eq('token', token)
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .maybeSingle()
    
    if (tokenError || !tokenData) {
      return {
        success: false,
        message: 'Token inválido',
      }
    }
    
    // Verificar expiración
    const expiresAt = new Date(tokenData.expires_at)
    if (new Date() > expiresAt) {
      return {
        success: false,
        message: 'El enlace ha expirado',
      }
    }
    
    // 2. Buscar el tenant creado con este checkout
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('tenant_id, metadata')
      .eq('metadata->>checkout_id', tokenData.checkout_id)
      .maybeSingle()
    
    if (!subscription || !subscription.tenant_id) {
      return {
        success: false,
        message: 'No se encontró la suscripción asociada',
      }
    }
    
    // 3. Verificar si ya existe un usuario con este email
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle()
    
    if (existingUser) {
      // Usuario ya existe, solo actualizar su tenant y password
      const passwordHash = await bcrypt.hash(password, 10)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          tenant_id: subscription.tenant_id,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          status: 'activo', // Valor en español según constraint
          email_verified: true,
          email_verified_at: new Date().toISOString(),
        })
        .eq('id', existingUser.id)
      
      if (updateError) {
        console.error('[Complete Setup] Error actualizando usuario:', updateError)
        return {
          success: false,
          message: 'Error al actualizar la cuenta',
        }
      }
    }
    else {
      // Crear nuevo usuario
      const passwordHash = await bcrypt.hash(password, 10)
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase(),
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          tenant_id: subscription.tenant_id,
          status: 'activo', // Valor en español según constraint
          email_verified: true,
          email_verified_at: new Date().toISOString(),
        })
      
      if (insertError) {
        console.error('[Complete Setup] Error creando usuario:', insertError)
        return {
          success: false,
          message: 'Error al crear la cuenta',
        }
      }
    }
    
    // 4. Marcar token como usado
    await supabase
      .from('account_setup_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', tokenData.id)
    
    console.log('✅ [Complete Setup] Usuario creado/actualizado:', email)
    
    // Obtener información de la suscripción para devolver
    const { data: subscriptionInfo } = await supabase
      .from('subscriptions')
      .select(`
        metadata,
        plan:plans(name, code, billing_period)
      `)
      .eq('tenant_id', subscription.tenant_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    const plan = subscriptionInfo?.plan || {}
    const metadata = subscriptionInfo?.metadata || {}
    
    return {
      success: true,
      message: 'Cuenta creada exitosamente',
      businessName: metadata.business_name || '',
      planCode: plan.code || '',
      planName: plan.name || '',
      billingPeriod: plan.billing_period || '',
    }
  }
  catch (error: any) {
    console.error('[Complete Setup] Error:', error)
    return {
      success: false,
      message: error.message || 'Error al crear la cuenta',
    }
  }
})

