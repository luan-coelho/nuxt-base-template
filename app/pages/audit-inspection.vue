<script setup lang="ts">
definePageMeta({
  middleware: ['authenticated']
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Inspeção e Auditoria">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right></template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <h1>Inspeção e Auditoria</h1>
      </div>
    </template>
  </UDashboardPanel>
</template>
