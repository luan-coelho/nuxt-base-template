<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{
  error: NuxtError
}>()

useSeoMeta({
  title: 'Página não encontrada',
  description: 'Desculpe, mas esta página não pôde ser encontrada.'
})

useHead({
  htmlAttrs: {
    lang: 'pt-BR'
  }
})
</script>

<template>
  <UApp>
    <UError
      v-if="error.statusCode === 404"
      :error="{
        statusCode: 404,
        statusMessage: 'Página Não Encontrada'
      }" />

    <UError
      v-else
      :error="{
        statusCode: 500,
        statusMessage: 'Erro Interno do Servidor',
        message: error.message || 'Ocorreu um erro inesperado.'
      }" />
  </UApp>
</template>
