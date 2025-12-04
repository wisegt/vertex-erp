/**
 * ============================================================================
 * SUPABASE CLIENT PLUGIN
 * ============================================================================
 * Plugin para usar Supabase en el cliente (browser).
 * Provee acceso al cliente de Supabase para:
 * - Realtime subscriptions
 * - Auth (si se necesita en el futuro)
 * - Queries directas desde el cliente
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl as string
  const supabaseAnonKey = config.public.supabaseAnonKey as string

  console.log('[Supabase Plugin] Initializing...')
  console.log('[Supabase Plugin] URL:', supabaseUrl ? '✓ Set' : '✗ Missing')
  console.log('[Supabase Plugin] Key:', supabaseAnonKey ? '✓ Set' : '✗ Missing')

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('[Supabase Plugin] Missing SUPABASE_URL or SUPABASE_ANON_KEY')
    return {
      provide: {
        supabase: null,
        supabaseCore: null,
      },
    }
  }

  // Cliente principal para Realtime y operaciones generales
  const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  console.log('[Supabase Plugin] ✓ Client created successfully')

  return {
    provide: {
      supabase,
    },
  }
})
