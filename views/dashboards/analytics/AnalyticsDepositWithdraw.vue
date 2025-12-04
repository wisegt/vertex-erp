<script setup lang="ts">
import americanBank from '@images/logos/american-bank.png'
import aws from '@images/logos/aws.png'
import citiBank from '@images/logos/citi-bank.png'
import digitalOcean from '@images/logos/digital-ocean.png'
import github from '@images/logos/github.png'
import google from '@images/logos/google.png'
import gumroad from '@images/logos/gumroad.png'
import mastercardLabel from '@images/logos/mastercard-label.png'
import slack from '@images/logos/slack.png'
import stripe from '@images/logos/stripe.png'

const deposits = [
  {
    title: 'Gumroad Account',
    subtitle: 'Vender UI Kit',
    amount: '+Q4,650',
    logo: gumroad,
  },
  {
    title: 'Mastercard',
    subtitle: 'Depósito en billetera',
    amount: '+Q92,705',
    logo: mastercardLabel,
  },
  {
    title: 'Stripe Account',
    subtitle: 'Aplicación iOS',
    amount: '+Q957',
    logo: stripe,
  },
  {
    title: 'American Bank',
    subtitle: 'American Bank',
    amount: '+Q6,837',
    logo: americanBank,
  },
  {
    title: 'Bank Account',
    subtitle: 'Depósito en billetera',
    amount: '+Q8,934',
    logo: citiBank,
  },
]

const withdraws = [
  {
    title: 'Google Adsense',
    subtitle: 'Depósito PayPal',
    amount: '-Q145',
    logo: google,
  },
  {
    title: 'GitHub Enterprise',
    subtitle: 'Seguridad y cumplimiento',
    amount: '-Q1870',
    logo: github,
  },
  {
    title: 'Upgrade Slack Plan',
    subtitle: 'Depósito con tarjeta',
    amount: '-Q450',
    logo: slack,
  },
  {
    title: 'DigitalOcean',
    subtitle: 'Hosting en la nube',
    amount: '-Q540',
    logo: digitalOcean,
  },
  {
    title: 'AWS Account',
    subtitle: 'Elegir plataforma en la nube',
    amount: '-Q21',
    logo: aws,
  },
]
</script>

<template>
  <VCard>
    <VRow no-gutters>
      <VCol
        cols="12"
        md="6"
      >
        <VCardItem>
          <VCardTitle>Depósito</VCardTitle>

          <template #append>
            <h6 class="text-h6">
              <a
                href="javascript:void(0)"
                class="text-primary"
              >Ver todo</a>
            </h6>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem
              v-for="deposit in deposits"
              :key="deposit.logo"
            >
              <template #prepend>
                <div class="me-4">
                  <VImg
                    :height="30"
                    :width="30"
                    :src="deposit.logo"
                  />
                </div>
              </template>

              <VListItemTitle class="font-weight-medium mb-1">
                {{ deposit.title }}
              </VListItemTitle>
              <VListItemSubtitle class="text-body-1">
                {{ deposit.subtitle }}
              </VListItemSubtitle>

              <template #append>
                <VListItemAction class="text-success font-weight-medium">
                  {{ deposit.amount }}
                </VListItemAction>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCol>

      <VDivider :vertical="$vuetify.display.mdAndUp" />

      <VCol
        cols="12"
        md="6"
      >
        <VCardItem>
          <VCardTitle>Retiro</VCardTitle>

          <template #append>
            <h6 class="text-h6">
              <a
                href="javascript:void(0)"
                class="text-primary"
              >Ver todo</a>
            </h6>
          </template>
        </VCardItem>

        <VCardText>
          <VList class="card-list">
            <VListItem
              v-for="withdraw in withdraws"
              :key="withdraw.logo"
            >
              <template #prepend>
                <div class="me-4">
                  <VImg
                    :height="30"
                    :width="30"
                    :src="withdraw.logo"
                  />
                </div>
              </template>

              <VListItemTitle class="font-weight-medium mb-1">
                {{ withdraw.title }}
              </VListItemTitle>
              <VListItemSubtitle class="text-body-1">
                {{ withdraw.subtitle }}
              </VListItemSubtitle>

              <template #append>
                <VListItemAction>
                  <span class="text-error font-weight-medium">
                    {{ withdraw.amount }}
                  </span>
                </VListItemAction>
              </template>
            </VListItem>
          </VList>
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.25rem;
}
</style>
