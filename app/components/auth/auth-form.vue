<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
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

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: () => {
      // TODO: Implementar login com Google
      console.log('Google login não implementado ainda')
    }
  }
]

const schema = z.object({
  email: z.string().email('Informe um email válido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  remember: z.boolean().optional()
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  console.log('Form submitted with:', payload)
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
        :providers="providers"
        :submit="{
          label: 'Acessar',
          size: 'xl'
        }"
        @submit="onSubmit" />
    </UPageCard>
  </div>
</template>
