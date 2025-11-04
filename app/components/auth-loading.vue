<script setup lang="ts">
const props = defineProps<{
  message?: string
}>()
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-black">
    <!-- Background decoration -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="bg-primary-400/20 dark:bg-primary-500/10 absolute top-1/4 left-1/4 size-96 animate-pulse rounded-full blur-3xl" />
      <div
        class="absolute right-1/4 bottom-1/4 size-96 animate-pulse rounded-full bg-indigo-300/20 blur-3xl dark:bg-indigo-500/10"
        style="animation-delay: 1s" />
    </div>

    <!-- Loading content -->
    <div class="relative text-center">
      <div class="mb-6 flex justify-center">
        <!-- Spinning circles -->
        <div class="relative size-20">
          <div
            class="border-primary-600/30 dark:border-primary-400/30 border-t-primary-600 dark:border-t-primary-400 absolute inset-0 animate-spin rounded-full border-4" />
          <div
            class="border-primary-600/20 dark:border-primary-400/20 border-t-primary-500 dark:border-t-primary-300 absolute inset-2 animate-spin rounded-full border-4"
            style="animation-duration: 1.5s; animation-direction: reverse" />
          <div
            class="bg-primary-100 dark:bg-primary-900/50 absolute inset-4 flex items-center justify-center rounded-full">
            <UIcon name="i-lucide-shield-check" class="text-primary-600 dark:text-primary-400 size-6 animate-pulse" />
          </div>
        </div>
      </div>

      <!-- Loading text -->
      <h2 class="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
        {{ message || 'Carregando' }}
      </h2>
      <p class="text-sm text-slate-600 dark:text-slate-400">Por favor, aguarde...</p>

      <!-- Loading dots animation -->
      <div class="mt-4 flex justify-center gap-1">
        <div class="bg-primary-600 dark:bg-primary-400 size-2 animate-bounce rounded-full" />
        <div
          class="bg-primary-600 dark:bg-primary-400 size-2 animate-bounce rounded-full"
          style="animation-delay: 0.1s" />
        <div
          class="bg-primary-600 dark:bg-primary-400 size-2 animate-bounce rounded-full"
          style="animation-delay: 0.2s" />
      </div>
    </div>
  </div>
</template>
