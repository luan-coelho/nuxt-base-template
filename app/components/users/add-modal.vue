<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const schema = z.object({
  name: z.string().min(3, 'Nome é muito curto'),
  email: z.email('Email inválido'),
  roles: z.array(z.string().min(1)).min(1, 'Selecione pelo menos uma função')
})
const open = ref(false)

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  name: '',
  email: '',
  roles: []
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    description: `Novo usuário ${event.data.name} adicionado com funções: ${event.data.roles.join(', ')}`,
    color: 'success'
  })
  open.value = false
  Object.assign(state, { name: '', email: '', roles: [] })
}
</script>

<template>
  <UModal v-model:open="open" title="Novo usuário" description="Adicionar um novo usuário">
    <UButton label="Novo usuário" icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Nome" placeholder="John Doe" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="Email" placeholder="john.doe@example.com" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UFormField label="Funções" name="roles" description="Pressione enter após cada função">
          <UInputTags v-model="state.roles" placeholder="Adicionar funções" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Criar" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
