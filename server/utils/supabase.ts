/**
 * ============================================================================
 * SUPABASE SERVER CLIENT - Cliente para uso en el servidor
 * ============================================================================
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from '@supabase/supabase-js'

export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function getSupabaseCore(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || ''

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'core' },
  })
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    db: { schema: 'core' },
  })
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
