<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~~/server/db/schemas'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const columnVisibility = ref()

// Usando o composable de paginação reutilizável com TanStack Query
const {
  data: users,
  pagination,
  page,
  sortBy,
  sortOrder,
  isLoading,
  refetch,
  toggleSort
} = usePaginatedFetch<User>('/api/users', {
  initialLimit: 10,
  initialSortBy: 'createdAt',
  initialSortOrder: 'desc'
})

// Estado para controlar o modal de edição
const editModalOpen = ref(false)
const selectedUser = ref<User | null>(null)

function openEditModal(user: User) {
  selectedUser.value = user
  editModalOpen.value = true
}

function getRowItems(user: User) {
  return [
    {
      type: 'label',
      label: 'Ações'
    },
    {
      type: 'separator'
    },
    {
      label: 'Editar usuário',
      icon: 'i-lucide-pencil',
      onClick: () => openEditModal(user)
    },
    {
      label: 'Visualizar detalhes do usuário',
      icon: 'i-lucide-list',
      to: `/users/${user.id}`
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
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row.original)
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
      <div class="flex items-center justify-end">
        <UsersAddModal @user-created="refetch" />
      </div>

      <UsersEditModal v-model:open="editModalOpen" :user="selectedUser" @user-updated="refetch" />

      <UTable
        ref="table"
        v-model:column-visibility="columnVisibility"
        class="shrink-0"
        :data="users"
        :columns="columns"
        :loading="isLoading"
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
