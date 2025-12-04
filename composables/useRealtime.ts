/**
 * ============================================================================
 * SUPABASE REALTIME COMPOSABLE
 * ============================================================================
 * Composable centralizado para manejar suscripciones en tiempo real.
 * 
 * USO BÁSICO:
 * ```ts
 * const { subscribe, unsubscribe } = useRealtime()
 * 
 * // Suscribirse a cambios en una tabla
 * subscribe('inventory-updates', {
 *   schema: 'public',
 *   table: 'products',
 *   filter: `tenant_id=eq.${tenantId}`,
 *   onInsert: (payload) => { ... },
 *   onUpdate: (payload) => { ... },
 *   onDelete: (payload) => { ... },
 * })
 * 
 * // Limpiar al desmontar
 * onUnmounted(() => unsubscribe('inventory-updates'))
 * ```
 * 
 * CASOS DE USO EN VERTEX ERP:
 * 
 * 1. CONFIGURACIÓN GLOBAL (billing_settings, etc.)
 *    - Actualización de descuentos, IVA, moneda
 *    - Sin filtro de tenant (configuración global)
 * 
 * 2. INVENTARIO (multi-tenant)
 *    - Cambios en productos, movimientos, existencias
 *    - Filtro por tenant_id
 * 
 * 3. FACTURACIÓN / POS
 *    - Nuevas facturas, actualizaciones de estado
 *    - Sincronización entre terminales POS
 * 
 * 4. NOTIFICACIONES
 *    - Alertas de stock bajo
 *    - Nuevos tickets de soporte
 *    - Cambios en el sistema
 * 
 * 5. DASHBOARD KPIs
 *    - Ventas en tiempo real
 *    - Flujo de caja
 *    - Métricas operativas
 * 
 * 6. EDICIÓN COLABORATIVA
 *    - Bloqueo optimista
 *    - Detección de conflictos
 */

import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface SubscriptionOptions {
  /** Schema de la tabla (default: 'core') */
  schema?: string
  /** Nombre de la tabla */
  table: string
  /** Filtro opcional (ej: 'tenant_id=eq.123') */
  filter?: string
  /** Eventos a escuchar (default: '*') */
  event?: PostgresChangeEvent
  /** Callback para INSERT */
  onInsert?: (payload: RealtimePostgresChangesPayload<any>) => void
  /** Callback para UPDATE */
  onUpdate?: (payload: RealtimePostgresChangesPayload<any>) => void
  /** Callback para DELETE */
  onDelete?: (payload: RealtimePostgresChangesPayload<any>) => void
  /** Callback para cualquier evento */
  onChange?: (payload: RealtimePostgresChangesPayload<any>) => void
  /** Callback cuando la suscripción está lista */
  onSubscribed?: () => void
  /** Callback para errores */
  onError?: (error: Error) => void
}

interface ActiveSubscription {
  channel: RealtimeChannel
  options: SubscriptionOptions
}

