import { SocSyncService } from '../../../services/soc-sync.service'

/**
 * POST /api/soc/sync/jobs
 * Triggers synchronization of jobs only
 */
export default defineEventHandler(async _event => {
  try {
    const syncService = new SocSyncService()
    await syncService.syncJobs()
    const statistics = syncService.getStatistics()

    return {
      success: true,
      message: 'Jobs synchronized successfully',
      statistics: statistics.jobs
    }
  } catch (error) {
    console.error('Jobs sync error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to synchronize jobs from SOC',
      data: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})
