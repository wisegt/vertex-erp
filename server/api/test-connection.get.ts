/**
 * TEST ENDPOINT: Conexión directa a Supabase
 * USO: GET /api/test-connection
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  const url = process.env.SUPABASE_URL || ''
  const key = process.env.SUPABASE_KEY || ''

  // Crear cliente directamente aquí
  const supabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  try {
    // Test 1: Query simple a demo_auth_users (public)
    const { data, error, status, statusText } = await supabase
      .from('demo_auth_users')
      .select('id, email')
      .limit(1)

    if (error) {
      return {
        success: false,
        test: 'demo_auth_users',
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        httpStatus: status,
        httpStatusText: statusText,
        config: {
          url: `${url.substring(0, 40)}...`,
          keyPrefix: `${key.substring(0, 20)}...`,
        },
      }
    }

    return {
      success: true,
      message: '✅ Conexión exitosa!',
      data,
      httpStatus: status,
    }
  }
  catch (err: any) {
    return {
      success: false,
      message: 'Error de excepción',
      error: err.message,
      stack: err.stack?.split('\n').slice(0, 5),
    }
  }
})
