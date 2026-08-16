import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client'

const globalMetrics = globalThis as typeof globalThis & { __cinoraMetrics?: ReturnType<typeof createMetrics> }
function createMetrics() {
  const registry = new Registry()
  collectDefaultMetrics({ register: registry, prefix: 'cinora_' })
  const requests = new Counter({ name: 'cinora_http_requests_total', help: 'Requêtes HTTP', labelNames: ['method','route','status'], registers: [registry] })
  const duration = new Histogram({ name: 'cinora_http_request_duration_seconds', help: 'Durée HTTP', labelNames: ['method','route'], buckets: [.01,.025,.05,.1,.25,.5,1,2,5], registers: [registry] })
  const activeSessions = new Gauge({ name: 'cinora_active_sessions', help: 'Sessions utilisateur actives', registers: [registry] })
  return { registry, requests, duration, activeSessions }
}
export const metrics = globalMetrics.__cinoraMetrics ||= createMetrics()
