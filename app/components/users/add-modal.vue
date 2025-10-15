<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { insertUserSchema, type UserFormValues } from '~~/server/db/schemas'
import { applyCPFMask, applyPhoneMask } from '../../utils/masks'

const open = ref(false)
const loading = ref(false)

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'user', label: 'Usuário' }
]

const state = reactive<UserFormValues>({
  name: '',
  email: '',
  cpf: '',
  phone: '',
  roles: ['user']
})

// Watcher para aplicar a máscara automaticamente
watch(
  () => state.cpf,
  newValue => {
    const formatted = applyCPFMask(newValue)
    if (formatted !== newValue) {
      nextTick(() => {
        state.cpf = formatted
      })
    }
  }
)

// Watcher para aplicar a máscara de telefone automaticamente
watch(
  () => state.phone,
  newValue => {
    if (!newValue) return
    const formatted = applyPhoneMask(newValue)
    if (formatted !== newValue) {
      nextTick(() => {
        state.phone = formatted
      })
    }
  }
)

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<UserFormValues>) {
  loading.value = true

  try {
    // Chama a API para criar o usuário
    const payload: UserFormValues = {
      name: event.data.name,
      email: event.data.email,
      cpf: event.data.cpf,
      phone: event.data.phone || undefined,
      roles: event.data.roles
    }

    await $fetch('/api/users', {
      method: 'POST',
      body: payload
    })

    toast.add({
      title: 'Sucesso',
      description: 'Usuário cadastrado com sucesso!',
      color: 'success'
    })

    // Limpa o formulário e fecha o modal
    Object.assign(state, {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      roles: ['user']
    })
    open.value = false
  } catch (error: unknown) {
    const err = error as { data?: { message?: string; statusMessage?: string } }
    toast.add({
      title: 'Erro',
      description: err?.data?.statusMessage || err?.data?.message || 'Erro ao criar usuário. Tente novamente.',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" title="Cadastrar usuário" :dismissible="false">
    <UButton label="Cadastrar usuário" icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="insertUserSchema" :state="state" class="space-y-4" :validate-on="[]" @submit="onSubmit">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField class="col-span-2 md:col-span-1" label="Nome" placeholder="John Doe" name="name">
            <UInput v-model="state.name" class="w-full" size="lg" />
          </UFormField>
          <UFormField class="col-span-2 md:col-span-1" label="Email" placeholder="john.doe@example.com" name="email">
            <UInput v-model="state.email" class="w-full" size="lg" />
          </UFormField>
        </div>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <UFormField label="CPF" placeholder="000.000.000-00" name="cpf">
            <UInput v-model="state.cpf" class="w-full" maxlength="14" size="lg" />
          </UFormField>
          <UFormField label="Telefone" placeholder="(00) 00000-0000" name="phone">
            <UInput v-model="state.phone" class="w-full" maxlength="15" size="lg" />
          </UFormField>
        </div>
        <UFormField label="Funções" name="roles">
          <USelectMenu
            v-model="state.roles"
            class="w-full"
            :options="roleOptions"
            multiple
            placeholder="Selecione as funções"
            size="lg" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="subtle" :disabled="loading" @click="open = false" />
          <UButton label="Cadastrar" color="primary" variant="solid" type="submit" :loading="loading" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
