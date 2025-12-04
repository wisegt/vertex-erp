import { db } from '@/server/fake-db/auth'

export default defineEventHandler(async event => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 403,
      statusMessage: 'El correo electrónico y la contraseña son obligatorios para iniciar sesión',
      data: {
        email: ['El correo electrónico y la contraseña son obligatorios para iniciar sesión'],
      },
    })
  }

  const dbUser = db.users.find(u => u.email === email && u.password === password)

  if (!dbUser) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Correo electrónico o contraseña inválidos',
      data: {
        email: ['Correo electrónico o contraseña inválidos'],
      },
    })
  }

  // ℹ️ Don't send password in response
  const { password: _, ...user } = dbUser

  return {
    user,
  }
})
