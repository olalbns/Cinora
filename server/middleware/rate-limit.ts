export default defineEventHandler(async (event) => {
  if (!event.path.startsWith('/api/') || event.path === '/api/metrics' || event.path === '/api/health') return
  if ((await readSettings()).api.mode === 'mock') return
  await enforceRateLimit(event, 'api-burst', 28, 10)
  await enforceRateLimit(event, 'api-minute', 180, 60)
})
