import { Resend } from 'resend'
import { getSupabaseAdmin } from '@/server/utils/supabase'

/**
 * ============================================================================
 * ENDPOINT: Enviar Email para Configurar Cuenta
 * ============================================================================
 * Envía un correo electrónico al cliente después de completar el pago
 * con un enlace para crear su usuario y contraseña
 */

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { email, businessName, checkoutId } = body

    if (!email || !checkoutId) {
      return {
        success: false,
        message: 'Email y checkoutId son requeridos',
      }
    }

    // Usar cliente admin con esquema core
    const supabase = getSupabaseAdmin()

    console.log('📧 [Send Setup Email] Iniciando para:', email)
    console.log('📧 [Send Setup Email] Empresa:', businessName)
    console.log('📧 [Send Setup Email] Checkout:', checkoutId)

    // Generar token único para el setup
    const setupToken = `setup_${checkoutId}_${Date.now()}`
    const expiresAt = new Date()

    expiresAt.setHours(expiresAt.getHours() + 24) // Expira en 24 horas

    // Guardar token en la base de datos (esquema core)
    console.log('💾 [Send Setup Email] Guardando token en BD...')

    const { data: tokenData, error: tokenError } = await supabase
      .from('account_setup_tokens')
      .insert({
        email: email.toLowerCase(),
        token: setupToken,
        checkout_id: checkoutId,
        expires_at: expiresAt.toISOString(),
        used: false,
      })
      .select()
      .single()

    if (tokenError) {
      console.error('[Send Setup Email] Error guardando token:', tokenError)
      console.error('[Send Setup Email] Error details:', JSON.stringify(tokenError, null, 2))

      return {
        success: false,
        message: 'Error al generar token',
        error: tokenError,
      }
    }

    console.log('✅ [Send Setup Email] Token guardado:', tokenData?.id)

    // URL para configurar la cuenta
    const config = useRuntimeConfig()
    const baseUrl = config.public.siteUrl || 'http://localhost:3000'
    const setupUrl = `${baseUrl}/setup-account?token=${setupToken}&email=${encodeURIComponent(email)}`

    // Inicializar Resend
    const resendApiKey = config.resendApiKey

    // Si NO hay API key, solo registrar en consola (desarrollo)
    if (!resendApiKey) {
      console.log('⚠️ [Send Setup Email] RESEND_API_KEY no configurada')
      console.log('📧 [Send Setup Email] URL para configurar cuenta:', setupUrl)
      console.log('📧 [Send Setup Email] Empresa:', businessName)
      console.log('📧 [Send Setup Email] Email:', email)

      return {
        success: true,
        message: 'Email no enviado (modo desarrollo)',
        setupUrl, // Devolver URL para desarrollo
      }
    }

    // Enviar email con Resend
    const resend = new Resend(resendApiKey)

    try {
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'VERTEX ERP <noreply@vertexerp.app>', // Cambiar por tu dominio verificado
        to: [email],
        subject: '¡Bienvenido a VERTEX! Configura tu cuenta',
        html: getEmailTemplate(businessName, setupUrl),
      })

      if (emailError) {
        console.error('[Send Setup Email] Error de Resend:', emailError)

        return {
          success: false,
          message: 'Error al enviar email',
          error: emailError,
        }
      }

      console.log('✅ [Send Setup Email] Email enviado:', emailData?.id)

      return {
        success: true,
        message: 'Email enviado exitosamente',
        emailId: emailData?.id,
      }
    }
    catch (emailError: any) {
      console.error('[Send Setup Email] Error enviando email:', emailError)

      // En desarrollo, devolver el URL aunque falle el email
      return {
        success: false,
        message: 'Error al enviar email',
        error: emailError.message,
        setupUrl, // Devolver URL como backup
      }
    }
  }
  catch (error: any) {
    console.error('[Send Setup Email] Error:', error)

    return {
      success: false,
      message: error.message || 'Error al enviar email',
    }
  }
})

// Template del email
function getEmailTemplate(businessName: string, setupUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a VERTEX</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 10px;">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 0L38.6603 10V30L20 40L1.33975 30V10L20 0Z" fill="white" opacity="0.2"/>
              <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" fill="white"/>
              <path d="M20 14L14 17.5V21L20 24L26 21V17.5L20 14Z" fill="#667eea"/>
              <text x="20" y="25" text-anchor="middle" fill="#667eea" font-size="12" font-weight="bold" font-family="Arial">V</text>
            </svg>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: bold;">VERTEX</h1>
          </div>
          <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Sistema ERP para Guatemala</p>
        </div>
        
        <div style="background: #ffffff; padding: 40px 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #333; margin-top: 0;">¡Bienvenido a VERTEX, ${businessName}!</h2>
          
          <p style="font-size: 16px; color: #555;">
            Tu suscripción ha sido <strong>activada exitosamente</strong>. 🎉
          </p>
          
          <p style="font-size: 16px; color: #555;">
            Para acceder a tu cuenta, primero necesitas configurar tu usuario y contraseña:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${setupUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 40px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;">
              Configurar mi cuenta
            </a>
          </div>
          
          <div style="background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #555;">
              <strong>⏰ Importante:</strong> Este enlace expira en <strong>24 horas</strong>.
            </p>
          </div>
          
          <p style="font-size: 16px; color: #555; margin-top: 30px;">
            Con VERTEX podrás:
          </p>
          
          <ul style="font-size: 15px; color: #555; line-height: 1.8;">
            <li>✅ Gestionar tu contabilidad completa</li>
            <li>✅ Emitir facturas electrónicas (FEL)</li>
            <li>✅ Control de inventario en tiempo real</li>
            <li>✅ Reportes financieros automáticos</li>
            <li>✅ Acceso desde cualquier dispositivo</li>
          </ul>
          
          <p style="font-size: 14px; color: #777; margin-top: 30px;">
            Si no solicitaste esta suscripción, puedes ignorar este correo.
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 12px; color: #999; margin: 0; text-align: center;">
            © ${new Date().getFullYear()} VERTEX ERP - Sistema de Gestión Empresarial
          </p>
          <p style="font-size: 12px; color: #999; margin: 10px 0 0 0; text-align: center;">
            Ciudad de Guatemala, Guatemala
          </p>
        </div>
      </body>
    </html>
  `
}
