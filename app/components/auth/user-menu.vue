<script setup lang="ts">
const { loggedIn, user, isLoggingOut, logout } = useAuth()

// Menu dropdown do usuário
const userMenuItems = computed(() => [
  [
    {
      label: user.value?.email || 'Usuário',
      slot: 'account',
      disabled: true
    }
  ],
  [
    {
      label: 'Perfil',
      icon: 'i-lucide-user',
      to: '/profile'
    },
    {
      label: 'Configurações',
      icon: 'i-lucide-settings',
      to: '/settings'
    }
  ],
  [
    {
      label: 'Sair',
      icon: 'i-lucide-log-out',
      click: logout
    }
  ]
])
</script>

<template>
  <div class="flex items-center gap-4">
    <AuthState>
      <!-- Exibir quando autenticado -->
      <template #default="{ loggedIn: isLoggedIn, user: currentUser }">
        <UDropdown v-if="isLoggedIn && currentUser" :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
          <UButton color="neutral" variant="ghost" :loading="isLoggingOut">
            <template #leading>
              <UAvatar :alt="currentUser.name" size="xs" />
            </template>
            {{ currentUser.name }}
            <template #trailing>
              <UIcon name="i-lucide-chevron-down" />
            </template>
          </UButton>

          <template #account>
            <div class="p-2 text-left">
              <p class="truncate font-medium text-gray-900 dark:text-white">
                {{ currentUser.name }}
              </p>
              <p class="truncate text-sm text-gray-500 dark:text-gray-400">
                {{ currentUser.email }}
              </p>
              <div class="mt-1 flex gap-1">
                <UBadge v-for="role in currentUser.roles" :key="role" size="xs" color="primary" variant="subtle">
                  {{ role }}
                </UBadge>
              </div>
            </div>
          </template>
        </UDropdown>

        <!-- Exibir quando não autenticado -->
        <UButton v-else to="/auth/signin" color="primary">Entrar</UButton>
      </template>

      <!-- Placeholder durante carregamento -->
      <template #placeholder>
        <USkeleton class="h-10 w-32" />
      </template>
    </AuthState>
  </div>
</template>
