import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase para usar en el proyecto
 * Las variables de entorno se leen de .env:
 * - NUXT_PUBLIC_SUPABASE_URL
 * - NUXT_PUBLIC_SUPABASE_ANON_KEY
 */
export const useSupabase = () => {
  const config = useRuntimeConfig()

  return createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
  )
}
