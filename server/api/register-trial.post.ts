import bcrypt from 'bcrypt'
import { getSupabaseAdmin } from '@/server/utils/supabase'

interface RegisterTrialBody {
  company: {
    name: string
    nit: string
    industry: string
    employees: string
  }
  user: {
    firstName: string
    lastName: string
    email: string
    phone: string
    password: string
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterTrialBody>(event)

  // Validaciones básicas
  if (!body.company?.name || !body.user?.email || !body.user?.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Datos incompletos',
    })
  }

  // Usar cliente admin para bypass de RLS (necesario para registro de nuevos usuarios)
  const supabase = getSupabaseAdmin()

  try {
    // 1. Verificar que el email no exista (usar maybeSingle para evitar error si no existe)
    const { data: existingUser, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', body.user.email.toLowerCase())
      .maybeSingle()

    if (userCheckError) {
      console.error('Error verificando email:', userCheckError)
    }

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'El correo electrónico ya está registrado. ¿Ya tienes una cuenta? Inicia sesión.',
      })
    }

    // 2. Verificar que el NIT no exista (si se proporcionó)
    if (body.company.nit && body.company.nit.trim()) {
      const { data: existingTenant } = await supabase
        .from('tenants')
        .select('id, name')
        .eq('tax_id', body.company.nit.trim())
        .maybeSingle()

      if (existingTenant) {
        throw createError({
          statusCode: 409,
          statusMessage: `El NIT ya está registrado para la empresa "${existingTenant.name}". Si es tu empresa, contacta a soporte.`,
        })
      }
    }

    // 3. Hash de la contraseña
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.user.password, saltRounds)

    // 4. Calcular fecha de fin del trial (14 días)
    const trialEndsAt = new Date()
    trialEndsAt.setDate(trialEndsAt.getDate() + 14)

    // 5. Crear el Tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: body.company.name,
        legal_name: body.company.name,
        tax_id: body.company.nit || null,
        business_type: 'empresa',
        email: body.user.email.toLowerCase(),
        phone: body.user.phone || null,
        status: 'activa',
        is_active: true,
        settings: {
          industry: body.company.industry,
          employees: body.company.employees,
          currency: 'GTQ',
          language: 'es',
          timezone: 'America/Guatemala',
          onboarding_completed: false,
        },
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Error creando tenant:', tenantError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al crear la empresa: ' + tenantError.message,
      })
    }

    // 6. Crear el Usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email: body.user.email.toLowerCase(),
        password_hash: passwordHash,
        first_name: body.user.firstName,
        last_name: body.user.lastName,
        phone: body.user.phone || null,
        tenant_id: tenant.id,
        status: 'activo',
        email_verified: false,
        is_super_admin: false,
        preferences: {
          theme: 'light',
          language: 'es',
        },
      })
      .select()
      .single()

    if (userError) {
      console.error('Error creando usuario:', userError)
      // Rollback: eliminar tenant
      await supabase.from('tenants').delete().eq('id', tenant.id)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error al crear el usuario: ' + userError.message,
      })
    }

    // 7. Buscar el rol de Administrador
    const { data: adminRole } = await supabase
      .from('roles')
      .select('id')
      .eq('code', 'ADMIN')
      .is('tenant_id', null)
      .limit(1)
      .maybeSingle()

    let roleId = adminRole?.id

    // Si no existe el rol ADMIN, buscar cualquier rol admin
    if (!roleId) {
      const { data: anyAdminRole } = await supabase
        .from('roles')
        .select('id')
        .ilike('code', '%admin%')
        .is('tenant_id', null)
        .limit(1)
        .maybeSingle()
      roleId = anyAdminRole?.id
    }

    // 8. Crear relación User-Tenant con rol de owner/admin
    if (roleId) {
      await supabase
        .from('user_tenants')
        .insert({
          user_id: user.id,
          tenant_id: tenant.id,
          is_owner: true,
          role_id: roleId,
          invitation_status: 'activa',
          joined_at: new Date().toISOString(),
        })

      // 9. Asignar rol al usuario
      await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          tenant_id: tenant.id,
          role_id: roleId,
        })
    }

    // 10. Crear suscripción en modo TRIAL (sin plan específico - acceso completo)
    await supabase
      .from('subscriptions')
      .insert({
        tenant_id: tenant.id,
        plan_id: null,
        status: 'trial',
        trial_ends_at: trialEndsAt.toISOString(),
        current_period_start: new Date().toISOString(),
        current_period_end: trialEndsAt.toISOString(),
        metadata: {
          trial_type: 'full_access',
          registered_from: 'checkout',
          registered_at: new Date().toISOString(),
        },
      })

    // 11. Activar TODOS los módulos para el tenant (trial completo)
    const { data: allModules } = await supabase
      .from('modules')
      .select('id')

    if (allModules && allModules.length > 0) {
      const moduleInserts = allModules.map(m => ({
        tenant_id: tenant.id,
        module_id: m.id,
        is_active: true,
      }))

      await supabase
        .from('tenant_modules')
        .insert(moduleInserts)
    }

    // 12. Registrar en audit_logs
    await supabase
      .from('audit_logs')
      .insert({
        tenant_id: tenant.id,
        user_id: user.id,
        user_email: user.email,
        user_name: `${user.first_name} ${user.last_name}`,
        action: 'create',
        entity_type: 'tenant',
        entity_id: tenant.id,
        description: `Nuevo registro de prueba gratis (acceso completo): ${body.company.name}`,
        severity: 'info',
        metadata: {
          trial_ends_at: trialEndsAt.toISOString(),
          company_industry: body.company.industry,
          company_employees: body.company.employees,
        },
      })

    // 13. TODO: Enviar email de bienvenida
    console.log(`📧 Email de bienvenida pendiente para: ${user.email}`)
    console.log(`   Empresa: ${tenant.name}`)
    console.log(`   Trial termina: ${trialEndsAt.toLocaleDateString('es-GT')}`)

    // Retornar datos para auto-login
    return {
      success: true,
      message: 'Cuenta creada exitosamente',
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
        trial: {
          endsAt: trialEndsAt.toISOString(),
          daysRemaining: 14,
          type: 'full_access',
        },
      },
    }
  }
  catch (error: any) {
    console.error('Error en register-trial:', error)
    
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Error interno del servidor',
    })
  }
})
