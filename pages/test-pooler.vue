<script setup lang="ts">
/**
 * Página para probar la conexión al pooler de Supabase
 * Ruta: /test-pooler
 */

definePageMeta({
  layout: 'blank',
})

// Estado
const connectionStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')
const result = ref<any>(null)

// Formulario
const form = ref({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: '',
  password: '',
})

// Probar conexión
const testConnection = async () => {
  connectionStatus.value = 'loading'
  errorMessage.value = ''
  result.value = null

  try {
    const response = await $fetch('/api/test-pooler', {
      method: 'POST',
      body: form.value,
    })

    result.value = response
    connectionStatus.value = 'success'
  }
  catch (err: any) {
    connectionStatus.value = 'error'
    errorMessage.value = err.data?.error?.message || err.message || 'Error desconocido'
    result.value = err.data || null
  }
}

// Cargar valores desde variables de entorno si existen (solo en desarrollo)
onMounted(() => {
  // No exponer credenciales en el cliente, esto es solo para desarrollo local
  if (process.dev) {
    // El usuario debe ingresar las credenciales manualmente
  }
})
</script>

<template>
  <VContainer
    fluid
    class="fill-height"
  >
    <VRow
      justify="center"
      align="center"
    >
      <VCol
        cols="12"
        md="8"
        lg="6"
      >
        <VCard class="pa-6">
          <VCardTitle class="text-h4 text-center mb-4">
            🔌 Test de Conexión Pooler Supabase
          </VCardTitle>

          <VCardText>
            <!-- Formulario de conexión -->
            <VForm @submit.prevent="testConnection">
              <VTextField
                v-model="form.host"
                label="Host"
                placeholder="aws-1-us-east-1.pooler.supabase.com"
                variant="outlined"
                density="compact"
                class="mb-3"
                required
              />

              <VRow>
                <VCol cols="6">
                  <VTextField
                    v-model.number="form.port"
                    label="Puerto"
                    type="number"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                    required
                  />
                </VCol>
                <VCol cols="6">
                  <VTextField
                    v-model="form.database"
                    label="Base de datos"
                    variant="outlined"
                    density="compact"
                    class="mb-3"
                    required
                  />
                </VCol>
              </VRow>

              <VTextField
                v-model="form.user"
                label="Usuario"
                placeholder="postgres.vdgmgkftqxwxfqmaylxx"
                variant="outlined"
                density="compact"
                class="mb-3"
                required
              />

              <VTextField
                v-model="form.password"
                label="Contraseña"
                type="password"
                variant="outlined"
                density="compact"
                class="mb-3"
                required
              />

              <VBtn
                type="submit"
                color="primary"
                block
                :loading="connectionStatus === 'loading'"
                :disabled="!form.host || !form.user || !form.password"
              >
                <VIcon
                  icon="ri-plug-line"
                  class="me-2"
                />
                Probar Conexión
              </VBtn>
            </VForm>

            <!-- Estado de conexión -->
            <VAlert
              v-if="connectionStatus === 'loading'"
              type="info"
              variant="tonal"
              class="mt-4"
            >
              <VProgressCircular
                indeterminate
                size="20"
                class="me-2"
              />
              Probando conexión al pooler...
            </VAlert>

            <VAlert
              v-else-if="connectionStatus === 'success'"
              type="success"
              variant="tonal"
              class="mt-4"
            >
              ✅ Conexión exitosa al pooler de Supabase
            </VAlert>

            <VAlert
              v-else-if="connectionStatus === 'error'"
              type="error"
              variant="tonal"
              class="mt-4"
            >
              ❌ Error de conexión: {{ errorMessage }}
            </VAlert>

            <!-- Resultados -->
            <VCard
              v-if="result"
              variant="outlined"
              class="mt-4"
            >
              <VCardTitle class="text-subtitle-1">
                📊 Resultados
              </VCardTitle>
              <VCardText>
                <VList density="compact">
                  <VListItem v-if="result.timing">
                    <template #prepend>
                      <VIcon
                        icon="ri-time-line"
                        size="small"
                      />
                    </template>
                    <VListItemTitle>Tiempos</VListItemTitle>
                    <VListItemSubtitle>
                      Conexión: {{ result.timing.connectionTime }} | 
                      Query: {{ result.timing.queryTime }} | 
                      Total: {{ result.timing.totalTime }}
                    </VListItemSubtitle>
                  </VListItem>

                  <VListItem v-if="result.serverInfo">
                    <template #prepend>
                      <VIcon
                        icon="ri-server-line"
                        size="small"
                      />
                    </template>
                    <VListItemTitle>Información del Servidor</VListItemTitle>
                    <VListItemSubtitle>
                      <div class="mt-2">
                        <div><strong>Versión:</strong> {{ result.serverInfo.version }}</div>
                        <div><strong>Base de datos:</strong> {{ result.serverInfo.database }}</div>
                        <div><strong>Usuario:</strong> {{ result.serverInfo.user }}</div>
                        <div><strong>Host:</strong> {{ result.serverInfo.host }}:{{ result.serverInfo.port }}</div>
                      </div>
                    </VListItemSubtitle>
                  </VListItem>

                  <VListItem v-if="result.error">
                    <template #prepend>
                      <VIcon
                        icon="ri-error-warning-line"
                        size="small"
                      />
                    </template>
                    <VListItemTitle>Detalles del Error</VListItemTitle>
                    <VListItemSubtitle>
                      <div class="mt-2">
                        <div><strong>Código:</strong> {{ result.error.code }}</div>
                        <div><strong>Mensaje:</strong> {{ result.error.message }}</div>
                        <div v-if="result.error.detail"><strong>Detalle:</strong> {{ result.error.detail }}</div>
                        <div v-if="result.error.hint"><strong>Hint:</strong> {{ result.error.hint }}</div>
                      </div>
                    </VListItemSubtitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>
          </VCardText>

          <VCardActions class="justify-center">
            <VBtn
              color="secondary"
              variant="outlined"
              to="/"
            >
              <VIcon
                icon="ri-home-line"
                class="me-2"
              />
              Volver al inicio
            </VBtn>
          </VCardActions>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>

