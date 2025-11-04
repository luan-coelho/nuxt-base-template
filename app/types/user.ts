import z from 'zod'

const userRoles = ['ADMIN', 'USER', 'MANAGER'] as const

// Zod schemas for validation
const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  cpf: z.string(),
  phone: z.string().optional(),
  roles: z.array(z.enum(userRoles)),
  passwordMustChange: z.coerce.boolean().default(false),
  active: z.coerce.boolean().default(true)
})

const createUserSchema = z.object({
  name: z.string().min(3, 'Informe o nome com pelo menos 3 caracteres'),
  email: z.email('Informe um e-mail com um formato válido'),
  cpf: z.string().length(14, 'Informe um CPF válido'),
  phone: z.string().max(15, 'Informe um telefone válido com no máximo 15 caracteres').optional(),
  roles: z.array(z.enum(userRoles)).min(1, 'Selecione pelo menos uma função')
})

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Informe o nome com pelo menos 3 caracteres').optional(),
  email: z.email('Informe um e-mail com um formato válido').optional(),
  cpf: z.string().length(14, 'Informe um CPF válido').optional(),
  phone: z.string().max(15, 'Informe um telefone válido com no máximo 15 caracteres').optional(),
  roles: z.array(z.enum(userRoles)).min(1, 'Selecione pelo menos uma função').optional()
})

const userListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  role: z.enum(userRoles).nullish(),
  active: z.coerce.boolean().nullish()
})

// TypeScript types
type UserSchema = z.infer<typeof userSchema>
type CreateUserSchema = z.infer<typeof createUserSchema>
type UpdateUserSchema = z.infer<typeof updateUserSchema>
type RoleSchema = (typeof userRoles)[number]

export { createUserSchema, updateUserSchema, userListQuerySchema, userRoles, userSchema }
export type { CreateUserSchema, RoleSchema, UpdateUserSchema, UserSchema }
