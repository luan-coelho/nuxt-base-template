<script setup lang="ts">
import type { User } from '~~/server/db/schemas'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const userId = route.params.id as string

// Buscar dados do usuário
const { data: user, status, error } = await useFetch<User>(`/api/users/${userId}`)

// Se o usuário não foi encontrado, redirecionar para a lista
if (error.value || !user.value) {
  toast.add({
    title: 'Erro',
    description: 'Usuário não encontrado',
    color: 'error'
  })
  await router.push('/users')
}

// Formatar data
function formatDate(date: Date | null | undefined) {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatar CPF
function formatCPF(cpf: string) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Formatar telefone
function formatPhone(phone: string | null | undefined) {
  if (!phone) return 'N/A'
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
}

// Traduzir role
function translateRole(role: string) {
  const translations: Record<string, string> = {
    admin: 'Administrador',
    manager: 'Gerente',
    user: 'Usuário'
  }
  return translations[role] || role
}

// Modal de edição
const editModalOpen = ref(false)

function handleUserUpdated() {
  // Recarregar dados do usuário
  refresh()
}

const { refresh } = await useFetch<User>(`/api/users/${userId}`)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Detalhes do Usuário">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/users"
            aria-label="Voltar para lista de usuários" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="status === 'pending'" class="flex items-center justify-center py-12">
        <div class="text-center">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p class="text-muted mt-4">Carregando...</p>
        </div>
      </div>

      <div v-else-if="user" class="space-y-6">
        <!-- Cabeçalho com Avatar e Informações Principais -->
        <UCard>
          <div class="flex flex-col items-center gap-6 sm:flex-row">
            <UAvatar src="https://i.pravatar.cc/300" :alt="user.name" size="3xl" class="ring-primary/20 ring-2" />

            <div class="flex-1 text-center sm:text-left">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <div>
                    <h2 class="text-highlighted text-2xl font-bold">{{ user.name }}</h2>
                    <p class="text-muted mt-1">{{ user.email }}</p>
                  </div>
                  <UButton
                    label="Editar"
                    icon="i-lucide-pencil"
                    color="primary"
                    size="md"
                    class="mt-3 sm:mt-0"
                    @click="editModalOpen = true" />
                </div>

                <UBadge
                  :label="user.active ? 'Ativo' : 'Inativo'"
                  :color="user.active ? 'success' : 'error'"
                  variant="subtle"
                  size="lg" />
              </div>

              <div class="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                <UBadge
                  v-for="role in user.roles"
                  :key="role"
                  :label="translateRole(role)"
                  color="primary"
                  variant="soft" />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Informações de Contato -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-contact" class="text-primary h-5 w-5" />
              <h3 class="text-highlighted text-lg font-semibold">Informações de Contato</h3>
            </div>
          </template>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label class="text-muted text-sm font-medium">CPF</label>
              <p class="text-highlighted mt-1 font-medium">{{ formatCPF(user.cpf) }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">Telefone</label>
              <p class="text-highlighted mt-1 font-medium">{{ formatPhone(user.phone) }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">E-mail</label>
              <p class="text-highlighted mt-1 font-medium">{{ user.email }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">E-mail Verificado</label>
              <div class="mt-1 flex items-center gap-2">
                <UIcon
                  :name="user.emailVerified ? 'i-lucide-check-circle' : 'i-lucide-x-circle'"
                  :class="user.emailVerified ? 'text-success' : 'text-error'"
                  class="h-5 w-5" />
                <span class="text-highlighted font-medium">
                  {{ user.emailVerified ? 'Verificado' : 'Não verificado' }}
                </span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Informações do Sistema -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="text-primary h-5 w-5" />
              <h3 class="text-highlighted text-lg font-semibold">Informações do Sistema</h3>
            </div>
          </template>

          <div class="grid gap-6 sm:grid-cols-2">
            <div>
              <label class="text-muted text-sm font-medium">ID do Usuário</label>
              <p class="text-highlighted mt-1 font-mono text-sm">{{ user.id }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">Status</label>
              <div class="mt-1 flex items-center gap-2">
                <div :class="user.active ? 'bg-success' : 'bg-error'" class="h-2 w-2 rounded-full" />
                <span class="text-highlighted font-medium">
                  {{ user.active ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">Data de Criação</label>
              <p class="text-highlighted mt-1 font-medium">{{ formatDate(user.createdAt) }}</p>
            </div>

            <div>
              <label class="text-muted text-sm font-medium">Última Atualização</label>
              <p class="text-highlighted mt-1 font-medium">{{ formatDate(user.updatedAt) }}</p>
            </div>
          </div>
        </UCard>

        <!-- Funções e Permissões -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" class="text-primary h-5 w-5" />
              <h3 class="text-highlighted text-lg font-semibold">Funções e Permissões</h3>
            </div>
          </template>

          <div class="space-y-4">
            <div class="grid gap-4 sm:grid-cols-2">
              <div v-for="role in user.roles" :key="role" class="flex items-start gap-3">
                <UIcon
                  :name="role === 'admin' ? 'i-lucide-crown' : role === 'manager' ? 'i-lucide-users' : 'i-lucide-user'"
                  class="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p class="text-highlighted font-medium">{{ translateRole(role) }}</p>
                  <p class="text-muted text-sm">
                    <template v-if="role === 'admin'">
                      Acesso total ao sistema, incluindo gerenciamento de usuários e configurações
                    </template>
                    <template v-else-if="role === 'manager'">
                      Pode gerenciar recursos e visualizar relatórios avançados
                    </template>
                    <template v-else>Acesso básico aos recursos do sistema</template>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modal de Edição -->
  <UsersEditModal v-if="user" v-model:open="editModalOpen" :user="user" @user-updated="handleUserUpdated" />
</template>
