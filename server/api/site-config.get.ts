export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  return publicSettings(await readSettings())
})
