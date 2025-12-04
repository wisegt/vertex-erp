<script setup lang="ts">
import RoleCards from '@/views/apps/roles/RoleCards.vue'
import UserList from '@/views/apps/roles/UserList.vue'
</script>

<template>
  <VRow>
    <VCol cols="12">
      <h5 class="text-h5 mb-1">
        Lista de roles
      </h5>
      <p class="text-body-1 mb-0">
        Un rol proporciona acceso a menús y funciones predefinidas para que, dependiendo del rol asignado, un administrador pueda tener acceso a lo que necesita
      </p>
    </VCol>

    <!-- 👉 Roles Cards -->
    <VCol cols="12">
      <RoleCards />
    </VCol>

    <VCol cols="12">
      <h5 class="text-h5 mt-6">
        Total de usuarios con sus roles
      </h5>
      <p class="text-body-1 mb-6">
        Encuentra todas las cuentas de administrador de tu empresa y sus roles asociados.
      </p>

      <!-- 👉 User List  -->
      <UserList />
    </VCol>
  </VRow>
</template>
