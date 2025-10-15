import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { updateUserSchema, users } from '../../db/schemas'

/**
 * PATCH /api/users/[id]
 * Atualiza um usuário existente
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

    // Valida o corpo da requisição
    const body = await readValidatedBody(event, updateUserSchema.parse)

    // Verifica se o usuário existe
    const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1)

    if (existingUser.length === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado',
        message: 'Não foi possível encontrar o usuário especificado'
      })
    }

    // Prepara os dados para atualização
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date()
    }

    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) {
      // Verifica se o email já está em uso por outro usuário
      const emailInUse = await db.select().from(users).where(eq(users.email, body.email)).limit(1)

      if (emailInUse.length > 0 && emailInUse[0].id !== id) {
        throw createError({
          statusCode: 409,
          statusMessage: 'E-mail já cadastrado',
          message: 'Já existe outro usuário com este e-mail'
        })
      }
      updateData.email = body.email
    }

    if (body.cpf !== undefined) {
      const cleanedCPF = body.cpf.replace(/\D/g, '')

      // Verifica se o CPF já está em uso por outro usuário
      const cpfInUse = await db.select().from(users).where(eq(users.cpf, cleanedCPF)).limit(1)

      if (cpfInUse.length > 0 && cpfInUse[0].id !== id) {
        throw createError({
          statusCode: 409,
          statusMessage: 'CPF já cadastrado',
          message: 'Já existe outro usuário com este CPF'
        })
      }
      updateData.cpf = cleanedCPF
    }

    if (body.phone !== undefined) {
      updateData.phone = body.phone ? body.phone.replace(/\D/g, '') : null
    }

    if (body.roles !== undefined) updateData.roles = body.roles

    // Atualiza o usuário
    const [updatedUser] = await db.update(users).set(updateData).where(eq(users.id, id)).returning()

    // Retorna o usuário atualizado
    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      cpf: updatedUser.cpf,
      phone: updatedUser.phone,
      roles: updatedUser.roles,
      active: updatedUser.active,
      updatedAt: updatedUser.updatedAt
    }
  } catch (error) {
    // Se for um erro de validação do Zod
    if (error instanceof Error && error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Dados inválidos',
        message: 'Os dados fornecidos não são válidos'
      })
    }

    // Se já for um erro HTTP criado, propaga
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Erro genérico do servidor
    console.error('Erro ao atualizar usuário:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao atualizar o usuário'
    })
  }
})
