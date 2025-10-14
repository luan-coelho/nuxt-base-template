<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { CreateUserPayload, User } from '~/types'
import { applyCPFMask, isValidCPF, removeCPFMask } from '~/utils/cpf'
import * as z from 'zod'

const schema = z.object({
  name: z.string().min(3, 'Nome é muito curto'),
  email: z.email('Email inválido'),
  cpf: z
    .string()
    .min(14, 'CPF inválido')
    .refine(value => isValidCPF(value), 'CPF inválido')
})
const open = ref(false)
const loading = ref(false)

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  name: '',
  email: '',
  cpf: ''
})

function onCPFInput(event: Event) {
  const input = event.target as HTMLInputElement
  const cursorPosition = input.selectionStart || 0
  const oldValue = input.value
  const oldLength = oldValue.length

  // Aplica a máscara
  const newValue = applyCPFMask(input.value)
  state.cpf = newValue

  // Ajusta a posição do cursor após aplicar a máscara
  nextTick(() => {
    const newLength = newValue.length
    let newCursorPos = cursorPosition

    // Se o tamanho aumentou (máscara adicionou caracteres)
    if (newLength > oldLength) {
      newCursorPos = cursorPosition + (newLength - oldLength)
    }

    // Garante que o cursor não fique em uma posição de caractere especial (. ou -)
    if (newValue[newCursorPos - 1] === '.' || newValue[newCursorPos - 1] === '-') {
      newCursorPos++
    }

    input.setSelectionRange(newCursorPos, newCursorPos)
  })
}

const toast = useToast()

const emit = defineEmits<{
  userCreated: [user: User]
}>()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    const payload: CreateUserPayload = {
      name: event.data.name,
      email: event.data.email,
      cpf: removeCPFMask(event.data.cpf)
    }

    const response = await $fetch<User>('http://localhost:8080/api/users', {
      credentials: 'include',
      method: 'POST',
      body: payload
    })

    toast.add({
      title: 'Sucesso',
      description: `Usuário ${response.name} criado com sucesso!${response.temporaryPassword ? ` Senha temporária: ${response.temporaryPassword}` : ''}`,
      color: 'success'
    })

    emit('userCreated', response)
    open.value = false
    Object.assign(state, { name: '', email: '', cpf: '' })
  } catch (error: unknown) {
    const err = error as { data?: { message?: string } }
    toast.add({
      title: 'Erro',
      description: err?.data?.message || 'Erro ao criar usuário. Tente novamente.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Novo usuário" description="Adicionar um novo usuário">
    <UButton label="Novo usuário" icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" :validate-on="[]" @submit="onSubmit">
        <UFormField label="Nome" placeholder="John Doe" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="Email" placeholder="john.doe@example.com" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UFormField label="CPF" placeholder="000.000.000-00" name="cpf">
          <UInput v-model="state.cpf" class="w-full" maxlength="14" @input="onCPFInput" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="subtle" :disabled="loading" @click="open = false" />
          <UButton label="Criar" color="primary" variant="solid" type="submit" :loading="loading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
