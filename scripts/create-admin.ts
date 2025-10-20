import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '../server/db'
import { users } from '../server/db/schemas/user-schema'
import { auth } from '../server/lib/auth'

interface CreateAdminOptions {
  name: string
  email: string
  cpf: string
  phone?: string
  password: string
  roles: string[]
  mustChangePassword?: boolean
}

async function createAdmin() {
  try {
    console.log('Iniciando criação de usuário administrador...\n')

    const data: CreateAdminOptions = {
      name: 'Administrador',
      email: 'admin@gmail.com',
      cpf: '312.692.040-33',
      phone: '(11) 91234-5678',
      password: 'admin123',
      roles: ['admin'],
      mustChangePassword: true
    }

    // Verificar se o usuário já existe
    const existingUserByEmail = await db.select().from(users).where(eq(users.email, data.email)).limit(1)

    if (existingUserByEmail.length > 0) {
      console.error('Erro: Já existe um usuário com este e-mail.')
      process.exit(1)
    }

    const existingUserByCpf = await db.select().from(users).where(eq(users.cpf, data.cpf)).limit(1)

    if (existingUserByCpf.length > 0) {
      console.error('Erro: Já existe um usuário com este CPF.')
      process.exit(1)
    }

    console.log('Criando usuário com Better Auth...')

    // Criar usuário usando a API do Better Auth
    // Isso garante que a senha seja hasheada corretamente usando bcrypt
    const result = await auth.api.signUpEmail({
      body: data
    })

    if (!result || !result.user) {
      throw new Error('Falha ao criar usuário via Better Auth')
    }

    console.log('Usuário criado com sucesso via Better Auth!')
    console.log('   ID:', result.user.id)
    console.log('   Nome:', result.user.name)
    console.log('   E-mail:', result.user.email)
    console.log('   E-mail Verificado:', result.user.emailVerified)

    process.exit(0)
  } catch (error) {
    console.error('Erro ao criar usuário administrador:', error)
    if (error instanceof Error) {
      console.error('   Mensagem:', error.message)
    }
    process.exit(1)
  }
}

createAdmin()
