import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schemas'
import { auth } from '../../lib/auth'

/**
 * PATCH /api/users/update-password-status
 * Atualiza o status passwordMustChange do usuário para false após alterar a senha
 */
export default defineEventHandler(async event => {
  try {
    // Obtém a sessão do usuário autenticado
    const session = await auth.api.getSession({
      headers: event.headers
    })

    if (!session?.user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Não autorizado',
        message: 'Você precisa estar autenticado para realizar esta ação'
      })
    }

    const userId = session.user.id

    // Atualiza o campo passwordMustChange para false
    await db
      .update(users)
      .set({
        passwordMustChange: false,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))

    return {
      success: true,
      message: 'Status de alteração de senha atualizado com sucesso'
    }
  } catch (error) {
    // Se já for um erro HTTP criado, propaga
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Erro genérico do servidor
    console.error('Erro ao atualizar status de senha:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao atualizar o status de senha'
    })
  }
})
