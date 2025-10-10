<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { ref, watch } from 'vue'
import * as z from 'zod'

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Informe seu email',
    required: true,
    size: 'xl'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    placeholder: 'Informe sua senha',
    required: true,
    size: 'xl'
  },
  {
    name: 'remember',
    label: 'Remember me',
    type: 'checkbox',
    size: 'xl'
  }
]

const schema = z.object({
  email: z.string().email('Informe um email válido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  remember: z.boolean().optional()
})

type Schema = z.output<typeof schema>

const { login, loading, errorMessage } = useAuth()
const route = useRoute()
const router = useRouter()
const formError = ref<string | null>(null)

watch(errorMessage, value => {
  formError.value = value
})

async function onSubmit({ data }: FormSubmitEvent<Schema>) {
  formError.value = null

  const { ok, message } = await login(data)

  if (!ok) {
    formError.value = message ?? 'Credenciais inválidas. Verifique os dados e tente novamente.'
    return
  }

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  await router.push(redirect)
}
</script>

<template>
  <div class="flex h-screen flex-col items-center justify-center gap-4 p-4">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        :validate-on="[]"
        title="Login"
        description="Acesse sua conta"
        icon="i-lucide-user"
        :fields="fields"
        :submit="{
          label: 'Acessar',
          size: 'xl',
          loading
        }"
        @submit="onSubmit" />

      <UAlert v-if="formError" class="mt-4" color="error" icon="i-lucide-alert-triangle" :description="formError" />
    </UPageCard>
  </div>
</template>
