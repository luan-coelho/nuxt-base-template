// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-11',
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt'],
  devtools: {
    enabled: true
  },
  css: ['~/assets/css/main.css'],
  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  runtimeConfig: {
    // URL da API backend (privada - apenas server-side)
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    // Configurações públicas (acessíveis no client)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    }
  }
})
