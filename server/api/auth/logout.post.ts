export default defineEventHandler(async (event) => { await destroyUserSession(event); return { ok: true } })
