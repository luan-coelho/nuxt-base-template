import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { companies } from './empresa-schema'

export const units = pgTable('units', {
  id: text('id').primaryKey(),
  socCode: varchar('soc_code', { length: 50 }), // CODIGOUNIDADE from SOC
  socCompanyCode: varchar('soc_company_code', { length: 50 }), // CODIGOEMPRESA from SOC
  name: varchar('name', { length: 255 }).notNull(), // NOMEUNIDADE
  companyName: varchar('company_name', { length: 255 }).notNull(), // RAZAOSOCIAL
  cnpj: varchar('cnpj', { length: 18 }), // CNPJUNIDADE
  cpf: varchar('cpf', { length: 14 }), // CPFUNIDADE
  caepf: varchar('caepf', { length: 20 }), // CAEPF
  address: text('address'), // ENDERECO
  cnae: varchar('cnae', { length: 20 }), // CNAE
  riskDegree: varchar('risk_degree', { length: 1 }), // GRAUDERISCOUNIDADE
  companyId: text('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
})

// Zod schemas for validation
export const insertUnitSchema = z.object({
  socCode: z.string().optional(),
  socCompanyCode: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  companyName: z.string().min(1, 'Razão social é obrigatória'),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  caepf: z.string().optional(),
  address: z.string().optional(),
  cnae: z.string().optional(),
  riskDegree: z.string().optional(),
  companyId: z.string().min(1, 'Empresa é obrigatória')
})

export const updateUnitSchema = insertUnitSchema.partial().extend({
  id: z.string()
})

export const selectUnitSchema = z.object({
  id: z.string(),
  socCode: z.string().optional(),
  socCompanyCode: z.string().optional(),
  name: z.string(),
  companyName: z.string(),
  cnpj: z.string().optional(),
  cpf: z.string().optional(),
  caepf: z.string().optional(),
  address: z.string().optional(),
  cnae: z.string().optional(),
  riskDegree: z.string().optional(),
  companyId: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
})

export type Unit = z.infer<typeof selectUnitSchema>
export type InsertUnit = z.infer<typeof insertUnitSchema>
export type UpdateUnit = z.infer<typeof updateUnitSchema>
