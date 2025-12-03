import { Pool } from 'pg'

/**
 * Endpoint para probar la conexión al pooler de Supabase
 * POST /api/test-pooler
 * Body:
 * {
 *   host: string (ej: "aws-1-us-east-1.pooler.supabase.com")
 *   port: number (default: 5432)
 *   database: string (default: "postgres")
 *   user: string (ej: "postgres.vdgmgkftqxwxfqmaylxx")
 *   password: string
 * }
 */
export default defineEventHandler(async event => {
  // Solo permitir POST
  if (event.node.req.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  const body = await readBody(event)

  const {
    host = 'aws-1-us-east-1.pooler.supabase.com',
    port = 5432,
    database = 'postgres',
    user,
    password,
  } = body

  // Validar credenciales requeridas
  if (!user || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'user y password son requeridos',
    })
  }

  const pool = new Pool({
    host,
    port: Number(port),
    database,
    user,
    password,
    ssl: {
      rejectUnauthorized: false, // Supabase requiere SSL
    },
    connectionTimeoutMillis: 10000, // 10 segundos timeout
    idleTimeoutMillis: 30000,
    max: 1, // Solo una conexión para la prueba
  })

  const startTime = Date.now()
  let connectionTime = 0
  let queryTime = 0
  let serverVersion = ''
  let currentDatabase = ''
  let currentUser = ''
  let error: any = null

  try {
    // Probar conexión
    const client = await pool.connect()

    connectionTime = Date.now() - startTime

    try {
      // Ejecutar query de prueba
      const queryStartTime = Date.now()
      const result = await client.query('SELECT version(), current_database(), current_user, NOW() as server_time')

      queryTime = Date.now() - queryStartTime

      serverVersion = result.rows[0].version
      currentDatabase = result.rows[0].current_database
      currentUser = result.rows[0].current_user

      // Cerrar conexión
      client.release()
    }
    catch (queryError) {
      client.release()
      throw queryError
    }

    // Cerrar pool
    await pool.end()

    return {
      success: true,
      message: 'Conexión exitosa al pooler de Supabase',
      timing: {
        connectionTime: `${connectionTime}ms`,
        queryTime: `${queryTime}ms`,
        totalTime: `${Date.now() - startTime}ms`,
      },
      serverInfo: {
        version: serverVersion,
        database: currentDatabase,
        user: currentUser,
        host,
        port,
      },
    }
  }
  catch (err: any) {
    error = {
      message: err.message,
      code: err.code,
      detail: err.detail,
      hint: err.hint,
    }

    // Intentar cerrar el pool si está abierto
    try {
      await pool.end()
    }
    catch {
      // Ignorar errores al cerrar
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Error de conexión al pooler',
      data: {
        error,
        timing: {
          connectionTime: connectionTime > 0 ? `${connectionTime}ms` : 'timeout',
          totalTime: `${Date.now() - startTime}ms`,
        },
      },
    })
  }
})
