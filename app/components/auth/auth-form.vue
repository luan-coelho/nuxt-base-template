<script setup lang="ts">
import { z } from 'zod'

// Schema de validação
const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

type Schema = z.output<typeof schema>

// Usar o composable de autenticação
const { signin, isLoggingIn } = useAuth()
const router = useRouter()

// Estado do formulário
const state = reactive({
  email: undefined,
  password: undefined
})

// Submissão do formulário
async function onSubmit(event: any) {
  const data = event.data as Schema
  try {
    await signin({
      email: data.email,
      password: data.password
    })

    // Redirecionar para home após login
    await router.push('/')
  } catch (error) {
    // Erro já tratado no composable
    console.error('Erro ao fazer login:', error)
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8 dark:bg-gray-900">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Entrar</h2>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Acesse sua conta para continuar</p>
        </div>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="E-mail" name="email" required>
          <UInput
            v-model="state.email"
            type="email"
            placeholder="seu@email.com"
            icon="i-lucide-mail"
            autocomplete="email"
            :disabled="isLoggingIn" />
        </UFormField>

        <UFormField label="Senha" name="password" required>
          <UInput
            v-model="state.password"
            type="password"
            placeholder="••••••••"
            icon="i-lucide-lock"
            autocomplete="current-password"
            :disabled="isLoggingIn" />
        </UFormField>

        <div class="flex items-center justify-between">
          <UCheckbox label="Lembrar-me" />
          <UButton variant="link" color="primary" size="sm" to="/auth/forgot-password">Esqueceu a senha?</UButton>
        </div>

        <UButton type="submit" block size="lg" :loading="isLoggingIn" :disabled="isLoggingIn">
          {{ isLoggingIn ? 'Entrando...' : 'Entrar' }}
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          Não tem uma conta?
          <UButton variant="link" color="primary" size="sm" to="/auth/register">Cadastre-se</UButton>
        </div>
      </template>
    </UCard>
  </div>
</template>
