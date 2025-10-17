import { SocSyncService } from '~~/server/services/soc-sync.service'

/**
 * POST /api/soc/sync/companies
 * Triggers synchronization of companies only
 */
export default defineEventHandler(async _event => {
  try {
    const syncService = new SocSyncService()
    await syncService.syncCompanies()
    const statistics = syncService.getStatistics()

    return {
      success: true,
      message: 'Companies synchronized successfully',
      statistics: statistics.companies
    }
  } catch (error) {
    console.error('Companies sync error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to synchronize companies from SOC',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
