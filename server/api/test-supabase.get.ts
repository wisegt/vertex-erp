/**
 * ============================================================================
 * TEST ENDPOINT: Verificar conexión a Supabase
 * ============================================================================
 *
 * PROPÓSITO: Este endpoint sirve para probar que:
 * 1. La conexión a Supabase funciona
 * 2. Podemos leer la tabla demo_auth_users
 * 3. Los datos se recuperan correctamente
 *
 * USO: GET /api/test-supabase
 *
 * ELIMINAR: Una vez verificado que todo funciona, puedes eliminar este archivo.
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async () => {
  // Diagnóstico de variables de entorno
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY

  // Mostrar diagnóstico de configuración (ocultar valores sensibles)
  const diagnostics = {
    SUPABASE_URL: supabaseUrl ? `✅ Configurada (${supabaseUrl.substring(0, 30)}...)` : '❌ NO configurada',
    SUPABASE_KEY: supabaseKey ? `✅ Configurada (${supabaseKey.substring(0, 20)}...)` : '❌ NO configurada',
  }

  // Si faltan variables, retornar error inmediatamente
  if (!supabaseUrl || !supabaseKey) {
    return {
      success: false,
      message: 'Variables de entorno de Supabase no configuradas',
      diagnostics,
      hint: 'Agrega SUPABASE_URL y SUPABASE_KEY (o NUXT_PUBLIC_SUPABASE_URL y NUXT_PUBLIC_SUPABASE_ANON_KEY) a tu archivo .env',
    }
  }

  try {
    // Crear cliente directamente aquí para evitar problemas de inicialización
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    // Probar conexión básica consultando la tabla demo_auth_users
    // (No seleccionamos password_hash por seguridad)
    const { data: users, error } = await supabase
      .from('demo_auth_users')
      .select('id, email, username, full_name, role')

    // Si hay error, lo reportamos con diagnóstico
    if (error) {
      return {
        success: false,
        message: 'Error conectando a Supabase',
        error: error.message,
        details: error,
        diagnostics,
      }
    }

    // Paso 2: Verificar que obtuvimos datos
    if (!users || users.length === 0) {
      return {
        success: true,
        message: 'Conexión exitosa pero no hay usuarios en demo_auth_users',
        users: [],
        count: 0,
      }
    }

    // Paso 3: Retornar resultado exitoso
    return {
      success: true,
      message: `✅ Conexión exitosa! Se encontraron ${users.length} usuarios`,
      users,
      count: users.length,
    }
  }
  catch (err: any) {
    // Error inesperado (red, configuración, etc.)
    return {
      success: false,
      message: 'Error inesperado al conectar con Supabase',
      error: err.message,
    }
  }
})
