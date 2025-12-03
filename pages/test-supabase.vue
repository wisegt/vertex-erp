<script setup lang="ts">
/**
 * Página de prueba para verificar la conexión con Supabase
 * Ruta: /test-supabase
 */

definePageMeta({
  layout: 'blank',
})

const supabase = useSupabase()

// Estado
const connectionStatus = ref<'loading' | 'success' | 'error'>('loading')
const errorMessage = ref('')
const tables = ref<Array<{ schema: string; name: string }>>([])
const testData = ref<any[]>([])
const selectedTable = ref('')
const selectedSchema = ref('public')
const tableName = ref('')

// Esquemas disponibles
const schemas = ['public', 'core']

// Probar conexión
const testConnection = async () => {
  connectionStatus.value = 'loading'
  errorMessage.value = ''

  try {
    // Verificar conexión con auth
    const { error: pingError } = await supabase.auth.getSession()

    if (pingError && !pingError.message.includes('session'))
      throw pingError

    connectionStatus.value = 'success'
  }
  catch (err: any) {
    connectionStatus.value = 'error'
    errorMessage.value = err.message || 'Error de conexión'
  }
}

// Cargar datos de una tabla
const loadTableData = async () => {
  if (!tableName.value)
    return

  testData.value = []
  errorMessage.value = ''

  try {
    // Para esquema 'core', necesitamos usar la función rpc o query directo
    let query

    if (selectedSchema.value === 'public') {
      query = supabase.from(tableName.value).select('*').limit(10)
    }
    else {
      // Para otros esquemas, usar el nombre completo schema.tabla
      query = supabase.from(`${selectedSchema.value}.${tableName.value}`).select('*').limit(10)
    }

    const { data, error } = await query

    if (error)
      throw error

    testData.value = data || []
  }
  catch (err: any) {
    errorMessage.value = `Error al cargar ${selectedSchema.value}.${tableName.value}: ${err.message}`
    testData.value = []
  }
}

// Ejecutar al montar
onMounted(() => {
  testConnection()
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
            🔌 Test de Conexión Supabase
          </VCardTitle>

          <VCardText>
            <!-- Estado de conexión -->
            <VAlert
              v-if="connectionStatus === 'loading'"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              <VProgressCircular
                indeterminate
                size="20"
                class="me-2"
              />
              Probando conexión...
            </VAlert>

            <VAlert
              v-else-if="connectionStatus === 'success'"
              type="success"
              variant="tonal"
              class="mb-4"
            >
              ✅ Conexión exitosa con Supabase
            </VAlert>

            <VAlert
              v-else-if="connectionStatus === 'error'"
              type="error"
              variant="tonal"
              class="mb-4"
            >
              ❌ Error de conexión: {{ errorMessage }}
            </VAlert>

            <!-- Información de configuración -->
            <VCard
              variant="outlined"
              class="mb-4"
            >
              <VCardTitle class="text-subtitle-1">
                📋 Configuración
              </VCardTitle>
              <VCardText>
                <VList density="compact">
                  <VListItem>
                    <template #prepend>
                      <VIcon
                        icon="ri-link"
                        size="small"
                      />
                    </template>
                    <VListItemTitle>URL de Supabase</VListItemTitle>
                    <VListItemSubtitle class="text-truncate">
                      {{ useRuntimeConfig().public.supabaseUrl || 'No configurada' }}
                    </VListItemSubtitle>
                  </VListItem>
                  <VListItem>
                    <template #prepend>
                      <VIcon
                        icon="ri-key-line"
                        size="small"
                      />
                    </template>
                    <VListItemTitle>Anon Key</VListItemTitle>
                    <VListItemSubtitle>
                      {{ useRuntimeConfig().public.supabaseAnonKey ? `••••••••${useRuntimeConfig().public.supabaseAnonKey.slice(-8)}` : 'No configurada' }}
                    </VListItemSubtitle>
                  </VListItem>
                </VList>
              </VCardText>
            </VCard>

            <!-- Buscar tabla manualmente -->
            <template v-if="connectionStatus === 'success'">
              <VCard
                variant="outlined"
                class="mb-4"
              >
                <VCardTitle class="text-subtitle-1">
                  🔍 Consultar una tabla
                </VCardTitle>
                <VCardText>
                  <VRow>
                    <VCol
                      cols="12"
                      md="4"
                    >
                      <VSelect
                        v-model="selectedSchema"
                        :items="schemas"
                        label="Esquema"
                        variant="outlined"
                        density="compact"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="5"
                    >
                      <VTextField
                        v-model="tableName"
                        label="Nombre de la tabla"
                        placeholder="ej: productos, usuarios, test"
                        variant="outlined"
                        density="compact"
                        @keyup.enter="loadTableData"
                      />
                    </VCol>
                    <VCol
                      cols="12"
                      md="3"
                    >
                      <VBtn
                        color="primary"
                        block
                        :disabled="!tableName"
                        @click="loadTableData"
                      >
                        <VIcon
                          icon="ri-search-line"
                          class="me-1"
                        />
                        Buscar
                      </VBtn>
                    </VCol>
                  </VRow>
                </VCardText>
              </VCard>

              <!-- Error al cargar -->
              <VAlert
                v-if="errorMessage"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="errorMessage = ''"
              >
                {{ errorMessage }}
              </VAlert>

              <!-- Datos de la tabla -->
              <VCard
                v-if="testData.length > 0"
                variant="outlined"
              >
                <VCardTitle class="text-subtitle-1">
                  📊 Datos de {{ selectedSchema }}.{{ tableName }} (máx. 10 registros)
                </VCardTitle>
                <VCardText>
                  <div style="overflow-x: auto;">
                    <VTable density="compact">
                      <thead>
                        <tr>
                          <th
                            v-for="key in Object.keys(testData[0])"
                            :key="key"
                            class="text-no-wrap"
                          >
                            {{ key }}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(row, index) in testData"
                          :key="index"
                        >
                          <td
                            v-for="key in Object.keys(row)"
                            :key="key"
                            class="text-truncate"
                            style="max-width: 200px;"
                          >
                            {{ row[key] }}
                          </td>
                        </tr>
                      </tbody>
                    </VTable>
                  </div>
                </VCardText>
              </VCard>

              <VAlert
                v-else-if="tableName && !errorMessage && testData.length === 0"
                type="info"
                variant="tonal"
              >
                La tabla {{ selectedSchema }}.{{ tableName }} está vacía o no se ha consultado aún.
              </VAlert>
            </template>
          </VCardText>

          <VCardActions class="justify-center">
            <VBtn
              color="primary"
              variant="elevated"
              @click="testConnection"
            >
              <VIcon
                icon="ri-refresh-line"
                class="me-2"
              />
              Probar de nuevo
            </VBtn>

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
