import type { SiteSettings } from '~/types/site-settings'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const previous = await readSettings()
  const input = await readBody<Partial<SiteSettings>>(event)
  const settings = sanitizeSettings(input || {}, previous)
  await writeSettings(settings)
  return { ok: true, settings }
})
