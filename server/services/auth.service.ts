/**
 * ============================================================================
 * AUTH SERVICE - Servicio de autenticación con Supabase
 * ============================================================================
 * Autentica usuarios contra core.users y carga sus permisos desde:
 * - core.roles / core.user_roles (rol base)
 * - core.role_permissions / core.permissions (permisos del rol)
 * - core.privileges (privilegios personalizados por usuario/form)
 */

import bcrypt from 'bcrypt'
import { getSupabaseAdmin } from '@/server/utils/supabase'

export interface AuthUser {
  id: string
  email: string
  username: string
  fullName: string
  avatar: string | null
  role: string
  roleName: string
  tenantId: string
  tenantName: string
  isSuperAdmin: boolean
  abilityRules: Array<{ action: string; subject: string }>
}

/**
 * Autentica un usuario usando credenciales email/password
 * Optimizado: Una sola consulta con JOINs para reducir latencia
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase().trim()
  const startTime = Date.now()

  try {
    const supabase = getSupabaseAdmin()

    // Consulta optimizada: usuario + tenant + rol en una sola query
    const { data: dbUser, error: userError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        password_hash,
        first_name,
        last_name,
        profile_picture,
        status,
        is_super_admin,
        tenant_id,
        tenant:tenants!users_tenant_id_fkey (
          id,
          name
        ),
        user_roles!user_roles_user_id_fkey (
          role:roles (
            id,
            code,
            name
          )
        )
      `)
      .eq('email', normalizedEmail)
      .eq('status', 'activo')
      .maybeSingle()

    console.log(`[Auth] Query usuario: ${Date.now() - startTime}ms`)

    if (userError) {
      console.error('[Auth] Error consultando usuario:', userError.message)

      return null
    }

    if (!dbUser) {
      console.warn('[Auth] Usuario no encontrado:', normalizedEmail)

      return null
    }

    if (!dbUser.password_hash) {
      console.warn('[Auth] Usuario sin contraseña:', normalizedEmail)

      return null
    }

    // Verificar contraseña
    const passwordCheckStart = Date.now()
    const passwordValid = await bcrypt.compare(password, dbUser.password_hash)

    console.log(`[Auth] Verificación password: ${Date.now() - passwordCheckStart}ms`)

    if (!passwordValid) {
      console.warn('[Auth] Contraseña incorrecta para:', normalizedEmail)

      return null
    }

    // Extraer información del tenant y rol
    const tenant = dbUser.tenant as { id: string; name: string } | null
    const userRole = dbUser.user_roles?.[0]?.role as { id: string; code: string; name: string } | null

    const roleCode = userRole?.code || 'USER'
    const roleName = userRole?.name || 'Usuario'
    const roleId = userRole?.id

    // Cargar permisos del rol (si no es super admin)
    let abilityRules: Array<{ action: string; subject: string }> = []

    if (dbUser.is_super_admin) {
      // Super admin tiene acceso total
      abilityRules = [{ action: 'manage', subject: 'all' }]
    }
    else if (roleId) {
      // Cargar permisos del rol
      const permissionsStart = Date.now()

      abilityRules = await loadRolePermissions(supabase, roleId)
      console.log(`[Auth] Carga permisos: ${Date.now() - permissionsStart}ms`)

      // Cargar privilegios personalizados del usuario
      const privilegesStart = Date.now()
      const customPrivileges = await loadUserPrivileges(supabase, dbUser.id, dbUser.tenant_id)

      console.log(`[Auth] Carga privilegios: ${Date.now() - privilegesStart}ms`)

      // Merge de permisos (privilegios personalizados sobrescriben permisos de rol)
      abilityRules = mergePermissions(abilityRules, customPrivileges)
    }
    else {
      // Sin rol asignado - permisos mínimos
      abilityRules = [{ action: 'read', subject: 'Auth' }]
    }

    console.log(`[Auth] Total autenticación: ${Date.now() - startTime}ms`)

    return {
      id: dbUser.id,
      email: dbUser.email,
      username: dbUser.email,
      fullName: `${dbUser.first_name || ''} ${dbUser.last_name || ''}`.trim() || dbUser.email,
      avatar: dbUser.profile_picture,
      role: roleCode,
      roleName,
      tenantId: dbUser.tenant_id || '',
      tenantName: tenant?.name || 'Mi Empresa',
      isSuperAdmin: dbUser.is_super_admin || false,
      abilityRules,
    }
  }
  catch (error) {
    console.error('[Auth] Error durante autenticación:', error)

    return null
  }
}

/**
 * Carga los permisos de un rol desde role_permissions + permissions
 */
