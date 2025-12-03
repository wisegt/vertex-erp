import type { User as NextAuthUser } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import FacebookProvider from 'next-auth/providers/facebook'
import GoogleProvider from 'next-auth/providers/google'
import { NuxtAuthHandler } from '#auth'
import { authenticateUser } from '@/server/services/auth.service'

interface ExtendedUser extends NextAuthUser {
  username?: string
  fullName?: string
  avatar?: string
  role?: string
  tenantId?: string
  tenantName?: string
  isSuperAdmin?: boolean
  abilityRules?: Array<{ action: string; subject: string }>
}

export default NuxtAuthHandler({
  secret: process.env.AUTH_SECRET,

  providers: [
    // @ts-expect-error SSR compatibility fix
    GoogleProvider.default({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // @ts-expect-error SSR compatibility fix
    FacebookProvider.default({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),

    // @ts-expect-error SSR compatibility fix
    CredentialsProvider.default({
      name: 'Credentials',
      credentials: {},

      async authorize(credentials: any) {
        const { email, password } = credentials

        if (!email || !password) {
          console.error('[Auth] Credenciales vacías')

          return null
        }

        // Autenticar usuario
        const user = await authenticateUser(email, password)

        if (!user) {
          console.warn('[Auth] Credenciales inválidas para:', email)

          return null
        }

        console.log('[Auth] Usuario autenticado exitosamente:', email)

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenantName,
          isSuperAdmin: user.isSuperAdmin,
          abilityRules: user.abilityRules,
        }
      },
    }),
  ],

  pages: {
    signIn: '/login',
  },

  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = user as ExtendedUser

        token.id = u.id
        token.username = u.username
        token.fullName = u.fullName
        token.avatar = u.avatar
        token.role = u.role
        token.tenantId = u.tenantId
        token.tenantName = u.tenantName
        token.isSuperAdmin = u.isSuperAdmin
        token.abilityRules = u.abilityRules
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        const u = session.user as ExtendedUser

        u.id = token.id as string
        u.username = token.username as string
        u.fullName = token.fullName as string
        u.avatar = token.avatar as string | undefined
        u.role = token.role as string
        u.tenantId = token.tenantId as string
        u.tenantName = token.tenantName as string
        u.isSuperAdmin = token.isSuperAdmin as boolean
        u.abilityRules = token.abilityRules as Array<{ action: string; subject: string }>
      }

      return session
    },
  },
})
