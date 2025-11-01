<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { SocCompany } from '~~/server/db/schemas'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const router = useRouter()

definePageMeta({
  title: 'Empresas SOC'
})

const columnVisibility = ref()

// Usando o composable de paginação reutilizável
const {
  data: companies,
  pagination,
  page,
  sortBy,
  sortOrder,
  isLoading,
  refresh,
  toggleSort
} = await usePaginatedFetch<SocCompany>('/api/soc/companies', {
  initialLimit: 15,
  initialSortBy: 'name',
  initialSortOrder: 'asc'
})

// Função para formatar CNPJ
function formatCNPJ(cnpj: string | null | undefined) {
  if (!cnpj) return '-'
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

const columns: TableColumn<SocCompany>[] = [
  {
    accessorKey: 'name',
    header: () => {
      const isSortedByName = sortBy.value === 'name'
      const currentOrder = sortOrder.value

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Nome',
        icon: isSortedByName
          ? currentOrder === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => toggleSort('name')
      })
    },
    cell: ({ row }) => {
      const elements = [h('span', { class: 'font-semibold text-highlighted' }, row.original.name)]
      if (row.original.socCode) {
        elements.push(h('span', { class: 'text-xs text-muted' }, `Código: ${row.original.socCode}`))
      }
      return h('div', { class: 'flex flex-col gap-1' }, elements)
    }
  },
  {
    accessorKey: 'cnpj',
    header: () => {
      const isSortedByCnpj = sortBy.value === 'cnpj'
      const currentOrder = sortOrder.value

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'CNPJ',
        icon: isSortedByCnpj
          ? currentOrder === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => toggleSort('cnpj')
      })
    },
    cell: ({ row }) => h('span', { class: 'font-mono text-sm text-muted' }, formatCNPJ(row.original.cnpj))
  },
  {
    accessorKey: 'cnae',
    header: () => {
      const isSortedByCnae = sortBy.value === 'cnae'
      const currentOrder = sortOrder.value

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'CNAE',
        icon: isSortedByCnae
          ? currentOrder === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => toggleSort('cnae')
      })
    },
    cell: ({ row }) =>
      h('span', { class: 'font-mono text-sm' }, row.original.cnae || h('span', { class: 'text-muted' }, '-'))
  },
  {
    accessorKey: 'active',
    header: () => {
      const isSortedByActive = sortBy.value === 'active'
      const currentOrder = sortOrder.value

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Situação',
        icon: isSortedByActive
          ? currentOrder === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => toggleSort('active')
      })
    },
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: row.original.active ? 'success' : 'neutral',
          variant: 'subtle',
          size: 'sm'
        },
        () => (row.original.active ? 'Ativo' : 'Inativo')
      )
  }
]
</script>

<template>
  <UDashboardPanel id="soc-companies">
    <template #header>
      <UDashboardNavbar title="Empresas SOC">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
        <template #trailing>
          <UTooltip text="Sincronizar empresas">
            <UButton
              icon="i-lucide-refresh-cw"
              color="neutral"
              variant="subtle"
              @click="refresh"
              :loading="isLoading" />
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="border-default bg-elevated/50 rounded-lg border">
        <UTable
          ref="table"
          v-model:column-visibility="columnVisibility"
          class="shrink-0"
          :data="companies"
          :columns="columns"
          :loading="isLoading"
          @select="row => router.push(`/soc/companies/${row.original.id}`)"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody:
              '[&>tr]:hover:bg-muted/30 [&>tr]:transition-colors [&>tr]:last:[&>td]:border-b-0 [&>tr]:cursor-pointer',
            th: 'py-3 px-4 first:rounded-tl-lg last:rounded-tr-lg border-y border-default first:border-l last:border-r',
            td: 'py-3 px-4 border-b border-default'
          }" />
      </div>

      <div class="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-muted text-sm">
          Mostrando
          <span class="text-highlighted font-medium">{{ (page - 1) * pagination.limit + 1 }}</span>
          -
          <span class="text-highlighted font-medium">{{ Math.min(page * pagination.limit, pagination.total) }}</span>
          de
          <span class="text-highlighted font-medium">{{ pagination.total }}</span>
          {{ pagination.total === 1 ? 'empresa' : 'empresas' }}
        </div>

        <div class="flex items-center justify-end gap-2">
          <UPagination
            v-if="pagination.totalPages > 1"
            v-model:page="page"
            :items-per-page="pagination.limit"
            :total="pagination.total"
            :sibling-count="1"
            show-edges />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

<style scoped>
/* Animação suave para o loading */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
