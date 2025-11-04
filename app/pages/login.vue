<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Entrar na sua conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Ou
          <NuxtLink to="/register" class="font-medium text-primary-600 hover:text-primary-500">
            criar uma nova conta
          </NuxtLink>
        </p>
      </div>

      <UCard>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon name="lucide:alert-circle" class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800 dark:text-red-400">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <UFormGroup label="E-mail" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              :disabled="isLoggingIn"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Senha" name="password" required>
            <UInput
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              :disabled="isLoggingIn"
              size="lg"
            />
          </UFormGroup>

          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <UCheckbox
                v-model="rememberMe"
                label="Lembrar de mim"
                :disabled="isLoggingIn"
              />
            </div>

            <div class="text-sm">
              <NuxtLink to="/forgot-password" class="font-medium text-primary-600 hover:text-primary-500">
                Esqueceu a senha?
              </NuxtLink>
            </div>
          </div>

          <div>
            <UButton
              type="submit"
              block
              size="lg"
              :loading="isLoggingIn"
              :disabled="!isFormValid || isLoggingIn"
            >
              {{ isLoggingIn ? 'Entrando...' : 'Entrar' }}
            </UButton>
          </div>
        </form>
      </UCard>

      <div class="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Problemas para entrar? Entre em contato com o suporte.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { signIn, isLoggingIn } = useAuth()

const form = ref({
  email: '',
  password: ''
})

const rememberMe = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return form.value.email.length > 0 && form.value.password.length > 0
})

const handleSubmit = async () => {
  error.value = ''

  if (!isFormValid.value) {
    error.value = 'Por favor, preencha todos os campos'
    return
  }

  try {
    await signIn({
      email: form.value.email,
      password: form.value.password
    })
    // Redirecionamento é feito automaticamente no composable
  } catch (err: any) {
    error.value = err.message || 'Erro ao fazer login. Tente novamente.'
  }
}

// Limpar erro quando o usuário digitar
watch(() => [form.value.email, form.value.password], () => {
  if (error.value) {
    error.value = ''
  }
})
</script>
