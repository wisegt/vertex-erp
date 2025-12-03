/**
 * TEST ENDPOINT: Verificar conexión al esquema CORE de Supabase
 *
 * USO: GET /api/test-supabase-core
 */

import { getSupabase, getSupabaseCore } from '@/server/utils/supabase'

export default defineEventHandler(async () => {
  // Helper para evitar cuelgues: corta la espera si la query demora demasiado
  const withTimeout = async <T>(promise: Promise<T>, label: string, ms = 8000) => {
    let timeoutId: NodeJS.Timeout

    const timeout = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`))
      }, ms)
    })

    try {
      return await Promise.race([promise, timeout])
    }
    finally {
      clearTimeout(timeoutId!)
    }
  }

  const results: Record<string, any> = {
    success: false,
    timestamp: new Date().toISOString(),
    tests: {},
  }

  try {
    // TEST 1: Esquema PUBLIC - demo_auth_users
    const supabase = getSupabase()

    const { data: demoUsers, error: demoError } = await withTimeout(
      supabase
        .from('demo_auth_users')
        .select('id, email, username, role')
        .limit(5),
      'public_demo_auth_users')

    results.tests.public_demo_auth_users = demoError
      ? { success: false, error: demoError.message }
      : { success: true, count: demoUsers?.length || 0, data: demoUsers }

    // TEST 2: Esquema CORE - tenants
    const supabaseCore = getSupabaseCore()

    const { data: tenants, error: tenantsError } = await withTimeout(
      supabaseCore
        .from('tenants')
        .select('id, name, business_type, status')
        .limit(5),
      'core_tenants')

    results.tests.core_tenants = tenantsError
      ? { success: false, error: tenantsError.message }
      : { success: true, count: tenants?.length || 0, data: tenants }

    // TEST 3: Esquema CORE - users
    const { data: users, error: usersError } = await withTimeout(
      supabaseCore
        .from('users')
        .select('id, email, first_name, last_name, status')
        .limit(5),
      'core_users')

    results.tests.core_users = usersError
      ? { success: false, error: usersError.message }
      : { success: true, count: users?.length || 0, data: users }

    // Resultado final
    const allTestsPassed = Object.values(results.tests).every(
      (test: any) => test.success === true,
    )

    results.success = allTestsPassed
    results.message = allTestsPassed
      ? '✅ Conexión a PUBLIC y CORE exitosa!'
      : '⚠️ Algunos tests fallaron'

    return results
  }
  catch (err: any) {
    return {
      success: false,
      message: 'Error inesperado',
      error: err.message,
    }
  }
})
