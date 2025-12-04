<script setup lang="ts">
import type { Permission } from '@db/apps/permission/types'

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Asignado a', key: 'assignedTo', sortable: false },
  { title: 'Fecha de creación', key: 'createdDate', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false },
]

const search = ref('')

// Data table options
const itemsPerPage = ref(10)
const page = ref(1)
const sortBy = ref()
const orderBy = ref()

// Update data table options
const updateOptions = (options: any) => {
  sortBy.value = options.sortBy[0]?.key
  orderBy.value = options.sortBy[0]?.order
}

const isPermissionDialogVisible = ref(false)
const isAddPermissionDialogVisible = ref(false)
const permissionName = ref('')

const colors: any = {
  'support': { color: 'info', text: 'Soporte' },
  'users': { color: 'success', text: 'Usuarios' },
  'manager': { color: 'warning', text: 'Gerente' },
  'administrator': { color: 'primary', text: 'Administrador' },
  'restricted-user': { color: 'error', text: 'Usuario restringido' },
}

const { data: permissionsData } = await useApi<any>(createUrl('/apps/permissions', {
  query: {
    q: search,
    itemsPerPage,
    page,
    sortBy,
    orderBy,
  },
}))

const permissions = computed((): Permission[] => permissionsData.value?.permissions || [])
const totalPermissions = computed(() => permissionsData.value?.totalPermissions || 0)

const editPermission = (name: string) => {
  isPermissionDialogVisible.value = true
  permissionName.value = name
}
</script>

<template>
  <VCard>
    <VCardText class="d-flex align-center justify-sm-space-between justify-start gap-4 flex-wrap">
      <VTextField
        v-model="search"
        density="compact"
        placeholder="Buscar permiso"
        style="max-inline-size: 15rem;min-inline-size: 12rem;"
      />

      <VBtn
        density="default"
        @click="isAddPermissionDialogVisible = true"
      >
        Agregar permiso
      </VBtn>
    </VCardText>

    <VDataTableServer
      v-model:items-per-page="itemsPerPage"
      :items-length="totalPermissions"
      :items-per-page-options="[
        { value: 5, title: '5' },
        { value: 10, title: '10' },
        { value: -1, title: '$vuetify.dataFooter.itemsPerPageAll' },
      ]"
      :headers="headers"
      :items="permissions"
      item-value="name"
      class="text-no-wrap"
      @update:options="updateOptions"
    >
      <!-- Assigned To -->
      <template #item.assignedTo="{ item }">
        <div class="d-flex gap-2">
          <VChip
            v-for="text in item.assignedTo"
            :key="text"
            :color="colors[text].color"
            size="small"
          >
            {{ colors[text].text }}
          </VChip>
        </div>
      </template>

      <!-- Name -->
      <template #item.name="{ item }">
        <h6 class="text-h6 font-weight-regular">
          {{ item.name }}
        </h6>
      </template>

      <template #item.createdDate="{ item }">
        <span class="text-body-1">{{ item.createdDate }}</span>
      </template>

      <!-- Actions -->
      <template #item.actions="{ item }">
        <IconBtn
          size="small"
          @click="editPermission(item.name)"
        >
          <VIcon icon="ri-edit-box-line" />
        </IconBtn>

        <MoreBtn size="small" />
      </template>

      <!-- Pagination -->
      <template #bottom>
        <VDivider />

        <div class="d-flex justify-end flex-wrap gap-x-6 px-2 py-1">
          <div class="d-flex align-center gap-x-2 text-medium-emphasis text-base">
            Rows Per Page:
            <VSelect
              v-model="itemsPerPage"
              class="per-page-select"
              variant="plain"
              :items="[10, 20, 25, 50, 100]"
            />
          </div>

          <p class="d-flex align-center text-base text-high-emphasis me-2 mb-0">
            {{ paginationMeta({ page, itemsPerPage }, totalPermissions) }}
          </p>

          <div class="d-flex gap-x-2 align-center me-2">
            <VBtn
              class="flip-in-rtl"
              icon="ri-arrow-left-s-line"
              variant="text"
              density="comfortable"
              color="high-emphasis"
              :disabled="page <= 1"
              @click="page <= 1 ? page = 1 : page--"
            />

            <VBtn
              class="flip-in-rtl"
              icon="ri-arrow-right-s-line"
              density="comfortable"
              variant="text"
              color="high-emphasis"
              :disabled="page >= Math.ceil(totalPermissions / itemsPerPage)"
              @click="page >= Math.ceil(totalPermissions / itemsPerPage) ? page = Math.ceil(totalPermissions / itemsPerPage) : page++ "
            />
          </div>
        </div>
      </template>
    </VDataTableServer>
  </VCard>

  <AddEditPermissionDialog
    v-model:is-dialog-visible="isPermissionDialogVisible"
    v-model:permission-name="permissionName"
  />
  <AddEditPermissionDialog v-model:is-dialog-visible="isAddPermissionDialogVisible" />
</template>