export const useRealtime = () => {
  const { $supabase } = useNuxtApp()
  
  // Almacén de suscripciones activas
  const subscriptions = ref<Map<string, ActiveSubscription>>(new Map())
  
  // Estado de conexión
  const isConnected = ref(false)
  const connectionError = ref<string | null>(null)

  /**
   * Suscribirse a cambios en una tabla
   */
  const subscribe = (
    channelName: string,
    options: SubscriptionOptions
  ): RealtimeChannel | null => {
    if (!$supabase) {
      console.warn('[Realtime] Supabase client not available')
      return null
    }

    // Si ya existe una suscripción con ese nombre, la removemos primero
    if (subscriptions.value.has(channelName)) {
      unsubscribe(channelName)
    }

    const {
      schema = 'core',
      table,
      filter,
      event = '*',
      onInsert,
      onUpdate,
      onDelete,
      onChange,
      onSubscribed,
      onError,
    } = options

    try {
      // Crear canal
      const channel = $supabase.channel(channelName)

      // Configurar listener de postgres_changes
      const changeConfig: any = {
        event,
        schema,
        table,
      }

      if (filter) {
        changeConfig.filter = filter
      }

      channel.on(
        'postgres_changes',
        changeConfig,
        (payload: RealtimePostgresChangesPayload<any>) => {
          // Callback general
          if (onChange) {
            onChange(payload)
          }

          // Callbacks específicos por evento
          switch (payload.eventType) {
            case 'INSERT':
              if (onInsert) onInsert(payload)
              break
            case 'UPDATE':
              if (onUpdate) onUpdate(payload)
              break
            case 'DELETE':
              if (onDelete) onDelete(payload)
              break
          }
        }
      )

      // Suscribirse
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          isConnected.value = true
          connectionError.value = null
          console.log(`[Realtime] ✓ Subscribed to ${channelName} (${schema}.${table})`)
          if (onSubscribed) onSubscribed()
        } else if (status === 'CHANNEL_ERROR') {
          connectionError.value = `Error subscribing to ${channelName}`
          console.error(`[Realtime] ✗ Error subscribing to ${channelName}`)
          if (onError) onError(new Error(connectionError.value))
        } else if (status === 'CLOSED') {
          console.log(`[Realtime] Channel ${channelName} closed`)
        }
      })

      // Guardar referencia
      subscriptions.value.set(channelName, { channel, options })

      return channel
    } catch (error: any) {
      console.error(`[Realtime] Failed to subscribe to ${channelName}:`, error)
      if (onError) onError(error)
      return null
    }
  }

  /**
   * Cancelar una suscripción
   */
  const unsubscribe = (channelName: string): boolean => {
    const subscription = subscriptions.value.get(channelName)
    
    if (!subscription) {
      return false
    }

    try {
      subscription.channel.unsubscribe()
      subscriptions.value.delete(channelName)
      console.log(`[Realtime] Unsubscribed from ${channelName}`)
      return true
    } catch (error) {
      console.error(`[Realtime] Error unsubscribing from ${channelName}:`, error)
      return false
    }
  }

  /**
   * Cancelar todas las suscripciones
   */
  const unsubscribeAll = () => {
    subscriptions.value.forEach((_, channelName) => {
      unsubscribe(channelName)
    })
    isConnected.value = false
  }

  /**
   * Obtener lista de suscripciones activas
   */
  const getActiveSubscriptions = () => {
    return Array.from(subscriptions.value.keys())
  }

  /**
   * Verificar si una suscripción está activa
   */
  const isSubscribed = (channelName: string): boolean => {
    return subscriptions.value.has(channelName)
  }

  // Limpiar suscripciones cuando el componente se desmonta
  onUnmounted(() => {
    unsubscribeAll()
  })

  return {
    // State
    isConnected: readonly(isConnected),
    connectionError: readonly(connectionError),
    
    // Methods
    subscribe,
    unsubscribe,
    unsubscribeAll,
    getActiveSubscriptions,
    isSubscribed,
  }
}

// ============================================================================
// COMPOSABLES ESPECIALIZADOS PARA CASOS DE USO COMUNES
// ============================================================================

/**
 * Suscripción a configuración global (billing_settings, etc.)
 */
export const useRealtimeSettings = () => {
  const { subscribe, unsubscribe, isConnected } = useRealtime()
  
  const subscribeToSettings = (
    onUpdate: (key: string, value: any) => void,
    options?: { onSubscribed?: () => void }
  ) => {
    return subscribe('global-settings', {
      schema: 'core',
      table: 'billing_settings',
      event: 'UPDATE',
      onUpdate: (payload) => {
        const { new: newRecord } = payload
        if (newRecord) {
          onUpdate(newRecord.key, newRecord.value)
        }
      },
      onSubscribed: options?.onSubscribed,
    })
  }

  const unsubscribeFromSettings = () => {
    unsubscribe('global-settings')
  }

  return {
    isConnected,
    subscribeToSettings,
    unsubscribeFromSettings,
  }
}

/**
 * Suscripción a cambios de inventario (multi-tenant)
 * 
 * Ejemplo de uso:
 * ```ts
 * const { subscribeToInventory } = useRealtimeInventory()
 * 
 * subscribeToInventory(tenantId, {
 *   onProductUpdate: (product) => { ... },
 *   onStockChange: (movement) => { ... },
 * })
 * ```
 */
