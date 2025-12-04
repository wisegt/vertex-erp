import { getSupabaseAdmin } from '@/server/utils/supabase'

/**
 * ============================================================================
 * ENDPOINT: Verificar Token de Setup
 * ============================================================================
 * Verifica que el token sea válido y no haya expirado
 */

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, email } = body
    
    if (!token || !email) {
      return {
        success: false,
        message: 'Token y email son requeridos',
      }
    }
    
    const supabase = getSupabaseAdmin()
    
    // Buscar el token
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
    
    // Verificar que no haya expirado
    const expiresAt = new Date(tokenData.expires_at)
    const now = new Date()
    
    if (now > expiresAt) {
      return {
        success: false,
        message: 'El enlace ha expirado. Por favor, solicita uno nuevo.',
      }
    }
    
    return {
      success: true,
      message: 'Token válido',
    }
  }
  catch (error: any) {
    console.error('[Verify Setup Token] Error:', error)
    return {
      success: false,
      message: error.message || 'Error al verificar token',
    }
  }
})

