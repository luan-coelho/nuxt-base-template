import type { DehydratedState, VueQueryPluginOptions } from '@tanstack/vue-query'
import { VueQueryPlugin, QueryClient, hydrate, dehydrate } from '@tanstack/vue-query'

export default defineNuxtPlugin(nuxt => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // Configuração do QueryClient com opções padrão
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5000, // 5 segundos
        gcTime: 1000 * 60 * 60 * 24, // 24 horas
        refetchOnWindowFocus: false,
        retry: 1
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
