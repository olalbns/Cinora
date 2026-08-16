export default defineEventHandler(async (event) => ({ user: await currentUser(event) }))
