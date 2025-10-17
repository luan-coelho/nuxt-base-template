import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'

export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  socCode: varchar('soc_code', { length: 50 }), // CODIGO from SOC
  name: varchar('name', { length: 255 }).notNull(), // NOMEABREVIADO
  companyName: varchar('company_name', { length: 255 }).notNull(), // RAZAOSOCIAL
  cnpj: varchar('cnpj', { length: 18 }), // CNPJ
  cpf: varchar('cpf', { length: 14 }), // CPF
  caepf: varchar('caepf', { length: 20 }), // CAEPF
  address: text('address'), // ENDERECO
  cnae: varchar('cnae', { length: 20 }), // CNAE
  riskDegree: varchar('risk_degree', { length: 1 }), // GRAUDERISCO
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
})

// Zod schemas for validation
export const insertCompanySchema = z.object({
  socCode: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  companyName: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  caepf: z.string().optional(),
  address: z.string().optional(),
  cnae: z.string().optional(),
  riskDegree: z.string().optional()
})

export const updateCompanySchema = insertCompanySchema.partial().extend({
  id: z.string()
})

export const selectCompanySchema = z.object({
  id: z.string(),
  socCode: z.string().optional(),
  name: z.string(),
  companyName: z.string(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  caepf: z.string().optional(),
  address: z.string().optional(),
  cnae: z.string().optional(),
  riskDegree: z.string().optional(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
})

export type Company = z.infer<typeof selectCompanySchema>
export type InsertCompany = z.infer<typeof insertCompanySchema>
export type UpdateCompany = z.infer<typeof updateCompanySchema>
