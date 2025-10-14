<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from '~/lib/auth-client'
import { reactive, ref } from 'vue'
import * as z from 'zod'

const schema = z.object({
  email: z.email('Informe um email válido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  remember: z.boolean().optional()
})

type SignInSchema = z.infer<typeof schema>

const route = useRoute()
const formError = ref<string | null>(null)
const showPassword = ref(false)
const loading = ref(false)

const state = reactive<SignInSchema>({
  email: '',
  password: '',
  remember: false
})

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

async function onSubmit({ data }: FormSubmitEvent<SignInSchema>) {
  formError.value = null

  await authClient.signIn.email(
    {
      email: data.email,
      password: data.password,
      rememberMe: data.remember,
      callbackURL: typeof route.query.redirect === 'string' ? route.query.redirect : '/' // Redireciona para a URL original ou para a raiz
    },
    {
      onRequest: () => {
        loading.value = true
        formError.value = null
      },
      onSuccess: async () => {
        loading.value = false
      },
      onError: ctx => {
        loading.value = false

        if (ctx.error.status === 401) {
          formError.value = 'Credenciais inválidas. Verifique os dados e tente novamente.'
          return
        }

        // Tratamento específico para email não verificado
        if (ctx.error.status === 403) {
          formError.value = 'Por favor, verifique seu endereço de email'
          return
        }

        formError.value = ctx.error.message || 'Credenciais inválidas. Verifique os dados e tente novamente.'
      }
    }
  )
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200 px-4 py-12 dark:from-slate-900 dark:via-slate-950 dark:to-black">
    <div class="pointer-events-none absolute inset-0">
      <div class="bg-primary-400/40 dark:bg-primary-500/20 absolute top-16 -left-32 h-72 w-72 rounded-full blur-3xl" />
      <div class="absolute right-0 bottom-0 h-96 w-96 rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/10" />
    </div>

    <UCard
      class="relative z-10 w-full max-w-xl border border-slate-200/60 bg-white/80 p-8 text-slate-900 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:text-white">
      <template #header>
        <div class="flex flex-col gap-3 text-center">
          <div
            class="bg-primary-400/15 dark:bg-primary-500/20 mx-auto flex size-12 items-center justify-center rounded-full">
            <UIcon name="i-lucide-lock" class="text-primary-500 dark:text-primary-400 size-6" />
          </div>
          <div>
            <h1 class="text-2xl font-semibold">Bem-vindo</h1>
            <p class="text-sm text-slate-600 dark:text-white/60">Entre com suas credenciais para acessar o sistema</p>
          </div>
        </div>
      </template>

      <UAlert
        v-if="formError"
        class="mb-4"
        color="error"
        icon="i-lucide-alert-triangle"
        variant="subtle"
        :description="formError" />

      <UForm :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
        <UFormField name="email" label="Email" required size="xl">
          <UInput v-model="state.email" type="email" size="xl" placeholder="Informe seu email" class="w-full" />
        </UFormField>

        <UFormField name="password" label="Senha" required size="xl">
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            size="xl"
            placeholder="Informe sua senha"
            class="w-full">
            <template #trailing>
              <button
                type="button"
                class="flex size-6 items-center justify-center rounded-full bg-slate-200/60 text-slate-600 transition hover:bg-slate-200 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
                :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                @click="togglePasswordVisibility">
                <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
              </button>
            </template>
          </UInput>
        </UFormField>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <UFormField name="remember">
            <UCheckbox v-model="state.remember" label="Manter conectado" />
          </UFormField>

          <NuxtLink
            to="/auth/forgot-password"
            class="text-primary-600 hover:text-primary-500 dark:text-primary-300 dark:hover:text-primary-200 text-sm font-medium transition">
            Esqueci minha senha
          </NuxtLink>
        </div>

        <div class="space-y-3">
          <UButton type="submit" size="xl" block :loading="loading" class="justify-center" icon="i-lucide-log-in">
            Acessar
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
