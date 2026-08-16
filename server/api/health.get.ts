export default defineEventHandler(async () => {
  const [postgres, redis] = await Promise.all([databaseHealth(), redisHealth()])
  return {
    status: postgres.ok && redis.ok ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: { postgres, redis }
  }
})
