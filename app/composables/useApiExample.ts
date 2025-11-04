/**
 * Composable de exemplo para fazer requisições autenticadas
 * Demonstra como usar o sistema de autenticação para chamadas à API
 */

export const useApiExample = () => {
  const config = useRuntimeConfig()
  const apiBaseUrl = config.public.apiBaseUrl || 'http://localhost:8080'

  /**
   * Exemplo: Buscar lista de usuários (requer autenticação)
   */
  const fetchUsers = async () => {
    try {
      const response = await $fetch(`${apiBaseUrl}/api/users`, {
        method: 'GET',
        credentials: 'include' // Importante: envia os cookies automaticamente
      })

      return { success: true, data: response }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error)

      return {
        success: false,
        error: error?.data?.error?.message || 'Erro ao buscar usuários'
      }
    }
  }

  /**
   * Exemplo: Criar um novo usuário (requer autenticação)
   */
  const createUser = async (userData: any) => {
    try {
      const response = await $fetch(`${apiBaseUrl}/api/users`, {
        method: 'POST',
        body: userData,
        credentials: 'include'
      })

      return { success: true, data: response }
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error)

      return {
        success: false,
        error: error?.data?.error?.message || 'Erro ao criar usuário'
      }
    }
  }

  /**
   * Exemplo: Atualizar usuário (requer autenticação)
   */
  const updateUser = async (userId: string, userData: any) => {
    try {
      const response = await $fetch(`${apiBaseUrl}/api/users/${userId}`, {
        method: 'PUT',
        body: userData,
        credentials: 'include'
      })

      return { success: true, data: response }
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error)

      return {
        success: false,
        error: error?.data?.error?.message || 'Erro ao atualizar usuário'
      }
    }
  }

  /**
   * Exemplo: Deletar usuário (requer autenticação)
   */
  const deleteUser = async (userId: string) => {
    try {
      await $fetch(`${apiBaseUrl}/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error)

      return {
        success: false,
        error: error?.data?.error?.message || 'Erro ao deletar usuário'
      }
    }
  }

  /**
   * Exemplo usando useFetch (para SSR e reatividade)
   * useFetch é preferível quando você precisa de dados reativos e SSR
   */
  const useUsers = () => {
    return useFetch(`${apiBaseUrl}/api/users`, {
      credentials: 'include',
      // Opcional: transformar dados
      transform: (data: any) => data.users || data,
      // Opcional: observar mudanças
      watch: false,
      // Importante: executar no servidor para SSR
      server: true
    })
  }

  return {
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    useUsers
  }
}
