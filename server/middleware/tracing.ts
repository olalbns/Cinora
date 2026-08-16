import { randomUUID } from 'node:crypto'
export default defineEventHandler((event) => {
  const started = Date.now()
  const traceId = String(getHeader(event, 'x-trace-id') || randomUUID())
  event.context.traceId = traceId
  setHeader(event, 'x-trace-id', traceId)
  setHeader(event, 'req-arrive-time', String(started))
  event.node.res.once('finish', () => {
    if (event.path.startsWith('/api/')) console.log(JSON.stringify({ type: 'request', traceId, method: event.method, path: event.path.split('?')[0], status: event.node.res.statusCode, durationMs: Date.now() - started }))
  })
})
