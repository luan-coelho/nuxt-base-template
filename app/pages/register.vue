<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Criar nova conta
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Ou
          <NuxtLink to="/login" class="font-medium text-primary-600 hover:text-primary-500">
            entrar com uma conta existente
          </NuxtLink>
        </p>
      </div>

      <UCard>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="error" class="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <Icon name="lucide:alert-circle" class="h-5 w-5 text-red-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800 dark:text-red-400">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <UFormGroup label="Nome completo" name="name" required>
            <UInput
              v-model="form.name"
              type="text"
              placeholder="Seu nome completo"
              autocomplete="name"
              :disabled="isRegistering"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="E-mail" name="email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="seu@email.com"
              autocomplete="email"
              :disabled="isRegistering"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="CPF" name="cpf" hint="Opcional">
            <UInput
              v-model="form.cpf"
              type="text"
              placeholder="000.000.000-00"
              autocomplete="off"
              :disabled="isRegistering"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Telefone" name="phone" hint="Opcional">
            <UInput
              v-model="form.phone"
              type="tel"
              placeholder="(00) 00000-0000"
              autocomplete="tel"
              :disabled="isRegistering"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Senha" name="password" required hint="Mínimo 6 caracteres">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              :disabled="isRegistering"
              size="lg"
            />
          </UFormGroup>

          <UFormGroup label="Confirmar senha" name="confirmPassword" required>
            <UInput
              v-model="form.confirmPassword"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              :disabled="isRegistering"
              size="lg"
            />
          </UFormGroup>

          <div class="flex items-center">
            <UCheckbox
              v-model="acceptTerms"
              :disabled="isRegistering"
              label="Aceito os termos de uso e política de privacidade"
            />
          </div>

          <div>
            <UButton
              type="submit"
              block
              size="lg"
              :loading="isRegistering"
              :disabled="!isFormValid || isRegistering"
            >
              {{ isRegistering ? 'Criando conta...' : 'Criar conta' }}
            </UButton>
          </div>
        </form>
      </UCard>

      <div class="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Ao criar uma conta, você concorda com nossos Termos e Política de Privacidade.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

const { signUp, isRegistering } = useAuth()

const form = ref({
  name: '',
  email: '',
  cpf: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const acceptTerms = ref(false)
const error = ref('')

const isFormValid = computed(() => {
  return (
    form.value.name.length >= 2 &&
    form.value.email.length > 0 &&
    form.value.password.length >= 6 &&
    form.value.password === form.value.confirmPassword &&
    acceptTerms.value
  )
})

const handleSubmit = async () => {
  error.value = ''

  // Validações
  if (!isFormValid.value) {
    if (form.value.name.length < 2) {
      error.value = 'O nome deve ter pelo menos 2 caracteres'
    } else if (!form.value.email) {
      error.value = 'Por favor, informe um e-mail válido'
    } else if (form.value.password.length < 6) {
      error.value = 'A senha deve ter pelo menos 6 caracteres'
    } else if (form.value.password !== form.value.confirmPassword) {
      error.value = 'As senhas não coincidem'
    } else if (!acceptTerms.value) {
      error.value = 'Você precisa aceitar os termos de uso'
    }
    return
  }

  try {
    await signUp({
      name: form.value.name,
      email: form.value.email,
      cpf: form.value.cpf || undefined,
      phone: form.value.phone || undefined,
      password: form.value.password,
      roles: ['USER']
    })
    // Redirecionamento é feito automaticamente no composable
  } catch (err: any) {
    error.value = err.message || 'Erro ao criar conta. Tente novamente.'
  }
}

// Limpar erro quando o usuário digitar
watch(() => [form.value.name, form.value.email, form.value.password, form.value.confirmPassword, acceptTerms.value], () => {
  if (error.value) {
    error.value = ''
  }
})
</script>
