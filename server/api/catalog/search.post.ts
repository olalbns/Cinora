export default defineEventHandler(async (event) => {
  const body = await readBody<{ query?: string; limit?: number }>(event)
  return await (await serverContentService()).search(String(body?.query || ''), Math.min(50, Number(body?.limit || 20)))
})
