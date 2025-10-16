import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { users } from '../../../db/schemas'
import { auth } from '../../../lib/auth'
import { generateTemporaryPassword } from '../../../utils/password'

/**
 * POST /api/users/:id/reset-password
 * Reseta a senha do usuário e gera uma nova senha temporária
 */
export default defineEventHandler(async event => {
  try {
    const userId = getRouterParam(event, 'id')

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID do usuário é obrigatório',
        message: 'ID do usuário não foi fornecido'
      })
    }

    // Verifica se o usuário existe
    const [existingUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado',
        message: 'O usuário especificado não existe'
      })
    }

    // Gera nova senha temporária
    const temporaryPassword = generateTemporaryPassword(12)

    // Busca a conta de autenticação do usuário
    const ctx = await auth.$context
    const accounts = await ctx.internalAdapter.findAccounts(userId)
    const credentialAccount = accounts.find(account => account.providerId === 'credential')

    if (!credentialAccount) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Conta não encontrada',
        message: 'Conta de autenticação do usuário não foi encontrada'
      })
    }

    // Hash da nova senha
    const hashedPassword = await ctx.password.hash(temporaryPassword)

    // Atualiza a senha diretamente no banco de dados
    await ctx.adapter.update({
      model: 'account',
      where: [{ field: 'id', value: credentialAccount.id }],
      update: {
        password: hashedPassword
      }
    })

    // Atualiza o campo passwordMustChange para true
    await db
      .update(users)
      .set({
        passwordMustChange: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))

    console.log('Nova senha temporária gerada para usuário:', userId, temporaryPassword)

    // Retorna a nova senha temporária (apenas para desenvolvimento)
    return {
      success: true,
      message: 'Senha resetada com sucesso',
      temporaryPassword // REMOVER em produção e enviar por email
    }
  } catch (error) {
    // Se já for um erro HTTP criado, propaga
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Erro genérico do servidor
    console.error('Erro ao resetar senha:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao resetar a senha'
    })
  }
})
