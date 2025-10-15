<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { User } from '~~/server/db/schemas'
import { upperFirst } from 'scule'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const table = useTemplateRef('table')

const columnFilters = ref([
  {
    id: 'email',
    value: ''
  }
])
const columnVisibility = ref()
interface UsersPage {
  content: User[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  numberOfElements: number
  empty: boolean
}

interface UsersApiResponse {
  success: boolean
  data: UsersPage
}

// Removido: seleção de linhas da tabela
const page = ref(1)
const size = ref(20)

const defaultUsersPage: UsersPage = {
  content: [],
  page: 0,
  size: 20,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true
}

const { data, status, refresh } = await useFetch<UsersApiResponse>('http://localhost:8080/api/users', {
  lazy: false,
  credentials: 'include'
})

const meta = computed<UsersPage>(() => data.value?.data ?? defaultUsersPage)
const users = computed<User[]>(() => meta.value.content)

function handleUserCreated() {
  // Atualiza a lista de usuários
  refresh()
}

watch(data, newVal => {
  if (newVal?.data?.size) {
    size.value = newVal.data.size
  }
})

watchEffect(() => {
  const resolvedPage = meta.value.page + 1
  if (resolvedPage !== page.value) {
    page.value = resolvedPage
  }
})

// Removido: reset de seleção ao atualizar usuários

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
    header: 'Nome',
    cell: ({ row }) => h('span', { class: 'font-medium text-highlighted' }, row.original.name)
  },
  {
    accessorKey: 'email',
    header: ({ column }) => {
      const isSorted = column.getIsSorted()

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Email',
        icon: isSorted
          ? isSorted === 'asc'
            ? 'i-lucide-arrow-up-narrow-wide'
            : 'i-lucide-arrow-down-wide-narrow'
          : 'i-lucide-arrow-up-down',
        class: '-mx-2.5',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc')
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

        <template #right>
          <UsersAddModal @user-created="handleUserCreated" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="table?.tableApi?.getColumn('email')?.getFilterValue() as string"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Filtrar emails..."
          @update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)" />

        <div class="flex flex-wrap items-center gap-1.5">
          <!-- Removido: modal de exclusão baseada em seleção -->
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e?: Event) {
                    e?.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }">
            <UButton label="Display" color="neutral" variant="outline" trailing-icon="i-lucide-settings-2" />
          </UDropdownMenu>
        </div>
      </div>

      <UTable
        ref="table"
        v-model:column-filters="columnFilters"
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
        <!-- Removido: texto de seleção de linhas -->

        <div class="flex items-center gap-1.5">
          <UPagination
            v-if="meta.totalPages > 1"
            v-model:page="page"
            :items-per-page="meta.size"
            :total="meta.totalElements" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
