<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as z from 'zod'

const schema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  roles: z.array(z.string().min(1)).min(1, 'Select at least one role')
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
    description: `New user ${event.data.name} added with roles: ${event.data.roles.join(', ')}`,
    color: 'success'
  })
  open.value = false
  Object.assign(state, { name: '', email: '', roles: [] })
}
</script>

<template>
  <UModal v-model:open="open" title="New user" description="Add a new user to the directory">
    <UButton label="New user" icon="i-lucide-plus" />

    <template #body>
      <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
        <UFormField label="Name" placeholder="John Doe" name="name">
          <UInput v-model="state.name" class="w-full" />
        </UFormField>
        <UFormField label="Email" placeholder="john.doe@example.com" name="email">
          <UInput v-model="state.email" class="w-full" />
        </UFormField>
        <UFormField label="Roles" name="roles" description="Press enter after each role">
          <UInputTags v-model="state.roles" placeholder="Add roles" />
        </UFormField>
        <div class="flex justify-end gap-2">
          <UButton label="Cancel" color="neutral" variant="subtle" @click="open = false" />
          <UButton label="Create" color="primary" variant="solid" type="submit" />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
