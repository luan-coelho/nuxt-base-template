<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { Row } from '@tanstack/table-core'
import type { DirectoryUser } from '~/types'
import { upperFirst } from 'scule'

definePageMeta({
  middleware: ['authenticated']
})

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UCheckbox = resolveComponent('UCheckbox')

const toast = useToast()
const table = useTemplateRef('table')

const columnFilters = ref([
  {
    id: 'email',
    value: ''
  }
])
const columnVisibility = ref()
interface UsersPage {
  content: DirectoryUser[]
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

const rowSelection = ref<Record<string, boolean>>({})
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

const apiUrl = computed(() => `http://localhost:8080/api/users`)

const { data, status } = await useFetch<UsersApiResponse>(() => apiUrl.value, {
  lazy: false,
  credentials: 'include'
})

const meta = computed<UsersPage>(() => data.value?.data ?? defaultUsersPage)
const users = computed<DirectoryUser[]>(() => meta.value.content)

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

watch(users, () => {
  rowSelection.value = {}
})

function getRowItems(row: Row<DirectoryUser>) {
  return [
    {
      type: 'label',
      label: 'Actions'
    },
    {
      label: 'Copy user ID',
      icon: 'i-lucide-copy',
      onSelect() {
        navigator.clipboard.writeText(row.original.id.toString())
        toast.add({
          title: 'Copied to clipboard',
          description: 'User ID copied to clipboard'
        })
      }
    },
    {
      type: 'separator'
    },
    {
      label: 'View user details',
      icon: 'i-lucide-list'
    },
    {
      label: 'View user payments',
      icon: 'i-lucide-wallet'
    },
    {
      type: 'separator'
    },
    {
      label: 'Delete user',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect() {
        toast.add({
          title: 'User deleted',
          description: 'The user has been deleted.'
        })
      }
    }
  ]
}

const columns: TableColumn<DirectoryUser>[] = [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected() ? 'indeterminate' : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      })
  },
  {
    accessorKey: 'id',
    header: 'ID'
  },
  {
    accessorKey: 'name',
    header: 'Name',
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
    header: 'Roles',
    cell: ({ row }) =>
      h(
        'div',
        { class: 'flex flex-wrap gap-1.5' },
        row.original.roles.map(role => h(UBadge, { variant: 'subtle', class: 'capitalize' }, () => role))
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
            items: getRowItems(row)
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
          <UsersAddModal />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center justify-between gap-1.5">
        <UInput
          :model-value="table?.tableApi?.getColumn('email')?.getFilterValue() as string"
          class="max-w-sm"
          icon="i-lucide-search"
          placeholder="Filter emails..."
          @update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)" />

        <div class="flex flex-wrap items-center gap-1.5">
          <UsersDeleteModal :count="table?.tableApi?.getFilteredSelectedRowModel().rows.length">
            <UButton
              v-if="table?.tableApi?.getFilteredSelectedRowModel().rows.length"
              label="Delete"
              color="error"
              variant="subtle"
              icon="i-lucide-trash">
              <template #trailing>
                <UKbd>
                  {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length }}
                </UKbd>
              </template>
            </UButton>
          </UsersDeleteModal>
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
        v-model:row-selection="rowSelection"
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
        <div class="text-muted text-sm">
          {{ table?.tableApi?.getFilteredSelectedRowModel().rows.length || 0 }} of
          {{ table?.tableApi?.getFilteredRowModel().rows.length || 0 }} row(s) selected.
        </div>

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
