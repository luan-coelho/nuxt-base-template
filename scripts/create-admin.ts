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
}

async function createAdmin(options: CreateAdminOptions) {
  try {
    console.log('🚀 Iniciando criação de usuário administrador...\n')

    // Verificar se o usuário já existe
    const existingUserByEmail = await db.select().from(users).where(eq(users.email, options.email)).limit(1)

    if (existingUserByEmail.length > 0) {
      console.error('❌ Erro: Já existe um usuário com este e-mail.')
      process.exit(1)
    }

    const existingUserByCpf = await db.select().from(users).where(eq(users.cpf, options.cpf)).limit(1)

    if (existingUserByCpf.length > 0) {
      console.error('❌ Erro: Já existe um usuário com este CPF.')
      process.exit(1)
    }

    console.log('📝 Criando usuário com Better Auth...')

    // Criar usuário usando a API do Better Auth
    // Isso garante que a senha seja hasheada corretamente usando bcrypt
    const result = await auth.api.signUpEmail({
      body: {
        name: options.name,
        email: options.email,
        password: options.password,
        cpf: options.cpf,
        roles: ['admin']
      }
    })

    if (!result || !result.user) {
      throw new Error('Falha ao criar usuário via Better Auth')
    }

    console.log('✅ Usuário criado com sucesso via Better Auth!')
    console.log('   ID:', result.user.id)
    console.log('   Nome:', result.user.name)
    console.log('   E-mail:', result.user.email)
    console.log('')

    // Atualizar o usuário com CPF, phone e role admin
    console.log('📝 Atualizando informações adicionais (CPF, telefone, roles)...')

    const [updatedUser] = await db
      .update(users)
      .set({
        cpf: options.cpf,
        phone: options.phone || null,
        roles: ['admin'],
        emailVerified: true,
        active: true
      })
      .where(eq(users.id, result.user.id))
      .returning()

    console.log('✅ Informações adicionais atualizadas!')
    console.log('   CPF:', updatedUser.cpf)
    console.log('   Phone:', updatedUser.phone || 'N/A')
    console.log('   Roles:', updatedUser.roles)
    console.log('   E-mail Verificado:', updatedUser.emailVerified)
    console.log('')
    console.log('🎉 Usuário administrador criado com sucesso!')
    console.log('   Você pode fazer login com:')
    console.log('   E-mail:', options.email)
    console.log('   Senha: [senha fornecida]')

    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error)
    if (error instanceof Error) {
      console.error('   Mensagem:', error.message)
    }
    process.exit(1)
  }
}

// Processar argumentos da linha de comando
function parseArguments(): CreateAdminOptions {
  const args = process.argv.slice(2)
  const options: Partial<CreateAdminOptions> = {}

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '')
    const value = args[i + 1]

    if (key && value) {
      options[key as keyof CreateAdminOptions] = value
    }
  }

  // Validar campos obrigatórios
  if (!options.name || !options.email || !options.cpf || !options.password) {
    console.error('❌ Erro: Campos obrigatórios faltando.\n')
    console.log('Uso:')
    console.log(
      '  tsx scripts/create-admin.ts --name "Nome" --email "email@example.com" --cpf "12345678900" --password "senha123" [--phone "11999999999"]'
    )
    console.log('')
    console.log('Exemplo:')
    console.log(
      '  tsx scripts/create-admin.ts --name "Admin User" --email "admin@example.com" --cpf "12345678900" --password "Admin@123" --phone "11999999999"'
    )
    process.exit(1)
  }

  return options as CreateAdminOptions
}

// Executar o script
const options = parseArguments()
createAdmin(options)
