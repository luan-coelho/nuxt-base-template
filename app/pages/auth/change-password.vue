<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import { authClient } from '~/lib/auth-client'
import { z } from 'zod'

definePageMeta({
  layout: false
})

const loading = ref(false)
const toast = useToast()
const showPassword = ref({
  current: false,
  new: false,
  confirm: false
})

// Schema de validação para mudança de senha
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z
      .string()
      .min(8, 'A nova senha deve ter pelo menos 8 caracteres')
      .max(128, 'A nova senha deve ter no máximo 128 caracteres')
      .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'A senha deve conter pelo menos um número')
      .regex(/[!@#$%^&*]/, 'A senha deve conter pelo menos um caractere especial (!@#$%^&*)'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

const state = reactive<ChangePasswordForm>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Validações em tempo real para feedback visual
const passwordStrength = computed(() => {
  const password = state.newPassword
  if (!password) return { strength: 0, label: '', color: 'neutral' as const }

  let strength = 0
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[!@#$%^&*]/.test(password)) strength++

  const labels = ['Muito Fraca', 'Fraca', 'Razoável', 'Boa', 'Forte']
  const colors = ['error', 'warning', 'warning', 'success', 'success'] as const

  return {
    strength,
    label: labels[strength - 1] || '',
    color: colors[strength - 1] || ('neutral' as const),
    percentage: (strength / 5) * 100
  }
})

const requirements = computed(() => [
  { met: state.newPassword.length >= 8, text: 'Mínimo de 8 caracteres' },
  { met: /[A-Z]/.test(state.newPassword), text: 'Pelo menos uma letra maiúscula' },
  { met: /[a-z]/.test(state.newPassword), text: 'Pelo menos uma letra minúscula' },
  { met: /[0-9]/.test(state.newPassword), text: 'Pelo menos um número' },
  { met: /[!@#$%^&*]/.test(state.newPassword), text: 'Pelo menos um caractere especial (!@#$%^&*)' }
])

async function onSubmit(event: FormSubmitEvent<ChangePasswordForm>) {
  loading.value = true

  try {
    // Alterar a senha usando o Better Auth
    const { error } = await authClient.changePassword({
      currentPassword: event.data.currentPassword,
      newPassword: event.data.newPassword,
      revokeOtherSessions: true
    })

    if (error) {
      throw new Error(error.message)
    }

    // Atualizar o campo passwordMustChange para false
    await $fetch('/api/users/update-password-status', {
      method: 'PATCH'
    })

    toast.add({
      title: 'Sucesso',
      description: 'Senha alterada com sucesso! Redirecionando...',
      color: 'success',
      icon: 'i-lucide-check-circle'
    })

    // Aguarda um pouco para garantir que o backend processou a atualização
    await new Promise(resolve => setTimeout(resolve, 500))

    // Força uma navegação completa para recarregar a sessão
    await navigateTo('/', { replace: true, external: true })
  } catch (error: unknown) {
    const err = error as { message?: string }
    toast.add({
      title: 'Erro ao Alterar Senha',
      description: err?.message || 'Verifique se a senha atual está correta e tente novamente.',
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 px-4 py-12 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
    <!-- Background decoration -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="bg-primary/5 absolute -top-1/4 -left-1/4 h-[500px] w-[500px] rounded-full blur-3xl" />
      <div class="bg-primary/5 absolute -right-1/4 -bottom-1/4 h-[500px] w-[500px] rounded-full blur-3xl" />
    </div>

    <!-- Main content -->
    <div class="relative z-10 w-full max-w-2xl">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div
          class="bg-primary/10 ring-primary/20 mx-auto mb-6 flex h-10 w-10 items-center justify-center rounded-full ring-2">
          <UIcon name="i-lucide-shield-check" class="text-primary h-5 w-5" />
        </div>
        <h1 class="text-highlighted text-3xl font-bold tracking-tight sm:text-4xl">Alterar Senha</h1>
        <p class="text-muted mt-3 text-base leading-relaxed">
          Por razões de segurança, você deve alterar sua senha temporária antes de continuar.
        </p>
      </div>

      <!-- Form Card -->
      <UCard class="shadow-2xl">
        <UForm :schema="changePasswordSchema" :state="state" class="space-y-6" :validate-on="[]" @submit="onSubmit">
          <!-- Senha Atual -->
          <UFormField label="Senha Temporária Atual" name="currentPassword" required>
            <UInput
              v-model="state.currentPassword"
              :type="showPassword.current ? 'text' : 'password'"
              placeholder="Digite sua senha temporária"
              icon="i-lucide-key-round"
              size="xl"
              class="w-full"
              :disabled="loading">
              <template #trailing>
                <UButton
                  :icon="showPassword.current ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="showPassword.current = !showPassword.current" />
              </template>
            </UInput>
          </UFormField>

          <!-- Nova Senha -->
          <UFormField label="Nova Senha" name="newPassword" required>
            <UInput
              v-model="state.newPassword"
              :type="showPassword.new ? 'text' : 'password'"
              placeholder="Digite sua nova senha"
              icon="i-lucide-lock"
              class="w-full"
              size="xl"
              :disabled="loading">
              <template #trailing>
                <UButton
                  :icon="showPassword.new ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="showPassword.new = !showPassword.new" />
              </template>
            </UInput>

            <!-- Password Strength Indicator -->
            <template v-if="state.newPassword" #help>
              <div class="mt-3 space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-muted font-medium">Força da Senha:</span>
                  <UBadge :color="passwordStrength.color" variant="soft" size="sm">
                    {{ passwordStrength.label }}
                  </UBadge>
                </div>
                <div class="bg-muted h-2 w-full overflow-hidden rounded-full">
                  <div
                    :class="{
                      'bg-error': passwordStrength.strength <= 2,
                      'bg-warning': passwordStrength.strength === 3,
                      'bg-success': passwordStrength.strength >= 4
                    }"
                    class="h-full transition-all duration-500"
                    :style="{ width: `${passwordStrength.percentage}%` }" />
                </div>
              </div>
            </template>
          </UFormField>

          <!-- Confirmar Senha -->
          <UFormField label="Confirmar Nova Senha" name="confirmPassword" required>
            <UInput
              v-model="state.confirmPassword"
              :type="showPassword.confirm ? 'text' : 'password'"
              placeholder="Confirme sua nova senha"
              icon="i-lucide-lock-keyhole"
              size="xl"
              class="w-full"
              :disabled="loading">
              <template #trailing>
                <UButton
                  :icon="showPassword.confirm ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="showPassword.confirm = !showPassword.confirm" />
              </template>
            </UInput>
          </UFormField>

          <!-- Requisitos de Senha -->
          <div class="bg-info/5 ring-info/10 space-y-3 rounded-xl p-4 ring-1">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-alert" class="text-info h-5 w-5" />
              <span class="text-highlighted text-sm font-semibold">Requisitos de Segurança</span>
            </div>
            <ul class="space-y-2">
              <li v-for="(req, index) in requirements" :key="index" class="flex items-start gap-2 text-sm">
                <UIcon
                  :name="req.met ? 'i-lucide-check-circle-2' : 'i-lucide-circle'"
                  :class="req.met ? 'text-success' : 'text-muted'"
                  class="mt-0.5 h-4 w-4 shrink-0" />
                <span :class="req.met ? 'text-success' : 'text-muted'">
                  {{ req.text }}
                </span>
              </li>
            </ul>
          </div>

          <!-- Botão de Submit -->
          <div class="space-y-3 pt-2">
            <UButton
              type="submit"
              color="primary"
              variant="solid"
              size="xl"
              icon="i-lucide-shield-check"
              :loading="loading"
              block>
              {{ loading ? 'Alterando Senha...' : 'Alterar Senha e Continuar' }}
            </UButton>

            <p class="text-muted text-center text-xs">
              Ao alterar sua senha, todas as outras sessões ativas serão encerradas por segurança
            </p>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>
