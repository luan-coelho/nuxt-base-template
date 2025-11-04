<script setup lang="ts">
const { user, isAuthenticated } = useUserSession()
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
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Página Inicial</h1>
          <p class="mt-1 text-slate-600 dark:text-slate-400">
            {{ isAuthenticated ? `Olá, ${user?.name}!` : 'Bem-vindo!' }}
          </p>
        </div>
        <div class="flex gap-2">
          <UButton v-if="!isAuthenticated" icon="i-lucide-log-in" to="/auth/signin">Entrar</UButton>
          <template v-else>
            <UButton icon="i-lucide-layout-dashboard" variant="outline" to="/dashboard">Dashboard</UButton>
            <UButton icon="i-lucide-log-out" color="neutral" variant="ghost" @click="handleLogout">Sair</UButton>
          </template>
        </div>
      </div>

      <!-- Welcome Card -->
      <UCard>
        <template #header>
          <div class="flex items-center gap-3">
            <div class="bg-primary-100 dark:bg-primary-900 flex size-12 items-center justify-center rounded-full">
              <UIcon name="i-lucide-shield-check" class="text-primary-600 dark:text-primary-400 size-6" />
            </div>
            <div>
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Autenticação Implementada</h2>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Sistema de autenticação baseado em cookies HTTP-only
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-slate-700 dark:text-slate-300">
            Esta aplicação Nuxt.js está integrada com um backend Java que utiliza autenticação baseada em cookies
            HTTP-only para máxima segurança.
          </p>

          <div class="space-y-3">
            <h3 class="font-semibold text-slate-900 dark:text-white">Recursos implementados:</h3>
            <ul class="space-y-2">
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-5 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300">
                  <strong>Login e Logout:</strong>
                  Autenticação completa com gerenciamento de sessão
                </span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-5 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300">
                  <strong>Cookies HTTP-only:</strong>
                  Tokens armazenados de forma segura pelo navegador
                </span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-5 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300">
                  <strong>Middleware Global:</strong>
                  Proteção automática de rotas privadas
                </span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-5 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300">
                  <strong>SSR Compatível:</strong>
                  Funciona tanto em server-side quanto client-side rendering
                </span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-5 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300">
                  <strong>Refresh Token:</strong>
                  Renovação automática de tokens expirados
                </span>
              </li>
              <li class="flex items-start gap-2">
                <UIcon name="i-lucide-check-circle" class="text-success mt-0.5 size-5 shrink-0" />
                <span class="text-slate-700 dark:text-slate-300">
                  <strong>Estado Reativo:</strong>
                  useState para gerenciar sessão entre servidor e cliente
                </span>
              </li>
            </ul>
          </div>

          <UAlert
            v-if="!isAuthenticated"
            icon="i-lucide-info"
            color="primary"
            variant="subtle"
            title="Acesse o sistema"
            description="Faça login para acessar todas as funcionalidades da aplicação." />

          <UAlert
            v-else
            icon="i-lucide-user-check"
            color="success"
            variant="subtle"
            title="Você está autenticado"
            :description="`Bem-vindo, ${user?.name}! Você tem acesso completo ao sistema.`" />
        </div>

        <template #footer>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Documentação completa em
              <code class="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">#file:integracao-api.md</code>
            </p>
            <div class="flex gap-2">
              <UButton v-if="!isAuthenticated" icon="i-lucide-log-in" to="/auth/signin">Fazer Login</UButton>
              <UButton v-else icon="i-lucide-layout-dashboard" to="/dashboard">Ver Dashboard</UButton>
            </div>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>
