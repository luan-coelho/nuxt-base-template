import { asc, count, desc, eq, ilike, or } from 'drizzle-orm'
import { db } from '../../db'
import { users } from '../../db/schemas'

/**
 * GET /api/users
 * Lista usuários com paginação, busca e filtros
 */
export default defineEventHandler(async event => {
  try {
    // Obtém os parâmetros de query
    const query = getQuery(event)
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const search = query.search as string | undefined
    const sortBy = (query.sortBy as string) || 'createdAt'
    const sortOrder = (query.sortOrder as string) || 'desc'
    const active = query.active as string | undefined

    // Calcula o offset
    const offset = (page - 1) * limit

    // Constrói as condições de filtro
    const conditions = []

    // Filtro de busca (nome, email ou CPF)
    if (search) {
      conditions.push(
        or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`), ilike(users.cpf, `%${search}%`))
      )
    }

    // Filtro de status ativo
    if (active !== undefined) {
      conditions.push(eq(users.active, active === 'true'))
    }

    // Define a ordenação
    let orderColumn
    switch (sortBy) {
      case 'name':
        orderColumn = users.name
        break
      case 'email':
        orderColumn = users.email
        break
      case 'cpf':
        orderColumn = users.cpf
        break
      case 'active':
        orderColumn = users.active
        break
      default:
        orderColumn = users.createdAt
    }
    const orderFn = sortOrder === 'asc' ? asc : desc

    // Busca os usuários com paginação
    const usersList = await db
      .select()
      .from(users)
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(orderFn(orderColumn))
      .limit(limit)
      .offset(offset)

    // Conta o total de usuários (para paginação)
    const countResult = await db
      .select({ total: count() })
      .from(users)
      .where(conditions.length > 0 ? conditions[0] : undefined)

    const total = countResult[0]?.total ?? 0

    // Retorna os dados com metadados de paginação
    return {
      data: usersList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno do servidor',
      message: 'Ocorreu um erro ao listar os usuários'
    })
  }
})
