# 📝 Instrucciones para Crear Tabla en Supabase

## ⚠️ IMPORTANTE: Debes hacer esto AHORA

El sistema necesita la tabla `account_setup_tokens` para funcionar. Sin ella, verás el error "Enlace inválido".

## 🚀 Paso a Paso

### 1️⃣ Ve a Supabase SQL Editor

1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Click en "SQL Editor" en el menú izquierdo
4. Click en "+ New Query"

### 2️⃣ Copia y Pega este SQL

```sql
-- Crear tabla para tokens de setup
CREATE TABLE IF NOT EXISTS account_setup_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  checkout_id VARCHAR(100) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_account_setup_tokens_email 
  ON account_setup_tokens(email);

CREATE INDEX IF NOT EXISTS idx_account_setup_tokens_token 
  ON account_setup_tokens(token);

CREATE INDEX IF NOT EXISTS idx_account_setup_tokens_checkout 
  ON account_setup_tokens(checkout_id);

-- Comentarios
COMMENT ON TABLE account_setup_tokens IS 'Tokens temporales para configurar cuenta después del pago';
COMMENT ON COLUMN account_setup_tokens.token IS 'Token único para el enlace de configuración';
COMMENT ON COLUMN account_setup_tokens.expires_at IS 'El token expira 24 horas después de crearse';
```

### 3️⃣ Click en "RUN" (o presiona Ctrl+Enter)

Deberías ver: "Success. No rows returned"

### 4️⃣ Verificar que se creó

En el SQL Editor, ejecuta:

```sql
SELECT * FROM account_setup_tokens LIMIT 1;
```

Debería mostrar la estructura de la tabla (aunque esté vacía).

## ✅ Listo

Una vez creada la tabla, el flujo completo funcionará:

1. Usuario completa el pago
2. Sistema guarda token en esta tabla
3. Envía email con el token
4. Usuario puede crear su cuenta

## 🎯 Ahora Prueba de Nuevo

1. Ve a `/payment`
2. Completa un pago nuevo
3. En `payment-success` verás el botón "Crear mi cuenta"
4. La consola del servidor mostrará el setup URL (si no tienes Resend configurado)
5. Copia el URL y ábrelo
6. Ahora SÍ debería funcionar ✅

---

**¿Ya creaste la tabla? Avísame y probamos el flujo completo.** 🚀

