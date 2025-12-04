/**
 * Indicador de conexión Realtime - Solo para desarrollo/debugging
 * Muestra un pequeño badge indicando el estado de conexión WebSocket
 */
<script setup lang="ts">
interface Props {
  isConnected: boolean
  label?: string
  showInProduction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Realtime',
  showInProduction: false,
})

const isDev = process.env.NODE_ENV === 'development'

// Solo mostrar en desarrollo o si se fuerza
const shouldShow = computed(() => isDev || props.showInProduction)
</script>

<template>
  <div v-if="shouldShow" class="realtime-indicator">
    <VTooltip location="bottom">
      <template #activator="{ props: tooltipProps }">
        <VChip
          v-bind="tooltipProps"
          :color="isConnected ? 'success' : 'error'"
          size="x-small"
          variant="flat"
          class="realtime-chip"
        >
          <VIcon 
            :icon="isConnected ? 'ri-wifi-line' : 'ri-wifi-off-line'" 
            size="12" 
            class="me-1"
          />
          <span class="realtime-dot" :class="{ connected: isConnected }" />
        </VChip>
      </template>
      <span>
        {{ label }}: {{ isConnected ? 'Conectado' : 'Desconectado' }}
      </span>
    </VTooltip>
  </div>
</template>

<style scoped>
.realtime-indicator {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
}

.realtime-chip {
  cursor: help;
}

.realtime-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 2s infinite;
}

.realtime-dot.connected {
  animation: pulse-connected 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes pulse-connected {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}
</style>
