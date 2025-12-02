/**
 * TEST ENDPOINT: Verificar variables de entorno de Supabase
 * USO: GET /api/test-env
 * ELIMINAR después de diagnosticar
 */

export default defineEventHandler(async () => {
  // Leer las variables de entorno
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY
  const nuxtPublicUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
  const nuxtPublicKey = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY

  return {
    timestamp: new Date().toISOString(),
    environment: {
      SUPABASE_URL: supabaseUrl ? `✅ Definida (${supabaseUrl.substring(0, 30)}...)` : '❌ NO definida',
      SUPABASE_KEY: supabaseKey ? `✅ Definida (${supabaseKey.substring(0, 20)}...)` : '❌ NO definida',
      NUXT_PUBLIC_SUPABASE_URL: nuxtPublicUrl ? `✅ Definida (${nuxtPublicUrl.substring(0, 30)}...)` : '❌ NO definida',
      NUXT_PUBLIC_SUPABASE_ANON_KEY: nuxtPublicKey ? `✅ Definida (${nuxtPublicKey.substring(0, 20)}...)` : '❌ NO definida',
    },
    recommendation: (!supabaseUrl && !nuxtPublicUrl) 
      ? '⚠️ Ninguna URL de Supabase está disponible. Reinicia el servidor con: pnpm dev'
      : '✅ Al menos una URL está disponible',
  }
})
