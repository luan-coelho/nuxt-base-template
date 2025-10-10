<script setup lang="ts">
import AuthForm from '~/components/auth/auth-form.vue'

definePageMeta({
  layout: false,
  middleware: ['guest']
})
</script>

<template>
  <div>
    <AuthForm />
  </div>
</template>
