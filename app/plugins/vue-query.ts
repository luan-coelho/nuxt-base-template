import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from '@tanstack/vue-query'

export default defineNuxtPlugin(nuxt => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // Configuração do QueryClient com opções padrão otimizadas
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Tempo que os dados são considerados frescos (não refetch)
        staleTime: 1000 * 60 * 5, // 5 minutos

        // Tempo que os dados não utilizados permanecem em cache
        gcTime: 1000 * 60 * 60 * 24, // 24 horas

        // Não refetch ao focar a janela (pode ser habilitado se necessário)
        refetchOnWindowFocus: false,

        // Não refetch ao reconectar (pode ser habilitado se necessário)
        refetchOnReconnect: false,

        // Número de tentativas em caso de erro
        retry: (failureCount, error: any) => {
          // Não tentar novamente em erros de autenticação (401, 403)
          if (error?.response?.status === 401 || error?.response?.status === 403) {
            return false
          }
          // Não tentar novamente em erros de validação (400, 422)
          if (error?.response?.status === 400 || error?.response?.status === 422) {
            return false
          }
          // Tentar até 2 vezes para outros erros
          return failureCount < 2
        },

        // Delay entre tentativas (exponential backoff)
        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
      },
      mutations: {
        // Configuração padrão para mutations
        retry: false, // Não tentar novamente mutations automaticamente

        // Tratamento de erros global para mutations
        onError: (error: any) => {
          console.error('Erro na mutação:', error)

          // Aqui você pode adicionar lógica global de tratamento de erros
          // Por exemplo, mostrar um toast de erro
        }
      }
    }
  })

  const options: VueQueryPluginOptions = { queryClient }

  nuxt.vueApp.use(VueQueryPlugin, options)

  // Server-side: dehydrate o estado após renderização
  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  // Client-side: hydrate o estado do servidor
  if (import.meta.client) {
    hydrate(queryClient, vueQueryState.value)
  }
})
