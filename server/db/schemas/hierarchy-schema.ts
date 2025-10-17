import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { z } from 'zod'
import { companies } from './company-schema'
import { jobs } from './job-schema'
import { sectors } from './sector-schema'
import { units } from './unit-schema'

/**
 * Hierarchies table represents the organizational structure
 * Order: COMPANY -> UNIT -> SECTOR -> HIERARCHY -> JOB
 *
 * This table allows for flexible hierarchical relationships between entities
 * and can be used to represent organizational charts, reporting structures, etc.
 */
export const hierarchies = pgTable('hierarchies', {
  id: text('id').primaryKey(),
  companyId: text('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  unitId: text('unit_id').references(() => units.id, { onDelete: 'cascade' }),
  sectorId: text('sector_id').references(() => sectors.id, { onDelete: 'cascade' }),
  jobId: text('job_id').references(() => jobs.id, { onDelete: 'cascade' }),
  parentHierarchyId: text('parent_hierarchy_id'),
  level: integer('level').notNull().default(0), // 0=Company, 1=Unit, 2=Sector, 3=Job
  name: text('name').notNull(), // Display name for this hierarchy node
  description: text('description'), // Optional description
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
})

// Zod schemas for validation
export const insertHierarchySchema = z.object({
  companyId: z.string().min(1, 'Empresa é obrigatória'),
  unitId: z.string().optional(),
  sectorId: z.string().optional(),
  jobId: z.string().optional(),
  parentHierarchyId: z.string().optional(),
  level: z.number().min(0).max(3).default(0),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional()
})

export const updateHierarchySchema = insertHierarchySchema.partial().extend({
  id: z.string()
})

export const selectHierarchySchema = z.object({
  id: z.string(),
  companyId: z.string(),
  unitId: z.string().optional(),
  sectorId: z.string().optional(),
  jobId: z.string().optional(),
  parentHierarchyId: z.string().optional(),
  level: z.number(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date().optional()
})

export type Hierarchy = z.infer<typeof selectHierarchySchema>
export type InsertHierarchy = z.infer<typeof insertHierarchySchema>
export type UpdateHierarchy = z.infer<typeof updateHierarchySchema>
