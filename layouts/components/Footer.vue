<template>
  <div class="h-100 d-flex align-center justify-space-between text-medium-emphasis">
    <!-- 👉 Footer: left content -->
    <span class="d-flex align-center">
      &copy;
      {{ new Date().getFullYear() }}.
      Hecho con
      <VIcon
        icon="ri-heart-line"
        color="error"
        size="1.25rem"
        class="mx-1"
      />
      por <a
        href="https://waisconsultores.io"
        target="_blank"
        rel="noopener noreferrer"
        class="text-primary ms-1"
      >Wais Consultores</a>
    </span>
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="#"
        target="noopener noreferrer"
      >Licencia</a>
      <a
        href="#"
        target="noopener noreferrer"
      >Documentación</a>
      <a
        href="#"
        target="noopener noreferrer"
      >Soporte</a>      
    </span>
  </div>
</template>
