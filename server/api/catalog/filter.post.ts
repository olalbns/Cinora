import type { CatalogFilters } from '~/types/content'
export default defineEventHandler(async (event) => {
  const filters = await readBody<CatalogFilters>(event)
  return await (await serverContentService()).getCatalog(filters || {})
})
