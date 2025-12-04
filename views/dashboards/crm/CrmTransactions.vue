<script setup lang="ts">
const statistics = [
  {
    title: 'Ventas',
    stats: '245k',
    icon: 'ri-pie-chart-2-line',
    color: 'primary',
  },
  {
    title: 'Clientes',
    stats: '12.5k',
    icon: 'ri-group-line',
    color: 'success',
  },
  {
    title: 'Producto',
    stats: '1.54k',
    icon: 'ri-macbook-line',
    color: 'warning',
  },
]
</script>

<template>
  <VCard title="Transacciones">
    <template #subtitle>
      <p class="text-body-2 mb-0">
        <span class="d-inline-block font-weight-medium text-high-emphasis">Crecimiento total del 48.5%</span> <span class="text-high-emphasis">😎</span> este mes
      </p>
    </template>
    <VCardText>
      <VRow>
        <VCol
          v-for="item in statistics"
          :key="item.title"
          cols="12"
          sm="4"
        >
          <div class="d-flex align-center">
            <VAvatar
              :color="item.color"
              rounded
              size="40"
              class="elevation-1 me-3"
            >
              <VIcon
                size="24"
                :icon="item.icon"
              />
            </VAvatar>

            <div class="d-flex flex-column">
              <div class="text-body-1">
                {{ item.title }}
              </div>
              <h5 class="text-h5">
                {{ item.stats }}
              </h5>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
