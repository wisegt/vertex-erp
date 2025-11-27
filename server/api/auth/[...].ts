/**
 * ============================================================================
 * CAMBIOS REALIZADOS - Documentación de modificaciones
 * ============================================================================
 *
 * IMPORTANTE: SEGURIDAD JWT MANTENIDA
 * - JWT sigue siendo usado por NextAuth para las sesiones
 * - El cambio solo afectó la autenticación inicial (authorize)
 * - NextAuth automáticamente genera y valida tokens JWT después del login
 * - Los callbacks jwt() y session() siguen funcionando normalmente
 * - La seguridad no se ha comprometido, solo se optimizó el flujo de autenticación
 *
 * CAMBIO 1: Importación directa de la base de datos
 * - ANTES: Se hacía una petición HTTP a /api/login usando $fetch
 * - AHORA: Se importa directamente la base de datos (db) para evitar problemas
 *   de rutas HTTP internas y mejorar el rendimiento
 * - MOTIVO: El error 404 "Route POST:/api/login not found" se resolvió
 *   eliminando la dependencia de rutas HTTP internas
 * - NOTA: Esto solo cambia CÓMO se autentica inicialmente, JWT sigue activo
 *
 * CAMBIO 2: Agregado de tipos TypeScript personalizados
 * - Se creó la interfaz ExtendedUser para extender el tipo User de NextAuth
 *   con propiedades personalizadas (username, fullName, avatar, role, abilityRules)
 * - MOTIVO: Resolver errores de TypeScript que indicaban que estas propiedades
 *   no existían en los tipos base de NextAuth
 *
 * CAMBIO 3: Uso de type assertions
 * - Se agregaron type assertions (as ExtendedUser) para indicar a TypeScript
 *   que los objetos tienen las propiedades personalizadas
 * - MOTIVO: Mantener la seguridad de tipos mientras se resuelven los errores
 *   del linter
 *
 * CAMBIO 4: Eliminación de dependencia de runtimeConfig
 * - Se removió el uso de runtimeConfig.public.apiBaseUrl ya que ya no se
 *   necesita para hacer peticiones HTTP internas
 * - MOTIVO: Simplificar el código y eliminar dependencias innecesarias
 * ============================================================================
 */

