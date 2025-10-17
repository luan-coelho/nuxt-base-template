import { SocSyncService } from '../../services/soc-sync.service'

/**
 * POST /api/soc/sync
 * Triggers a full synchronization from SOC system
 */
export default defineEventHandler(async _event => {
  try {
    const syncService = new SocSyncService()
    const statistics = await syncService.syncAll()

    return {
      success: true,
      message: 'SOC synchronization completed successfully',
      statistics
    }
  } catch (error) {
    console.error('SOC sync error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to synchronize data from SOC',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
