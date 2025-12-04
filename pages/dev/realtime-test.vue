<script setup lang="ts">
/**
 * Página de prueba para verificar Supabase Realtime
 * Acceder en: /dev/realtime-test
 */

definePageMeta({
  layout: 'blank',
  public: true,
})

const { $supabase } = useNuxtApp()

const logs = ref<string[]>([])
const isConnected = ref(false)
const currentDiscount = ref<any>(null)
const channel = ref<any>(null)

const addLog = (message: string) => {
  const timestamp = new Date().toLocaleTimeString()
  logs.value.unshift(`[${timestamp}] ${message}`)
  console.log(message)
}

const connect = async () => {
  if (!$supabase) {
    addLog('❌ Supabase client not available')
    return
  }

  addLog('🔄 Connecting to Realtime...')

  try {
    channel.value = $supabase
      .channel('test-billing-settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'core',
          table: 'billing_settings',
        },
        (payload: any) => {
          addLog(`📡 Received UPDATE: ${JSON.stringify(payload.new)}`)
          if (payload.new?.key === 'annual_discount') {
            currentDiscount.value = payload.new.value
          }
        }
      )
      .subscribe((status: string, err?: Error) => {
        addLog(`📶 Status: ${status}`)
        if (err) {
          addLog(`❌ Error: ${err.message}`)
        }
        isConnected.value = status === 'SUBSCRIBED'
      })
  } catch (e: any) {
    addLog(`❌ Exception: ${e.message}`)
  }
}

const disconnect = () => {
  if (channel.value) {
    channel.value.unsubscribe()
    channel.value = null
    isConnected.value = false
    addLog('🔌 Disconnected')
  }
}

const fetchCurrentDiscount = async () => {
  try {
    const response = await $fetch('/api/billing/settings')
    if (response.success) {
      currentDiscount.value = response.data.annualDiscount
      addLog(`📥 Fetched current discount: ${JSON.stringify(currentDiscount.value)}`)
    }
  } catch (e: any) {
    addLog(`❌ Fetch error: ${e.message}`)
  }
}

const updateDiscount = async (percentage: number) => {
  try {
    const response = await $fetch('/api/billing/settings', {
      method: 'POST',
      body: {
        key: 'annual_discount',
        value: {
          percentage,
          months_free: 2,
          label: `−${percentage}%`,
          promo_text: `¡${percentage}% de descuento anual!`,
        },
      },
    })
    addLog(`✅ Updated discount to ${percentage}%: ${JSON.stringify(response)}`)
  } catch (e: any) {
    addLog(`❌ Update error: ${e.message}`)
  }
}

onMounted(() => {
  addLog('🚀 Page mounted')
  addLog(`📦 Supabase client: ${$supabase ? '✓ Available' : '✗ Not available'}`)
  fetchCurrentDiscount()
})

onUnmounted(() => {
  disconnect()
})
</script>

<template>
  <VContainer class="py-8">
    <VCard>
      <VCardTitle class="d-flex align-center gap-2">
        <VIcon icon="ri-broadcast-line" />
        Supabase Realtime Test
        <VSpacer />
        <VChip :color="isConnected ? 'success' : 'error'" size="small">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </VChip>
      </VCardTitle>

      <VCardText>
        <!-- Connection Controls -->
        <div class="d-flex gap-2 mb-4">
          <VBtn
            color="primary"
            :disabled="isConnected"
            @click="connect"
          >
            <VIcon icon="ri-wifi-line" class="me-2" />
            Connect
          </VBtn>
          <VBtn
            color="error"
            :disabled="!isConnected"
            @click="disconnect"
          >
            <VIcon icon="ri-wifi-off-line" class="me-2" />
            Disconnect
          </VBtn>
          <VBtn
            color="secondary"
            @click="fetchCurrentDiscount"
          >
            <VIcon icon="ri-refresh-line" class="me-2" />
            Fetch Current
          </VBtn>
        </div>

        <!-- Current Discount -->
        <VAlert v-if="currentDiscount" color="info" variant="tonal" class="mb-4">
          <div class="text-h6">Current Discount</div>
          <pre class="text-caption">{{ JSON.stringify(currentDiscount, null, 2) }}</pre>
        </VAlert>

        <!-- Test Buttons -->
        <div class="d-flex gap-2 mb-4 flex-wrap">
          <VBtn
            v-for="pct in [10, 15, 17, 20, 25, 30]"
            :key="pct"
            size="small"
            variant="outlined"
            @click="updateDiscount(pct)"
          >
            Set {{ pct }}%
          </VBtn>
        </div>

        <VDivider class="my-4" />

        <!-- Logs -->
        <div class="text-h6 mb-2">Logs</div>
        <VCard variant="outlined" class="pa-4" style="max-height: 400px; overflow-y: auto;">
          <div v-for="(log, i) in logs" :key="i" class="text-caption font-monospace">
            {{ log }}
          </div>
          <div v-if="logs.length === 0" class="text-medium-emphasis">
            No logs yet...
          </div>
        </VCard>
      </VCardText>
    </VCard>
  </VContainer>
</template>
