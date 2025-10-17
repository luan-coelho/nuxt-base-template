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
    // SOC API Configuration
    socEmpresa: process.env.SOC_EMPRESA,
    socBaseUrl: process.env.SOC_BASE_URL,
    socApiKeyCompanies: process.env.SOC_API_KEY_COMPANIES,
    socApiKeyUnits: process.env.SOC_API_KEY_UNITS,
    socApiKeySectors: process.env.SOC_API_KEY_SECTORS,
    socApiKeyJobs: process.env.SOC_API_KEY_JOBS
  }
})
