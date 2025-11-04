<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <nav class="bg-white shadow dark:bg-gray-800">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 justify-between">
          <div class="flex items-center">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">Sistema de Autenticação</h1>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="loggedIn">
              <div class="text-sm text-gray-700 dark:text-gray-300">
                <span class="font-medium">{{ user?.name }}</span>
              </div>
              <UButton to="/dashboard" color="primary" variant="soft">Dashboard</UButton>
              <UButton color="error" variant="soft" :loading="isLoggingOut" @click="handleLogout">Sair</UButton>
            </template>
            <template v-else>
              <UButton to="/login" variant="soft">Entrar</UButton>
              <UButton to="/register" color="primary">Criar conta</UButton>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <main class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div class="mb-12 text-center">
        <h2 class="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white">Bem-vindo ao Sistema</h2>
        <p class="text-lg text-gray-600 dark:text-gray-400">Sistema de autenticação integrado com backend Java</p>
      </div>

      <div v-if="loggedIn" class="mx-auto max-w-3xl">
        <UCard>
          <template #header>
            <div class="flex items-center">
              <Icon name="lucide:user-check" class="mr-2 h-6 w-6 text-green-500" />
              <h3 class="text-xl font-semibold">Você está autenticado!</h3>
            </div>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Nome</p>
                <p class="text-lg text-gray-900 dark:text-gray-100">{{ user?.name }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">E-mail</p>
                <p class="text-lg text-gray-900 dark:text-gray-100">{{ user?.email }}</p>
              </div>
              <div v-if="user?.cpf">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">CPF</p>
                <p class="text-lg text-gray-900 dark:text-gray-100">{{ user.cpf }}</p>
              </div>
              <div v-if="user?.phone">
                <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Telefone</p>
                <p class="text-lg text-gray-900 dark:text-gray-100">{{ user.phone }}</p>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4 dark:border-gray-700">
              <p class="mb-2 text-sm font-medium text-gray-500 dark:text-gray-400">Permissões</p>
              <div class="flex flex-wrap gap-2">
                <UBadge
                  v-for="role in user?.roles"
                  :key="role"
                  :color="role === 'ADMIN' ? 'error' : role === 'MANAGER' ? 'primary' : 'neutral'"
                  variant="soft">
                  {{ role }}
                </UBadge>
              </div>
            </div>

            <div class="pt-4">
              <UButton to="/dashboard" block size="lg" color="primary">
                <Icon name="lucide:layout-dashboard" class="mr-2" />
                Ir para o Dashboard
              </UButton>
            </div>
          </div>
        </UCard>
      </div>

      <div v-else class="mx-auto max-w-4xl">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <UCard>
            <template #header>
              <div class="flex items-center">
                <Icon name="lucide:log-in" class="mr-2 h-5 w-5 text-blue-500" />
                <h3 class="text-lg font-semibold">Já tem uma conta?</h3>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Entre com suas credenciais para acessar o sistema.</p>
              <UButton to="/login" block size="lg" variant="soft">Fazer login</UButton>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center">
                <Icon name="lucide:user-plus" class="mr-2 h-5 w-5 text-green-500" />
                <h3 class="text-lg font-semibold">Novo por aqui?</h3>
              </div>
            </template>
            <div class="space-y-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Crie uma nova conta para começar a usar o sistema.</p>
              <UButton to="/register" block size="lg" color="primary">Criar conta</UButton>
            </div>
          </UCard>
        </div>

        <UCard class="mt-6">
          <template #header>
            <div class="flex items-center">
              <Icon name="lucide:shield-check" class="mr-2 h-5 w-5 text-purple-500" />
              <h3 class="text-lg font-semibold">Segurança</h3>
            </div>
          </template>
          <div class="space-y-3">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Esta aplicação utiliza autenticação baseada em cookies HTTP-Only para máxima segurança:
            </p>
            <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li class="flex items-start">
                <Icon name="lucide:check" class="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong>Cookies HTTP-Only:</strong>
                  Tokens não são acessíveis via JavaScript
                </span>
              </li>
              <li class="flex items-start">
                <Icon name="lucide:check" class="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong>Cookies Secure:</strong>
                  Transmissão apenas via HTTPS
                </span>
              </li>
              <li class="flex items-start">
                <Icon name="lucide:check" class="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong>JWT Tokens:</strong>
                  Access token de curta duração e refresh token de longa duração
                </span>
              </li>
              <li class="flex items-start">
                <Icon name="lucide:check" class="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                <span>
                  <strong>SSR Compatível:</strong>
                  Funciona tanto no servidor quanto no cliente
                </span>
              </li>
            </ul>
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

const { user, loggedIn } = useUserSession()
const { logout, isLoggingOut } = useAuth()

const handleLogout = async () => {
  await logout()
}
</script>