async function loadRolePermissions(
  supabase: any,
  roleId: string,
): Promise<Array<{ action: string; subject: string }>> {
  const { data: rolePerms, error } = await supabase
    .from('role_permissions')
    .select(`
      permission:permissions (
        entity,
        action
      )
    `)
    .eq('role_id', roleId)

  if (error || !rolePerms) {
    console.error('[Auth] Error cargando permisos del rol:', error?.message)

    return []
  }

  // Transformar a formato CASL
  const rules: Array<{ action: string; subject: string }> = []
  const seen = new Set<string>()

  for (const rp of rolePerms) {
    const perm = rp.permission as { entity: string; action: string } | null
    if (perm) {
      const key = `${perm.action}-${perm.entity}`
      if (!seen.has(key)) {
        seen.add(key)
        rules.push({
          action: perm.action,
          subject: perm.entity,
        })
      }
    }
  }

  return rules
}

/**
 * Carga los privilegios personalizados de un usuario
 * Estos son excepciones a los permisos del rol (por form específico)
 */
async function loadUserPrivileges(
  supabase: any,
  userId: string,
  tenantId: string,
): Promise<Array<{ action: string; subject: string; granted: boolean }>> {
  const { data: privileges, error } = await supabase
    .from('privileges')
    .select(`
      can_read,
      can_create,
      can_update,
      can_delete,
      can_approve,
      can_post,
      can_export,
      can_import,
      form:forms (
        code
      )
    `)
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)

  if (error || !privileges) {
    if (error)
      console.error('[Auth] Error cargando privilegios:', error.message)

    return []
  }

  // Transformar privilegios a formato CASL
  const rules: Array<{ action: string; subject: string; granted: boolean }> = []

  for (const priv of privileges) {
    const formCode = (priv.form as { code: string } | null)?.code
    if (!formCode)
      continue

    // Mapeo de campos a acciones CASL
    const actionMap: Record<string, string> = {
      can_read: 'read',
      can_create: 'create',
      can_update: 'update',
      can_delete: 'delete',
      can_approve: 'approve',
      can_post: 'post',
      can_export: 'export',
      can_import: 'import',
    }

    for (const [field, action] of Object.entries(actionMap)) {
      const granted = priv[field as keyof typeof priv]
      if (granted !== null && granted !== undefined) {
        rules.push({
          action,
          subject: formCode,
          granted: Boolean(granted),
        })
      }
    }
  }

  return rules
}

/**
 * Merge de permisos de rol con privilegios personalizados
 * Los privilegios personalizados sobrescriben los del rol
 */
function mergePermissions(
  roleRules: Array<{ action: string; subject: string }>,
  customPrivileges: Array<{ action: string; subject: string; granted: boolean }>,
): Array<{ action: string; subject: string }> {
  // Crear mapa de permisos del rol
  const permMap = new Map<string, boolean>()

  for (const rule of roleRules)
    permMap.set(`${rule.action}-${rule.subject}`, true)

  // Aplicar privilegios personalizados
  for (const priv of customPrivileges) {
    const key = `${priv.action}-${priv.subject}`
    if (priv.granted)
      permMap.set(key, true) // Conceder acceso
    else
      permMap.delete(key) // Revocar acceso
  }

  // Convertir de vuelta a array
  const result: Array<{ action: string; subject: string }> = []
  for (const [key, _] of permMap) {
    const [action, subject] = key.split('-')

    result.push({ action, subject })
  }

  return result
}

/**
 * Obtiene las reglas de habilidad básicas según el código de rol
 * (Fallback si no hay permisos en la BD)
 */
export function getDefaultAbilityRules(
  roleCode: string,
  isSuperAdmin: boolean,
): Array<{ action: string; subject: string }> {
  if (isSuperAdmin)
    return [{ action: 'manage', subject: 'all' }]

  const rolePermissions: Record<string, Array<{ action: string; subject: string }>> = {
    SUPER_ADMIN: [{ action: 'manage', subject: 'all' }],
    ADMIN: [{ action: 'manage', subject: 'all' }],
    GERENTE: [
      { action: 'read', subject: 'all' },
      { action: 'create', subject: 'all' },
      { action: 'update', subject: 'all' },
    ],
    CONTADOR: [
      { action: 'read', subject: 'all' },
      { action: 'create', subject: 'Accounting' },
      { action: 'update', subject: 'Accounting' },
    ],
    VENDEDOR: [
      { action: 'read', subject: 'all' },
      { action: 'create', subject: 'Sales' },
      { action: 'update', subject: 'Sales' },
    ],
    USER: [
      { action: 'read', subject: 'all' },
    ],
  }

  return rolePermissions[roleCode.toUpperCase()] || [{ action: 'read', subject: 'Auth' }]
}
