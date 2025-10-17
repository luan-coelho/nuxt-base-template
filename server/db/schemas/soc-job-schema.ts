import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { socSectors } from './soc-sector-schema'

export const socJobs = pgTable('soc_jobs', {
  id: text('id').primaryKey(),
  socCode: varchar('soc_code', { length: 50 }), // CODIGOCARGO from SOC
  socCompanyCode: varchar('soc_company_code', { length: 50 }), // CODIGOEMPRESA from SOC
  name: varchar('name', { length: 255 }).notNull(), // NOMECARGO
  detailedDescription: text('detailed_description'), // DESCRICAODETALHADA
  sectorId: text('sector_id')
    .notNull()
    .references(() => socSectors.id, { onDelete: 'cascade' }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
})

// Zod schemas for validation
export const insertSocJobSchema = z.object({
  socCode: z.string().optional(),
  socCompanyCode: z.string().optional(),
  name: z.string().min(1, 'Nome do cargo é obrigatório'),
  detailedDescription: z.string().optional(),
  sectorId: z.string().min(1, 'Setor é obrigatório')
})

export const updateSocJobSchema = insertSocJobSchema.partial().extend({
  id: z.string()
})

export const selectSocJobSchema = z.object({
  id: z.string(),
  socCode: z.string().optional(),
  socCompanyCode: z.string().optional(),
  name: z.string(),
  detailedDescription: z.string().optional(),
  sectorId: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
})

export type SocJob = z.infer<typeof selectSocJobSchema>
export type InsertSocJob = z.infer<typeof insertSocJobSchema>
export type UpdateSocJob = z.infer<typeof updateSocJobSchema>
