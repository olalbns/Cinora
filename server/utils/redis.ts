import Redis from 'ioredis'

let client: Redis | undefined
let lastErrorLog = 0
export function redis(): Redis {
  if (!client) {
    client = new Redis(String(useRuntimeConfig().redisUrl), {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableOfflineQueue: false
    })
    client.on('error', error => { if (Date.now() - lastErrorLog > 60000) { console.error('[redis]', error.message || 'connexion impossible'); lastErrorLog = Date.now() } })
  }
  return client
}

export async function ensureRedis(): Promise<Redis> {
  const instance = redis()
  if (instance.status === 'wait') await instance.connect()
  return instance
}

export async function redisHealth(): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = performance.now()
  try {
    await (await ensureRedis()).ping()
    return { ok: true, latency: Math.round(performance.now() - start) }
  } catch (error: any) {
    return { ok: false, latency: Math.round(performance.now() - start), error: error?.message }
  }
}
