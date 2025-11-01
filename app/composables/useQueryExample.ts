import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import type { MaybeRefOrGetter } from 'vue'

/**
 * Exemplo de composable usando TanStack Query
 *
 * Este composable demonstra:
 * - useQuery para buscar dados
 * - useMutation para modificar dados
 * - Invalidação de cache após mutação
 * - Suporte a parâmetros reativos
 */

interface Todo {
  id: number
  title: string
  completed: boolean
}

// Exemplo de query simples
export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos')
      return response.json() as Promise<Todo[]>
    }
  })
}

// Exemplo de query com parâmetro reativo
export function useTodo(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async () => {
      const todoId = toValue(id)
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todoId}`)
      return response.json() as Promise<Todo>
    },
    enabled: computed(() => !!toValue(id))
  })
}

// Exemplo de mutation com invalidação de cache
export function useCreateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id'>) => {
      const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTodo)
      })
      return response.json() as Promise<Todo>
    },
    onSuccess: () => {
      // Invalida o cache da lista de todos após criar um novo
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })
}

// Exemplo de mutation para atualizar
export function useUpdateTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (todo: Todo) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(todo)
      })
      return response.json() as Promise<Todo>
    },
    onSuccess: data => {
      // Invalida queries específicas
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todo', data.id] })
    }
  })
}

// Exemplo de mutation para deletar
export function useDeleteTodo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
        method: 'DELETE'
      })
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    }
  })
}
