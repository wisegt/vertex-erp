<script setup lang="ts">
import briefcase from '@images/cards/briefcase.png'
import logoCreditCard2 from '@images/cards/logo-credit-card-2.png'
import logoMastercardSmall from '@images/cards/logo-mastercard-small.png'

const savedCards = [
  {
    logo: logoMastercardSmall,
    type: 'Tarjeta de crédito',
    number: '2566 xxxx xxxx 8908',
  },
  {
    logo: logoCreditCard2,
    type: 'Tarjeta de crédito',
    number: '8990 xxxx xxxx 6852',
  },
]
</script>

<template>
  <VCard>
    <!-- SECTION Card Header and Menu -->
    <VCardItem>
      <!-- 👉 Title -->
      <VCardTitle>Actualiza tu plan</VCardTitle>

      <!-- 👉 menu -->
      <template #append>
        <div class="me-n3">
          <MoreBtn />
        </div>
      </template>
    </VCardItem>
    <!-- !SECTION -->

    <VCardText>
      <p class="text-body-2">
        Por favor realiza el pago para comenzar a disfrutar de todas las funciones de nuestro plan premium lo antes posible.
      </p>

      <!-- SECTION Upgrade plan banner -->
      <div class="plan-upgrade-banner pa-4 d-flex rounded align-center">
        <VAvatar
          rounded
          size="40"
          class="plan-details border-opacity-100 border-primary me-4"
        >
          <img
            :src="briefcase"
            alt="briefcase"
            height="20"
          >
        </VAvatar>

        <div class="d-flex flex-column me-3">
          <h6 class="text-h6">
            Platinum
          </h6>
          <span class="text-primary text-body-2">Actualizar plan</span>
        </div>
        <VSpacer />
        <div class="d-flex align-center">
          <sup>
            <div class="text-body-2 text-high-emphasis">$</div>
          </sup>
          <h4 class="text-h4">
            5,250
          </h4>
          <sub>
            <div class="text-body-2 text-high-emphasis">/Año</div>
          </sub>
        </div>
      </div>
      <!-- !SECTION -->

      <!-- SECTION Payment Details -->
      <VList class="card-list mt-1">
        <h6 class="text-h6 my-2">
          Detalles de pago
        </h6>

        <VListItem
          v-for="card in savedCards"
          :key="card.logo"
          class="mb-2"
        >
          <!-- 👉 Avatar -->
          <template #prepend>
            <img
              :src="card.logo"
              height="30"
              width="42"
              class="me-3"
            >
          </template>

          <!-- 👉 Title and Subtitle -->

          <VListItemTitle class="font-weight-medium mb-1">
            {{ card.type }}
          </VListItemTitle>
          <VListItemSubtitle class="me-2">
            {{ card.number }}
          </VListItemSubtitle>

          <!-- 👉 Action -->
          <template #append>
            <VListItemAction>
              <VTextField
                density="compact"
                label="CVV"
                placeholder="123"
                style="inline-size: 5rem;"
              />
            </VListItemAction>
          </template>
        </VListItem>

        <!-- 👉 Add Payment  -->
        <VListItem class="mb-3 text-body-1">
          <a href="javascript:void(0)">Agregar método de pago</a>
        </VListItem>
      </VList>
      <!-- !SECTION -->

      <!-- 👉 Email -->
      <VForm>
        <VRow>
          <VCol cols="12">
            <VTextField
              placeholder="Correo electrónico"
              density="compact"
              class="mb-3"
            />
            <VBtn block>
              Contactar ahora
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.plan-upgrade-banner {
  .plan-details {
    border: 1px solid rgb(var(--v-theme-primary));
  }

  background-color: rgba(var(--v-theme-primary), 0.16);
}

.card-list {
  --v-card-list-gap: 0;
}
</style>
