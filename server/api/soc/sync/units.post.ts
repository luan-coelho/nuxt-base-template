import { SocSyncService } from '../../../services/soc-sync.service'

/**
 * POST /api/soc/sync/units
 * Triggers synchronization of units only
 */
export default defineEventHandler(async _event => {
  try {
    const syncService = new SocSyncService()
    await syncService.syncUnits()
    const statistics = syncService.getStatistics()

    return {
      success: true,
      message: 'Units synchronized successfully',
      statistics: statistics.units
    }
  } catch (error) {
    console.error('Units sync error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to synchronize units from SOC',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
