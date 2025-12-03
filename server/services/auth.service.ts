/**
 * ============================================================================
 * AUTH SERVICE - Servicio de autenticación centralizada
 * ============================================================================
 *
 * En desarrollo: usa credenciales locales (fallback)
 * En producción: integrar con Supabase
 */

import bcrypt from 'bcrypt'

export interface AuthUser {
  id: string
  email: string
  username: string
  fullName: string
  avatar: string | null
  role: string
  tenantId: string
  tenantName: string
  isSuperAdmin: boolean
  abilityRules: Array<{ action: string; subject: string }>
}

/**
 * Usuarios de fallback para desarrollo
 */
const FALLBACK_USERS = [
  {
    id: '1',
    email: 'admin@vertex-erp.com',

    // Hash for "Demo123!"
    password_hash: '$2b$10$PqKlagyvGXlj5tSjta.Sku1fYwRSdALxmh9.LC/LiviwdDBA0jpvy',
    fullName: 'Admin User',
    role: 'ADMIN',
    abilityRules: [{ action: 'manage', subject: 'all' }],
  },
  {
    id: '2',
    email: 'gerente@comercialexito.com',

    // Hash for "Demo123!"
    password_hash: '$2b$10$PqKlagyvGXlj5tSjta.Sku1fYwRSdALxmh9.LC/LiviwdDBA0jpvy',
    fullName: 'Gerente User',
    role: 'MANAGER',
    abilityRules: [
      { action: 'read', subject: 'all' },
      { action: 'create', subject: 'all' },
      { action: 'update', subject: 'all' },
    ],
  },
]

/**
 * Autentica un usuario usando credenciales email/password
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  try {
    console.log(`[Auth] Autenticando usuario: ${email}`)

    const user = FALLBACK_USERS.find(u => u.email === email.toLowerCase().trim())

    if (!user) {
      console.warn(`[Auth] Usuario no encontrado: ${email}`)

      return null
    }

    // Verificar contraseña
    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      console.warn(`[Auth] Contraseña incorrecta: ${email}`)

      return null
    }

    console.log(`[Auth] Usuario autenticado exitosamente: ${email}`)

    return {
      id: user.id,
      email: user.email,
      username: user.email,
      fullName: user.fullName,
      avatar: null,
      role: user.role,
      tenantId: '1',
      tenantName: 'Default Tenant',
      isSuperAdmin: user.role === 'ADMIN',
      abilityRules: user.abilityRules,
    }
  }
  catch (error) {
    console.error('[Auth] Error durante autenticación:', error)

    return null
  }
}

/**
 * Obtiene las reglas de habilidad según el rol del usuario
 */
export function getAbilityRules(role: string, isSuperAdmin: boolean): Array<{ action: string; subject: string }> {
  if (isSuperAdmin)
    return [{ action: 'manage', subject: 'all' }]

  // Mapear roles a permisos
  const rolePermissions: Record<string, Array<{ action: string; subject: string }>> = {
    ADMIN: [{ action: 'manage', subject: 'all' }],
    MANAGER: [
      { action: 'read', subject: 'all' },
      { action: 'create', subject: 'all' },
      { action: 'update', subject: 'all' },
    ],
    USER: [
      { action: 'read', subject: 'all' },
    ],
  }

  return rolePermissions[role] || [{ action: 'read', subject: 'Auth' }]
}
