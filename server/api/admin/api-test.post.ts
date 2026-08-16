import type { ObservedApiResponse, ObservedHomeData } from '~/types/observed-api'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const stored = await readSettings()
  const body = await readBody<{ api?: typeof stored.api }>(event)
  const settings = body?.api
    ? sanitizeSettings({ ...stored, api: body.api }, stored)
    : stored
  if (settings.api.mode === 'database') {
    const health = await databaseHealth()
    if (!health.ok) return { ok: false, status: 'unreachable', latency: health.latency, message: health.error || 'PostgreSQL indisponible' }
    const [operations, platforms] = await Promise.all([dbQuery('SELECT count(*)::int total FROM home_sections WHERE active=true'), dbQuery('SELECT count(*)::int total FROM platforms WHERE active=true')])
    return { ok: true, status: 'compatible', latency: health.latency, code: 0, operations: operations.rows[0]?.total || 0, platforms: platforms.rows[0]?.total || 0, message: 'PostgreSQL connecté et schéma CINORA disponible.' }
  }
  if (settings.api.mode !== 'api') return { ok: false, message: 'Sélectionnez PostgreSQL local ou API externe.' }
  const baseURL = settings.api.serverBase || settings.api.publicBase
  if (!baseURL) return { ok: false, message: 'Aucune URL de base configurée.' }

  const startedAt = performance.now()
  try {
    const response = await $fetch<ObservedApiResponse<ObservedHomeData>>(settings.api.endpoints.home, {
      baseURL,
      timeout: settings.api.timeout,
      headers: { Accept: 'application/json', callerSource: settings.api.callerSource }
    })
    const latency = Math.round(performance.now() - startedAt)
    const compatible = response?.code === 0 && Array.isArray(response?.data?.operatingList) && Array.isArray(response?.data?.platformList)
    return {
      ok: compatible,
      status: compatible ? 'compatible' : 'incompatible',
      latency,
      code: response?.code,
      operations: response?.data?.operatingList?.length || 0,
      platforms: response?.data?.platformList?.length || 0,
      message: compatible ? 'Connexion établie et format /home compatible.' : 'La réponse ne respecte pas le format attendu.'
    }
  } catch (error: any) {
    return {
      ok: false,
      status: 'unreachable',
      latency: Math.round(performance.now() - startedAt),
      message: error?.data?.message || error?.message || 'Connexion impossible'
    }
  }
})
