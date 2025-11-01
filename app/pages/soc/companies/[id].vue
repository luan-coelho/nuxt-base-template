<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { SocCompany } from '~~/server/db/schemas/soc-company-schema'
import type { SocUnit } from '~~/server/db/schemas/soc-unit-schema'

const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const toast = useNuxtApp().$toast

const route = useRoute()
const router = useRouter()
const companyId = route.params.id as string

definePageMeta({
  title: 'Detalhes da Empresa'
})

// Buscar dados da empresa
const { data: company, error: companyError } = await useFetch<SocCompany>(`/api/soc/companies/${companyId}`)

// Se a empresa não foi encontrada, redirecionar
if (companyError.value) {
  router.push('/soc/companies')
}

const columnVisibility = ref()

// Usando o composable de paginação para as unidades com TanStack Query
const {
  data: units,
  pagination,
  page,
  sortBy,
  sortOrder,
  isLoading,
  toggleSort
} = usePaginatedFetch<SocUnit>(`/soc/companies/${companyId}/units`, {
  initialLimit: 10,
  initialSortBy: 'name',
  initialSortOrder: 'asc'
})

// Função para formatar CNPJ
function formatCNPJ(cnpj: string | null | undefined) {
  if (!cnpj) return '-'
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

// Função para obter a cor do badge de grau de risco
function getRiskBadgeColor(risk: string | null | undefined) {
  if (!risk) return 'neutral'
  switch (risk) {
    case '1':
      return 'success'
    case '2':
      return 'info'
    case '3':
      return 'warning'
    case '4':
      return 'error'
    default:
      return 'neutral'
  }
}

// Função para obter o texto do grau de risco
function getRiskText(risk: string | null | undefined) {
  if (!risk) return 'N/A'
  return `Grau ${risk}`
}

function getRowItems(unit: SocUnit) {
  return [
    {
      type: 'label',
      label: 'Ações'
    },
    {
      type: 'separator'
    },
    {
      label: 'Visualizar detalhes',
      icon: 'i-lucide-eye',
      onClick: () => console.log('Visualizar:', unit)
    },
    {
      label: 'Editar unidade',
      icon: 'i-lucide-pencil',
      onClick: () => console.log('Editar:', unit)
    },
    {
      type: 'separator'
    },
    {
      label: unit.active ? 'Desativar' : 'Ativar',
      icon: unit.active ? 'i-lucide-x-circle' : 'i-lucide-check-circle',
      onClick: () => console.log('Toggle ativo:', unit)
    }
  ]
}

const columns: TableColumn<SocUnit>[] = [
  {
    accessorKey: 'name',
    header: () => {
      const isSortedByName = sortBy.value === 'name'
      const currentOrder = sortOrder.value

      return h(UButton, {
        color: 'neutral',
        variant: 'ghost',
        label: 'Nome da Unidade',
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
    accessorKey: 'riskDegree',
    header: 'Grau de Risco',
    cell: ({ row }) =>
      h(
        UBadge,
        {
          color: getRiskBadgeColor(row.original.riskDegree),
          variant: 'subtle',
          size: 'sm'
        },
        () => getRiskText(row.original.riskDegree)
      )
  },
  {
    accessorKey: 'active',
    header: 'Status',
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
  <UDashboardPanel id="company-details">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <div class="flex items-center gap-3">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/soc/companies"
              aria-label="Voltar" />
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Cabeçalho com informações principais -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-info" class="size-5" />
            <h3 class="text-lg font-semibold">Informações da Empresa</h3>
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="text-muted text-sm font-medium">Código SOC</label>
              <p class="mt-1 font-mono">{{ company?.socCode || '-' }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">Nome Abreviado</label>
              <p class="mt-1 font-semibold">{{ company?.name }}</p>
            </div>

            <div class="md:col-span-2">
              <label class="text-muted text-sm font-medium">Razão Social</label>
              <p class="mt-1">{{ company?.companyName }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">CNPJ</label>
              <p class="mt-1 font-mono">{{ formatCNPJ(company?.cnpj) }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">CAEPF</label>
              <p class="mt-1 font-mono">{{ company?.caepf || '-' }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">CNAE</label>
              <p class="mt-1 font-mono">{{ company?.cnae || '-' }}</p>
            </div>

            <div class="md:col-span-2">
              <label class="text-muted text-sm font-medium">Endereço</label>
              <p class="mt-1">{{ company?.address || '-' }}</p>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Tabela de unidades -->
      <div class="border-default bg-elevated/50 rounded-lg border">
        <UTable
          ref="table"
          v-model:column-visibility="columnVisibility"
          class="shrink-0"
          :data="units"
          :columns="columns"
          :loading="isLoading"
          @select="row => router.push(`/soc/units/${row.original.id}`)"
          :ui="{
            base: 'table-fixed border-separate border-spacing-0',
            thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
            tbody:
              '[&>tr]:hover:bg-muted/30 [&>tr]:transition-colors [&>tr]:last:[&>td]:border-b-0 [&>tr]:cursor-pointer',
            th: 'py-3 px-4 first:rounded-tl-lg last:rounded-tr-lg border-y border-default first:border-l last:border-r',
            td: 'py-3 px-4 border-b border-default'
          }" />
      </div>

      <!-- Paginação -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="text-muted text-sm">
          Mostrando
          <span class="text-highlighted font-medium">{{ (page - 1) * pagination.limit + 1 }}</span>
          -
          <span class="text-highlighted font-medium">
            {{ Math.min(page * pagination.limit, pagination.total) }}
          </span>
          de
          <span class="text-highlighted font-medium">{{ pagination.total }}</span>
          {{ pagination.total === 1 ? 'unidade' : 'unidades' }}
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
/* Animações suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
