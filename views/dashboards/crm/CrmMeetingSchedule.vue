<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'

interface UiColors {
  'Negocios': string
  'Meditación': string
  'Encuentro': string
  'Cena': string
}
interface MeetingSchedule {
  profile: string
  with: string
  dateTime: string
  type: keyof UiColors
}

const meetingSchedules: MeetingSchedule[] = [
  {
    profile: avatar4,
    with: 'Llamada con Woods',
    dateTime: '21 Jul | 08:20-10:30',
    type: 'Negocios',
  },
  {
    profile: avatar8,
    with: 'Llamada con Hilda',
    dateTime: '24 Jul | 11:30-12:00',
    type: 'Meditación',
  },
  {
    profile: avatar7,
    with: 'Llamada de conferencia',
    dateTime: '28 Jul | 05:00-6:45',
    type: 'Cena',
  },
  {
    profile: avatar3,
    with: 'Reunión con Mark',
    dateTime: '03 Aug | 07:00-8:30',
    type: 'Encuentro',
  },
  {
    profile: avatar2,
    with: 'Reunión en Oakland',
    dateTime: '14 Aug | 04:15-05:30',
    type: 'Cena',
  },
  {
    profile: avatar1,
    with: 'Reunión con Carl',
    dateTime: '05 Oct | 10:00-12:45',
    type: 'Negocios',
  },
]

const meetingTypeUiColors: UiColors = {
  Negocios: 'primary',
  Meditación: 'success',
  Encuentro: 'secondary',
  Cena: 'error',
}
</script>

<template>
  <VCard>
    <!-- SECTION Card Header and Menu -->
    <VCardItem>
      <!-- 👉 Title -->
      <VCardTitle>Calendario de reuniones</VCardTitle>

      <!-- 👉 menu -->

      <template #append>
        <div class="me-n3">
          <MoreBtn />
        </div>
      </template>
    </VCardItem>
    <!-- !SECTION -->

    <!-- SECTION Meting Schedule -->
    <VCardText>
      <VList
        lines="two"
        class="card-list"
      >
        <VListItem
          v-for="meeting in meetingSchedules"
          :key="meeting.type"
        >
          <!-- 👉 Avatar -->
          <template #prepend>
            <VAvatar
              :size="38"
              :image="meeting.profile"
            />
          </template>

          <!-- 👉 Title and Subtitle -->

          <VListItemTitle class="font-weight-medium mb-1">
            {{ meeting.with }}
          </VListItemTitle>
          <VListItemSubtitle class="me-2">
            <VIcon
              size="16"
              start
              icon="ri-calendar-line"
            />
            {{ meeting.dateTime }}
          </VListItemSubtitle>

          <!-- 👉 Business Types -->
          <template #append>
            <VListItemAction>
              <VChip
                size="small"
                :color="meetingTypeUiColors[meeting.type]"
              >
                {{ meeting.type }}
              </VChip>
            </VListItemAction>
          </template>
        </VListItem>
      </VList>
    </VCardText>
    <!-- !SECTION -->
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.5rem;
}
</style>
