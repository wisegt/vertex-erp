-- ============================================================================
-- TABLA: account_setup_tokens
-- ============================================================================
-- Almacena tokens temporales para que usuarios sin cuenta puedan configurarla
-- después de completar el pago
-- ============================================================================

CREATE TABLE IF NOT EXISTS account_setup_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

-- Email del usuario que recibirá el enlace
email VARCHAR(255) NOT NULL,

-- Token único
token VARCHAR(255) NOT NULL UNIQUE,

-- ID del checkout de Recurrente
checkout_id VARCHAR(100) NOT NULL,

-- Fecha de expiración (24 horas después de creado)
expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

-- Si el token ya fue usado
used BOOLEAN NOT NULL DEFAULT false,
used_at TIMESTAMP WITH TIME ZONE,

-- Timestamps
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

-- Índices
INDEX idx_account_setup_tokens_email (email),
  INDEX idx_account_setup_tokens_token (token),
  INDEX idx_account_setup_tokens_checkout (checkout_id)
);

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE account_setup_tokens IS 'Tokens temporales para configurar cuenta después del pago';

COMMENT ON COLUMN account_setup_tokens.token IS 'Token único para el enlace de configuración';

COMMENT ON COLUMN account_setup_tokens.expires_at IS 'El token expira 24 horas después de crearse';

-- ============================================================================
-- FUNCIÓN PARA LIMPIAR TOKENS EXPIRADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_setup_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM account_setup_tokens
  WHERE expires_at < NOW() OR (used = true AND used_at < NOW() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_setup_tokens IS 'Elimina tokens expirados o usados hace más de 7 días';

-- ============================================================================
-- DATOS DE EJEMPLO (Opcional, solo para desarrollo)
-- ============================================================================

-- Descomentar para insertar token de prueba
/*
INSERT INTO account_setup_tokens (
email,
token,
checkout_id,
expires_at
) VALUES (
'prueba@empresa.com',
'setup_test_123456',
'ch_test_123',
NOW() + INTERVAL '24 hours'
);
*/
