const attempts = new Map<string, { count: number; resetAt: number }>()

export default defineEventHandler(async (event) => {
  if (!String(useRuntimeConfig(event).adminPassword || '')) {
    throw createError({ statusCode: 503, statusMessage: 'NUXT_ADMIN_PASSWORD n’est pas configuré sur ce serveur' })
  }
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const now = Date.now()
  const current = attempts.get(ip)
  if (current && current.resetAt > now && current.count >= 5) {
    throw createError({ statusCode: 429, statusMessage: 'Trop de tentatives. Réessayez dans 15 minutes.' })
  }
  if (!current || current.resetAt <= now) attempts.set(ip, { count: 0, resetAt: now + 15 * 60 * 1000 })

  const body = await readBody<{ password?: string }>(event)
  if (!passwordMatches(String(body?.password || ''))) {
    const state = attempts.get(ip)!
    state.count += 1
    await new Promise(resolve => setTimeout(resolve, 350))
    throw createError({ statusCode: 401, statusMessage: 'Mot de passe incorrect' })
  }

  attempts.delete(ip)
  createAdminSession(event)
  return { ok: true }
})
