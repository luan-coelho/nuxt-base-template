import { boolean, pgEnum, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const rolesEnum = pgEnum('roles', ['admin', 'user', 'manager'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  cpf: varchar('cpf', { length: 14 }).notNull().unique(),
  phone: varchar('phone', { length: 15 }),
  emailVerified: boolean('email_verified').default(false).notNull(),
  roles: rolesEnum().default('user').array().notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
})

// Zod schemas for validation
export const insertUserSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  email: z.email('E-mail deve ter um formato válido'),
  cpf: z.string().min(11, 'CPF deve ter pelo menos 11 caracteres').max(14, 'CPF deve ter no máximo 14 caracteres'),
  phone: z
    .string()
    .min(10, 'Telefone deve ter pelo menos 10 caracteres')
    .max(15, 'Telefone deve ter no máximo 15 caracteres'),
  roles: z.array(z.string()).optional()
})

export const updateUserSchema = insertUserSchema.partial().extend({
  id: z.uuid()
})

export const selectUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  cpf: z.string(),
  phone: z.string().optional(),
  roles: z.array(z.string()),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
})

// TypeScript types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type UserFormValues = z.infer<typeof insertUserSchema>
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>
