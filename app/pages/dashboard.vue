<script setup lang="ts">
const { user } = useUserSession()
const { logout } = useAuth()
const router = useRouter()

const handleLogout = async () => {
  await logout()
  await router.push('/auth/signin')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
          <p class="mt-1 text-slate-600 dark:text-slate-400">Bem-vindo de volta!</p>
        </div>
        <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" @click="handleLogout">Sair</UButton>
      </div>

      <!-- User Info Card -->
      <UCard class="mb-6">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="bg-primary-100 dark:bg-primary-900 flex size-12 items-center justify-center rounded-full">
              <UIcon name="i-lucide-user" class="text-primary-600 dark:text-primary-400 size-6" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
                {{ user?.name }}
              </h2>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                {{ user?.email }}
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">CPF</p>
              <p class="mt-1 text-slate-900 dark:text-white">
                {{ user?.cpf || 'Não informado' }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Telefone</p>
              <p class="mt-1 text-slate-900 dark:text-white">
                {{ user?.phone || 'Não informado' }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Perfil</p>
              <div class="mt-1 flex gap-2">
                <UBadge v-for="role in user?.roles" :key="role" color="primary" variant="subtle">
                  {{ role }}
                </UBadge>
              </div>
            </div>

            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Status</p>
              <UBadge :color="user?.active ? 'success' : 'error'" variant="subtle" class="mt-1">
                {{ user?.active ? 'Ativo' : 'Inativo' }}
              </UBadge>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Stats Grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <UCard>
          <div class="flex items-center gap-4">
            <div class="flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900">
              <UIcon name="i-lucide-users" class="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total de Usuários</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">1,234</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="flex size-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900">
              <UIcon name="i-lucide-activity" class="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Sessões Ativas</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">847</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="flex size-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900">
              <UIcon name="i-lucide-shield-check" class="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Segurança</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">100%</p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Info Alert -->
      <UAlert
        class="mt-6"
        icon="i-lucide-info"
        color="primary"
        variant="subtle"
        title="Autenticação Segura"
        description="Esta aplicação utiliza autenticação baseada em cookies HTTP-only para máxima segurança." />
    </div>
  </div>
</template>