import type { User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'

// import AppleProvider from 'next-auth/providers/apple' // Descomentar cuando tengas credenciales de Apple
import { NuxtAuthHandler } from '#auth'

// CAMBIO 1: Importación directa de la base de datos en lugar de hacer petición HTTP
import { db } from '@/server/fake-db/auth'

/**
 * CAMBIO 2: Interfaz para extender el tipo User de NextAuth con propiedades personalizadas
 * Esto resuelve los errores de TypeScript que indicaban que las propiedades
 * username, fullName, avatar, role y abilityRules no existían en el tipo base
 */
interface ExtendedUser extends NextAuthUser {
  username?: string
  fullName?: string
  avatar?: string
  role?: string
  abilityRules?: Array<{ action: string; subject: string }>
}

// import GoogleProvider from 'next-auth/providers/google'
// const runtimeConfig = useRuntimeConfig()

/**
 * NuxtAuthHandler configura NextAuth con JWT como estrategia de sesión
 * - AUTH_SECRET: Secreto usado para firmar y verificar tokens JWT
 * - NextAuth automáticamente usa JWT para las sesiones cuando se configura así
 * - Los tokens JWT se generan después de una autenticación exitosa
 */
export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET, // Secreto para firmar tokens JWT
  providers: [
    // ============================================================================
    // PROVEEDORES SOCIALES
    // ============================================================================

    // 🔵 Google Provider
    // @ts-expect-error SSR compatibility fix
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // 🔵 Facebook Provider
    // @ts-expect-error SSR compatibility fix
    FacebookProvider.default({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),

    // 🍎 Apple Provider (descomentar cuando tengas credenciales)
    // @ts-expect-error SSR compatibility fix
    // AppleProvider.default({
    //   clientId: process.env.APPLE_ID || '',
    //   clientSecret: process.env.APPLE_SECRET || '',
    // }),

    // ============================================================================
    // CREDENCIALES (Email/Password)
    // ============================================================================

    // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {}, // Object is required but can be left empty.
      async authorize(credentials: any) {
        const { email, password } = credentials

        // Validación de credenciales requeridas
        if (!email || !password) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Email and Password is required to login',
            data: {
              email: ['Email and Password is required to login'],
            },
          })
        }

        /**
         * CAMBIO 1: Búsqueda directa en la base de datos
         * - ANTES: Se hacía $fetch(`${runtimeConfig.public.apiBaseUrl}/login/`, {...})
         * - AHORA: Se busca directamente en db.users.find()
         * - VENTAJAS:
         *   - No depende de rutas HTTP internas
         *   - Más eficiente (sin overhead de petición HTTP)
         *   - Evita problemas de configuración de URLs
         *   - Resuelve el error 404 que ocurría anteriormente
         */
        const dbUser = db.users.find(u => u.email === email && u.password === password)

        if (!dbUser) {
          throw createError({
            statusCode: 403,
            statusMessage: 'Invalid email or password',
            data: {
              email: ['Invalid email or password'],
            },
          })
        }

        // ℹ️ Don't send password in response - Removemos la contraseña antes de retornar
        const { password: _, ...user } = dbUser

        return user || null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },

  /**
   * CALLBACKS: NextAuth usa estos callbacks para manejar tokens JWT
   * - jwt(): Se ejecuta cuando se crea o actualiza un token JWT
   * - session(): Se ejecuta cuando se accede a la sesión del usuario
   * - JWT SIGUE ACTIVO: Estos callbacks confirman que JWT sigue siendo usado
   */
  callbacks: {
    /**
     * Callback JWT: Agrega propiedades personalizadas al token JWT
     * - Este callback se ejecuta cada vez que NextAuth genera o actualiza un token JWT
     * - El token JWT se almacena en cookies y se usa para mantener la sesión
     * - CAMBIO 2: Uso de type assertion para resolver errores de TypeScript
     * - SEGURIDAD: JWT sigue siendo usado, este callback lo confirma
     */
    jwt: async ({ token, user }) => {
      /*
       * For adding custom parameters to user in session, we first need to add those parameters
       * in token which then will be available in the `session()` callback
       *
       * IMPORTANTE: Este callback trabaja con tokens JWT reales generados por NextAuth
       */
      if (user) {
        /**
         * CAMBIO 2: Type assertion para indicar a TypeScript que user tiene
         * las propiedades personalizadas definidas en ExtendedUser
         * Esto resuelve los errores: "Property 'username' does not exist on type 'User'"
         */
        const extendedUser = user as ExtendedUser

        // Agregar propiedades personalizadas al token JWT
        token.username = extendedUser.username
        token.fullName = extendedUser.fullName
        token.avatar = extendedUser.avatar
        token.abilityRules = extendedUser.abilityRules
        token.role = extendedUser.role
      }

      return token
    },

    /**
     * Callback Session: Agrega propiedades personalizadas a la sesión del usuario
     * - Este callback se ejecuta cuando se accede a la sesión del usuario
     * - El 'token' proviene del callback jwt() y contiene el token JWT decodificado
     * - CAMBIO 2: Uso de type assertions para resolver errores de TypeScript
     * - SEGURIDAD: El token JWT se valida automáticamente por NextAuth antes de llegar aquí
     */
    async session({ session, token }) {
      // Add custom params to user in session which are added in `jwt()` callback via `token` parameter
      // El 'token' aquí es el JWT decodificado y validado por NextAuth
      if (session.user) {
        /**
         * CAMBIO 2: Type assertion para indicar a TypeScript que session.user tiene
         * las propiedades personalizadas. También se hace type assertion en las
         * asignaciones del token para mantener la seguridad de tipos.
         * Esto resuelve los errores: "Property 'username' does not exist on type..."
         */
        const extendedUser = session.user as ExtendedUser

        // Transferir propiedades del token a la sesión del usuario
        extendedUser.username = token.username as string | undefined
        extendedUser.fullName = token.fullName as string | undefined
        extendedUser.avatar = token.avatar as string | undefined
        extendedUser.abilityRules = token.abilityRules as Array<{ action: string; subject: string }> | undefined
        extendedUser.role = token.role as string | undefined
      }

      return session
    },
  },
})
