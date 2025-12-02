/**
 * ============================================================================
 * AUTH SERVICE - Servicio de autenticación centralizada
 * ============================================================================
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
  tenantId: string
  tenantName: string
  isSuperAdmin: boolean
  abilityRules: Array<{ action: string; subject: string }>
}

/**
 * Autentica un usuario usando credenciales email/password
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthUser | null> {
  const supabase = getSupabaseAdmin()

  const { data: user, error: userError } = await supabase
    .from('users')
    .select(`
      id, email, password_hash, first_name, middle_name,
      last_name, second_last_name, profile_picture,
      is_super_admin, status, tenant_id
    `)
    .eq('email', email.toLowerCase().trim())
    .single()

  if (userError || !user) {
    console.warn('[Auth] Usuario no encontrado:', email)

    return null
  }

  if (user.status !== 'activo') {
    console.warn('[Auth] Usuario inactivo:', email)

    return null
  }

  const passwordValid = await bcrypt.compare(password, user.password_hash)

  if (!passwordValid) {
    console.warn('[Auth] Contraseña incorrecta:', email)

    return null
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('id, name')
    .eq('id', user.tenant_id)
    .single()

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role_id, roles:role_id (code)')
    .eq('user_id', user.id)
    .eq('tenant_id', user.tenant_id)
    .single()

  const roleCode = (userRole?.roles as { code?: string } | null)?.code || 'USER'

  const abilityRules = await getAbilityRules(user.id, user.tenant_id, user.is_super_admin)

  const fullName = [user.first_name, user.middle_name, user.last_name, user.second_last_name]
    .filter(Boolean)
    .join(' ')

  return {
    id: user.id,
    email: user.email,
    username: user.email,
    fullName,
    avatar: user.profile_picture,
    role: roleCode,
    tenantId: user.tenant_id,
    tenantName: tenant?.name || 'Sin tenant',
    isSuperAdmin: user.is_super_admin,
    abilityRules,
  }
}

async function getAbilityRules(
  userId: string,
  tenantId: string,
  isSuperAdmin: boolean,
): Promise<Array<{ action: string; subject: string }>> {
  if (isSuperAdmin)
    return [{ action: 'manage', subject: 'all' }]

  const supabase = getSupabaseAdmin()

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role_id')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single()

  if (!userRole)
    return [{ action: 'read', subject: 'Auth' }]

  const { data: privileges } = await supabase
    .from('role_privileges')
    .select(`
      can_read, can_create, can_update, can_delete,
      can_approve, can_post, can_export, can_import,
      forms:form_id (code)
    `)
    .eq('role_id', userRole.role_id)

  if (!privileges || privileges.length === 0)
    return [{ action: 'read', subject: 'Auth' }]

  const abilityRules: Array<{ action: string; subject: string }> = []

  abilityRules.push({ action: 'read', subject: 'Auth' })

  for (const priv of privileges) {
    const formCode = (priv.forms as { code?: string } | null)?.code

    if (!formCode)
      continue

    if (priv.can_read)
      abilityRules.push({ action: 'read', subject: formCode })

    if (priv.can_create)
      abilityRules.push({ action: 'create', subject: formCode })

    if (priv.can_update)
      abilityRules.push({ action: 'update', subject: formCode })

    if (priv.can_delete)
      abilityRules.push({ action: 'delete', subject: formCode })

    if (priv.can_approve)
      abilityRules.push({ action: 'approve', subject: formCode })

    if (priv.can_post)
      abilityRules.push({ action: 'post', subject: formCode })

    if (priv.can_export)
      abilityRules.push({ action: 'export', subject: formCode })

    if (priv.can_import)
      abilityRules.push({ action: 'import', subject: formCode })
  }

  return abilityRules
}
