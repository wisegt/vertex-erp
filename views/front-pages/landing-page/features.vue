<script setup lang="ts">
import sectionTitleIcon from '@images/pages/section-title-icon.png'

const featuresData = [
  { 
    title: 'Facturación Electrónica', 
    desc: 'Emisión de facturas FEL certificadas por SAT Guatemala. Notas de crédito, débito y documentos fiscales integrados.', 
    icon: 'ri-file-text-line',
    color: 'primary'
  },
  { 
    title: 'Punto de Venta (POS)', 
    desc: 'Sistema de caja táctil ultrarrápido. Funciona offline, integra lectores de código de barras y genera FEL automáticamente.', 
    icon: 'ri-store-2-line',
    color: 'success'
  },
  { 
    title: 'Contabilidad', 
    desc: 'Catálogo de cuentas flexible, pólizas automáticas, libro mayor, balances y estados financieros en tiempo real.', 
    icon: 'ri-calculator-line',
    color: 'warning'
  },
  { 
    title: 'Inventario', 
    desc: 'Control de stock multi-bodega, kardex, ajustes, traslados y costeo automático (promedio, FIFO, LIFO).', 
    icon: 'ri-archive-line',
    color: 'info'
  },
  { 
    title: 'Bancos', 
    desc: 'Gestión de cuentas bancarias, conciliación automática, flujo de caja y proyecciones financieras.', 
    icon: 'ri-bank-line',
    color: 'error'
  },
  { 
    title: 'Cuentas por Cobrar y Pagar', 
    desc: 'Seguimiento de clientes y proveedores, antigüedad de saldos, estados de cuenta y gestión inteligente.', 
    icon: 'ri-exchange-dollar-line',
    color: 'secondary'
  },
]
</script>

<template>
  <VContainer id="features">
    <div class="feature-cards">
      <div class="headers d-flex justify-center flex-column align-center mb-6">
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div
            class="text-body-1 text-high-emphasis font-weight-medium"
            style="letter-spacing: 0.15px !important;"
          >
            MÓDULOS INTEGRADOS
          </div>
        </div>

        <div class="mb-2 text-center">
          <span
            class="text-h4 d-inline-block font-weight-bold"
            style="line-height: 2rem;"
          >
            Todo lo que necesitas
          </span> <span class="text-h5 d-inline-block">para gestionar tu empresa</span>
        </div>

        <p
          class="text-body-1 font-weight-medium text-center"
          style="letter-spacing: 0.15px !important;"
        >
          Desde el punto de venta hasta los reportes financieros, cada módulo trabaja en conjunto para darte control total de tu negocio.
        </p>
      </div>

      <VRow>
        <VCol
          v-for="(data, index) in featuresData"
          :key="index"
          cols="12"
          sm="6"
          md="4"
        >
          <div class="feature d-flex flex-column gap-y-2 align-center justify-center mt-2">
            <VAvatar
              variant="outlined"
              size="84"
              :color="data.color"
              class="mb-2"
            >
              <VIcon
                :icon="data.icon"
                size="40"
              />
            </VAvatar>

            <h5 class="text-h5">
              {{ data.title }}
            </h5>
            <p
              class="text-center text-medium-emphasis"
              style="max-inline-size: 360px;"
            >
              {{ data.desc }}
            </p>
          </div>
        </VCol>
      </VRow>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.feature-cards {
  margin-block-end: 4.25rem;
}

#features{
  padding-block-start: 16rem;
}

@media (max-width: 960px ){
  #features{
    padding-block-start: 6rem;
  }
}

@media (max-width: 600px ){
  #features{
    padding-block-start: 2rem;
  }
}
</style>

<style lang="scss" scoped>
.feature{
  .v-avatar{
    &.v-avatar--variant-outlined{
      border: 2px solid currentColor;
      border-opacity: 0.32;

      &:hover{
        background: rgba(var(--v-theme-primary), 0.16);
        cursor: pointer;
      }
    }
  }
}
</style>
