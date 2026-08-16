import type { ObservedApiResponse } from '~/types/observed-api'
import type { PlaybackRequest, PlaybackSession } from '~/services/media/contracts'

export default defineEventHandler(async (event) => {
  const settings = await readSettings()
  if (settings.api.mode === 'mock' || !settings.features.player) return { session: null }
  const baseURL = settings.api.playbackBase || settings.api.serverBase || settings.api.publicBase
  if (!baseURL) throw createError({ statusCode: 503, statusMessage: 'Aucune API média configurée' })
  const request = await readBody<PlaybackRequest>(event)
  const cookie = getHeader(event, 'cookie')
  const authorization = getHeader(event, 'authorization')
  const response = await $fetch<PlaybackSession | ObservedApiResponse<PlaybackSession>>(settings.api.endpoints.playbackSession, {
    baseURL,
    method: 'POST',
    body: request,
    timeout: settings.api.timeout,
    headers: {
      Accept: 'application/json',
      callerSource: settings.api.callerSource,
      ...(cookie ? { cookie } : {}),
      ...(authorization ? { authorization } : {})
    }
  })
  if ('code' in response) {
    if (response.code !== 0) throw createError({ statusCode: 502, statusMessage: response.message })
    return { session: response.data }
  }
  return { session: response }
})
