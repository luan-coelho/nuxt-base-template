<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white shadow dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-sm text-gray-700 dark:text-gray-300">
              <span class="font-medium">{{ user?.name }}</span>
              <span class="ml-2 text-gray-500 dark:text-gray-400">{{ user?.email }}</span>
            </div>
            <UButton color="error" variant="soft" :loading="isLoggingOut" @click="handleLogout">
              <Icon name="lucide:log-out" class="mr-2" />
              Sair
            </UButton>
          </div>
        </div>
      </div>
    </nav>

    <main class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Card de boas-vindas -->
          <UCard>
            <template #header>
              <div class="flex items-center">
                <Icon name="lucide:user" class="text-primary-500 mr-2 h-5 w-5" />
                <h3 class="text-lg font-semibold">Bem-vindo(a)!</h3>
              </div>
            </template>
            <div class="space-y-2">
              <p class="text-sm text-gray-600 dark:text-gray-400">Você está autenticado com sucesso!</p>
              <div class="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-500">ID do Usuário</p>
                <p class="font-mono text-sm text-gray-900 dark:text-gray-100">
                  {{ user?.id }}
                </p>
              </div>
            </div>
          </UCard>

          <!-- Card de informações do usuário -->
          <UCard>
            <template #header>
              <div class="flex items-center">
                <Icon name="lucide:info" class="mr-2 h-5 w-5 text-blue-500" />
                <h3 class="text-lg font-semibold">Informações</h3>
              </div>
            </template>
            <div class="space-y-3">
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-500">Nome</p>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ user?.name }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-500 dark:text-gray-500">E-mail</p>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ user?.email }}</p>
              </div>
              <div v-if="user?.cpf">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-500">CPF</p>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ user.cpf }}</p>
              </div>
              <div v-if="user?.phone">
                <p class="text-xs font-medium text-gray-500 dark:text-gray-500">Telefone</p>
                <p class="text-sm text-gray-900 dark:text-gray-100">{{ user.phone }}</p>
              </div>
            </div>
          </UCard>

          <!-- Card de roles -->
          <UCard>
            <template #header>
              <div class="flex items-center">
                <Icon name="lucide:shield" class="mr-2 h-5 w-5 text-green-500" />
                <h3 class="text-lg font-semibold">Permissões</h3>
              </div>
            </template>
            <div class="space-y-2">
              <p class="mb-3 text-sm text-gray-600 dark:text-gray-400">Suas funções no sistema:</p>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="role in user?.roles"
                  :key="role"
                  :color="role === 'ADMIN' ? 'error' : role === 'MANAGER' ? 'primary' : 'neutral'"
                  variant="soft">
                  {{ role }}
                </UBadge>
              </div>
              <div v-if="user?.active !== undefined" class="pt-3">
                <UBadge :color="user.active ? 'success' : 'error'" variant="soft">
                  {{ user.active ? 'Conta Ativa' : 'Conta Inativa' }}
                </UBadge>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Seção de informações técnicas -->
        <UCard class="mt-6">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <Icon name="lucide:lock" class="mr-2 h-5 w-5 text-purple-500" />
                <h3 class="text-lg font-semibold">Autenticação</h3>
              </div>
              <UBadge color="success" variant="soft">
                <Icon name="lucide:check-circle" class="mr-1" />
                Autenticado
              </UBadge>
            </div>
          </template>
          <div class="space-y-4">
            <div class="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div class="flex">
                <Icon name="lucide:info" class="mr-3 h-5 w-5 flex-shrink-0 text-blue-500" />
                <div>
                  <h4 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Segurança baseada em Cookies HTTP-Only
                  </h4>
                  <p class="text-sm text-blue-800 dark:text-blue-300">
                    Sua autenticação é gerenciada através de cookies HTTP-Only seguros. Os tokens não são acessíveis via
                    JavaScript, garantindo maior segurança contra ataques XSS.
                  </p>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Características</h4>
                <ul class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <li class="flex items-center">
                    <Icon name="lucide:check" class="mr-2 h-4 w-4 text-green-500" />
                    Cookies HTTP-Only
                  </li>
                  <li class="flex items-center">
                    <Icon name="lucide:check" class="mr-2 h-4 w-4 text-green-500" />
                    Cookies Secure (HTTPS)
                  </li>
                  <li class="flex items-center">
                    <Icon name="lucide:check" class="mr-2 h-4 w-4 text-green-500" />
                    Tokens JWT
                  </li>
                  <li class="flex items-center">
                    <Icon name="lucide:check" class="mr-2 h-4 w-4 text-green-500" />
                    Refresh Token automático
                  </li>
                </ul>
              </div>

              <div class="space-y-2">
                <h4 class="text-sm font-semibold text-gray-900 dark:text-gray-100">Ações disponíveis</h4>
                <div class="flex flex-col space-y-2">
                  <UButton variant="soft" color="neutral" @click="refreshUserData" :loading="refreshing">
                    <Icon name="lucide:refresh-cw" class="mr-2" />
                    Atualizar dados
                  </UButton>
                  <UButton variant="soft" color="error" @click="handleLogout" :loading="isLoggingOut">
                    <Icon name="lucide:log-out" class="mr-2" />
                    Fazer logout
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { logout, isLoggingOut } = useAuth()
const { user, loadUser } = useUserSession()

const refreshing = ref(false)

const handleLogout = async () => {
  await logout()
}

const refreshUserData = async () => {
  refreshing.value = true
  try {
    await loadUser()
  } catch (error) {
    console.error('Erro ao atualizar dados:', error)
  } finally {
    refreshing.value = false
  }
}
</script>
