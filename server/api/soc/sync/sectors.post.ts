import { SocSyncService } from '../../../services/soc-sync.service'

/**
 * POST /api/soc/sync/sectors
 * Triggers synchronization of sectors only
 */
export default defineEventHandler(async _event => {
  try {
    const syncService = new SocSyncService()
    await syncService.syncSectors()
    const statistics = syncService.getStatistics()

    return {
      success: true,
      message: 'Sectors synchronized successfully',
      statistics: statistics.sectors
    }
  } catch (error) {
    console.error('Sectors sync error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to synchronize sectors from SOC',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
