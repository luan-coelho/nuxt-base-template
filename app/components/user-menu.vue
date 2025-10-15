<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()

defineProps<{
  collapsed?: boolean
}>()

const colorMode = useColorMode()
const router = useRouter()

const user = computed(() => {
  if (session?.value.data?.user) {
    return {
      name: session?.value.data.user.name,
      email: session?.value.data.user.email,
      avatar: {
        src: `https://ui-avatars.com/api/?name=${encodeURIComponent(session?.value.data.user.name)}&background=random`,
        alt: session?.value.data.user.name
      }
    }
  }

  return {
    name: 'Convidado',
    email: '',
    avatar: {
      src: 'https://ui-avatars.com/api/?name=Guest&background=random',
      alt: 'Guest'
    }
  }
})

async function handleLogout() {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        router.push('/auth/signin') // redirect to signin page
      }
    }
  })
}

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value.name,
      description: user.value.email || undefined,
      avatar: user.value.avatar
    }
  ],
  [
    {
      label: 'Perfil',
      icon: 'i-lucide-user'
    },
    {
      label: 'Tema',
      icon: 'i-lucide-sun-moon',
      children: [
        {
          label: 'Claro',
          icon: 'i-lucide-sun',
          type: 'checkbox',
          checked: colorMode.value === 'light',
          onSelect(e: Event) {
            e.preventDefault()

            colorMode.value = 'light'
          }
        },
        {
          label: 'Escuro',
          icon: 'i-lucide-moon',
          type: 'checkbox',
          checked: colorMode.value === 'dark',
          onUpdateChecked(checked: boolean) {
            if (checked) {
              colorMode.value = 'dark'
            }
          },
          onSelect(e: Event) {
            e.preventDefault()
          }
        }
      ]
    }
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      color: 'error',
      onSelect: handleLogout
    }
  ]
])
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }">
    <UButton
      v-bind="{
        ...user,
        label: collapsed ? undefined : user?.name,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed'
      }" />

    <template #chip-leading="{ item }">
      <span
        :style="{
          '--chip-light': `var(--color-${(item as any).chip}-500)`,
          '--chip-dark': `var(--color-${(item as any).chip}-400)`
        }"
        class="ms-0.5 size-2 rounded-full bg-(--chip-light) dark:bg-(--chip-dark)" />
    </template>
  </UDropdownMenu>
</template>
