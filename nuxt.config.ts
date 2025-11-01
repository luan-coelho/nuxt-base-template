// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-07-11',
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vueuse/nuxt', 'nuxt-auth-utils'],
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
    // Configuração de sessão
    session: {
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      name: 'nuxt-session',
      cookie: {
        sameSite: 'lax',
        httpOnly: true
      }
    },
    // URL da API backend
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    }
  }
})
