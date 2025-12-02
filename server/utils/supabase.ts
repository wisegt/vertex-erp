/**
 * ============================================================================
 * SUPABASE SERVER CLIENT - Cliente para uso en el servidor
 * ============================================================================
 *
 * IMPORTANTE: Usamos funciones que retornan el cliente en lugar de exportar
 * la instancia directamente. Esto evita problemas de timing con las variables
 * de entorno en Nuxt, que pueden no estar disponibles cuando el módulo
 * se importa por primera vez.
 *
 * USO:
 * import { getSupabase, getSupabaseCore } from '@/server/utils/supabase'
 * const supabase = getSupabase()
 * const { data, error } = await supabase.from('demo_auth_users').select()
 * ============================================================================
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Cache para reutilizar las instancias una vez creadas
let supabaseInstance: SupabaseClient | null = null
let supabaseCoreInstance: SupabaseClient | null = null

/**
 * Obtiene el cliente Supabase para el esquema PUBLIC
 * El cliente se crea una sola vez y se reutiliza en llamadas posteriores
 */
export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!url || !key) {
      console.error('⚠️ SUPABASE_URL o SUPABASE_KEY no están configuradas')
    }

    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  }

  return supabaseInstance
}

/**
 * Obtiene el cliente Supabase para el esquema CORE
 * Usado para tablas del sistema multi-tenant (tenants, users, roles, etc.)
 */
export function getSupabaseCore(): SupabaseClient {
  if (!supabaseCoreInstance) {
    const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!url || !key) {
      console.error('⚠️ SUPABASE_URL o SUPABASE_KEY no están configuradas')
    }

    supabaseCoreInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      db: {
        schema: 'core',
      },
    })
  }

  return supabaseCoreInstance
}

/**
 * Tipo para usuarios del esquema core.users
 */
export interface CoreUser {
  id: string
  email: string
  password_hash: string
  first_name: string
  middle_name: string | null
  last_name: string
  second_last_name: string | null
  phone: string | null
  profile_picture: string | null
  is_super_admin: boolean
  status: 'activo' | 'inactivo' | 'suspendido'
  tenant_id: string
  email_verified: boolean
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}

/**
 * Tipo para tenants del esquema core.tenants
 */
export interface CoreTenant {
  id: string
  name: string
  legal_name: string | null
  tax_id: string | null
  business_type: 'empresa' | 'contador'
  email: string | null
  phone: string | null
  status: 'activa' | 'suspendida' | 'cancelada'
  settings: Record<string, any>
  created_at: string
  updated_at: string
}
