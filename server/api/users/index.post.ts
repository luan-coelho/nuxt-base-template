import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { insertUserSchema, users } from '../../db/schemas'

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

    // Gera um ID único para o usuário
    const userId = crypto.randomUUID()

    // Insere o novo usuário no banco de dados
    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name: body.name,
        email: body.email,
        cpf: cleanedCPF,
        phone: cleanedPhone,
        roles: body.roles,
        active: true,
        emailVerified: false
      })
      .returning()

    // Retorna o usuário criado (sem informações sensíveis)
    return newUser
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
