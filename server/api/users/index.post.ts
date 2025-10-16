import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { insertUserSchema, users } from '../../db/schemas'
import { auth } from '../../lib/auth'
import { generateTemporaryPassword } from '../../utils/password'

/**
 * POST /api/users
 * Cria um novo usuário no sistema
 */
export default defineEventHandler(async event => {
  try {
    // Valida o corpo da requisição usando o schema Zod
    const body = await readValidatedBody(event, insertUserSchema.parse)

    // Remove caracteres especiais do CPF (mantém apenas números)
    const cleanedCPF = body.cpf.replace(/\D/g, '')

    // Remove caracteres especiais do telefone se fornecido
    const cleanedPhone = body.phone ? body.phone.replace(/\D/g, '') : undefined

    // Verifica se já existe um usuário com o mesmo email
    const existingUserByEmail = await db.select().from(users).where(eq(users.email, body.email)).limit(1)

    if (existingUserByEmail.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'E-mail já cadastrado',
        message: 'Já existe um usuário com este e-mail'
      })
    }

    // Verifica se já existe um usuário com o mesmo CPF
    const existingUserByCPF = await db.select().from(users).where(eq(users.cpf, cleanedCPF)).limit(1)

    if (existingUserByCPF.length > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: 'CPF já cadastrado',
        message: 'Já existe um usuário com este CPF'
      })
    }

    // Gera senha temporária
    const temporaryPassword = generateTemporaryPassword(12)

    // Cria o usuário usando a API do Better Auth para sign-up
    // Passa todos os campos obrigatórios
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: body.name,
        email: body.email,
        password: temporaryPassword,
        cpf: cleanedCPF,
        phone: cleanedPhone,
        roles: body.roles
      }
    })

    if (!signUpResult?.user?.id) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao criar usuário',
        message: 'Não foi possível criar o usuário'
      })
    }

    // Atualiza o usuário com o campo passwordMustChange
    await db
      .update(users)
      .set({
        passwordMustChange: true,
        active: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, signUpResult.user.id))

    // Busca o usuário atualizado
    const [newUser] = await db.select().from(users).where(eq(users.id, signUpResult.user.id)).limit(1)

    // TODO: Enviar email com a senha temporária para o usuário
    // Para desenvolvimento, você pode retornar a senha (NUNCA fazer isso em produção)
    console.log('Senha temporária gerada:', temporaryPassword)

    // Retorna o usuário criado com a senha temporária (apenas para desenvolvimento)
    return {
      ...newUser,
      temporaryPassword // REMOVER em produção
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
    console.error('Erro ao criar usuário:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao criar o usuário'
    })
  }
})
