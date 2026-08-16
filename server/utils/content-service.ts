import { ApiContentAdapter } from '~/services/content/api.adapter'
import { MockContentAdapter } from '~/services/content/mock.adapter'
import { DatabaseContentAdapter } from '~/services/content/database.adapter'
import type { ContentAdapter } from '~/services/content/contracts'

export async function serverContentService(): Promise<ContentAdapter> {
  const settings = await readSettings()
  if (settings.api.mode === 'mock') return new MockContentAdapter()
  if (settings.api.mode === 'database') return new DatabaseContentAdapter()
  const baseUrl = settings.api.serverBase || settings.api.publicBase
  if (!baseUrl) throw createError({ statusCode: 503, statusMessage: 'Aucune URL API configurée dans le dashboard' })
  return new ApiContentAdapter(
    baseUrl,
    settings.api.timeout,
    settings.api.callerSource,
    settings.api.endpoints
  )
}
