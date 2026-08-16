export default defineEventHandler(async (event) => {
  const slug = String(getQuery(event).slug || '')
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'slug est requis' })
  return await (await serverContentService()).getBySlug(slug)
})
