export default defineEventHandler((event) => {
  const started = performance.now()
  event.node.res.once('finish', () => {
    const route = event.path.split('?')[0] || '/'
    const method = event.method || 'GET'
    metrics.requests.inc({ method, route, status: String(event.node.res.statusCode) })
    metrics.duration.observe({ method, route }, (performance.now() - started) / 1000)
  })
})
