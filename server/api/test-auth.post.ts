import bcrypt from 'bcrypt'
import { getSupabaseAdmin } from '@/server/utils/supabase'

export default defineEventHandler(async event => {
  try {
    const body = await readBody(event)
    const { email, password } = body

    const supabase = getSupabaseAdmin()

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, status')
      .eq('email', email.toLowerCase().trim())
      .single()

    if (error || !user)
      return { success: false, error: 'Usuario no encontrado' }

    const valid = await bcrypt.compare(password, user.password_hash)

    return {
      success: valid,
      message: valid ? '✅ Autenticación exitosa!' : 'Contraseña incorrecta',
      user: valid ? { id: user.id, email: user.email, name: `${user.first_name} ${user.last_name}` } : null,
    }
  }
  catch (err: any) {
    return { success: false, error: err.message }
  }
})
