<!--
  Exemplo de componente usando TanStack Query com autenticação

  Este componente demonstra:
  - Lista de usuários com paginação
  - Busca/filtro reativo
  - Criação de usuário com modal
  - Edição inline
  - Deleção com confirmação
  - Loading states
  - Error handling
-->
<script setup lang="ts">
import {
  useUsersQuery,
  usePaginatedUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation
} from '~/composables/useUsers'
import type { UserSchema } from '~/types/user'

// Estado da UI
const showCreateModal = ref(false)
const editingUserId = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(0)
const pageSize = ref(10)

// Queries
const {
  data: paginatedData,
  isLoading,
  error,
  refetch
} = usePaginatedUsersQuery({
  page: currentPage,
  size: pageSize,
  sort: computed(() => (searchQuery.value ? `name:${searchQuery.value}` : undefined))
})

// Mutations
const { mutate: createUser, isPending: isCreating } = useCreateUserMutation()

const { mutate: updateUser, isPending: isUpdating } = useUpdateUserMutation()

const { mutate: deleteUser, isPending: isDeleting } = useDeleteUserMutation()

// Handlers
const handleCreate = (userData: Partial<UserSchema>) => {
  createUser(userData, {
    onSuccess: () => {
      showCreateModal.value = false
      // Query será automaticamente atualizada
    }
  })
}

const handleUpdate = (userId: string, updates: Partial<UserSchema>) => {
  updateUser(
    { id: userId, ...updates },
    {
      onSuccess: () => {
        editingUserId.value = null
      }
    }
  )
}

const handleDelete = (userId: string, userName: string) => {
  if (confirm(`Tem certeza que deseja deletar ${userName}?`)) {
    deleteUser(userId, {
      onSuccess: () => {
        // Se deletou o último item da página, volta para página anterior
        if (paginatedData.value?.content.length === 1 && currentPage.value > 0) {
          currentPage.value--
        }
      }
    })
  }
}

// Paginação
const goToNextPage = () => {
  if (paginatedData.value && currentPage.value < paginatedData.value.totalPages - 1) {
    currentPage.value++
  }
}

const goToPrevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--
  }
}

// Debounce da busca
const debouncedSearch = refDebounced(searchQuery, 500)

// Reset página ao buscar
watch(debouncedSearch, () => {
  currentPage.value = 0
})
</script>

<template>
  <div class="users-page">
    <!-- Header -->
    <div class="header">
      <h1>Usuários</h1>
      <button @click="showCreateModal = true" class="btn-primary">Novo Usuário</button>
    </div>

    <!-- Busca -->
    <div class="search-bar">
      <input v-model="searchQuery" type="text" placeholder="Buscar por nome..." class="search-input" />
      <button @click="refetch()" class="btn-secondary" :disabled="isLoading">Atualizar</button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Carregando usuários...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">❌ Erro ao carregar usuários: {{ error.message }}</p>
      <button @click="refetch()" class="btn-secondary">Tentar Novamente</button>
    </div>

    <!-- Success State -->
    <div v-else-if="paginatedData" class="users-container">
      <!-- Empty State -->
      <div v-if="paginatedData.content.length === 0" class="empty-state">
        <p>Nenhum usuário encontrado.</p>
        <button @click="searchQuery = ''" class="btn-secondary">Limpar Filtros</button>
      </div>

      <!-- Users Table -->
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>CPF</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedData.content" :key="user.id">
            <td>
              <input
                v-if="editingUserId === user.id"
                :value="user.name"
                @blur="handleUpdate(user.id, { name: $event.target.value })"
                class="inline-edit" />
              <span v-else>{{ user.name }}</span>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.cpf }}</td>
            <td>
              <span :class="['status-badge', user.active ? 'active' : 'inactive']">
                {{ user.active ? 'Ativo' : 'Inativo' }}
              </span>
            </td>
            <td class="actions">
              <button v-if="editingUserId !== user.id" @click="editingUserId = user.id" class="btn-icon" title="Editar">
                ✏️
              </button>
              <button
                @click="handleDelete(user.id, user.name)"
                :disabled="isDeleting"
                class="btn-icon danger"
                title="Deletar">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Paginação -->
      <div class="pagination">
        <button @click="goToPrevPage" :disabled="currentPage === 0" class="btn-secondary">← Anterior</button>

        <span class="page-info">
          Página {{ currentPage + 1 }} de {{ paginatedData.totalPages }} ({{ paginatedData.totalElements }} usuários)
        </span>

        <button @click="goToNextPage" :disabled="currentPage >= paginatedData.totalPages - 1" class="btn-secondary">
          Próxima →
        </button>
      </div>
    </div>

    <!-- Modal de Criação -->
    <Teleport to="body">
      <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
        <div class="modal-content" @click.stop>
          <h2>Novo Usuário</h2>

          <form @submit.prevent="handleCreate({ name: 'Teste', email: 'teste@example.com', cpf: '123' })">
            <!-- Formulário simplificado para exemplo -->
            <div class="form-group">
              <label>Nome</label>
              <input type="text" required />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input type="email" required />
            </div>

            <div class="form-group">
              <label>CPF</label>
              <input type="text" required />
            </div>

            <div class="modal-actions">
              <button type="button" @click="showCreateModal = false" class="btn-secondary" :disabled="isCreating">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="isCreating">
                {{ isCreating ? 'Salvando...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.users-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.loading {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-state {
  text-align: center;
  padding: 3rem;
}

.error-message {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.users-table th,
.users-table td {
  padding: 1rem;
  text-align: left;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
}

.users-table tbody tr:hover {
  background: #f8f9fa;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.25rem 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1.2rem;
}

.btn-icon:hover {
  opacity: 0.7;
}

.btn-icon.danger:hover {
  color: #e74c3c;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.page-info {
  color: #666;
}

.btn-primary {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #333;
  border: 1px solid #ddd;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover:not(:disabled) {
  background: #f8f9fa;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.inline-edit {
  width: 100%;
  padding: 0.25rem;
  border: 1px solid #3498db;
  border-radius: 4px;
}
</style>
