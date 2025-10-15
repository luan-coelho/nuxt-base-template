import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schemas'

/**
 * DELETE /api/users/[id]
 * Deleta um usuário (soft delete - marca como inativo)
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

    // Verifica se o usuário existe
    const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1)

    if (existingUser.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado',
        message: 'Não foi possível encontrar o usuário especificado'
      })
    }

    // Realiza soft delete (marca como inativo)
    await db
      .update(users)
      .set({
        active: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))

    // Retorna sucesso
    return {
      success: true,
      message: 'Usuário desativado com sucesso'
    }
  } catch (error) {
    // Se já for um erro HTTP criado, propaga
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Erro genérico do servidor
    console.error('Erro ao deletar usuário:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao deletar o usuário'
    })
  }
})
