<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { updateUserSchema, type UpdateUserSchema, type UserSchema as User } from '@/types/user'
import { applyCPFMask, applyPhoneMask } from '@/utils/masks'
import { useUpdateUserMutation } from '~/composables/useUsers'

const props = defineProps<{
  user: User | null
}>()

const emit = defineEmits<{
  userUpdated: []
}>()

const open = defineModel<boolean>('open', { default: false })

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'user', label: 'Usuário' }
]

const state = reactive<UpdateUserSchema>({
  id: '',
  name: '',
  email: '',
  cpf: '',
  phone: '',
  roles: []
})

// Watch para atualizar o estado quando o usuário mudar
watch(
  () => props.user,
  newUser => {
    if (newUser) {
      state.id = newUser.id
      state.name = newUser.name
      state.email = newUser.email
      state.cpf = applyCPFMask(newUser.cpf)
      state.phone = newUser.phone ? applyPhoneMask(newUser.phone) : ''
      state.roles = newUser.roles
    }
  },
  { immediate: true }
)

// Watcher para aplicar a máscara de CPF automaticamente
watch(
  () => state.cpf,
  newValue => {
    if (!newValue) return
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

// Usa o hook de mutation do TanStack Query
const { mutate: updateUser, isPending } = useUpdateUserMutation()

async function onSubmit(event: FormSubmitEvent<UpdateUserSchema>) {
  if (!props.user) return

  // Prepara o payload
  const payload: UpdateUserSchema = {
    id: state.id,
    name: event.data.name,
    email: event.data.email,
    cpf: event.data.cpf,
    phone: event.data.phone || undefined,
    roles: event.data.roles
  }

  // Executa a mutation
  updateUser(payload, {
    onSuccess: () => {
      toast.add({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso!',
        color: 'success'
      })

      // Emite evento para atualizar a listagem
      emit('userUpdated')

      // Fecha o modal
      open.value = false
    },
    onError: (error: any) => {
      toast.add({
        title: 'Erro',
        description:
          error?.data?.statusMessage || error?.data?.message || 'Erro ao atualizar usuário. Tente novamente.',
        color: 'error'
      })
    }
  })
}
</script>

<template>
  <UModal
    v-model:open="open"
    title="Editar usuário"
    :dismissible="false"
    :ui="{ content: 'sm:max-w-2xl md:max-w-3xl lg:max-w-4xl' }">
    <template #body>
      <UForm :schema="updateUserSchema" :state="state" class="space-y-4" :validate-on="[]" @submit="onSubmit">
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
            :items="roleOptions"
            value-key="value"
            multiple
            placeholder="Selecione as funções"
            size="lg"
            :search-input="false" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancelar" color="neutral" variant="subtle" :disabled="isPending" @click="open = false" />
          <UButton label="Salvar" color="primary" variant="solid" type="submit" :loading="isPending" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
