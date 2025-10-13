import type { ApiResponse, DirectoryUser } from '~/types'
import { callBackend, extractApiData, isApiErrorResponse } from '../utils/backend'

const users: DirectoryUser[] = [
  {
    id: 1,
    name: 'Alex Smith',
    email: 'alex.smith@example.com',
    roles: ['admin', 'editor']
  },
  {
    id: 2,
    name: 'Jordan Brown',
    email: 'jordan.brown@example.com',
    roles: ['editor']
  },
  {
    id: 3,
    name: 'Taylor Green',
    email: 'taylor.green@example.com',
    roles: ['viewer']
  },
  {
    id: 4,
    name: 'Morgan White',
    email: 'morgan.white@example.com',
    roles: ['editor', 'viewer']
  },
  {
    id: 5,
    name: 'Casey Gray',
    email: 'casey.gray@example.com',
    roles: ['admin']
  },
  {
    id: 6,
    name: 'Jamie Johnson',
    email: 'jamie.johnson@example.com',
    roles: ['viewer']
  },
  {
    id: 7,
    name: 'Riley Davis',
    email: 'riley.davis@example.com',
    roles: ['editor']
  },
  {
    id: 8,
    name: 'Kelly Wilson',
    email: 'kelly.wilson@example.com',
    roles: ['viewer', 'support']
  },
  {
    id: 9,
    name: 'Drew Moore',
    email: 'drew.moore@example.com',
    roles: ['support']
  },
  {
    id: 10,
    name: 'Jordan Taylor',
    email: 'jordan.taylor@example.com',
    roles: ['editor', 'support']
  }
]

export default eventHandler(async event => {
  await requireUserSession(event)

  try {
    const { data } = await callBackend<ApiResponse<DirectoryUser[]> | DirectoryUser[]>(event, '/api/users')

    if (isApiErrorResponse<DirectoryUser[]>(data)) {
      console.error('Resposta inválida do backend ao buscar usuários:', data.error)
      return users
    }

    const resolved = extractApiData<DirectoryUser[]>(data)
    if (Array.isArray(resolved)) return resolved
    if (Array.isArray(data)) return data
  } catch (error) {
    console.error('Falha ao buscar usuários no backend:', error)
  }

  return users
})
