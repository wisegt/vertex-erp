import { createClient } from '@supabase/supabase-js'

/**
 * Cliente de Supabase para usar en el proyecto
 * Las variables de entorno se leen de .env:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 */
export const useSupabase = () => {
  const config = useRuntimeConfig()

  return createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
  )
}
