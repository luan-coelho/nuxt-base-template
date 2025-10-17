import { boolean, pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { socUnits } from './soc-unit-schema'

export const socSectors = pgTable('soc_sectors', {
  id: text('id').primaryKey(),
  socCode: varchar('soc_code', { length: 50 }), // CODIGOSETOR from SOC
  socCompanyCode: varchar('soc_company_code', { length: 50 }), // CODIGOEMPRESA from SOC
  name: varchar('name', { length: 255 }).notNull(), // NOMESETOR
  unitId: text('unit_id')
    .notNull()
    .references(() => socUnits.id, { onDelete: 'cascade' }),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
})

// Zod schemas for validation
export const insertSocSectorSchema = z.object({
  socCode: z.string().optional(),
  socCompanyCode: z.string().optional(),
  name: z.string().min(1, 'Nome do setor é obrigatório'),
  unitId: z.string().min(1, 'Unidade é obrigatória')
})

export const updateSocSectorSchema = insertSocSectorSchema.partial().extend({
  id: z.string()
})

export const selectSocSectorSchema = z.object({
  id: z.string(),
  socCode: z.string().optional(),
  socCompanyCode: z.string().optional(),
  name: z.string(),
  unitId: z.string(),
  active: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
})

export type SocSector = z.infer<typeof selectSocSectorSchema>
export type InsertSocSector = z.infer<typeof insertSocSectorSchema>
export type UpdateSocSector = z.infer<typeof updateSocSectorSchema>
