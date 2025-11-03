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
    // Configuração de sessão (nuxt-auth-utils)
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '', // Senha de criptografia de cookies
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      name: 'nuxt-session',
      cookie: {
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' // Apenas HTTPS em produção
      }
    },
    // URL da API backend (privada - apenas server-side)
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    // Configurações públicas (acessíveis no client)
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
    }
  },
  // Configuração do nuxt-auth-utils
  auth: {
    // Estratégia de carregamento da sessão
    // Use 'client-only' se quiser carregar apenas no cliente
    loadStrategy: 'server-first'
  }
})
