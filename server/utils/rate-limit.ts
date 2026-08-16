let lastRateLimitWarning = 0
export async function enforceRateLimit(event: any, namespace: string, limit: number, windowSeconds: number): Promise<void> {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000))
  const key = `ratelimit:${namespace}:${ip}:${bucket}`
  try {
    const instance = await ensureRedis()
    const count = await instance.incr(key)
    if (count === 1) await instance.expire(key, windowSeconds + 1)
    setHeader(event, 'X-RateLimit-Limit', String(limit))
    setHeader(event, 'X-RateLimit-Remaining', String(Math.max(0, limit - count)))
    if (count > limit) throw createError({ statusCode: 429, statusMessage: 'Trop de requêtes' })
  } catch (error: any) {
    if (error?.statusCode === 429) throw error
    // Redis indisponible : ne pas interrompre le site, mais journaliser le défaut.
    if (Date.now() - lastRateLimitWarning > 60000) { console.warn('[rate-limit] Redis indisponible:', error?.message); lastRateLimitWarning = Date.now() }
  }
}