export const useRealtimeInventory = () => {
  const { subscribe, unsubscribe, isConnected } = useRealtime()

  const subscribeToInventory = (
    tenantId: string,
    callbacks: {
      onProductUpdate?: (product: any) => void
      onProductInsert?: (product: any) => void
      onProductDelete?: (productId: string) => void
    }
  ) => {
    return subscribe(`tenant:${tenantId}:inventory`, {
      schema: 'inventory', // Cambiar según tu schema
      table: 'products',
      filter: `tenant_id=eq.${tenantId}`,
      onInsert: (payload) => {
        if (callbacks.onProductInsert) {
          callbacks.onProductInsert(payload.new)
        }
      },
      onUpdate: (payload) => {
        if (callbacks.onProductUpdate) {
          callbacks.onProductUpdate(payload.new)
        }
      },
      onDelete: (payload) => {
        if (callbacks.onProductDelete) {
          callbacks.onProductDelete(payload.old?.id)
        }
      },
    })
  }

  const unsubscribeFromInventory = (tenantId: string) => {
    unsubscribe(`tenant:${tenantId}:inventory`)
  }

  return {
    isConnected,
    subscribeToInventory,
    unsubscribeFromInventory,
  }
}

/**
 * Suscripción a notificaciones (multi-tenant)
 * 
 * Ejemplo de uso:
 * ```ts
 * const { subscribeToNotifications } = useRealtimeNotifications()
 * 
 * subscribeToNotifications(tenantId, userId, {
 *   onNewNotification: (notification) => {
 *     toast.info(notification.title)
 *   }
 * })
 * ```
 */
export const useRealtimeNotifications = () => {
  const { subscribe, unsubscribe, isConnected } = useRealtime()

  const subscribeToNotifications = (
    tenantId: string,
    userId: string,
    callbacks: {
      onNewNotification?: (notification: any) => void
      onNotificationRead?: (notificationId: string) => void
    }
  ) => {
    return subscribe(`tenant:${tenantId}:user:${userId}:notifications`, {
      schema: 'core',
      table: 'notifications',
      filter: `tenant_id=eq.${tenantId},user_id=eq.${userId}`,
      onInsert: (payload) => {
        if (callbacks.onNewNotification) {
          callbacks.onNewNotification(payload.new)
        }
      },
      onUpdate: (payload) => {
        if (payload.new?.read_at && callbacks.onNotificationRead) {
          callbacks.onNotificationRead(payload.new.id)
        }
      },
    })
  }

  const unsubscribeFromNotifications = (tenantId: string, userId: string) => {
    unsubscribe(`tenant:${tenantId}:user:${userId}:notifications`)
  }

  return {
    isConnected,
    subscribeToNotifications,
    unsubscribeFromNotifications,
  }
}

/**
 * Suscripción a dashboard KPIs (multi-tenant)
 */
export const useRealtimeDashboard = () => {
  const { subscribe, unsubscribe, isConnected } = useRealtime()

  const subscribeToDashboard = (
    tenantId: string,
    callbacks: {
      onSaleCreated?: (sale: any) => void
      onInvoiceUpdated?: (invoice: any) => void
      onPaymentReceived?: (payment: any) => void
    }
  ) => {
    // Suscribirse a múltiples tablas para el dashboard
    subscribe(`tenant:${tenantId}:dashboard:sales`, {
      schema: 'invoicing',
      table: 'invoices',
      filter: `tenant_id=eq.${tenantId}`,
      onInsert: (payload) => {
        if (callbacks.onSaleCreated) {
          callbacks.onSaleCreated(payload.new)
        }
      },
      onUpdate: (payload) => {
        if (callbacks.onInvoiceUpdated) {
          callbacks.onInvoiceUpdated(payload.new)
        }
      },
    })

    subscribe(`tenant:${tenantId}:dashboard:payments`, {
      schema: 'banking',
      table: 'payments',
      filter: `tenant_id=eq.${tenantId}`,
      onInsert: (payload) => {
        if (callbacks.onPaymentReceived) {
          callbacks.onPaymentReceived(payload.new)
        }
      },
    })
  }

  const unsubscribeFromDashboard = (tenantId: string) => {
    unsubscribe(`tenant:${tenantId}:dashboard:sales`)
    unsubscribe(`tenant:${tenantId}:dashboard:payments`)
  }

  return {
    isConnected,
    subscribeToDashboard,
    unsubscribeFromDashboard,
  }
}
