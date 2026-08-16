export default defineEventHandler(async (event) => {
  setHeader(event, 'Content-Type', metrics.registry.contentType)
  return await metrics.registry.metrics()
})
