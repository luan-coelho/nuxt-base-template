import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schemas'

/**
 * GET /api/users/[id]
 * Retorna um usuário específico por ID
 */
export default defineEventHandler(async event => {
  try {
    // Obtém o ID da URL
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID não fornecido',
        message: 'O ID do usuário é obrigatório'
      })
    }

    // Busca o usuário
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        cpf: users.cpf,
        phone: users.phone,
        roles: users.roles,
        active: users.active,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado',
        message: 'Não foi possível encontrar o usuário especificado'
      })
    }

    return user
  } catch (error) {
    // Se já for um erro HTTP criado, propaga
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Erro genérico do servidor
    console.error('Erro ao buscar usuário:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao buscar o usuário'
    })
  }
})
