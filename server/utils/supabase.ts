/**
 * ============================================================================
 * SUPABASE SERVER CLIENT - Cliente para uso en el servidor
 * ============================================================================
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null
let supabaseCoreInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

    supabaseInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }

  return supabaseInstance
}

export function getSupabaseCore(): SupabaseClient {
  if (!supabaseCoreInstance) {
    const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

    supabaseCoreInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'core' },
    })
  }

  return supabaseCoreInstance
}

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    supabaseAdminInstance = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'core' },
    })
  }

  return supabaseAdminInstance
}

export interface CoreUser {
  id: string
  email: string
  password_hash: string
  first_name: string
  last_name: string
  status: 'activo' | 'inactivo' | 'suspendido'
  tenant_id: string
  is_super_admin: boolean
}

export interface CoreTenant {
  id: string
  name: string
  business_type: 'empresa' | 'contador'
  status: 'activa' | 'suspendida' | 'cancelada'
}
