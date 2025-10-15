<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~~/server/db/schemas'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const columnVisibility = ref()

// Usando o composable de paginação reutilizável
const {
  data: users,
  pagination,
  page,
  searchInput,
  sortBy,
  sortOrder,
  status,
  refresh,
  toggleSort
} = await usePaginatedFetch<User>('/api/users', {
  initialLimit: 10,
  initialSortBy: 'createdAt',
  initialSortOrder: 'desc',
  debounceSearch: 500
})

function handleUserCreated() {
  // Atualiza a lista de usuários
  refresh()
}

function getRowItems() {
  return [
    {
      type: 'label',
      label: 'Ações'
    },
    {
      type: 'separator'
    },
    {
      label: 'Visualizar detalhes do usuário',
      icon: 'i-lucide-list'
    }
  ]
}

const columns: TableColumn<User>[] = [
  // Removido: coluna de seleção
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
    cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.name)
  },
  {
    accessorKey: 'email',
    header: () => {
      const isSortedByEmail = sortBy.value === 'email'
      const currentOrder = sortOrder.value

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Email',
        icon: isSortedByEmail
          ? currentOrder === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => toggleSort('email')
      })
    }
  },
  {
    accessorKey: 'roles',
    header: 'Funções',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'flex flex-wrap gap-1.5' },
        row.original.roles?.map((role: string) => h(UBadge, { variant: 'subtle', class: 'capitalize' }, () => role))
      )
  },
  {
    id: 'actions',
    cell: () => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems()
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto'
            })
        )
      )
    }
  }
]
</script>

<template>
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="Usuários">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput v-model="searchInput" class="max-w-sm" icon="i-lucide-search" placeholder="Filtrar emails..." />

        <UsersAddModal @user-created="handleUserCreated" />
      </div>

      <UTable
        ref="table"
        v-model:column-visibility="columnVisibility"
        class="shrink-0"
        :data="users"
        :columns="columns"
        :loading="status === 'pending'"
        :ui="{
          base: 'table-fixed border-separate border-spacing-0',
          thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
          tbody: '[&>tr]:last:[&>td]:border-b-0',
          th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
          td: 'border-b border-default'
        }" />

      <div class="border-default mt-auto flex items-center justify-between gap-3 border-t pt-4">
        <div class="text-muted text-sm">Mostrando {{ users.length }} de {{ pagination.total }} usuários</div>

        <div class="flex items-center gap-1.5">
          <UPagination
            v-if="pagination.totalPages > 1"
            v-model:page="page"
            :items-per-page="pagination.limit"
            :total="pagination.total" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
